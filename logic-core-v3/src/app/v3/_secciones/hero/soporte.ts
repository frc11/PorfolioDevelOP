/**
 * HERO — DOS CUENTAS DEL INVARIANTE: §9 Y §10.
 *
 * Sale de `hero.invariant.tsx` cuando ese archivo cruzó las 300 líneas del repo
 * al rehacerse el titular, y el corte es el mismo que Trabajos y Cierre ya
 * tienen (`trabajos/soporte.ts`): **las CUENTAS por un lado y las
 * comprobaciones del MARCADO por el otro.**
 *
 *   §9   el aire del pie contra la pastilla — tokens del tema y `navegacion.ts`.
 *   §10  el contraste de la tinta sobre el canvas — dos tokens y una razón.
 *
 * ⚠ Se llaman EN SU LUGAR desde el invariante, no al final, para que la salida
 * siga leyéndose §1 → §11 de arriba a abajo.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { ALTO_PASTILLA_PX, DESCUENTO_NACIMIENTO_PX } from '../../_lib/navegacion'
import { COLORES_DEL_CANVAS_DE_PRUEBA, TINTA_HEX } from '../../_lib/superficies'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
/** El tema, leído: los tokens no se transcriben. Si `--spacing-20` cambia de valor,
 *  la cuenta del aire del pie se mueve con él o falla. */
const TEMA = readFileSync(path.join(AQUI, '../../../../..', 'src/app/theme-develop.css'), 'utf8')

/** Un escalón de espaciado, en px. La raíz de 16 la declara el propio tema al lado
 *  del token, en el comentario que traduce cada rem a su píxel. */
function pxDeEspaciado(escalon: string): number {
  const m = new RegExp(`--spacing-${escalon}:\\s*([\\d.]+)rem`).exec(TEMA)
  if (m === null) throw new Error(`--spacing-${escalon} no está declarado en el tema`)
  return Number.parseFloat(m[1]) * 16
}

export function afirmarElPieDeLaPantalla(quieto: string): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('9 · El pie de la pantalla es de la pastilla, y el aire alcanza')

  /** El escalón del padding inferior. La clase que se busca en el marcado y el token
   *  que se mide salen de acá: son UNA fuente, no dos que se desincronizan. */
  const ESCALON_DEL_PIE = '20'
  const AIRE_DEL_PIE_PX = pxDeEspaciado(ESCALON_DEL_PIE)

  afirmar(quieto.includes(`pb-${ESCALON_DEL_PIE}`), `el contenedor de pantalla lleva pb-${ESCALON_DEL_PIE}`)
  afirmar(DESCUENTO_NACIMIENTO_PX > 0, `la pastilla ocupa ${DESCUENTO_NACIMIENTO_PX} px del pie`, `alto ${ALTO_PASTILLA_PX} px más su margen`)
  afirmar(AIRE_DEL_PIE_PX >= DESCUENTO_NACIMIENTO_PX, 'y el aire declarado los cubre', `${AIRE_DEL_PIE_PX} px de aire contra ${DESCUENTO_NACIMIENTO_PX} px de pastilla`)
  controlPositivo('la cuenta ve un escalón que NO alcanza', '4', (e: string) => pxDeEspaciado(e) >= DESCUENTO_NACIMIENTO_PX)
  controlPositivo('y el chequeo de la clase ve un contenedor sin ella', '<div class="flex min-h-svh"></div>', (h: string) => h.includes(`pb-${ESCALON_DEL_PIE}`))

}

export function afirmarElContrasteSobreElCanvas(): void {
  titulo('10 · El contraste de la tinta sobre el canvas — producido, no citado')

  /** ⚠ ESTA CIFRA VALE PARA EL MARCADOR DE POSICIÓN DEL CANVAS, no para la escena.
   *  `COLORES_DEL_CANVAS_DE_PRUEBA` son dos tokens planos; la sala 3D es un gradiente
   *  con luces y NO hereda este número. Cuando la escena exista hay que volver a medir
   *  sobre la pose real, y si ahí no diera AA la salida no es una capa de fondo acá. */
  const AA_TEXTO = 4.5
  const razones = COLORES_DEL_CANVAS_DE_PRUEBA.map((c) => ({ token: c.token, razon: razonDeContraste(TINTA_HEX, c.hex) }))
  afirmar(razones.length > 0, `la cuenta mira ${razones.length} colores del canvas de prueba`)
  for (const { token, razon } of razones) {
    afirmar(razon >= AA_TEXTO, `la tinta sobre ${token} da ${razon.toFixed(2)}:1`, `mínimo AA ${AA_TEXTO}:1`)
  }
  const peor = Math.min(...razones.map((r) => r.razon))
  afirmar(peor >= AA_TEXTO, `el PEOR caso es ${peor.toFixed(2)}:1 y pasa AA para texto normal`)
  controlPositivo('la calculadora ve dos colores que no se separan', ['#E8E8E6', '#DBDBD9'] as const, ([a, b]) => razonDeContraste(a, b) >= AA_TEXTO)

}
