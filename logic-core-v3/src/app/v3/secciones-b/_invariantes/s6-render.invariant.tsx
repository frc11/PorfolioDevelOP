/**
 * INVARIANTE TRANSVERSAL — LAS CUATRO SECCIONES, RENDERIZADAS JUNTAS.
 *
 * Corre con `npm run test:s6-render`.
 *
 * Cada sección tiene su propio instrumento y afirma lo suyo. Éste afirma lo que
 * **ninguno de los cuatro puede ver desde adentro**: el recorrido completo, en
 * sus dos ramas, con el mismo escáner corriendo sobre las cuatro a la vez.
 *
 * ── El hallazgo que este archivo custodia ─────────────────────────────────
 *
 * `cn()` es `twMerge` sobre `clsx`, y `tailwind-merge` **no conoce los nombres
 * del sistema v3**: mete `text-<tamaño>` y `text-<color>` en el mismo grupo y
 * descarta uno de los dos en silencio. Sin error de build, sin error de tipos,
 * sin nada en consola. La comprobación §6 lo mira donde se ve —el marcado— y no
 * en el código: cada elemento de texto declara su nivel en `data-nivel`, así que
 * se le puede exigir que conserve la clase de tamaño de ESE nivel.
 */

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { apagadosDeFoco } from '../../_lib/__tests__/s3-escaneo'
import { NIVELES_TIPOGRAFICOS, type Nivel } from '../../_lib/tipografia'
import { cn } from '@/lib/utils'
import { escanearContenido, marcadoresEn, preciosEncontrados, textoVisible } from '../_contrato/contenido'
import { RECORRIDO } from '../_contrato/recorrido'
import { ORDEN_DE_SECCIONES_B, seccionDe } from '../_contrato/secciones'
import { Cierre } from '../_s8-cierre/Cierre'
import { cuentaDeAtributo, hayAnidamiento, quitarSubarbolesConAtributo, valoresDeAtributo } from './marcado'
import { CONTENIDO_PROHIBIDO_DE_CONTROL } from './soporte'

/** El recorrido entero, en una rama. Es lo que sirve la ruta. */
function marcadoDelRecorrido(anima: boolean): string {
  return RECORRIDO.map(({ id, pura: Pura }) => renderToStaticMarkup(<Pura key={id} anima={anima} />)).join('')
}

const QUIETO = marcadoDelRecorrido(false)
const ANIMADO = marcadoDelRecorrido(true)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El recorrido: las cuatro, en el orden y con la superficie del DATO')

afirmarIgual(
  RECORRIDO.map((e) => e.id),
  [...ORDEN_DE_SECCIONES_B],
  'la ruta monta las cuatro secciones en el orden de la tabla del sitio',
)

const idsEnElMarcado = valoresDeAtributo(QUIETO, 'data-panel')
afirmarIgual(idsEnElMarcado, [...ORDEN_DE_SECCIONES_B], 'y el marcado las emite en ese orden, con su `id` de ancla')

const superficies = valoresDeAtributo(QUIETO, 'data-superficie')
afirmarIgual(
  superficies,
  ORDEN_DE_SECCIONES_B.map((id) => seccionDe(id).superficie),
  'cada `<section>` lleva la superficie que declara la tabla, no una escrita acá',
)
console.log(`  superficies servidas hoy: ${superficies.join(' · ')}`)

