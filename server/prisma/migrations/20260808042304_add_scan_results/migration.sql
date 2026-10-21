-- CreateTable
CREATE TABLE "ScanResults" (
    "scanId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "predictedLabel" TEXT,
    "confidence" DOUBLE PRECISION,
    "recommendedProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanResults_pkey" PRIMARY KEY ("scanId")
);

-- AddForeignKey
ALTER TABLE "ScanResults" ADD CONSTRAINT "ScanResults_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
