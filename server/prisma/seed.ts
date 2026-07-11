import { prisma } from "../src/config/db.js";
import { hashPassword } from "../src/utils/crypto.js";
import { ensureDefaultData } from "../src/utils/bootstrap.js";
import { randomBytes, createHash } from "crypto";

/**
 * Seed script — run with: npm run db:seed
 * Creates default admin, plans, and settings (idempotent).
 */
async function main() {
  console.log("🌱 Seeding database...\n");

  // Plans & settings
  await ensureDefaultData();
  console.log("✅ Plans & settings seeded");

  // Demo user (for testing)
  const existingUser = await prisma.user.findUnique({
    where: { email: "demo@wforexbot.com" },
  });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: "demo@wforexbot.com",
        passwordHash: await hashPassword("demo12345"),
        name: "Demo User",
        riskAccepted: true,
        riskAcceptedAt: new Date(),
        status: "ACTIVE",
        subscriptions: {
          create: {
            tier: "PRO",
            status: "ACTIVE",
            billingCycle: "MONTHLY",
            amount: 79,
            currency: "USD",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });
    console.log("✅ Demo user created: demo@wforexbot.com / demo12345");
  }

  // ---- Demo API key for the Web Connector ----
  const demoKeyName = "Demo EA Connector";
  const existingKey = await prisma.apiKey.findFirst({ where: { name: demoKeyName } });
  if (!existingKey) {
    const rawKey = "wfb_" + randomBytes(32).toString("hex");
    await prisma.apiKey.create({
      data: {
        name: demoKeyName,
        keyHash: createHash("sha256").update(rawKey).digest("hex"),
        keyPrefix: rawKey.slice(0, 12),
        scope: "MT5_INGEST",
      },
    });
    console.log(`\n🔑 Demo API key created (store this — shown only once):`);
    console.log(`   ${rawKey}`);
    console.log(`   Add it to .env as CONNECTOR_API_KEYS=${rawKey}`);
  }

  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
