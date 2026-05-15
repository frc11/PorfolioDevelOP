-- CreateTable
CREATE TABLE "chatbot_events" (
    "id" TEXT NOT NULL,
    "botConfigId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "conversationId" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chatbot_events_botConfigId_createdAt_idx" ON "chatbot_events"("botConfigId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "chatbot_events_level_createdAt_idx" ON "chatbot_events"("level", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "chatbot_events" ADD CONSTRAINT "chatbot_events_botConfigId_fkey" FOREIGN KEY ("botConfigId") REFERENCES "chatbot_bot_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_events" ADD CONSTRAINT "chatbot_events_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chatbot_conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
