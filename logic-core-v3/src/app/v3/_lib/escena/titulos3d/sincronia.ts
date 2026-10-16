import type * as THREE from 'three'

import { anotarLaImpresion, anotarLosTitulos, conDiagnostico } from '../../diagnostico/anotar'
import { conReimpresion, esperarLaFuenteDe, fuenteCargadaPara, versionDeLasFuentes } from '../../fuentes'
import { TITULOS_DE_VOLUMEN, marcarListo, pedirOtraSincronia, tituloListo, type TituloDeVolumen } from '../../titulos3d/registro'
import { contextoPerdido } from '../contextoDelLienzo'
import { calentar } from '../gpu/Precompilar'
import { armar, ponerElEstudio, soltar, type Armado, type Variante } from './armado'
import { letrasDelDom } from './colocacion'
import { enOcio } from './ocio'

/**
 * [PASADA FINAL] A1 · LOS ARMADOS, EN SINCRONÍA CON EL REGISTRO — hasta acá cualquier título que entraba o salía del
 * registro (una sección que monta, el `h1` del hero que se vuelve a montar cuando llega la coreografía) soltaba TODOS los
 * armados y los volvía a armar en el ocio: el hero perdía su «listo» (su texto 2D volvía a verse) y su llegada arrancaba
 * de cero. Ahora el registro se sincroniza por diferencia: lo nuevo se arma, lo que se fue se suelta, y un título que
 * vuelve a anotarse con la misma forma (el mismo texto, la misma fuente, el mismo gesto, sin rayas: el `h1` remontado)
 * sólo cambia de elemento y se vuelve a colocar, con su llegada donde iba.
 *
 * Y el hero no espera: los títulos que llegan una sola vez por carga (`rearma: false`) se arman apenas las fuentes del
 * DOM están (sin esperar el ocio: al cargar no hay ninguna llegada en curso que interrumpir) y se compilan solos
 * (`compileAsync` de su grupo, con las luces de la escena) y se calientan; recién ahí el DOM se entera (`marcarListo`),
 * que es la regla de siempre. Los demás, con la página ociosa, como antes. Sin React: lo llama el efecto de la escena.
 *
 * [CIERRE A-ter] A13 · LA CARGA A PRUEBA DE TODO. «Las fuentes del DOM están» era `document.fonts.ready`, que resuelve cuando no hay nada
 * cargando en ese momento: con la red lenta un título se armaba con la x de sus letras medida con la fuente de respaldo y así quedaba.
 * Ahora cada título espera la cara exacta de su DOM (`fuentes.ts`); si igual cambió la métrica (una fuente que cargó después), sus letras
 * ya no están donde las midió y se vuelve a armar con lo mostrado donde iba (el registro pide otra sincronía en cada `loadingdone`). Con
 * el contexto de WebGL perdido no queda nada armado (el DOM vuelve a la vista) y al reponerse se arma todo de nuevo. Y un perro guardián:
 * un título a la vista, con su fuente, sin armar, sin espera ni compilación en curso, más de `GUARDIAN.plazoMs`, se vuelve a armar y lo
 * avisa en la consola (`[v3-carga]`): es la red de seguridad, no el arreglo.
 *
 * Lo que no sincroniza: el material (`variante`), que se lee una vez por carga del entorno.
 */
export interface Taller {
  readonly gl: THREE.WebGLRenderer
  readonly escena: THREE.Scene
  readonly camara: THREE.Camera
  readonly raiz: THREE.Group
  readonly variante: Variante
  readonly estudio: () => THREE.WebGLRenderTarget | null
}

/** ¿El armado que hay sirve para este título? La misma forma: lo que decide su geometría (sin rayas medidas) y su modo. */
export function mismaForma(a: TituloDeVolumen, b: TituloDeVolumen): boolean {
  return a.texto === b.texto && a.fuente === b.fuente && a.gesto === b.gesto && a.trazos.length === 0 && b.trazos.length === 0 && a.queda === b.queda && a.rearma === b.rearma && a.colocacion === b.colocacion && a.forma === b.forma
}

export function soltarElArmado(t: Taller, armados: Armado[], a: Armado): void {
  marcarListo(a.titulo.id, false)
  t.raiz.remove(a.grupo)
  soltar(a)
  const k = armados.indexOf(a)
  if (k >= 0) armados.splice(k, 1)
}

export function soltarTodos(t: Taller, armados: Armado[]): void {
  for (const a of [...armados]) soltarElArmado(t, armados, a)
}

