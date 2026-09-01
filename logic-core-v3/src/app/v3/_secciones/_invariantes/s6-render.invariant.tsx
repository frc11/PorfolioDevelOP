/**
 * INVARIANTE TRANSVERSAL — LAS CUATRO SECCIONES, RENDERIZADAS JUNTAS.
 *
 * Corre con `npm run test:s6-render`.
 *
 * Cada sección tiene su propio instrumento y afirma lo suyo. Éste afirma lo que
 * **ninguno de los cuatro puede ver desde adentro**: el recorrido completo, en
 * sus dos ramas, con el mismo escáner corriendo sobre las cuatro a la vez.
 *
 * ── El hallazgo que este archivo custodiaba, y que SITIO-S7 arregló ──────
 *
 * `cn()` es `twMerge` sobre `clsx`, y `tailwind-merge` **no conocía los nombres
 * del sistema v3**: metía `text-<tamaño>` y `text-<color>` en el mismo grupo y
 * descartaba uno de los dos en silencio. Sin error de build, de tipos ni de
 * consola.
 *
 * SITIO-S7 lo arregló en la raíz —`src/lib/utils.ts`, que es donde vivía— y esta
 * comprobación **cambia de signo**: donde afirmaba que el defecto existía, ahora
 * afirma que no. La §6 sigue mirando donde se ve —el marcado— y no el código:
 * cada elemento de texto declara su nivel en `data-nivel`, así que se le puede
 * exigir que conserve la clase de tamaño de ESE nivel. Esa parte no se toca:
 * afirmaba el resultado, no el rodeo.
 */

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { apagadosDeFoco } from '../../_lib/__tests__/s3-escaneo'
import { NIVELES_TIPOGRAFICOS, type Nivel } from '../../_lib/tipografia'
import { cn } from '@/lib/utils'
import { escanearContenido, marcadoresEn, preciosEncontrados, textoVisible } from '../_contrato/escaneo'
import { seccionDe } from '../_contrato/forma'
import { REGISTRO } from '../_contrato/registro'
import { Cierre } from '../cierre/Cierre'
// Los detectores de capa son de Servicios y se consumen tal cual: una segunda
// lectura del mismo marcado se desviaría de la de la sección sin que nada avise.
import { capasSinDeclararSuForma, serviciosApagados, serviciosVigentes } from '../servicios/deteccion'
import { marcar } from './render'
import { IDS_DE_S6 } from './soporte'
import { cuentaDeAtributo, hayAnidamiento, quitarSubarbolesConAtributo, valoresDeAtributo } from './marcado'
import { CONTENIDO_PROHIBIDO_DE_CONTROL } from './soporte'

/**
 * Las cuatro de este sprint, en una rama.
 *
 * Salían de `RECORRIDO`, el registro del lane. Con los lanes mergeados hay UN
 * registro y son las cuatro filas de este sprint: se filtran por id declarado,
 * no se vuelven a listar.
 */
const DEL_SPRINT = REGISTRO.filter((r) => IDS_DE_S6.includes(r.id))

function marcadoDelRecorrido(anima: boolean): string {
  return DEL_SPRINT.map(({ id, Componente, seccion }) =>
    marcar(<Componente key={id} seccion={seccion} />, { anima }),
  ).join('')
}

const QUIETO = marcadoDelRecorrido(false)
const ANIMADO = marcadoDelRecorrido(true)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El recorrido: las cuatro, en el orden y con la superficie del DATO')

afirmarIgual(
  DEL_SPRINT.map((e) => e.id),
  [...IDS_DE_S6],
  'la ruta monta las cuatro secciones en el orden de la tabla del sitio',
)

const idsEnElMarcado = valoresDeAtributo(QUIETO, 'data-panel')
afirmarIgual(idsEnElMarcado, [...IDS_DE_S6], 'y el marcado las emite en ese orden, con su `id` de ancla')

