/**
 * B7 · FRENTE B — EL CONTROL POSITIVO DEL BARRIDO, EN UN ARNÉS DECLARADO.
 *
 * ── Qué prueba, y qué NO ──────────────────────────────────────────────────
 *
 * ⚠️ **Los tres elementos de acá los pone el instrumento.** Nada que salga de
 * esta función es una propiedad del sitio, y no se publica como tal: viven en su
 * propia sesión de Chrome, se inyectan DESPUÉS de que el barrido del sitio
 * terminó, y lo único que se afirma sobre ellos es que **el barrido los
 * separa**. Es la distinción del bloque: forzar la entrada de un instrumento
 * para afirmar sobre el SITIO es medir el arnés; forzarla para preguntarle al
 * INSTRUMENTO si sabe distinguir es un control positivo.
 *
 * ── Por qué hace falta ────────────────────────────────────────────────────
 *
 * El sitio no tiene hoy ningún pin roto. Un barrido que sólo mira el sitio puede
 * publicar «todo bien» **porque no sabe ver el mal**, y eso es indistinguible de
 * «todo bien». Los tres casos que el clasificador tiene que separar son:
 *
 *   `bueno`   `sticky` con 2500 px de recorrido y nada que lo recorte → se pega.
 *   `roto`    el MISMO `sticky`, con los MISMOS 2500 px, adentro de un ancestro
 *             con `overflow: hidden` → no se pega ni un píxel, sin un error en
 *             consola. Es el modo de falla que `Seccion.tsx` documenta y que
 *             nadie había reproducido.
 *   `quieto`  la misma caja sin `position: sticky` → no hay pin que medir.
 *
 * `bueno` y `roto` difieren en **una sola declaración**. Si el barrido los
 * devolviera iguales, no sería un control: sería un sello.
 */

import { esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { conLaPagina, MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION } from './b7-comun'
import { barrer } from './b-pin-barrido'
import { clasificar, type BarridoDeCandidato, type ClaseDePin } from './b-pin-lectores'

/** El alto de cada marco y el de cada caja pegada. 3000 − 500 = 2500 de recorrido. */
const ALTO_DEL_MARCO_PX = 3000
const ALTO_DE_LA_CAJA_PX = 500
export const RECORRIDO_DEL_ARNES_PX = ALTO_DEL_MARCO_PX - ALTO_DE_LA_CAJA_PX

/** El control quieto se busca por selector: no es `sticky`, así que el censo no lo levanta. */
export const SELECTOR_DEL_QUIETO = '[data-arnes="quieto"]'

const caja = (marca: string, sticky: boolean): string =>
  `<div style="height:${ALTO_DEL_MARCO_PX}px"><div data-arnes="${marca}" style="${sticky ? 'position:sticky;top:0;' : ''}height:${ALTO_DE_LA_CAJA_PX}px;background:#0000"></div></div>`

/**
 * Inyecta el arnés al final del documento y devuelve dónde quedó.
 *
 * `roto` va envuelto en un `overflow: hidden`: su caja de scroll pasa a ser ese
 * ancestro, que no scrollea nunca, y el `sticky` se queda clavado a su lugar en
 * el flujo. Es la misma condición que `CENSO_DE_STICKIES` reporta en
 * `ancestroQueRecorta`, así que el arnés prueba además ese campo.
 */
const INYECCION = `(() => {
  const raiz = document.createElement('div')
  raiz.setAttribute('data-arnes', 'raiz')
  raiz.innerHTML = ${JSON.stringify(
    `${caja('bueno', true)}<div style="overflow:hidden">${caja('roto', true)}</div>${caja('quieto', false)}`,
  )}
  document.body.appendChild(raiz)
  const r = raiz.getBoundingClientRect()
  return {
    desdeY: Math.round(r.top + window.scrollY),
    alto: Math.round(r.height),
    documento: document.documentElement.scrollHeight,
  }
})()`

export interface FilaDelArnes {
  readonly marca: string
  readonly clase: ClaseDePin
  readonly porQue: string
  readonly barrido: BarridoDeCandidato
}

export interface ResultadoDelArnes {
  readonly desdeY: number
  readonly alto: number
  readonly paradas: number
  readonly recorridoDeclarado: number
  readonly filas: readonly FilaDelArnes[]
  /** El control se cumple si las tres marcas salen en tres clases DISTINTAS y correctas. */
  readonly separa: boolean
}

/** Corre el arnés en su propia sesión, con el mismo motor de barrido que el sitio. */
export async function correrElArnes(
  idPerfil: string,
  paso: number,
  precision: number,
): Promise<ResultadoDelArnes> {
  const perfil = perfilPorId(idPerfil)
  return conLaPagina(
    perfil,
    '/v3',
    async ({ pagina }) => {
      await esperarElPrimerCuadro(pagina)
      const donde = await medir<{ desdeY: number; alto: number; documento: number }>(
        pagina,
        INYECCION,
      )
      const { paradas, barridos } = await barrer(pagina, {
        selectores: [SELECTOR_DEL_QUIETO],
        desdeY: donde.desdeY,
        hastaY: Math.min(donde.desdeY + donde.alto, donde.documento - perfil.alto),
        paso,
        precision,
      })
      const filas = ['bueno', 'roto', 'quieto'].map((marca) => {
        const b = barridos.find((x) => x.ficha.huella.includes(`data-arnes=${marca}`))
        if (b === undefined) throw new Error(`el arnés no encontró su propia caja «${marca}»`)
        const v = clasificar(b)
        return { marca, clase: v.clase, porQue: v.porQue, barrido: b }
      })
      const esperado: Record<string, ClaseDePin> = {
        bueno: 'pegado',
        roto: 'roto-con-recorrido',
        quieto: 'no-sticky',
      }
      return {
        desdeY: donde.desdeY,
        alto: donde.alto,
        paradas,
        recorridoDeclarado: RECORRIDO_DEL_ARNES_PX,
        filas,
        separa: filas.every((f) => f.clase === esperado[f.marca]),
      }
    },
    {
      antesDelPintado: [MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION],
      quien: 'b7-b-arnes',
    },
  )
}