/** [CIERRE A-ter] A13 · ¿Sus letras ya no están donde las midió al armarse (em)? Sin caja (oculto), no se sabe: no. */
export function letrasCorridas(medidas: readonly number[] | null, ahora: readonly number[] | null, tolerancia = 0.005): boolean {
  if (medidas === null || ahora === null) return false
  return ahora.length !== medidas.length || ahora.some((x, k) => Math.abs(x - medidas[k]) > tolerancia)
}
const corridas = (a: Armado): boolean => a.titulo.lugar.isConnected && a.titulo.lugar.offsetWidth > 0 && letrasCorridas(a.letras, letrasDelDom(a.titulo.lugar)?.x ?? null)
/** Con qué tanda de fuentes se miró cada armado: se vuelve a mirar sólo después de otra (un plano en perspectiva no lo rearma en cada sincronía). */
const TANDA_DEL_ARMADO = new WeakMap<Armado, number>()
function cambioSuMetrica(a: Armado): boolean {
  const tanda = versionDeLasFuentes()
  if (TANDA_DEL_ARMADO.get(a) === tanda) return false
  TANDA_DEL_ARMADO.set(a, tanda)
  return corridas(a)
}

/** Lo que espera su fuente o el ocio, y lo que compila: el guardián no los toca. Lo mostrado de los que se rearman, para seguir donde iban. */
const ESPERANDO = new Set<string>()
const COMPILANDO = new Set<string>()
const MOSTRADO_DE_LOS_REARMADOS = new Map<string, { readonly llegada: number; readonly salida: number }>()

/** Arma un lote, lo compila con las luces de la escena y lo calienta; recién ahí el DOM se entera (regla 2 de ESCENA 10). */
function armarElLote(t: Taller, armados: Armado[], lote: readonly TituloDeVolumen[], vivo: () => boolean): void {
  const nuevos: Armado[] = []
  for (const titulo of lote) {
    ESPERANDO.delete(titulo.id)
    const a = armar(titulo, t.variante)
    TANDA_DEL_ARMADO.set(a, versionDeLasFuentes())
    const antes = MOSTRADO_DE_LOS_REARMADOS.get(titulo.id)
    if (antes !== undefined) Object.assign(a.mostrado, antes)
    MOSTRADO_DE_LOS_REARMADOS.delete(titulo.id)
    // [CIERRE A-ter] A13 · para el diagnóstico de la carga: con qué fuente se midió y la x de cada letra (la misma medida que `armar`).
    anotarLaImpresion(`titulo:${titulo.id}`, titulo.lugar, conDiagnostico() ? a.letras : null)
    const rt = t.estudio()
    if (rt !== null) ponerElEstudio(a.material, rt)
    t.raiz.add(a.grupo)
    armados.push(a)
    nuevos.push(a)
    COMPILANDO.add(titulo.id)
  }
  if (nuevos.length === 0) return
  void Promise.all(nuevos.map((a) => t.gl.compileAsync(a.grupo, t.camara, t.escena))).then(() => {
    if (!vivo()) return
    calentar(t.gl, t.escena, t.camara)
    for (const a of nuevos) if (armados.includes(a)) marcarListo(a.titulo.id, true)
  })
    .catch(() => undefined)
    .finally(() => {
      for (const a of nuevos) COMPILANDO.delete(a.titulo.id)
    })
}

/**
 * Pone los armados al día con el registro. Devuelve cómo cancelar lo que quedó pendiente (las fuentes, el ocio): una
 * sincronía nueva vuelve a planificar lo que falte. `vivo` es la vida de la escena: lo que compila después de que se fue
 * no marca nada.
 */
