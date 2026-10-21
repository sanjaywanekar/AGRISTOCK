import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.INDUSTRIALIST_SEED_PASSWORD;

if (!password) {
  throw new Error("INDUSTRIALIST_SEED_PASSWORD environment variable is required");
}
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.users.upsert({
    where: {
      email: "industrialist@agristock.com",
    },
    update: {
      passwordHash,
      role: Role.INDUSTRIALIST,
      name: "Industrialist",
    },
    create: {
      name: "Industrialist",
      email: "industrialist@agristock.com",
      passwordHash,
      role: Role.INDUSTRIALIST,
    },
  });

  console.log("Industrialist created:");
  console.log(user.email);
  console.log("Password:", password);
  console.log("Role:", user.role);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });