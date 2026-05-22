// Destructive cleanup — runs in dev branch of Neon only.
// Wrapped in a single prisma.$transaction so it's all-or-nothing.
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

// Hard-coded targets (verified read-only in round 1+2 inspections).
const TARGETS = {
  sigmaDupOrgId: 'os-org-cmnkiwar4003a9fdwr63115kc',
  sigmaDupProjectId: 'cmnkiwar4003a9fdwr63115kc',
  sonrisaDupOrgId: 'os-org-cmnkiw999002u9fdw2xr733hl',
  orphanProjectId: 'osv2-project-agency-os-internal-motor-interno-de-automatizacion-operativa',
  developOrgId: 'cmp2rnpv000009fdgr680t5bq',
  chatbotBotSlug: 'chatbot',
};

const EXPECTED_DEV_HOST = 'ep-quiet-waterfall-acv0fpll-pooler.sa-east-1.aws.neon.tech';

function banner(t) {
  console.log('\n' + '='.repeat(70));
  console.log(t);
  console.log('='.repeat(70));
}

async function main() {
  // Safety check 1: confirm we're on the dev branch.
  const url = process.env.DATABASE_URL || '';
  const host = url.match(/@([^/]+)/)?.[1] ?? '?';
  banner(`SAFETY CHECK — host: ${host}`);
  if (host !== EXPECTED_DEV_HOST) {
    console.error(`ABORT: host ${host} != expected dev host ${EXPECTED_DEV_HOST}`);
    process.exit(1);
  }
  console.log('  OK — running against dev branch.');

  // Safety check 2: verify all targets exist before touching anything.
  banner('PRE-FLIGHT — verify targets exist');
  const checks = await Promise.all([
    prisma.organization.findUnique({ where: { id: TARGETS.sigmaDupOrgId }, select: { id: true, slug: true } }),
    prisma.project.findUnique({ where: { id: TARGETS.sigmaDupProjectId }, select: { id: true, name: true, organizationId: true } }),
    prisma.organization.findUnique({ where: { id: TARGETS.sonrisaDupOrgId }, select: { id: true, slug: true } }),
    prisma.project.findUnique({ where: { id: TARGETS.orphanProjectId }, select: { id: true, name: true, organizationId: true } }),
    prisma.organization.findUnique({ where: { id: TARGETS.developOrgId }, select: { id: true, slug: true } }),
    prisma.botConfig.findUnique({ where: { slug: TARGETS.chatbotBotSlug }, select: { id: true, slug: true, isActive: true } }),
  ]);
  const [sigmaOrg, sigmaProject, sonrisaOrg, orphan, dev, chatbot] = checks;

  const missing = [];
  if (!sigmaOrg) missing.push(`sigmaDupOrgId=${TARGETS.sigmaDupOrgId}`);
  if (!sigmaProject) missing.push(`sigmaDupProjectId=${TARGETS.sigmaDupProjectId}`);
  if (!sonrisaOrg) missing.push(`sonrisaDupOrgId=${TARGETS.sonrisaDupOrgId}`);
  if (!orphan) missing.push(`orphanProjectId=${TARGETS.orphanProjectId}`);
  if (!dev) missing.push(`developOrgId=${TARGETS.developOrgId}`);
  if (!chatbot) missing.push(`chatbotBotSlug=${TARGETS.chatbotBotSlug}`);
  if (missing.length > 0) {
    console.error('ABORT — missing rows:', missing);
    process.exit(1);
  }
  if (sigmaProject.organizationId !== TARGETS.sigmaDupOrgId) {
    console.error(`ABORT — sigmaDupProject.organizationId is ${sigmaProject.organizationId}, expected ${TARGETS.sigmaDupOrgId}`);
    process.exit(1);
  }
  if (orphan.organizationId !== null) {
    console.error(`ABORT — orphan project no longer orphan (organizationId=${orphan.organizationId})`);
    process.exit(1);
  }
  console.log('  OK — all targets present and in expected state.');

  // Baseline counts
  banner('BASELINE COUNTS');
  const before = {
    Organization: await prisma.organization.count(),
    OrgMember: await prisma.orgMember.count(),
    Project: await prisma.project.count(),
    ProjectsOrphan: await prisma.project.count({ where: { organizationId: null } }),
    Task: await prisma.task.count(),
    BotConfig: await prisma.botConfig.count(),
    KnowledgeBase: await prisma.knowledgeBase.count(),
    OsPaymentMilestone: await prisma.osPaymentMilestone.count(),
    OsMaintenancePayment: await prisma.osMaintenancePayment.count(),
    OsTimeEntry: await prisma.osTimeEntry.count(),
  };
  console.log(JSON.stringify(before, null, 2));

  // Execute in transaction.
  banner('EXECUTING TRANSACTION');
  const result = await prisma.$transaction(async (tx) => {
    // Step 1: delete the Sigma duplicate project (cascade: tasks, milestones, maintenance payments, time entries).
    const delSigmaProject = await tx.project.delete({
      where: { id: TARGETS.sigmaDupProjectId },
    });
    console.log(`  [1/5] Deleted Project ${delSigmaProject.id} ("${delSigmaProject.name}")`);

    // Step 2: delete the Sigma duplicate org (no project FK left referencing it).
    const delSigmaOrg = await tx.organization.delete({
      where: { id: TARGETS.sigmaDupOrgId },
    });
    console.log(`  [2/5] Deleted Organization ${delSigmaOrg.id} ("${delSigmaOrg.companyName}")`);

    // Step 3: delete the Sonrisa duplicate org (cascade: BotConfig dsa, KnowledgeBase).
    const delSonrisaOrg = await tx.organization.delete({
      where: { id: TARGETS.sonrisaDupOrgId },
    });
    console.log(`  [3/5] Deleted Organization ${delSonrisaOrg.id} ("${delSonrisaOrg.companyName}") — cascade bot dsa + KB`);

    // Step 4: reassign orphan project to develop.
    const updOrphan = await tx.project.update({
      where: { id: TARGETS.orphanProjectId },
      data: { organizationId: TARGETS.developOrgId },
    });
    console.log(`  [4/5] Reassigned Project ${updOrphan.id} → organizationId=${updOrphan.organizationId}`);

    // Step 5: deactivate the leftover test bot in empresa-demo.
    const updChatbot = await tx.botConfig.update({
      where: { slug: TARGETS.chatbotBotSlug },
      data: { isActive: false },
    });
    console.log(`  [5/5] Set BotConfig slug="${updChatbot.slug}" isActive=${updChatbot.isActive}`);

    return { delSigmaProject, delSigmaOrg, delSonrisaOrg, updOrphan, updChatbot };
  });

  console.log('\nTRANSACTION COMMITTED.');

  // After counts
  banner('POST-CLEANUP COUNTS');
  const after = {
    Organization: await prisma.organization.count(),
    OrgMember: await prisma.orgMember.count(),
    Project: await prisma.project.count(),
    ProjectsOrphan: await prisma.project.count({ where: { organizationId: null } }),
    Task: await prisma.task.count(),
    BotConfig: await prisma.botConfig.count(),
    KnowledgeBase: await prisma.knowledgeBase.count(),
    OsPaymentMilestone: await prisma.osPaymentMilestone.count(),
    OsMaintenancePayment: await prisma.osMaintenancePayment.count(),
    OsTimeEntry: await prisma.osTimeEntry.count(),
  };
  console.log(JSON.stringify(after, null, 2));

  // Diff
  banner('DIFF');
  for (const k of Object.keys(before)) {
    const d = after[k] - before[k];
    if (d !== 0) console.log(`  ${k}: ${before[k]} → ${after[k]} (${d >= 0 ? '+' : ''}${d})`);
  }

  // Integrity checks
  banner('INTEGRITY CHECKS');
  const stillOrphan = await prisma.project.findMany({ where: { organizationId: null }, select: { id: true } });
  console.log(`  Projects still orphan: ${stillOrphan.length}`);
  const ghost1 = await prisma.organization.findUnique({ where: { id: TARGETS.sigmaDupOrgId } });
  const ghost2 = await prisma.organization.findUnique({ where: { id: TARGETS.sonrisaDupOrgId } });
  const ghost3 = await prisma.botConfig.findUnique({ where: { slug: 'dsa' } });
  console.log(`  Sigma dup org gone:    ${ghost1 === null}`);
  console.log(`  Sonrisa dup org gone:  ${ghost2 === null}`);
  console.log(`  Bot dsa gone:          ${ghost3 === null}`);
  const reassigned = await prisma.project.findUnique({ where: { id: TARGETS.orphanProjectId }, select: { id: true, organizationId: true } });
  console.log(`  Orphan reassigned:     ${reassigned?.organizationId === TARGETS.developOrgId}`);
  const chatbotState = await prisma.botConfig.findUnique({ where: { slug: 'chatbot' }, select: { isActive: true } });
  console.log(`  Bot chatbot isActive=false: ${chatbotState?.isActive === false}`);
}

main()
  .catch((e) => {
    console.error('ERROR — transaction rolled back:', e);
    process.exit(1);
  })
  .finally(async () => { await prisma.$disconnect(); });
