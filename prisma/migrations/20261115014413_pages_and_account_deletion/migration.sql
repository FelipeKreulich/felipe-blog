-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_key_locale_key" ON "Page"("key", "locale");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