const superficies = valoresDeAtributo(QUIETO, 'data-superficie')
afirmarIgual(
  superficies,
  IDS_DE_S6.map((id) => seccionDe(id).superficie),
  'cada `<section>` lleva la superficie que declara la tabla, no una escrita acá',
)
console.log(`  superficies servidas hoy: ${superficies.join(' · ')}`)

controlPositivo('el lector de atributos vería un orden distinto', QUIETO, (html) =>
  JSON.stringify(valoresDeAtributo(html, 'data-panel')) === JSON.stringify([...IDS_DE_S6].reverse()),
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
titulo('3 · Abajo de 1025 NO SE PIERDE TEXTO — y desde SITIO-S11 es la MISMA')

/** Saca los subárboles `aria-hidden`: el divisor emite una copia visual. */
const textoAnunciado = (html: string): string => textoVisible(quitarSubarbolesConAtributo(html, 'aria-hidden'))
const textoQuieto = textoAnunciado(QUIETO)
const textoAnimado = textoAnunciado(ANIMADO)

/**
 * ⚠️ **ESTA SECCIÓN CAMBIÓ DE FORMA EN SITIO-S11, Y SU PREMISA VIEJA MURIÓ.**
 *
 * Decía que la igualdad literal sería falsa y que eso era un hallazgo: Servicios
 * es una secuencia, con coreografía mostraba UN servicio por vez y sin ella los
 * tres, así que lo máximo afirmable era la CONTENCIÓN —todo lo que se anuncia
 * con coreografía se anuncia también sin ella—. Era correcto y era, a la vez, la
 * descripción del defecto 3 de §7.39: los otros dos servicios no estaban en el
 * árbol de accesibilidad.
 *
 * S11 lo arregló —la secuencia elige cuál se PINTA, no cuál existe— y con eso
 * las dos ramas anuncian EXACTAMENTE lo mismo. La contención se reemplaza por la
 * igualdad, estrictamente más fuerte: un superconjunto pasaba en verde con la
 * animada perdiendo cualquier cosa. El podador de `aria-hidden` se queda y se
 * sigue controlando: sin él la comparación contaría dos veces lo que el divisor
 * parte.
 */
afirmarIgual(textoAnimado, textoQuieto, `las dos ramas anuncian EXACTAMENTE lo mismo: ${textoQuieto.length} caracteres, idénticos`)
afirmar(textoQuieto.length > 0, 'el contrapeso: hay texto que comparar', 'la igualdad no puede ser por vacío')
afirmar(
  textoAnunciado(ANIMADO).length < textoVisible(ANIMADO).length,
  `el podador saca ${textoVisible(ANIMADO).length - textoAnunciado(ANIMADO).length} caracteres de copia visual`,
  'si no sacara nada, la comparación estaría contando el texto partido dos veces',
)
controlPositivo(
  'el comparador ve una rama a la que le sobra una frase',
  `${textoAnimado} Esta frase no existe en ninguna de las cuatro secciones del recorrido.`,
  (texto: string) => texto === textoQuieto,
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

/**
 * ⚠️ **LA VOZ ÚNICA CAMBIÓ DE SUJETO EN SITIO-S11, Y LA AFIRMACIÓN ES MÁS
 * FUERTE, NO MÁS FLOJA.** Decía «con coreografía hay EXACTAMENTE un
 * `[data-servicio]`», y era cierta **por un defecto**: la secuencia montaba un
 * servicio por vez, así que arriba de 1025 los otros dos no existían ni para un
 * lector de pantalla (§7.39, defecto 3). S11 puso los tres en el árbol y dejó
 * que la secuencia elija cuál se PINTA, que es lo que la regla del acento
 * siempre quiso decir: lo que no puede haber son dos acentos EN EL MISMO CUADRO,
 * no dos nodos en el documento. Por eso ahora son varias afirmaciones y no una:
 * la de la capa pintada es la que impide que la primera afloje la regla.
 */
const servicios = valoresDeAtributo(ANIMADO, 'data-servicio')
afirmarIgual(servicios.length, 3, 'con coreografía los TRES `[data-servicio]` están en el árbol: la secuencia elige cuál se PINTA, no cuál existe')
afirmarIgual(serviciosVigentes(ANIMADO).length, 1, '  y exactamente UNA capa declara estar pintada — un acento por cuadro, que es la regla')
afirmarIgual(serviciosApagados(ANIMADO).length, 2, '  y las otras dos, apagadas sin salir del árbol')
afirmarIgual(capasSinDeclararSuForma(ANIMADO), [], '  y ninguna se contradice: lo que dice ser y lo que su clase hace coinciden')
controlPositivo('el detector de la capa pintada vería DOS acentos en el mismo cuadro', '<div data-servicio="web" data-capa="vigente" class="w-full"></div><div data-servicio="software" data-capa="vigente" class="w-full"></div>', (h: string) => serviciosVigentes(h).length === 1)
const serviciosQuietos = valoresDeAtributo(QUIETO, 'data-servicio')
afirmarIgual(serviciosQuietos.length, 3, 'sin coreografía hay uno por servicio, hermanos')
afirmar(!hayAnidamiento(QUIETO, 'data-servicio'), 'y ninguno está anidado adentro de otro')
afirmar(!hayAnidamiento(ANIMADO, 'data-servicio'), '  tampoco con coreografía')

controlPositivo('el detector de anidamiento lo vería', '<div data-servicio="web"><div data-servicio="software"></div></div>', (html) =>
  !hayAnidamiento(html, 'data-servicio'),
)

const marcadoDelCierre = marcar(<Cierre seccion={seccionDe('cierre')} />, { anima: false })
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
/**
 * ⚠ ESTA AFIRMACIÓN CAMBIÓ DE SIGNO EN SITIO-S7, y es la forma correcta de
 * cerrar un hallazgo: **no se borra la comprobación, se le da vuelta.**
 *
 * Decía: *"HALLAZGO — `cn()` borra el tamaño cuando convive con un color"*, y
 * afirmaba que el defecto EXISTÍA. Era lo correcto mientras el arreglo estuviera
 * fuera del alcance del lane: una comprobación que documenta un defecto es lo
 * que impide que se olvide.
 *
 * SITIO-S7 arregló la raíz —los tokens de /v3 entraron a las listas de
 * `src/lib/utils.ts`— así que ahora se afirma lo contrario, con el mismo caso y
 * las mismas clases: el tamaño **sobrevive**. Si alguien revirtiera el arreglo,
 * esto se pone en rojo.
 */
const CLASES_CON_COLOR = cn('font-cuerpo', 'text-fluido-micro', 'leading-micro', 'font-normal', 'text-tinta-media')
console.log(`  medido: cn(…,'text-fluido-micro',…,'text-tinta-media') → "${CLASES_CON_COLOR}"`)
afirmar(
  CLASES_CON_COLOR.split(/\s+/).includes('text-fluido-micro'),
  'el tamaño SOBREVIVE al color: el defecto de `cn()` está arreglado en la raíz',
  'lo verifica sobre el sitio vivo entero `test:s7-cn`, con 5.775 cadenas de clase',
)
afirmar(
  CLASES_CON_COLOR.split(/\s+/).includes('text-tinta-media'),
  '  y el color también: no se arregló uno rompiendo el otro',
)

/** El control del DETECTOR sigue necesitando un elemento sin su tamaño. Ya no lo
 *  puede producir `cn()`, así que se escribe a mano: es una entrada equivocada,
 *  no una simulación del defecto. */
controlPositivo(
  'el detector ve un elemento al que le falta su tamaño',
  '<p data-nivel="micro" class="font-cuerpo leading-micro text-tinta-media">x</p>',
  (html) => sinSuTamano(html).length === 0,
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
