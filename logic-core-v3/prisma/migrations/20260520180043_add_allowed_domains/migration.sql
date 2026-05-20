-- AlterTable
ALTER TABLE "chatbot_bot_config" ADD COLUMN     "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[];
