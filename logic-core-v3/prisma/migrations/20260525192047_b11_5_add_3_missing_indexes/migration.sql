-- CreateIndex
CREATE INDEX "Notification_organizationId_createdAt_idx" ON "Notification"("organizationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "chatbot_conversation_botConfigId_lastMessageAt_idx" ON "chatbot_conversation"("botConfigId", "lastMessageAt" DESC);

-- CreateIndex
CREATE INDEX "chatbot_events_botConfigId_type_createdAt_idx" ON "chatbot_events"("botConfigId", "type", "createdAt" DESC);
