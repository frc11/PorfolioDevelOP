-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "avatarEmoji" TEXT,
ADD COLUMN     "avatarImageUrl" TEXT,
ADD COLUMN     "avatarInitials" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "internalNotes" TEXT;
