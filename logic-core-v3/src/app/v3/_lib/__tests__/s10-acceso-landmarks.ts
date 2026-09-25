/**
 * §5 DEL INVARIANTE DE ACCESIBILIDAD — LOS LANDMARKS, los que hay y los que no
 * llegan a serlo.
 *
 * Sale del invariante en SITIO-S11, que dio vuelta su censo —de «dos landmarks»
 * a «diez»— y le agregó la comprobación que faltaba: que ningún
 * `aria-labelledby` cuelgue. El archivo cruzó las 300 líneas del repo y se cortó
 * por tema. Acá viven los hallazgos 5, 6, 7 y 8 de §7.39.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import { candidatosALandmark } from './s10-lectura'
import { atributo, nodosDe } from './s10-recorrido'
import { esRolDeLandmark } from './s10-acceso'
import { imprimirLandmarks, publicar } from './s10-acceso-tablas'
import { RAMAS } from './s10-banco'
import { CLASE_DE_LA_PASTILLA_APAGADA } from '../../_chrome/contrato'

export function afirmarLosLandmarks(QUIETA: string, marcado: (rama: (typeof RAMAS)[number]) => string): void {
  titulo('5 · LOS LANDMARKS — los que hay, y los que no llegan a serlo')

  /**
   * ⚠️ **CENSO MOVIDO EN SITIO-S11 — el hallazgo 6 está cerrado: 2 landmarks → 10.**
   *
   * S10 afirmaba que las OCHO `<section>` quedaban sin nombre accesible y que por
   * eso el documento tenía dos landmarks en vez de diez. S11 las nombró con
   * `aria-labelledby` apuntando al titular de cada una (`_componentes/Panel.tsx` +
   * `idDelTitularDeSeccion` en `_componentes/tipografia/Titular.tsx`), así que las
   * ocho aportan una `region` y navegar por regiones sí sirve para recorrer el
   * home. Se eligió `aria-labelledby` y no `aria-label` para que el nombre de la
   * región SEA el texto que se lee en pantalla: con `aria-label` habría una
   * segunda copia del nombre, capaz de desviarse del titular sin que nada se queje.
   *
   * ⚠️ **Y con eso entra una comprobación QUE S10 NO TENÍA, y hacía falta.**
   * `rolDeLandmark` da por bueno un `aria-labelledby` **sin mirar si el id
   * existe**: una sección con la referencia rota seguiría contando como `region`
   * acá y se quedaría sin nombre en el árbol real. Es un verde por vacío
   * esperando, y con ocho referencias recién escritas es exactamente el momento de
   * cerrarlo. Se afirma que ninguna cuelga, con su control positivo.
   */
  const CANDIDATOS = candidatosALandmark(QUIETA)
  imprimirLandmarks(CANDIDATOS)
  const LANDMARKS = CANDIDATOS.filter((l) => esRolDeLandmark(l.rol))
  afirmarIgual(LANDMARKS.length, 11, 'el documento tiene ONCE landmarks, contra los DOS que S10 midió y los DIEZ de S11')
  afirmarIgual([...new Set(LANDMARKS.map((l) => l.rol))].sort(), ['banner', 'main', 'navigation', 'region'], '  y son de cuatro clases: el `banner`, el `main`, la `navigation` y las ocho `region`')
  afirmarIgual(LANDMARKS.filter((l) => l.rol === 'region').length, 8, '  una `region` por sección, las ocho')
  /**
   * ⚠ **LAS DOS AFIRMACIONES DEL DEFECTO 15, ESCRITAS CONTRA LA PROPIEDAD Y NO
   * CONTRA UN ÍNDICE (SITIO-S12).** El defecto pedía dos cosas a la vez: que
   * exista `banner` y que el `navigation` **deje de estar anidado** en el
   * `main`. Un `CANDIDATOS[0].etiqueta === 'main'` no dice ninguna de las dos —
   * dice cuál viene primero— y se ponía en rojo por el arreglo mismo.
   */
  const bannerEsPrimero = LANDMARKS[0].rol === 'banner'
  afirmar(bannerEsPrimero, 'el `banner` EXISTE y abre el documento — el `<header>` es el envoltorio de la pastilla, hermano del `<main>`', LANDMARKS.map((l) => l.rol).join(' · '))
  /**
   * ⚠️⚠️ **ESTA CUENTA ES DE MARCADO, Y ABAJO DE 860 LA PANTALLA TIENE DOS
   * LANDMARKS MENOS. Se declara acá porque este censo es el único lugar del
   * repo donde alguien va a buscar el número.**
   *
   * `ChromeDelHome` monta la pastilla con `max-medio:hidden` —pedido del dueño:
   * va a rehacer la navegación y quiere planificar las vistas angostas sin
   * ella, y la decisión está declarada como TEMPORAL en `_chrome/contrato.ts`—.
   * Un `display:none` saca el elemento del árbol de accesibilidad, así que
   * abajo de 860 se van el `banner` —que ES ese envoltorio— y la `navigation`
   * que cuelga de él: quedan **9 de los 11**, y el `<main>` pasa a abrir el
   * documento.
   *
   * ⚠️ **LA BANDA CRECIÓ EN COMPO-2 Y EL INVARIANTE NO SE BORRÓ: SE REESCRIBIÓ
   * CON LA BANDA NUEVA.** PAPEL-2 la apagaba abajo de 390 —dos anchos del set,
   * 320 y 375—; el §2 y el §3 de COMPO-2 la apagan también en 425 y en 768, así
   * que el corte pasa a `--breakpoint-medio` (860) y los anchos del set
   * afectados pasan de **dos a cinco**. Lo que se pierde por ancho es lo mismo;
   * lo que cambió es en cuántos.
   *
   * **El censo NO lo ve y no se lo hace ver.** Lee el marcado estático, que no
   * tiene ancho; una media query no se puede contar desde un HTML. Lo que se
   * hace es afirmar lo que SÍ es comprobable desde acá —que el `banner` viaja
   * con la clase que lo apaga, o sea que la pérdida está acotada a esa banda y
   * no es un descuido— y dejar el número escrito.
   *
   * ⚠ `SaltarAlContenido` NO se tocó y sigue siendo el primer foco de la
   * página, así que el atajo de teclado que importa sigue estando en los ocho
   * anchos.
   *
   * **Esto es una regresión de accesibilidad y se declara como tal.** Cierra
   * cuando la navegación nueva se monte; si tampoco aparece abajo de 860, el
   * reemplazo tiene que traer su propio landmark.
   */
  afirmar(
    QUIETA.includes(CLASE_DE_LA_PASTILLA_APAGADA),
    `  ⚠ y ABAJO DE 860 no está: el envoltorio del \`banner\` lleva \`${CLASE_DE_LA_PASTILLA_APAGADA}\` — ahí el documento tiene ${LANDMARKS.length - 2} landmarks y el \`main\` lo abre (PAPEL-2 §5 + COMPO-2 §2b/§3a, TEMPORAL)`,
    `${LANDMARKS.length} en el marcado · ${LANDMARKS.length - 2} en pantalla abajo de 860 — 5 de los 8 anchos del set`,
  )
  // CONTACTO · la clase es sólo la conjetura de antes de medir; el modo lo decide `NavegacionDelHome` por el ancho real (barra desde 628 px) y abajo va el menú móvil.
  afirmarIgual(
    CLASE_DE_LA_PASTILLA_APAGADA,
    'max-medio:invisible',
    '  y la banda es la del corte declarado que separa 768 de 1024, como conjetura antes de medir: `invisible` y no `hidden`, para que la barra se pueda medir',
  )
  controlPositivo(
    'el chequeo de la banda ve una pastilla apagada en TODO ancho, que sería otra cosa',
    '<header class="hidden" data-pieza="navegacion">',
    (h: string) => h.includes(CLASE_DE_LA_PASTILLA_APAGADA),
  )
  const navAnidado = nodosDe(QUIETA).filter((n) => n.etiqueta === 'nav' && n.ancestros.includes('main'))
  afirmarIgual(navAnidado.length, 0, '  y el `navigation` YA NO está anidado en el `main`: un «saltar al contenido» sí saltea la navegación')
  const mains = nodosDe(QUIETA).filter((n) => n.etiqueta === 'main')
  afirmarIgual(mains.length, 1, 'el `<main>` EXISTE, y hay exactamente UNO — la referencia no lo tiene en 5 de sus 6 URLs')
  controlPositivo(
    'el detector de anidamiento no está ciego: ve un `<nav>` adentro de un `<main>`',
    '<main><nav aria-label="x"></nav></main>',
    (h: string) => nodosDe(h).filter((n) => n.etiqueta === 'nav' && n.ancestros.includes('main')).length === 0,
  )
  afirmarIgual(CANDIDATOS.filter((l) => l.etiqueta === 'section' && l.rol === null).length, 0, 'ninguna `<section>` queda ya sin nombre accesible')
  /** Los `aria-labelledby` que apuntan a un id que NO existe en el documento. */
  const colgados = (html: string): string[] =>
    nodosDe(html)
      .map((n) => atributo(n, 'aria-labelledby'))
      .filter((v): v is string => v !== null)
      .filter((v) => !new RegExp(`id="${v}"`).test(html))
  for (const rama of RAMAS) {
    afirmarIgual(colgados(marcado(rama)), [], `  ${rama}: ningún \`aria-labelledby\` cuelga — los ocho ids existen en el marcado`)
  }
  controlPositivo(
    'el detector de referencias colgadas ve una que no aterriza',
    '<section aria-labelledby="titular-que-no-existe"><h2 id="otro">x</h2></section>',
    (h: string) => colgados(h).length === 0,
  )
  publicar({
    n: 5, gravedad: 'alta', clase: 'defecto',
    dueño: 'la sección Cierre — el `<footer data-pieza="pie">` vive adentro de `<section id="cierre">`',
    que: 'el sitio NO tiene landmark `contentinfo`. Un `<footer>` adentro de contenido seccionante no mapea a `contentinfo` (HTML-AAM), y éste está adentro de una `<section>`: el pie no se alcanza navegando por regiones. ⚠️ SITIO-S12 levantó la tercera pared —el modelo del documento ya VE lo que se emite fuera del `<main>`, y `s10-banco` §2 lo demuestra con el pie afuera contando MÁS landmarks que adentro— y FRENÓ contra una CUARTA que nadie había medido: sacar el pie de la sección le suma 485 px a 1440 y 735 px a 375 al documento FUERA de la tabla de `secciones.ts`, y el progreso de la escena sale de `document.documentElement.scrollHeight`. El progreso que hoy vale 0,750 donde el diferencial llena el cuadro pasaría a 0,720 y 0,691: mueve el anclaje de SITIO-S9 sin tocar una línea del anclaje. Queda ABIERTO, y ahora con el número que dice qué hay que decidir: el `alto` del Cierre en la tabla. Ver §7.46',
  })
  publicar({
    n: 8, gravedad: 'baja', clase: 'defecto',
    dueño: 'el banco compartido — `s10-lectura.ts`, `landmarks()`. ✅ ARREGLADO en la integración de este mismo sprint',
    que: '`landmarks()` filtraba por «tiene rol», no por «tiene rol DE LANDMARK»: contaba los 4 `<figure role="img">` y publicaba 6 landmarks donde hay 2. Los 4 `role="img"` son correctos; el que se equivocaba era el filtro. La integración le puso la lista de los ocho roles de ARIA (`esRolDeLandmark`) con dos controles positivos —un `role="img"` no cuenta, un `role="search"` sí—, y este invariante lo verifica arriba con su propia lista, que sigue siendo independiente de la del banco',
  })
}
