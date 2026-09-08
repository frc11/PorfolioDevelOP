/**
 * B7 · FASE 0 — EL CONTRASTE DEL TEXTO QUE ESTÁ AL BORDE (`D-B5.1`).
 *
 *     npx tsx scripts-b7/f0-contraste.ts
 *
 * ── Qué reproduce, y con qué instrumento ──────────────────────────────────
 *
 * B5 midió el cuerpo de 15 px del diferencial en **mediana 4,65:1 con el 33 %
 * de sus píxeles bajo 4,5:1**, con el puntero quieto en el centro. Acá se
 * vuelve a medir con **el mismo instrumento** —`scripts-b5/glifo.ts`, el método
 * de las tres capturas— para saber si sigue vigente hoy, después de B5.
 *
 * ⚠️ **El método de las tres capturas no se reinventa.** La máscara sale de una
 * captura SIN escena, no de diferenciar píxeles contra una escena que se mueve;
 * el porqué, con el rojo que lo obligó, está en el docblock de `glifo.ts`. Y la
 * caja es **una por elemento**: con la unión, el 48 % de la caja pasa por glifo
 * y la mediana cae entre dos superficies distintas.
 *
 * ⚠️ **El piso de píxeles de glifo es el de B5 y por su misma razón.** Un
 * contraste medido sobre 384 píxeles no dice que el texto se lee: dice que casi
 * no había texto. A `scrollY = 14.400` los cuatro ítems existen con caja y
 * opacidad heredada 0; a 14.800 están revelados. El piso convierte el primer
 * caso en un rojo en vez de en un verde.
 *
 * ── Y se agrega lo que B4-B no pudo asentar ───────────────────────────────
 *
 * `tu-panel` a 1920 fue la única celda de aire muerto que **no se asentó en 5
 * intentos**. Acá no se mide su aire: se mide su **contraste**, que es la
 * pregunta del frente C, y a 1920, que es el ancho que aquel no pudo cerrar.
 */

import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'
import { cajaYTinta, moverElPuntero, ocultarPorSelector, verificarQueLaPaginaEstaEntera } from '../scripts-b5/pagina'
import { contrasteBajoElGlifo } from '../scripts-b5/glifo'

