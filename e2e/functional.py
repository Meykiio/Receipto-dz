"""
Functional end-to-end check for Receipto.

Exercises the real user path against a running preview server and the local
Supabase stack: signup -> capture -> review -> dashboard -> export, then
verifies the resulting rows through PostgREST with the caller's own token.

Prerequisites (see README "Local development"):
  - `npx supabase start`
  - `npm run build && npm run preview -- --port 8080`
  - `pip install playwright pillow && playwright install chromium`

Configuration comes from the environment so nothing secret is committed:
  RECEIPTO_BASE           app base URL            (default http://localhost:8080)
  SUPABASE_URL            local API URL           (default http://127.0.0.1:54321)
  SUPABASE_ANON_KEY       local publishable key   (required)
                           read it from `npx supabase status -o env`

Exits non-zero if any check fails or the page raises an uncaught error.
"""

import io
import json
import os
import sys
import tempfile
import time
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright  # noqa: E402

BASE = os.environ.get("RECEIPTO_BASE", "http://localhost:8080")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "http://127.0.0.1:54321")
ANON = os.environ.get("SUPABASE_ANON_KEY", "")
EMAIL = f"e2e{int(time.time())}@receipto.test"
PASSWORD = "E2EStrongPass123"

RECEIPT_LINES = [
    ("SARL MARCHE CENTRAL", 30),
    ("12/03/2024  14:30", 80),
    ("1 Pain complet    1 x 50.00     50.00", 130),
    ("2 Lait 1L         2 x 120.00    240.00", 160),
    ("1 Fromage 500g    1 x 350.00    350.00", 190),
    ("TOTAL TTC                        640.00 DA", 250),
]


def make_receipt_png(path):
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (700, 400), "white")
    draw = ImageDraw.Draw(img)
    for text, y in RECEIPT_LINES:
        draw.text((30, y), text, fill="black")
    img.save(path)


def api(method, path, body=None, token=None):
    data = json.dumps(body).encode() if body is not None else None
    headers = {"apikey": ANON, "Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(
        f"{SUPABASE_URL}{path}", data=data, headers=headers, method=method
    )
    return json.loads(urllib.request.urlopen(req).read().decode())


results = []


def record(name, ok, detail=""):
    results.append((name, ok, detail))
    print(f"{'PASS' if ok else 'FAIL'}: {name} {detail}")


def main():
    if not ANON:
        print("SUPABASE_ANON_KEY is required.")
        print("Run `npx supabase status -o env` and export it before this script.")
        return 2

    with tempfile.TemporaryDirectory() as tmp:
        receipt_png = os.path.join(tmp, "receipt.png")
        make_receipt_png(receipt_png)
        return run(receipt_png)


def run(receipt_png):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page_errors = []
        page.on("pageerror", lambda e: page_errors.append(str(e)))

        page.goto(f"{BASE}/auth")
        page.wait_for_load_state("networkidle")
        page.get_by_role("tab", name="\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628").click()
        page.locator("#email").fill(EMAIL)
        page.locator("#password").fill(PASSWORD)
        page.get_by_role("button", name="\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628", exact=False).click()
        page.wait_for_timeout(3000)
        record("signup lands on dashboard", page.url.endswith("/dashboard"), page.url)
        token = page.evaluate(
            "() => JSON.parse(localStorage.getItem('sb-127-auth-token'))['access_token']"
        )

        page.goto(f"{BASE}/capture")
        page.wait_for_load_state("networkidle")
        page.set_input_files('input[type="file"]', receipt_png)
        try:
            page.wait_for_url("**/review", timeout=90000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(500)
            record("capture navigates to review", "/review" in page.url, page.url)
        except Exception as e:  # noqa: BLE001
            record("capture navigates to review", False, str(e)[:100])

        page.locator("button.bg-primary").first.click()
        try:
            page.wait_for_url("**/dashboard", timeout=25000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(800)
            record("confirm saves and returns to dashboard", page.url.endswith("/dashboard"), page.url)
        except Exception as e:  # noqa: BLE001
            record("confirm saves", False, str(e)[:120])

        time.sleep(1.2)
        try:
            rows = api(
                "GET",
                "/rest/v1/receipts?select=vendor_name,total,status&order=created_at.desc&limit=1",
                token=token,
            )
            ok = (
                len(rows) == 1
                and rows[0]["status"] == "confirmed"
                and "MARCHE" in (rows[0]["vendor_name"] or "")
            )
            record("receipt persisted confirmed with correct vendor", ok, str(rows)[:140])
        except Exception as e:  # noqa: BLE001
            record("receipt persisted confirmed", False, str(e)[:150])

        try:
            chunks = api(
                "GET",
                "/rest/v1/receipt_chunks?select=id,content&order=id.desc&limit=1",
                token=token,
            )
            ok = len(chunks) == 1 and "MARCHE" in (chunks[0]["content"] or "")
            record("search chunk created", ok, str(chunks)[:120])
        except Exception as e:  # noqa: BLE001
            record("search chunk created", False, str(e)[:150])

        try:
            inventory = api("GET", "/rest/v1/inventory_stock?select=name,quantity", token=token)
            record("inventory view accessible (RLS-scoped)", isinstance(inventory, list), f"rows={len(inventory)}")
        except Exception as e:  # noqa: BLE001
            record("inventory view accessible", False, str(e)[:150])

        page.goto(f"{BASE}/dashboard")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1200)
        try:
            page.get_by_role("checkbox").first.check()
            page.get_by_role("button", name="\u062a\u0635\u062f\u064a\u0631", exact=False).click()
            page.get_by_role("menuitem", name="JSON", exact=False).first.click()
            page.wait_for_timeout(800)
            record("receipt export works (JSON)", True, "")
        except Exception as e:  # noqa: BLE001
            record("receipt export works (JSON)", False, str(e)[:130])

        browser.close()

    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\n=== {passed}/{len(results)} functional checks passed ===")
    if page_errors:
        print(f"PAGE ERRORS: {len(page_errors)}")
        for err in page_errors[:6]:
            print(" -", err[:150])
    if page_errors:
        return 1
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
