/**
 * EL CONTRATO DE SECCIÓN — la forma que tienen las OCHO, escrita una vez.
 *
 * ── Por qué existe este archivo, y por qué ahora hay UNO ──────────────────
 *
 * Las secciones se construyeron en dos lanes paralelos y aislados, cuatro y
 * cuatro, y **cada lane escribió su propio contrato sin ver el del otro**. Los
 * dos resolvieron los mismos problemas —cómo se declara el alto, cómo se
 * consume un patrón de motion, qué es contenido y qué es geometría— y los
 * resolvieron distinto. Dos contratos para una misma cosa no son dos opciones:
 * son una divergencia que crece.
 *
 * SITIO-S7 los unifica en éste. Donde diferían se eligió uno de los dos, nunca
 * el promedio, y el porqué está escrito en el archivo donde vive la decisión.
 *
 * ── Qué fija cada módulo del contrato, en una línea ───────────────────────
 *
 *   `forma.ts`         la FORMA: qué recibe una sección y cómo se lee su alto.
 *   `Seccion.tsx`      el envoltorio: panel, superficie, alto, pinneo, rótulo.
 *   `coreografia.tsx`  las primitivas, QUIETAS. El árbol que baja siempre.
 *   `coreografia-animada.tsx`  las mismas, con el sistema de motion puesto.
 *   `motion.ts`        los helpers puros: anclas del pin, spec, y la compuerta.
 *   `marcadores.ts`    el vocabulario del relleno y el escáner sobre el DATO.
 *   `escaneo.ts`       el escáner sobre el TEXTO RENDERIZADO.
 *   `pedido.ts`        lo que falta, declarado y verificable contra el dato.
 *   `medios.tsx`       el hueco de una imagen o un video que todavía no existe.
 *   `acento.ts`        el acento contextual, que entra por `data-servicio`.
 *   `ritmo.ts`         pantallas y momentos, como cuenta y no como prosa.
 *   `registro.ts`      LAS OCHO, en orden. Es lo que recorre `/v3/page.tsx`.
 *
 * ── La regla que ordena todo el resto ─────────────────────────────────────
 *
 * **El contenido es un DATO y vive aparte del componente.** Cada sección tiene
 * su `contenido.ts`, y reemplazar lo inventado por lo verdadero tiene que ser
 * editar esa tabla — nunca abrir un `.tsx`. Es lo que hace que el pedido a
 * Franco sea accionable: hay un archivo por sección con los agujeros a la
 * vista, y nadie tiene que leer JSX para llenarlos. `CONTENIDO-PENDIENTE.md`
 * es ese pedido, producido por instrumento y no transcrito.
 *
 * ── Por qué este archivo se llama `forma.ts` y no `seccion.ts` ────────────
 *
 * Se llamaba `seccion.ts`, y las cuatro secciones del lane A se rompieron con
 * el mismo defecto a la vez. Al lado vive `Seccion.tsx` —el envoltorio— y los
 * dos nombres **diferían sólo en la caja de una letra**. El sistema de archivos
 * de Windows no distingue mayúsculas, así que `'../_contrato/Seccion'` resolvía
 * al módulo de tipos y la sección se rompía **en silencio**.
 *
 * **La regla que queda:** dos módulos del mismo directorio no pueden tener
 * nombres que difieran sólo en la caja. En un checkout case-insensitive el
 * resolvedor elige uno de los dos y no avisa cuál.
 */

import { SECCIONES, seccionPorId, type Seccion } from '../../_lib/secciones'

/**
 * LAS OCHO, en el orden del recorrido. No hay una novena.
 *
 * No se escriben a mano: salen de `_lib/secciones.ts`, que es la única tabla
 * del recorrido. Los dos lanes tenían cada uno su lista de cuatro (`IDS_DE_
 * SECCION_A`, `ORDEN_DE_SECCIONES_B`) y las dos se podían desincronizar de la
 * tabla sin que nada se quejara. Derivada, no puede.
 */
