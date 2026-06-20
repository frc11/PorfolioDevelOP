-- CreateIndex
CREATE INDEX "OsLead_assignedToId_nextFollowUpAt_idx" ON "OsLead"("assignedToId", "nextFollowUpAt");

-- CreateIndex
CREATE INDEX "OsLeadActivity_performedById_createdAt_idx" ON "OsLeadActivity"("performedById", "createdAt");
