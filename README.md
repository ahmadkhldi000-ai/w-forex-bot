# 🤖 W-Forex Bot

> 🌐 **Live Demo:** https://ahmadkhldi000-ai.github.io/w-forex-bot/

<div dir="rtl">

منصة تداول فوركس متكاملة بالذكاء الاصطناعي — اتصال مباشر بـ MetaTrader 5، نظام نسخ صفقات احترافي، اشتراكات متعددة الطبقات، ولوحة إدارة كاملة.

## ⚠️ تحذير المخاطر

> التداول في الأسواق المالية (الفوركس، العملات الرقمية، وعقود الفروقات CFDs) ينطوي على مخاطر عالية وقد يؤدي إلى فقدان جزء كبير أو كامل من رأس المال المستثمر. الأداء السابق للبوت أو المنصة ليس ضماناً للنتائج المستقبلية.

</div>

---

## 🏗️ Architecture

```
w-forex-bot/
├── web/              # Next.js 16 Frontend (App Router + TypeScript + Tailwind v4)
├── server/           # Node.js Backend (Express + Prisma + Socket.io)
├── mt5-bridge/       # Python MT5 Connector (MetaTrader5 library)
├── render.yaml       # Render deployment config
└── README.md
```

### Tech Stack

| Layer        | Technology                                           |
|--------------|------------------------------------------------------|
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS v4, Socket.io   |
| **Backend**  | Express 4, Prisma 6, Socket.io, JWT, bcrypt, otplib  |
| **Database** | PostgreSQL (Neon / Render)                           |
| **Payments** | Paymento (crypto — USDT/BTC/ETH/TRX)                |
| **MT5**      | Python MetaTrader5 + Socket.io bridge                |
| **Deploy**   | Render (web services + PostgreSQL)                   |

---

## 🚀 Quick Start

### 1. Backend (server)

```bash
cd server
cp .env.example .env          # Fill in DATABASE_URL, JWT secrets, Paymento keys
npm install
npx prisma migrate dev --name init
npx prisma db seed            # (optional) creates default admin + plans
npm run dev                   # → http://localhost:4000
```

On first startup, a **Super Admin** is auto-created. Check the console for the random password, then change it immediately.

### 2. Frontend (web)

```bash
cd web
npm install
npm run dev                   # → http://localhost:3000
```

### 3. MT5 Bridge (Windows only)

```bash
cd mt5-bridge
pip install -r requirements.txt
cp .env.example .env          # MT5_LOGIN, MT5_PASSWORD, MT5_SERVER
python mt5_bridge.py
```

---

## 🔐 Security Features

- **Risk Consent**: Mandatory click-through agreement, timestamped in audit logs
- **2FA (TOTP)**: Required for all admin accounts
- **Account Lockout**: 5 failed attempts → 30 min lock
- **RBAC**: Role-based access control with granular permissions
- **HMAC Verification**: Paymento IPN webhooks signed & verified
- **AES-256-GCM**: MT5 passwords encrypted at rest
- **Rate Limiting**: Global + stricter on auth endpoints
- **Audit Logs**: Every admin & user action recorded with IP

## 💳 Payment Flow (Paymento)

```
User → POST /api/payments/create → Paymento token
     → Redirect to Paymento gateway
     → User pays (USDT/BTC/ETH)
     → Paymento IPN → /api/payments/ipn (HMAC verified)
     → Server verifies → Activates subscription
```

## 📱 Telegram

Official channel: https://t.me/+iXalBkHABfBkYWQ0

---

## 🧪 Testing

```bash
# Run all tests against local server
./scripts/tests/run-all-tests.sh http://localhost:3000

# Individual test suites
./scripts/tests/test-api.sh        # API endpoint tests
./scripts/tests/test-security.sh   # Security headers, CORS, auth
./scripts/tests/test-mt5.sh        # MT5 connection + constraints
./scripts/tests/test-perf.sh       # Performance + load tests

# Test production
./scripts/tests/run-all-tests.sh https://api.wforexbot.com
```

---

## ☁️ Deployment (100% Free Tier)

| Component | Platform | Plan | Cost |
|-----------|----------|------|------|
| **Frontend** | [Vercel](https://vercel.com) | Hobby | Free (HTTPS + CDN) |
| **Backend** | [Render](https://render.com) | Free | Free (WebSocket ✓) |
| **Database** | [Neon](https://neon.tech) | Free | Free (0.5 GB PostgreSQL) |
| **MT5 Bridge** | Home PC / VPS | — | Free |

**📖 Full free-tier guide:** [`DEPLOYMENT.md`](DEPLOYMENT.md) — step-by-step from zero to live URL.

**Quick summary:**
```bash
# 1. Push to GitHub
git remote add origin https://github.com/YOU/w-forex-bot.git
git push -u origin main

# 2. Deploy (all free):
#    - Neon    → create project, copy DATABASE_URL
#    - Render  → import repo, set env vars, deploy backend
#    - Vercel  → import repo, set NEXT_PUBLIC_API_URL, deploy frontend

# 3. Set up production DB (run locally):
./scripts/setup-prod-db.sh

# 4. Connect MT5 bridge (local PC):
cd mt5-bridge && cp .env.example .env  # fill in API_URL + API_KEY
python mt5_bridge.py
```

**Live URLs (after deploy):**
- Frontend: `https://wforexbot.vercel.app`
- API: `https://w-forex-bot-api.onrender.com/health`

**Default Admin:** `admin@wforexbot.com` (password printed on first seed)

---

## 📄 License

Proprietary — © W-Forex Bot. All rights reserved.

**⚠️ This platform does not provide financial advice. Trade responsibly.**
