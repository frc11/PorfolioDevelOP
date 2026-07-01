-- CreateEnum
CREATE TYPE "PanelAnnouncementAudience" AS ENUM ('ALL', 'ORG');

-- CreateTable
CREATE TABLE "PanelAnnouncement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" "PanelAnnouncementAudience" NOT NULL DEFAULT 'ALL',
    "organizationId" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PanelAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PanelAnnouncementRead" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PanelAnnouncementRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PanelAnnouncement_publishedAt_idx" ON "PanelAnnouncement"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX "PanelAnnouncement_organizationId_idx" ON "PanelAnnouncement"("organizationId");

-- CreateIndex
CREATE INDEX "PanelAnnouncementRead_userId_idx" ON "PanelAnnouncementRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PanelAnnouncementRead_announcementId_userId_key" ON "PanelAnnouncementRead"("announcementId", "userId");

-- AddForeignKey
ALTER TABLE "PanelAnnouncement" ADD CONSTRAINT "PanelAnnouncement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelAnnouncementRead" ADD CONSTRAINT "PanelAnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "PanelAnnouncement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PanelAnnouncementRead" ADD CONSTRAINT "PanelAnnouncementRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
