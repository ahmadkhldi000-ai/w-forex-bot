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
    /* MT5 connect button */
    connectMT5: { ar: "ربط حساب MT5", en: "Connect MT5" },
    manageMT5: { ar: "إدارة الحساب", en: "Manage Account" },
    mt5Connected: { ar: "متصل", en: "Connected" },
    mt5Disconnected: { ar: "غير متصل", en: "Disconnected" },
    mt5Connecting: { ar: "جارٍ الاتصال", en: "Connecting" },
    mt5Login: { ar: "الحساب", en: "Account" },
  },

  /* ---------- Dashboard page (full bilingual) ---------- */
  dashboard: {
    /* Sidebar nav */
    sidebar: {
      workspace: { ar: "مساحة العمل", en: "Workspace" },
      dashboard: { ar: "لوحة التحكم", en: "Dashboard" },
      liveTrading: { ar: "التداول المباشر", en: "Live Trading" },
      analytics: { ar: "التحليلات", en: "Analytics" },
      strategies: { ar: "الاستراتيجيات", en: "Strategies" },
      tradeHistory: { ar: "سجل الصفقات", en: "Trade History" },
      subscription: { ar: "الاشتراك", en: "Subscription" },
      settings: { ar: "الإعدادات", en: "Settings" },
      terminal: { ar: "غرفة التداول", en: "Trading Terminal" },
      close: { ar: "إغلاق القائمة", en: "Close menu" },
      open: { ar: "فتح القائمة", en: "Open menu" },
    },
    /* Welcome header */
    welcome: {
      greeting: { ar: "أهلاً", en: "Welcome" },
      subtitleOwnerConnected: {
        ar: "متصل بحساب الماستر. الأرقام الحقيقية معروضة لحظياً.",
        en: "Connected to the master account. Live numbers are shown.",
      },
      subtitleOwnerOfflineConfigured: {
        ar: "حساب الماستر مُعدّ لكن غير متصل حالياً. الأرقام ستظهر لحظة الاتصال.",
        en: "Master account is configured but offline. Numbers will appear on connect.",
      },
      subtitleOwnerNotConfigured: {
        ar: "لم يتم ربط حساب الماستر بعد. اذهب إلى لوحة المالك لربط حساب MT5.",
        en: "No master account linked yet. Open the owner panel to link MT5.",
      },
      subtitleUser: {
        ar: "مرحباً بك في غرفة التداول. تابع الأرقام والصفقات المباشرة من هنا.",
        en: "Welcome to the trading terminal. Track live numbers and trades here.",
      },
      ctaPrimary: { ar: "فتح التداول المباشر", en: "Open live trading" },
      ctaSecondary: { ar: "عرض التحليلات", en: "View analytics" },
    },
    /* Stat cards */
    stats: {
      balance: { ar: "رصيد الحساب", en: "Account Balance" },
      todayPnl: { ar: "ربح/خسارة اليوم", en: "Today's P/L" },
      winRate: { ar: "نسبة النجاح", en: "Win Rate" },
      profitFactor: { ar: "عامل الربح", en: "Profit Factor" },
    },
    /* Equity chart */
    equity: {
      title: { ar: "منحنى رأس المال", en: "Equity Curve" },
      point: { ar: "نقطة", en: "point" },
    },
    /* Positions table */
    positions: {
      title: { ar: "المراكز المفتوحة", en: "Open Positions" },
      pair: { ar: "الزوج", en: "Pair" },
      side: { ar: "الاتجاه", en: "Side" },
      size: { ar: "الحجم", en: "Size" },
      entry: { ar: "الدخول", en: "Entry" },
      price: { ar: "السعر", en: "Price" },
      pl: { ar: "الربح/الخسارة", en: "P/L" },
      pips: { ar: "نقطة", en: "pips" },
      buy: { ar: "شراء", en: "Buy" },
      sell: { ar: "بيع", en: "Sell" },
      empty: { ar: "لا توجد مراكز مفتوحة", en: "No open positions" },
      emptyHint: {
        ar: "ستظهر المراكز هنا فور فتحها على حساب MT5.",
        en: "Positions will appear here as soon as they open on MT5.",
      },
    },
    /* Recent trades */
    recent: {
      title: { ar: "آخر الصفقات", en: "Recent Trades" },
      empty: { ar: "لا توجد صفقات بعد", en: "No trades yet" },
      emptyHint: {
        ar: "ستظهر الصفقات المنفّذة هنا فور حدوثها.",
        en: "Executed trades will appear here in real time.",
      },
      now: { ar: "الآن", en: "now" },
      min: { ar: "د", en: "m" },
      hr: { ar: "س", en: "h" },
    },
    /* Allocation donut */
    allocation: {
      title: { ar: "توزيع المراكز", en: "Allocation" },
      empty: { ar: "لا توجد مراكز", en: "No positions" },
      total: { ar: "الإجمالي", en: "Total" },
    },
    /* Master status banner (owner only) */
    master: {
      connected: {
        ar: "حساب الماستر متصل مباشرة",
        en: "Master account is live",
      },
      connectedHint: {
        ar: "جميع الأرقام في اللوحة محدّثة لحظياً من MT5.",
        en: "All dashboard figures stream live from MT5.",
      },
      offline: {
        ar: "حساب الماستر غير متصل",
        en: "Master account offline",
      },
      offlineHint: {
        ar: "آخر تحديث معروض حتى إعادة الاتصال.",
        en: "Showing last known values until reconnect.",
      },
      notConfigured: {
        ar: "لم يتم ربط حساب الماستر",
        en: "Master account not linked",
      },
      notConfiguredHint: {
        ar: "اذهب إلى لوحة المالك لربط حساب MT5.",
        en: "Open the owner panel to link an MT5 account.",
      },
      lastUpdate: { ar: "آخر تحديث", en: "Last update" },
    },
    /* Quick links */
    quick: {
      liveTradingTitle: { ar: "وحدة التداول المباشر", en: "Live Trading" },
      liveTradingDesc: {
        ar: "راقب الصفقات وفتح وإغلاق المراكز لحظياً",
        en: "Monitor trades and open/close positions in real time",
      },
      strategiesTitle: { ar: "الاستراتيجيات", en: "Strategies" },
      strategiesDesc: {
        ar: "خصّص استراتيجية الروبوت ومعاملات المخاطرة",
        en: "Customize the bot strategy and risk parameters",
      },
      settingsTitle: { ar: "إعدادات الحساب", en: "Account Settings" },
      settingsDesc: {
        ar: "إدارة الحساب، الأمان، والربط مع MT5",
        en: "Manage account, security, and MT5 connection",
      },
    },
  },

  /* ---------- Trading: Connect Account dialog ---------- */
  trading: {
    connectDialog: {
      /* header */
      titleConnected: { ar: "حساب متصل", en: "Account connected" },
      titleDefault: { ar: "ربط حساب MT5", en: "Connect MT5 account" },
      subtitleEnter: { ar: "أدخل بيانات حساب MetaTrader 5", en: "Enter your MetaTrader 5 account details" },
      /* aria / close */
      closeAria: { ar: "إغلاق", en: "Close" },
      /* success overlay */
      successTitle: { ar: "تم الاتصال بنجاح!", en: "Connected successfully!" },
      successHint: { ar: "جارٍ مزامنة بيانات الحساب…", en: "Syncing account data…" },
      /* status banners */
      connectingToServer: { ar: "جارٍ الاتصال بالخادم…", en: "Connecting to server…" },
      disconnectedHint: { ar: "الحساب غير متصل — أدخل بياناتك للاتصال", en: "Account is not connected — enter your details to connect" },
      /* fields */
      fields: {
        label: { ar: "الاسم التعريفي", en: "Display name" },
        labelHint: { ar: "اختياري", en: "Optional" },
        labelPlaceholder: { ar: "مثال: حسابي الرئيسي", en: "e.g. My main account" },
        login: { ar: "رقم الدخول (Login)", en: "Login" },
        server: { ar: "الخادم (Server)", en: "Server" },
        password: { ar: "كلمة المرور", en: "Password" },
        currency: { ar: "العملة", en: "Currency" },
        leverage: { ar: "الرافعة المالية", en: "Leverage" },
      },
      /* password visibility aria */
      hidePasswordAria: { ar: "إخفاء كلمة المرور", en: "Hide password" },
      showPasswordAria: { ar: "إظهار كلمة المرور", en: "Show password" },
      /* backend status indicator */
      status: {
        serverConnected: { ar: "الخادم متصل", en: "Server online" },
        serverConnectedHint: { ar: "— سيتم ربط حسابك فعلياً عبر الجسر", en: "— your account will be linked for real through the bridge" },
        demoMode: { ar: "وضع تجريبي", en: "Demo mode" },
        demoModeHint: { ar: "— الخادم غير متاح؛ سيُحفظ الحساب محلياً حتى تشغيل الـ VPS", en: "— server unavailable; account will be saved locally until the VPS is started" },
      },
      /* security note */
      securityNote: {
        ar: "تُخزَّن بياناتك بشكل مشفّر على جهازك فقط. لا تُرسَل كلمة المرور إلى أي خادم خارجي، وتُستخدم حصراً للاتصال بخادم MT5 الخاص بك عبر الجسر الآمن.",
        en: "Your data is stored encrypted on your device only. Your password is never sent to any external server and is used solely to connect to your own MT5 server through the secure bridge.",
      },
      /* action buttons */
      buttons: {
        connecting: { ar: "جارٍ الاتصال…", en: "Connecting…" },
        reconnect: { ar: "إعادة الاتصال", en: "Reconnect" },
        connect: { ar: "اتصال", en: "Connect" },
        delete: { ar: "حذف", en: "Delete" },
        disconnect: { ar: "قطع الاتصال", en: "Disconnect" },
        deleteAccount: { ar: "حذف الحساب", en: "Delete account" },
      },
      /* connected view summary */
      labels: {
        name: { ar: "الاسم", en: "Name" },
        currency: { ar: "العملة", en: "Currency" },
        leverage: { ar: "الرافعة", en: "Leverage" },
        lastConnection: { ar: "آخر اتصال", en: "Last connection" },
      },
      now: { ar: "الآن", en: "Now" },
      /* confirm dialog */
      confirmDelete: {
        ar: "هل أنت متأكد من حذف حساب MT5؟ سيتم مسح البيانات نهائياً.",
        en: "Are you sure you want to delete this MT5 account? All data will be permanently erased.",
      },
      /* default account label prefix (used in `حساب #${login}`) */
      accountLabel: { ar: "حساب", en: "Account" },
      /* errors */
      errors: {
        fillFields: { ar: "الرجاء تعبئة رقم الدخول والخادم وكلمة المرور", en: "Please fill in the login, server, and password" },
        sessionExpired: { ar: "انتهت الجلسة — سجّل الدخول مجدداً ثم أعد المحاولة", en: "Session expired — please sign in again and retry" },
        noPermission: { ar: "ليس لديك صلاحية لإدارة حسابات MT5", en: "You do not have permission to manage MT5 accounts" },
        serverError: { ar: "خطأ من الخادم", en: "Server error" },
        cannotReachServer: { ar: "تعذّر الوصول إلى الخادم", en: "Could not reach the server" },
        cannotConnect: { ar: "تعذّر الاتصال بالخادم — تحقّق من البيانات", en: "Could not connect to the server — please check your details" },
      },
    },
  },

  /* ---------- Strategies page ---------- */
  strategies: {
    /* header */
    title: { ar: "الاستراتيجيات", en: "Strategies" },
    subtitle: {
      ar: "أدِر استراتيجيات وقوالب روبوت التداول الخاص بك.",
      en: "Manage your trading bot strategies and templates.",
    },
    newStrategy: { ar: "استراتيجية جديدة", en: "New Strategy" },

    /* summary tiles */
    active: { ar: "نشطة", en: "Active" },
    paused: { ar: "متوقفة", en: "Paused" },
    totalPnl: { ar: "إجمالي الربح/الخسارة", en: "Total P&L" },
    totalTrades: { ar: "إجمالي الصفقات", en: "Total Trades" },

    /* filter tabs */
    filters: {
      all: { ar: "الكل", en: "all" },
      running: { ar: "تعمل", en: "running" },
      paused: { ar: "متوقفة", en: "paused" },
      idle: { ar: "خاملة", en: "idle" },
    },

    /* templates section */
    templatesTitle: { ar: "قوالب الاستراتيجيات", en: "Strategy Templates" },

    /* template descriptions keyed by template id */
    templateDescriptions: {
      scalperPro: {
        ar: "تداول سريع على فريم M1-M5",
        en: "Fast scalping on the M1-M5 timeframe",
      },
      trendRider: {
        ar: "متابعة الاتجاه بـ EMA crossover",
        en: "Follow the trend with EMA crossover",
      },
      gridMaster: {
        ar: "شبكة أوامر متدرجة",
        en: "Stepped grid of orders",
      },
      rangeHunter: {
        ar: "انعكاسات في النطاقات الجانبية",
        en: "Reversals inside sideways ranges",
      },
    },

    /* strategy card */
    card: {
      status: {
        running: { ar: "تعمل", en: "Running" },
        paused: { ar: "متوقفة", en: "Paused" },
        idle: { ar: "خاملة", en: "Idle" },
      },
      metrics: {
        winRate: { ar: "نسبة النجاح", en: "Win Rate" },
        trades: { ar: "الصفقات", en: "Trades" },
        runtime: { ar: "مدة التشغيل", en: "Runtime" },
      },
      risk: { ar: "المخاطرة", en: "Risk" },
      riskLevels: {
        low: { ar: "منخفضة", en: "low" },
        medium: { ar: "متوسطة", en: "medium" },
        high: { ar: "عالية", en: "high" },
      },
      pause: { ar: "إيقاف", en: "Pause" },
      start: { ar: "تشغيل", en: "Start" },
    },

    /* tier badges */
    tiers: {
      starter: { ar: "المبتدئ", en: "Starter" },
      pro: { ar: "احترافي", en: "Pro" },
      elite: { ar: "النخبة", en: "Elite" },
    },
  },

  /* ---------- Admin pages ---------- */
  admin: {
    /* shared */
    common: {
      cancel: { ar: "إلغاء", en: "Cancel" },
      save: { ar: "حفظ", en: "Save" },
      copy: { ar: "نسخ", en: "Copy" },
      export: { ar: "تصدير", en: "Export" },
      exportCsv: { ar: "تصدير CSV", en: "Export CSV" },
      delete: { ar: "حذف", en: "Delete" },
      more: { ar: "المزيد", en: "More" },
      search: { ar: "بحث", en: "Search" },
      all: { ar: "الكل", en: "All" },
      now: { ar: "الآن", en: "Now" },
      active: { ar: "نشط", en: "Active" },
      trial: { ar: "تجريبي", en: "Trial" },
      suspended: { ar: "موقوف", en: "Suspended" },
      agoMin: { ar: "دقيقة", en: "min" },
      agoMinutes: { ar: "دقيقة", en: "minutes" },
      agoHours: { ar: "ساعة", en: "hours" },
      agoDays: { ar: "يوم", en: "days" },
      agoM: { ar: "د", en: "m" },
      agoH: { ar: "س", en: "h" },
      agoD: { ar: "ي", en: "d" },
      before: { ar: "قبل", en: "ago" },
      connected: { ar: "متصل", en: "Connected" },
    },

    /* admin/page.tsx — overview */
    dashboard: {
      title: { ar: "نظرة عامة", en: "Overview" },
      statTotalUsers: { ar: "إجمالي المستخدمين", en: "Total users" },
      statActiveSubs: { ar: "اشتراكات نشطة", en: "Active subscriptions" },
      statTotalRevenue: { ar: "إجمالي الإيرادات", en: "Total revenue" },
      statTodayTrades: { ar: "صفقات اليوم", en: "Today's trades" },
      logCreate: { ar: "إضافة حساب", en: "Add account" },
      logDelete: { ar: "حذف حساب", en: "Delete account" },
      logUpdate: { ar: "تحديث", en: "Update" },
      logMt5Action: { ar: "إجراء MT5", en: "MT5 action" },
      logLogin: { ar: "تسجيل دخول", en: "Login" },
      logLogout: { ar: "تسجيل خروج", en: "Logout" },
      log2faEnabled: { ar: "تفعيل المصادقة الثنائية", en: "Enable two-factor auth" },
      log2faDisabled: { ar: "إلغاء المصادقة الثنائية", en: "Disable two-factor auth" },
      logSettingsChange: { ar: "تغيير الإعدادات", en: "Settings change" },
      logFailedLogin: { ar: "محاولة دخول فاشلة", en: "Failed login" },
      welcome: { ar: "مرحباً، Super Admin 👋", en: "Welcome, Super Admin 👋" },
      subtitle: { ar: "لوحة تحكم إدارة المنصة — آخر تحديث: الآن", en: "Platform admin console — Last update: now" },
      systemRunning: { ar: "النظام يعمل", en: "System running" },
      activeAccount: { ar: "الحساب النشط", en: "Active account" },
      masterAccount: { ar: "الحساب الرئيسي", en: "Master account" },
      equity: { ar: "السيولة", en: "Equity" },
      leverage: { ar: "الرافعة", en: "Leverage" },
      currency: { ar: "العملة", en: "Currency" },
      noActiveAccount: { ar: "لا يوجد حساب نشط", en: "No active account" },
      noMasterAccount: { ar: "لا يوجد حساب رئيسي", en: "No master account" },
      mt5Summary: { ar: "ملخص MT5", en: "MT5 summary" },
      totalAccounts: { ar: "إجمالي الحسابات", en: "Total accounts" },
      connectedAccounts: { ar: "حسابات متصلة", en: "Connected accounts" },
      totalEquity: { ar: "إجمالي السيولة", en: "Total equity" },
      twoFA: { ar: "المصادقة الثنائية", en: "Two-factor auth" },
      twoFAEnabled: { ar: "مفعّلة", en: "Enabled" },
      recentActivity: { ar: "آخر النشاطات", en: "Recent activity" },
      noActivity: { ar: "لا يوجد نشاط مسجّل", en: "No recorded activity" },
    },

    /* admin/settings/page.tsx */
    settings: {
      title: { ar: "إعدادات النظام", en: "System settings" },
      tabGeneral: { ar: "عام", en: "General" },
      tabFeatures: { ar: "الميزات", en: "Features" },
      tabNotifications: { ar: "الإشعارات", en: "Notifications" },
      tabApi: { ar: "API & ويبهوك", en: "API & Webhooks" },
      saveChanges: { ar: "حفظ التغييرات", en: "Save changes" },
      platformInfoTitle: { ar: "معلومات المنصة", en: "Platform information" },
      platformInfoDesc: { ar: "الإعدادات العامة للمنصة", en: "General platform settings" },
      platformName: { ar: "اسم المنصة", en: "Platform name" },
      officialEmail: { ar: "البريد الرسمي", en: "Official email" },
      baseCurrency: { ar: "العملة الأساسية", en: "Base currency" },
      timezone: { ar: "المنطقة الزمنية", en: "Timezone" },
      signupTitle: { ar: "إعدادات التسجيل", en: "Registration settings" },
      signupDesc: { ar: "تحكم في تسجيل المستخدمين الجدد", en: "Control new user registration" },
      allowSignup: { ar: "السماح بالتسجيل الجديد", en: "Allow new sign-ups" },
      allowSignupDesc: { ar: "تمكين تسجيل حسابات جديدة", en: "Enable creating new accounts" },
      emailVerification: { ar: "التحقق من البريد الإلكتروني", en: "Email verification" },
      emailVerificationDesc: { ar: "إرسال رابط تأكيد بعد التسجيل", en: "Send a confirmation link after sign-up" },
      manualApproval: { ar: "الموافقة اليدوية", en: "Manual approval" },
      manualApprovalDesc: { ar: "مراجعة كل حساب جديد قبل التفعيل", en: "Review each new account before activation" },
      lockSignup: { ar: "قفل التسجيل", en: "Lock sign-up" },
      lockSignupDesc: { ar: "منع إنشاء حسابات جديدة مؤقتاً", en: "Temporarily block creating new accounts" },
      featuresTitle: { ar: "ميزات المنصة", en: "Platform features" },
      featuresDesc: { ar: "تفعيل أو تعطيل ميزات المنصة", en: "Enable or disable platform features" },
      autoTrading: { ar: "التداول الآلي", en: "Automated trading" },
      autoTradingDesc: { ar: "السماح بتشغيل بوتات التداول", en: "Allow running trading bots" },
      copyTrading: { ar: "نسخ الصفقات (Copy Trading)", en: "Copy Trading" },
      copyTradingDesc: { ar: "متابعة حسابات المتداولين المحترفين", en: "Follow professional trader accounts" },
      aiSignals: { ar: "إشارات الذكاء الاصطناعي", en: "AI signals" },
      aiSignalsDesc: { ar: "توصيات التداول المدعومة بالذكاء الاصطناعي", en: "AI-backed trading recommendations" },
      maintenanceMode: { ar: "وضع الصيانة", en: "Maintenance mode" },
      maintenanceModeDesc: { ar: "إيقاف المنصة مؤقتاً للصيانة", en: "Temporarily pause the platform for maintenance" },
      demoOnly: { ar: "الوضع التجريبي فقط", en: "Demo-only mode" },
      demoOnlyDesc: { ar: "تقييد كل المستخدمين على الحسابات التجريبية", en: "Restrict all users to demo accounts" },
      notificationsTitle: { ar: "إشعارات النظام", en: "System notifications" },
      notificationsDesc: { ar: "إعدادات الإشعارات للمشرفين", en: "Notification settings for admins" },
      notifCol: { ar: "الإشعار", en: "Notification" },
      notifEmail: { ar: "بريد", en: "Email" },
      notifPush: { ar: "دفع", en: "Push" },
      notifNewUser: { ar: "مستخدم جديد", en: "New user" },
      notifNewUserDesc: { ar: "عند تسجيل حساب جديد", en: "When a new account is created" },
      notifPayment: { ar: "دفعة جديدة", en: "New payment" },
      notifPaymentDesc: { ar: "عند نجاح عملية دفع", en: "When a payment succeeds" },
      notifSubCancel: { ar: "إلغاء اشتراك", en: "Subscription canceled" },
      notifSubCancelDesc: { ar: "عند إلغاء عضوية", en: "When a membership is canceled" },
      notifBotError: { ar: "خطأ في البوت", en: "Bot error" },
      notifBotErrorDesc: { ar: "عند توقف بوت بسبب خطأ", en: "When a bot stops due to an error" },
      notifHighLoad: { ar: "حمل عالٍ", en: "High load" },
      notifHighLoadDesc: { ar: "عند تجاوز استخدام الخادم 80%", en: "When server usage exceeds 80%" },
      notifSecurity: { ar: "تنبيه أمني", en: "Security alert" },
      notifSecurityDesc: { ar: "محاولات دخول مشبوهة", en: "Suspicious login attempts" },
      apiKeysTitle: { ar: "مفاتيح API", en: "API keys" },
      apiKeysDesc: { ar: "مفاتيح الوصول البرمجي للمنصة", en: "Programmatic access keys for the platform" },
      publicKey: { ar: "مفتاح عام (Public Key)", en: "Public Key" },
      secretKey: { ar: "مفتاح سري (Secret Key)", en: "Secret Key" },
      generateKey: { ar: "توليد مفتاح جديد", en: "Generate new key" },
      webhookTitle: { ar: "ويبهوك (Webhook)", en: "Webhook" },
      webhookDesc: { ar: "استقبل إشعارات الأحداث على خادمك", en: "Receive event notifications on your server" },
      webhookUrl: { ar: "رابط الويبهوك", en: "Webhook URL" },
      webhookUrlHint: { ar: "سيتم إرسال طلب POST لكل حدث", en: "A POST request will be sent for each event" },
      paymentEvents: { ar: "أحداث الدفع", en: "Payment events" },
      subscriptionEvents: { ar: "أحداث الاشتراك", en: "Subscription events" },
      userEvents: { ar: "أحداث المستخدمين", en: "User events" },
    },

    /* admin/users/page.tsx */
    users: {
      title: { ar: "إدارة المستخدمين", en: "User management" },
      totalUsers: { ar: "إجمالي المستخدمين", en: "Total users" },
      subscribers: { ar: "المشتركون", en: "Subscribers" },
      newUser: { ar: "مستخدم جديد", en: "New user" },
      searchPlaceholder: { ar: "بحث بالاسم، البريد، أو المعرف...", en: "Search by name, email, or ID..." },
      allPlans: { ar: "كل الباقات", en: "All plans" },
      allStatuses: { ar: "كل الحالات", en: "All statuses" },
      thUser: { ar: "المستخدم", en: "User" },
      thPlan: { ar: "الباقة", en: "Plan" },
      thStatus: { ar: "الحالة", en: "Status" },
      thBots: { ar: "البوتات", en: "Bots" },
      thCountry: { ar: "الدولة", en: "Country" },
      thMrr: { ar: "MRR", en: "MRR" },
      thJoined: { ar: "انضم", en: "Joined" },
      actionMessage: { ar: "مراسلة", en: "Message" },
      actionActivate: { ar: "تفعيل", en: "Activate" },
      actionSuspend: { ar: "إيقاف", en: "Suspend" },
      noMatches: { ar: "لا يوجد مستخدمون مطابقون", en: "No matching users" },
      showing: { ar: "عرض", en: "Showing" },
      of: { ar: "من", en: "of" },
      usersWord: { ar: "مستخدم", en: "users" },
    },

    /* admin/mt5-accounts/page.tsx */
    mt5Accounts: {
      title: { ar: "إدارة حسابات MT5", en: "MT5 account management" },
      heading: { ar: "حسابات MetaTrader 5", en: "MetaTrader 5 accounts" },
      accountsCount: { ar: "حسابات", en: "accounts" },
      tileActive: { ar: "الحساب النشط", en: "Active account" },
      none: { ar: "لا يوجد", en: "None" },
      systemRule: { ar: "قاعدة النظام:", en: "System rule:" },
      activeWord: { ar: "نشط", en: "active" },
      activeConnector: { ar: "للتداول، وحساب واحد فقط", en: "for trading, and only one" },
      masterWord: { ar: "رئيسي", en: "master" },
      copyTradingSource: { ar: "لمصدر الـ Copy-Trading — يتم تطبيقها تلقائياً.", en: "for the Copy-Trading source — applied automatically." },
      addAccount: { ar: "إضافة حساب", en: "Add account" },
      tileMaster: { ar: "الحساب الرئيسي", en: "Master account" },
      undefined_: { ar: "غير محدد", en: "Not set" },
      tileConnected: { ar: "متصل", en: "Connected" },
      mt5AccountsSub: { ar: "حسابات MT5", en: "MT5 accounts" },
      tileTotalEquity: { ar: "إجمالي السيولة", en: "Total equity" },
      ruleBanner: { ar: "يتم فرض قواعد الحساب الواحد نشط والحساب الواحد رئيسي على مستوى قاعدة البيانات باستخدام المعاملات (Transactions). لا يمكن لأي عملية أن تكسر هذه القاعدة.", en: "The one-active and one-master account rules are enforced at the database level using transactions. No operation can break this rule." },
      noAccounts: { ar: "لا توجد حسابات مسجّلة بعد", en: "No accounts registered yet" },
      addFirstAccount: { ar: "إضافة أول حساب", en: "Add first account" },
      deleteTitle: { ar: "حذف حساب MT5", en: "Delete MT5 account" },
      deleteMessage: { ar: "هل أنت متأكد من حذف الحساب", en: "Are you sure you want to delete account" },
      deleteMsgNoUndo: { ar: "؟ لا يمكن التراجع عن هذا الإجراء.", en: "? This action cannot be undone." },
      deletePermanent: { ar: "حذف نهائي", en: "Delete permanently" },
      activeWarn: { ar: "هذا هو الحساب النشط حالياً — سيتم إيقاف التداول فوراً بعد الحذف.", en: "This is the currently active account — trading will stop immediately after deletion." },
      masterWarn: { ar: "هذا هو الحساب الرئيسي — سيتم إيقاف Copy-Trading بعد الحذف.", en: "This is the master account — Copy-Trading will stop after deletion." },
      balance: { ar: "الرصيد:", en: "Balance:" },
      server: { ar: "الخادم:", en: "Server:" },
      activateTitle: { ar: "تنشيط حساب للتداول", en: "Activate account for trading" },
      activateMessage: { ar: "سيتم تنشيط الحساب", en: "Account will be activated" },
      activateMsgRest: { ar: "كحساب التداول النشط. سيتم إلغاء تنشيط أي حساب نشط آخر تلقائياً.", en: "as the active trading account. Any other active account will be deactivated automatically." },
      activateBtn: { ar: "تنشيط", en: "Activate" },
      changeMasterTitle: { ar: "تغيير الحساب الرئيسي", en: "Change master account" },
      changeMasterMessage: { ar: "سيتم تعيين الحساب", en: "Account will be set" },
      changeMasterMsgRest: { ar: "كحساب رئيسي لمصدر Copy-Trading. سيتم إلغاء تعيين الحساب الرئيسي الحالي تلقائياً.", en: "as the master account for the Copy-Trading source. The current master account will be unset automatically." },
      setMaster: { ar: "تعيين كرئيسي", en: "Set as master" },
    },

    /* admin/payments/page.tsx */
    payments: {
      title: { ar: "المدفوعات", en: "Payments" },
      totalRevenue: { ar: "إجمالي الإيرادات", en: "Total revenue" },
      successRate: { ar: "معدل النجاح", en: "Success rate" },
      failedPayments: { ar: "مدفوعات فاشلة", en: "Failed payments" },
      refunded: { ar: "مبالغ مستردة", en: "Refunded" },
      searchPlaceholder: { ar: "بحث في المدفوعات...", en: "Search payments..." },
      statusSucceeded: { ar: "ناجح", en: "Succeeded" },
      statusFailed: { ar: "فاشل", en: "Failed" },
      statusPending: { ar: "قيد المعالجة", en: "Pending" },
      statusRefunded: { ar: "مسترد", en: "Refunded" },
      thId: { ar: "المعرف", en: "ID" },
      thUser: { ar: "المستخدم", en: "User" },
      thAmount: { ar: "المبلغ", en: "Amount" },
      thMethod: { ar: "طريقة الدفع", en: "Method" },
      thStatus: { ar: "الحالة", en: "Status" },
      thDate: { ar: "التاريخ", en: "Date" },
      noMatches: { ar: "لا توجد مدفوعات مطابقة", en: "No matching payments" },
    },

    /* admin/logs/page.tsx */
    logs: {
      title: { ar: "سجلّات النشاط", en: "Activity logs" },
      heading: { ar: "سجلّات النشاط", en: "Activity logs" },
      subtitle: { ar: "حدث · سجلّ كامل لجميع العمليات الحسّاسة في النظام", en: "events · Complete log of all sensitive operations in the system" },
      searchPlaceholder: { ar: "بحث في السجلّات…", en: "Search logs…" },
      noMatches: { ar: "لا توجد سجلّات مطابقة", en: "No matching logs" },
      filterAll: { ar: "الكل", en: "All" },
      filterCreate: { ar: "إضافة", en: "Create" },
      filterDelete: { ar: "حذف", en: "Delete" },
      filterLogin: { ar: "دخول", en: "Login" },
      filterFailed: { ar: "محاولات فاشلة", en: "Failed attempts" },
      descCreate: { ar: "أضاف حساب", en: "Added account" },
      descEdit: { ar: "عدّل", en: "Edited" },
      descDelete: { ar: "حذف", en: "Deleted" },
      descSetActive: { ar: "نشّط حساب", en: "Activated account" },
      descSetMaster: { ar: "عيّن", en: "Set" },
      descSetMasterRest: { ar: "كحساب رئيسي", en: "as master account" },
      descConnect: { ar: "اتصل بـ", en: "Connected to" },
      descDisconnect: { ar: "قطع اتصال", en: "Disconnected" },
      descMt5Fallback: { ar: "إجراء MT5", en: "MT5 action" },
      desc2faEnabled: { ar: "فعّل المصادقة الثنائية", en: "Enabled two-factor auth" },
      desc2faDisabled: { ar: "عطّل المصادقة الثنائية", en: "Disabled two-factor auth" },
      descLogin: { ar: "تسجيل دخول", en: "Login" },
      descLoginFallback: { ar: "كلمة مرور + 2FA", en: "Password + 2FA" },
      descFailedLogin: { ar: "محاولة دخول فاشلة", en: "Failed login attempt" },
      descSettingsChange: { ar: "غيّر الإعداد", en: "Changed setting" },
    },

    /* admin/subscriptions/page.tsx */
    subscriptions: {
      title: { ar: "إدارة الاشتراكات", en: "Subscription management" },
      totalMrr: { ar: "MRR الإجمالي", en: "Total MRR" },
      activeSubscriber: { ar: "مشترك نشط", en: "Active subscriber" },
      trial: { ar: "تجريبي", en: "Trial" },
      churnRate: { ar: "معدل التسرب", en: "Churn rate" },
      searchPlaceholder: { ar: "بحث في الاشتراكات...", en: "Search subscriptions..." },
      thSubscriber: { ar: "المشترك", en: "Subscriber" },
      thPlan: { ar: "الباقة", en: "Plan" },
      thStatus: { ar: "الحالة", en: "Status" },
      thStarted: { ar: "بدأ في", en: "Started" },
      thRenews: { ar: "يتجدد في", en: "Renews" },
      subscribersWord: { ar: "مشترك", en: "subscribers" },
      perMonth: { ar: "شهر", en: "month" },
      share: { ar: "الحصة", en: "Share" },
      statusActive: { ar: "نشط", en: "Active" },
      statusCanceled: { ar: "ملغى", en: "Canceled" },
      statusPastDue: { ar: "متأخر الدفع", en: "Past due" },
      statusTrialing: { ar: "تجريبي", en: "Trialing" },
    },

    /* admin/reports/page.tsx */
    reports: {
      title: { ar: "التقارير والتحليلات", en: "Reports & analytics" },
      performanceOverview: { ar: "نظرة عامة على الأداء", en: "Performance overview" },
      subtitle: { ar: "تحليلات النمو والإيرادات للمنصة", en: "Growth and revenue analytics for the platform" },
      newUsers: { ar: "مستخدمون جدد", en: "New users" },
      revenues: { ar: "الإيرادات", en: "Revenue" },
      trades: { ar: "الصفقات", en: "Trades" },
      retentionRate: { ar: "معدل الاحتفاظ", en: "Retention rate" },
      dailyRevenue: { ar: "الإيرادات اليومية", en: "Daily revenue" },
      lastRange: { ar: "آخر", en: "Last" },
      userGrowth: { ar: "نمو المستخدمين", en: "User growth" },
      userGrowthSubtitle: { ar: "إجمالي المستخدمين عبر الوقت", en: "Total users over time" },
      planDistribution: { ar: "توزيع الباقات", en: "Plan distribution" },
      planDistributionSubtitle: { ar: "المشتركون حسب الباقة", en: "Subscribers by plan" },
      symbolVolume: { ar: "حجم التداول حسب الرمز", en: "Trade volume by symbol" },
      symbolVolumeSubtitle: { ar: "أكثر الرموز تداولاً هذا الشهر", en: "Most traded symbols this month" },
      volumeWord: { ar: "حجم", en: "volume" },
      tradesWord: { ar: "صفقة", en: "trades" },
    },

    /* admin/security/page.tsx */
    security: {
      title: { ar: "الأمان", en: "Security" },
      heading: { ar: "أمان حساب الإدارة", en: "Admin account security" },
      protected: { ar: "محمي", en: "Protected" },
      exposed: { ar: "معرّض", en: "Exposed" },
      subtitle: { ar: "إعدادات حماية حساب الإدارة والوصول الحسّاس", en: "Admin account protection and sensitive access settings" },
      changePassword: { ar: "تغيير كلمة المرور", en: "Change password" },
      currentPassword: { ar: "كلمة المرور الحالية", en: "Current password" },
      newPassword: { ar: "كلمة المرور الجديدة", en: "New password" },
      confirmPassword: { ar: "تأكيد كلمة المرور", en: "Confirm password" },
      errTooShort: { ar: "كلمة المرور يجب أن تكون 8 أحرف على الأقل", en: "Password must be at least 8 characters" },
      errMismatch: { ar: "كلمتا المرور غير متطابقتين", en: "Passwords do not match" },
      okChanged: { ar: "تم تغيير كلمة المرور بنجاح", en: "Password changed successfully" },
      updatePassword: { ar: "تحديث كلمة المرور", en: "Update password" },
      activeSessions: { ar: "الجلسات النشطة", en: "Active sessions" },
      current: { ar: "الحالي", en: "Current" },
      logoutAll: { ar: "تسجيل خروج من جميع الأجهزة", en: "Log out of all devices" },
      loginHistory: { ar: "سجل تسجيل الدخول", en: "Login history" },
      loginSuccess: { ar: "تسجيل دخول ناجح", en: "Successful login" },
      logout: { ar: "تسجيل خروج", en: "Logout" },
      failedLogin: { ar: "محاولة دخول فاشلة", en: "Failed login attempt" },
      loginSuccess2fa: { ar: "تسجيل دخول ناجح (2FA)", en: "Successful login (2FA)" },
      agoMinute: { ar: "قبل دقيقة", en: "a minute ago" },
      agoTwoHours: { ar: "قبل ساعتين", en: "2 hours ago" },
      agoFiveHours: { ar: "قبل 5 ساعات", en: "5 hours ago" },
      agoThreeDays: { ar: "قبل 3 أيام", en: "3 days ago" },
      agoDay: { ar: "قبل يوم", en: "a day ago" },
      alertsTitle: { ar: "تنبيهات الأمان", en: "Security alerts" },
      alertNewDevice: { ar: "بريد إلكتروني عند تسجيل دخول من جهاز جديد", en: "Email on login from a new device" },
      alertFailedAttempts: { ar: "تنبيه فوري عند محاولة دخول فاشلة", en: "Instant alert on failed login attempt" },
      alertWeeklySummary: { ar: "إشعار أسبوعي بملخّص النشاط", en: "Weekly activity summary notification" },
      pwVeryWeak: { ar: "ضعيفة جداً", en: "Very weak" },
      pwWeak: { ar: "ضعيفة", en: "Weak" },
      pwMedium: { ar: "متوسطة", en: "Medium" },
      pwGood: { ar: "جيدة", en: "Good" },
      pwStrong: { ar: "قوية", en: "Strong" },
    },

    /* admin/bot/page.tsx */
    bot: {
      title: { ar: "البوت & MT5", en: "Bot & MT5" },
      serverStatus: { ar: "حالة الخادم", en: "Server status" },
      running: { ar: "يعمل", en: "Running" },
      activeBots: { ar: "البوتات النشطة", en: "Active bots" },
      of5: { ar: "من 5", en: "of 5" },
      cpuUsage: { ar: "استخدام CPU", en: "CPU usage" },
      average: { ar: "متوسط", en: "Average" },
      memory: { ar: "الذاكرة", en: "Memory" },
      of2gb: { ar: "من 2GB", en: "of 2GB" },
      mt5Connection: { ar: "اتصال MT5", en: "MT5 connection" },
      connected: { ar: "متصل", en: "Connected" },
      connServer: { ar: "الخادم", en: "Server" },
      latency: { ar: "زمن الاستجابة", en: "Latency" },
      lastSync: { ar: "آخر مزامنة", en: "Last sync" },
      lastSyncValue: { ar: "منذ 3 ثوانٍ", en: "3 seconds ago" },
      botInstances: { ar: "مثيلات البوت", en: "Bot instances" },
      newBot: { ar: "بوت جديد", en: "New bot" },
      statusRunning: { ar: "يعمل", en: "Running" },
      statusPaused: { ar: "متوقف", en: "Paused" },
      statusError: { ar: "خطأ", en: "Error" },
      metricTrades: { ar: "الصفقات", en: "Trades" },
      restart: { ar: "إعادة التشغيل", en: "Restart" },
      pause: { ar: "إيقاف مؤقت", en: "Pause" },
      start: { ar: "تشغيل", en: "Start" },
    },

    /* admin/auth/login/page.tsx */
    login: {
      backToSite: { ar: "العودة للموقع", en: "Back to site" },
      adminPanel: { ar: "لوحة الإدارة", en: "Admin panel" },
      twoFaTitle: { ar: "التحقق الثنائي (2FA)", en: "Two-factor verification (2FA)" },
      step1Subtitle: { ar: "منطقة محمية — للمصرّح لهم فقط", en: "Protected area — authorized personnel only" },
      step2Subtitle: { ar: "أدخل الرمز من تطبيق المصادقة", en: "Enter the code from your authenticator app" },
      emailPlaceholder: { ar: "البريد الإلكتروني للإدارة", en: "Admin email" },
      passwordPlaceholder: { ar: "كلمة المرور", en: "Password" },
      totpHint: { ar: "أدخل الرمز المكوّن من 6 أرقام من Google Authenticator", en: "Enter the 6-digit code from Google Authenticator" },
      verifying: { ar: "جاري التحقق...", en: "Verifying..." },
      continue_: { ar: "متابعة", en: "Continue" },
      enterPanel: { ar: "دخول لوحة الإدارة", en: "Enter admin panel" },
      attemptsNote: { ar: "🔒 جميع محاولات الدخول مسجّلة. يُسمح بـ 5 محاولات فقط قبل القفل لمدة 30 دقيقة.", en: "🔒 All login attempts are logged. Only 5 attempts allowed before a 30-minute lockout." },
    },
  },

  /* ---------- Owner pages ---------- */
  owner: {
    /* owner/page.tsx — passcode gate */
    gate: {
      lockedOut: { ar: "تم تجاوز عدد المحاولات المسموح. تم قفل البوابة مؤقتاً.", en: "Maximum attempts exceeded. The gate is temporarily locked." },
      wrongCode: { ar: "رمز الدخول غير صحيح. المحاولات المتبقية:", en: "Incorrect passcode. Attempts remaining:" },
      accessDenied: { ar: "الوصول مرفوض", en: "Access denied" },
      deniedBody: { ar: "حساب الماستر متاح فقط لمالك المنصّة. حسابك الحالي لا يملك صلاحية الوصول إلى هذه المنطقة.", en: "The master account is only available to the platform owner. Your current account does not have permission to access this area." },
      backToDashboard: { ar: "← العودة إلى لوحة التحكم", en: "← Back to dashboard" },
      gateTitle: { ar: "بوابة المالك", en: "Owner gate" },
      gateSubtitle: { ar: "منطقة محمية خاصّة بمالك المنصّة فقط. أدخل رمز الدخول السريّ للوصول إلى حساب الماستر الخاص بـ MT5.", en: "A protected area for the platform owner only. Enter the secret passcode to access the MT5 master account." },
      verified: { ar: "تم التحقّق. جارٍ الدخول إلى وحدة التحكم...", en: "Verified. Entering the console..." },
      passcodeLabel: { ar: "رمز الدخول السريّ", en: "Secret passcode" },
      ariaHide: { ar: "إخفاء الرمز", en: "Hide code" },
      ariaShow: { ar: "إظهار الرمز", en: "Show code" },
      verifying: { ar: "جارٍ التحقّق...", en: "Verifying..." },
      openVault: { ar: "فتح الخزنة", en: "Open vault" },
      retry: { ar: "إعادة المحاولة", en: "Retry" },
      warning: { ar: "هذه المنطقة مخصّصة للاستخدام الخاصّ بمالك المنصّة فقط. أي محاولة وصول غير مصرّح بها يتمّ تسجيلها.", en: "This area is for the platform owner's private use only. Any unauthorized access attempt is logged." },
      backHome: { ar: "← العودة إلى الصفحة الرئيسية", en: "← Back to home" },
    },

    /* owner/master/page.tsx */
    master: {
      connectError: { ar: "تعذّر الاتصال بالخادم — تحقّق من بيانات الدخول", en: "Could not connect to the server — check your credentials" },
      deleteConfirm: { ar: "هل أنت متأكد من حذف حساب الماستر؟ سيتمّ مسح جميع البيانات نهائياً.", en: "Are you sure you want to delete the master account? All data will be permanently erased." },
      sessionExpiresIn: { ar: "الجلسة تنتهي خلال", en: "Session expires in" },
      minWord: { ar: "د", en: "min" },
      lockVault: { ar: "قفل الخزنة", en: "Lock vault" },
      pageTitle: { ar: "حساب الماستر — MT5", en: "Master account — MT5" },
      pageSubtitle: { ar: "حساب التداول الرئيسي الذي يديره الروبوت نيابةً عنك. خاصّ بك وحدك.", en: "The main trading account the bot manages on your behalf. Yours alone." },
      savedFlash: { ar: "تمّ حفظ حساب الماستر بنجاح.", en: "Master account saved successfully." },
      emptyTitle: { ar: "لم يتمّ ربط حساب ماستر بعد", en: "No master account linked yet" },
      emptyBody: { ar: "أضِف حساب MT5 الرئيسي ليتمكّن الروبوت من فتح وإدارة الصفقات على حسابك الحقيقي.", en: "Add your main MT5 account so the bot can open and manage trades on your live account." },
      linkMaster: { ar: "ربط حساب الماستر", en: "Link master account" },
      lastConnected: { ar: "آخر اتصال", en: "Last connected" },
      neverConnected: { ar: "لم يتّصل بعد", en: "Never connected" },
      connecting: { ar: "جارٍ الاتصال...", en: "Connecting..." },
      connect: { ar: "اتصال", en: "Connect" },
      disconnect: { ar: "قطع الاتصال", en: "Disconnect" },
      loginLabel: { ar: "رقم الدخول (Login)", en: "Login" },
      serverLabel: { ar: "الخادم (Server)", en: "Server" },
      passwordLabel: { ar: "كلمة المرور", en: "Password" },
      currencyLeverage: { ar: "العملة / الرافعة", en: "Currency / Leverage" },
      createdAt: { ar: "أُنشئ في", en: "Created at" },
      editData: { ar: "تعديل البيانات", en: "Edit data" },
      delete: { ar: "حذف", en: "Delete" },
      copyAria: { ar: "نسخ", en: "Copy" },
      formTitleEdit: { ar: "تعديل حساب الماستر", en: "Edit master account" },
      formTitleCreate: { ar: "تسجيل حساب الماستر", en: "Register master account" },
      formSubtitle: { ar: "أدخل بيانات حساب MT5 الرئيسي الخاصّ بك", en: "Enter your main MT5 account details" },
      labelField: { ar: "الاسم التعريفي", en: "Label" },
      labelPlaceholder: { ar: "مثال: حسابي الرئيسي", en: "e.g. My main account" },
      loginField: { ar: "رقم الدخول (Login)", en: "Login" },
      serverField: { ar: "الخادم (Server)", en: "Server" },
      passwordField: { ar: "كلمة المرور", en: "Password" },
      currencyField: { ar: "العملة", en: "Currency" },
      leverageField: { ar: "الرافعة المالية", en: "Leverage" },
      helperNote: { ar: "تجد هذه البيانات داخل تطبيق MetaTrader 5 ← ملف ← فتح حساب، أو في البريد الإلكتروني من وسيطك. يُفضّل استخدام كلمة مرور المستثمر (Investor) للقراءة فقط إن أردت مراقبة الحساب بدون صلاحية التداول.", en: "You'll find these details inside MetaTrader 5 → File → Open Account, or in the email from your broker. Prefer the read-only Investor password if you want to monitor the account without trading rights." },
      ariaTogglePassword: { ar: "إظهار/إخفاء كلمة المرور", en: "Show/hide password" },
      cancel: { ar: "إلغاء", en: "Cancel" },
      saving: { ar: "جارٍ الحفظ...", en: "Saving..." },
      saveAccount: { ar: "حفظ الحساب", en: "Save account" },
      connConnected: { ar: "متّصل", en: "Connected" },
      connConnecting: { ar: "جارٍ الاتصال", en: "Connecting" },
      connError: { ar: "خطأ", en: "Error" },
      connDisconnected: { ar: "غير متّصل", en: "Disconnected" },
      now: { ar: "الآن", en: "Now" },
      agoM: { ar: "قبل", en: "ago" },
      agoMSuffix: { ar: "د", en: "m" },
      agoHSuffix: { ar: "س", en: "h" },
      agoDSuffix: { ar: "ي", en: "d" },
    },
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
