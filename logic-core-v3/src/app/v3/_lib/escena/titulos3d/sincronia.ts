import type * as THREE from 'three'

import { marcarListo, type TituloDeVolumen } from '../../titulos3d/registro'
import { calentar } from '../gpu/Precompilar'
import { armar, ponerElEstudio, soltar, type Armado, type Variante } from './armado'
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

/** Arma un lote, lo compila con las luces de la escena y lo calienta; recién ahí el DOM se entera (regla 2 de ESCENA 10). */
function armarElLote(t: Taller, armados: Armado[], lote: readonly TituloDeVolumen[], vivo: () => boolean): void {
  const nuevos: Armado[] = []
  for (const titulo of lote) {
    const a = armar(titulo, t.variante)
    const rt = t.estudio()
    if (rt !== null) ponerElEstudio(a.material, rt)
    t.raiz.add(a.grupo)
    armados.push(a)
    nuevos.push(a)
  }
  if (nuevos.length === 0) return
  void Promise.all(nuevos.map((a) => t.gl.compileAsync(a.grupo, t.camara, t.escena))).then(() => {
    if (!vivo()) return
    calentar(t.gl, t.escena, t.camara)
    for (const a of nuevos) if (armados.includes(a)) marcarListo(a.titulo.id, true)
  })
}

/**
 * Pone los armados al día con el registro. Devuelve cómo cancelar lo que quedó pendiente (las fuentes, el ocio): una
 * sincronía nueva vuelve a planificar lo que falte. `vivo` es la vida de la escena: lo que compila después de que se fue
 * no marca nada.
 */
export function sincronizar(t: Taller, armados: Armado[], registro: Iterable<TituloDeVolumen>, vivo: () => boolean): () => void {
  const anotados = new Map<string, TituloDeVolumen>()
  for (const titulo of registro) anotados.set(titulo.id, titulo)
  for (const a of [...armados]) {
    const titulo = anotados.get(a.titulo.id)
    if (titulo === undefined) {
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
  void document.fonts.ready.then(() => {
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
  }
}