export function sincronizar(t: Taller, armados: Armado[], registro: Iterable<TituloDeVolumen>, vivoDeLaEscena: () => boolean): () => void {
  // [CIERRE A-ter] A13 · la vida incluye el contexto: lo que compila mientras se pierde no avisa «listo» (al reponerse se arma de nuevo).
  const vivo = (): boolean => vivoDeLaEscena() && !contextoPerdido()
  anotarLosTitulos(armados)
  vigilar(t, armados, vivoDeLaEscena)
  // [CIERRE A-ter] A13 · con el contexto perdido no queda nada armado (su DOM, a la vista); al reponerse, otra sincronía arma todo.
  if (contextoPerdido()) {
    soltarTodos(t, armados)
    return () => undefined
  }
  const anotados = new Map<string, TituloDeVolumen>()
  for (const titulo of registro) anotados.set(titulo.id, titulo)
  for (const a of [...armados]) {
    const titulo = anotados.get(a.titulo.id)
    if (titulo === undefined) {
      soltarElArmado(t, armados, a)
      continue
    }
    // [CIERRE A-ter] A13 · armado con otra métrica (la fuente cargó después): se vuelve a armar, con lo mostrado donde iba.
    if (conReimpresion() && cambioSuMetrica(a)) {
      MOSTRADO_DE_LOS_REARMADOS.set(a.titulo.id, { ...a.mostrado })
      soltarElArmado(t, armados, a)
      continue
    }
    if (titulo === a.titulo) continue
    if (mismaForma(a.titulo, titulo)) {
      // El mismo título en otro elemento (el `h1` remontado): cambia de lugar y se vuelve a colocar; la llegada sigue.
      a.titulo = titulo
      a.colocado = false
      continue
    }
    soltarElArmado(t, armados, a)
  }
  for (const a of armados) anotados.delete(a.titulo.id)
  const faltan = [...anotados.values()]
  const urgentes = faltan.filter((x) => !x.rearma)
  const demorados = faltan.filter((x) => x.rearma)
  if (faltan.length === 0) return () => undefined
  let pendiente = true
  let soltarElOcio = (): void => undefined
  for (const x of faltan) ESPERANDO.add(x.id)
  // [CIERRE A-ter] A13 · la cara de cada uno (no `fonts.ready`: resuelve con nada cargando, aunque la de un título no esté).
  const fuentes = conReimpresion() ? Promise.all(faltan.map((x) => esperarLaFuenteDe(x.lugar))) : document.fonts.ready
  void fuentes.then(() => {
    if (!pendiente || !vivo()) return
    armarElLote(t, armados, urgentes, vivo)
    if (demorados.length === 0) return
    soltarElOcio = enOcio(() => {
      if (pendiente && vivo()) armarElLote(t, armados, demorados, vivo)
    })
  })
  return () => {
    pendiente = false
    soltarElOcio()
    for (const x of faltan) ESPERANDO.delete(x.id)
  }
}

/** [CIERRE A-ter] A13 · el perro guardián: cada cuánto mira y cuánto puede estar un título a la vista sin armar (ms). */
export const GUARDIAN = { cadaMs: 1000, plazoMs: 2000 } as const

let vigia: { readonly t: Taller; readonly armados: Armado[]; readonly vivo: () => boolean } | null = null
let relojDelGuardian = 0
const SIN_ARMAR_DESDE = new Map<string, number>()

function vigilar(t: Taller, armados: Armado[], vivo: () => boolean): void {
  vigia = { t, armados, vivo }
  if (relojDelGuardian === 0 && conReimpresion()) relojDelGuardian = window.setInterval(revisar, GUARDIAN.cadaMs)
}

export interface EstadoDelTitulo {
  readonly listo: boolean
  readonly esperando: boolean
  readonly compilando: boolean
  readonly aLaVista: boolean
  readonly conSuFuente: boolean
}
/** ¿Trabado? A la vista, con su fuente, sin armar y sin nada en curso que lo vaya a armar (lo que espera o compila no se toca). */
export const estaTrabado = (e: EstadoDelTitulo): boolean => e.aLaVista && e.conSuFuente && !e.listo && !e.esperando && !e.compilando

function trabado(titulo: TituloDeVolumen): boolean {
  const el = titulo.lugar
  const r = el.getBoundingClientRect()
  const aLaVista = el.isConnected && r.width > 0 && r.bottom > 0 && r.top < innerHeight
  return estaTrabado({ listo: tituloListo(titulo.id), esperando: ESPERANDO.has(titulo.id), compilando: COMPILANDO.has(titulo.id), aLaVista, conSuFuente: aLaVista && fuenteCargadaPara(el) })
}

function revisar(): void {
  const v = vigia
  if (v === null || !v.vivo()) {
    window.clearInterval(relojDelGuardian)
    relojDelGuardian = 0
    SIN_ARMAR_DESDE.clear()
    return
  }
  if (document.visibilityState !== 'visible' || contextoPerdido()) {
    SIN_ARMAR_DESDE.clear()
    return
  }
  const ahora = performance.now()
  for (const titulo of TITULOS_DE_VOLUMEN.values()) {
    if (!trabado(titulo)) {
      SIN_ARMAR_DESDE.delete(titulo.id)
      continue
    }
    const desde = SIN_ARMAR_DESDE.get(titulo.id) ?? ahora
    SIN_ARMAR_DESDE.set(titulo.id, desde)
    if (ahora - desde < GUARDIAN.plazoMs) continue
    SIN_ARMAR_DESDE.delete(titulo.id)
    console.warn(`[v3-carga] «${titulo.texto}» seguía a la vista sin imprimirse: se vuelve a armar`)
    const a = v.armados.find((x) => x.titulo.id === titulo.id)
    if (a !== undefined) soltarElArmado(v.t, v.armados, a)
    pedirOtraSincronia()
  }
}
