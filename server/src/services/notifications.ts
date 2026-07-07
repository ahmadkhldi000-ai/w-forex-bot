import { config } from "@/config/env.js";

// ====================================================================
//  NOTIFICATION SERVICE
//  - In-app (via DB → polled by frontend)
//  - Email (optional, via SMTP)
//  - Telegram bot (optional)
//  ====================================================================

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Send email — falls back gracefully if SMTP not configured (dev mode).
 * In production, wire to your provider (Resend/SendGrid/etc).
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!config.email.host || !config.email.user) {
    console.log(`[email:dev] → ${payload.to} :: ${payload.subject}`);
    return false;
  }
  // Nodemailer would go here. Kept lightweight to avoid heavy dep until needed.
  // import nodemailer from "nodemailer";
  console.log(`[email] → ${payload.to} :: ${payload.subject}`);
  return true;
}

export const emailTemplates = {
  paymentConfirmation: (data: { name: string; amount: number; plan: string }) => ({
    subject: `✅ تم تأكيد دفعتك — ${data.plan}`,
    text: `مرحباً ${data.name}،\n\nتم استلام دفعتك بقيمة $${data.amount} لخطة ${data.plan} بنجاح. اشتراكك مفعّل الآن.\n\nشكراً لك،\nفريق W-Forex Bot`,
  }),
  subscriptionExpiring: (data: { name: string; daysLeft: number; plan: string }) => ({
    subject: `⏰ اشتراكك ينتهي خلال ${data.daysLeft} يوم`,
    text: `مرحباً ${data.name}،\n\nينتهي اشتراكك في خطة ${data.plan} خلال ${data.daysLeft} يوم. جدّد الآن لتجنب الانقطاع.\n\nفريق W-Forex Bot`,
  }),
  adminNewDevice: (data: { email: string; ip: string; device: string }) => ({
    subject: `🔒 تسجيل دخول من جهاز جديد إلى لوحة الإدارة`,
    text: `تم تسجيل دخول إلى حساب الإدارة الخاص بك (${data.email}) من:\nIP: ${data.ip}\nالجهاز: ${data.device}\n\nإن لم تكن أنت، يُرجى تغيير كلمة المرور فوراً.`,
  }),
};
