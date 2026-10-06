# Receipto — Features

Verified against the code and the live schema on October 1, 2026.

## Working today

### Capture & parsing
- Receipt upload via phone camera or file picker — images (JPEG/PNG/WebP) and PDFs, 10 MB client limit.
- **Local parsing is the default, with zero external dependencies:**
  - Digital PDFs read from their text layer (pdf.js) — fully accurate.
  - Photos go through self-hosted Tesseract OCR (French + Arabic + English) with image preprocessing (grayscale, upscale).
  - Rule-based extraction (vendor, date, items, quantities, unit prices, totals) — `src/lib/parser/`.
- Optional AI parsing (off by default): the user's chosen provider reads the photo directly from the browser.

### Review & confirm
- Extracted fields shown as an editable draft beside the original image; nothing is saved until confirmed.
- Manual entry always works as a fallback.
- Confirming a receipt atomically: upserts the vendor, inserts receipt + items, **auto-registers products into inventory**, writes purchase movements, and indexes content for hybrid search.

### Dashboard & receipts
- Receipts list: search (vendor + item text), sort by date, pagination (7/page), bulk select + delete.
- Receipt details (desktop modal + mobile bottom sheet), inline edit of vendor/date/items/prices with recomputed totals.
- Export selected receipts to CSV, Excel (`.xlsx`), and JSON — generated locally.

### Inventory
- Every confirmed receipt fills your inventory automatically (products created by normalized name).
- Live quantities, low-stock warnings, status filtering, movement history per product.
- Stock adjustments (add / remove / correct), and full product CRUD (add, edit name/unit/threshold, delete).
- Damaged goods: mark items damaged, group by supplier, printable refund summary.

### Insights
- Total spent, monthly budget progress, top vendors, trends over time, date-range filter.
- AI-generated financial report (optional, provider-agnostic).

### AI assistant (optional, off by default)
- Chat over your receipts and stock with safe, read-only, RLS-scoped tools.
- Provider-agnostic: Gemini, or any OpenAI-compatible endpoint (OpenAI, Groq, OpenRouter, LM Studio), or fully local via Ollama.
- Hybrid search (full-text + embeddings) over receipt content.

### Account & settings
- Email/password auth (Supabase). Sign up, sign in, delete account.
- Settings: currency, date format, locale, monthly budget, AI provider config (keys stay in the browser), theme (light/dark/system).
- i18n: Arabic (RTL, default), French, English.
- Offline PWA with self-hosted assets (OCR, fonts) — zero CDN dependencies for the core path.

### Landing & legal
- Bilingual landing (English + Arabic), privacy policy, terms of service.

## Explicitly not present (by design)
- No Supabase Edge Functions, no server-side secrets.
- No service-role key anywhere client-side; only the publishable key is used.
- No public storage bucket — receipt images are private with per-user folder policies.
- No telemetry (Vercel Analytics was removed in the open-source cleanup).