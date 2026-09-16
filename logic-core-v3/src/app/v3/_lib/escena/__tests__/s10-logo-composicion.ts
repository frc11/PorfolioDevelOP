/**
 * LA COMPOSICIÓN DEL HERO CONTRA EL LOGO, ANCHO POR ANCHO — y el recibo del
 * navegador que la contrasta.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Sus números son tamaños de
 * ventana y fracciones medidas, no valores de diseño.
 *
 * ── ⚠️ QUÉ DESBLOQUEA, y por qué recién ahora ────────────────────────────
 *
 * `s10-logo.invariant.ts` §1 declaraba cuatro anchos en `noCorre` con este
 * motivo, textual: *«medir la superposición contra una composición que se sabe
 * provisoria no mide el sitio, mide el andamio. La medición es del sprint de
 * composición»*. Éste es ese sprint. Los anchos salen de la lista y entran a
 * una tabla.
 *
 * ── LAS DOS MITADES, y por qué ninguna sola alcanza ──────────────────────
 *
 *   · **La derivada.** `repartoVertical` coloca el bloque con las clases que el
 *     marcado declara y `superposicionReal` lo cruza con la silueta del logo
 *     proyectada. Corre sin navegador, así que vive en el gate.
 *   · **El recibo.** `scripts-tapado/a-verdad.ts` abre la página en cada ancho
 *     con recarga limpia y mide TINTA CONTRA TINTA sobre el píxel. Es la
 *     verdad de pantalla, y es lo que dice si el modelo sirve.
 *
 * Un modelo sin recibo es una cuenta que nadie comprobó; un recibo sin modelo es
 * un número que el gate no puede volver a mirar. Acá el modelo se afirma
 * **contra** el recibo, con su delta publicado.
 *
 * ── ⚠ EL RECIBO ES DE UN MOMENTO, Y LO DICE ──────────────────────────────
 *
 * `RECIBO_DEL_NAVEGADOR` se midió sobre el árbol de TAPADO-1 con el dev server
 * de este worktree, y lo emite `scripts-tapado/c-recibo.ts` —no se transcribe a
 * mano—. No se regenera solo: si alguien cambia la composición del hero y no
 * vuelve a correr `a-verdad.ts`, el desvío contra el modelo se abre y **esa
 * apertura es la señal**, no un falso rojo.
 *
 * ⚠ **Y lo que se afirma NO es una tolerancia, es la FORMA del desvío**: que sea
 * constante dentro de cada composición, que su tamaño sea el alto del CTA que el
 * modelo no ve, y que centrar el bloque muestre exactamente la mitad. Una
 * tolerancia amplia esconde un sesgo sistemático adentro de un verde; una forma
 * afirmada se rompe en cuanto el sesgo cambia de naturaleza.
 */