controlPositivo('el lector de atributos vería un orden distinto', QUIETO, (html) =>
  JSON.stringify(valoresDeAtributo(html, 'data-panel')) === JSON.stringify([...ORDEN_DE_SECCIONES_B].reverse()),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Abajo de 1025 las cuatro rinden SIN una sola animación')

const transformadasQuietas = (QUIETO.match(/transform:/g) ?? []).length
const willChangeQuieto = (QUIETO.match(/will-change/g) ?? []).length
const divisorQuieto = cuentaDeAtributo(QUIETO, 'data-lineas-piezas')

afirmarIgual(transformadasQuietas, 0, 'cero transformadas en el recorrido entero')
afirmarIgual(willChangeQuieto, 0, 'cero capas promovidas')
afirmarIgual(divisorQuieto, 0, 'el divisor de líneas no corre: no parte un solo texto')

const transformadasAnimadas = (ANIMADO.match(/transform:/g) ?? []).length
const willChangeAnimado = (ANIMADO.match(/will-change/g) ?? []).length
const divisorAnimado = cuentaDeAtributo(ANIMADO, 'data-lineas-piezas')

afirmar(
  transformadasAnimadas > 0 && willChangeAnimado > 0 && divisorAnimado > 0,
  `[control positivo] con coreografía SÍ aparecen: ${transformadasAnimadas} transformadas · ${willChangeAnimado} capas · ${divisorAnimado} bloques partidos`,
  'sin esta mitad, la de arriba pasaría en verde aunque el sistema no animara nunca',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · Abajo de 1025 NO SE PIERDE TEXTO — la rama quieta contiene a la animada')

/** Saca los subárboles `aria-hidden`: el divisor emite una copia visual. */
function textoAnunciado(html: string): string {
  return textoVisible(quitarSubarbolesConAtributo(html, 'aria-hidden'))
}

const textoQuieto = textoAnunciado(QUIETO)
const textoAnimado = textoAnunciado(ANIMADO)

/**
 * ⚠️ LA IGUALDAD LITERAL SERÍA FALSA, Y ES UN HALLAZGO, NO UN ATAJO.
 *
 * Servicios es una SECUENCIA: con coreografía muestra un servicio por vez y sin
 * ella los muestra los tres apilados. Las dos lecturas son deliberadas —es lo
 * que hace que mobile conserve el ritmo sin la maquinaria— así que exigir que
 * los dos textos sean iguales exigiría que la secuencia no exista.
 *
 * Lo que sí tiene que valer, y es la propiedad que le importa a la persona:
 * **todo lo que se anuncia con coreografía se anuncia también sin ella.** La
 * rama quieta es un superconjunto; abajo de 1025 no falta nada. La igualdad
 * exacta tramo por tramo la afirma el instrumento de Servicios, que es el único
 * que sabe cuántos tramos hay.
 */
const FRASES = (texto: string): string[] =>
  texto
    .split(/(?<=\.)\s+|\s+·\s+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 24)

const frasesDeLaAnimada = FRASES(textoAnimado)
const faltantes = frasesDeLaAnimada.filter((f) => !textoQuieto.includes(f))

afirmarIgual(faltantes, [], `las ${frasesDeLaAnimada.length} frases de la rama animada están enteras en la quieta`)
afirmar(frasesDeLaAnimada.length > 0, 'el contrapeso: hay frases que comparar', 'la contención no puede ser por vacío')
afirmar(
  textoQuieto.length >= textoAnimado.length,
  `la rama quieta dice al menos tanto: ${textoQuieto.length} contra ${textoAnimado.length} caracteres`,
  'la diferencia son los otros dos tramos de la secuencia de Servicios, que apilados se leen los tres',
)
afirmar(
  textoAnunciado(ANIMADO).length < textoVisible(ANIMADO).length,
  `el podador saca ${textoVisible(ANIMADO).length - textoAnunciado(ANIMADO).length} caracteres de copia visual`,
  'si no sacara nada, la comparación estaría contando el texto partido dos veces',
)

controlPositivo(
  'el detector ve una frase que la rama quieta NO tiene',
  `${textoAnimado} Esta frase no existe en ninguna de las cuatro secciones del recorrido.`,
  (texto: string) => FRASES(texto).filter((f) => !textoQuieto.includes(f)).length === 0,
)
controlPositivo(
  'y el podador de subárboles no deja pasar texto oculto',
  '<p>visible</p><span aria-hidden="true"><span>tapado</span><span>tapado</span></span>',
  (html) => textoAnunciado(html).includes('tapado'),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El contenido inventado PARECE inventado — el escáner de §0.4')

const hallazgos = escanearContenido(textoQuieto)
afirmarIgual(hallazgos, [], `cero cifras, cero precios y cero números sin declarar en ${textoQuieto.length} caracteres`)
afirmarIgual(preciosEncontrados(textoQuieto), [], 'cero precios, mirado aparte: no están cerrados y no se inventan')

const marcadores = marcadoresEn(textoQuieto)
afirmar(
  marcadores.length > 0,
  `el contrapeso: ${marcadores.length} marcadores distintos en pantalla`,
  marcadores.join(' · '),
)
console.log(`  el pedido a Franco, tal como se lee: ${marcadores.join(' · ')}`)

const hallazgosDelControl = escanearContenido(CONTENIDO_PROHIBIDO_DE_CONTROL)
afirmar(
  hallazgosDelControl.length > 0,
  `[control positivo] la frase prohibida produce ${hallazgosDelControl.length} hallazgos`,
  hallazgosDelControl.map((h) => h.fragmento).join(' · '),
)
controlPositivo('y el escáner la vería aunque llegara adentro del marcado', `<p>${CONTENIDO_PROHIBIDO_DE_CONTROL}</p>`, (html) =>
  escanearContenido(textoVisible(html)).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · El acento: por alias, uno por contexto, y nunca texto sobre oscuro')

const servicios = valoresDeAtributo(ANIMADO, 'data-servicio')
afirmarIgual(servicios.length, 1, 'con coreografía hay EXACTAMENTE un `[data-servicio]` en todo el recorrido')
const serviciosQuietos = valoresDeAtributo(QUIETO, 'data-servicio')
afirmarIgual(serviciosQuietos.length, 3, 'sin coreografía hay uno por servicio, hermanos')
afirmar(!hayAnidamiento(QUIETO, 'data-servicio'), 'y ninguno está anidado adentro de otro')
afirmar(!hayAnidamiento(ANIMADO, 'data-servicio'), '  tampoco con coreografía')

controlPositivo('el detector de anidamiento lo vería', '<div data-servicio="web"><div data-servicio="software"></div></div>', (html) =>
  !hayAnidamiento(html, 'data-servicio'),
)

const marcadoDelCierre = renderToStaticMarkup(<Cierre anima={false} />)
const acentoComoTexto = (marcadoDelCierre.match(/\btext-acento\b/g) ?? []).length
afirmarIgual(acentoComoTexto, 0, 'el Cierre no usa el acento como TEXTO — sobre #0E0E0E dan 2,71 · 2,99 · 2,46')

controlPositivo('el detector ve un `text-acento` cuando lo hay', '<p class="text-acento">x</p>', (html) =>
  (html.match(/\btext-acento\b/g) ?? []).length === 0,
)
const acentosEnElRecorrido = (QUIETO.match(/\b(?:bg|text|border)-acento\b/g) ?? []).length
afirmar(
  acentosEnElRecorrido > 0,
  `el contrapeso: el detector revisó ${acentosEnElRecorrido} usos de acento en el recorrido`,
  'sin esto, "cero acento como texto" sería compatible con "cero acento"',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Ninguna clase de TAMAÑO tipográfico se pierde en el merge de `cn()`')

/** Los tags que declaran nivel, con las clases que realmente salieron. */
function nivelesEnElMarcado(html: string): { readonly nivel: string; readonly clases: string }[] {
  return [...html.matchAll(/<[a-zA-Z][^>]*\bdata-nivel="([^"]+)"[^>]*>/g)].map((m) => ({
    nivel: m[1],
    clases: /\bclass="([^"]*)"/.exec(m[0])?.[1] ?? '',
  }))
}

