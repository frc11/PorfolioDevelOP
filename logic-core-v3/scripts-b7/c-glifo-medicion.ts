/**
 * B7 · FRENTE C — EL MÉTODO DE LAS TRES CAPTURAS, UNA SOLA VEZ.
 *
 * ── Por qué es un archivo y no el cuerpo de `c-contraste.ts` ──────────────
 *
 * Porque lo consumen DOS medidas que tienen que ser comparables entre sí:
 * `c-contraste.ts` (el cuerpo del diferencial, `D-B5.1`) y `c-tu-panel.ts` (la
 * celda que B4-B no pudo asentar). Si cada una escribiera su propia secuencia
 * —esperar el primer cuadro, verificar que la página está entera, scrollear,
 * quedarse quieta, leer la caja del DOM, apagar la escena, capturar, apagar el
 * texto, capturar— las dos publicarían cifras que **parecen** de la misma tabla
 * y no lo son. Acá la secuencia se escribe una vez y las dos la llaman.
 *
 * ⚠️ **La frontera es el precio de compartir, y está declarada:** este archivo
 * no elige escenarios, no decide umbrales y no guarda nada. Recibe un escenario,
 * devuelve una lectura. Quién la interpreta y contra qué piso, es del que llama.
 *
 * ⚠️ **El piso de píxeles de glifo NO vive acá tampoco**, y es a propósito: es
 * una regla de INTERPRETACIÓN («este contraste no es verde por vacío»), no de
 * medición, y el que la aplica es el que publica la cifra.
 *
 * ⚠️ **Las capturas van a `os.tmpdir()`, NUNCA a `docs/`** — D12 de B4-B: un PNG
 * nuevo adentro del árbol que vigilan `next dev` y la auto-detección de fuentes
 * de Tailwind 4 corrompe la medición en curso.
 */

import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'
import {
  cajaYTinta,
  moverElPuntero,
  ocultarPorSelector,
  verificarQueLaPaginaEstaEntera,
} from '../scripts-b5/pagina'
import { contrasteBajoElGlifo, type CajaDeTexto } from '../scripts-b5/glifo'

import { conLaPagina, cuatro, dos, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b7-comun'

const ANTES = [MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION]

/** El envoltorio de la escena. Se apaga para sacar la máscara de glifo. */
const SELECTOR_DE_LA_ESCENA = '[data-escena]'

export interface Escenario {
  readonly id: string
  readonly perfil: '1440' | '1920'
  readonly scrollY: number
  readonly selectorDelTexto: string
  readonly textoGrande: boolean
}

export interface Lectura {
  /** El color del papel que la máscara midió. Publicado para poder desconfiar de él. */
  readonly papel: readonly [number, number, number]
  readonly pixelesDeGlifo: number
  readonly medianaContraste: number
  readonly peorContraste: number
  readonly p1Contraste: number
  readonly bajoAA: number
  readonly porcientoBajoAA: number
}

export interface Medicion {
  readonly scrollYReal: number
  readonly texto: string
  readonly elementos: number
  readonly tinta: readonly [number, number, number]
  readonly papel: readonly [number, number, number]
  readonly umbralAA: number
  readonly caja: CajaDeTexto
  readonly cajas: readonly CajaDeTexto[]
  readonly rotulos: readonly Record<string, string>[]
  readonly rutaDeLaMascara: string
  readonly rutaDelFondo: string
  readonly agregado: Lectura
}

export function carpetaTemporal(nombre: string): string {
  const dir = path.join(tmpdir(), nombre)
  mkdirSync(dir, { recursive: true })
  return dir
}

/** Una lectura sobre las cajas que se le pasen, con el criterio de `glifo.ts`. */
export function leerElContraste(
  rutaDeLaMascara: string,
  rutaDelFondo: string,
  cajas: readonly CajaDeTexto[],
  tinta: readonly [number, number, number],
  textoGrande: boolean,
): Lectura {
  const l = contrasteBajoElGlifo(rutaDeLaMascara, rutaDelFondo, cajas, tinta, textoGrande)
  return {
    papel: l.papel,
    pixelesDeGlifo: l.pixelesDeGlifo,
    medianaContraste: dos(l.medianaContraste),
    peorContraste: dos(l.peorContraste),
    p1Contraste: dos(l.p1Contraste),
    bajoAA: l.bajoAA,
    porcientoBajoAA: l.pixelesDeGlifo === 0 ? 0 : cuatro((l.bajoAA / l.pixelesDeGlifo) * 100),
  }
}

/**
 * Un rótulo por elemento, leído del DOM en el MISMO orden que
 * `document.querySelectorAll` — que es el orden en el que `cajaYTinta` arma sus
 * cajas. Sin esto, un desglose por elemento dice «caja 3» y no dice nada.
 */
function lectorDeRotulos(selector: string): string {
  return `(() => [...document.querySelectorAll(${JSON.stringify(selector)})].map((el) => {
    const cs = getComputedStyle(el)
    return {
      etiqueta: el.tagName.toLowerCase(),
      nivel: el.getAttribute('data-nivel') ?? '',
      tamano: cs.fontSize,
      color: cs.color,
      texto: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 42),
    }
  }))()`
}

/**
 * LA SECUENCIA. El puntero queda quieto en el centro, como midió B5: la escena
 * sigue el cursor y una medición tomada con el puntero en otro lado describe
 * otra pose.
 */
export async function medirElContrasteBajoElGlifo(e: Escenario, carpeta: string): Promise<Medicion> {
  const perfil = perfilPorId(e.perfil)
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      await verificarQueLaPaginaEstaEntera(pagina, perfil)
      const scrollYReal = await scrollA(pagina, e.scrollY)
      await esperarElPrimerCuadro(pagina)
      await moverElPuntero(pagina, perfil, Math.round(perfil.ancho / 2), Math.round(perfil.alto / 2))
      await medir(pagina, '(async () => { await new Promise((r) => setTimeout(r, 2500)); return true })()')

      const { cajas, caja, tinta, texto, elementos } = await cajaYTinta(pagina, e.selectorDelTexto)
      const rotulos = await medir<Record<string, string>[]>(pagina, lectorDeRotulos(e.selectorDelTexto))

      if (!(await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, true))) {
        throw new Error('la escena no quedó oculta: la máscara no sería del texto sobre papel plano')
      }
      const rutaDeLaMascara = path.join(carpeta, `${e.id}-T.png`)
      await capturar(pagina, rutaDeLaMascara)
      await ocultarPorSelector(pagina, SELECTOR_DE_LA_ESCENA, false)

      if (!(await ocultarPorSelector(pagina, e.selectorDelTexto, true))) {
        throw new Error('el texto no quedó oculto: la captura del fondo no sería del fondo')
      }
      const rutaDelFondo = path.join(carpeta, `${e.id}-A.png`)
      await capturar(pagina, rutaDelFondo)
      await ocultarPorSelector(pagina, e.selectorDelTexto, false)

      const agregado = leerElContraste(rutaDeLaMascara, rutaDelFondo, cajas, tinta, e.textoGrande)
      return {
        scrollYReal,
        texto,
        elementos,
        tinta,
        papel: agregado.papel,
        umbralAA: e.textoGrande ? 3 : 4.5,
        caja,
        cajas,
        rotulos,
        rutaDeLaMascara,
        rutaDelFondo,
        agregado,
      }
    },
    { antesDelPintado: ANTES, quien: 'b7-c' },
  )
}
