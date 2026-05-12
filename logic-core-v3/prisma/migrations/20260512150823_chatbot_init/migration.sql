-- CreateTable
CREATE TABLE "chatbot_bot_config" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "botName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accentColor" TEXT NOT NULL DEFAULT '#06b6d4',
    "accentSecondary" TEXT,
    "chatSurfaceTint" TEXT,
    "avatarStyle" TEXT NOT NULL DEFAULT 'neuro',
    "avatarImageUrl" TEXT,
    "avatarEmoji" TEXT,
    "borderRadius" TEXT NOT NULL DEFAULT 'medium',
    "surfaceStyle" TEXT NOT NULL DEFAULT 'glass',
    "position" TEXT NOT NULL DEFAULT 'bottom_right',
    "fontStyle" TEXT NOT NULL DEFAULT 'sans',
    "bubbleStyle" TEXT NOT NULL DEFAULT 'rounded',
    "intensityLevel" TEXT NOT NULL DEFAULT 'medium',
    "tone" TEXT NOT NULL DEFAULT 'informal_rioplatense',
    "welcomeMessage" TEXT NOT NULL,
    "proactivePrompts" JSONB NOT NULL DEFAULT '[]',
    "quickReplies" JSONB NOT NULL DEFAULT '[]',
    "routeColorMap" JSONB NOT NULL DEFAULT '{}',
    "whatsappNumber" TEXT,
    "whatsappMessage" TEXT,
    "llmProvider" TEXT NOT NULL DEFAULT 'google',
    "llmModel" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxOutputTokens" INTEGER NOT NULL DEFAULT 800,
    "monthlyQuota" INTEGER NOT NULL DEFAULT 1000,
    "industry" TEXT NOT NULL DEFAULT 'generic',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_bot_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_knowledge_base" (
    "id" TEXT NOT NULL,
    "botConfigId" TEXT NOT NULL,
    "businessInfo" TEXT NOT NULL DEFAULT '',
    "servicesOrProducts" TEXT NOT NULL DEFAULT '',
    "faq" TEXT NOT NULL DEFAULT '',
    "policies" TEXT NOT NULL DEFAULT '',
    "salesGuidance" TEXT NOT NULL DEFAULT '',
    "toneExamples" TEXT NOT NULL DEFAULT '',
    "forbiddenStatements" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_conversation" (
    "id" TEXT NOT NULL,
    "botConfigId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrerUrl" TEXT,
    "currentPath" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "leadCaptured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "chatbot_conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_lead" (
    "id" TEXT NOT NULL,
    "botConfigId" TEXT NOT NULL,
    "conversationId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "intent" TEXT,
    "message" TEXT,
    "notificationSent" BOOLEAN NOT NULL DEFAULT false,
    "notificationSentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'new',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_quota_usage" (
    "id" TEXT NOT NULL,
    "botConfigId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "conversationsCount" INTEGER NOT NULL DEFAULT 0,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "alert80Sent" BOOLEAN NOT NULL DEFAULT false,
    "alert80SentAt" TIMESTAMP(3),
    "degradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_quota_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_bot_config_organizationId_key" ON "chatbot_bot_config"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_bot_config_slug_key" ON "chatbot_bot_config"("slug");

-- CreateIndex
CREATE INDEX "chatbot_bot_config_slug_idx" ON "chatbot_bot_config"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_knowledge_base_botConfigId_key" ON "chatbot_knowledge_base"("botConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_conversation_sessionId_key" ON "chatbot_conversation"("sessionId");

-- CreateIndex
CREATE INDEX "chatbot_conversation_botConfigId_startedAt_idx" ON "chatbot_conversation"("botConfigId", "startedAt");

-- CreateIndex
CREATE INDEX "chatbot_conversation_sessionId_idx" ON "chatbot_conversation"("sessionId");

-- CreateIndex
CREATE INDEX "chatbot_message_conversationId_createdAt_idx" ON "chatbot_message"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_lead_conversationId_key" ON "chatbot_lead"("conversationId");

-- CreateIndex
CREATE INDEX "chatbot_lead_botConfigId_capturedAt_idx" ON "chatbot_lead"("botConfigId", "capturedAt");

-- CreateIndex
CREATE INDEX "chatbot_lead_status_idx" ON "chatbot_lead"("status");

-- CreateIndex
CREATE INDEX "chatbot_quota_usage_botConfigId_idx" ON "chatbot_quota_usage"("botConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_quota_usage_botConfigId_year_month_key" ON "chatbot_quota_usage"("botConfigId", "year", "month");

-- AddForeignKey
ALTER TABLE "chatbot_bot_config" ADD CONSTRAINT "chatbot_bot_config_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_knowledge_base" ADD CONSTRAINT "chatbot_knowledge_base_botConfigId_fkey" FOREIGN KEY ("botConfigId") REFERENCES "chatbot_bot_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_conversation" ADD CONSTRAINT "chatbot_conversation_botConfigId_fkey" FOREIGN KEY ("botConfigId") REFERENCES "chatbot_bot_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_message" ADD CONSTRAINT "chatbot_message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chatbot_conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_lead" ADD CONSTRAINT "chatbot_lead_botConfigId_fkey" FOREIGN KEY ("botConfigId") REFERENCES "chatbot_bot_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_lead" ADD CONSTRAINT "chatbot_lead_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chatbot_conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_quota_usage" ADD CONSTRAINT "chatbot_quota_usage_botConfigId_fkey" FOREIGN KEY ("botConfigId") REFERENCES "chatbot_bot_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;
