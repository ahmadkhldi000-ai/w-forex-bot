# 🚀 دليل نشر W-Forex Bot على الإنترنت

## نظرة عامة
| المكوّن | المنصة | الخطة | الكلفة |
|--------|--------|------|--------|
| 🖥️ الواجهة (Next.js) | Vercel | Hobby | مجاناً |
| ⚙️ الخادم (Express API) | Render | Free | مجاناً |
| 🗄️ قاعدة البيانات (PostgreSQL) | Render | Free | مجاناً |

---

## المرحلة 0: رفع المشروع على GitHub (مهم!)

> الخطوات التالية تحتاج المشروع على GitHub.

1. اذهب إلى https://github.com/new
2. اسم المستودع: `w-forex-bot`
3. اجعله **Private** (يحتوي على كود حسّاس)
4. لا تختر أي إعدادات أخرى، فقط **Create repository**

ثم في الترمنال (داخل مجلد المشروع):

```bash
cd ~/Desktop/w-forex-bot

# ربط المستودع (غيّر ahmadkhaldi باسم مستخدم GitHub الخاص بك)
git remote add origin https://github.com/ahmadkhaldi/w-forex-bot.git

# تأكد من حالة الملفات
git add -A
git commit -m "🔧 Prepare for deployment (Vercel + Render)"

# الرفع
git branch -M main
git push -u origin main
```

---

## المرحلة 1: نشر الخادم + قاعدة البيانات على Render

### 1.1 إنشاء حساب والدخول
1. اذهب إلى https://render.com → **Get Started** / **Sign Up**
2. سجّل باستخدام GitHub (الأسهل)

### 1.2 إنشاء قاعدة البيانات
1. من الـ Dashboard → **New +** → **PostgreSQL**
2. الإعدادات:
   - **Name:** `w-forex-db`
   - **Database:** `wforex`
   - **Plan:** `Free`
   - **Region:** `Frankfurt` (أقرب للخادم لاحقاً)
3. **Create Database**
4. احفظ **External Database URL** — ستحتاجه لاحقاً

### 1.3 نشر الخادم
> المشروع يحتوي على `render.yaml` — سيُسهّل كل شيء!

**الطريقة الأسهل (Blueprint):**
1. من الـ Dashboard → **New +** → **Blueprint**
2. اختر مستودع `w-forex-bot` من GitHub
3. Render سيكتشف `render.yaml` تلقائياً
4. اترك الإعدادات كما هي → **Apply**

**أو يدوياً:**
1. **New +** → **Web Service**
2. اختر مستودع `w-forex-bot`
3. الإعدادات:
   - **Name:** `w-forex-bot-api`
   - **Region:** `Frankfurt`
   - **Branch:** `main`
   - **Root Directory:** `server`  ← مهم جداً!
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build && npx prisma generate`
   - **Start Command:** `npx prisma migrate deploy && node dist/index.js`
   - **Plan:** `Free`
4. **Environment Variables** — أضف التالي:

| المتغيّر | القيمة |
|---------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (اربطها بقاعدة البيانات التي أنشأناها) |
| `JWT_SECRET` | (اضغط Generate — أو استخدم [هذا المولّد](https://generate-random.org/api-key-generator)) |
| `ADMIN_JWT_SECRET` | (Generate — سر مختلف) |
| `ADMIN_EMAIL` | `admin@wforexbot.com` |
| `CORS_ORIGIN` | `http://localhost:3000` (سنحدّثه بعد نشر الواجهة) |
| `ENCRYPTION_KEY` | (Generate — 64 خانة hex) |

5. **Create Web Service**
6. انتظر البناء (5-10 دقائق)
7. ستحصل على URL مثل: `https://w-forex-bot-api.onrender.com`

### 1.4 التحقق
افتح في المتصفح:
```
https://w-forex-bot-api.onrender.com/health
```
يجب أن ترى: `{"status":"ok",...}`

---

## المرحلة 2: نشر الواجهة على Vercel

### 2.1 إنشاء حساب والدخول
1. اذهب إلى https://vercel.com → **Sign Up**
2. سجّل باستخدام **GitHub** (نفس الحساب)

### 2.2 استيراد المشروع
1. **Add New...** → **Project**
2. اختر مستودع `w-forex-bot`
3. الإعدادات:
   - **Framework Preset:** Next.js
   - **Root Directory:** `web` ← انقر Edit واختر مجلد `web`
   - **Build Command:** `npm run build` (افتراضي)
   - **Output Directory:** `out` (مهم!)
4. **Environment Variables** — أضف:

| المتغيّر | القيمة |
|---------|--------|
| `NEXT_PUBLIC_API_URL` | `https://w-forex-bot-api.onrender.com` (URL الخادم من المرحلة 1) |
| `NEXT_PUBLIC_SOCKET_URL` | `https://w-forex-bot-api.onrender.com` |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL` | `https://t.me/+iXalBkHABfBkYWQ0` |

5. **Deploy** 🚀
6. انتظر 2-3 دقائق
7. ستحصل على URL مثل: `https://w-forex-bot.vercel.app`

---

## المرحلة 3: ربط الواجهة بالخادم (CORS) ⚠️ مهم

بعد حصولك على URL الواجهة من Vercel:

1. ارجع إلى **Render** → `w-forex-bot-api` → **Environment**
2. عدّل `CORS_ORIGIN` إلى URL الواجهة الكامل:
   ```
   https://w-forex-bot.vercel.app
   ```
3. احفظ → سيُعاد النشر تلقائياً

---

## ✅ الاختبار النهائي

1. افتح URL الواجهة على Vercel
2. جرّب صفحة `/auth` (تسجيل/دخول)
3. إذا اشتغلت → مبروك! موقعك أونلاين 🎉

---

## 🔧 ملاحظات مهمة

- **Render Free Tier:** الخادم "ينام" بعد 15 دقيقة بدون نشاط. أول طلب يستغرق ~30 ثانية لإيقاظه. هذا طبيعي.
- **قاعدة البيانات المجانية:** تُحذف بعد 90 يوم — خذ نسخة احتياطية قبل ذلك.
- **مفتاح التشفير (ENCRYPTION_KEY):** بمجرد ضبطه لا تغيّره — وإلا تفقد بيانات MT5 المشفّرة.

## 🆘 استكشاف الأخطاء

| المشكلة | الحل |
|--------|------|
| البناء يفشل على Render | تحقق من **Logs** — غالباً نقص في متغيّر بيئة |
| CORS error في المتصفح | تأكد أن `CORS_ORIGIN` يطابق URL Vercel تماماً |
| الواجهة بيضاء | تحقق من `NEXT_PUBLIC_API_URL` في Vercel |
| خطأ في الـ database | تأكد من `DATABASE_URL` + تنفيذ migrations |
