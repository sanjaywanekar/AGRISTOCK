/*
  Warnings:

  - Made the column `industrialistId` on table `Expenses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industrialistId` on table `Products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industrialistId` on table `Purchases` required. This step will fail if there are existing NULL values in that column.
  - Made the column `industrialistId` on table `Sales` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Expenses" DROP CONSTRAINT "Expenses_industrialistId_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_industrialistId_fkey";

-- DropForeignKey
ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_industrialistId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_industrialistId_fkey";

-- AlterTable
ALTER TABLE "Expenses" ALTER COLUMN "industrialistId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "industrialistId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Purchases" ALTER COLUMN "industrialistId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Sales" ALTER COLUMN "industrialistId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_industrialistId_fkey" FOREIGN KEY ("industrialistId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_industrialistId_fkey" FOREIGN KEY ("industrialistId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_industrialistId_fkey" FOREIGN KEY ("industrialistId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_industrialistId_fkey" FOREIGN KEY ("industrialistId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
