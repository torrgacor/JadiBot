-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "renewalNoticeFor" DATETIME;

-- CreateIndex
CREATE INDEX "Subscription_renewalNoticeFor_idx" ON "Subscription"("renewalNoticeFor");
