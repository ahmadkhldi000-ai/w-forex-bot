// ====================================================================
//  W-FOREX BOT · INVESTOR PITCH DECK — Content (20 slides)
//  CONFIDENTIAL · 2026
//  AI-Powered Forex Trading & Copy Trading Platform
//  MetaTrader 5 | AI Analytics | Copy Trading | Live Signals
//  Palette tokens: emerald · gold · danger · info on charcoal-green
// ====================================================================

export const PITCH = {
  brand: "W·FOREX BOT",
  name: "W Forex Bot",
  tagline: "Building the Future of Intelligent Trading",
  subtitle: "AI-Powered Forex Trading & Copy Trading Platform",
  caption: "MetaTrader 5 · AI Analytics · Copy Trading · Live Signals",
  telegram: "t.me/+iXalBkHABfBkYWQo",
  confidential: "CONFIDENTIAL · 2026",
  total: 20,
};

// ---- Slide 1 · Cover ----
export const COVER = {
  kicker: "INTELLIGENT TRADING PLATFORM",
  title: "W Forex Bot",
  subtitle: "AI-Powered Forex Trading & Copy Trading Platform",
  badge: "Investor Pitch Deck",
  pillars: [
    { icon: "clock", label: "24/7 Non-stop automated trading" },
    { icon: "plug", label: "MT5 Direct broker connectivity" },
    { icon: "languages", label: "Full Arabic-native platform (RTL)" },
  ],
  centerline: "AI Analytics & Risk Management",
};

// ---- Slide 2 · Project Overview ----
export const OVERVIEW = {
  question: "What is W Forex Bot?",
  intro:
    "An integrated Forex trading platform powered by Artificial Intelligence, connecting directly to MetaTrader 5, offering automated trading, risk management, real-time analytics, and multi-tiered subscriptions.",
  quote:
    "Making professional trading accessible to everyone — intelligent automation, complete transparency, and managed risk.",
  chips: [
    { icon: "clock", label: "24/7 Non-stop automated trading" },
    { icon: "plug", label: "MT5 Direct broker connectivity" },
    { icon: "languages", label: "Full Arabic-native platform" },
  ],
};

// ---- Slide 3 · Market Analysis / The Problem ----
export const PROBLEM = {
  heading: "Why Do Most Traders Struggle?",
  intro:
    "The Forex market is full of opportunity, but it's also full of obstacles. These are the top challenges that push traders out before they even begin.",
  challenges: [
    {
      icon: "eye-off",
      title: "No Real-Time Monitoring",
      text: "The need to watch the market 24/7 without rest. What isn't monitored isn't managed — opportunities are lost.",
      tone: "danger",
    },
    {
      icon: "lock",
      title: "Lack of Transparency",
      text: "Closed-box signals and bots with no real visibility into performance or risk — trust is missing.",
      tone: "gold",
    },
    {
      icon: "hand",
      title: "Manual Management",
      text: "Manual trade tracking and risk control is exhausting and prone to emotional decisions.",
      tone: "info",
    },
    {
      icon: "barrier",
      title: "High Entry Barrier",
      text: "Complex manual analysis, charts, indicators, and intimidating platforms scare beginners away before their first trade.",
      tone: "emerald",
    },
  ],
  resultLabel: "The Result",
  resultTitle: "A Massive Underserved Market",
  resultStats: [
    { value: "$7.5T", label: "Daily Forex trading volume" },
    { value: "Retail", label: "Most traders lack the professional tools that institutions use" },
  ],
};

// ---- Slide 4 · Solution Overview ----
export const SOLUTION = {
  heading: "One Platform... Solves Everything",
  intro:
    "W Forex Bot integrates automation, transparency, and intelligent analytics into one simple experience — designed for both beginners and professionals.",
  features: [
    { num: "01", icon: "layout-dashboard", title: "Professional Dashboard", text: "Balance, profits, statistics, and risk — all indicators on one clear screen." },
    { num: "02", icon: "radio", title: "Real-Time Monitoring", text: "Live price and trade streaming on charts — you see exactly what's happening and where." },
    { num: "03", icon: "bot", title: "Automated Trading", text: "MT5 bot executes strategies 24/7 without emotional or manual intervention." },
    { num: "04", icon: "copy", title: "Copy Trading", text: "Next phase: automatically copy successful traders' positions with one click." },
    { num: "05", icon: "credit-card", title: "Subscription System", text: "Three tiers (FREE / PRO / VIP) to suit every trader and budget." },
    { num: "06", icon: "brain", title: "Performance Analytics", text: "AI-powered smart reports revealing strengths and areas for improvement." },
  ],
};

