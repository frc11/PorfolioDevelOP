import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'

import { BANDA_DEL_EFECTO, MARGEN_DEL_DESPINEADO, PX_DE_LA_APROXIMACION, PX_DE_LA_SECCION, fraccionDeScroll } from './geometria'
import { avanzarLoMostrado, enElRiel, reposoEn, type BandaDelEfecto } from './regulador'
import {
  BANDA_DEL_EFECTO_ANGOSTA,
  ESTILO_DEL_RITMO,
  ESTIRAMIENTO_DEL_TUNEL,
  PX_DEL_ARRANQUE_DEL_TUNEL,
  progresoDeLaTabla,
  pxDeLaTabla,
  ritmoDelValor,
} from './ritmo'
import { CAPAS_DEL_TUNEL, PX_DEL_TUNEL, poseDelTunel } from './tunel'

/**
 * §28 DEL INVARIANTE DE TRABAJOS — **EL RITMO POR ANCHO Y LA VUELTA ENTERA.** Lo
 * llama `trabajos.invariant`. **[MÓVIL 2]**
 *
 * Dos cosas del sprint: que subiendo el túnel vuelve del todo —en el arranque del
 * túnel abajo de 1024, en el tope del pin en escritorio, y asentado en los tres—, y
 * que abajo de 1024 cada proyecto dura más sin tocar la tabla.
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const leer = (...partes: string[]): string => readFileSync(path.join(AQUI, ...partes), 'utf8')
const DT = 1000 / 60
const A = PX_DEL_ARRANQUE_DEL_TUNEL

/** Lo que MIDEN las capas del túnel para un px mostrado de la sección (la tabla, contada desde su arranque). */
const capasEn = (px: number): number[] => {
  const pose = poseDelTunel(px - A)
  return [...pose.proyectos, pose.cta]
}

/**
 * Sube a velocidad constante desde el final del túnel hasta la aproximación y
 * devuelve la capa más grande que se pintó con la página arriba de `hasta`. Con
 * `conAtraso` el regulador ve el scroll del cuadro anterior.
 */
function subir(v: number, banda: BandaDelEfecto, hasta: number, conAtraso = false): number {
  const desde = A + PX_DEL_TUNEL
  const porCuadro = (v * DT) / 1000
  let e = reposoEn(desde)
  let peor = 0
  let anterior = desde
  for (let s = desde; s > 0; s -= porCuadro) {
    e = avanzarLoMostrado(e, conAtraso ? anterior : s, DT, banda, false)
    anterior = s
    if (s <= hasta) peor = Math.max(peor, ...capasEn(e.tunel.posicion))
  }
  return peor
}

/** Sube de golpe hasta `s`, se queda quieto `ms` y devuelve lo que miden las capas. */
function asentar(banda: BandaDelEfecto, s: number, ms: number): number {
  let e = reposoEn(A + PX_DEL_TUNEL)
  for (let t = 0; t < 200; t += DT) e = avanzarLoMostrado(e, A + PX_DEL_TUNEL - ((A + PX_DEL_TUNEL - s) * t) / 200, DT, banda, false)
  for (let t = 0; t < ms; t += DT) e = avanzarLoMostrado(e, s, DT, banda, false)
  return Math.max(...capasEn(e.tunel.posicion))
}

