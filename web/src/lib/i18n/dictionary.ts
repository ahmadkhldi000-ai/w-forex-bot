export type Lang = "ar" | "en";

/* ------------------------------------------------------------------ */
/*  Central bilingual dictionary for the marketing site               */
/* ------------------------------------------------------------------ */

export const dictionary = {
  /* ---------- Brand ---------- */
  brand: {
    name: "W Forex",
    ar: "W Forex",
    en: "W Forex",
  },

  /* ---------- Language switcher ---------- */
  lang: {
    switchTo: { ar: "English", en: "العربية" },
  },

  /* ---------- Navbar ---------- */
  nav: {
    links: {
      ar: [
        { label: "الميزات", href: "#features" },
        { label: "الاستراتيجية", href: "#strategy" },
        { label: "كيف يعمل", href: "#how" },
        { label: "الأسعار", href: "#pricing" },
      ],
      en: [
        { label: "Features", href: "#features" },
        { label: "Strategy", href: "#strategy" },
        { label: "How it works", href: "#how" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    cta: { ar: "ابدأ الآن", en: "Get started" },
    signin: { ar: "تسجيل الدخول", en: "Sign in" },
    dashboard: { ar: "الدخول للوحة التحكم", en: "Open dashboard" },
    menu: { ar: "القائمة", en: "Menu" },
  },

  /* ---------- Hero ---------- */
  hero: {
    badge: { ar: "متصل الآن · يتداول على 12 زوجًا", en: "Live now · trading 12 pairs" },
    title1: { ar: "تداول الفوركس", en: "Trade forex" },
    title2: { ar: "بذكاء", en: "with" },
    titleAccent: { ar: "آلي", en: "intelligence" },
    titleSuffix: { ar: "متقدم", en: "powered by AI" },
    subtitle: {
      ar: "روبوت تداول مؤتمت بالكامل يحلل السوق على مدار الساعة، ينفّذ صفقات بدقّة عالية، ويحمي رأس مالك بإدارة مخاطر صارمة. بدون عواطف، فقط نتائج.",
      en: "A fully automated trading bot that analyzes the market around the clock, executes trades with high precision, and protects your capital with strict risk management. No emotions, just results.",
    },
    ctaPrimary: { ar: "جرّب لوحة التحكم مباشرة", en: "Try the dashboard live" },
    ctaSecondary: { ar: "كيف يعمل؟", en: "How it works" },
    trustRating: { ar: "متداول", en: "traders" },
    trustSecured: { ar: "أموالك مؤمّنة", en: "Funds secured" },
    trustInstant: { ar: "تنفيذ فوري", en: "Instant execution" },
    /* preview card */
    previewWinrate: { ar: "نسبة الصفقات الرابحة", en: "Win rate" },
    previewBalance: { ar: "الرصيد الإجمالي", en: "Total balance" },
    previewDailyProfit: { ar: "ربح اليوم", en: "Today's profit" },
    previewOpenPositions: { ar: "الصفقات المفتوحة", en: "Open positions" },
    previewOnline: { ar: "متصل", en: "Online" },
    previewEngine: { ar: "محرّك التداول", en: "Trading Terminal" },
    previewLive: { ar: "يومي · الإنجاز", en: "Daily · Performance" },
    previewMonthlyProfit: { ar: "معدّل الربح الشهري", en: "Avg. monthly profit" },
    previewOpenFull: { ar: "افتح لوحة التحكم الكاملة", en: "Open the full dashboard" },
  },

  /* ---------- Stats ---------- */
  stats: {
    ar: [
      { value: "$12.4M+", label: "حجم التداول الشهري", gold: false },
      { value: "87.3%", label: "نسبة الصفقات الرابحة", gold: true },
      { value: "<40ms", label: "سرعة التنفيذ", gold: false },
      { value: "24/7", label: "تداول بلا توقف", gold: true },
    ],
    en: [
      { value: "$12.4M+", label: "Monthly traded volume", gold: false },
      { value: "87.3%", label: "Win rate", gold: true },
      { value: "<40ms", label: "Execution speed", gold: false },
      { value: "24/7", label: "Non-stop trading", gold: true },
    ],
  },

  /* ---------- Features ---------- */
  features: {
    eyebrow: { ar: "الميزات", en: "Features" },
    title1: { ar: "كل ما تحتاجه لتتداول", en: "Everything you need to" },
    titleAccent: { ar: "كالمحترفين", en: "trade like a pro" },
    subtitle: {
      ar: "منصّة متكاملة تجمع بين قوة الذكاء الاصطناعي ودقّة التحليل الفني وسرعة التنفيذ المؤتمت.",
      en: "An all-in-one platform combining the power of AI, technical-analysis precision, and the speed of automated execution.",
    },
    items: {
      ar: [
        {
          icon: "Bot",
          title: "ذكاء اصطناعي تنبؤي",
          desc: "نماذج تعلّم آلي تحلّل آلاف الأنماط والشموع اليابانية لحظياً لتحديد نقاط الدخول والخروج المثلى.",
          tone: "accent",
        },
        {
          icon: "ShieldCheck",
          title: "إدارة مخاطر صارمة",
          desc: "وقف خسائر تلقائي، تحديد حجم الصفقة حسب رأس المال، وحماية كاملة من تقلّبات السوق المفاجئة.",
          tone: "gold",
        },
        {
          icon: "Gauge",
          title: "تنفيذ بسرعة البرق",
          desc: "محرك تنفيذ يقل عن 40 مللي ثانية مع ربط مباشر بالسيولة لضمان أفضل الأسعار وأقل انزلاق.",
          tone: "accent",
        },
        {
          icon: "LineChart",
          title: "تحليل متعدد الأطر الزمنية",
          desc: "يفحص البوت 9 أطر زمنية في وقت واحد من دقيقة واحدة إلى يومي لتأكيد الاتجاه قبل التنفيذ.",
          tone: "gold",
        },
        {
          icon: "Bell",
          title: "تنبيهات فورية",
          desc: "إشعارات على تيليجرام والبريد لكل صفقة منفّذة، مع تقارير أداء يومية وأسبوعية مفصّلة.",
          tone: "accent",
        },
        {
          icon: "Wallet",
          title: "ربط وساطع متعدد",
          desc: "يعمل مع MT4 / MT5 / cTrader وأكثر من 40 وسيطاً، مع دعم حسابات تجريبية وحقيقية.",
          tone: "gold",
        },
      ],
      en: [
        {
          icon: "Bot",
          title: "Predictive AI",
          desc: "Machine-learning models analyze thousands of patterns and candlesticks in real time to pinpoint optimal entries and exits.",
          tone: "accent",
        },
        {
          icon: "ShieldCheck",
          title: "Strict risk management",
          desc: "Automatic stop-losses, position sizing based on capital, and full protection against sudden market swings.",
          tone: "gold",
        },
        {
          icon: "Gauge",
          title: "Lightning-fast execution",
          desc: "An execution engine under 40ms with direct liquidity access for the best prices and minimal slippage.",
          tone: "accent",
        },
        {
          icon: "LineChart",
          title: "Multi-timeframe analysis",
          desc: "The bot scans 9 timeframes simultaneously — from one-minute to daily — to confirm the trend before executing.",
          tone: "gold",
        },
        {
          icon: "Bell",
          title: "Instant alerts",
          desc: "Telegram and email notifications on every executed trade, with detailed daily and weekly performance reports.",
          tone: "accent",
        },
        {
          icon: "Wallet",
          title: "Multi-broker connectivity",
          desc: "Works with MT4 / MT5 / cTrader and 40+ brokers, with support for demo and live accounts.",
          tone: "gold",
        },
      ],
    },
  },

  /* ---------- Strategy ---------- */
  strategy: {
    eyebrow: { ar: "الاستراتيجية", en: "Strategy" },
    title1: { ar: "استراتيجية مدعومة بالبيانات،", en: "Data-driven strategy," },
    titleAccent: { ar: "لا بالحدس", en: "not guesswork" },
    subtitle: {
      ar: "مبنيّة على أكثر من 8 سنوات من بيانات الفوركس التاريخية، تجمع استراتيجيتنا بين ثلاثة أعمدة رئيسية لتحقيق عوائد ثابتة مع حماية رأس المال في كل صفقة.",
      en: "Built on 8+ years of historical forex data, our strategy rests on three core pillars to deliver consistent returns while protecting capital on every trade.",
    },
    badges: {
      ar: ["Backtested 8yrs", "Low Drawdown", "MT5 Native", "Risk 1%"],
      en: ["Backtested 8yrs", "Low Drawdown", "MT5 Native", "Risk 1%"],
    },
    pillars: {
      ar: [
        {
          icon: "Cpu",
          title: "محرك القرار",
          points: [
            "تحليل 9 أطر زمنية متزامنة",
            "كشف أنماط الشموع اليابانية بالـ AI",
            "فلتر أخبار اقتصادية لحظي",
            "تأكيد الإشارة قبل التنفيذ",
          ],
        },
        {
          icon: "BarChart3",
          title: "نموذج الأداء",
          points: [
            "متوسط ربح شهري 12–18%",
            "عامل ربح 2.4× (Profit Factor)",
            "أقصى تراجع تاريخي 8.3%",
            "Sharpe Ratio 1.92",
          ],
        },
        {
          icon: "Lock",
          title: "طبقات الحماية",
          points: [
            "وقف خسائر ديناميكي ATR",
            "تحجيم الصفقة حسب المخاطرة 1%",
            "إيقاف تلقائي عند 3 خسائر متتالية",
            "هيدج تلقائي عند التقلّب العالي",
          ],
        },
      ],
      en: [
        {
          icon: "Cpu",
          title: "Decision engine",
          points: [
            "Simultaneous 9-timeframe analysis",
            "AI candlestick-pattern detection",
            "Real-time economic-news filter",
            "Signal confirmation before execution",
          ],
        },
        {
          icon: "BarChart3",
          title: "Performance model",
          points: [
            "12–18% average monthly profit",
            "2.4× profit factor",
            "8.3% max historical drawdown",
            "Sharpe Ratio 1.92",
          ],
        },
        {
          icon: "Lock",
          title: "Layers of protection",
          points: [
            "Dynamic ATR stop-loss",
            "1% risk-based position sizing",
            "Auto-halt after 3 consecutive losses",
            "Automatic hedge at high volatility",
          ],
        },
      ],
    },
  },

  /* ---------- How it works ---------- */
  how: {
    eyebrow: { ar: "كيف يعمل", en: "How it works" },
    title1: { ar: "جاهز للانطلاق في", en: "Ready to start in" },
    titleAccent: { ar: "4 خطوات", en: "4 steps" },
    subtitle: {
      ar: "من التسجيل إلى أول صفقة آلية في أقل من 5 دقائق. بدون خبرة برمجية.",
      en: "From sign-up to your first automated trade in under 5 minutes. No coding skills required.",
    },
    steps: {
      ar: [
        { icon: "UserPlus", step: "01", title: "أنشئ حسابك", desc: "سجّل في دقيقة واحدة واربط حساب الوساطع لديك (MT4 / MT5 / cTrader) بأمان كامل." },
        { icon: "Settings2", step: "02", title: "اضبط استراتيجيتك", desc: "اختر مستوى المخاطرة، الأزواج المطلوبة، وأحجام الصفقات. أو استخدم الإعدادات الافتراضية المثلى." },
        { icon: "Rocket", step: "03", title: "فعّل البوت", desc: "ابدأ التداول الآلي بضغطة زر. يراقب البوت السوق وينفّذ الصفقات على مدار الساعة." },
        { icon: "TrendingUp", step: "04", title: "راقب أرباحك", desc: "تابع الأداء اللحظي عبر لوحة المعلومات، واستلم تقارير مفصّلة وتنبيهات فورية." },
      ],
      en: [
        { icon: "UserPlus", step: "01", title: "Create your account", desc: "Sign up in a minute and securely link your brokerage account (MT4 / MT5 / cTrader)." },
        { icon: "Settings2", step: "02", title: "Configure your strategy", desc: "Choose your risk level, desired pairs, and position sizes — or use the optimal defaults." },
        { icon: "Rocket", step: "03", title: "Activate the bot", desc: "Start automated trading with one click. The bot monitors the market and executes trades 24/7." },
        { icon: "TrendingUp", step: "04", title: "Track your profits", desc: "Follow live performance on the dashboard and receive detailed reports and instant alerts." },
      ],
    },
  },

  /* ---------- Pricing ---------- */
  pricing: {
    eyebrow: { ar: "الأسعار", en: "Pricing" },
    title1: { ar: "أسعار شفّافة،", en: "Transparent pricing," },
    titleAccent: { ar: "قيمة حقيقية", en: "real value" },
    subtitle: {
      ar: "ابدأ مجاناً وارتقِ عندما تكون جاهزاً. بدون عقود، إلغاء في أي وقت.",
      en: "Start free and upgrade when you're ready. No contracts, cancel anytime.",
    },
    mostPopular: { ar: "الأكثر شيوعاً", en: "Most popular" },
    plans: {
      ar: [
        {
          name: "Starter",
          icon: "Rocket",
          price: "$0",
          period: "مجاناً",
          desc: "للتجربة والتعلّم على حساب تجريبي.",
          cta: "ابدأ مجاناً",
          variant: "secondary",
          featured: false,
          features: [
            "حساب تجريبي غير محدود",
            "زوجان من العملات",
            "إعدادات مخاطرة أساسية",
            "تنبيهات تيليجرام",
            "دعم عبر المجتمع",
          ],
        },
        {
          name: "Pro",
          icon: "Sparkles",
          price: "$49",
          period: "/ شهرياً",
          desc: "للمتداولين الجادّين الباحثين عن عوائد.",
          cta: "اشترك الآن",
          variant: "primary",
          featured: true,
          features: [
            "حساب حقيقي حتى $50k",
            "كل أزواج الفوركس + الذهب",
            "استراتيجيات AI متقدمة",
            "إدارة مخاطر ديناميكية",
            "لوحة تحليلات كاملة",
            "دعم أولوية 24/7",
          ],
        },
        {
          name: "Enterprise",
          icon: "Crown",
          price: "حسب الطلب",
          period: "للمؤسسات بمحافظ كبيرة.",
          desc: "حلول مخصّصة للمؤسسات والمحافظ الكبيرة.",
          cta: "تواصل معنا",
          variant: "gold",
          featured: false,
          features: [
            "رصيد غير محدود",
            "استراتيجيات مخصّصة",
            "API كامل + Webhooks",
            "مدير حساب مخصّص",
            "تقارير بيانية متقدمة",
            "SLA وضمانات تشغيل",
          ],
        },
      ],
      en: [
        {
          name: "Starter",
          icon: "Rocket",
          price: "$0",
          period: "Free",
          desc: "For testing and learning on a demo account.",
          cta: "Start free",
          variant: "secondary",
          featured: false,
          features: [
            "Unlimited demo account",
            "Two currency pairs",
            "Basic risk settings",
            "Telegram alerts",
            "Community support",
          ],
        },
        {
          name: "Pro",
          icon: "Sparkles",
          price: "$49",
          period: "/ month",
          desc: "For serious traders chasing returns.",
          cta: "Subscribe now",
          variant: "primary",
          featured: true,
          features: [
            "Live account up to $50k",
            "All forex pairs + gold",
            "Advanced AI strategies",
            "Dynamic risk management",
            "Full analytics dashboard",
            "24/7 priority support",
          ],
        },
        {
          name: "Enterprise",
          icon: "Crown",
          price: "Custom",
          period: "For institutions with large portfolios.",
          desc: "Tailored solutions for institutions and large portfolios.",
          cta: "Contact us",
          variant: "gold",
          featured: false,
          features: [
            "Unlimited balance",
            "Custom strategies",
            "Full API + Webhooks",
            "Dedicated account manager",
            "Advanced analytics",
            "SLA & uptime guarantees",
          ],
        },
      ],
    },
  },

  /* ---------- Testimonials ---------- */
  testimonials: {
    eyebrow: { ar: "آراء العملاء", en: "Testimonials" },
    title1: { ar: "يثق بنا أكثر من", en: "Trusted by over" },
    titleAccent: { ar: "2,400 متداول", en: "2,400 traders" },
    subtitle: {
      ar: "انضم لمجتمع المتداولين الذكيين الذين يحقّقون نتائج ثابتة يومياً.",
      en: "Join a community of smart traders achieving consistent results every day.",
    },
    items: {
      ar: [
        { name: "أحمد المالكي", role: "متداول · دبي", avatar: "أ", gold: false, text: "بعد سنوات من التداول اليدوي المتعب، أصبح W Forex Bot يدير محفظتي بالكامل. النتائج فاقت توقعاتي — عائد ثابت شهر بعد شهر." },
        { name: "Sarah Lindqvist", role: "مديرة محفظة · ستوكهولم", avatar: "S", gold: true, text: "إدارة المخاطر فيه ممتازة. التراجع منخفض جداً مقارنة بأي بوت آخر جرّبته. لوحة التحكم احترافية والتنبيهات فورية." },
        { name: "خالد العتيبي", role: "متداول بدوام جزئي · الرياض", avatar: "خ", gold: false, text: "أعمل وظيفة كاملة ولا أملك وقتاً للمتابعة. البوت يتداول لي ليلاً ونهاراً وأستيقظ على أرباح ثابتة. لا أصدق الفرق." },
        { name: "Marcus Chen", role: "مستثمر · سنغافورة", avatar: "M", gold: true, text: "الربط مع MT5 كان سلساً والدعم الفني محترف جداً. أعدت ضبط الاستراتيجية على مخاطرة 1% وحققت نتائج رائعة." },
        { name: "نورة القحطاني", role: "مبتدئة · جدة", avatar: "ن", gold: false, text: "كنت خائفة من الفوركس، لكن النسخة التجريبية علّمتني كثيراً. الآن أتداول بثقة على حساب حقيقي وأرى أرباحاً حقيقية." },
        { name: "Diego Fernández", role: "Crypto + Forex · مدريد", avatar: "D", gold: true, text: "أحسن بوت جرّبته على الإطلاق. يغطي الفوركس والذهب وحتى الكريبتو بذكاء. تقارير الأداء اليومية مفصّلة وواضحة." },
      ],
      en: [
        { name: "Ahmed Al-Maliki", role: "Trader · Dubai", avatar: "A", gold: false, text: "After years of exhausting manual trading, W Forex Bot now manages my entire portfolio. Results exceeded my expectations — consistent returns month after month." },
        { name: "Sarah Lindqvist", role: "Portfolio manager · Stockholm", avatar: "S", gold: true, text: "The risk management is excellent. Drawdown is far lower than any other bot I've tried. The dashboard is professional and alerts are instant." },
        { name: "Khalid Al-Otaibi", role: "Part-time trader · Riyadh", avatar: "K", gold: false, text: "I work full-time and have no time to watch the markets. The bot trades day and night and I wake up to consistent profits. I can't believe the difference." },
        { name: "Marcus Chen", role: "Investor · Singapore", avatar: "M", gold: true, text: "Connecting MT5 was seamless and the technical support is highly professional. I reset the strategy to 1% risk and achieved great results." },
        { name: "Noura Al-Qahtani", role: "Beginner · Jeddah", avatar: "N", gold: false, text: "I was scared of forex, but the demo version taught me so much. Now I trade confidently on a live account and see real profits." },
        { name: "Diego Fernández", role: "Crypto + Forex · Madrid", avatar: "D", gold: true, text: "The best bot I've ever tried. It covers forex, gold, and even crypto intelligently. The daily performance reports are detailed and clear." },
      ],
    },
  },

  /* ---------- Telegram CTA ---------- */
  telegramCta: {
    eyebrow: { ar: "المجتمع", en: "Community" },
    badge: { ar: "القناة الرسمية على تيليجرام", en: "Official Telegram channel" },
    title: { ar: "انضم إلى", en: "Join the" },
    titleAccent: { ar: "مجتمع W-Forex", en: "W-Forex community" },
    subtitle: {
      ar: "كن أول من يعرف. إشعارات الصفقات المباشرة، التحليلات اليومية، ونخبة المتداولين — كل ذلك في مكان واحد.",
      en: "Be the first to know. Live trade alerts, daily analysis, and an elite community of traders — all in one place.",
    },
    perks: {
      ar: [
        { icon: "Bell", title: "تنبيهات فورية", desc: "إشعارات لحظية على كل صفقة يتخذها البوت وأهم تحركات السوق" },
        { icon: "TrendingUp", title: "تحليلات يومية", desc: "تحليل احترافي للفوركس والذهب والعملات الرقمية قبل الجلسات" },
        { icon: "MessageCircle", title: "مجتمع المتداولين", desc: "تواصل مباشر مع فريق W-Forex وأكثر من 12,000 متداول محترف" },
      ],
      en: [
        { icon: "Bell", title: "Instant alerts", desc: "Real-time notifications on every trade the bot takes and key market moves" },
        { icon: "TrendingUp", title: "Daily analysis", desc: "Professional analysis of forex, gold, and crypto before each session" },
        { icon: "MessageCircle", title: "Trader community", desc: "Direct access to the W-Forex team and 12,000+ pro traders" },
      ],
    },
    cta: { ar: "انضمام للقناة الآن", en: "Join the channel now" },
    ctaLoading: { ar: "يتم فتح القناة...", en: "Opening channel..." },
    note: { ar: "انضمام مجاني · أكثر من 12,000 عضو · تحديثات يومية", en: "Free to join · 12,000+ members · Daily updates" },
  },

  /* ---------- Final CTA ---------- */
  cta: {
    title1: { ar: "جاهز لتتداول", en: "Ready to trade" },
    titleAccent: { ar: "بذكاء", en: "smart" },
    titleSuffix: { ar: "؟", en: "?" },
    subtitle: {
      ar: "انضم اليوم لأكثر من 2,400 متداول يحقّقون عوائد ثابتة مع W Forex Bot. ابدأ مجاناً، بدون مخاطرة.",
      en: "Join 2,400+ traders earning consistent returns with W Forex Bot today. Start free, with zero risk.",
    },
    ctaButton: { ar: "افتح لوحة التحكم الآن", en: "Open the dashboard now" },
    perks: {
      ar: ["بدون بطاقة ائتمان", "إلغاء في أي وقت", "دعم 24/7"],
      en: ["No credit card", "Cancel anytime", "24/7 support"],
    },
  },

  /* ---------- Risk disclaimer ---------- */
  disclaimer: {
    badge: { ar: "تحذير المخاطر", en: "Risk Warning" },
    subtitle: {
      ar: "إقرار قانوني إلزامي — اقرأ بعناية",
      en: "Mandatory legal notice — read carefully",
    },
    title: { ar: "اقرأ قبل التداول", en: "Read before trading" },
    body: {
      ar: "التداول في الأسواق المالية (الفوركس، العملات الرقمية، المعادن) ينطوي على مخاطر عالية وقد لا يكون مناسباً لجميع المستثمرين. لا تتجاوز في استثمارك ما يمكنك تحمّل خسارته. الأداء السابق لا يضمن النتائج المستقبلية.",
      en: "Trading in financial markets (forex, crypto, metals) involves high risk and may not be suitable for all investors. Never invest more than you can afford to lose. Past performance does not guarantee future results.",
    },
    readMore: { ar: "قراءة التفاصيل الكاملة", en: "Read full details" },
    readLess: { ar: "إخفاء التفاصيل", en: "Hide full details" },
    details: {
      ar: [
        "• الرافعة المالية تضخّم الأرباح والخسائر على حدٍ سواء، وقد تؤدي لخسارة كاملة للحساب في فترات قصيرة.",
        "• ما بين 70% إلى 90% من حسابات التجزئة تخسر أموالها عند تداول عقود الفروقات.",
        "• لا تستثمر أكثر مما يمكنك تحمّل خسارته، واستشر مستشاراً مالياً مرخصاً عند الحاجة.",
        "• بإنشائك حساباً أو تفعيلك لخدمة نسخ الصفقات، فإنك تقرّ بموافقتك على هذا التحذير ويتم تسجيل وقت وقبول الإقرار في سجلات النظام.",
      ],
      en: [
        "• Leverage amplifies both gains and losses, and may lead to a complete account wipeout in short timeframes.",
        "• Between 70% and 90% of retail investor accounts lose money when trading CFDs.",
        "• Never invest more than you can afford to lose, and consult a licensed financial advisor when needed.",
        "• By creating an account or activating the copy trading service, you acknowledge this warning, and your consent timestamp is recorded in our audit logs.",
      ],
    },
  },

  /* ---------- Footer ---------- */
  footer: {
    tagline: {
      ar: "روبوت تداول آلي بالذكاء الاصطناعي يحقّق عوائد ثابتة في سوق الفوركس مع إدارة مخاطر صارمة.",
      en: "An AI-powered trading bot delivering consistent returns in the forex market with strict risk management.",
    },
    columns: {
      ar: [
        { title: "المنتج", links: ["الميزات", "الاستراتيجية", "الأسعار", "لوحة التحكم", "API"] },
        { title: "الشركة", links: ["من نحن", "المدوّنة", "وظائف", "شركاء", "اتصل بنا"] },
        { title: "الموارد", links: ["مركز المساعدة", "التوثيق", "دليل التداول", "حالة الخدمة", "المجتمع"] },
        { title: "قانوني", links: ["الشروط", "الخصوصية", "إخلاء المسؤولية", "ملفات الارتباط"] },
      ],
      en: [
        { title: "Product", links: ["Features", "Strategy", "Pricing", "Dashboard", "API"] },
        { title: "Company", links: ["About", "Blog", "Careers", "Partners", "Contact"] },
        { title: "Resources", links: ["Help center", "Docs", "Trading guide", "Status", "Community"] },
        { title: "Legal", links: ["Terms", "Privacy", "Disclaimer", "Cookies"] },
      ],
    },
    rights: { ar: "جميع الحقوق محفوظة.", en: "All rights reserved." },
    joinTelegram: { ar: "انضم إلى مجتمع تيليجرام", en: "Join Telegram Community" },
    riskNote: {
      ar: "ينطوي التداول في الفوركس والأسواق المالية على مخاطر عالية وقد يؤدي إلى خسارة رأس المال. الأداء السابق لا يضمن النتائج المستقبلية. W Forex Bot هو منصة تقنية ولا يضمن تحقيق الأرباح.",
      en: "Trading in Forex and financial markets carries high risk and may result in the loss of capital. Past performance does not guarantee future results. W Forex Bot is a technology platform and does not guarantee profits.",
    },
  },

  /* ---------- Auth (login / register) ---------- */
  auth: {
    backHome: { ar: "العودة للرئيسية", en: "Back to home" },
    registerTab: { ar: "حساب جديد", en: "Sign up" },
    loginTab: { ar: "تسجيل الدخول", en: "Sign in" },
    registerTitle: { ar: "أنشئ حسابك المجاني", en: "Create your free account" },
    loginTitle: { ar: "أهلاً بعودتك", en: "Welcome back" },
    registerSubtitle: {
      ar: "ابدأ التداول الذكي خلال أقل من دقيقة",
      en: "Start smart trading in under a minute",
    },
    loginSubtitle: {
      ar: "سجّل دخولك للوصول إلى لوحة التحكم",
      en: "Sign in to access your dashboard",
    },
    nameLabel: { ar: "الاسم (اختياري)", en: "Name (optional)" },
    namePlaceholder: { ar: "اسمك الكامل", en: "Your full name" },
    emailLabel: { ar: "البريد الإلكتروني", en: "Email" },
    emailPlaceholder: { ar: "you@example.com", en: "you@example.com" },
    passwordLabel: { ar: "كلمة المرور", en: "Password" },
    passwordHint: { ar: "8 أحرف على الأقل", en: "At least 8 characters" },
    showPassword: { ar: "إظهار كلمة المرور", en: "Show password" },
    hidePassword: { ar: "إخفاء كلمة المرور", en: "Hide password" },
    riskAccept: {
      ar: "أُقرّ بأن التداول في الفوركس ينطوي على خطر كبير، وأنني أتحمّل كامل المسؤولية عن قراراتي الاستثمارية.",
      en: "I acknowledge that Forex trading involves substantial risk and that I am solely responsible for my investment decisions.",
    },
    registerBtn: { ar: "إنشاء الحساب", en: "Create account" },
    loginBtn: { ar: "تسجيل الدخول", en: "Sign in" },
    processing: { ar: "جارٍ المعالجة...", en: "Processing..." },
    haveAccount: { ar: "لديك حساب بالفعل؟", en: "Already have an account?" },
    noAccount: { ar: "ليس لديك حساب؟", en: "Don't have an account?" },
    switchRegister: { ar: "أنشئ حساباً مجانياً", en: "Create a free account" },
    switchLogin: { ar: "سجّل الدخول", en: "Sign in" },
    termsNote: {
      ar: "بالمتابعة، فأنت توافق على شروط الاستخدام وتقرّ بأن التداول ينطوي على خطر فقدان رأس المال.",
      en: "By continuing, you agree to the Terms of Use and acknowledge that trading carries the risk of capital loss.",
    },
    joinTelegram: {
      ar: "انضمّ إلى مجتمع تيليجرام",
      en: "Join our Telegram Community",
    },
    riskDisclosure: {
      ar: "التداول في سوق الفوركس والأسواق المالية يحمل مخاطر عالية وقد يؤدي إلى فقدان جزء كبير أو كامل من رأس المال المستثمر. الأداء السابق للبوت أو المنصة ليس ضماناً للنتائج المستقبلية. W Forex Bot منصّة تقنية ولا تضمن الأرباح.",
      en: "Trading in Forex and financial markets carries high risk and may result in the loss of part or all of the invested capital. Past performance of the bot or platform does not guarantee future results. W Forex Bot is a technology platform and does not guarantee profits.",
    },
    errors: {
      fillFields: {
        ar: "يرجى إدخال البريد الإلكتروني وكلمة المرور",
        en: "Please enter your email and password",
      },
      shortPassword: {
        ar: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
        en: "Password must be at least 8 characters",
      },
      mustAcceptRisk: {
        ar: "يجب الموافقة على إقرار المخاطر للمتابعة",
        en: "You must accept the risk disclosure to continue",
      },
      emailRegistered: {
        ar: "هذا البريد مسجّل مسبقاً",
        en: "This email is already registered",
      },
      invalidCredentials: {
        ar: "بيانات الدخول غير صحيحة",
        en: "Invalid email or password",
      },
      unexpected: {
        ar: "حدث خطأ غير متوقع. حاول مرة أخرى.",
        en: "An unexpected error occurred. Please try again.",
      },
    },
  },

  /* ---------- Dashboard / Topbar ---------- */
  topbar: {
    connected: { ar: "متصل", en: "Connected" },
    notifications: { ar: "الإشعارات", en: "Notifications" },
    logout: { ar: "تسجيل الخروج", en: "Log out" },
    guest: { ar: "زائر", en: "Guest" },
    user: { ar: "مستخدم", en: "User" },
    tradingTerminal: { ar: "غرفة التداول", en: "Trading Terminal" },
  },

  /* ---------- Legal pages ---------- */
  legal: {
    backHome: { ar: "العودة للرئيسية", en: "Back to home" },
    lastUpdated: { ar: "آخر تحديث", en: "Last updated" },
    terms: {
      title: { ar: "شروط الخدمة", en: "Terms of Service" },
      intro: {
        ar: "يرجى قراءة هذه الشروط بعناية قبل استخدام منصة WForexBot. باستخدامك للموقع أو الخدمات فإنك توافق على الالتزام بهذه الشروط كاملةً.",
        en: "Please read these terms carefully before using the WForexBot platform. By accessing the website or services you agree to be fully bound by these terms.",
      },
    },
    privacy: {
      title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
      intro: {
        ar: "نحن في WForexBot نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضّح هذه السياسة المعلومات التي نجمعها وكيفية استخدامها وحمايتها.",
        en: "At WForexBot we respect your privacy and are committed to protecting your personal data. This policy explains what information we collect and how we use and safeguard it.",
      },
    },
    disclaimer: {
      title: { ar: "إخلاء المسؤولية", en: "Risk Disclaimer" },
      intro: {
        ar: "ينطوي التداول في الفوركس والأسواق المالية على مستوى عالٍ من المخاطر وقد لا يكون مناسباً لجميع المستثمرين.",
        en: "Trading in forex and financial markets involves a high level of risk and may not be suitable for all investors.",
      },
    },
    about: {
      title: { ar: "من نحن", en: "About Us" },
      intro: {
        ar: "WForexBot هي منصة تداول ذكية تعمل بالذكاء الاصطناعي، صُمّمت لتمكين المتداولين من تحقيق نتائج ثابتة في سوق الفوركس.",
        en: "WForexBot is an AI-powered smart trading platform designed to help traders achieve consistent results in the forex market.",
      },
    },
  },
} as const;

export type Dictionary = typeof dictionary;
