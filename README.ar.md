# ريسيبتو (Receipto)

**إدارة فواتير ومصاريف ومخزون — مجانية، خاصة، محلية بالكامل — للجزائر وما بعدها.**

صوّر فاتورتك. نستخرج محتواها على جهازك أنت. تتبّع مصاريفك مقابل ميزانية. شاهد مخزونك يمتلئ تلقائياً من مشترياتك. أدر البضائع التالفة ومرتجعات الموردين. بلا حساب لدى أي خدمة، بلا اشتراك، وبلا حاجة للذكاء الاصطناعي — إلا إذا اخترت تفعيله.

بالعربية (RTL) والفرنسية والإنجليزية. قابل للتثبيت كتطبيق (PWA). استخراج الفواتير وOCR يتمّان بالكامل على جهازك، بدون الحاجة إلى إنترنت بعد تشغيل Supabase محلياً.

> **English**: [Read this file in English](README.md)

---

## لماذا ريسيبتو؟

معظم أدوات الفواتير والمخزون إما مدفوعة أو مرتبطة بسحابة أو تُرسل بياناتك المالية إلى مكان لا تتحكم فيه. ريسيبتو يعكس ذلك:

- **محلي أولاً.** افتراضياً، كل شيء يعمل على جهازك. فواتيرك ومخزونك لا يغادرون جهازك أبداً إلا إذا فعّلت أنت ميزة ذكاء اصطناعي اختيارية.
- **مجاني للأبد.** رخصة GPL-3.0-or-later. لا اشتراك، لا حجب خلف نسخة "ممتازة". هذا المشروع وُجد ليجعل الأدوات القوية مجانية للجميع.
- **مفهوم.** إجراء رئيسي واحد واضح في كل شاشة. رسائل خطأ بلغة بسيطة. مبني لأشخاص ليسوا مطوّرين.
- **خاص بالتصميم.** أمان على مستوى الصفوف (RLS) في كل جدول، حاوية تخزين خاصة بمجلدات لكل مستخدم، وصفر أسرار في التطبيق.

ريسيبطو مشروع فردي، بُني في الجزائر العاصمة، وهو الأول ضمن مجموعة صغيرة من الأدوات المجانية للأسر والمؤسسات الصغيرة الجزائرية.

## ماذا يفعل؟

- **التقاط الفواتير** — من كاميرا هاتفك أو من الملفات (صور وPDF). ملفات PDF الرقمية تُقرأ من طبقة النص المدمجة فيها (وهي عادةً أدق طريقة)؛ الصور تمر عبر OCR مفتوح المصدر (Tesseract مدرّب على الفرنسية + العربية + الإنجليزية) مع قواعد استخراج.
- **مراجعة قبل الحفظ** — تظهر الحقول المستخرجة كمسودة قابلة للتعديل بجانب الصورة الأصلية. لا يُحفظ شيء حتى تؤكد. الإدخال اليدوي يعمل دائماً.
- **المخزون تلقائياً** — كل فاتورة مؤكدة تسجّل منتجاتها: كميات حية، تنبيهات مخزون منخفض، سجل حركات، تعديلات سريعة، وإضافة/تعديل/حذف يدوي للمنتجات.
- **تحليلات المصاريف** — توزيع حسب المورد، تقدم الميزانية الشهرية، واتجاهات عبر الوقت.
- **البضائع التالفة والمرتجعات** — علّم أصنافاً تالفة، جمّعها حسب المورد، وولّد ملخص مرتجع قابل للطباعة.
- **تصدير** — CSV، Excel (`.xlsx`)، وJSON. يُولَّد محلياً دون مكتبات جداول معروفة بثغراتها.
- **ذكاء اصطناعي اختياري** (معطّل افتراضياً، من الإعدادات) — تحليل أدق، مساعد محادثة يجيب عن أسئلة حول فواتيرك ومخزونك، وتقارير مولّدة بالذكاء الاصطناعي. يعمل مع Gemini أو واجهات متوافقة مع OpenAI (OpenAI، Groq، OpenRouter) أو نماذج محلية بالكامل عبر Ollama.

## التقنيات