// ---- Slide 5 · How the Platform Works (data flow) ----
export const DATAFLOW = {
  heading: "Secure Data Flow — From Market to You",
  intro:
    "A safe and reliable journey from MT5 terminals to the user's screen — every node encrypted, every millisecond verified.",
  nodes: [
    { icon: "candlestick-chart", label: "Market Data" },
    { icon: "plug", label: "MT5" },
    { icon: "server", label: "API Gateway" },
    { icon: "monitor", label: "Platform" },
    { icon: "layout-dashboard", label: "User Dashboard" },
  ],
  guarantees: [
    { icon: "lock", label: "End-to-end encryption" },
    { icon: "zap", label: "Real-time synchronization" },
    { icon: "shield-check", label: "Multi-layer security validation" },
  ],
};

// ---- Slide 6 · System Components (8-card grid) ----
export const COMPONENTS = {
  heading: "Eight Pillars... One Integrated Platform",
  intro:
    "Each component serves a specific role, all interconnected through a single scalable backend architecture.",
  items: [
    { icon: "layout-dashboard", title: "User Dashboard", text: "Trader dashboard: balance, profits, trades, and risk." },
    { icon: "shield", title: "Admin Dashboard", text: "Complete user, subscription, and statistics management." },
    { icon: "globe", title: "Web Platform", text: "Marketing site + Arabic trading application (RTL)." },
    { icon: "bot", title: "MT5 Trading Bot", text: "Python bot executing and managing trades on MT5." },
    { icon: "send", title: "Telegram Integration", text: "Trade notifications and instant alerts via Telegram." },
    { icon: "credit-card", title: "Subscription System", text: "Multi-tier membership and payment system." },
    { icon: "brain", title: "Analytics", text: "AI-powered performance analysis and smart reports." },
    { icon: "radio", title: "Live Trading Feed", text: "Real-time price and trade streaming on charts." },
  ],
};

// ---- Slide 7 · Key Features ----
export const FEATURES = {
  heading: "Seven Core Strengths That Make the Difference",
  intro:
    "Not just a bot — but a feature-rich ecosystem designed to improve every trader's success rate.",
  items: [
    { icon: "shield-check", title: "Risk Management", text: "Automatic Stop Loss / Take Profit and balance protection." },
    { icon: "candlestick-chart", title: "Trade Visualization", text: "Every trade displayed with entry, exit, and profit on chart." },
    { icon: "activity", title: "Live Updates", text: "Real-time price and trade streaming." },
    { icon: "bot", title: "Automated Trading", text: "24/7 strategies running without human intervention." },
    { icon: "lock", title: "Security", text: "Encryption, 2FA, and complete data protection." },
    { icon: "languages", title: "Ease of Use", text: "Simple Arabic interface — no learning curve required." },
    { icon: "brain", title: "Performance Analytics", text: "Reports and metrics revealing strategy effectiveness." },
  ],
};

// ---- Slide 8 · Platform Screenshots ----
export const SCREENS = {
  heading: "Interfaces Designed to Impress",
  intro:
    "Four real screens: Homepage, Dashboard, Live Trading, and Admin Panel.",
  items: [
    { icon: "globe", title: "Homepage", text: "Arabic-native marketing site" },
    { icon: "layout-dashboard", title: "Dashboard", text: "Trader control center" },
    { icon: "radio", title: "Live Trading", text: "Real-time chart & orders" },
    { icon: "shield", title: "Admin Panel", text: "Full operations management" },
  ],
};

// ---- Slide 9 · Dashboard View ----
export const DASHBOARD = {
  heading: "Numbers That Tell the Full Story",
  intro:
    "Everything a trader needs in one glance: balance, profits, statistics, win rate, and risk level.",
  metrics: [
    { icon: "wallet", title: "Balance", text: "Current account equity.", tone: "emerald" },
    { icon: "trending-up", title: "Profit / Loss", text: "Realized P&L, color-coded green for profit, red for loss.", tone: "gold" },
    { icon: "bar-chart-3", title: "Statistics", text: "Total trades executed, win-rate percentage.", tone: "info" },
    { icon: "gauge", title: "Risk Score", text: "AI visual indicator showing current risk level.", tone: "danger" },
  ],
};

