ALTER TABLE "AgencySettings"
ADD COLUMN "osWeeklyDemoTarget" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN "osTelegramBotToken" TEXT,
ADD COLUMN "osTelegramChatId" TEXT;
