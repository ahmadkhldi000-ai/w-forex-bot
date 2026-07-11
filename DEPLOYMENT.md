# 🚀 WForexBot — Free Deployment Guide

> **Goal:** Deploy the full platform to the internet with free-tier services, accessible from anywhere at a live URL.
>
> **Architecture (100% Free Tier):**
> ```
>   MT5 EA + Python Bridge  ──▶  Render (Express + WebSocket)
>                                      │
>                                      ▼
>   Neon (PostgreSQL Serverless) ◀─────┘
>                                      │
>   Vercel (Next.js Frontend) ◀────────┘
> ```

| Component      | Service        | Plan   | Cost | Purpose |
|----------------|----------------|--------|------|---------|
| **Frontend**   | Vercel         | Hobby  | Free | Next.js hosting + HTTPS + CDN |
| **Backend**    | Render         | Free   | Free | Express API + WebSocket (Socket.io) |
| **Database**   | Neon           | Free   | Free | PostgreSQL serverless (0.5 GB) |
| **MT5 Bridge** | Home PC / VPS  | —      | Free | Python → pushes trade data to API |
| **Domain**     | Vercel subdomain | —    | Free | `wforexbot.vercel.app` (or custom domain) |

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create Accounts (All Free)](#2-create-accounts-all-free)
3. [Deploy Database (Neon PostgreSQL)](#3-deploy-database-neon-postgresql)
4. [Deploy Backend (Render)](#4-deploy-backend-render)
5. [Deploy Frontend (Vercel)](#5-deploy-frontend-vercel)
6. [Run Database Migrations & Seed](#6-run-database-migrations--seed)
7. [Connect MT5 Bridge](#7-connect-mt5-bridge)
8. [Domain Setup (Free Subdomain)](#8-domain-setup-free-subdomain)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Security Checklist](#10-security-checklist)
11. [Updating the Project](#11-updating-the-project)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

- [ ] The project pushed to a **GitHub repository**
- [ ] Node.js 18+ and npm installed locally
- [ ] A MetaTrader 5 terminal with the EA running (for the bridge)
- [ ] 30 minutes of time

> **Push to GitHub first** — all three services deploy from your GitHub repo:
> ```bash
> git remote add origin https://github.com/YOUR_USERNAME/w-forex-bot.git
> git branch -M main
> git push -u origin main
> ```

---

## 2. Create Accounts (All Free)

Create these 3 free accounts (use the same email everywhere):

### A. Neon (Database) — https://neon.tech
- Sign up with GitHub
- Free plan: **0.5 GB storage, 100 compute hours/month** (plenty for this app)
- Serverless PostgreSQL — scales to zero when idle, wakes instantly

### B. Render (Backend) — https://render.com
- Sign up with GitHub
- Free plan: **750 hours/month** (always-on with cold starts after 15 min idle)
- Supports WebSockets (Socket.io) ✅

### C. Vercel (Frontend) — https://vercel.com
- Sign up with GitHub
- Free "Hobby" plan: **unlimited static deployments + 100 GB bandwidth**
- Automatic HTTPS + global CDN + instant deploys

---

## 3. Deploy Database (Neon PostgreSQL)

### Step 3.1 — Create the database
1. Go to **Neon Console** → **New Project**
2. Project name: `wforexbot`
3. PostgreSQL version: **16** (latest)
4. Region: choose the **closest** to your users (e.g., `AWS Frankfurt (eu-central-1)`)
5. Click **Create Project**

### Step 3.2 — Copy the connection string
After creation, Neon shows your connection string:
```
postgresql://wforexbot:AbCdEf123456@ep-cool-name-123456.eu-central-1.aws.neon.tech/wforexbot?sslmode=require
```
> ⚠️ **Copy and save this string** — you'll paste it into Render and Vercel.

### Step 3.3 — Copy the **pooled** connection string
Neon provides a separate **Pooled connection** (via PgBouncer) — use this for the backend:
```
postgresql://wforexbot:AbCdEf123456@ep-cool-name-pooler.eu-central-1.aws.neon.tech/wforexbot?sslmode=require
```

> 💡 **Pooled** = production-grade, handles many concurrent connections efficiently.
> Neon also takes automatic **snapshots** every 24h on the free plan. ✅

---

## 4. Deploy Backend (Render)

### Step 4.1 — Create a new Web Service
1. Go to **Render Dashboard** → **New +** → **Web Service**
2. Connect your GitHub repo: `w-forex-bot`
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Name** | `w-forex-bot-api` |
   | **Region** | Same as Neon (e.g., Frankfurt) |
   | **Branch** | `main` |
   | **Root** | `server` |
   | **Runtime** | Node |
   | **Build Command** | `npm install && npm run build && npm run db:generate` |
   | **Start Command** | `npm run start` |
   | **Instance Type** | **Free** |

### Step 4.2 — Add environment variables
Scroll to **Environment** → add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render injects `PORT` automatically; this is a fallback) |
| `DATABASE_URL` | `postgresql://wforexbot:...@ep-...-pooler.eu-central-1.aws.neon.tech/wforexbot?sslmode=require` |
| `JWT_SECRET` | (generate with: `openssl rand -hex 32` → paste the output) |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | `https://wforexbot.vercel.app,http://localhost:3000` |
| `ENCRYPTION_KEY` | (generate with: `openssl rand -hex 32` → paste the output) |
| `CONNECTOR_API_KEYS` | `wfb_<random-string-here>` (see [§7](#7-connect-mt5-bridge)) |
| `CONNECTOR_MAX_BODY_KB` | `64` |

> 🔒 **Generate secrets locally** — never use placeholder values:
> ```bash
> openssl rand -hex 32   # run twice: once for JWT_SECRET, once for ENCRYPTION_KEY
> ```

### Step 4.3 — Deploy
1. Click **Create Web Service**
2. Render builds + deploys (takes ~3 min)
3. Your API is live at: `https://w-forex-bot-api.onrender.com`
4. Test it: visit `https://w-forex-bot-api.onrender.com/health` → should return JSON

> ⚠️ **Free plan cold starts:** After 15 min of inactivity, Render spins down the service. The first request after idle takes ~30 seconds to wake. This is normal for free tier.

---

## 5. Deploy Frontend (Vercel)

### Step 5.1 — Import the project
1. Go to **Vercel Dashboard** → **Add New** → **Project**
2. Import your GitHub repo: `w-forex-bot`
3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Next.js |
   | **Root Directory** | `web` |
   | **Build Command** | `npm run build` (default) |
   | **Output Directory** | (leave default — Next.js handles it) |
   | **Install Command** | `npm install` (default) |

### Step 5.2 — Add environment variables
Expand **Environment Variables** → add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://w-forex-bot-api.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://w-forex-bot-api.onrender.com` |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL` | `https://t.me/+iXalBkHABfBkYWQ0` |

> Mark all as **Production, Preview, and Development** environments.

### Step 5.3 — Deploy
1. Click **Deploy** (takes ~2 min)
2. Your frontend is live at: `https://wforexbot.vercel.app` (name varies — see [§8](#8-domain-setup-free-subdomain) to rename)
3. Vercel auto-deploys on every `git push` to `main`

---

## 6. Run Database Migrations & Seed

After the backend is deployed, you must create the tables and seed default data.

### Step 6.1 — Run migrations locally against the production DB

```bash
cd server

# Temporarily set the production DATABASE_URL (use the NON-pooled connection for migrations)
export DATABASE_URL="postgresql://wforexbot:...@ep-...-123456.eu-central-1.aws.neon.tech/wforexbot?sslmode=require"

# Install deps + generate Prisma client
npm install

# Apply all migrations (creates all 16 tables)
npx prisma migrate deploy

# Seed default admin, plans, and settings
npm run db:seed
```

> ⚠️ **Use the NON-pooled connection for migrations** (without `-pooler` in the hostname). PgBouncer blocks DDL statements.

### Step 6.2 — Note the default admin credentials

The seed script prints the admin credentials to the terminal:
```
🟢 Default admin created:
   Email:    admin@wforexbot.com
   Password: <random-password-shown-here>
```
> **Save this password** — it's only shown once. You can change it later in the Admin panel.

### Step 6.3 — Verify the database
```bash
# Open Prisma Studio against production (optional, for verification)
npx prisma studio
# → You should see all 16 tables with seed data
```

---

## 7. Connect MT5 Bridge

The MT5 Bridge is a Python script that runs on your trading PC and pushes live trade data from MT5 to your Render API via WebSocket.

### Step 7.1 — Get your connector API key
The backend validates incoming connector traffic using the `X-API-Key` header. The key is the value you set in `CONNECTOR_API_KEYS` (Render env var, [§4.2](#42--add-environment-variables)).

Example: `CONNECTOR_API_KEYS=wfb_9f8e7d6c5b4a3928`

### Step 7.2 — Configure the bridge locally

```bash
cd mt5-bridge

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate    # macOS/Linux
# .venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

Edit `mt5-bridge/.env`:
```ini
# Your Render API URL
API_URL=https://w-forex-bot-api.onrender.com
# The API key you set in Render (CONNECTOR_API_KEYS)
API_KEY=wfb_9f8e7d6c5b4a3928
# Your MT5 account (terminal number) — NOT your password
MT5_LOGIN=12345678
# Optional: MT5 password (used only by the local bridge to connect to your terminal)
MT5_PASSWORD=your-mt5-password
MT5_SERVER=YourBroker-Server
```

> 🔒 **Security:** The `.env` file stays on your local PC only. It's git-ignored and never uploaded. MT5 passwords never touch the server.

### Step 7.3 — Run the bridge

```bash
# Make sure MetaTrader 5 is open and logged in
python mt5_bridge.py
```

You should see:
```
✅ Connected to MT5 (login: 12345678)
✅ Connected to API: https://w-forex-bot-api.onrender.com
✅ Streaming trade data...
```

### Step 7.4 — (Optional) Run the bridge as a Windows service
For 24/7 operation on a Windows VPS:
```powershell
# Install NSSM (https://nssm.cc/) then:
nssm install WForexBotBridge "C:\path\to\python.exe" "C:\path\to\mt5_bridge.py"
nssm start WForexBotBridge
```

---

## 8. Domain Setup (Free Subdomain)

### Option A — Rename the Vercel subdomain (Free, instant)

1. Go to **Vercel** → your project → **Settings** → **Domains**
2. Next to the default domain, click **Edit**
3. Change to: `wforexbot` → result: `wforexbot.vercel.app`
4. Vercel provisions the SSL certificate automatically ✅

### Option B — Use a free custom domain (Freenom alternative)

> ⚠️ **Freenom (.tk, .ml, .ga) is currently suspended.** Use these free alternatives:

| Provider | Domain Type | How |
|----------|-------------|-----|
| **DuckDNS** | `wforexbot.duckdns.org` | Free dynamic DNS — https://www.duckdns.org |
| **is-a.dev** | `wforexbot.is-a.dev` | Free for developers — https://www.is-a.dev |
| **Cloudflare Pages** | `wforexbot.pages.dev` | Migrate frontend to Cloudflare for a free subdomain |
| **Buy cheap domain** | `wforexbot.com` (~$10/year) | Namecheap/Cloudflare — most professional |

**To connect a custom domain to Vercel:**
1. Vercel → Settings → Domains → **Add** → enter your domain
2. At your DNS provider, add:
   ```
   CNAME  www  →  cname.vercel-dns.com
   A      @    →  76.76.21.21
   ```
3. Vercel auto-provisions HTTPS (Let's Encrypt) ✅

### Update CORS after the domain is set

In **Render** → Environment, update `CORS_ORIGIN` to include your final domain:
```
CORS_ORIGIN=https://wforexbot.vercel.app,https://wforexbot.com
```

---

## 9. Environment Variables Reference

### Backend (Render) — `server/.env.example`

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | `postgresql://...neon.tech/wforexbot?sslmode=require` |
| `JWT_SECRET` | ✅ | `openssl rand -hex 32` output |
| `JWT_EXPIRES_IN` | optional | `7d` |
| `ENCRYPTION_KEY` | ✅ | `openssl rand -hex 32` output |
| `CORS_ORIGIN` | ✅ | `https://wforexbot.vercel.app` |
| `NODE_ENV` | ✅ | `production` |
| `PORT` | auto | Render injects automatically |
| `CONNECTOR_API_KEYS` | ✅ | `wfb_<random>` |
| `CONNECTOR_MAX_BODY_KB` | optional | `64` |
| `SMTP_HOST` | optional | `smtp.gmail.com` |
| `SMTP_USER` / `SMTP_PASS` | optional | (for email notifications) |
| `TELEGRAM_BOT_TOKEN` | optional | (for Telegram bot integration) |

### Frontend (Vercel) — `web/.env.production.example`

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://w-forex-bot-api.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | `https://w-forex-bot-api.onrender.com` |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL` | optional | `https://t.me/+iXalBkHABfBkYWQ0` |

### MT5 Bridge — `mt5-bridge/.env`

| Variable | Required | Example |
|----------|----------|---------|
| `API_URL` | ✅ | `https://w-forex-bot-api.onrender.com` |
| `API_KEY` | ✅ | `wfb_<random>` (must match `CONNECTOR_API_KEYS`) |
| `MT5_LOGIN` | ✅ | `12345678` |
| `MT5_PASSWORD` | ✅ | (local only — never on server) |
| `MT5_SERVER` | ✅ | `YourBroker-Server` |

---

## 10. Security Checklist

- [x] **HTTPS** — automatic via Vercel + Render (Let's Encrypt)
- [x] **Environment variables** — all secrets in Render/Vercel dashboards, never in code
- [x] **No secrets in git** — `.env` files are git-ignored
- [x] **CORS** restricted to your frontend domain only
- [x] **JWT authentication** with strong random secret
- [x] **Connector API key** validates all MT5 bridge traffic
- [x] **MT5 passwords** stay on the local bridge PC — never sent to the server
- [x] **Neon** enforces `sslmode=require` (encrypted DB connections)
- [x] **Security headers** set in `next.config.ts` (X-Frame-Options, CSP, etc.)
- [x] **Password hashing** via bcrypt in the backend

> 🚫 **Never commit:** `.env`, `MT5_PASSWORD`, `JWT_SECRET`, `DATABASE_URL`, API keys

---

## 11. Updating the Project

### Frontend updates (Vercel)
```bash
git add . && git commit -m "update" && git push
# Vercel auto-deploys on push to main ✅
```

### Backend updates (Render)
```bash
git add . && git commit -m "update" && git push
# Render auto-deploys on push to main ✅
```

### Database migrations (when schema changes)
```bash
cd server
export DATABASE_URL="postgresql://...neon.tech/wforexbot?sslmode=require"
npx prisma migrate deploy   # apply new migrations
npm run db:seed             # re-seed if needed
```

### MT5 Bridge updates
```bash
cd mt5-bridge
git pull
pip install -r requirements.txt --upgrade
```

---

## 12. Troubleshooting

### Backend won't start on Render
- Check **Render → Logs** for errors
- Verify `DATABASE_URL` uses the **pooled** connection (`-pooler` in hostname)
- Verify `JWT_SECRET` and `ENCRYPTION_KEY` are set

### Frontend can't reach the API
- Verify `NEXT_PUBLIC_API_URL` in Vercel has no trailing slash
- Verify `CORS_ORIGIN` in Render includes your Vercel domain
- Check browser console for CORS errors

### Database connection errors
- Neon free tier **scales to zero** after idle — first query takes ~1 sec to wake
- Use the **pooled** connection for the app, **non-pooled** for migrations
- Ensure `?sslmode=require` is in the connection string

### Render cold starts (30-sec delay)
- Free plan spins down after 15 min idle
- First request wakes the service (~30 sec)
- **Workaround:** Use a free uptime monitor (e.g., UptimeRobot) to ping `/health` every 10 min

### WebSocket disconnects
- Render free tier supports WebSockets ✅
- The MT5 bridge auto-reconnects on disconnect
- If persistent, check the API key matches exactly

### Need more resources?
| Limit | Free Plan | Upgrade Path |
|-------|-----------|--------------|
| Render RAM | 512 MB | Render "Starter" ($7/mo) — no cold starts |
| Neon storage | 0.5 GB | Neon "Launch" ($19/mo) — 10 GB |
| Vercel bandwidth | 100 GB/mo | Vercel "Pro" ($20/mo) |

---

## ✅ Final Verification Checklist

After completing all steps, verify:

- [ ] Frontend loads at `https://wforexbot.vercel.app`
- [ ] API responds at `https://w-forex-bot-api.onrender.com/health`
- [ ] Database has all 16 tables (via Prisma Studio)
- [ ] Admin login works (`admin@wforexbot.com` + seeded password)
- [ ] Live Trading Dashboard shows data (when bridge is running)
- [ ] Subscription page works
- [ ] Telegram channel link is visible
- [ ] Risk Disclaimer is shown
- [ ] HTTPS padlock 🔒 is visible in browser

---

**Built with ❤️ for WForexBot** · Free Tier deployment guide
