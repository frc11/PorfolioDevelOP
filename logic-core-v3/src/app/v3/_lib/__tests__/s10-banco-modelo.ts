/**
 * §2 DEL INVARIANTE DEL BANCO — el modelo del documento, y los controles que lo
 * habilitan como árbitro del `contentinfo`.
 *
 * Sale de `s10-banco.invariant.ts` en SITIO-S12, cuando el patch de §7.43 lo
 * cruzó las 300 líneas del repo. Es el mismo corte que `s9-instrumentos` ya
 * había hecho con §2 y §4: **por tema, y sin compartir una constante con lo que
 * queda del otro lado.**
 *
 * ── Lo que esta sección tiene que probar, y no alcanzaba con lo de antes ───
 *
 * El modelo viejo componía el documento como *«todo adentro del `<main>`»*, así
 * que un pie emitido afuera **no existía para él**: mover el pie habría BAJADO
 * las cifras —paradas 16 → 11, landmarks 10 → 9— por ceguera y no por
 * regresión. Un instrumento que penaliza el arreglo correcto no puede quedar de
 * árbitro, y por eso el orden de §7.43 es **primero el modelo, después el pie**.
 *
 * El control que manda no es «el derivador ve el `<footer>`»: es que **el mismo
 * documento con el pie AFUERA cuente MÁS landmarks que con el pie adentro**.
 * Los dos fuentes que lo prueban son idénticos salvo dónde cae el `<footer>`,
 * así que la única variable es la que se está midiendo.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from './afirmar'
import {
  PIEZAS_MONTABLES,
  componentesQueMontaElLayout,
  componerDocumento,
  envoltorioDelLayout,
  etiquetasQueElLayoutEmiteFueraDelMain,
  marcadoDelDocumento,
} from './s10-banco'
import { landmarks, paradasDeTabulacion } from './s10-lectura'

/** Corre §2 entera. Recibe el documento de HOY para cruzarlo con los fabricados. */
export function afirmarElModeloDelDocumento(DOC: string): void {
  titulo('2 · El esqueleto se DERIVA del fuente, y el documento tiene UN `<main>`')

  const envoltorio = envoltorioDelLayout()
  afirmar(envoltorio.raiz.includes('data-v3'), 'la raíz derivada lleva `data-v3`', envoltorio.raiz)
  afirmar(!envoltorio.raiz.includes('${'), '  y las interpolaciones de `next/font` no se cuelan al marcado')
  afirmar(DOC.startsWith(envoltorio.raiz), 'el documento del banco arranca por ese envoltorio')

  /**
   * ⚠ **ESTA AFIRMACIÓN SE REESCRIBIÓ CONTRA LA PROPIEDAD EN SITIO-S12 (regla
   * 15).** Decía *«y el `<main>` está en el layout, no en la página»* y lo medía
   * sobre el FUENTE DEL LAYOUT. El corte de §7.43 mudó el `<main>` a `page.tsx`
   * —el pie y la pastilla tienen que ser sus hermanos, y `CompuertaDelHome` vive
   * en la página— así que la afirmación vieja se habría puesto en rojo **por el
   * arreglo que la instrucción mandaba hacer**.
   *
   * Lo que §7.39 celebra no es quién pone el `<main>`: es que el documento TENGA
   * uno, que es la ventaja contra la referencia —no lo tiene en cinco de sus seis
   * URLs—. Eso se mide sobre el documento compuesto y sobrevive a cualquier
   * mudanza; y se afirma que es EXACTAMENTE uno, que es lo que un segundo
   * `<main>` rompería sin que un `includes` se enterara.
   */
  const mains = landmarks(DOC).filter((l) => l.rol === 'main')
  afirmarIgual(
    mains.length,
    1,
    'el DOCUMENTO tiene exactamente UN `<main>` — la ventaja de §7.39, medida sobre lo compuesto y no sobre el layout',
  )
  afirmarIgual(
    landmarks(marcadoDelDocumento('animada')).filter((l) => l.rol === 'main').length,
    1,
    '  y la rama animada también: el esqueleto no depende de la compuerta',
  )
  controlPositivo(
    'el contador de `<main>` no está ciego: ve dos donde hay dos',
    componerDocumento('return <div data-v3=""><main>{children}</main><main></main></div>', 'quieta'),
    (html: string) => landmarks(html).filter((l) => l.rol === 'main').length === 1,
  )
  controlPositivo(
    'el derivador NO inventa un `<main>` cuando el layout no tiene ninguno',
    'export default function X(){ return <div data-v3=""><section/></div> }',
    (fuente: string) => envoltorioDelLayout(fuente).main !== '',
  )

  /**
   * ⚠ **LOS DOS GEMELOS DEL CONTROL DEL `<main>`, Y SON EL PATCH DE §7.43.**
   *
   * El modelo viejo componía el documento como «todo adentro del `<main>`», así
   * que un `<header>` o un `<footer>` emitidos afuera **no existían para él**: el
   * arreglo de los defectos 6 y 15 le habría BAJADO las cifras. Los dos gemelos
   * cierran la misma pregunta que el del `<main>` —el derivador no inventa lo que
   * el layout no tiene— y abajo va la otra mitad, que es la que faltaba: que
   * cuando el layout SÍ los tiene, el modelo los ve.
   */
  controlPositivo(
    'el derivador NO inventa un `<header>` cuando el layout no tiene ninguno',
    'export default function X(){ return <div data-v3=""><main>{children}</main></div> }',
    (fuente: string) => envoltorioDelLayout(fuente).cabecera !== '',
  )
  controlPositivo(
    'el derivador NO inventa un `<footer>` cuando el layout no tiene ninguno',
    'export default function X(){ return <div data-v3=""><main>{children}</main></div> }',
    (fuente: string) => envoltorioDelLayout(fuente).pie !== '',
  )

  const LAYOUT_CON_LAS_DOS = 'return <div data-v3=""><header data-p="c"></header><main>{children}</main><footer data-p="p"></footer></div>'
  const conLasDos = envoltorioDelLayout(LAYOUT_CON_LAS_DOS)
  afirmar(
    conLasDos.cabecera.startsWith('<header') && conLasDos.pie.startsWith('<footer'),
    'y cuando el layout SÍ los tiene, el derivador los ve: la mitad que el modelo viejo no podía',
    `${conLasDos.cabecera} · ${conLasDos.pie}`,
  )

  /**
   * ⚠ **EL CONTROL QUE HABILITA EL FRENTE DEL `contentinfo`, Y ES EL QUE MANDA.**
   *
   * No alcanza con que el derivador VEA el `<footer>`: lo que tiene que ser cierto
   * es que **el documento compuesto con el pie AFUERA del `<main>` cuente MÁS
   * landmarks que el mismo documento con el pie adentro**. Si no lo hiciera, el
   * instrumento seguiría penalizando el arreglo correcto y no se podría usar de
   * árbitro. Los dos fuentes son el mismo salvo dónde cae el `<footer>`: la única
   * variable es la que se está midiendo.
   */
  const PIE_ADENTRO = 'return <div data-v3=""><main><footer></footer>{children}</main></div>'
  const PIE_AFUERA = 'return <div data-v3=""><main>{children}</main><footer></footer></div>'
  const landmarksAdentro = landmarks(componerDocumento(PIE_ADENTRO, 'quieta'))
  const landmarksAfuera = landmarks(componerDocumento(PIE_AFUERA, 'quieta'))
  afirmar(
    landmarksAfuera.length > landmarksAdentro.length,
    'el pie AFUERA del `<main>` cuenta MÁS landmarks que adentro: el modelo ya no penaliza el arreglo',
    `${landmarksAdentro.length} adentro → ${landmarksAfuera.length} afuera`,
  )
  afirmarIgual(
    landmarksAfuera.filter((l) => l.rol === 'contentinfo').length,
    1,
    '  y el que aparece es exactamente el `contentinfo` que falta hoy',
  )
  afirmarIgual(
    landmarksAdentro.filter((l) => l.rol === 'contentinfo').length,
    0,
    '  y adentro del `<main>` NO aparece: el modelo sigue siendo el estricto de `s10-lectura` (§7.43)',
  )
  const paradasAfuera = paradasDeTabulacion(componerDocumento(PIE_AFUERA, 'quieta'))
  afirmarIgual(
    paradasAfuera.length,
    paradasDeTabulacion(DOC).length,
    '  y mover el pie afuera NO le saca una parada de tabulación al documento: lo que cambia es el landmark, no el recorrido',
  )

  /**
   * El registro de piezas montables declara CAPACIDAD; qué monta el layout de
   * verdad lo decide el layout. Esta afirmación cruza las dos: todo lo que el
   * fuente monta tiene que estar declarado, y el día que un frente monte algo
   * nuevo afuera del `<main>` esto se pone en rojo antes que cualquier cifra.
   */
  const MONTADOS = componentesQueMontaElLayout()
  afirmarIgual(
    MONTADOS.filter((n) => !PIEZAS_MONTABLES.has(n)),
    [],
    `los ${MONTADOS.length} componentes que el layout monta están declarados en \`PIEZAS_MONTABLES\``,
  )
  console.log(`  el layout monta: ${MONTADOS.join(' · ')}`)
  console.log(`  etiquetas literales fuera del \`<main>\`: ${JSON.stringify(etiquetasQueElLayoutEmiteFueraDelMain())}`)
  for (const [nombre, pieza] of PIEZAS_MONTABLES) {
    console.log(`  · ${nombre} — ${pieza.emite === null ? 'no emite marcado' : 'se renderiza'}: ${pieza.porQue}`)
  }
  controlPositivo(
    'el modelo TIRA con un componente que no sabe montar, en vez de saltearlo en silencio',
    'return <div data-v3=""><Inventado /><main>{children}</main></div>',
    (fuente: string) => componerDocumento(fuente, 'quieta').length > 0,
  )
  controlPositivo(
    'y TIRA cuando el layout no declara ninguna raíz `data-v3`',
    'return <div><main>{children}</main></div>',
    (fuente: string) => componerDocumento(fuente, 'quieta').length > 0,
  )
}
