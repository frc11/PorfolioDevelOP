-- DropForeignKey
ALTER TABLE "OsMaintenancePayment" DROP CONSTRAINT "OsMaintenancePayment_projectId_fkey";

-- DropForeignKey
ALTER TABLE "OsPaymentMilestone" DROP CONSTRAINT "OsPaymentMilestone_projectId_fkey";

-- DropForeignKey
ALTER TABLE "OsTimeEntry" DROP CONSTRAINT "OsTimeEntry_taskId_fkey";

-- AlterTable
ALTER TABLE "OsTimeEntry"
ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Project"
ADD COLUMN     "agreedAmount" DECIMAL(10,2),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "estimatedEndDate" TIMESTAMP(3),
ADD COLUMN     "maintenanceStartDate" TIMESTAMP(3),
ADD COLUMN     "monthlyRate" DECIMAL(10,2),
ADD COLUMN     "osLeadId" TEXT;

-- AlterTable
ALTER TABLE "Task"
ADD COLUMN     "estimatedHours" DOUBLE PRECISION,
ADD COLUMN     "position" INTEGER DEFAULT 0;

-- Backfill organizations for legacy Agency OS projects that did not yet belong to a tenant
WITH organization_matches AS (
    SELECT
        op."id" AS "osProjectId",
        org."id" AS "organizationId",
        ROW_NUMBER() OVER (
            PARTITION BY op."id"
            ORDER BY
                CASE
                    WHEN lower(regexp_replace(org."companyName", '[^a-zA-Z0-9]+', '', 'g')) = lower(regexp_replace(op."businessName", '[^a-zA-Z0-9]+', '', 'g')) THEN 0
                    WHEN org."companyName" ILIKE op."businessName" || '%' THEN 1
                    WHEN op."businessName" ILIKE org."companyName" || '%' THEN 2
                    ELSE 3
                END,
                org."createdAt"
        ) AS "rank"
    FROM "OsProject" op
    JOIN "Organization" org
        ON lower(regexp_replace(org."companyName", '[^a-zA-Z0-9]+', '', 'g')) = lower(regexp_replace(op."businessName", '[^a-zA-Z0-9]+', '', 'g'))
        OR org."companyName" ILIKE op."businessName" || '%'
        OR op."businessName" ILIKE org."companyName" || '%'
),
resolved_os_projects AS (
    SELECT
        op."id",
        COALESCE(op."organizationId", om."organizationId", 'os-org-' || op."id") AS "resolvedOrganizationId",
        op."businessName"
    FROM "OsProject" op
    LEFT JOIN organization_matches om
        ON om."osProjectId" = op."id"
        AND om."rank" = 1
)
INSERT INTO "Organization" ("id", "companyName", "slug", "n8nWorkflowIds", "onboardingCompleted", "createdAt")
SELECT
    rop."resolvedOrganizationId",
    rop."businessName",
    'agency-os-' || rop."id",
    ARRAY[]::TEXT[],
    false,
    NOW()
FROM resolved_os_projects rop
WHERE rop."resolvedOrganizationId" = 'os-org-' || rop."id"
AND NOT EXISTS (
    SELECT 1
    FROM "Organization" org
    WHERE org."id" = rop."resolvedOrganizationId"
);

