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
  afirmarIgual(LANDMARKS.length, 10, 'el documento tiene DIEZ landmarks, contra los DOS que S10 midió')
  afirmarIgual([...new Set(LANDMARKS.map((l) => l.rol))].sort(), ['main', 'navigation', 'region'], '  y son de tres clases: el `main`, la `navigation` y las ocho `region`')
  afirmarIgual(LANDMARKS.filter((l) => l.rol === 'region').length, 8, '  una `region` por sección, las ocho')
  afirmar(CANDIDATOS[0].etiqueta === 'main', 'el `<main>` EXISTE, y lo pone `src/app/v3/layout.tsx` — no la página', 'la referencia no lo tiene en 5 de sus 6 URLs')
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
    que: 'el sitio NO tiene landmark `contentinfo`. Un `<footer>` adentro de contenido seccionante no mapea a `contentinfo` (HTML-AAM), y éste está adentro de una `<section>`: el pie no se alcanza navegando por regiones. ⚠️ SITIO-S11 lo intentó y FRENÓ, con tres paredes medidas: (1) el `<footer>` no está adentro de la sección, ES la sección —`Pie` envuelve el encabezado, el titular, el CTA, las columnas y la línea legal—, así que sacarlo mueve la sección entera; (2) el alto lo declara `_lib/secciones.ts` (`cierre: 100svh`), que es entrada del anclaje de SITIO-S9 y este sprint tiene prohibido tocar, así que partir el pie deja un hueco oscuro de ≈532 px a 1440 y ≈218 a 375; (3) este instrumento NO PODRÍA CONFIRMARLO: `s10-banco.ts` compone el documento como «todo adentro del `<main>`», así que nada emitido afuera existe para el modelo. Queda ABIERTO, por decisión',
  })
  publicar({
    n: 7, gravedad: 'baja', clase: 'defecto',
    dueño: 'el chrome — `<nav>` se monta adentro del `<main>` del layout',
    que: 'el `navigation` está ANIDADO en el `main`, así que un «saltar al contenido principal» no saltearía la navegación; y no hay `banner`. ⚠️ SITIO-S11 lo intentó y FRENÓ, por la MISMA tercera pared que el 5: `s10-banco.ts` compone el documento como «todo adentro del `<main>`», así que sacar la pastilla afuera BAJARÍA las cifras de este instrumento por ceguera del modelo y no por regresión. Y el punto de montaje es `src/app/v3/page.tsx`, que ningún frente tenía en su lista. Lo que S11 SÍ cerró es la consecuencia práctica: hay enlace de salto y llega al contenido en una pulsación (§3). Queda ABIERTO, por decisión',
  })
  publicar({
    n: 8, gravedad: 'baja', clase: 'defecto',
    dueño: 'el banco compartido — `s10-lectura.ts`, `landmarks()`. ✅ ARREGLADO en la integración de este mismo sprint',
    que: '`landmarks()` filtraba por «tiene rol», no por «tiene rol DE LANDMARK»: contaba los 4 `<figure role="img">` y publicaba 6 landmarks donde hay 2. Los 4 `role="img"` son correctos; el que se equivocaba era el filtro. La integración le puso la lista de los ocho roles de ARIA (`esRolDeLandmark`) con dos controles positivos —un `role="img"` no cuenta, un `role="search"` sí—, y este invariante lo verifica arriba con su propia lista, que sigue siendo independiente de la del banco',
  })
}
