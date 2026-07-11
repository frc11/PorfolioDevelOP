import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
]);

export default eslintConfig;
