/**
 * LeadOS · P42 — El tilde que marca una pantalla de Construcción ENTERA.
 *
 * «Construir» (mc1) pasa a tener un solo tilde, pero sus tres fases siguen
 * existiendo por dentro: `FASE_IDS` es la llave del progreso guardado y no se
 * toca. El tilde único es presentación sobre esa llave:
 *
 *   · está marcado cuando TODAS las fases de la pantalla lo están — el mismo
 *     criterio con el que la derivación (`manual.ts`, `completadasDe`) da la
 *     pantalla por completa; `bloque-construccion.spec.ts` §4a lo ata a la
 *     derivación real sobre los 64 subconjuntos, así no pueden divergir;
 *   · un clic con la pantalla sin completar suma las que faltan (lo que ya
 *     estaba se conserva); con la pantalla completa, las saca a todas;
 *   · las fases de las OTRAS pantallas no se tocan nunca: el blob que se
 *     persiste es el de las seis.
 *
 * Límite, dicho: un «Construir» a medias de antes (una o dos fases tildadas) no
 * tiene cómo mostrarse con un solo tilde. Se lee sin marcar —que es lo que la
 * derivación ya decía— y no se borra al abrir la pantalla; recién un clic que
 * marca y otro que desmarca lo llevan a cero.
 *
 * Puro: sin React ni Prisma, importable desde el cliente, el servidor y las pruebas.
 */
import { FASE_IDS, type FaseId } from './contracts'

/** ¿Están marcadas todas las fases de la pantalla? `false` para una pantalla sin fases. */
export function pantallaMarcada(completadas: readonly FaseId[], fases: readonly FaseId[]): boolean {
  return fases.length > 0 && fases.every((fase) => completadas.includes(fase))
}

/**
 * El conjunto que deja un clic en el tilde de la pantalla, en el orden canónico
 * de `FASE_IDS` (sin eso, marcar y desmarcar devolvería el mismo conjunto en otro
 * orden y el autoguardado lo tomaría por un cambio).
 */
export function alternarPantalla(completadas: readonly FaseId[], fases: readonly FaseId[]): FaseId[] {
  const siguiente = pantallaMarcada(completadas, fases)
    ? completadas.filter((fase) => !fases.includes(fase))
    : [...completadas, ...fases]
  return FASE_IDS.filter((fase) => siguiente.includes(fase))
}
