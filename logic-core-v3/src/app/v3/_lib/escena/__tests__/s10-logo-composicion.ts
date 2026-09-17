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

import { afirmar, controlPositivo, deudaDeclarada, titulo } from '../../__tests__/afirmar'
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
 *
 * ── ⚠️ RE-MEDIDO EN TEXTO-2, y el porqué es la mitad de lo que enseña ────
 *
 * TEXTO-2 cambió la composición —el alcance del `col-span` del titular, los dos
 * huecos abajo de 1025 y una bajada más corta— y **el desvío contra el modelo se
 * abrió exactamente como este archivo decía que se iba a abrir**: pasó de una
 * constante de 23 px a 87 · 87 · 87 · 63 · 63, con la dispersión en 24 px. No fue
 * un falso rojo: fue el recibo quedándose viejo, que es la señal que este
 * mecanismo existe para dar.
 *
 * Y la apertura estaba **enteramente atribuida antes de re-medir**: 87 = 23 + 64
 * y 63 = 23 + 40, donde 64 y 40 son lo que el bloque se acortó en cada grupo de
 * anchos (los dos huecos valen 40 px en los cinco; la bajada que deja de
 * envolver, 24 más en tres de ellos). El 23 nunca se movió.
 *
 * Emitido por `scripts-tapado/c-recibo.ts --centrado=texto2-centrado
 * --hoy=texto2-hoy`, sobre las dos corridas nuevas de `a-verdad.ts`.
 *
 * ⚠️ **Las etiquetas son nuevas y `a-verdad-hoy.json` NO se pisó**, a propósito:
 * de ese archivo salen también las bandas de masa del logo que `TEXTO-1` §4 y
 * `TEXTO-2` §4.3 publican, y esas bandas se miden **dentro de la columna del
 * bloque de texto**, que esta composición ensancha a 768 y a 1024. Re-medir
 * encima habría movido en silencio la tabla de dos informes ya escritos. El
 * costo, dicho: `a-verdad-hoy.json` describe el árbol de TAPADO-1 y no el de
 * hoy. Re-basarlo es una decisión del humano y está reportada.
 */
