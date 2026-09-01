/**
 * §9 DEL INVARIANTE DE MOBILE — LA ESCALA TIPOGRÁFICA A 375, que es el PISO de
 * la banda fluida.
 *
 * Sale del invariante en SITIO-S11 por la regla de las 300 líneas, y el corte es
 * por tema: es la única sección que no mira el marcado del documento sino la
 * hoja —resuelve los ocho niveles contra un ancho y los compara con la vara que
 * el propio sistema declara—. Acá viven los defectos 12 y 13 de §7.38, los dos
 * cerrados por la Fase 0 de S11.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import { anchoDeContenido, tokenPx } from './s10-css'
import * as M from './s10-mobile'

export function afirmarLaEscala(px0: (n: number) => string): void {
  titulo('9 · La escala tipográfica a 375, que es el PISO de la banda fluida')

  const escala = M.escalaA(375)
  for (const n of escala) console.log(`  ${n.nivel.padEnd(10)} ${n.fluido ? 'fluido' : 'FIJO  '} ${n.token.padEnd(26)} ${n.px.toFixed(2).padStart(6)} px  (a 1440: ${tokenPx(n.token, 1440).toFixed(2)})`)
  afirmarIgual(escala.filter((n) => !n.fluido).map((n) => n.nivel), ['cuerpo', 'base'], 'los dos niveles invariantes son `cuerpo` y `base`, y a 375 valen lo mismo que a 1440')
  const fluidos = escala.filter((n) => n.fluido)
  afirmar(
    fluidos.every((n) => Math.abs(n.px - tokenPx(n.token, 0)) < 0.01),
    'los seis fluidos tocan el MÍNIMO de su propio `clamp()` a 375 (a menos de 0,01 px): 375 es `--fluido-piso`',
    fluidos.map((n) => `${n.nivel} ${n.px.toFixed(4)} vs min ${tokenPx(n.token, 0)}`).join(' · '),
  )
  const VARA = tokenPx('--text-micro', 375)
  console.log(`  la vara: el escalón FIJO más chico que el propio sistema declara, \`--text-micro\` = ${px0(VARA)} px. No es WCAG —que no fija un tamaño mínimo de texto— y por eso se declara de dónde sale.`)
  const bajoLaVara = escala.filter((n) => n.px < VARA)
  afirmarIgual(bajoLaVara.map((n) => n.nivel), [], `contra esa vara NO cae ninguno de los ocho: el más chico a 375 es \`micro\`, y vale exactamente la vara (${px0(tokenPx('--text-fluido-micro', 375))} px)`)
  afirmar(
    new Set(escala.map((n) => Number(n.px.toFixed(2)))).size === escala.length,
    '  y los ocho siguen siendo ocho tamaños DISTINTOS a 375: ningún par colisiona en el piso de la banda',
    escala.map((n) => `${n.nivel} ${n.px.toFixed(0)}`).join(' · '),
  )
  console.log(
    `  ✅ DEFECTO 12 — ARREGLADO en SITIO-S11 · \`theme-develop.css\` — el piso de \`--text-fluido-micro\` sube de 8 a ${px0(tokenPx('--text-fluido-micro', 375))} px. ` +
      `Los 8 px eran un 20% POR DEBAJO del propio piso fijo del sistema, y los consumen los rótulos de las cifras, las etiquetas de sección y la nota legal del pie. ` +
      `\`--text-fluido-caption\` sigue en ${tokenPx('--text-fluido-caption', 375).toFixed(0)} px, arriba de la vara por 1 px, y no se tocó.`,
  )
  console.log(
    `  ⚠️ CONSECUENCIA FORZADA, declarada en el tema: la banda de \`micro\` queda en CERO — piso ${px0(tokenPx('--text-fluido-micro', 375))} y techo ${px0(tokenPx('--text-fluido-micro', 1440))}, que es el techo anclado. ` +
      `De las tres —piso ≥ el fijo del sistema, techo anclado, banda no nula— sólo se pueden tener dos. \`micro\` deja de variar con el ancho; los otros cinco no se tocaron.`,
  )
  console.log(`  el ancho útil de contenido es ${anchoDeContenido(375)} px a 375 y ${anchoDeContenido(390)} a 390: el relleno lateral es FIJO (32 px por lado) y no se afloja al angostar.`)
  controlPositivo('la escala no es una tabla escrita: si fuera fija, 375 y 1440 darían lo mismo', 1440, (a: number) => M.escalaA(a).every((n, i) => n.px === escala[i].px))
  controlPositivo('y el piso del `clamp()` no se toca a 1440: si se tocara, la banda fluida no sería fluida', 1440, (a: number) =>
    M.escalaA(a).filter((n) => n.fluido).every((n) => Math.abs(n.px - tokenPx(n.token, 0)) < 0.01))
}
