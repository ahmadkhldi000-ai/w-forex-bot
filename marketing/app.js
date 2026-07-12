/* ============================================================
   W-Forex Bot — Marketing Page Interactions
   ============================================================ */
(function(){
  'use strict';

  /* ---------- i18n: Arabic + English ---------- */
  const DICT = {
    ar: {
      nav_features:"المميزات", nav_how:"كيف يعمل", nav_pricing:"الباقات", nav_token:"الرمز", nav_roadmap:"خارطة الطريق", nav_join:"انضم الآن",
      hero_badge:"منصة تداول الجيل القادم • مدعومة بالذكاء الاصطناعي",
      hero_t1:"تداول بذكاء.", hero_t2:" اربح بثقة.",
      hero_sub:"منصة فوركس متكاملة بالذكاء الاصطناعي — اتصال مباشر بـ MetaTrader 5، نسخ صفقات احترافي، إشارات حية لحظية، ورمز WFB. كل ما تحتاجه لتصبح متداولًا محترفًا في مكان واحد.",
      hero_cta1:"انضم لمجتمعنا على تيليجرام", hero_cta2:"اكتشف المنصة",
      stat_volume:"حجم سوق الفوركس اليومي", stat_members:"عضو في مجتمعنا", stat_uptime:"تشغيل متواصل", stat_latency:"سرعة تنفيذ",
      trade_buy:"إشارة شراء", trade_conf:"ثقة",
      chip_ai:"تحليل AI لحظي", chip_exec:"تنفيذ فوري", chip_profit:"أرباح مضمونة المراقبة",
      trust_label:"مدعوم بأفضل التقنيات",
      feat_eyebrow:"لماذا W-Forex Bot؟", feat_title:"قوة التداول في متصفحك", feat_sub:"أدوات مؤسسية، ذكاء اصطناعي، ونسخ صفقات — كلها في منصة واحدة مصممة لتنقل تداولك إلى المستوى التالي.",
      f1_t:"ذكاء اصطناعي تحليلي", f1_d:"خوارزميات AI تلتقط الأنماط في ملايين نقاط البيانات لحظيًا، وتمنحك إشارات دقيقة مع نسبة ثقة لكل صفقة.",
      f1_l1:"تحليل فني متقدم آليًا", f1_l2:"كشف الاتجاهات قبل حدوثها", f1_l3:"إدارة مخاطر ذكية",
      f2_t:"اتصال مباشر بـ MetaTrader 5", f2_d:"اربط حساب MT5 الخاص بك بنقرة، وتابع ونفّذ صفقاتك من لوحة موحدة دون مغادرة المنصة.",
      f2_l1:"مزامنة لحظية للحساب", f2_l2:"تشفير AES-256-GCM لكلمات المرور", f2_l3:"دعم بروكرات MT5 المتعددة",
      f3_t:"نسخ صفقات احترافي", f3_d:"انسخ صفقات كبار المتداولين تلقائيًا، أو اصنع استراتيجيتك ودع الآخرين ينسخونك ويكافأونك.",
      f3_l1:"نسخ فوري بنسبة 100%", f3_l2:"لوحة أداء شفافة لكل متداول", f3_l3:"برنامج مكافآت للقادة",
      f4_t:"إشارات حية لحظية", f4_d:"إشارات تداول فورية مع نقاط الدخول والخروج ووقف الخسارة، تصلك مباشرة على تيليجرام.",
      f4_l1:"تنبيهات تيليجرام فورية", f4_l2:"تحليل المخاطر لكل صفقة", f4_l3:"سجل أداء كامل وشفاف",
      f5_t:"أمان بمستوى المؤسسات", f5_d:"تشفير كامل، تحقق بخطوتين، سجلات تدقيق لكل إجراء، وحدود للمعدلات على كل نقطة وصول.",
      f5_l1:"2FA + RBAC صارم", f5_l2:"تشفير AES-256-GCM", f5_l3:"تحقق HMAC لكل عملية دفع",
      f6_t:"مجتمع عالمي", f6_d:"انضم لآلاف المتداولين من كل العالم، شارك التحليلات، تعلّم من المحترفين، وابنِ شبكتك.",
      f6_l1:"دردشة حية 24/7", f6_l2:"دعم متعدد اللغات", f6_l3:"ندوات تعليمية أسبوعية",
      how_eyebrow:"ابدأ في 3 خطوات", how_title:"من الصفر إلى أول صفقة في دقائق",
      s1_t:"انضم لقناتنا", s1_d:"اضغط زر الانضمام وادخل مجتمع W-Forex Bot على تيليجرام مجانًا. استقبل الإشارات والتحليلات فورًا.",
      s2_t:"اربط حساب MT5", s2_d:"امنح منصتك هوية المتداول واربط حساب MetaTrader 5 الخاص بك بأمان كامل لبدء التداول الذكي.",
      s3_t:"تداول واربح", s3_d:"تابع الإشارات، انسخ أفضل المتداولين، أو دع الذكاء الاصطناعي يقود قراراتك. كل شيء يحدث تلقائيًا.",
      how_cta:"ابدأ رحلتك الآن — مجانًا",
      price_eyebrow:"باقات مرنة", price_title:"اختر خطتك", price_sub:"ابدأ مجانًا، وارتقِ حسب احتياجك. كل الباقات تشمل الوصول لمجتمع تيليجرام.",
      p1_name:"FREE", p1_desc:"للمبتدئين والاستكشاف", p1_f1:"إشارات تيليجرام الأساسية", p1_f2:"وصول لمجتمع عام", p1_f3:"تحليل سوق أسبوعي", p1_cta:"ابدأ مجانًا",
      p_popular:"الأكثر شعبية",
      p2_name:"PRO", p2_desc:"للمتداولين الجادين", p2_f1:"كل مزايا FREE", p2_f2:"إشارات AI لحظية", p2_f3:"ربط حساب MT5", p2_f4:"نسخ صفقات محدود", p2_f5:"دعم أولوية", p2_cta:"اشترك الآن",
      p3_name:"VIP", p3_desc:"للمحترفين والمؤسسات", p3_f1:"كل مزايا PRO", p3_f2:"نسخ صفقات غير محدود", p3_f3:"API مخصص", p3_f4:"مدير حساب خاص", p3_f5:"إشارات حصرية VIP", p3_cta:"ترقية لـ VIP",
      price_per:"/شهر",
      tok_eyebrow:"WFB Token", tok_title:"العملة التي تشغّل المنصة", tok_sub:"WFB ليس مجرد رمز — إنه طبقة التسوية لكل خدمة، خصم، ومكافأة داخل منظومة W-Forex Bot.",
      tok_supply:"إجمالي العرض", leg_liquidity:"السيولة 36%", leg_ecosystem:"المنظومة 28%", leg_team:"الفريق 20%", leg_treasury:"الخزينة 16%",
      tb1_t:"خصومات على الرسوم", tb1_d:"وفّر حتى 30% على كل اشتراك عند الدفع بـ WFB.",
      tb2_t:"وصول مبكر", tb2_d:"حاملو WFB يحصلون أولًا على كل ميزة وطرح جديد.",
      tb3_t:"حوكمة", tb3_d:"صوّت على قرارات المنصة وميزاتها القادمة.",
      tb4_t:"مكافآت المتداولين", tb4_d:"اكسب WFB عند قيادتك لاستراتيجيات ناجحة ينسخها الآخرون.",
      rm_eyebrow:"خارطة الطريق", rm_title:"من اليوم إلى المستقبل",
      rm1_q:"Q3–Q4 2025", rm1_t:"المرحلة 1 — الإطلاق", rm1_d:"إطلاق المنصة، تكامل MT5، واجهة PWA، تحليل AI، ومجتمع تيليجرام.",
      rm2_q:"Q1–Q2 2026", rm2_t:"المرحلة 2 — النمو", rm2_d:"نسخ الصفقات الكامل، تطبيقات iOS/Android، وتوسيع عالمي للمجتمع.",
      rm3_q:"الآن — H2 2026", rm3_t:"المرحلة 3 — WFB Token", rm3_d:"إطلاق رمز WFB، التداول بالرمز، برامج المكافآت، والشراكات المؤسسية.",
      rm4_q:"2027+", rm4_t:"المرحلة 4 — المنظومة", rm4_d:"محفظة متعددة السلاسل، طرفية مؤسسية، ومنتجات AI جديدة كليًا.",
      test_eyebrow:"قالوا عنّا", test_title:"قصص نجاح حقيقية",
      t1_q:"إشارات AI غيّرت طريقة تداولي تمامًا. الدخول والخروج دقيق بشكل لا يصدق.", t1_r:"متداول، الإمارات",
      t2_q:"ميزة نسخ الصفقات ممتازة. أتابع أفضل المتداولين وأتلقى نتائجهم مباشرة.", t2_r:"مستثمرة، لندن",
      t3_q:"المجتمع على تيليجرام هو الأفضل. دعم، تحليلات، وتعلم مستمر 24/7.", t3_r:"متداول مبتدئ، تركيا",
      cta_title:"جاهز لتصبح متداولًا ذكيًا؟", cta_sub:"انضم لأكثر من 120,000 متداول حول العالم. مجتمعنا ينتظرك على تيليجرام — مجانًا، إلى الأبد.",
      cta_btn:"انضم لقناة W-Forex Bot", cta_t1:"✓ مجاني للأبد", cta_t2:"✓ بدون التزام", cta_t3:"✓ إشارات فورية",
      foot_tag:"التداول الذكي بالمستقبل", foot_telegram:"تيليجرام",
      risk_warning:"تحذير المخاطر: التداول في الأسواق المالية ينطوي على مخاطر عالية وقد يؤدي إلى فقدان رأس المال. لا تداول أبدًا بأموال لا يمكنك تحمّل خسارتها. هذه المنصة لا تقدم نصائح مالية. تداول بمسؤولية.",
      float_join:"انضم"
    },
    en: {
      nav_features:"Features", nav_how:"How it works", nav_pricing:"Pricing", nav_token:"Token", nav_roadmap:"Roadmap", nav_join:"Join now",
      hero_badge:"Next-gen trading platform • Powered by AI",
      hero_t1:"Trade smart.", hero_t2:" Earn confident.",
      hero_sub:"An all-in-one AI-powered forex platform — direct MetaTrader 5 integration, pro copy trading, live signals, and the WFB token. Everything you need to trade like a pro, in one place.",
      hero_cta1:"Join our Telegram community", hero_cta2:"Explore the platform",
      stat_volume:"Daily forex market volume", stat_members:"Community members", stat_uptime:"Continuous uptime", stat_latency:"Execution speed",
      trade_buy:"Buy signal", trade_conf:"confidence",
      chip_ai:"Real-time AI analysis", chip_exec:"Instant execution", chip_profit:"Monitored profits",
      trust_label:"Powered by the best technology",
      feat_eyebrow:"Why W-Forex Bot?", feat_title:"Trading power in your browser", feat_sub:"Institutional-grade tools, AI intelligence, and copy trading — all in one platform built to take your trading to the next level.",
      f1_t:"Analytical AI", f1_d:"AI algorithms catch patterns across millions of data points in real time, giving you precise signals with a confidence score for every trade.",
      f1_l1:"Advanced automated technical analysis", f1_l2:"Detect trends before they happen", f1_l3:"Smart risk management",
      f2_t:"Direct MetaTrader 5 integration", f2_d:"Connect your MT5 account in one click, track and execute trades from a unified dashboard without leaving the platform.",
      f2_l1:"Real-time account sync", f2_l2:"AES-256-GCM password encryption", f2_l3:"Multi-broker MT5 support",
      f3_t:"Pro copy trading", f3_d:"Auto-copy trades from top traders, or build your own strategy and let others copy you while you earn rewards.",
      f3_l1:"100% instant copy", f3_l2:"Transparent performance board per trader", f3_l3:"Leader rewards program",
      f4_t:"Live real-time signals", f4_d:"Instant trading signals with entry, exit, and stop-loss points — delivered straight to your Telegram.",
      f4_l1:"Instant Telegram alerts", f4_l2:"Risk analysis per trade", f4_l3:"Full transparent track record",
      f5_t:"Enterprise-grade security", f5_d:"Full encryption, two-factor auth, audit logs for every action, and rate limits on every endpoint.",
      f5_l1:"Strict 2FA + RBAC", f5_l2:"AES-256-GCM encryption", f5_l3:"HMAC verification per payment",
      f6_t:"Global community", f6_d:"Join thousands of traders worldwide, share analysis, learn from pros, and build your network.",
      f6_l1:"24/7 live chat", f6_l2:"Multilingual support", f6_l3:"Weekly educational webinars",
      how_eyebrow:"Start in 3 steps", how_title:"From zero to first trade in minutes",
      s1_t:"Join our channel", s1_d:"Hit join and enter the W-Forex Bot community on Telegram for free. Receive signals and analysis instantly.",
      s2_t:"Connect your MT5 account", s2_d:"Give your platform a trader identity and securely link your MetaTrader 5 account to start smart trading.",
      s3_t:"Trade & earn", s3_d:"Follow signals, copy top traders, or let AI drive your decisions. Everything happens automatically.",
      how_cta:"Start your journey now — free",
      price_eyebrow:"Flexible plans", price_title:"Pick your plan", price_sub:"Start free, scale as you grow. Every plan includes Telegram community access.",
      p1_name:"FREE", p1_desc:"For beginners & exploration", p1_f1:"Basic Telegram signals", p1_f2:"Public community access", p1_f3:"Weekly market analysis", p1_cta:"Start free",
      p_popular:"Most popular",
      p2_name:"PRO", p2_desc:"For serious traders", p2_f1:"Everything in FREE", p2_f2:"Real-time AI signals", p2_f3:"MT5 account link", p2_f4:"Limited copy trading", p2_f5:"Priority support", p2_cta:"Subscribe now",
      p3_name:"VIP", p3_desc:"For pros & institutions", p3_f1:"Everything in PRO", p3_f2:"Unlimited copy trading", p3_f3:"Custom API", p3_f4:"Dedicated account manager", p3_f5:"Exclusive VIP signals", p3_cta:"Upgrade to VIP",
      price_per:"/mo",
      tok_eyebrow:"WFB Token", tok_title:"The currency that powers the platform", tok_sub:"WFB isn't just a token — it's the settlement layer for every service, discount, and reward across the W-Forex Bot ecosystem.",
      tok_supply:"Total supply", leg_liquidity:"Liquidity 36%", leg_ecosystem:"Ecosystem 28%", leg_team:"Team 20%", leg_treasury:"Treasury 16%",
      tb1_t:"Fee discounts", tb1_d:"Save up to 30% on every subscription when paying with WFB.",
      tb2_t:"Early access", tb2_d:"WFB holders get every new feature and release first.",
      tb3_t:"Governance", tb3_d:"Vote on platform decisions and upcoming features.",
      tb4_t:"Trader rewards", tb4_d:"Earn WFB when your successful strategies get copied.",
      rm_eyebrow:"Roadmap", rm_title:"From today to the future",
      rm1_q:"Q3–Q4 2025", rm1_t:"Phase 1 — Launch", rm1_d:"Platform launch, MT5 integration, PWA interface, AI analysis, and Telegram community.",
      rm2_q:"Q1–Q2 2026", rm2_t:"Phase 2 — Growth", rm2_d:"Full copy trading, iOS/Android apps, and global community expansion.",
      rm3_q:"Now — H2 2026", rm3_t:"Phase 3 — WFB Token", rm3_d:"WFB token launch, token trading, rewards programs, and institutional partnerships.",
      rm4_q:"2027+", rm4_t:"Phase 4 — Ecosystem", rm4_d:"Multi-chain wallet, institutional terminal, and brand-new AI products.",
      test_eyebrow:"What they say", test_title:"Real success stories",
      t1_q:"AI signals completely changed the way I trade. Entries and exits are incredibly accurate.", t1_r:"Trader, UAE",
      t2_q:"Copy trading is excellent. I follow top traders and receive their results directly.", t2_r:"Investor, London",
      t3_q:"The Telegram community is the best. Support, analysis, and continuous learning 24/7.", t3_r:"Beginner trader, Turkey",
      cta_title:"Ready to become a smart trader?", cta_sub:"Join 120,000+ traders worldwide. Our community awaits you on Telegram — free, forever.",
      cta_btn:"Join the W-Forex Bot channel", cta_t1:"✓ Free forever", cta_t2:"✓ No commitment", cta_t3:"✓ Instant signals",
      foot_tag:"Smart trading for the future", foot_telegram:"Telegram",
      risk_warning:"Risk warning: Trading in financial markets involves high risk and may lead to capital loss. Never trade with funds you cannot afford to lose. This platform does not provide financial advice. Trade responsibly.",
      float_join:"Join"
    }
  };

  let currentLang = 'ar';

  function applyLang(lang){
    currentLang = lang;
    const dict = DICT[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(dict[key] !== undefined) el.textContent = dict[key];
    });
    document.getElementById('langLabel').textContent = lang === 'ar' ? 'EN' : 'ع';
  }

  document.getElementById('langToggle').addEventListener('click', ()=>{
    applyLang(currentLang === 'ar' ? 'en' : 'ar');
  });

  /* ---------- Navigation ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', ()=>{
    nav.classList.toggle('scrolled', window.scrollY > 30);
    // progress
    const h = document.documentElement.scrollHeight - window.innerHeight;
    document.getElementById('scrollProgress').style.width = (window.scrollY / h * 100) + '%';
  }, {passive:true});

  burger.addEventListener('click', ()=>{
    burger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
    burger.classList.remove('open'); navLinks.classList.remove('open');
  }));

  /* ---------- Cursor glow ---------- */
  const glow = document.getElementById('cursorGlow');
  let gx=0, gy=0, cx=0, cy=0;
  if(window.matchMedia('(pointer:fine)').matches){
    document.addEventListener('mousemove', e=>{ gx=e.clientX; gy=e.clientY; });
    function animGlow(){
      cx += (gx-cx)*0.12; cy += (gy-cy)*0.12;
      glow.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(animGlow);
    }
    animGlow();
  } else { glow.style.display='none'; }

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('on'); io.unobserve(en.target); } });
  }, {threshold:0.12, rootMargin:'0px 0px -60px 0px'});
  document.querySelectorAll('.reveal-on-scroll, .reveal').forEach(el=>io.observe(el));

  /* ---------- Animated counters ---------- */
  function animateCounter(el){
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = suffix === 'T' ? '$' : '';
    const isDecimal = target % 1 !== 0;
    let start = null;
    const dur = 1800;
    function step(ts){
      if(!start) start = ts;
      const p = Math.min((ts-start)/dur, 1);
      const eased = 1 - Math.pow(1-p, 3);
      const val = target * eased;
      el.textContent = prefix + (isDecimal ? val.toFixed(2) : Math.floor(val).toLocaleString()) + suffix;
      if(p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (isDecimal ? target.toFixed(2) : Math.floor(target).toLocaleString()) + suffix;
    }
    requestAnimationFrame(step);
  }
  const statObserver = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{ if(en.isIntersecting){ animateCounter(en.target); statObserver.unobserve(en.target); } });
  }, {threshold:0.5});
  document.querySelectorAll('[data-count]').forEach(el=>statObserver.observe(el));

  /* ---------- Live trade card mockup ---------- */
  const tradePrice = document.getElementById('tradePrice');
  const tradeChange = document.getElementById('tradeChange');
  const tradeSpark = document.getElementById('tradeSpark');
  let price = 1.0842;
  let points = Array.from({length:24}, ()=> 40 + Math.random()*30);

  function drawSpark(){
    const w = 100, h = 60;
    const min = Math.min(...points), max = Math.max(...points);
    const range = max-min || 1;
    const path = points.map((p,i)=>{
      const x = (i/(points.length-1))*w;
      const y = h - ((p-min)/range)*(h-8) - 4;
      return (i===0?'M':'L')+x.toFixed(1)+' '+y.toFixed(1);
    }).join(' ');
    const area = path + ` L${w} ${h} L0 ${h} Z`;
    tradeSpark.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <defs><linearGradient id="sparkG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
        </linearGradient></defs>
        <path d="${area}" fill="url(#sparkG)"/>
        <path d="${path}" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }
  drawSpark();

  setInterval(()=>{
    const delta = (Math.random()-0.48)*0.0009;
    price = Math.max(1.05, Math.min(1.12, price + delta));
    const change = ((price - 1.0842)/1.0842)*100;
    tradePrice.textContent = price.toFixed(4);
    tradeChange.textContent = (change>=0?'+':'') + change.toFixed(2) + '%';
    tradeChange.className = 'trade-change ' + (change>=0?'up':'down');
    points.shift();
    points.push(40 + Math.random()*30);
    drawSpark();
  }, 1800);

  /* ---------- Tilt effect on trade card ---------- */
  const card = document.getElementById('tradeCard');
  if(card && window.matchMedia('(pointer:fine)').matches){
    const visual = document.querySelector('.hero-visual');
    visual.addEventListener('mousemove', e=>{
      const r = visual.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width - 0.5;
      const py = (e.clientY - r.top)/r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${px*8}deg) rotateX(${-py*8}deg)`;
    });
    visual.addEventListener('mouseleave', ()=>{ card.style.transform = ''; });
  }

  /* ---------- Init ---------- */
  applyLang('ar');
})();