// ---- Slide 10 · Trading Interface ----
export const LIVE = {
  heading: "Every Trade Under Control",
  intro:
    "Live chart, clear BUY/SELL orders, and precisely calculated Take Profit and Stop Loss limits for risk management.",
  chartTitle: "Live Chart — EUR/USD",
  side: [
    { icon: "arrow-up-right", label: "BUY", tone: "emerald" },
    { icon: "arrow-down-right", label: "SELL", tone: "danger" },
    { icon: "target", label: "Take Profit", tone: "gold" },
    { icon: "shield-alert", label: "Stop Loss", tone: "danger" },
  ],
};

// ---- Slide 11 · Artificial Intelligence ----
export const AI = {
  heading: "The Intelligence Behind Every Decision",
  intro:
    "Our analytics engine analyzes, classifies, and learns from market data to optimize performance and protect capital.",
  neuralTitle: "Neural Decision Engine",
  neuralText:
    "Learns from every trade to improve the next decision.",
  points: [
    { icon: "file-text", title: "Smart Reports", text: "Custom reports explaining what happened and why — in clear, simple language." },
    { icon: "scan", title: "Pattern Extraction", text: "Reads thousands of data points and extracts profit/loss patterns." },
    { icon: "user-check", title: "Experience Optimization", text: "Personalizes recommendations and interface based on each trader's behavior." },
    { icon: "shield-alert", title: "Drawdown Guard", text: "Monitors risk drawdown and automatically isolates limits to protect balance." },
  ],
};

// ---- Slide 12 · Subscription Model ----
export const PRICING = {
  heading: "Three Tiers for Every Trader",
  intro:
    "A flexible subscription model starting free and scaling with trader needs — predictable, recurring revenue.",
  popular: "PRO",
  tiers: [
    {
      tier: "FREE",
      price: "$0",
      period: "Forever",
      tagline: "Get started, no card required.",
      features: {
        "Automated Trading": true,
        "Live Signals": true,
        "Risk Management": true,
        "Performance Analytics": false,
        "Copy Trading": false,
        "Priority Support": false,
      } as Record<string, boolean>,
    },
    {
      tier: "PRO",
      price: "$49",
      period: "/month",
      tagline: "Most popular — full automation + analytics.",
      featured: true,
      features: {
        "Automated Trading": true,
        "Live Signals": true,
        "Risk Management": true,
        "Performance Analytics": true,
        "Copy Trading": false,
        "Priority Support": false,
      } as Record<string, boolean>,
    },
    {
      tier: "VIP",
      price: "$149",
      period: "/month",
      tagline: "Everything, plus copy trading.",
      features: {
        "Automated Trading": true,
        "Live Signals": true,
        "Risk Management": true,
        "Performance Analytics": true,
        "Copy Trading": true,
        "Priority Support": true,
      } as Record<string, boolean>,
    },
  ],
  featureRows: [
    "Automated Trading",
    "Live Signals",
    "Risk Management",
    "Performance Analytics",
    "Copy Trading",
    "Priority Support",
  ],
};

// ---- Slide 13 · Security ----
export const SECURITY = {
  heading: "Security Is Not Optional",
  intro:
    "We handle sensitive financial data — that's why the platform is built on five integrated security layers.",
  layers: [
    { icon: "key-round", title: "API Security", text: "Encrypted keys + JWT + strict request validation." },
    { icon: "database", title: "Data Encryption", text: "AES-256 for all data in transit and at rest." },
    { icon: "landmark", title: "Bank-Grade Security", text: "End-to-end encryption, strict authentication, 24/7 monitoring." },
    { icon: "smartphone", title: "Two-Factor Authentication", text: "Mandatory 2FA for trading and withdrawal accounts." },
    { icon: "users", title: "Access Control", text: "Role-Based Access Control (RBAC) defines precise user permissions." },
  ],
};

// ---- Slide 14 · Roadmap ----
export const ROADMAP = {
  heading: "Five Phases to the Top",
  intro:
    "A clear execution path from launch to global expansion — each phase built on the success of the previous.",
  phases: [
    { phase: "Phase 1", timeline: "Q1 2026", label: "Platform Launch", note: "MVP, Core Features", status: "done" },
    { phase: "Phase 2", timeline: "Q2–Q3 2026", label: "User Growth", note: "Marketing, First 10K Users", status: "next" },
    { phase: "Phase 3", timeline: "Q4 2026", label: "Copy Trading", note: "Premium Features", status: "next" },
    { phase: "Phase 4", timeline: "2027", label: "Mobile Apps", note: "Android & iOS Launch", status: "next" },
    { phase: "Phase 5", timeline: "2028+", label: "Global Expansion", note: "Multi-language, 200+ Countries", status: "next" },
  ],
};

