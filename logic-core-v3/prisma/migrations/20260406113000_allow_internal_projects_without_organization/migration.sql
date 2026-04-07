ALTER TABLE "Project" DROP CONSTRAINT "Project_organizationId_fkey";

ALTER TABLE "Project"
ALTER COLUMN "organizationId" DROP NOT NULL;

UPDATE "Project"
SET "organizationId" = NULL
WHERE "organizationId" IN (
  SELECT "id"
  FROM "Organization"
  WHERE "slug" = 'agency-os-internal'
);

DELETE FROM "Service"
WHERE "organizationId" IN (
  SELECT "id"
  FROM "Organization"
  WHERE "slug" = 'agency-os-internal'
);

DELETE FROM "Organization"
WHERE "slug" = 'agency-os-internal'
  AND NOT EXISTS (
    SELECT 1
    FROM "Project"
    WHERE "Project"."organizationId" = "Organization"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "OrgMember"
    WHERE "OrgMember"."organizationId" = "Organization"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "Subscription"
    WHERE "Subscription"."organizationId" = "Organization"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "Message"
    WHERE "Message"."organizationId" = "Organization"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "Invoice"
    WHERE "Invoice"."organizationId" = "Organization"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "Notification"
    WHERE "Notification"."organizationId" = "Organization"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "ClientAsset"
    WHERE "ClientAsset"."organizationId" = "Organization"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "ClientBrandProfile"
    WHERE "ClientBrandProfile"."organizationId" = "Organization"."id"
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "Ticket"
    WHERE "Ticket"."organizationId" = "Organization"."id"
  );

ALTER TABLE "Project"
ADD CONSTRAINT "Project_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
