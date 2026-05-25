-- CreateTable
CREATE TABLE "ExecutiveBriefSnapshot" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "healthScores" JSONB NOT NULL,
    "weekResults" JSONB NOT NULL,
    "periodKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutiveBriefSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExecutiveBriefSnapshot_organizationId_createdAt_idx" ON "ExecutiveBriefSnapshot"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutiveBriefSnapshot_organizationId_periodKey_key" ON "ExecutiveBriefSnapshot"("organizationId", "periodKey");

-- AddForeignKey
ALTER TABLE "ExecutiveBriefSnapshot" ADD CONSTRAINT "ExecutiveBriefSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