-- Persist the resolved organization on legacy Agency OS projects for consistency
WITH organization_matches AS (
    SELECT
        op."id" AS "osProjectId",
        org."id" AS "organizationId",
        ROW_NUMBER() OVER (
            PARTITION BY op."id"
            ORDER BY
                CASE
                    WHEN lower(regexp_replace(org."companyName", '[^a-zA-Z0-9]+', '', 'g')) = lower(regexp_replace(op."businessName", '[^a-zA-Z0-9]+', '', 'g')) THEN 0
                    WHEN org."companyName" ILIKE op."businessName" || '%' THEN 1
                    WHEN op."businessName" ILIKE org."companyName" || '%' THEN 2
                    ELSE 3
                END,
                org."createdAt"
        ) AS "rank"
    FROM "OsProject" op
    JOIN "Organization" org
        ON lower(regexp_replace(org."companyName", '[^a-zA-Z0-9]+', '', 'g')) = lower(regexp_replace(op."businessName", '[^a-zA-Z0-9]+', '', 'g'))
        OR org."companyName" ILIKE op."businessName" || '%'
        OR op."businessName" ILIKE org."companyName" || '%'
),
resolved_os_projects AS (
    SELECT
        op."id",
        COALESCE(op."organizationId", om."organizationId", 'os-org-' || op."id") AS "resolvedOrganizationId"
    FROM "OsProject" op
    LEFT JOIN organization_matches om
        ON om."osProjectId" = op."id"
        AND om."rank" = 1
)
UPDATE "OsProject" op
SET "organizationId" = rop."resolvedOrganizationId"
FROM resolved_os_projects rop
WHERE rop."id" = op."id"
AND op."organizationId" IS DISTINCT FROM rop."resolvedOrganizationId";

-- Backfill unified Project rows using the legacy Agency OS project ids
INSERT INTO "Project" (
    "id",
    "name",
    "description",
    "status",
    "agreedAmount",
    "monthlyRate",
    "maintenanceStartDate",
    "deliveredAt",
    "estimatedEndDate",
    "osLeadId",
    "organizationId"
)
SELECT
    op."id",
    op."name",
    op."description",
    CASE op."status"
        WHEN 'EN_DESARROLLO' THEN 'IN_PROGRESS'::"ProjectStatus"
        WHEN 'EN_REVISION' THEN 'REVIEW'::"ProjectStatus"
        WHEN 'ENTREGADO' THEN 'COMPLETED'::"ProjectStatus"
        WHEN 'EN_MANTENIMIENTO' THEN 'IN_PROGRESS'::"ProjectStatus"
        WHEN 'CANCELADO' THEN 'COMPLETED'::"ProjectStatus"
    END,
    op."agreedAmount",
    op."monthlyRate",
    op."maintenanceStartDate",
    op."deliveredAt",
    op."estimatedEndDate",
    op."leadId",
    op."organizationId"
FROM "OsProject" op
WHERE NOT EXISTS (
    SELECT 1
    FROM "Project" project
    WHERE project."id" = op."id"
);

-- Backfill unified Task rows using the legacy Agency OS task ids
INSERT INTO "Task" (
    "id",
    "title",
    "description",
    "status",
    "estimatedHours",
    "position",
    "projectId"
)
SELECT
    ot."id",
    ot."title",
    ot."description",
    CASE ot."status"
        WHEN 'PENDIENTE' THEN 'TODO'::"TaskStatus"
        WHEN 'EN_PROGRESO' THEN 'IN_PROGRESS'::"TaskStatus"
        WHEN 'COMPLETADA' THEN 'DONE'::"TaskStatus"
    END,
    ot."estimatedHours",
    ot."position",
    ot."projectId"
FROM "OsTask" ot
WHERE NOT EXISTS (
    SELECT 1
    FROM "Task" task
    WHERE task."id" = ot."id"
);

-- Backfill direct project links for time tracking before adding the new foreign key
UPDATE "OsTimeEntry" ote
SET "projectId" = ot."projectId"
FROM "OsTask" ot
WHERE ot."id" = ote."taskId"
AND ote."projectId" IS DISTINCT FROM ot."projectId";

-- CreateIndex
CREATE INDEX "OsTimeEntry_projectId_idx" ON "OsTimeEntry"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_osLeadId_key" ON "Project"("osLeadId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_osLeadId_fkey" FOREIGN KEY ("osLeadId") REFERENCES "OsLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsPaymentMilestone" ADD CONSTRAINT "OsPaymentMilestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsMaintenancePayment" ADD CONSTRAINT "OsMaintenancePayment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsTimeEntry" ADD CONSTRAINT "OsTimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OsTimeEntry" ADD CONSTRAINT "OsTimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