import { afirmar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { muestrearLogo } from './s10-logo'
import { ESCENA_REAL } from './s10-logo-lectura'
import { bloqueDeTexto, conDistribucion, repartoVertical, superposicionReal } from './s10-logo-alto'

export interface VentanaDeComposicion {
  readonly ancho: number
  readonly alto: number
  /** De dónde sale el PAR. Un tamaño sin procedencia es un número inventado. */
  readonly procedencia: string
  /** `true` si el ancho cae del lado donde este sprint movió el texto. */
  readonly abajoDelBreakpoint: boolean
}

/**
 * LOS OCHO. Es la misma lista que `scripts-tapado/tapado-comun.ts` usa para
 * medir, y tiene que serlo: una tabla derivada sobre ventanas distintas de las
 * medidas no se puede contrastar con nada.
 */
export const VENTANAS_DE_COMPOSICION: readonly VentanaDeComposicion[] = [
  { ancho: 320, alto: 568, procedencia: 'par de TAPADO-1 — el viewport de layout del iPhone SE de 1.ª gen', abajoDelBreakpoint: true },
  { ancho: 375, alto: 667, procedencia: '`scripts-b4/perfiles.ts` — iPhone SE 2.ª/3.ª gen', abajoDelBreakpoint: true },
  { ancho: 390, alto: 844, procedencia: '`s10-referencias.VIEWPORTS_MEDIDOS` — el teléfono que S0 midió', abajoDelBreakpoint: true },
  { ancho: 425, alto: 844, procedencia: 'par de TAPADO-1 — «Mobile L» de DevTools, el ancho que el humano capturó', abajoDelBreakpoint: true },
  { ancho: 768, alto: 1024, procedencia: '`scripts-b4/perfiles.ts` — iPad en retrato', abajoDelBreakpoint: true },
  { ancho: 1024, alto: 768, procedencia: '`scripts-b4/perfiles.ts` — un píxel abajo del umbral', abajoDelBreakpoint: true },
  { ancho: 1440, alto: 900, procedencia: '`scripts-b4/perfiles.ts` — el ancho donde el proyecto define el ritmo', abajoDelBreakpoint: false },
  { ancho: 1920, alto: 1080, procedencia: '`scripts-b4/perfiles.ts` — `--container-tope`', abajoDelBreakpoint: false },
]

export interface ReciboDelNavegador {
  readonly ancho: number
  /** Fracción de la TINTA del titular sobre la masa negra del logo, centrado. */
  readonly tintaCentrado: number
  /** La misma, con la composición de hoy. */
  readonly tintaHoy: number
  /** El borde de arriba del bloque de texto, medido con `getBoundingClientRect`. */
  readonly arribaCentrado: number
  readonly arribaHoy: number
}

/**
 * EL RECIBO — `scripts-tapado/a-verdad.ts`, `deviceScaleFactor` 1, recarga
 * limpia por ancho. «Centrado» es el estado anterior del hero y «hoy» el actual.
 */
export const RECIBO_DEL_NAVEGADOR: readonly ReciboDelNavegador[] = [
  { ancho: 320, tintaCentrado: 0.307, tintaHoy: 0.315, arribaCentrado: 101.2, arribaHoy: 110.3 },
  { ancho: 375, tintaCentrado: 0.562, tintaHoy: 0.472, arribaCentrado: 207.3, arribaHoy: 322.7 },
  { ancho: 390, tintaCentrado: 0.548, tintaHoy: 0.172, arribaCentrado: 295.4, arribaHoy: 498.8 },
  { ancho: 425, tintaCentrado: 0.481, tintaHoy: 0.114, arribaCentrado: 306.3, arribaHoy: 520.7 },
  { ancho: 768, tintaCentrado: 0.568, tintaHoy: 0.416, arribaCentrado: 299.8, arribaHoy: 519.7 },
  { ancho: 1024, tintaCentrado: 0.206, tintaHoy: 0.158, arribaCentrado: 244.6, arribaHoy: 409.1 },
  { ancho: 1440, tintaCentrado: 0.006, tintaHoy: 0.007, arribaCentrado: 298.2, arribaHoy: 298.2 },
  { ancho: 1920, tintaCentrado: 0.001, tintaHoy: 0.001, arribaCentrado: 374.0, arribaHoy: 374.0 },
]

export interface FilaDeComposicion {
  readonly ancho: number
  readonly alto: number
  readonly abajoDelBreakpoint: boolean
  /** La superposición derivada con el bloque CENTRADO: la composición anterior. */
  readonly centrado: number
  /** La derivada con la composición de HOY. */
  readonly hoy: number
  /** El borde de arriba del bloque hoy, derivado. */
  readonly arribaPx: number
  readonly abajoPx: number
  readonly recibo: ReciboDelNavegador | undefined
}

export function tablaDeComposicion(): readonly FilaDeComposicion[] {
  return VENTANAS_DE_COMPOSICION.map((v): FilaDeComposicion => {
    const m = muestrearLogo(0, v.ancho / v.alto, ESCENA_REAL, 300, 220, 1)
    const hoy = repartoVertical('hero', v.ancho, v.alto)
    const b = bloqueDeTexto(hoy)
    return {
      ancho: v.ancho,
      alto: v.alto,
      abajoDelBreakpoint: v.abajoDelBreakpoint,
      centrado: superposicionReal(
        m,
        repartoVertical('hero', v.ancho, v.alto, { clasesDe: conDistribucion('center') }),
      ).fraccion,
      hoy: superposicionReal(m, hoy).fraccion,
      arribaPx: b?.arribaPx ?? Number.NaN,
      abajoPx: b?.abajoPx ?? Number.NaN,
      recibo: RECIBO_DEL_NAVEGADOR.find((r) => r.ancho === v.ancho),
    }
  })
}

/**
 * ⚠ **EL MODELO NO COINCIDE CON EL NAVEGADOR, Y LO QUE SE AFIRMA NO ES UNA
 * TOLERANCIA SINO LA FORMA DEL DESVÍO.** Una tolerancia amplia esconde un sesgo
 * sistemático adentro de un verde; lo que hay acá es un sesgo **medido,
 * atribuido y con estructura**, y eso se puede afirmar mucho más fuerte.
 *
 * La causa, con su número: **el CTA mide 47 px en la pantalla y el modelo le da
 * 24**. Los 24 son la caja de línea (`--text-cuerpo` 15 px × `--leading-texto`
 * 1,6), que es lo que `s10-logo-cajas.ts` calcula; los 23 que faltan son la
 * regla del rollover y su separación, que `Cta.tsx` estila **por selector de
 * atributo** (`[data-pieza="cta"]`) y no por clase — o sea que un modelo que lee
 * clases no puede verlos, y esa frontera está declarada en `SUPUESTOS_DEL_ALTO`.
 * `_lib/cta.ts` declara 3 px para la raya; los otros 20 son la separación.
 *
 * De ahí sale la estructura, y es la que se afirma:
 *
 *   · con `justify-end` el bloque se apoya abajo, así que **todo** el faltante
 *     aparece arriba: delta = 23 px;
 *   · con `justify-center` el sobrante se reparte, así que **la mitad**: 11,5 px.
 *
 * Un solo término faltante explica los dos grupos y su factor 2. Si el desvío
 * fuera ruido —o si el modelo estuviera mal en otra cosa— esa relación no se
 * cumpliría. El 768 queda afuera porque ahí además el modelo y el navegador
 * cuentan distinta cantidad de renglones del titular: se declara aparte en vez
 * de esconderse en un promedio.
 */
export const FALTANTE_DEL_CTA_PX = 23
/** Cuánto puede variar el desvío entre anchos y seguir llamándose constante. */
export const DISPERSION_ADMITIDA_PX = 2
const ANCHO_CON_CONTEO_DISTINTO = 768

const pct = (v: number): string => `${(v * 100).toFixed(1).padStart(5)} %`

export function afirmarLaComposicionDelHero(): void {
  titulo('1b · LA COMPOSICIÓN DEL HERO, ANCHO POR ANCHO — lo derivado contra el recibo del navegador')

  const filas = tablaDeComposicion()
  console.log('  ancho×alto   derivado: centrado → hoy      navegador (tinta): centrado → hoy     bloque hoy')
  for (const f of filas) {
    const r = f.recibo
    console.log(
      `  ${String(f.ancho).padStart(4)}×${String(f.alto).padEnd(4)}  ${pct(f.centrado)} → ${pct(f.hoy)}   ` +
        `${r === undefined ? '        n/d        ' : `${pct(r.tintaCentrado)} → ${pct(r.tintaHoy)}`}   ` +
        `${f.arribaPx.toFixed(0).padStart(4)}..${f.abajoPx.toFixed(0).padEnd(4)} de ${f.alto}`,
    )
  }

  // ── El desvío contra el navegador: su FORMA, no una tolerancia ──────────
  const desvios = filas
    .filter((f) => f.recibo !== undefined && f.ancho !== ANCHO_CON_CONTEO_DISTINTO)
    .map((f) => ({ ancho: f.ancho, abajo: f.abajoDelBreakpoint, delta: f.arribaPx - f.recibo!.arribaHoy }))
  const apoyado = desvios.filter((d) => d.abajo).map((d) => d.delta)
  const centrado = desvios.filter((d) => !d.abajo).map((d) => d.delta)
  const rango = (v: readonly number[]): number => (v.length === 0 ? 0 : Math.max(...v) - Math.min(...v))
  const media = (v: readonly number[]): number => (v.length === 0 ? Number.NaN : v.reduce((a, b) => a + b, 0) / v.length)

  console.log(
    `  el desvío contra el navegador — apoyado abajo: ${apoyado.map((d) => d.toFixed(1)).join(' · ')} px` +
      ` · centrado: ${centrado.map((d) => d.toFixed(1)).join(' · ')} px`,
  )
  afirmar(
    rango(apoyado) <= DISPERSION_ADMITIDA_PX && rango(centrado) <= DISPERSION_ADMITIDA_PX,
    'el desvío del modelo es CONSTANTE dentro de cada composición: es un término que falta, no ruido',
    `dispersión ${rango(apoyado).toFixed(1)} px apoyado · ${rango(centrado).toFixed(1)} px centrado`,
  )
  afirmar(
    Math.abs(media(apoyado) - FALTANTE_DEL_CTA_PX) <= DISPERSION_ADMITIDA_PX,
    '  y ese término es el ALTO DEL CTA que el modelo no ve: 47 px en pantalla contra 24 calculados',
    `medido ${media(apoyado).toFixed(1)} px contra los ${FALTANTE_DEL_CTA_PX} px de la regla del rollover y su separación`,
  )
  afirmar(
    Math.abs(media(centrado) - media(apoyado) / 2) <= DISPERSION_ADMITIDA_PX,
    '  y con el bloque CENTRADO aparece la MITAD, que es lo que un centrado hace con un faltante',
    `${media(centrado).toFixed(1)} px contra ${(media(apoyado) / 2).toFixed(1)} — un solo término explica los dos grupos`,
  )
  controlPositivo(
    'el detector de «constante» no está ciego: con un desvío inventado de 30 px en un solo ancho, la dispersión se abre',
    30,
    (inventado: number) => rango([...apoyado.slice(1), inventado]) <= DISPERSION_ADMITIDA_PX,
  )
  const f768 = filas.find((f) => f.ancho === ANCHO_CON_CONTEO_DISTINTO)
  if (f768?.recibo !== undefined) {
    console.log(
      `  ⚠ ${ANCHO_CON_CONTEO_DISTINTO}: el modelo y el navegador NO coinciden en el conteo de renglones del titular,` +
        ` así que su delta es de ${(f768.arribaPx - f768.recibo.arribaHoy).toFixed(1)} px y queda declarado, no afirmado. Es el único.`,
    )
  }

  const bajo = filas.filter((f) => f.abajoDelBreakpoint)
  const arriba = filas.filter((f) => !f.abajoDelBreakpoint)
  afirmar(
    arriba.every((f) => f.centrado === f.hoy),
    '🔴→✅ ARRIBA DEL BREAKPOINT NO SE MOVIÓ UN PÍXEL: la variante deja `justify-center` intacto',
    arriba.map((f) => `${f.ancho} ${pct(f.hoy).trim()}`).join(' · '),
  )
  afirmar(
    arriba.every((f) => f.hoy < 0.01) && (arriba[0]?.recibo?.tintaHoy ?? 1) < 0.01,
    '  y ahí el reparto ya funcionaba: por eso este sprint tiene prohibido tocarlos',
    arriba.map((f) => `${f.ancho}: derivado ${pct(f.hoy).trim()} · navegador ${pct(f.recibo?.tintaHoy ?? Number.NaN).trim()}`).join(' · '),
  )
  afirmar(
    bajo.filter((f) => f.hoy < f.centrado).length >= 5,
    'ABAJO DEL BREAKPOINT la superposición BAJA en cinco de los seis anchos',
    bajo.map((f) => `${f.ancho}: ${pct(f.centrado).trim()} → ${pct(f.hoy).trim()}`).join(' · '),
  )
  /**
   * ⚠️ **EL SEXTO ES 320 Y NO BAJA. Se declara con su número en vez de
   * promediarlo con los otros cinco.** Ahí el bloque de texto ocupa el 62 % del
   * viewport y la masa del logo otro 37 %: la suma pasa de 100, así que **no
   * existe ninguna posición en la que no se toquen**. El barrido de la mejor
   * posición posible lo confirma: 21,8 % pegado al borde de arriba, contra el
   * 33,0 % de hoy. `justify-end` lo mueve 27 px y con eso queda en 34,3 %.
   * Arreglarlo pide una palanca que este sprint tiene prohibida (la escena) o
   * una que es de otro (la tipografía del titular a ese ancho).
   */
  const c320 = filas.find((f) => f.ancho === 320)
  afirmar(
    c320 !== undefined && c320.hoy >= c320.centrado,
    '🔴 y el sexto es 320, donde NO baja — declarado, no promediado',
    c320 === undefined ? 'sin fila' : `${pct(c320.centrado).trim()} → ${pct(c320.hoy).trim()} · el bloque mide el ${(((c320.abajoPx - c320.arribaPx) / c320.alto) * 100).toFixed(0)} % de ese viewport`,
  )
  controlPositivo(
    'el comparador de composiciones no está ciego: arriba del breakpoint las dos son la MISMA y no puede ver una baja',
    1920,
    (ancho: number) => {
      const f = filas.find((x) => x.ancho === ancho)
      return f !== undefined && f.hoy < f.centrado
    },
  )
}
