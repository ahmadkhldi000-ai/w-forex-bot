"use client";

import { LegalShell, LegalSection, LegalP, LegalList } from "@/components/legal/shell";
import { useI18n } from "@/lib/i18n/provider";
import { dictionary } from "@/lib/i18n/dictionary";

const d = dictionary.legal.privacy;
const UPDATED = "July 12, 2026";

export default function PrivacyPage() {
  const { lang } = useI18n();

  const sectionsAr = [
    { title: "1. المعلومات التي نجمعها", body: [
      "بيانات الحساب: البريد الإلكتروني، الاسم، وكلمة المرور (مشفّرة).",
      "بيانات التداول: إعدادات حساب MetaTrader 5 وبيانات الصفقات (إن سمحت بذلك).",
      "بيانات الاستخدام: عنوان IP، نوع المتصفح، والصفحات التي تزورها ضمن الخدمة، عبر ملفات ارتباط (cookies).",
    ]},
    { title: "2. كيف نستخدم معلوماتك", body: [
      "لتشغيل الخدمة وتقديم ميزات لوحة التحكم والتحليلات.",
      "لتأمين حسابك ومنع الاحتيال والوصول غير المصرّح به.",
      "لتحسين أداء المنصة وتطوير ميزات جديدة.",
      "لإرسال إشعارات مهمة متعلقة بحسابك (لا نرسل رسائل تسويقية دون موافقتك).",
    ]},
    { title: "3. مشاركة المعلومات", body: [
      "لا نبيع بياناتك الشخصية لأي طرف ثالث.",
      "قد نشارك بيانات محدودة مع مزوّدي خدمات موثوقين يساعدوننا في تشغيل الخدمة (مثل استضافة الخوادم)، وذلك تحت اتفاقيات سرية صارمة.",
      "قد نكشف عن المعلومات عند الإلزام القانوني أو بأمر قضائي.",
    ]},
    { title: "4. حماية البيانات", body: [
      "نستخدم تشفيراً قوياً (TLS) لنقل البيانات، وتشفيراً لكلمات المرور ومعايير MT5 الحساسة.",
      "نطبّق ضوابط وصول صارمة ت limit الوصول إلى البيانات لفريق الصيانة المخوّل فقط.",
    ]},
    { title: "5. ملفات الارتباط (Cookies)", body: [
      "نستخدم ملفات ارتباط ضرورية لحفظ تفضيل اللغة وبقاء الجلسة نشطة.",
      "يمكنك تعطيل ملفات الارتباط في متصفحك، لكن قد تتأثر بعض الميزات.",
    ]},
    { title: "6. حقوقك", body: [
      "لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها.",
      "يمكنك طلب حذف حسابك وكل البيانات المرتبطة به في أي وقت.",
      "للتحكم في البيانات، تواصل معنا عبر البريد المذكور أدناه.",
    ]},
    { title: "7. الاحتفاظ بالبيانات", body: [
      "نحتفظ ببياناتك طوال مدة استخدامك للخدمة، وحتى انتهاء فترة معقولة بعد حذف الحساب لأغراض أمنية وقانونية.",
    ]},
    { title: "8. خصوصية الأطفال", body: [
      "الخدمة غير موجّهة لمن هم دون 18 عاماً، ولا نجمع عن قصد بياناتهم الشخصية.",
    ]},
    { title: "9. التواصل معنا", body: [
      "لأي استفسار حول الخصوصية، تواصل معنا عبر القنوات الرسمية في تذييل الموقع.",
    ]},
  ];

  const sectionsEn = [
    { title: "1. Information We Collect", body: [
      "Account data: email address, name, and password (hashed).",
      "Trading data: MetaTrader 5 account settings and trade data (if you enable it).",
      "Usage data: IP address, browser type, and pages you visit within the Service, via cookies.",
    ]},
    { title: "2. How We Use Your Information", body: [
      "To operate the Service and provide dashboard and analytics features.",
      "To secure your account and prevent fraud and unauthorized access.",
      "To improve platform performance and develop new features.",
      "To send important account-related notifications (we do not send marketing emails without your consent).",
    ]},
    { title: "3. Information Sharing", body: [
      "We do not sell your personal data to any third party.",
      "We may share limited data with trusted service providers who help operate the Service (e.g., hosting), under strict confidentiality agreements.",
      "We may disclose information when required by law or court order.",
    ]},
    { title: "4. Data Security", body: [
      "We use strong encryption (TLS) for data in transit, and encrypt passwords and sensitive MT5 credentials.",
      "We enforce strict access controls limiting data access to authorized maintenance personnel only.",
    ]},
    { title: "5. Cookies", body: [
      "We use essential cookies to remember your language preference and keep your session active.",
      "You can disable cookies in your browser, though some features may be affected.",
    ]},
    { title: "6. Your Rights", body: [
      "You have the right to access and correct your personal data.",
      "You can request deletion of your account and all associated data at any time.",
      "To manage your data, contact us via the channels listed in the site footer.",
    ]},
    { title: "7. Data Retention", body: [
      "We retain your data for as long as you use the Service, and for a reasonable period after account deletion for security and legal purposes.",
    ]},
    { title: "8. Children's Privacy", body: [
      "The Service is not intended for anyone under 18, and we do not knowingly collect their personal data.",
    ]},
    { title: "9. Contact Us", body: [
      "For any privacy inquiry, reach us through the official channels in the site footer.",
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
