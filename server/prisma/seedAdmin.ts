import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.users.findUnique({
    where: {
      email: "admin@agristock.com",
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists.");
    return;
  }

  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

if (!adminPassword) {
  throw new Error("ADMIN_SEED_PASSWORD environment variable is required");
}

const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.users.create({
    data: {
      name: "System Admin",
      email: "admin@agristock.com",
      passwordHash: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log("Admin created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });