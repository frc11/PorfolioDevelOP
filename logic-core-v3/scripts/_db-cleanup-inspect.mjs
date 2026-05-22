// Read-only inspection: dump candidate rows + cascade counts.
// No writes. Safe to run multiple times.
// Throwaway script — delete after cleanup sprint.
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const TARGET_ORG_SLUGS = [
  'agency-os-cmnkiwar4003a9fdwr63115kc',
  'agency-os-cmnkiw999002u9fdw2xr733hl',
];
const TARGET_BOT_SLUG = 'dsa';
const SONRISA_NORTE_SLUG = 'sonrisa-norte';
const DEVELOP_SLUG = 'develop';

function banner(t) {
  console.log('\n' + '='.repeat(70));
  console.log(t);
  console.log('='.repeat(70));
}

async function main() {
  const url = process.env.DATABASE_URL || '';
  const host = url.match(/@([^/]+)/)?.[1] ?? '?';
  banner(`ENV CHECK — host: ${host}`);

  banner('1) ORGS DUPLICADAS A BORRAR (agency-os-*)');
  for (const slug of TARGET_ORG_SLUGS) {
    const org = await prisma.organization.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            members: true,
            services: true,
            projects: true,
            messages: true,
            invoices: true,
            notifications: true,
            clientAssets: true,
            tickets: true,
            premiumModules: true,
            emailContacts: true,
            emailCampaigns: true,
            onboardingTasks: true,
          },
        },
      },
    });
    if (!org) {
      console.log(`  slug=${slug} NO ENCONTRADA`);
      continue;
    }
    console.log(JSON.stringify(org, null, 2));
    const sub = await prisma.subscription.findUnique({ where: { organizationId: org.id } });
    const bp = await prisma.clientBrandProfile.findUnique({ where: { organizationId: org.id } });
    const bot = await prisma.botConfig.findUnique({ where: { organizationId: org.id } });
    console.log('  Subscription:', sub);
    console.log('  ClientBrandProfile:', bp);
    console.log('  BotConfig:', bot);
  }

  banner('2) BOT DSA');
  const dsaBot = await prisma.botConfig.findUnique({
    where: { slug: TARGET_BOT_SLUG },
    include: {
      organization: { select: { id: true, slug: true, companyName: true } },
      knowledgeBase: true,
      _count: {
        select: {
          conversations: true,
          leads: true,
          quotaUsages: true,
          events: true,
          insights: true,
          alerts: true,
        },
      },
    },
  });
  if (!dsaBot) {
    console.log('  bot dsa NO ENCONTRADO');
  } else {
    console.log(JSON.stringify(dsaBot, null, 2));
    const convs = await prisma.conversation.findMany({
      where: { botConfigId: dsaBot.id },
      select: { id: true, sessionId: true, _count: { select: { messages: true } } },
    });
    const totalMsgs = convs.reduce((acc, c) => acc + c._count.messages, 0);
    console.log(`  Conversations: ${convs.length}, total messages cascade: ${totalMsgs}`);
  }

  banner('3) SONRISA NORTE (org del bot dsa) — solo lectura');
  const sn = await prisma.organization.findUnique({
    where: { slug: SONRISA_NORTE_SLUG },
    include: {
      _count: {
        select: {
          members: true,
          services: true,
          projects: true,
          tickets: true,
          premiumModules: true,
          messages: true,
          invoices: true,
          notifications: true,
        },
      },
      members: { select: { user: { select: { email: true, name: true } } } },
      botConfig: { select: { id: true, slug: true, botName: true, isActive: true } },
    },
  });
  console.log(JSON.stringify(sn, null, 2));

  banner('4) PROJECTS HUÉRFANOS (organizationId IS NULL)');
  const orphans = await prisma.project.findMany({
    where: { organizationId: null },
    include: {
      _count: { select: { tasks: true, paymentMilestones: true, maintenancePayments: true, timeEntries: true } },
    },
  });
  console.log(`  count = ${orphans.length}`);
  for (const p of orphans) {
    console.log(JSON.stringify(p, null, 2));
    const tasks = await prisma.task.findMany({
      where: { projectId: p.id },
      select: { id: true, title: true, status: true, createdAt: true },
    });
    console.log('  tasks:', tasks);
  }

  banner('5) ORG DEVELOP (destino propuesto del project huérfano)');
  const dev = await prisma.organization.findUnique({
    where: { slug: DEVELOP_SLUG },
    select: { id: true, slug: true, companyName: true, createdAt: true },
  });
  console.log(JSON.stringify(dev, null, 2));

  banner('6) BASELINE COUNTS (pre-cleanup)');
  const baseline = {
    Organization: await prisma.organization.count(),
    OrgMember: await prisma.orgMember.count(),
    Project: await prisma.project.count(),
    ProjectsOrphan: await prisma.project.count({ where: { organizationId: null } }),
    Task: await prisma.task.count(),
    BotConfig: await prisma.botConfig.count(),
    Conversation: await prisma.conversation.count(),
    ChatMessage: await prisma.chatMessage.count(),
    ChatbotLead: await prisma.chatbotLead.count(),
    ChatbotEvent: await prisma.chatbotEvent.count(),
    Subscription: await prisma.subscription.count(),
    Service: await prisma.service.count(),
  };
  console.log(JSON.stringify(baseline, null, 2));
}

main()
  .catch((e) => { console.error('ERROR:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
