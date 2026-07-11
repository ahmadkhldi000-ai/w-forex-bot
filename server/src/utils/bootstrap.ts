import { randomBytes } from "crypto";
import { prisma } from "@/config/db.js";
import { hashPassword } from "@/utils/crypto.js";
import { config } from "@/config/env.js";
import { ALL_PERMISSIONS } from "@/middleware/audit.js";
import { Permission } from "@prisma/client";

/**
 * Create the default SUPER_ADMIN account on first startup.
 * Password is randomly generated and printed to logs (must change on first login).
 */
export async function ensureDefaultAdmin(): Promise<void> {
  const existing = await prisma.admin.findFirst({
    where: { role: "SUPER_ADMIN" },
  });
  if (existing) {
    return; // already bootstrapped
  }

  const tempPassword = randomBytes(6).toString("base64url").slice(0, 16);
  const admin = await prisma.admin.create({
    data: {
      email: config.admin.email,
      username: "superadmin",
      passwordHash: await hashPassword(tempPassword),
      name: "Super Admin",
      role: "SUPER_ADMIN",
      permissions: ALL_PERMISSIONS as Permission[],
      forcePasswordChange: true,
    },
  });

  console.log("\n" + "=".repeat(60));
  console.log("  🔐 DEFAULT SUPER ADMIN CREATED");
  console.log("=".repeat(60));
  console.log(`  Email:    ${admin.email}`);
  console.log(`  Password: ${tempPassword}`);
  console.log("  ⚠️  CHANGE THIS IMMEDIATELY ON FIRST LOGIN");
  console.log("=".repeat(60) + "\n");
}

/** Seed default plans & settings (idempotent). */
export async function ensureDefaultData(): Promise<void> {
  // Plans
  const plans = [
    {
      tier: "FREE" as const,
      name: "مجاني",
      priceMonthly: 0, priceYearly: 0,
      maxAccounts: 1, maxLotSize: 0.01, maxLeverage: 20,
      features: ["عرض الصفقات", "إحصائيات أساسية", "قناة Telegram"],
      sortOrder: 0,
    },
    {
      tier: "BASIC" as const,
      name: "أساسي",
      priceMonthly: 29, priceYearly: 290,
      maxAccounts: 1, maxLotSize: 0.05, maxLeverage: 30,
      features: ["نسخ صفقات محدود", "إدارة مخاطر", "دعم بالبريد"],
      sortOrder: 1,
    },
    {
      tier: "PRO" as const,
      name: "احترافي",
      priceMonthly: 79, priceYearly: 790,
      maxAccounts: 3, maxLotSize: 0.5, maxLeverage: 50,
      features: ["نسخ صفقات غير محدود", "تحليلات متقدمة", "دعم أولوية", "إشعارات فورية"],
      sortOrder: 2,
    },
    {
      tier: "ENTERPRISE" as const,
      name: "مؤسسات",
      priceMonthly: 199, priceYearly: 1990,
      maxAccounts: 10, maxLotSize: 5, maxLeverage: 100,
      features: ["كل ميزات PRO", "حسابات متعددة", "API access", "مدير حساب مخصص"],
      sortOrder: 3,
    },
    {
      tier: "VIP" as const,
      name: "VIP",
      priceMonthly: 499, priceYearly: 4990,
      maxAccounts: 20, maxLotSize: 10, maxLeverage: 200,
      features: [
        "كل ميزات Enterprise",
        "أولوية قصوى في التنفيذ",
        "استراتيجيات مخصصة بالكامل",
        "مدير حساب مخصص 24/7",
        "VPS احترافي مدمج",
        "تقارير تحليلية شهرية مفصلة",
        "دعوات لفعاليات حصرية",
      ],
      sortOrder: 4,
    },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { tier: p.tier },
      create: { ...p, currency: "USD" },
      update: { isActive: true },
    });
  }

  // Default settings
  const settings = [
    { key: "telegram_channel_url", value: "https://t.me/+iXalBkHABfBkYWQ0", category: "social", isPublic: true, type: "string" },
    { key: "bot_status", value: "running", category: "bot", isPublic: false, type: "string" },
    { key: "mt5_connection", value: "disconnected", category: "mt5", isPublic: false, type: "string" },
    { key: "platform_name", value: "W-Forex Bot", category: "general", isPublic: true, type: "string" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: s,
      update: {},
    });
  }
}
