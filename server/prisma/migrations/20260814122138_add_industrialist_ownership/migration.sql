-- AlterTable
ALTER TABLE "Expenses" ADD COLUMN     "industrialistId" TEXT;

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "industrialistId" TEXT;

-- AlterTable
ALTER TABLE "Purchases" ADD COLUMN     "industrialistId" TEXT;

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "industrialistId" TEXT;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_industrialistId_fkey" FOREIGN KEY ("industrialistId") REFERENCES "Users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_industrialistId_fkey" FOREIGN KEY ("industrialistId") REFERENCES "Users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_industrialistId_fkey" FOREIGN KEY ("industrialistId") REFERENCES "Users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenses" ADD CONSTRAINT "Expenses_industrialistId_fkey" FOREIGN KEY ("industrialistId") REFERENCES "Users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
