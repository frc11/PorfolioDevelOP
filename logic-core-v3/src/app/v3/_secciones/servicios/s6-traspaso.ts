/**
 * §17 Y §18 DEL INVARIANTE DE SERVICIOS — lo que sólo existe DURANTE el cambio.
 *
 * ⚠ **Vive en su propio archivo por la regla de las 300 líneas**, y el corte es
 * por TEMA, como el de `s6-tipografia.ts`: las dos secciones afirman sobre el
 * TRASPASO —lo que pasa entre un estado y el siguiente— y ninguna de las dos se
 * puede ver en una meseta. Todas se rompieron alguna vez mientras el sitio se
 * veía bien quieto, y por eso están juntas.
 *
 *   §17  lo que el traspaso rompió: el origen del giro, el ancla de cada
 *        porción, el disco corrido, la medición del rodillo, el color del botón
 *        y la curva del disparo.
 *   §18  el estado que cierra la secuencia —el que no tiene ranura—, el instante
 *        exacto en que cambia el color y la caja del botón, que dejó de moverse.
 */

import { afirmar, afirmarIgual, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { SERVICIOS } from '../_contrato/acento'
import { leer } from '../_invariantes/soporte'
import { FRACCION_DEL_CRUCE_DE_COPIAS, servicioDelCta } from './CtaQueRota'
import { CANTIDAD_DE_ESTADOS, ranuraVisible } from './RodilloDeEstados'
import { cuenta } from './deteccion'
import { CLASE_DEL_BOTON_ROTATIVO, CURVA_DEL_DISPARO } from './geometria'
import { giroDe, prominenciaDe } from './GraficoDeTorta'
import { cierreDeLaPintura, fronterasDeEstado, rangoDePintura } from './TiraDeServicios'

/**
 * §17 y §18 enteras. Recibe el marcado y los fuentes ya leídos: no vuelve a
 * montar React ni a tocar el disco.
 */
export function afirmarElTraspaso(
  animado: string,
  torta: string,
  fuenteDelRodillo: string,
  fuenteDelCta: string,
  fuenteDeLaTira: string,
  fuenteDeLaTorta: string,
): void {
  /** De dónde saca el CTA el servicio con el que se tiñe. */
  const EXPRESION_DEL_ACENTO = /\[ATRIBUTO_DE_SERVICIO\]:\s*SERVICIOS\[([^\]]+)\]/

  /** Una porción que abre con su ancla: un círculo sin pintar antes que nada. */
  const ANCLA_DE_LA_PORCION = /<g data-servicio="[^"]*"[^>]*><circle [^>]*fill="none"[^>]*>/g

  /** La pieza que lleva el giro, y las etiquetas donde motion deriva el origen. */
  const PIEZA_DEL_GIRO = 'giro-de-la-torta'
  const ETIQUETAS_DE_SVG = ['svg', 'g', 'circle', 'path', 'mask', 'rect', 'line']

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('17 · Lo que el traspaso rompió y no se ve en una meseta')

  /**
   * ⚠️ **LAS CINCO DE ESTA SECCIÓN SE ROMPIERON MIENTRAS EL SITIO SE VEÍA BIEN
   * QUIETO.** Todas pasaron una verificación anterior que midió los estados de
   * reposo y las dio por buenas. Se afirman acá porque ninguna deja rastro en una
   * parada: sólo existen a lo largo del cambio.
   */

  /** Con qué etiqueta se publica la pieza que gira. Cadena vacía si no está. */
  function etiquetaDelGiro(html: string): string {
    const i = html.indexOf(`data-pieza="${PIEZA_DEL_GIRO}"`)
    if (i < 0) return ''
    const abre = html.lastIndexOf('<', i)
    return html.slice(abre + 1, i).trim()
  }

  /** ⚠️ **EL GIRO NO PUEDE COLGAR DE UN ELEMENTO SVG, Y ES UNA REGLA DE MOTION.**
   *  Motion le pone `transform-box: fill-box` a todo SVG y le calcula el origen
   *  desde su CAJA DE CONTENIDO. La caja de un `<g>` se la fijan sus hijos YA
   *  transformados, y acá los hijos son las porciones, que en el traspaso se
   *  despegan y crecen: medido, la caja pasaba de 241,68 a 259,85 y arrancaba
   *  8,145 más arriba, así que **el origen del giro se movía mientras el giro
   *  corría** y el centro del disco orbitaba 38,34 px. La caja de un elemento de
   *  HTML no depende de su contenido, así que ahí el 50 %/50 % es su centro pase
   *  lo que pase adentro. Lo que se afirma es la propiedad y no el elemento: por
   *  eso va también la lista de las etiquetas donde la trampa existe. */
  afirmarIgual(etiquetaDelGiro(animado), 'div', 'la pieza que gira es de HTML: su caja no la fija su contenido, así que el origen del giro no se mueve')
  afirmar(!ETIQUETAS_DE_SVG.includes(etiquetaDelGiro(animado)), '  y no es ninguna de las de SVG, donde motion deriva el origen de la caja de contenido')
  controlPositivo('el detector vería el giro puesto sobre un `<g>`, que es de donde se lo sacó', `<g data-pieza="${PIEZA_DEL_GIRO}"></g>`, (h: string) => etiquetaDelGiro(h) === 'div')

  /** ⚠️ **Y CADA PORCIÓN LLEVA SU ANCLA, por la misma razón un piso más abajo.**
   *  Sin ella el `scale` de la porción vigente crece desde el centro de SU caja de
   *  contenido —que no es el centro de la torta— y el vértice se despega del
   *  medio. Es un círculo sin pintar del tamaño del `viewBox`: no se ve, y sacarlo
   *  no rompe nada que se note quieto. */
  afirmarIgual(cuenta(torta, ANCLA_DE_LA_PORCION), SERVICIOS.length, `las ${SERVICIOS.length} porciones abren con su ancla: el crecimiento sale del centro de la torta y no del de cada una`)
  controlPositivo('el detector vería una porción que abre sin ancla', '<g data-servicio="web"><mask id="m"></mask></g>', (h: string) => cuenta(h, ANCLA_DE_LA_PORCION) === 1)

  /** ⚠️ **Y NINGUNA PORCIÓN SE DIBUJA DOS VECES CORRIDA.** Ésa era la «sombra»:
   *  un canto corrido que la máscara del relleno no cubría, así que las porciones
   *  sin llenar dejaban un disco gris atrás para siempre. No estaba mal calibrado
   *  — un disco corrido no puede volver. */
  afirmarIgual(cuenta(torta, /translate\(/g), 0, 'ninguna pieza de la torta se corre: no hay un segundo disco atrás')
  controlPositivo('el detector vería el canto que se sacó', '<circle transform="translate(0 13)"></circle>', (h: string) => cuenta(h, /translate\(/g) === 0)

  /** ⚠️ **EL RODILLO SE MIDE CON EL RECT, NO CON `offsetHeight`.** Un entero por
   *  ranura acumula ~0,14 px de error, y con el bloque apoyado abajo eso sale por
   *  arriba: el subrayado del estado ANTERIOR asomaba 0,11 px en `web` y 0,25 px
   *  en `software`. El margen que queda es de 0,05 px por construcción —el hueco
   *  de 48 px es casi exactamente un renglón de `titulo-l`—, así que el
   *  instrumento no puede redondear. */
  afirmarIgual(cuenta(fuenteDelRodillo, /\.offsetHeight\b/g), 0, 'el rodillo no mide con `offsetHeight`: devuelve enteros y el error acumulado asoma el subrayado anterior')
  afirmar(cuenta(fuenteDelRodillo, /getBoundingClientRect\(\)\.height/g) > 0, '  mide con el alto del rect, que es fraccionario')
  controlPositivo('el detector vería la medición vieja', 'acumulado += ranura.offsetHeight', (f: string) => cuenta(f, /\.offsetHeight\b/g) === 0)

  /** ⚠️ **EL ACENTO DEL CTA CUELGA DE ADONDE VA, NO DE LO QUE DICE.** Colgaba de
   *  `mostrado`, que recién se mueve cuando el intercambio termina: medido, el
   *  color cambiaba a los 1.600 ms de un traspaso que arranca a los 200. Lo que se
   *  afirma no es qué variable se usa, sino que la que tiñe esté DEFINIDA a partir
   *  de `destino`, el mismo estado que enciende el relevo. */
  const quienTine = EXPRESION_DEL_ACENTO.exec(fuenteDelCta)?.[1] ?? ''
  afirmar(quienTine !== '' && quienTine !== 'mostrado' && quienTine !== 'destino', `el acento del CTA sale de \`${quienTine}\`: ni de lo que el botón dice ni de adónde va`)
  afirmar(/setTimeout\(\(\) => set[A-Za-z]+\(destino\), MS_DEL_CRUCE_DE_COPIAS\)/.test(fuenteDelCta), '  lo escribe un reloj puesto en el cruce de las dos copias, que es cuando el cartel cambia')
  controlPositivo('el detector vería el acento colgado de lo que queda después', '{...{ [ATRIBUTO_DE_SERVICIO]: SERVICIOS[mostrado].id }}', (f: string) => { const q = EXPRESION_DEL_ACENTO.exec(f)?.[1] ?? ''; return q !== 'mostrado' && q !== 'destino' })

  /** ⚠️ **Y LA CURVA DEL DISPARO NO ARRANCA NI FRENA DE GOLPE.** Se afirma la
   *  PROPIEDAD y no los cuatro números, para que se la pueda seguir afinando: una
   *  cúbica sale con pendiente `y1 / x1` y llega con `(1 − y2) / (1 − x2)`, así
   *  que `y1 = 0` y `y2 = 1` es «sale del reposo sin saltar y se posa sin clavar».
   *  La curva anterior era la de las revelaciones de sección, que sale con
   *  pendiente 1,84 — sobre un giro eso se lee como un tirón. */
  afirmarIgual(CURVA_DEL_DISPARO[1], 0, 'la curva del disparo sale del reposo con pendiente 0: no salta')
  afirmar(CURVA_DEL_DISPARO[0] > 0, '  con su punto de control adentro del tramo, que es lo que hace que la pendiente exista')
  afirmarIgual(CURVA_DEL_DISPARO[3], 1, '  y llega con pendiente 0: no clava el final')
  afirmar(CURVA_DEL_DISPARO[2] < 1, '  ídem del otro lado')
  controlPositivo('el detector vería la curva de las revelaciones, que sale con pendiente 1,84', [0.25, 0.46, 0.45, 0.94], (c: readonly number[]) => c[1] === 0 && c[3] === 1)


  // ═══════════════════════════════════════════════════════════════════════════
  titulo('18 · Un estado es una ranura, el instante del color y la caja del botón')

  /**
   * ⚠️ **UN ESTADO ES UNA RANURA, Y AL REVÉS. NO HAY ESTADOS SIN RÓTULO.**
   *
   * Esta sección existe porque la regla se rompió una vez y el síntoma no fue un
   * error. Para devolver la última porción de la torta a su tamaño se agregó una
   * frontera de más, «sin rótulo detrás», con tres clamps que absorbían la
   * posición sobrante. En ese estado `ranuraVisible` no enciende NINGUNA ranura
   * —`piso` y `techo` caen los dos fuera del rango— y **el bloque del título
   * entero desaparecía** al final de la sección: rótulo, número, título y
   * subrayado. Sin excepción, sin aviso, y sin dejar rastro en ninguna meseta
   * anterior, que es por lo que la medición del sprint no lo vio.
   *
   * Las dos afirmaciones de abajo lo cierran por los dos lados: la estructural
   * —las fronteras más una son exactamente las ranuras— y la de recorrido, que
   * barre la secuencia entera y exige que haya SIEMPRE un bloque pintado.
   */
  const MEDIDA_DE_PRUEBA = { recorrido: 1000, alto: 500, topes: [100, 400, 700] }
  const FRONTERAS_DE_PRUEBA = fronterasDeEstado(MEDIDA_DE_PRUEBA)
  afirmarIgual(FRONTERAS_DE_PRUEBA.length + 1, CANTIDAD_DE_ESTADOS, `${FRONTERAS_DE_PRUEBA.length} fronteras y ${CANTIDAD_DE_ESTADOS} ranuras: cada estado al que la secuencia puede llegar tiene su rótulo`)
  afirmarIgual(FRONTERAS_DE_PRUEBA.length, SERVICIOS.length, '  o sea una frontera por servicio y ni una más')

  /** Cuántas ranuras se pintan en una posición. Cero es el defecto que cierra §18. */
  const pintadasEn = (p: number): number =>
    Array.from({ length: CANTIDAD_DE_ESTADOS }, (_, i) => i).filter((i) => ranuraVisible(i, p)).length

  const PASOS_DEL_BARRIDO = 400
  const RECORRIDO = Array.from({ length: PASOS_DEL_BARRIDO + 1 }, (_, k) => ((CANTIDAD_DE_ESTADOS - 1) * k) / PASOS_DEL_BARRIDO)
  const apagadas = RECORRIDO.filter((p) => pintadasEn(p) === 0)
  afirmarIgual(apagadas.length, 0, `en las ${RECORRIDO.length} posiciones del recorrido SIEMPRE hay un bloque de título pintado — apagadas: ${apagadas.slice(0, 5).join(' ')}`)
  afirmarIgual(
    Array.from({ length: CANTIDAD_DE_ESTADOS }, (_, i) => pintadasEn(i)).join(' '),
    Array.from({ length: CANTIDAD_DE_ESTADOS }, () => 1).join(' '),
    '  y en cada meseta hay exactamente UNO: las dos del relevo son la misma cuando la secuencia está posada',
  )
  afirmar(Math.max(...RECORRIDO.map(pintadasEn)) === 2, '  con dos en el traspaso y nunca más de dos: la que sale y la que entra')
  controlPositivo(
    'el barrido vería el estado sin ranura que apagaba el bloque entero',
    CANTIDAD_DE_ESTADOS,
    (p: number) => pintadasEn(p) > 0,
  )

  /**
   * ⚠️ **Y LA VUELTA DE LA TORTA CUELGA DEL PINTADO, NO DE UN ESTADO.**
   *
   * Es el mismo punto que el pedido nombró siempre —donde la última porción
   * termina de pintarse— y sale del MISMO `rangoDePintura` que gobierna su
   * párrafo, así que los dos no se pueden separar. Lo que se afirma es la
   * costura: que ese punto exista con nombre propio, que valga el final de la
   * última pintura, y que la torta lo consuma mientras las fronteras no lo tocan.
   */
  afirmarIgual(
    cierreDeLaPintura(MEDIDA_DE_PRUEBA),
    rangoDePintura(MEDIDA_DE_PRUEBA, SERVICIOS.length - 1)[1],
    'la vuelta de la torta arranca donde termina de pintarse la última porción',
  )
  afirmar(!FRONTERAS_DE_PRUEBA.includes(cierreDeLaPintura(MEDIDA_DE_PRUEBA)), '  y ese punto NO es una frontera: el rodillo no se entera de que la torta vuelve')
  afirmar(cuenta(fuenteDeLaTorta, /cierreDeLaPintura\(/g) > 0, '  la torta lo consume por nombre, no vuelve a derivar el rango')
  // ⚠️ Y por qué el factor se le aplica a las TRES porciones y no sólo a la
  // última: porque en el último estado las otras dos ya volvieron solas, así que
  // multiplicarlas no las toca. Sin esto el código tendría que elegir una a mano.
  afirmarIgual(prominenciaDe(CANTIDAD_DE_ESTADOS - 1, SERVICIOS.length - 1), 1, '  en el último estado la última porción está crecida: sin la vuelta por pintado se iría así de la sección')
  afirmarIgual(
    SERVICIOS.slice(0, -1).map((_, i) => prominenciaDe(CANTIDAD_DE_ESTADOS - 1, i)).join(' '),
    SERVICIOS.slice(0, -1).map(() => 0).join(' '),
    '  y las otras ya volvieron solas, que es por lo que el factor se les aplica a las tres sin elegir ninguna a mano',
  )
  afirmar(cuenta(fuenteDeLaTira, /cierreDeLaPintura\(medida\), \]|, cierreDeLaSecuencia/g) === 0, '  y `fronterasDeEstado` no lo mete en su lista')
  controlPositivo('el detector vería la lista de fronteras con el cierre adentro otra vez', [...FRONTERAS_DE_PRUEBA, cierreDeLaPintura(MEDIDA_DE_PRUEBA)], (f: readonly number[]) => f.length + 1 === CANTIDAD_DE_ESTADOS)

  afirmarIgual(giroDe(CANTIDAD_DE_ESTADOS - 1), -(SERVICIOS.length - 1) * (360 / SERVICIOS.length), 'en el último estado la torta giró exactamente una porción por cambio, ni una más')
  afirmarIgual(servicioDelCta(CANTIDAD_DE_ESTADOS - 1), SERVICIOS.length - 1, '  y el botón dice el último servicio, sin necesitar que nadie lo acote')
  afirmarIgual(servicioDelCta(0), null, '  y sigue sin existir antes del 01: no hay servicio que querer')

  /**
   * ⚠️ **EL INSTANTE DEL COLOR NO ES UN NÚMERO A MANO: SALE DE LA CURVA.**
   *
   * Las dos copias del rótulo corren la misma duración y la misma curva en
   * sentidos opuestos, así que el cartel cambia cuando la curva vale 0,5 — y esta
   * curva arranca plana, así que ESO NO ES la mitad del tiempo. Acá se vuelve a
   * resolver la cúbica leyendo el token del sistema, no la constante: si alguien
   * mueve `--ease-salida`, esto se pone en rojo en vez de dejar el color corrido.
   */
  function fraccionDeTiempoEn(puntos: readonly number[], avance: number): number {
    const [x1, y1, x2, y2] = puntos
    const enX = (t: number): number => 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t * t * x2 + t ** 3
    const enY = (t: number): number => 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t * t * y2 + t ** 3
    let bajo = 0
    let alto = 1
    for (let i = 0; i < 60; i += 1) {
      const medio = (bajo + alto) / 2
      if (enY(medio) < avance) bajo = medio
      else alto = medio
    }
    return enX((bajo + alto) / 2)
  }

  const CURVA_DE_SALIDA = /--ease-salida:\s*cubic-bezier\(([^)]+)\)/
    .exec(leer('src/app/theme-develop.css'))?.[1]
    .split(',')
    .map(Number) ?? []
  afirmarIgual(CURVA_DE_SALIDA.length, 4, `la curva del intercambio se lee del tema y es una cúbica de cuatro puntos: ${CURVA_DE_SALIDA.join(' ')}`)
  const CRUCE_DERIVADO = fraccionDeTiempoEn(CURVA_DE_SALIDA, 0.5)
  afirmar(
    Math.abs(CRUCE_DERIVADO - FRACCION_DEL_CRUCE_DE_COPIAS) < 0.001,
    `  y el cruce de las dos copias cae en ${(CRUCE_DERIVADO * 100).toFixed(2)} % del intercambio, que es lo que el CTA tiene escrito`,
  )
  afirmar(CRUCE_DERIVADO < 0.5, '  y NO es la mitad del tiempo: la curva arranca plana, así que el cruce llega antes')
  controlPositivo('el resolvedor vería una curva lineal, donde el cruce SÍ cae en la mitad', [0, 0, 1, 1], (c: readonly number[]) => Math.abs(fraccionDeTiempoEn(c, 0.5) - FRACCION_DEL_CRUCE_DE_COPIAS) < 0.001)

  /**
   * ⚠️ **Y LA CAJA DEL BOTÓN NO SE MUEVE, con los tokens del propio botón.**
   *
   * Su ventana crece al relevar. Son 4 px, y el botón cierra una columna donde la
   * torta ocupa el sobrante y se centra en él: medido, el disco bajaba 2,0 px a
   * los 745 ms del traspaso. Se clava la ventana en su alto CRECIDO y se le
   * devuelve al subrayado la diferencia entre los dos altos, escrita como esa
   * resta. Lo que se afirma es que los dos tokens estén los dos: con uno solo, o
   * la caja se mueve o el subrayado queda 4 px abajo del que tiene el Hero.
   */
  afirmar(CLASE_DEL_BOTON_ROTATIVO.includes('min-h-[var(--cta-ventana-hover)]'), 'la ventana del botón queda clavada en su alto crecido: la caja deja de moverse al relevar')
  afirmar(
    CLASE_DEL_BOTON_ROTATIVO.includes('calc(var(--cta-ventana-reposo)-var(--cta-ventana-hover))'),
    '  y el subrayado recupera la diferencia entre los dos altos, escrita como la resta y no como el número',
  )
  afirmar(
    /--cta-ventana-hover:\s*calc\(.*\+\s*var\(--spacing-1\)\)/.test(leer('src/app/v3/_estilos/cta.css')),
    '  CONTROL: los dos altos difieren en UNA unidad del sistema, que es lo que esa resta vale',
  )
  controlPositivo('el detector vería la clase vieja, sin reserva de alto', 'col-start-1 row-start-1 w-full [&_[data-parte=ventana]]:min-w-full', (c: string) => c.includes('min-h-[var(--cta-ventana-hover)]'))

}
