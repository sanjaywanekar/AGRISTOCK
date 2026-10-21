const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const scans = await prisma.scanResults.findMany({
    where: {
      recommendedProductId: {
        not: null,
      },
    },
    include: {
      recommendedProduct: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  console.dir(scans, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());