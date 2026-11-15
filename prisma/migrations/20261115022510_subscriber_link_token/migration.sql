-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN "linkExpiresAt" TIMESTAMP(3),
ADD COLUMN "linkToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_linkToken_key" ON "Subscriber"("linkToken");
