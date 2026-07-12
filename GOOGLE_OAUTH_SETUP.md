# دليل تفعيل تسجيل الدخول عبر جوجل (Google OAuth Setup)

## المشكلة التي تم حلها
كان زر "المتابعة باستخدام جوجل" لا يعمل لأن المعرف (Client ID) لم يكن مُدخلاً.

## الحل المُطبّق
تم تحويل النظام إلى **Backend OAuth Flow** — الأكثر أماناً والمعتمد رسمياً من جوجل:
- المعرف (Client ID) والسر (Client Secret) يبقيان مخفيين في الخادم (server) ولا يظهران في المتصفح أبداً.
- عند الضغط على الزر، يُحوَّل المستخدم تلقائياً إلى الخادم → ثم إلى شاشة موافقة جوجل → ثم يعود للموقع وهو مسجّل.

---

## الخطوات المطلوبة (مرة واحدة فقط)

### الخطوة 1: إنشاء مشروع في Google Cloud Console

1. اذهب إلى: https://console.cloud.google.com/
2. سجّل الدخول بحساب جوجل الخاص بك.
3. اضغط على شعار المشروع في الأعلى → **New Project** (مشروع جديد).
4. اسم المشروع: `W Forex Bot` → اضغط **Create**.

### الخطوة 2: إعداد شاشة الموافقة (OAuth Consent Screen)

1. من القائمة الجانبية: **APIs & Services** → **OAuth consent screen**.
2. اختر نوع المستخدم: **External** (خارجي).
3. املأ البيانات:
   - **App name**: `W Forex Bot`
   - **User support email**: بريدك الإلكتروني
   - **Developer contact email**: بريدك الإلكتروني
4. اضغط **Save and Continue**.
5. في صفحة **Scopes** → اضغط **Add or Remove Scopes**.
6. أضف:
   - `userinfo.email` (البريد الإلكتروني)
   - `userinfo.profile` (معلومات الملف الشخصي)
   - `openid`
7. اضغط **Save and Continue** حتى النهاية.

### الخطوة 3: إنشاء بيانات الاعتماد (Credentials)

1. من القائمة الجانبية: **APIs & Services** → **Credentials**.
2. اضغط **+ CREATE CREDENTIALS** → **OAuth client ID**.
3. نوع التطبيق: **Web application**.
4. اسم التطبيق: `W Forex Bot Web`.
5. **Authorized redirect URIs** (مهماً جداً):
   أضف هذا الرابط بالضبط:
   ```
   http://localhost:4000/api/auth/google/callback
   ```
6. اضغط **Create**.

### الخطوة 4: نسخ المفاتيح

بعد الإنشاء ستظهر لك نافذة تحتوي على:
- **Client ID** (مثل: `123456789-xxxxx.apps.googleusercontent.com`)
- **Client Secret** (مثل: `GOCSPX-xxxxxxxxxxxxx`)

**انسخهما الآن** (لن يظهر السر مرة أخرى).

### الخطوة 5: إضافتها في الخادم

افتح ملف `.env` في مجلد `server`:

```bash
nano server/.env
```

أضف هذه الأسطر في نهاية الملف:

```env
# Google OAuth
GOOGLE_CLIENT_ID=ضع_هنا_الـ_Client_ID_الذي_نسخته
GOOGLE_CLIENT_SECRET=ضع_هنا_الـ_Client_Secret_الذي_نسخته
GOOGLE_REDIRECT_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

احفظ الملف (Ctrl+O ثم Enter ثم Ctrl+X).

### الخطوة 6: إعادة تشغيل الخادم

```bash
cd server
npm run dev
```

### الخطوة 7: الاختبار

1. افتح: http://localhost:3000/auth
2. اضغط على زر **"المتابعة باستخدام جوجل"**.
3. ستظهر شاشة موافقة جوجل → اختر حسابك → سيتم تسجيلك تلقائياً ووجهك للوحة التحكم.

---

## للنشر على الإنترنت (Production)

عند رفع الموقع على Vercel (الواجهة) وعلى خادم الـ API:

### في خادم الـ API (Backend) — اضبط متغيرات البيئة:
```env
GOOGLE_CLIENT_ID=نفس_الـ_Client_ID
GOOGLE_CLIENT_SECRET=نفس_الـ_Client_Secret
GOOGLE_REDIRECT_URL=https://[عنوان-الـ-API]/api/auth/google/callback
FRONTEND_URL=https://[عنوان-الموقع]
```

### في Google Cloud Console — أضف URI الإنتاج:
```
https://[عنوان-الـ-API]/api/auth/google/callback
```

### في Vercel (الواجهة) — اضبط:
```
NEXT_PUBLIC_API_URL=https://[عنوان-الـ-API]
```

---

## ملخص ما تم تعديله في الكود

| الملف | التغيير |
|------|---------|
| `web/src/app/auth/page.tsx` | تحويل زر جوجل لاستخدام Backend OAuth Flow بدلاً من Client-side GIS. لم يعد يحتاج `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. |
| الخطأ | رسائل الخطأ تم تحديثها لتغطي جميع رموز أخطاء الـ Backend. |

## التحقق من سلامة الكود
- ✅ TypeScript compilation: نظيف
- ✅ Production build: ناجح (35 routes)
- ✅ جميع الأخطاء مغطاة برسائل عربية واضحة
