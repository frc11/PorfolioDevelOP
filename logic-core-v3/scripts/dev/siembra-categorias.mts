/**
 * Las categorías de siembra de la cartera de desarrollo (P37).
 *
 * Criterios OBJETIVOS: un patrón sobre `businessName`, nunca una lista de nombres
 * — una lista siempre queda incompleta en la corrida siguiente. Los consumen el
 * censo (`scripts/p37-censo-siembra.mts`) y la limpieza
 * (`scripts/dev/limpiar-siembra-corridas.mts`), para que lo que se cuenta y lo
 * que se borra no puedan divergir.
 *
 * El orden de evaluación importa en un solo caso: un nombre con timestamp de 13
 * dígitos es CORRIDA_AUTOMATICA aunque también empiece con un prefijo de QA. Las
 * suites nombran con `Date.now()` (`tests/helpers/setter-db.ts` `createLead`);
 * las semillas curadas a mano no llevan timestamp.
 */
export const CATEGORIAS = [
  {
    id: 'CORRIDA_AUTOMATICA',
    criterio: '/\\d{13}/ en el nombre (Date.now() de una corrida de suite)',
    test: (n: string) => /\d{13}/.test(n),
  },
  { id: 'QA_CURADA', criterio: '/^QA-/ (semillas de estados del manual)', test: (n: string) => /^QA-/.test(n) },
  { id: 'GALERIA_M0', criterio: '/^M0-GAL / (seed de la galería)', test: (n: string) => /^M0-GAL /.test(n) },
  { id: 'CORRIDA_MANUAL', criterio: '/^CORRIDA\\d* / (recorridos a mano)', test: (n: string) => /^CORRIDA\d* /.test(n) },
  { id: 'DEMO_WEB', criterio: '/^DEMO Web · / (demos de catálogo)', test: (n: string) => /^DEMO Web · /.test(n) },
  { id: 'SIN_PREFIJO', criterio: 'ninguno de los anteriores', test: (_n: string) => true },
] as const

export type CategoriaId = (typeof CATEGORIAS)[number]['id']

export function categoriaDe(nombre: string): CategoriaId {
  // El último criterio acepta todo: el find nunca devuelve undefined.
  return (CATEGORIAS.find((c) => c.test(nombre)) ?? CATEGORIAS[CATEGORIAS.length - 1]).id
}

/** Host de la branch Neon de desarrollo. Todo script que escribe exige este host. */
export const DEV_BRANCH_HOST = 'ep-quiet-waterfall-acv0fpll'
