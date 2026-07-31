/*
  Warnings:

  - You are about to drop the column `windowStart` on the `rate_limit` table. All the data in the column will be lost.
  - Added the required column `window_start` to the `rate_limit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "rate_limit_key_windowStart_idx";

-- AlterTable
ALTER TABLE "rate_limit" DROP COLUMN "windowStart",
ADD COLUMN     "window_start" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "rate_limit_key_window_start_idx" ON "rate_limit"("key", "window_start");
