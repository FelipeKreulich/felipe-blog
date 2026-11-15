-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN "linkUserId" TEXT,
ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_userId_key" ON "Subscriber"("userId");