export function afirmarElRitmo(): void {
  titulo('28 · El ritmo por ancho y la vuelta entera del túnel')

  // ── SUBIENDO, ABAJO DE 1024: EN EL ARRANQUE DEL TÚNEL YA NO QUEDA NADA ──
  // Un dedo barre de 3.000 a 7.000 px/s de página (medido en fase 1 a 390).
  const VELOCIDADES = [600, 1500, 3000, 7000, 20000]
  const angosta = VELOCIDADES.map((v) => subir(v, BANDA_DEL_EFECTO_ANGOSTA, A))
  afirmarIgual(angosta, VELOCIDADES.map(() => 0), `abajo de 1024, subiendo a ${VELOCIDADES.join(' · ')} px/s, con la página arriba del arranque del túnel las tres capturas y el CTA miden 0`)
  const conAtraso = VELOCIDADES.map((v) => subir(v, BANDA_DEL_EFECTO_ANGOSTA, A - (v * DT) / 1000, true))
  afirmarIgual(conAtraso, VELOCIDADES.map(() => 0), '  y con un cuadro de atraso entre el scroll y lo pintado, un cuadro después también')
  controlPositivo(
    '  el chequeo vería el techo de escritorio, que llegaba al arranque con El Garage a medio camino',
    BANDA_DEL_EFECTO,
    (b: BandaDelEfecto) => VELOCIDADES.every((v) => subir(v, b, A) === 0),
  )
  const conElTechoViejo = subir(3000, BANDA_DEL_EFECTO, A)
  afirmar(conElTechoViejo > 0.3, `  (la causa, medida: con el techo de escritorio a 3.000 px/s El Garage llegaba al arranque midiendo ${conElTechoViejo.toFixed(2)})`)

  // ── EN ESCRITORIO: EN EL TOPE DEL PIN, Y NADA CAMBIÓ ──────────────────
  const tope = PX_DE_LA_APROXIMACION + MARGEN_DEL_DESPINEADO
  afirmarIgual(VELOCIDADES.map((v) => subir(v, BANDA_DEL_EFECTO, tope)), VELOCIDADES.map(() => 0), 'en escritorio, subiendo a cualquier velocidad, cuando el pin se suelta arriba las capas miden 0 (su garantía de siempre)')
  afirmarIgual(BANDA_DEL_EFECTO_ANGOSTA.piso, BANDA_DEL_EFECTO.piso, '  el piso es el mismo en todo ancho: bajando nada cambió')
  afirmarIgual(ritmoDelValor('').banda, BANDA_DEL_EFECTO, '  y sin la variable del ancho —escritorio— el túnel usa la banda de siempre')

  // ── ASENTADO, EN LOS TRES ANCHOS ──────────────────────────────────────
  const quietos = [A - 1, 1400, PX_DE_LA_APROXIMACION + 10].flatMap((s) => [asentar(BANDA_DEL_EFECTO, s, 4000), asentar(BANDA_DEL_EFECTO_ANGOSTA, s, 4000)])
  afirmar(quietos.every((m) => m < 1e-6), 'con la página quieta arriba del túnel, en 4 s todas las capas quedan en 0 con las dos bandas (el regulador no corre más de 500 px/s)', quietos.map((m) => m.toFixed(6)).join(' · '))
  controlPositivo('  el chequeo de asentar vería una banda que deja al túnel colgado', { piso: [{ scroll: 0, efecto: A + 600 }], techo: [{ scroll: 0, efecto: 1e9 }] } as BandaDelEfecto, (b: BandaDelEfecto) => asentar(b, 1400, 4000) < 1e-6)

  // ── EL TECHO ANGOSTO NUNCA PASA POR DEBAJO DEL SCROLL ─────────────────
  const noAtaBajando = (b: BandaDelEfecto): boolean => {
    for (let s = 0; s <= PX_DE_LA_SECCION; s += 5) if (enElRiel(b.techo, s) < s - 1e-6) return false
    return true
  }
  afirmar(noAtaBajando(BANDA_DEL_EFECTO_ANGOSTA), 'el techo angosto nunca pasa por debajo del scroll: bajando no le pone freno a nadie')
  controlPositivo('  el chequeo vería un techo que toca el scroll un poco después del arranque', { piso: [], techo: [{ scroll: A + 100, efecto: A }] } as BandaDelEfecto, noAtaBajando)

  // ── CADA PROYECTO DURA MÁS ABAJO DE 1024, Y LA TABLA ES LA MISMA ──────
  const relevos = (k: number): number[] => {
    const nacen = [...CAPAS_DEL_TUNEL.proyectos.map((c) => c.arranca), CAPAS_DEL_TUNEL.cta.arranca]
    const alScroll = (pxTabla: number): number => {
      let bajo = 0
      let alto = PX_DE_LA_SECCION + (k - 1) * PX_DEL_TUNEL
      for (let i = 0; i < 60; i += 1) {
        const medio = (bajo + alto) / 2
        if (pxDeLaTabla(medio, k) < pxTabla) bajo = medio
        else alto = medio
      }
      return alto
    }
    const px = nacen.map((y) => alScroll(y - CAPAS_DEL_TUNEL.proyectos[0].arranca + A))
    return px.slice(1).map((y, i) => Math.round(y - px[i]))
  }
  const deEscritorio = relevos(ESTIRAMIENTO_DEL_TUNEL.escritorio)
  for (const aparato of ['tablet', 'movil'] as const) {
    const k = ESTIRAMIENTO_DEL_TUNEL[aparato]
    const suyos = relevos(k)
    afirmar(suyos.every((d, i) => Math.abs(d - deEscritorio[i] * k) <= 1), `en ${aparato} cada proyecto dura ×${String(k)} de scroll antes de que nazca el siguiente: ${suyos.join(' · ')} px contra ${deEscritorio.join(' · ')}`)
  }
  afirmarIgual([progresoDeLaTabla(0, 2), progresoDeLaTabla(1, 2), progresoDeLaTabla(0.3, 1)], [0, 1, 0.3], 'el reloj cierra en las dos puntas, y con 1 es la identidad: escritorio no cambia')
  let crece = true
  for (let u = 0; u <= 1; u += 1 / 4000) if (progresoDeLaTabla(u + 1 / 4000, 2) < progresoDeLaTabla(u, 2)) crece = false
  afirmar(crece, '  y nunca vuelve para atrás: un scroll que baja no hace volver al túnel')
  const antes = fraccionDeScroll(A * 0.5)
  afirmar(Math.abs(progresoDeLaTabla(antes / (1 + PX_DEL_TUNEL / PX_DE_LA_SECCION), 2) - antes) < 1e-12, '  antes del túnel el píxel es el mismo: el cartel no cambia de largo')

  // ── EL ALTO SALE DEL MISMO NÚMERO ─────────────────────────────────────
  afirmarIgual(ESTILO_DEL_RITMO['--tunel-en-pantallas' as keyof typeof ESTILO_DEL_RITMO], (PX_DEL_TUNEL / 900).toFixed(6), 'lo que la sección suma por unidad de estiramiento es lo que dura el túnel en pantallas')
  const TRABAJOS = leer('Trabajos.tsx')
  const altoDerivado = (fuente: string): boolean =>
    fuente.includes('max-escritorio:min-h-[calc(var(--alto-minimo-del-panel)+(var(--estiramiento-en-uso)-1)*var(--tunel-en-pantallas)*100svh)]') &&
    fuente.includes('max-escritorio:[--estiramiento-en-uso:var(--estiramiento-tablet)]') &&
    fuente.includes('max-movil:[--estiramiento-en-uso:var(--estiramiento-movil)]')
  afirmar(altoDerivado(TRABAJOS), '  y la sección animada crece exactamente eso: el alto del panel más (k − 1) túneles, con el k de su ancho')
    // La clase del control va partida: Tailwind lee este archivo y la emitiría entera.
  controlPositivo('  el chequeo vería un alto escrito a mano', "seccion: 'max-escritorio:min-h-" + "[900svh]'", altoDerivado)
}
