# 🔐 إعداد تسجيل الدخول عبر جوجل (Google OAuth)

دليل خطوة بخطوة لتفعيل ميزة **"تسجيل الدخول باستخدام جوجل"** في منصة W Forex Bot.

---

## نظرة سريعة على آلية العمل

```
المستخدم يضغط زر جوجل
        │
        ▼
[الخادم] /api/auth/google  ───►  يعيد التوجيه إلى شاشة موافقة جوجل
        │
        ▼
[جوجل] المستخدم يختار حسابه ويوافق
        │
        ▼
[الخادم] /api/auth/google/callback  ───►  يستلم الكود، يجلب بيانات المستخدم، ينشئ/يحدّث الحساب، يُصدر JWT
        │
        ▼
[الواجهة] /auth/google/callback?token=...  ───►  يخزّن التوكن ويحوّل للوحة التحكم
```

---

## الخطوة 1: إنشاء مشروع على Google Cloud

1. اذهب إلى **Google Cloud Console**: 👉 https://console.cloud.google.com
2. اضغط على **Select a project** (أعلى اليسار) → **NEW PROJECT**
3. اكتب اسم المشروع: `W Forex Bot`
4. اضغط **CREATE**

---

## الخطوة 2: تهيئة شاشة الموافقة (OAuth Consent Screen)

> هذه الشاشة يراها المستخدم عندما يوافق على تسجيل الدخول.

1. من القائمة الجانبية: **APIs & Services** → **OAuth consent screen**
2. اختر نوع المستخدم: **External** (لأن المنصة عامة)
3. اضغط **CREATE**
4. املأ البيانات الأساسية:
   - **App name:** `W Forex Bot`
   - **User support email:** بريدك
   - **Developer contact information:** بريدك
5. اضغط **SAVE AND CONTINUE**
6. في **Scopes** اضغط **ADD OR REMOVE SCOPES** وأضف:
   - `userinfo.email` (الوصول للبريد)
   - `userinfo.profile` (الوصول للاسم والصورة)
   - `openid`
7. اضغط **SAVE AND CONTINUE**
8. في **Test users** أضف بريدك (أثناء التطوير/الاختبار)
9. اضغط **SAVE AND CONTINUE**

> ⚠️ للإنتاج العام: تحتاج **Publishing status = In production** + التحقق من Google (قد يستغرق أيام). للنسخة التجريبية يمكن البقاء في وضع Testing مع إضافة بريدك في Test users.

---

## الخطوة 3: إنشاء بيانات اعتماد OAuth (Credentials)

1. من القائمة الجانبية: **APIs & Services** → **Credentials**
2. اضغط **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type:** `Web application`
4. **Name:** `W Forex Bot Web Client`
5. **Authorized JavaScript origins** — أضف:
   ```
   http://localhost:3000
   https://wforexbot.vercel.app
   https://api.wforexbot.com
   ```
6. **Authorized redirect URIs** — أضف (هذا أهم خطأ يُرتكب!):
   ```
   http://localhost:4000/api/auth/google/callback
   https://api.wforexbot.com/api/auth/google/callback
   ```
   > ⚠️ **ملاحظة مهمة:** يجب أن تطابق `GOOGLE_REDIRECT_URL` في الخادم هذه القيمة **بالضبط** (بما في ذلك http/https والشرطة المائلة).
7. اضغط **CREATE**
8. ستظهر لك نافذة تحتوي على:
   - **Client ID** — انسخه (يبدأ بـ `xxxxx.apps.googleusercontent.com`)
   - **Client Secret** — انسخه

---

## الخطوة 4: إعداد متغيرات البيئة

### الخادم (Server) — ملف `.env`:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxx
# يجب أن تطابق ما أضفته في Google Console
GOOGLE_REDIRECT_URL=https://api.wforexbot.com/api/auth/google/callback
# رابط الواجهة الأمامية (المستخدم يعود إليها بعد الدخول)
FRONTEND_URL=https://wforexbot.vercel.app
```

### الواجهة (Frontend) — Vercel Environment Variables:
في Vercel: مشروع `wforexbot` → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL = https://api.wforexbot.com
```
> أضف نفس القيمة لمحيط Production و Preview و Development.

---

## الخطوة 5: تطبيق ترحيل قاعدة البيانات (Database Migration)

يجب تطبيق الترحيل على قاعدة البيانات لإضافة حقول OAuth الجديدة:

```bash
cd server
npx prisma migrate dev --name add_google_oauth
```

> إذا كنت على Render/مزود استضافة، نفّذ هذا الأمر بعد نشر الخادم أو أضفه إلى سكربت الإطلاق:
> ```bash
> npx prisma migrate deploy
> ```

---

## الخطوة 6: الاختبار

1. شغّل الخادم والواجهة محلياً:
   ```bash
   # Terminal 1 — الخادم
   cd server && npm run dev

   # Terminal 2 — الواجهة
   cd web && npm run dev
   ```
2. اذهب إلى http://localhost:3000/auth
3. اضغط **"تسجيل الدخول عبر جوجل"**
4. ستظهر شاشة جوجل → اختر حسابك → ستُعاد إلى لوحة التحكم
5. تحقق من الخادم من وجود سجل (audit log) جديد
6. تحقق من قاعدة البيانات — سيكون لديك مستخدم جديد بـ `provider = GOOGLE`

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|-----|
| `redirect_uri_mismatch` | القيمة في `GOOGLE_REDIRECT_URL` لا تطابق ما في Google Console. يجب التطابق **الحرفي**. |
| `access_denied` | المستخدم ألغى الموافقة، أو المستخدم غير مضاف لـ Test users (وضع Testing). |
| `invalid_client` | `GOOGLE_CLIENT_ID` أو `GOOGLE_CLIENT_SECRET` غير صحيح. |
| `email_not_verified` | البريد في حساب جوجل غير مؤكد. |
| الزر لا يظهر / لا يعمل | تأكد من ضبط `NEXT_PUBLIC_API_URL` في Vercel. |
| `This app isn't verified` | هذا طبيعي في وضع Testing — اضغط Advanced → Go to app. |

---

## بنية الكود المُضافة

### الخادم (`server/`)
```
src/routes/google.ts          ← مسارات OAuth (/google + /google/callback)
src/config/env.ts             ← إعدادات Google (clientId, secret, redirectUrl)
src/index.ts                  ← تسجيل الراوتر
prisma/schema.prisma          ← نموذج User + AccountProvider enum
```

### الواجهة (`web/`)
```
src/lib/auth/config.ts                          ← إدارة التوكن + إعدادات API
src/components/ui/google-icon.tsx               ← أيقونة جوجل الرسمية (SVG)
src/app/auth/page.tsx                           ← زر جوجل الفعّال
src/app/auth/google/callback/page.tsx           ← صفحة استلام التوكن والتوجيه
```

---

## ملاحظات أمنية

- ✅ **JWT موقّع** من الخادم — لا يمكن تزويره.
- ✅ **الحسابات مرتبطة** — مستخدم البريد/كلمة المرور الذي يسجّل لاحقاً بجوجل يُربط تلقائياً بنفس الحساب.
- ✅ **upsert آمن** — لا تُنشأ حسابات مكررة.
- ✅ **audit logs** — كل عملية دخول/تسجيل عبر جوجل مُسجّلة.
- ✅ النطاقات مُقيّدة في Google Console لمنع إساءة الاستخدام.
