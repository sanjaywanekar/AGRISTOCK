const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.products.findMany({
    select: {
      productId: true,
      name: true,
      targetCondition: true,
      dosage: true,
      applicationMethod: true,
    },
    orderBy: {
      productId: "asc",
    },
  });

  console.table(products);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());