// ---- Slide 15 · Business Model ----
export const BUSINESS = {
  heading: "Four Integrated Revenue Streams",
  intro:
    "D2C model with recurring subscriptions + premium services — diversified revenue that protects income and opens multiple growth avenues.",
  target: "Target ARR by 2030: +$2.2M",
  streams: [
    { label: "Subscriptions", pct: 62, note: "Recurring monthly/annual revenue via VIP plans.", color: "var(--emerald)" },
    { label: "Premium Services", pct: 21, note: "Add-on features, custom signals, advanced analytics.", color: "var(--gold)" },
    { label: "Platform Development", pct: 12, note: "Bot licensing and additional broker integrations for companies.", color: "var(--info)" },
    { label: "Future Services", pct: 5, note: "B2B partnerships and Copy Trading commissions.", color: "var(--danger)" },
  ],
};

// ---- Slide 16 · Target Market ----
export const TARGET = {
  heading: "A Massive Market",
  intro:
    "Segmenting from Individual Beginners to Investment Firms — W serves multiple segments worldwide.",
  marketSize: { value: "$7.5T", label: "Average daily Forex trading volume globally" },
  stats: [
    { value: "+200", label: "Countries with active traders" },
    { value: "MENA", label: "Our Primary Market" },
    { value: "10M+", label: "Active traders" },
    { value: "6%+", label: "Annual growth rate" },
  ],
  audiences: [
    { icon: "user", title: "Individual Retail Traders", text: "Beginners to advanced" },
    { icon: "building-2", title: "Investment Firms", text: "Brokers and B2Bs seeking a tool" },
  ],
};

// ---- Slide 17 · Competitive Advantage ----
export const COMPETITIVE = {
  heading: "Why W Forex Bot?",
  intro:
    "A direct comparison with traditional solutions across seven dimensions — the gap clearly favors us.",
  rows: [
    { metric: "Trading Automation", them: "Delayed", us: "24/7 Full Automation" },
    { metric: "Live Streaming", them: "Basic", us: "Real-time (Socket.io)" },
    { metric: "Dashboard", them: "Static", us: "Professional RTL Arabic" },
    { metric: "Analytics", them: "Basic", us: "Advanced AI-Powered" },
    { metric: "Subscriptions", them: "Fixed / High", us: "Flexible (3 Tiers)" },
    { metric: "Risk Management", them: "Manual", us: "AI + Automated" },
    { metric: "Scalability", them: "Local", us: "Global Multi-language" },
  ],
};

// ---- Slide 18 · Vision & Expansion ----
export const VISION = {
  heading: "W Forex Bot Today — This Is Just the Beginning",
  intro: "Our major milestones for the coming years:",
  milestones: [
    { year: "2026", label: "MENA regional launch → Global multi-language platform serving traders in 200+ countries" },
    { year: "2027", label: "Mobile Applications — Android & iOS" },
    { year: "2027+", label: "Copy Trading — Automatically copy elite traders' positions" },
    { year: "2028+", label: "Self-learning predictive models" },
    { year: "2029+", label: "Additional Markets — Crypto, Stocks, and Commodities alongside Forex" },
  ],
};

// ---- Slide 19 · Risk Disclaimer ----
export const DISCLAIMER = {
  heading: "Legal Disclaimer",
  items: [
    {
      title: "Not Financial Advice",
      text: "This presentation is for informational purposes only and does not constitute a recommendation or investment advice. Trade responsibly.",
      tone: "info",
    },
    {
      title: "Past Performance",
      text: "Historical performance of any bot or strategy does not guarantee similar future results.",
      tone: "gold",
    },
    {
      title: "High Risk",
      text: "Trading in Forex, digital currencies, and CFDs involves substantial risk and may result in the complete loss of capital.",
      tone: "danger",
    },
  ],
};

// ---- Slide 20 · Thank You ----
export const CLOSING = {
  heading: "Thank You for Your Interest",
  brand: "W Forex Bot",
  line: "Building the Future of Intelligent Trading",
  note: "W·FOREX BOT | INVESTOR DECK · 2026",
  telegram: "t.me/+iXalBkHABfBkYWQo",
  rights: "© 2026 W Forex Bot. All Rights Reserved. Confidential.",
};