| الطبقة | الاختيار |
|---|---|
| الواجهة | React 18، TypeScript، Vite، Tailwind CSS، shadcn/ui، TanStack Query |
| التنسيق | Tailwind + رموز تصميم (داكن/فاتح)، RTL أولاً |
| البيانات | Supabase (Postgres + Auth + Storage + أمان الصفوف) |
| نصوص PDF | pdf.js |
| OCR | Tesseract.js (فرنسية/عربية/إنجليزية)، مستضاف ذاتياً، يعمل دون اتصال |
| الرسوم البيانية | Recharts |
| الذكاء الاصطناعي (اختياري) | غير مرتبط بمزوّد، مفاتيحك تبقى في متصفحك |

## البدء

### المتطلبات

| الأداة | لماذا؟ |
|---|---|
| **Git** | لاستنساخ المستودع |
| **Node.js 20+** | لبناء وتشغيل التطبيق |
| **npm** | يأتي مع Node.js |
| **Docker** | لتشغيل Supabase محلياً — Docker Desktop على ويندوز/ماك، وDocker Engine على لينكس |
| **Supabase CLI** | لبدء Supabase محلياً؛ تحقق بـ `npx supabase --version` |
| **مشروع Supabase سحابي** (بديل عن Docker) | مجاني وبلا Docker — أنشئ مشروعاً على supabase.com (المسار B في الأمر أدناه) |
| **Ollama** (اختياري) | فقط إذا أردت ذكاءً اصطناعياً محلياً بالكامل |

### بداية سريعة (عادية)

```bash
# 1. استنساخ
git clone https://github.com/Meykiio/Receipto-dz.git
cd receipto-app

# 2. تثبيت
npm install

# 3. تشغيل Supabase محلياً (يجب أن يكون Docker يعمل)
npx supabase start

# 4. إنشاء ملف البيئة
# ماك/لينكس/Git Bash:
cp .env.example .env.local
# ويندوز PowerShell:
# Copy-Item .env.example .env.local
# ثم الصق رابط API ومفتاح anon من مخرجات "supabase start" في .env.local

# 5. تطبيق مخطط قاعدة البيانات مرة واحدة
# افتح Studio المحلي (عادة http://127.0.0.1:54323) -> محرر SQL،
# الصق محتوى supabase/schema.sql ونفّذه.

# 6. تشغيل التطبيق
npm run dev
# افتح http://localhost:8080
```

### إعداد بنقرة واحدة (بدون أي معرفة تقنية)

انسخ الأمر أدناه والصقه في أي مساعد برمجة بالذكاء الاصطناعي (Claude Code، Cursor، opencode، Gemini CLI، Windsurf) ودعه يقوم بكل شيء: يكتشف نظام تشغيلك (ويندوز أو ماك أو لينكس)، يتحقق من جهازك، يثبّت أي شيء ناقص، ويوصلك إلى ريسيبتو يعمل مع حساب مسجّل.

> ملاحظة: كُتب الأمر بالإنجليزية عن قصد — فهو تعليمات موجّهة إلى مساعد برمجة، والأدوات تعمل على الأدقّ بالإنجليزية، كما أن أوامر النظام داخله إنجليزية أصلاً. انسخه كما هو دون ترجمة.