function sinSuTamano(html: string): string[] {
  return nivelesEnElMarcado(html)
    .filter(({ nivel, clases }) => {
      const definicion = NIVELES_TIPOGRAFICOS[nivel as Nivel]
      if (definicion === undefined) return true
      const lista = clases.split(/\s+/)
      return !lista.includes(definicion.claseFija) && !(definicion.claseFluida !== null && lista.includes(definicion.claseFluida))
    })
    .map(({ nivel, clases }) => `${nivel} → "${clases}"`)
}

const medidos = nivelesEnElMarcado(QUIETO)
afirmarIgual(sinSuTamano(QUIETO), [], `los ${medidos.length} elementos de texto del recorrido conservan su clase de tamaño`)
afirmarIgual(sinSuTamano(ANIMADO), [], '  y también con coreografía')
afirmar(medidos.length > 0, 'el contrapeso: hay elementos de texto que revisar', 'no es verde por vacío')

/**
 * EL CONTROL POSITIVO ES EL DEFECTO REAL, no una simulación: se corre `cn()` con
 * las clases que un componente de texto compone cuando alguien le pasa un color,
 * y se le exige al detector que vea el tamaño desaparecido.
 */
const CLASES_CON_COLOR = cn('font-cuerpo', 'text-fluido-micro', 'leading-micro', 'font-normal', 'text-tinta-media')
console.log(`  medido: cn(…,'text-fluido-micro',…,'text-tinta-media') → "${CLASES_CON_COLOR}"`)
afirmar(
  !CLASES_CON_COLOR.split(/\s+/).includes('text-fluido-micro'),
  'HALLAZGO — `cn()` borra el tamaño cuando convive con un color: por eso ningún componente de texto de este lane recibe una clase de color',
  'el arreglo de fondo es una línea en `src/lib/utils.ts`, que es compartido con el sitio vivo y está fuera de este lane',
)
controlPositivo('el detector ve un elemento al que le falta su tamaño', `<p data-nivel="micro" class="${CLASES_CON_COLOR}">x</p>`, (html) =>
  sinSuTamano(html).length === 0,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · El foco: todo lo interactivo lo conserva')

const interactivos = [...QUIETO.matchAll(/<(?:a\b[^>]*\bhref=|button\b|input\b|textarea\b|select\b)[^>]*>/g)].map((m) => m[0])
const deshabilitados = interactivos.filter((t) => /\bdisabled\b/.test(t)).length
afirmar(interactivos.length > 0, `el recorrido expone ${interactivos.length} elementos interactivos`, `${deshabilitados} deshabilitados a propósito`)
afirmarIgual(apagadosDeFoco(QUIETO), [], 'ninguno apaga el anillo de foco en el marcado servido')
afirmarIgual(
  interactivos.filter((t) => /\btabindex="-1"/.test(t)),
  [],
  'y ninguno se saca del orden de tabulación',
)

controlPositivo('el detector de apagados lo vería en el marcado', '<a href="#x" class="outline-none">x</a>', (html) =>
  apagadosDeFoco(html).length === 0,
)

cerrar('s6-render.invariant')