export const IDS_DE_SECCION = SECCIONES.map((s) => s.id)

/**
 * El id de una sección, como tipo.
 *
 * ⚠ Es `string` y no una unión literal, y es deliberado: la unión tendría que
 * escribirse a mano —`SECCIONES` es un arreglo de `Seccion`, no un literal
 * const— y entonces habría DOS listas de las ocho, que es exactamente lo que
 * este archivo viene a sacar. Lo que protege contra un id inventado no es el
 * tipo: es `seccionDe`, que tira.
 */
export type IdDeSeccion = string

/**
 * La entrada de `secciones.ts` que le corresponde a una sección. Tira si el id
 * no existe.
 *
 * El alto, la superficie y el pinneo **no se declaran dos veces**: una sección
 * que quisiera declarar su propio alto estaría creando una segunda fuente que
 * se desincroniza en el primer cambio. El lane B ya tenía esta función con este
 * mismo mensaje; es la que se conserva.
 */
export function seccionDe(id: IdDeSeccion): Seccion {
  return seccionPorId(id)
}

/**
 * Cuántas pantallas ocupa una sección, derivado de su `alto` declarado.
 *
 * ── La divergencia entre los dos lanes, y cuál gana ───────────────────────
 *
 * El lane A aceptaba `^(\d+)svh$`; el lane B, `^(\d+(?:[.,]\d+)?)svh$`. **Gana
 * la del lane B**, y no por gusto: el ritmo de la referencia se publica con un
 * decimal (23,47 pantallas) y una altura fraccionaria es una que el recorrido
 * puede necesitar sin que haya que tocar el parser. La del lane A la habría
 * rechazado con una excepción en tiempo de ejecución.
 *
 * Las dos tiran con cualquier otra unidad, y eso también se conserva: un alto
 * que no está en `svh` no se adivina.
 */
const RE_SVH = /^(\d+(?:[.,]\d+)?)svh$/

export function pantallasDe(seccion: Seccion): number {
  const m = RE_SVH.exec(seccion.alto.trim())
  if (m === null) {
    throw new Error(`alto no declarado en svh: ${seccion.id} → ${seccion.alto}`)
  }
  return Number.parseFloat(m[1].replace(',', '.')) / 100
}

/**
 * Lo que recibe TODA sección. Exactamente una cosa, y es su entrada de la tabla
 * del recorrido.
 *
 * ── La otra divergencia, y por qué la resolución no es ninguna de las dos ──
 *
 * El lane A pasaba sólo `seccion` y leía la compuerta de un contexto; el lane B
 * pasaba `anima: boolean` y exportaba dos componentes por sección —la pura y la
 * de compuerta—. La de B era mejor que la de A: nada de forzados escondidos, y
 * el instrumento podía renderizar las dos ramas sin inventar un atributo en el
 * producto.
 *
 * Pero con la compuerta resuelta ARRIBA, en la composición, **ninguna de las
 * dos hace falta**: una sección ya no sabe si anima, porque no es asunto suyo.
 * Lo que decide son las primitivas que tenga instaladas el subárbol, y el
 * instrumento las instala o no. Así que la propiedad desaparece, los
 * envoltorios `…ConCompuerta` desaparecen, y las ocho secciones quedan con la
 * firma más chica de las dos.
 */
export interface PropsDeSeccion {
  readonly seccion: Seccion
}

/**
 * El atributo con el que una sección se identifica en el marcado.
 *
 * Existe porque los instrumentos renderizan las ocho a HTML y tienen que poder
 * decir cuál es cuál sin depender del texto que muestran — el texto es relleno
 * y va a cambiar; el atributo no.
 *
 * El lane A lo llamaba `data-seccion-a`, que nombraba al LANE. El lane ya no
 * existe, así que el atributo se llama por lo que marca.
 */
export const ATRIBUTO_DE_SECCION = 'data-seccion-id'