```text
You are setting up Receipto, an open-source receipt-management + inventory app (React + TypeScript + Vite + Supabase), for a non-technical user. Work autonomously, verify every step, and explain each step in one plain-language sentence. Never skip a failed verification: diagnose the root cause, fix it, and re-run before continuing.

GOAL (both paths): Receipto running at http://localhost:8080, a working database, the schema applied, and a first account that can log in. AI features stay OFF unless the user explicitly asks to enable them.

FIRST, ASK ONE QUESTION before installing anything: "Do you want Receipto to use a database on your own computer (Docker — recommended, fully private and free) or your own free Supabase cloud project?" Wait for the answer, then follow that path (PATH A or PATH B below).

STEPS:

0. DETECT THE PLATFORM FIRST. Determine the OS (Windows, macOS, Linux) and the CPU architecture. Use the platform-appropriate commands and package managers below. Report which OS you detected. On Windows, also note whether you are in PowerShell, cmd, or Git Bash and use the right syntax for each.

1. VERIFY PREREQUISITES. Check each tool; install any that are missing using the OS-appropriate method. Report exactly what you installed and when a restart is needed.
   - Git: `git --version`
     • Windows: winget install Git.Git  |  macOS: brew install git (or built-in)  |  Linux: apt install git / dnf install git
   - Node.js 20+: `node -v`
     • Windows: winget install OpenJS.NodeJS.LTS  |  macOS: brew install node  |  Linux: apt install nodejs npm (or use nvm)
   - npm: `npm -v` (comes with Node)
   - Docker (must be RUNNING, not just installed): `docker version`
     • Windows/macOS: Docker Desktop — winget install Docker.DockerDesktop (needs a restart, and enable WSL2 backend) | brew install --cask docker
     • Linux: Docker Engine — follow your distro's instructions (docker.io or docker-ce), then `sudo systemctl enable --now docker`
   - Supabase CLI: `npx supabase --version`
   ALTERNATIVE (no Docker): use PATH B (Supabase Cloud) below — create a free project at supabase.com. A plain local Postgres server alone will NOT work, because Receipto also needs Supabase Auth, Storage, and the REST API.

2. CLONE. If the current folder is not already the project, run:
   git clone https://github.com/Meykiio/Receipto-dz.git
   cd Receipto-dz

3. INSTALL DEPENDENCIES. Run `npm install` in the repo root. Report honestly if it fails and fix the root cause.

--- PATH A: LOCAL DATABASE (Docker) ---

A1. START SUPABASE LOCALLY. Run `npx supabase start` (Docker must be running). Wait for it to print: API URL, anon key, Studio URL, and DB URL. If a port is busy or Docker is down, diagnose and fix before continuing. If you see "not linked", this is expected — local start does not need a linked project.

A2. APPLY THE DATABASE SCHEMA ONCE. Open Studio (usually http://127.0.0.1:54323) -> SQL Editor. Read `supabase/schema.sql` and paste its FULL contents, then Run. It creates all tables, RLS, storage, and functions. Run it exactly ONCE on a fresh database.
   CLI alternative: npx supabase db query --local --file supabase/schema.sql
   Verify: `select count(*) from public.products;` should return 0.

A3. ENVIRONMENT. Create `.env.local` (never commit it):
   VITE_SUPABASE_URL=<API URL, e.g. http://127.0.0.1:54321>
   VITE_SUPABASE_ANON_KEY=<anon key printed by supabase start>

A4. Email confirmation is off by default locally, so sign-up works immediately. If it is on, disable it in supabase/config.toml and restart, or confirm the user in Studio -> Authentication -> Users.

--- PATH B: SUPABASE CLOUD (no Docker) ---

B1. ASK THE USER FOR TWO VALUES from their free Supabase project (supabase.com -> the project -> Settings -> API):
    - Project URL (https://<ref>.supabase.co)
    - the publishable/anon key (this key is public and safe in .env.local; the service_role key is NOT and must never be used here)
    If they have no project yet, walk them through creating one on the free plan.

B2. TELL THE USER TO DISABLE EMAIL CONFIRMATION: Supabase dashboard -> Authentication -> Sign In / Providers -> Email -> turn OFF "Confirm email" -> Save. A fresh cloud project has it ON, which blocks sign-up and burns the small free email quota. This step is required.

B3. APPLY THE SCHEMA ONCE. Dashboard -> SQL Editor -> New query. Read `supabase/schema.sql` and paste its FULL contents, then Run. Run it exactly ONCE on the fresh project.
   Verify: `select count(*) from public.products;` should return 0.

B4. ENVIRONMENT. Create `.env.local` (never commit it) with the two values from B1:
   VITE_SUPABASE_URL=<Project URL>
   VITE_SUPABASE_ANON_KEY=<publishable/anon key>

--- FINISH (both paths) ---

5. RUN THE APP. Start `npm run dev` in the background. Confirm http://localhost:8080 loads without console errors.

6. TYPE-CHECK. Run `npm run typecheck`. Report the result honestly. (Use `npm run typecheck`, not `npx tsc --noEmit`: the root tsconfig is a solution-style config with project references, so plain `tsc --noEmit` type-checks zero files and always exits 0.)

7. CREATE THE FIRST ACCOUNT in the app, then confirm it reaches the dashboard.

8. FINAL REPORT. Print a clear summary:
   - What is running and where (app URL; Studio URL on PATH A, or the Supabase dashboard on PATH B)
   - The daily commands: PATH A — start Docker, `npx supabase start`, `npm run dev`; PATH B — `npm run dev`. How to stop everything.
   - What is ON and what is OFF (AI is OFF — why, and how to enable it later in Settings)
   - Any unresolved issues with their exact error messages

HARD RULES: never commit secrets or .env files; never modify the database outside supabase/schema.sql; the service_role key must never appear in the app or in .env.local; do not add dependencies; if a step cannot be completed, stop and explain exactly what is missing rather than improvising.
```

