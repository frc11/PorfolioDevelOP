// Round 2: clarify edge cases discovered in round 1.
// Read-only.
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

function banner(t) {
  console.log('\n' + '='.repeat(70));
  console.log(t);
  console.log('='.repeat(70));
}

async function main() {
  // A) Project under agency-os-cmnkiwar... (Estudio Contable Sigma duplicado)
  banner('A) PROJECT bajo la org duplicada de Sigma (agency-os-cmnkiwar...)');
  const sigmaDupProjects = await prisma.project.findMany({
    where: { organizationId: 'os-org-cmnkiwar4003a9fdwr63115kc' },
    include: {
      _count: { select: { tasks: true, paymentMilestones: true, maintenancePayments: true, timeEntries: true } },
    },
  });
  console.log(JSON.stringify(sigmaDupProjects, null, 2));
  for (const p of sigmaDupProjects) {
    const tasks = await prisma.task.findMany({
      where: { projectId: p.id },
      select: { id: true, title: true, status: true, createdAt: true },
    });
    console.log(`  Tasks of project ${p.id}:`, tasks);
  }

  // B) The real sigma-contable org for comparison
  banner('B) ORG sigma-contable (la real, para comparar)');
  const sigmaReal = await prisma.organization.findUnique({
    where: { slug: 'sigma-contable' },
    include: {
      _count: { select: { members: true, services: true, projects: true, tickets: true, messages: true, invoices: true } },
      projects: { select: { id: true, name: true, status: true } },
      botConfig: { select: { id: true, slug: true, botName: true, isActive: true } },
    },
  });
  console.log(JSON.stringify(sigmaReal, null, 2));

  // C) All 3 BotConfigs (audit reported 2, we found 3 — what's the third?)
  banner('C) ALL BotConfigs');
  const allBots = await prisma.botConfig.findMany({
    select: {
      id: true,
      slug: true,
      botName: true,
      isActive: true,
      organizationId: true,
      organization: { select: { slug: true, companyName: true } },
      _count: { select: { conversations: true, leads: true, events: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  console.log(JSON.stringify(allBots, null, 2));

  // D) All Orgs (full list with key counts)
  banner('D) ALL Orgs (inventario)');
  const allOrgs = await prisma.organization.findMany({
    select: {
      id: true,
      slug: true,
      companyName: true,
      onboardingCompleted: true,
      createdAt: true,
      _count: { select: { members: true, projects: true, services: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
  console.log(JSON.stringify(allOrgs, null, 2));

  // E) develop org full members (to confirm it's safe destination)
  banner('E) ORG develop — members & projects');
  const dev = await prisma.organization.findUnique({
    where: { slug: 'develop' },
    include: {
      members: { include: { user: { select: { email: true, name: true, role: true } } } },
      projects: { select: { id: true, name: true, status: true, organizationId: true } },
      botConfig: { select: { slug: true, botName: true, isActive: true } },
    },
  });
  console.log(JSON.stringify(dev, null, 2));
}

main()
  .catch((e) => { console.error('ERROR:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
