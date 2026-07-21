import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Security quick-win — modelos del portal con organizationId propio (ver
// prisma/schema.prisma, relación directa con Organization). Fuente única de
// la lista: acceso directo (`prisma.<modelo>.`) fuera de src/lib/isolation
// queda en warn hasta que se migren los call-sites existentes — ver
// security/multi-tenant-callsites-pendientes.txt.
const PORTAL_TENANT_MODELS = [
  "service",
  "project",
  "message",
  "subscription",
  "invoice",
  "notification",
  "ticket",
  "orgMember",
  "emailContact",
  "emailCampaign",
  "clientAsset",
  "clientBrandProfile",
  "onboardingTask",
  "organizationModule",
  "panelAnnouncement",
  "referralCode",
  "businessMetric",
  "pageView",
  "weeklyReportLog",
  "executiveBriefSnapshot",
];

// Selector compartido: solo matchea el identificador literal `prisma` (el
// export de @/lib/prisma). Los escapes legítimos de unsafeGlobalQuery pasan
// el cliente por un callback con OTRO nombre (c/client/tx — ver
// src/lib/isolation/index.ts), así que nunca matchean este selector.
const directPortalModelAccessSelector = {
  selector: `MemberExpression[object.name='prisma'][property.name=/^(${PORTAL_TENANT_MODELS.join("|")})$/]`,
  message:
    "Acceso directo a un modelo del portal con organizationId propio. Migrar a src/lib/isolation/ (forOrg) o justificar con unsafeGlobalQuery. WARN temporal: ver security/multi-tenant-callsites-pendientes.txt.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Motor WhatsApp: frontera de imports (src/modules/motor/README.md).
  {
    files: ["src/modules/motor/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/modules/*",
                "!@/modules/motor",
                "!@/modules/motor/*",
                "!@/modules/chatbot/public-api",
              ],
              message:
                "src/modules/motor no puede importar de otros módulos, salvo @/modules/chatbot/public-api.",
            },
            {
              group: ["@/app/*", "@/app"],
              message: "src/modules/motor no puede importar de src/app.",
            },
            {
              group: ["@/lib/prisma"],
              message:
                "src/modules/motor no puede importar @/lib/prisma directamente. Usar src/lib/isolation/ (B0-S2).",
            },
          ],
        },
      ],
    },
  },
  // Chatbot: frontera de aislamiento (B0-S3). Todo acceso a Prisma de los modelos
  // del chatbot pasa por src/lib/isolation/ (forOrg / unsafeGlobalQuery). Cubre el
  // árbol completo, scripts de dev incluidos: ni @/lib/prisma ni un PrismaClient
  // propio. El único acceso directo permitido vive dentro de src/lib/isolation/.
  {
    files: [
      "src/modules/chatbot/**/*.{ts,tsx}",
      "src/app/api/chatbot/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/prisma",
              message:
                "El chatbot no puede importar @/lib/prisma directamente. Usar src/lib/isolation/ (forOrg / unsafeGlobalQuery) — B0-S3.",
            },
          ],
          patterns: [
            {
              group: ["**/lib/prisma"],
              message:
                "El chatbot no puede importar el cliente Prisma directamente. Usar src/lib/isolation/ (forOrg / unsafeGlobalQuery) — B0-S3.",
            },
          ],
        },
      ],
      // Ni siquiera un PrismaClient propio (scripts de dev): el acceso va por el helper.
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='PrismaClient']",
          message:
            "El chatbot no instancia PrismaClient. El acceso a datos va por src/lib/isolation/ (forOrg / unsafeGlobalQuery) — B0-S3.",
        },
      ],
    },
  },
  // Security quick-win — multi-tenant: modelos del portal con organizationId
  // fuera de src/lib/isolation. Excluye motor y chatbot: esos dos módulos ya
  // banean @/lib/prisma por completo (no-restricted-imports, error, arriba),
  // así que el identificador `prisma` no puede existir ahí en código que
  // pase lint — agregar este selector no sumaría cobertura, y en flat config
  // pisaría entera la regla no-restricted-syntax del chatbot (misma key,
  // el bloque que aparece último gana completo, no se mergean selectores).
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "src/lib/isolation/**/*.{ts,tsx}",
      "src/modules/motor/**/*.{ts,tsx}",
      "src/modules/chatbot/**/*.{ts,tsx}",
      "src/app/api/chatbot/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": ["warn", directPortalModelAccessSelector],
    },
  },
]);

export default eslintConfig;
