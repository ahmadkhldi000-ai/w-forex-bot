"use client";

import { LegalShell, LegalSection, LegalP, LegalList } from "@/components/legal/shell";
import { useI18n } from "@/lib/i18n/provider";
import { dictionary } from "@/lib/i18n/dictionary";

const d = dictionary.legal.disclaimer;
const UPDATED = "July 12, 2026";

export default function DisclaimerPage() {
  const { lang } = useI18n();

  const sectionsAr = [
    { title: "طبيعة المخاطر", body: [
      "ينطوي التداول في الفوركس والأسواق المالية المرفوعة (بالرافعة المالية) على مستوى عالٍ من المخاطر وقد لا يكون مناسباً لجميع المستثمرين. يمكن أن يؤدي استخدام الرافعة المالية إلى خسارة تتجاوز الوديعة الأولية. يجب ألا تستثمر أموالاً لا يمكنك تحمّل خسارتها.",
    ]},
    { title: "لا نصيحة استثمارية", body: [
      "جميع المحتوى على منصة WForexBot — بما في ذلك التحليلات والأرقام والإشارات — مُقدَّم لأغراض تعليمية وإعلامية فقط، ولا يُعدّ نصيحة استثمارية أو مالية أو ضريبية. يجب عليك استشارة مستشار مالي مرخّص قبل اتخاذ أي قرار استثماري.",
    ]},
    { title: "الأداء السابق", body: [
      "الأداء التاريخي — سواء للروبوت أو لحسابات المتداولين — لا يضمن النتائج المستقبلية. أسواق الفوركس متقلّبة وغير قابلة للتنبؤ بها، وقد تؤدي ظروف السوق المتغيرة إلى نتائج مختلفة جوهرياً عن السجل السابق.",
    ]},
    { title: "المخاطر التقنية", body: [
      "تعتمد الخدمة على بنية تحتية تقنية (خوادم، شبكات، MetaTrader 5) قد تتعرّض لأعطال أو تأخير أو انقطاع غير متوقع. لا نتحمّل مسؤولية أي خسارة ناتجة عن مشاكل تقنية خارج سيطرتنا المباشرة.",
    ]},
    { title: "دقة البيانات", body: [
      "نبذل جهداً معقولاً لضمان دقة الأسعار والأرقام المعروضة، لكننا لا نضمن خلوّها من الأخطاء أو التأخير. يجب التحقق من البيانات الحاسمة من مصادر مستقلة قبل التنفيذ.",
    ]},
    { title: "التنظيم", body: [
      "WForexBot هي منصة تقنية وليست وسيطاً مالياً منظّماً. لا تحتفظ بأموال المستخدمين ولا تنفّذ الصفقات نيابة عنهم. التداول يتم عبر وسطاء خارجيين مسجّلين لديك.",
    ]},
    { title: "الولاية القضائية", body: [
      "قد يكون التداول في الفوركس محظوراً أو مقيداً في بعض الدول. مسؤوليتك التأكد من الامتثال للقوانين المحلية قبل استخدام الخدمة.",
    ]},
    { title: "القبول", body: [
      "باستخدامك للخدمة، تقرّ بأنك قرأت وفهمت هذه المخاطر، وأنك تتحمّل كامل المسؤولية عن قراراتك التداولية ونتائجها.",
    ]},
  ];

  const sectionsEn = [
    { title: "Nature of Risk", body: [
      "Trading in forex and leveraged financial markets involves a high level of risk and may not be suitable for all investors. The use of leverage can result in losses exceeding your initial deposit. You should not invest money you cannot afford to lose.",
    ]},
    { title: "No Investment Advice", body: [
      "All content on the WForexBot platform — including analytics, figures, and signals — is provided for educational and informational purposes only and does not constitute investment, financial, or tax advice. You should consult a licensed financial advisor before making any investment decision.",
    ]},
    { title: "Past Performance", body: [
      "Historical performance — whether of the bot or of traders' accounts — does not guarantee future results. Forex markets are volatile and unpredictable, and changing market conditions can lead to fundamentally different outcomes than the historical record.",
    ]},
    { title: "Technical Risks", body: [
      "The Service relies on technical infrastructure (servers, networks, MetaTrader 5) that may experience failures, delays, or unexpected outages. We are not liable for any loss arising from technical issues beyond our direct control.",
    ]},
    { title: "Data Accuracy", body: [
      "We make a reasonable effort to ensure the accuracy of displayed prices and figures, but we do not guarantee they are free of errors or delays. Verify critical data from independent sources before execution.",
    ]},
    { title: "Regulation", body: [
      "WForexBot is a technology platform, not a regulated financial broker. It does not hold user funds or execute trades on their behalf. Trading is conducted through external brokers you have registered with.",
    ]},
    { title: "Jurisdiction", body: [
      "Forex trading may be prohibited or restricted in some countries. It is your responsibility to verify compliance with local laws before using the Service.",
    ]},
    { title: "Acceptance", body: [
      "By using the Service, you acknowledge that you have read and understood these risks, and that you bear full responsibility for your trading decisions and their outcomes.",
    ]},
  ];

  const sections = lang === "ar" ? sectionsAr : sectionsEn;

  return (
    <LegalShell title={d.title} intro={d.intro} updated={UPDATED}>
      {sections.map((s, i) => (
        <LegalSection key={i} title={s.title}>
          {s.body.length === 1 ? <LegalP>{s.body[0]}</LegalP> : <LegalList items={s.body} />}
        </LegalSection>
      ))}
    </LegalShell>
  );
}
