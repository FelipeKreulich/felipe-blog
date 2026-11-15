-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "newsletterSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);
