-- Migration: multi_tenancy_organizations
-- Transforms Client (1:1 User) → Organization + OrgMember join table
-- Data-safe: renames tables/columns, migrates userId data to OrgMember rows.
-- Apply via: npx prisma migrate dev --create-only --name multi_tenancy_organizations
--   then replace the generated SQL with this file, then: npx prisma migrate dev

-- ─── Step 1: Rename Client table → Organization ───────────────────────────────
ALTER TABLE "Client" RENAME TO "Organization";

-- ─── Step 2: Add OrgRole enum ────────────────────────────────────────────────
CREATE TYPE "OrgRole" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');

-- ─── Step 3: Create OrgMember join table ─────────────────────────────────────
CREATE TABLE "OrgMember" (
    "id"             TEXT        NOT NULL,
    "userId"         TEXT        NOT NULL,
    "organizationId" TEXT        NOT NULL,
    "role"           "OrgRole"   NOT NULL DEFAULT 'ADMIN',
    "joinedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrgMember_pkey" PRIMARY KEY ("id")
);

-- ─── Step 4: Migrate data — each Organization.userId becomes an ADMIN OrgMember ──
INSERT INTO "OrgMember" ("id", "userId", "organizationId", "role", "joinedAt")
SELECT
    gen_random_uuid()::text,
    o."userId",
    o."id",
    'ADMIN'::"OrgRole",
    CURRENT_TIMESTAMP
FROM "Organization" o
WHERE o."userId" IS NOT NULL;

-- ─── Step 5: Add FK constraints and unique/indexes on OrgMember ──────────────
ALTER TABLE "OrgMember"
    ADD CONSTRAINT "OrgMember_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrgMember"
    ADD CONSTRAINT "OrgMember_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "OrgMember_userId_organizationId_key"
    ON "OrgMember"("userId", "organizationId");

CREATE INDEX "OrgMember_userId_idx"         ON "OrgMember"("userId");
CREATE INDEX "OrgMember_organizationId_idx" ON "OrgMember"("organizationId");

-- ─── Step 6: Drop userId FK and column from Organization ─────────────────────
-- PostgreSQL retains the original constraint name even after table rename.
ALTER TABLE "Organization" DROP CONSTRAINT IF EXISTS "Client_userId_fkey";
ALTER TABLE "Organization" DROP CONSTRAINT IF EXISTS "Organization_userId_fkey";
ALTER TABLE "Organization" DROP COLUMN "userId";

-- ─── Step 7: Service — rename clientId → organizationId ──────────────────────
ALTER TABLE "Service" RENAME COLUMN "clientId" TO "organizationId";
ALTER TABLE "Service" DROP CONSTRAINT IF EXISTS "Service_clientId_fkey";
ALTER TABLE "Service"
    ADD CONSTRAINT "Service_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Step 8: Project — rename clientId → organizationId ──────────────────────
ALTER TABLE "Project" RENAME COLUMN "clientId" TO "organizationId";
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_clientId_fkey";
ALTER TABLE "Project"
    ADD CONSTRAINT "Project_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Step 9: Message — rename clientId → organizationId ──────────────────────
ALTER TABLE "Message" RENAME COLUMN "clientId" TO "organizationId";
ALTER TABLE "Message" DROP CONSTRAINT IF EXISTS "Message_clientId_fkey";
ALTER TABLE "Message"
    ADD CONSTRAINT "Message_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Step 10: Invoice — rename clientId → organizationId ─────────────────────
ALTER TABLE "Invoice" RENAME COLUMN "clientId" TO "organizationId";
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_clientId_fkey";
ALTER TABLE "Invoice"
    ADD CONSTRAINT "Invoice_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Step 11: Rename Role enum value CLIENT → ORG_MEMBER ─────────────────────
ALTER TYPE "Role" RENAME VALUE 'CLIENT' TO 'ORG_MEMBER';
