const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const user = await prisma.user.upsert({
    where: { id: 'demo-user-id' },
    update: {},
    create: {
      id: 'demo-user-id',
      email: 'demo@example.com',
      name: 'Demo User',
      apiKey: 'cb_live_demo123456789',
      subscriptionStatus: 'pro',
      subscriptionPlan: 'pro',
      subscriptionExpiry: new Date('2025-06-30'),
      stripeCustomerId: 'cus_demo123456',
      stripeSubscriptionId: 'sub_demo123456',
    },
  });

  console.log('Demo user created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