## النشر على السحابة (اختياري)

ريسيبتو مبني ليعمل محلياً بالكامل. يمكن لمشروع Supabase سحابي أن يحلّ محل Docker المحلي (المسار B في الأمر أعلاه) أو أن يستضيف نسخة مشتركة (مثلاً على Vercel) — الكود نفسه. في الحالتين تطبّق نفس ملف `supabase/schema.sql` مرة واحدة في محرر SQL، ويجب إيقاف **تأكيد البريد الإلكتروني** (Authentication ← Email ← Confirm email) وإلا فلن يكتمل إنشاء الحساب. انظر `docs/DEPLOY.md`.

## التوثيق

- `docs/DATABASE.md` — المخطط، أمان الصفوف، وقواعد التصميم
- `docs/FEATURES.md` — ما يفعله التطبيق
- `docs/PROJECT_STRUCTURE.md` — كيف ينظم الكود
- `docs/DEPLOY.md` — النشر السحابي

## التحقق

الفحص المحلي الكامل، بالترتيب:

```bash
npm run typecheck   # فحص الأنواع
npm run lint        # eslint (بدون أخطاء؛ التحذيرات سابقة موجودة)
npm test            # اختبارات الوحدة
npm run build       # بناء الإنتاج + عامل الخدمة PWA
npm run a11y        # فحص axe على الصفحات العامة (الأخطاء الجسيمة تُفشل الفحص)
npm audit           # يجب أن يعرض 0 ثغرات
```

يوجد أيضاً فحص وظيفي من طرف إلى طرف يقود متصفحاً حقيقياً عبر: إنشاء حساب ← التقاط ← مراجعة ← لوحة التحكم ← تصدير، ثم يتحقق من الصفوف المحفوظة عبر PostgREST. يحتاج إلى حزمة Supabase المحلية وخادم المعاينة:

```bash
npx supabase start
npm run build && npm run preview -- --port 8080
pip install playwright pillow && playwright install chromium
npx supabase status -o env   # ثم صدّر SUPABASE_ANON_KEY
npm run e2e
```

ينشئ حساباً مؤقتاً بنطاق `@receipto.test` في كل تشغيل، ويعيد قيمة غير صفرية إذا فشل أي فحص أو حدث خطأ غير ملتقَط في الصفحة.

## المساهمة

نرحب بالمساعدة. اقرأ [CONTRIBUTING.md](CONTRIBUTING.md) أولاً.

## الأمان

للإبلاغ عن ثغرة، انظر [SECURITY.md](SECURITY.md). نحن نأخذ الخصوصية بجدية: أمان صفوف في كل جدول، تخزين خاص، وصفر أسرار في الواجهة.

## الرخصة

[GPL-3.0-or-later](LICENSE) — ريسيبتو برنامج حر ويبقى حراً. يمكن لأي شخص استخدامه تجارياً ودراسته وتعديله، لكن أي نسخة أو نسخة مشتقة يوزّعها يجب أن تحتفظ بنفس الحقوق: الشيفرة المصدرية كاملة، برخصة GPL (هذه النسخة أو أي نسخة لاحقة).

**© 2026 سيف الدين مباركي** — مبني للمجتمع الجزائري، بطموحات عالمية.