export const RECIBO_DEL_NAVEGADOR: readonly ReciboDelNavegador[] = [
  { ancho: 320, tintaCentrado: 0.475, tintaHoy: 0.315, arribaCentrado: 219.7, arribaHoy: 252.8 },
  { ancho: 375, tintaCentrado: 0.480, tintaHoy: 0.349, arribaCentrado: 255.3, arribaHoy: 309.6 },
  { ancho: 390, tintaCentrado: 0.405, tintaHoy: 0.030, arribaCentrado: 293.5, arribaHoy: 494.9 },
  { ancho: 425, tintaCentrado: 0.447, tintaHoy: 0.040, arribaCentrado: 292.1, arribaHoy: 492.1 },
  { ancho: 768, tintaCentrado: 0.296, tintaHoy: 0.033, arribaCentrado: 368.2, arribaHoy: 644.4 },
  { ancho: 1024, tintaCentrado: 0.010, tintaHoy: 0.005, arribaCentrado: 221.8, arribaHoy: 351.7 },
  { ancho: 1440, tintaCentrado: 0.006, tintaHoy: 0.006, arribaCentrado: 297.4, arribaHoy: 297.4 },
  { ancho: 1920, tintaCentrado: 0.001, tintaHoy: 0.001, arribaCentrado: 373.2, arribaHoy: 373.2 },
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
  /**
   * ⚠️⚠️ **PAPEL-2 · ESTE BLOQUE ESTABA EN VERDE PORQUE LAS DOS MITADES
   * ESTABAN IGUAL DE VIEJAS, Y NO PORQUE EL MODELO SIRVIERA. Es la clase de
   * falla que el repo llama «verde por arnés», y hay que leerla entera antes de
   * tocar una línea de acá.**
   *
   * ── Cómo se destapó ────────────────────────────────────────────────────
   *
   * PAPEL-2 cambió la composición del Hero en dos anchos, así que **tuvo que
   * regenerar el recibo** (`a-verdad.ts` → `c-recibo.ts`). Con el recibo fresco
   * la reconciliación se abrió de golpe —de 21,3 px constantes a más de 150 de
   * dispersión— **en anchos que este sprint no tocó**. Eso no lo podía causar el
   * sprint: lo causó el recibo, que hasta ahora publicaba la pantalla ANTERIOR a
   * COMPO-1.
   *
   * ── Qué se encontró al mirar, con el número ────────────────────────────
   *
   * **El modelo no ve los quiebres DECLARADOS que COMPO-1 introdujo.** A 390
   * publica el registro 1 como UNA caja de 40,7 px —un renglón— y la bajada
   * como UNA de 25,6, cuando en pantalla son DOS y DOS. Los dos renglones que le
   * faltan, más sus huecos, son los ~81 px de diferencia. El motivo es del
   * medidor de cajas: cuenta los renglones que una cadena NECESITA para entrar,
   * y un quiebre declarado —dos `<span>` adentro de un envoltorio `flex-col`— no
   * los necesita, los impone.
   *
   * Y abajo de 375 se le suma un segundo agujero, de otra naturaleza: los
   * tamaños que no están en `NIVELES` —`--text-display-xl-angosto` desde COMPO-1
   * y los dos `--text-display-r1-papel*` desde PAPEL-2— no los resuelve, así que
   * a 320 modela el registro 2 en 67 px envuelto en dos renglones (146,1 px)
   * cuando en pantalla es uno solo de 55 (59,9 px).
   *
   * ── Por qué se DECLARA y no se arregla acá ─────────────────────────────
   *
   * Porque arreglarlo es rehacer el conteo de renglones y la tabla de niveles de
   * `s10-logo-cajas.ts`, que es el instrumento de OTRO sprint, y la regla del
   * repo es anotar y reportar lo que cae fuera del alcance. Lo que SÍ se hizo
   * acá, porque era de este sprint y lo rompió este sprint, son las dos
   * cegueras que la marca del Hero estrenó: `clasesEfectivas` ahora resuelve las
   * variantes `max-` y el reparto vertical entiende `hidden`.
   *
   * ⚠ **Lo que NO se hizo, a propósito: volver a poner el recibo viejo.** Sería
   * devolver el verde apagando la única mitad que dice la verdad de la pantalla.
   */
  deudaDeclarada(
    rango(apoyado) <= DISPERSION_ADMITIDA_PX && rango(centrado) <= DISPERSION_ADMITIDA_PX,
    'el desvío del modelo NO es constante: el modelo no ve los quiebres declarados del titular y de la bajada',
    `dispersión ${rango(apoyado).toFixed(1)} px apoyado · ${rango(centrado).toFixed(1)} px centrado — por ancho: ${desvios.map((d) => `${d.ancho} ${d.delta.toFixed(1)}`).join(' · ')}`,
    'el sprint que rehaga el conteo de renglones de `s10-logo-cajas.ts` para que un quiebre DECLARADO cuente como renglón',
  )
  deudaDeclarada(
    Math.abs(media(apoyado) - FALTANTE_DEL_CTA_PX) <= DISPERSION_ADMITIDA_PX,
    '  y por lo tanto tampoco es el ALTO DEL CTA: ese término explicaba el desvío cuando el recibo era de la misma época que el modelo',
    `medido ${media(apoyado).toFixed(1)} px contra los ${FALTANTE_DEL_CTA_PX} px de la regla del rollover y su separación`,
    'el mismo sprint: con los renglones bien contados, el faltante vuelve a ser un solo término',
  )
  deudaDeclarada(
    Math.abs(media(centrado) - media(apoyado) / 2) <= DISPERSION_ADMITIDA_PX,
    '  y la mitad del centrado tampoco cierra, por lo mismo',
    `${media(centrado).toFixed(1)} px contra ${(media(apoyado) / 2).toFixed(1)}`,
    'el mismo sprint',
  )
  controlPositivo(
    'el detector de «constante» no está ciego: con un desvío inventado de 30 px en un solo ancho, la dispersión se abre',
    30,
    (inventado: number) => rango([...apoyado.slice(1), inventado]) <= DISPERSION_ADMITIDA_PX,
  )
  /**
   * ⚠ **LA MITAD QUE SIGUE SIENDO DURA.** El recibo NO es una deuda: se mide
   * sobre el píxel y es la verdad de la pantalla. Lo que sigue afirmado abajo
   * —qué pasa en los ocho anchos— se alimenta de ÉL y no del modelo, que es
   * exactamente la separación que TEXTO-2 introdujo y que este hallazgo
   * reivindica.
   */
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
  /**
   * ⚠️ **PASA A MIRAR SOLO EL NAVEGADOR, y es la consecuencia directa del
   * hallazgo de arriba.** Pedía las dos cosas a la vez —que el DERIVADO y el
   * MEDIDO estuvieran los dos abajo del 1 %— y el derivado a 1440 y 1920 vale
   * 1,4 % y 1,6 % porque el modelo cuenta mal los renglones. Afirmar sobre el
   * modelo una propiedad DE LA PANTALLA es el defecto que TEXTO-2 ya había
   * corregido dos afirmaciones más abajo; acá había quedado una sin corregir.
   * El derivado se sigue publicando al lado, para que la brecha se vea.
   */
  afirmar(
    arriba.every((f) => (f.recibo?.tintaHoy ?? 1) < 0.01),
    '  y ahí el reparto ya funcionaba: por eso este sprint tiene prohibido tocarlos — MEDIDO en el navegador',
    arriba.map((f) => `${f.ancho}: navegador ${pct(f.recibo?.tintaHoy ?? Number.NaN).trim()} (derivado ${pct(f.hoy).trim()}, que el modelo infla)`).join(' · '),
  )
  /**
   * ⚠️ **ESTAS DOS AFIRMACIONES PASARON DEL MODELO AL RECIBO, en TEXTO-2.**
   *
   * Hasta acá comparaban `f.centrado` contra `f.hoy`, las dos DERIVADAS. Después
   * del cambio de composición el modelo dio vuelta el signo a 320 —dice que ahí
   * la superposición ahora BAJA (37,1 % → 33,2 %)— y **el navegador dice lo
   * contrario: 40,2 % → 46,6 %**. Una afirmación sobre la pantalla que se
   * alimenta del modelo es, en ese punto, una afirmación sobre el modelo.
   *
   * Así que se alimentan del RECIBO, que es la verdad de pantalla y la razón por
   * la que este archivo tiene dos mitades. El enunciado no cambió —cinco de seis
   * bajan, el sexto es 320— y sobre el píxel **sigue siendo cierto**: es el mismo
   * hallazgo de TAPADO-1, medido de nuevo sobre la composición de TEXTO-2.
   *
   * La divergencia del modelo a 320 no se esconde: se declara abajo, igual que
   * la de 768, en vez de promediarse adentro de un verde.
   */
  const bajaEnElNavegador = (f: FilaDeComposicion): boolean =>
    f.recibo !== undefined && f.recibo.tintaHoy < f.recibo.tintaCentrado
  afirmar(
    bajo.filter(bajaEnElNavegador).length >= 5,
    'ABAJO DEL BREAKPOINT la superposición BAJA en cinco de los seis anchos — MEDIDO en el navegador, no derivado',
    bajo
      .map((f) => `${f.ancho}: ${pct(f.recibo?.tintaCentrado ?? Number.NaN).trim()} → ${pct(f.recibo?.tintaHoy ?? Number.NaN).trim()}`)
      .join(' · '),
  )
  /**
   * ⚠️ **EL SEXTO ES 320 Y NO BAJA. Se declara con su número en vez de
   * promediarlo con los otros cinco.** Ahí el bloque de texto ocupa el 62 % del
   * viewport y la masa del logo otro 37 %: la suma pasa de 100, así que **no
   * existe ninguna posición en la que no se toquen**. El barrido de la mejor
   * posición posible lo confirma: 21,8 % pegado al borde de arriba, contra el
   * 33,0 % de entonces. `justify-end` lo mueve 27 px y con eso queda en 34,3 %.
   * Arreglarlo pide una palanca que aquel sprint tenía prohibida (la escena) o
   * una que es de otro (la tipografía del titular a ese ancho).
   *
   * ⚠️ **TEXTO-2 lo dejó PEOR y sigue siendo el sexto: 40,2 % → 46,6 %.** Las
   * tres palancas de ese sprint bajan el bloque otros 64 px, y a 320 el bloque no
   * está arriba del logo sino a caballo suyo: bajarlo mete la línea 1 adentro de
   * la masa. Es el único de los ocho anchos que empeora, está medido en
   * `TEXTO-2` §6 y sigue sin tener salida que no sea la escena o la tipografía.
   */
  /**
   * ⚠️⚠️ **PAPEL-2 · EL SEXTO DEJÓ DE SER LA EXCEPCIÓN, Y AHORA BAJAN LOS
   * SEIS.** Este renglón afirmaba, desde TAPADO-1 y reforzado por TEXTO-2, que
   * 320 era el único ancho donde la superposición **subía**: 40,2 % → 46,6 %.
   * Medido de nuevo sobre la composición de este sprint: **47,5 % → 31,5 %.**
   *
   * Lo que lo dio vuelta NO es una palanca de escena ni de tipografía —las dos
   * que aquel diagnóstico daba como únicas salidas—: es que **la marca entró
   * arriba del titular y la pastilla se fue de abajo**. La marca empuja el
   * bloque hacia arriba y `max-chico:pb-2` le devuelve 72 px de recorrido, así
   * que el titular sale de la masa por donde nadie había mirado: por el ALTO
   * disponible, no por el tamaño de la letra.
   *
   * ⚠ **Y esa cifra es la de DEBAJO DEL PAPEL, no la de la pantalla.** A 320 y
   * a 375 el Hero pinta `papel-opaco`, así que lo que la máscara D fotografía
   * —la escena sola— está TAPADO. Lo que se ve es 0,00 % en los dos, medido con
   * la segunda máscara (`scripts-texto/e-antes-despues.ts`). Se sigue publicando
   * la de abajo del papel porque es la que dice si la composición está sana el
   * día que el papel se saque.
   */
  const c320 = filas.find((f) => f.ancho === 320)
  afirmar(
    c320?.recibo !== undefined && c320.recibo.tintaHoy < c320.recibo.tintaCentrado,
    '✅ y el sexto TAMBIÉN baja desde PAPEL-2: bajan los SEIS — MEDIDO en el navegador, debajo del papel opaco',
    c320?.recibo === undefined
      ? 'sin recibo'
      : `${pct(c320.recibo.tintaCentrado).trim()} → ${pct(c320.recibo.tintaHoy).trim()} · el bloque mide el ${(((c320.abajoPx - c320.arribaPx) / c320.alto) * 100).toFixed(0)} % de ese viewport · en PANTALLA hay 0,00 %: ahí el panel es papel`,
  )
  /**
   * ⚠️ **Y EL MODELO DICE LO CONTRARIO A 320. Se declara, no se afirma.** Es la
   * segunda divergencia con nombre de este archivo —la primera es 768, donde el
   * modelo y el navegador cuentan distinta cantidad de renglones— y aparece con
   * TEXTO-2. La diferencia de forma con 768 importa: allá difieren en una
   * MAGNITUD, acá en el SIGNO, y un modelo que se equivoca de signo no se puede
   * promediar con nada.
   */
  if (c320?.recibo !== undefined && c320.hoy < c320.centrado) {
    console.log(
      `  ⚠ 320: el modelo dice que BAJA (${pct(c320.centrado).trim()} → ${pct(c320.hoy).trim()}) y el navegador dice que SUBE` +
        ` (${pct(c320.recibo.tintaCentrado).trim()} → ${pct(c320.recibo.tintaHoy).trim()}). Difieren en el SIGNO, y por eso` +
        ' la afirmación de arriba se alimenta del recibo. Queda declarado, no afirmado.',
    )
  }
  controlPositivo(
    'el comparador de composiciones no está ciego: arriba del breakpoint las dos son la MISMA y no puede ver una baja',
    1920,
    (ancho: number) => {
      const f = filas.find((x) => x.ancho === ancho)
      return f?.recibo !== undefined && f.recibo.tintaHoy < f.recibo.tintaCentrado
    },
  )
}
