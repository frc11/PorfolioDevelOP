-- CreateEnum
CREATE TYPE "NotificationMode" AS ENUM ('IMMEDIATE', 'DAILY_DIGEST', 'DISABLED');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "leadNotificationEmail" TEXT,
ADD COLUMN     "leadNotificationMode" "NotificationMode" DEFAULT 'IMMEDIATE';
