/**
 * LeadOS C2 — El GRAFO de la máquina de stage del dossier, aislado y puro.
 *
 * ── Por qué vive acá y no adentro de `dossier.ts` ────────────────────────────
 * `LEGAL_TRANSITIONS` es LA única puerta del stage: `transitionDossier()` lo
 * consulta antes de cualquier update, y ninguna otra transición existe. Hasta C2
 * no había forma de vigilarlo. Era un `const` sin `export` dentro de
 * `dossier.ts`, que importa `@/lib/prisma`: un invariante que lo importara
 * habría arrastrado el cliente de Prisma —y con él Neon y `DATABASE_URL`— a una
 * corrida que se define justamente por no necesitar base. El grafo quedaba sin
 * red por un problema de dependencias, no de intención.
 *
 * ── La regla de este archivo ─────────────────────────────────────────────────
 * NO agregar imports de valor. El único import es `import type` de
 * `@prisma/client`, que TypeScript borra al compilar (`isolatedModules: true` en
 * el tsconfig lo garantiza). Ese árbol de runtime vacío es lo que hace vigilable
 * al grafo: `dossier-stage.invariant.ts` lo importa y corre sin DB.
 *
 * ── Qué NO se movió ──────────────────────────────────────────────────────────
 * Solo el grafo. Las EXIGENCIAS de cada transición (la evaluación de EVALUADA,
 * el gate comercial de BRIEF, el motivo de RECHAZADA, el motivoDescarte y el
 * `evaluacionJson` válido de DESCARTADA) siguen donde estaban: en el tipo
 * `DossierTransitionInput` y en el `switch` de `transitionDossier()`. Duplicarlas
 * acá como una tabla a mano habría creado una segunda lista para mantener — el
 * modo de falla exacto que produjo los falsos verdes de C1b. El invariante las
 * verifica contra su fuente real, no contra una copia.
 */
import type { DossierStage } from '@prisma/client'

/**
 * Transiciones legales de la máquina de producción. Ninguna otra existe.
 *
 *   FICHA → EVALUADA → BRIEF → CONSTRUCCION → EN_REVISION → APROBADA
 *              │                     ▲              │
 *              ▼                     └── RECHAZADA ◄┘
 *          DESCARTADA
 */
export const LEGAL_TRANSITIONS: Record<DossierStage, readonly DossierStage[]> = {
  FICHA: ['EVALUADA'],
  EVALUADA: ['DESCARTADA', 'BRIEF'],
  BRIEF: ['CONSTRUCCION'],
  CONSTRUCCION: ['EN_REVISION'],
  EN_REVISION: ['APROBADA', 'RECHAZADA'],
  RECHAZADA: ['CONSTRUCCION'],
  APROBADA: [],
  DESCARTADA: [],
}
