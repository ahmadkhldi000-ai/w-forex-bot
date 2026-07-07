# 🤖 W-Forex Bot

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

## ☁️ Deploy to Render

1. Push to GitHub
2. Create Blueprint on Render (uses `render.yaml`)
3. Set secret env vars (Paymento keys) in Render dashboard
4. Auto-deploy on every push

**Default Admin:** `admin@wforexbot.com` (password printed on first deploy)

---

## 📄 License

Proprietary — © W-Forex Bot. All rights reserved.

**⚠️ This platform does not provide financial advice. Trade responsibly.**
