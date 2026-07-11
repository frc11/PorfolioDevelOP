CREATE INDEX "Service_organizationId_idx" ON "Service"("organizationId");
CREATE INDEX "Invoice_organizationId_idx" ON "Invoice"("organizationId");
CREATE INDEX "Message_organizationId_createdAt_idx" ON "Message"("organizationId", "createdAt" DESC);
CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt");
CREATE INDEX "ContactSubmission_read_idx" ON "ContactSubmission"("read");
CREATE INDEX "ContactSubmission_referralCode_idx" ON "ContactSubmission"("referralCode");
