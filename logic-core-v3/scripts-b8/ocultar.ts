/**
 * COPIA ATRIBUIDA DE `scripts-b6/ocultar.ts` (B6-A, rama `v3/escena-viva`, 21b9d89e).
 *
 * B6-A no es ancestro de `v3/luz` y este banco no puede importarlo. Es el MISMO
 * instrumento con el prefijo de atributo cambiado a `b8`; cuando las ramas se
 * mergeen, este archivo se borra a favor del original (ver `b8-comun.ts`).
 */
/**
 * LO QUE SE ESCONDE PARA MEDIR — la otra mitad de `lectores.ts`.
 *
 * Sale de `lectores.ts` por las 300 líneas del repo, y el corte es por tema:
 * allá está lo que LEE de la página (bloques, fondos, paneles); acá, lo que
 * cambia `visibility` para que una captura muestre una capa sola. Todo es
 * reversible y todo devuelve si tomó: una captura «sin escena» tomada con la
 * escena todavía visible es una medición que se ve bien y no dice nada.
 */

/** Esconde o muestra unos nodos (`visibility`, que conserva el layout). Devuelve si tomó. */
export function OCULTAR_NODOS(expresionDeNodos: string, oculto: boolean): string {
  return `(async () => {
  const nodos = ${expresionDeNodos}
  for (const el of nodos) el.style.visibility = ${oculto ? "'hidden'" : "''"}
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return nodos.length > 0 && nodos.every((el) => getComputedStyle(el).visibility === ${oculto ? "'hidden'" : "'visible'"})
})()`
}

/** Los envoltorios de nuestra escena. Lo emite `EscenaDelHome.tsx`. */
export const ESCENA_NUESTRA = `[...document.querySelectorAll('[data-escena]')]`

const ATRIBUTO_DE_OCULTO = 'data-b8-oculto'

/**
 * ESCONDE TODO MENOS LA ESCENA — y, si se pasan raíces, conserva la SUPERFICIE
 * de esas raíces con todo lo que tienen adentro escondido.
 *
 *   · sin raíces  → la sala desnuda (S): la escena sobre el fondo del documento.
 *   · con el panel → el panel solo (V): su velo, o su relleno, sobre la escena.
 *
 * ⚠️ **Por qué recorre TODOS los descendientes y no esconde sólo los hijos.**
 * `visibility` se hereda, pero un descendiente con `visibility: visible` propio
 * la vuelve a prender: las piezas de la coreografía lo llevan inline (autoAlpha),
 * y esconder sólo al hijo `sticky` de Trabajos dejaba la tarjeta del proyecto
 * pintada en la captura «sin contenido» — medido, 1259 % de varianza «que
 * pasa» detrás de un panel opaco. Y por lo mismo esconde también lo que vive
 * FUERA del panel (el chrome fijo, la insignia del dev server): todo lo que no
 * sea escena ni raíz. El valor inline previo se guarda en un atributo para
 * restaurarlo tal cual.
 */
export interface Ocultamiento {
  readonly tomo: boolean
  readonly marcados: number
  /** Marcados que siguen visibles (una hoja con `visibility: visible !important`, un shadow root). */
  readonly rebeldes: readonly { readonly etiqueta: string; readonly visibility: string }[]
  /** Las escenas y raíces que tenían que quedar visibles, con lo que el navegador dice de cada una. */
  readonly conservados: readonly { readonly etiqueta: string; readonly visibility: string }[]
}

/** Como `OCULTAR_TODO_MENOS_INFORMANDO`, reducido a «tomó»: para nuestro sitio, donde un rebelde es un error. */
export function OCULTAR_TODO_MENOS(expresionDeRaices: string, expresionDeEscenas: string, oculto: boolean): string {
  return `${OCULTAR_TODO_MENOS_INFORMANDO(expresionDeRaices, expresionDeEscenas, oculto)}.then((r) => r.tomo)`
}

export function OCULTAR_TODO_MENOS_INFORMANDO(expresionDeRaices: string, expresionDeEscenas: string, oculto: boolean): string {
  return `(async () => {
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const marca = ${JSON.stringify(ATRIBUTO_DE_OCULTO)}
  const estado = (el) => ({ etiqueta: el.tagName.toLowerCase(), visibility: getComputedStyle(el).visibility })
  if (!${oculto}) {
    for (const el of document.querySelectorAll('[' + marca + ']')) {
      const previo = el.getAttribute(marca)
      el.style.visibility = previo === '-' ? '' : previo
      el.removeAttribute(marca)
    }
    await raf2()
    const quedan = document.querySelectorAll('[' + marca + ']').length
    return { tomo: quedan === 0, marcados: quedan, rebeldes: [], conservados: [] }
  }
  const raices = ${expresionDeRaices}
  const escenas = ${expresionDeEscenas}
  const cadena = new Set()
  const subir = (el) => { let n = el.parentElement; while (n !== null && n !== document.body) { cadena.add(n); n = n.parentElement } }
  raices.forEach(subir)
  escenas.forEach(subir)
  const esconder = (el) => {
    if (el.hasAttribute(marca)) return
    el.setAttribute(marca, el.style.visibility === '' ? '-' : el.style.visibility)
    el.style.visibility = 'hidden'
    for (const h of el.children) esconder(h)
  }
  const visitar = (el) => {
    for (const h of el.children) {
      if (escenas.includes(h)) continue
      if (raices.includes(h)) { for (const n of h.children) esconder(n); continue }
      if (cadena.has(h)) { visitar(h); continue }
      esconder(h)
    }
  }
  visitar(document.body)
  await raf2()
  const marcados = [...document.querySelectorAll('[' + marca + ']')]
  const rebeldes = marcados.filter((el) => getComputedStyle(el).visibility !== 'hidden').map(estado)
  const conservados = [...escenas, ...raices].map(estado)
  return {
    tomo: marcados.length > 0 && rebeldes.length === 0 && conservados.every((c) => c.visibility === 'visible'),
    marcados: marcados.length,
    rebeldes: rebeldes.slice(0, 20),
    conservados,
  }
})()`
}