import { conLaPagina, cuatro, dos, guardarJson, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b7-comun'

const ANTES = [MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION]

/** El envoltorio de la escena. Se apaga para sacar la máscara de glifo. */
const SELECTOR_DE_LA_ESCENA = '[data-escena]'

/**
 * ⚠️ **LAS CAPTURAS VAN A `os.tmpdir()`, NO A `docs/`.** Es D12 de B4-B: un PNG
 * nuevo adentro del árbol que vigilan `next dev` y la auto-detección de fuentes
 * de Tailwind 4 corrompe la medición en curso — dos aterrizajes de la misma
 * corrida dieron `top` 1.066 y −1.979.
 */
const TEMP = path.join(tmpdir(), 'b7-contraste')

const MINIMO_DE_GLIFO = 3000

interface Escenario {
  readonly id: string
  readonly perfil: '1440' | '1920'
  readonly scrollY: number
  readonly selectorDelTexto: string
  readonly textoGrande: boolean
}

const ESCENARIOS: readonly Escenario[] = [
  /** El defecto: el cuerpo de 15 px del diferencial, sobre la pared de la sala. */
  {
    id: 'diferencial-cuerpo-1440',
    perfil: '1440',
    scrollY: 14800,
    selectorDelTexto: '[data-panel="por-que-develop"] .font-cuerpo',
    textoGrande: false,
  },
  /** El titular del mismo panel, que B5 midió cómodo. Es el control de la sección. */
  {
    id: 'diferencial-titular-1440',
    perfil: '1440',
    scrollY: 14400,
    selectorDelTexto: '[data-panel="por-que-develop"] .text-fluido-titulo-xl',
    textoGrande: true,
  },
  /** El cuerpo del diferencial a 1920, que es el ancho que B4-B no pudo cerrar. */
  {
    id: 'diferencial-cuerpo-1920',
    perfil: '1920',
    scrollY: 17600,
    selectorDelTexto: '[data-panel="por-que-develop"] .font-cuerpo',
    textoGrande: false,
  },
  /** `tu-panel` a 1920 — la celda que B4-B declaró no asentada. */
  {
    id: 'tu-panel-1920',
    perfil: '1920',
    scrollY: 15120,
    selectorDelTexto: '[data-panel="tu-panel"] .font-cuerpo',
    textoGrande: false,
  },
]

async function medirEscenario(e: Escenario): Promise<unknown> {
  const perfil = perfilPorId(e.perfil)
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      await verificarQueLaPaginaEstaEntera(pagina, perfil)
      const yReal = await scrollA(pagina, e.scrollY)
      await esperarElPrimerCuadro(pagina)
      // El puntero quieto en el centro, como midió B5.
      await moverElPuntero(pagina, perfil, Math.round(perfil.ancho / 2), Math.round(perfil.alto / 2))
      await medir(pagina, '(async () => { await new Promise((r) => setTimeout(r, 2500)); return true })()')

      const { cajas, caja, tinta, texto, elementos } = await cajaYTinta(pagina, e.selectorDelTexto)

      if (!(await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, true))) {
        throw new Error('la escena no quedó oculta: la máscara no sería del texto sobre papel plano')
      }
      const mascara = path.join(TEMP, `${e.id}-T.png`)
      await capturar(pagina, mascara)
      await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, false)

      if (!(await ocultarPorSelector(pagina, e.selectorDelTexto, true))) {
        throw new Error('el texto no quedó oculto: la captura del fondo no sería del fondo')
      }
      const fondo = path.join(TEMP, `${e.id}-A.png`)
      await capturar(pagina, fondo)
      await ocultarPorSelector(pagina, e.selectorDelTexto, false)

      const lectura = contrasteBajoElGlifo(mascara, fondo, cajas, tinta, e.textoGrande)
      if (lectura.pixelesDeGlifo < MINIMO_DE_GLIFO) {
        throw new Error(
          `${e.id} @ ${yReal}: sólo ${lectura.pixelesDeGlifo} píxeles de glifo (piso ${MINIMO_DE_GLIFO}). ` +
            'Cualquier contraste de acá sería verde por vacío.',
        )
      }
      return {
        ...e,
        scrollYReal: yReal,
        texto,
        elementos,
        cajas: cajas.length,
        caja,
        tinta,
        pixelesDeGlifo: lectura.pixelesDeGlifo,
        papel: lectura.papel,
        medianaContraste: dos(lectura.medianaContraste),
        peorContraste: dos(lectura.peorContraste),
        p1Contraste: dos(lectura.p1Contraste),
        bajoAA: lectura.bajoAA,
        umbralAA: lectura.umbralAA,
        porcientoBajoAA: cuatro((lectura.bajoAA / lectura.pixelesDeGlifo) * 100),
      }
    },
    { antesDelPintado: ANTES, quien: 'b7-contraste' },
  )
}

async function principal(): Promise<void> {
  mkdirSync(TEMP, { recursive: true })
  const filas: unknown[] = []
  for (const e of ESCENARIOS) {
    console.log(`· ${e.id} — ${e.perfil}, scrollY ${e.scrollY}`)
    try {
      const fila = await medirEscenario(e)
      filas.push(fila)
      const f = fila as Record<string, number>
      console.log(
        `  glifo ${f.pixelesDeGlifo} px · mediana ${f.medianaContraste}:1 · peor ${f.peorContraste}:1 · bajo AA ${f.bajoAA} (${f.porcientoBajoAA} %)`,
      )
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error)
      filas.push({ ...e, error: mensaje })
      console.log(`  ✗ ${mensaje}`)
    }
  }
  console.log(`\n→ ${guardarJson('f0-contraste', { filas, temp: TEMP })}`)
}

void principal()
