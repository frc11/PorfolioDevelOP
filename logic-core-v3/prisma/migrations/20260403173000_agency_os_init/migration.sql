-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('PROSPECTO', 'DEMO_ENVIADA', 'VIO_VIDEO', 'RESPONDIO', 'CALL_AGENDADA', 'CERRADO', 'PERDIDO', 'POSTERGADO');

-- CreateEnum
CREATE TYPE "OsServiceType" AS ENUM ('WEB', 'AI_AGENT', 'AUTOMATION', 'CUSTOM_SOFTWARE');

-- CreateEnum
CREATE TYPE "OsProjectStatus" AS ENUM ('EN_DESARROLLO', 'EN_REVISION', 'ENTREGADO', 'EN_MANTENIMIENTO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OsTaskStatus" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "ActivityChannel" AS ENUM ('INSTAGRAM_DM', 'WHATSAPP', 'EMAIL', 'LLAMADA', 'LOOM_VIDEO', 'OTRO');

-- CreateEnum
CREATE TYPE "ActivityResult" AS ENUM ('SIN_RESPUESTA', 'RESPONDIO', 'CALL_AGENDADA', 'RECHAZADO', 'POSTERGADO');

-- CreateEnum
CREATE TYPE "MilestoneType" AS ENUM ('INICIO', 'ENTREGA');

-- CreateTable
CREATE TABLE "OsLead" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "industry" TEXT,
    "zone" TEXT,
    "source" TEXT,
    "instagramUrl" TEXT,
    "currentWebUrl" TEXT,
    "googleMapsUrl" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'PROSPECTO',
    "serviceType" "OsServiceType",
    "nextFollowUpAt" TIMESTAMP(3),
    "reactivateAt" TIMESTAMP(3),
    "notes" TEXT,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OsLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsLeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "channel" "ActivityChannel" NOT NULL,
    "result" "ActivityResult",
    "notes" TEXT,
    "performedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsLeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsDemo" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "serviceType" "OsServiceType",
    "demoUrl" TEXT NOT NULL,
    "loomUrl" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsDemo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsProject" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "businessName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "serviceType" "OsServiceType" NOT NULL,
    "status" "OsProjectStatus" NOT NULL DEFAULT 'EN_DESARROLLO',
    "agreedAmount" DECIMAL(10,2) NOT NULL,
    "monthlyRate" DECIMAL(10,2),
    "maintenanceStartDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedEndDate" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OsProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsPaymentMilestone" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "MilestoneType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsPaymentMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsMaintenancePayment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsMaintenancePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "OsTaskStatus" NOT NULL DEFAULT 'PENDIENTE',
    "estimatedHours" DOUBLE PRECISION,
    "position" INTEGER NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OsTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OsTimeEntry" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OsTimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OsLead_status_idx" ON "OsLead"("status");

-- CreateIndex
CREATE INDEX "OsLead_nextFollowUpAt_idx" ON "OsLead"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "OsLead_status_nextFollowUpAt_idx" ON "OsLead"("status", "nextFollowUpAt");

-- CreateIndex
CREATE INDEX "OsLead_assignedToId_idx" ON "OsLead"("assignedToId");

-- CreateIndex
CREATE INDEX "OsLeadActivity_leadId_createdAt_idx" ON "OsLeadActivity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "OsDemo_leadId_idx" ON "OsDemo"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "OsProject_leadId_key" ON "OsProject"("leadId");

-- CreateIndex
CREATE INDEX "OsProject_status_idx" ON "OsProject"("status");

-- CreateIndex
CREATE INDEX "OsProject_serviceType_idx" ON "OsProject"("serviceType");

-- CreateIndex
CREATE INDEX "OsPaymentMilestone_projectId_idx" ON "OsPaymentMilestone"("projectId");

-- CreateIndex
CREATE INDEX "OsMaintenancePayment_projectId_idx" ON "OsMaintenancePayment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "OsMaintenancePayment_projectId_month_year_key" ON "OsMaintenancePayment"("projectId", "month", "year");

-- CreateIndex
CREATE INDEX "OsTask_projectId_status_idx" ON "OsTask"("projectId", "status");

-- CreateIndex
CREATE INDEX "OsTask_assignedToId_idx" ON "OsTask"("assignedToId");

-- CreateIndex
CREATE INDEX "OsTimeEntry_taskId_idx" ON "OsTimeEntry"("taskId");

-- CreateIndex
CREATE INDEX "OsTimeEntry_userId_date_idx" ON "OsTimeEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "OsLead" ADD CONSTRAINT "OsLead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsLeadActivity" ADD CONSTRAINT "OsLeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "OsLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsLeadActivity" ADD CONSTRAINT "OsLeadActivity_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsDemo" ADD CONSTRAINT "OsDemo_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "OsLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsProject" ADD CONSTRAINT "OsProject_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "OsLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsPaymentMilestone" ADD CONSTRAINT "OsPaymentMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "OsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsMaintenancePayment" ADD CONSTRAINT "OsMaintenancePayment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "OsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsTask" ADD CONSTRAINT "OsTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "OsProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsTask" ADD CONSTRAINT "OsTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsTimeEntry" ADD CONSTRAINT "OsTimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OsTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsTimeEntry" ADD CONSTRAINT "OsTimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
