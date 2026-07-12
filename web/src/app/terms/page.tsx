"use client";

import { LegalShell, LegalSection, LegalP, LegalList } from "@/components/legal/shell";
import { useI18n } from "@/lib/i18n/provider";
import { dictionary } from "@/lib/i18n/dictionary";

const d = dictionary.legal.terms;
const UPDATED = "July 12, 2026";

export default function TermsPage() {
  const { lang } = useI18n();

  const sectionsAr = [
    { title: "1. قبول الشروط", body: ["باستخدامك لموقع وخدمات WForexBot (\"الخدمة\")، فإنك تقرّ بأنك قرأت وفهمت ووافقت على هذه الشروط كاملةً. إذا لم توافق على أي جزء منها، يُرجى عدم استخدام الخدمة."] },
    { title: "2. التعريف بالخدمة", body: ["WForexBot هي منصة تقنية توفّر أدوات تحليل سوق الفوركس وربط حسابات MetaTrader 5 لإدارة الصفقات. الخدمة أداة مساعدة ولا تقدّم نصائح استثمارية فردية."] },
    { title: "3. أهلية المستخدم", body: ["يجب أن يكون عمرك 18 عاماً على الأقل لاستخدام الخدمة.", "تتحمّل وحدك مسؤولية التأكد من أن استخدامك للخدمة متوافق مع القوانين السارية في بلدك، بما في ذلك قوانين التداول والضرائب."] },
    { title: "4. الحسابات والأمان", body: ["أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور.", "أي نشاط يتم عبر حسابك يُعتبر صادراً عنك.", "يجب إبلاغنا فوراً عن أي استخدام غير مصرّح به لحسابك."] },
    { title: "5. المخاطر", body: ["ينطوي التداول في الفوركس والأسواق المالية على مخاطر عالية قد تؤدي إلى خسارة كامل رأس المال. راجع صفحة إخلاء المسؤولية للتفاصيل الكاملة."] },
    { title: "6. الرسوم والاشتراكات", body: ["تُقدَّم بعض الميزات عبر اشتراكات مدفوعة. تُعرض الأسعار بشفافية قبل إتمام أي عملية دفع.", "جميع الرسوم غير قابلة للاسترداد ما لم تنصّ سياسة الاسترداد على غير ذلك."] },
    { title: "7. الملكية الفكرية", body: ["جميع العلامات التجارية والشعارات والمحتوى والكود الخاص بالخدمة مملوك لـ WForexBot ومحمي بموجب قوانين الملكية الفكرية.", "لا يجوز نسخ أو إعادة توزيع أي جزء من الخدمة دون إذن كتابي مسبق."] },
    { title: "8. تحديد المسؤولية", body: ["تُقدَّم الخدمة \"كما هي\" دون أي ضمانات صريحة أو ضمنية. لا نضمن عدم انقطاع الخدمة أو خلوها من الأخطاء."] },
    { title: "9. التعديلات على الشروط", body: ["نحتفظ بالحق في تعديل هذه الشروط في أي وقت. نسخة التاريخ المذكورة أعلاه هي النسخة السارية. استمرارك في استخدام الخدمة بعد التعديل يُعد قبولاً للشروط المُحدّثة."] },
    { title: "10. القانون الحاكم", body: ["تخضع هذه الشروط وتُفسَّر وفق القوانين المعمول بها في الولاية القضائية المعنية، دون تعارض مع مبادئ تنازع القوانين."] },
  ];

  const sectionsEn = [
    { title: "1. Acceptance of Terms", body: ["By accessing and using the WForexBot website and services (the \"Service\"), you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety. If you do not agree with any part, please do not use the Service."] },
    { title: "2. Description of Service", body: ["WForexBot is a technology platform providing forex market analysis tools and MetaTrader 5 account integration for trade management. The Service is an assistive tool and does not offer individualized investment advice."] },
    { title: "3. User Eligibility", body: ["You must be at least 18 years old to use the Service.", "You are solely responsible for ensuring that your use of the Service complies with the laws applicable in your jurisdiction, including trading and tax regulations."] },
    { title: "4. Accounts and Security", body: ["You are responsible for safeguarding your account credentials and password.", "Any activity originating from your account is presumed to be performed by you.", "You must notify us immediately of any unauthorized use of your account."] },
    { title: "5. Risk", body: ["Trading in forex and financial markets involves substantial risk that may result in the loss of your entire capital. Please refer to the Risk Disclaimer page for full details."] },
    { title: "6. Fees and Subscriptions", body: ["Certain features are offered through paid subscriptions. Prices are shown transparently before any payment is processed.", "All fees are non-refundable unless otherwise stated in our refund policy."] },
    { title: "7. Intellectual Property", body: ["All trademarks, logos, content, and code of the Service are owned by WForexBot and protected under intellectual property laws.", "No part of the Service may be copied or redistributed without prior written permission."] },
    { title: "8. Limitation of Liability", body: ["The Service is provided \"as is\" without warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free operation."] },
    { title: "9. Changes to Terms", body: ["We reserve the right to modify these Terms at any time. The dated version above is the currently effective one. Continued use of the Service after changes constitutes acceptance of the updated Terms."] },
    { title: "10. Governing Law", body: ["These Terms are governed by and construed in accordance with the applicable laws of the relevant jurisdiction, without regard to conflict-of-law principles."] },
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
