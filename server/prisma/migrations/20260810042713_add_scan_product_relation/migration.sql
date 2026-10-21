-- AddForeignKey
ALTER TABLE "ScanResults" ADD CONSTRAINT "ScanResults_recommendedProductId_fkey" FOREIGN KEY ("recommendedProductId") REFERENCES "Products"("productId") ON DELETE SET NULL ON UPDATE CASCADE;
