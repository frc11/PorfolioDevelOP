/**
 * EL CONTENIDO DE «POR QUÉ DEVELOP» — como DATO, con sus marcadores.
 *
 * ── Qué se puede afirmar y qué no ─────────────────────────────────────────
 *
 * develOP puede decir sin inventar nada que construye su propio software, que
 * entrega un panel y que sus clientes existen y tienen nombre: **Esquina · El
 * Garage · Banú**. Eso está escrito derecho, sin marcador, porque
 * no es relleno.
 *
 * Todo lo demás —cuántos son, cuánto más rápido, qué dijo alguien— es una
 * comparación cuantificada o un testimonio, y ninguna de las dos se inventa.
 * Van como `[CIFRA]`, `[MÉTRICA]`, `[TESTIMONIO]` y `[NOMBRE]`, con la LONGITUD
 * y la ESTRUCTURA RETÓRICA de lo que va a ir ahí, para que se pueda juzgar la
 * composición. **Es el pedido a Franco, escrito en la pantalla.**
 *
 * ── Ningún número que se pueda leer como un hecho ─────────────────────────
 *
 * En todo este archivo no hay un solo dígito en el texto visible. El único
 * número que la sección muestra es el `07` del rótulo, que lo pone
 * `_contrato/Seccion.tsx` desde `NUMERO_DE_CONTRATO` y está en la lista blanca
 * de `_contrato/escaneo.ts` como estructura del recorrido.
 *
 * ── La geometría declarada, y por qué está acá y no en el JSX ─────────────
 *
 * `ALTO_MINIMO_DEL_BLOQUE` no es una decisión estética: sale de la aritmética
 * del ancla de P5, que mide `alto − 0,4·viewport` y es la única del sistema que
 * puede dar rango negativo. Vive acá, como dato, por la misma razón que la
 * altura de un panel vive en `_lib/secciones.ts`: para que el instrumento lea
 * el MISMO valor que aplica la pantalla, y no una copia suya.
 */

import type { Marcador } from '../_contrato/marcadores'
import type { EntradaDePedido } from '../_contrato/pedido'

/** El nombre visible de la sección. Es contenido, no un id. */
export const NOMBRE_DE_SECCION = 'Por qué develOP'

/** El titular. Se parte en líneas visuales y entra línea por línea (P1). */
export const TITULAR =
  'Cualquiera te entrega una web. Nosotros entregamos el sistema que la opera y el panel desde donde la mirás.'

/** La bajada. No entra por ningún canal: se lee desde el primer cuadro. */
export const ENTRADA =
  'El diferencial no está en el diseño. Está en que el software lo escribimos nosotros, ' +
  'el panel queda en tus manos, y hay alguien atendiendo el día que algo se rompe.'

export interface Diferencial {
  /** Clave estable para el `key` de React. No se muestra. */
  readonly clave: string
  readonly titulo: string
  readonly cuerpo: string
}

/**
 * Los cuatro diferenciales contra una agencia cualquiera.
 *
 * Los dos primeros son afirmaciones que develOP puede sostener hoy. El tercero
 * nombra clientes reales y deja el total como `[CIFRA]`. El cuarto es la
 * comparación cuantificada, que va entera como `[MÉTRICA]`.
 */
export const DIFERENCIALES: readonly Diferencial[] = [
  {
    clave: 'software-propio',
    titulo: 'Software propio',
    cuerpo:
      'El código que corre tu operación lo escribimos y lo mantenemos nosotros. ' +
      'No hay un tercero en el medio el día que algo hay que cambiar.',
  },
  {
    clave: 'panel',
    titulo: 'Un panel, no un informe',
    cuerpo:
      'Lo que entregamos no termina en un documento que se lee una vez: es un panel ' +
      'al que entrás vos, con tu operación al día.',
  },
  {
    clave: 'clientes',
    titulo: 'Clientes con nombre',
    cuerpo:
      'Esquina, El Garage y Banú trabajan así hoy, entre [CIFRA] negocios ' +
      'que ya operan con lo que construimos.',
  },
  {
    clave: 'entrega',
    titulo: 'Entrega medida',
    cuerpo:
      '[MÉTRICA] más rápido que el camino tradicional, medido sobre entregas reales. ' +
      'Hasta que la medición exista, la cifra no se escribe.',
  },
]

export interface Testimonio {
  /** El marcador del vocabulario. Es lo que se lee, en grande. */
  readonly marcador: Marcador
  /** La forma y la longitud de lo que va a ir ahí. Es el pedido. */
  readonly forma: string
  /** La firma entera como marcador: la persona Y de qué empresa es. */
  readonly firma: string
}

/**
 * EL TESTIMONIO QUE NO ESTÁ.
 *
 * develOP ya tiene deuda registrada por testimonios fabricados en sus cuatro
 * landings. Acá el bloque existe —la composición lo pide— y su contenido es el
 * pedido: qué forma tiene que tener, cuánto tiene que durar y de quién.
 *
 * ⚠️ **LA FIRMA TRAÍA UNA EMPRESA ESCRITA, Y ERAN DOS DEFECTOS EN UNA LÍNEA
 * (corregido en V3-D).** Decía `[NOMBRE] · Matsu Automotores`:
 *
 *   · **Matsu Automotores no es un cliente.** Ese trabajo no se hizo. Un
 *     nombre propio sin marcador se lee como un hecho, y el escáner no lo ve
 *     porque no tiene dígitos.
 *   · **Y aunque lo fuera, la empresa no estaba decidida.** Servicios dice, a
 *     dos secciones de acá, *"con el cliente que corresponda: Esquina, El
 *     Garage o Banú"*. Una sección declaraba el caso abierto y la otra ya lo
 *     había cerrado.
 *
 * Ahora la firma es **el marcador solo**. De quién es el testimonio es parte de
 * lo que falta, no del molde — y lo dice el PEDIDO, que pide *nombre · cargo ·
 * empresa*. Elegir el cliente es una decisión comercial, no una de este archivo.
 */
export const TESTIMONIO: Testimonio = {
  marcador: '[TESTIMONIO]',
  forma:
    'Dos o tres oraciones de quien abre el panel todos los días: qué hacía antes, ' +
    'qué hace ahora, y qué dejó de hacer. Sin cifras adentro — la cifra va aparte, como [MÉTRICA].',
  firma: '[NOMBRE]',
}

/**
 * CUÁNTAS PIEZAS TIENE EL CONJUNTO DE P5.
 *
 * Los cuatro diferenciales más el testimonio. La cantidad define el escalonado
 * real del cronograma; con P5 el escalonado medido es 0, así que las cinco
 * arrancan juntas y la duración aplicada coincide con la declarada. Sale de la
 * longitud de la lista y no de un número escrito: agregar un diferencial no
 * obliga a acordarse de nada.
 */
export const PIEZAS_DE_P5 = DIFERENCIALES.length + 1

/** El índice del testimonio dentro del conjunto: va último. */
export const INDICE_DEL_TESTIMONIO = DIFERENCIALES.length

/**
 * EL ALTO MÍNIMO DEL BLOQUE MEDIDO DE P5, EN `svh`. **[derivado], no elegido.**
 *
 * El ancla de P5 mide `alto − 0,4·viewport`: con un elemento más bajo que el
 * 40 % del viewport el rango sale NEGATIVO, `rangoDeScroll` lo acota a un píxel
 * y el patrón se lee como un salto. O sea que el piso duro son 40 unidades de
 * `svh` y ahí el rango es exactamente cero.
 *
 * El invariante afirma las dos mitades: que no degenera con este alto, y que sí
 * degenera con uno por debajo del piso.
 *
 * ── ⚠️ B1 · BAJA DE 55 A 50, Y ES UN DEFECTO ARREGLADO A MEDIAS ────────────
 *
 * **Con 55 la sección se pasaba de su propio alto declarado.** Medido a 1440×900
 * con la página recién cargada: `por-que-develop` medía **943,52 px contra los
 * 900 de una pantalla**, o sea 43,52 px de más, y ésa era la causa de que el
 * titular quedara con píxeles bajo AA a esa altura de scroll — la sección
 * llenaba el cuadro en la pantalla 11,888 en vez de la 12, que es donde el ancla
 * declarada del diferencial (0,8525) la espera.
 *
 * **50 es el MÍNIMO recorte, y está medido que más no compra nada.** El desvío
 * baja de 43,52 px a **23,70**, y las dos mitades de por qué se quedó ahí:
 *
 *   · con 55 el piso valía 495 px a 900 y **ataba**; con 50 vale 450 y el bloque
 *     renderiza **475,19 px de contenido propio**, así que el piso dejó de ser
 *     lo que gobierna. Los 19,82 px que se ganaron son exactamente 495 − 475,19.
 *   · **con 45 la sección mide lo mismo: 923,70 px.** Probado en el navegador,
 *     no modelado. Bajar de 50 sólo acorta el recorrido de P5 —de 10 unidades a
 *     5— a cambio de cero píxeles.
 *
 * La cuenta de la sección a 1440, entera: 48 px de relleno + 48 de tres costuras
 * + 11 del rótulo + 276,13 del titular + 65,39 de la bajada + **475,19 del
 * bloque** = 923,70. **Los 23,70 que sobran son el contenido del propio bloque**
 * —los cuatro diferenciales y el testimonio— y eso ya no se arregla con un
 * número: es composición, y queda reportado sin arreglar.
 *
 * A 1920 no cambia nada: la sección medía y sigue midiendo 1080 px exactos.
 */
export const ALTO_MINIMO_DEL_BLOQUE_SVH = 50

/**
 * El mismo número, con su unidad, listo para `style`.
 *
 * Va en estilo inline y no en una clase por la razón que `Panel` ya dejó
 * escrita para su `min-height`: una clase armada como `min-h-[${n}svh]` no la
 * ve el escáner de Tailwind y su regla no se emitiría nunca — quedaría el
 * atributo en el HTML, sin error en consola, y el bloque sin alto. **Es la
 * única excepción a "cero literales con unidad" de esta carpeta, y está
 * declarada acá.**
 */
export const ALTO_MINIMO_DEL_BLOQUE = `${ALTO_MINIMO_DEL_BLOQUE_SVH}svh`

/**
 * EL PEDIDO — lo que falta en esta sección, con su formato.
 *
 * Se agrega en SITIO-S7: el lane que escribió la sección declaraba lo
 * provisional en prosa y con marcadores visibles, pero **el pedido no era un
 * dato**, así que no se podía producir un documento con él ni comprobar que no
 * se quedara viejo. `s7-pedido` cruza esta tabla contra el texto renderizado en
 * los dos sentidos: un marcador en pantalla sin entrada acá falla, y una
 * entrada que pide algo que ya no se ve, también.
 *
 * El archivo donde se edita NO se escribe acá: sale del registro.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'DIFERENCIALES[2].cuerpo',
    clase: 'cifra',
    marcador: '[CIFRA]',
    quienLoTrae: 'franco',
    que: 'Cuántos negocios trabajan así hoy. Contados, no estimados.',
    formato: 'Un número entero, sin símbolo.',
  },
  {
    ruta: 'DIFERENCIALES[3].cuerpo',
    clase: 'metrica',
    marcador: '[MÉTRICA]',
    quienLoTrae: 'franco',
    que: 'Cuánto más rápido es el camino de develOP, medido sobre entregas reales.',
    formato: 'Un número con su unidad. Ej.: `3 semanas contra 9`.',
  },
  {
    ruta: 'TESTIMONIO.marcador',
    clase: 'testimonio',
    marcador: '[TESTIMONIO]',
    quienLoTrae: 'franco',
    que:
      'Lo que dijo un cliente, con sus palabras: qué hace ahora y qué dejó de hacer. ' +
      'Sin cifras adentro — la cifra va aparte.',
    formato: 'Dos o tres renglones, ~220 caracteres. Texto plano, entre comillas.',
  },
  {
    ruta: 'TESTIMONIO.firma',
    clase: 'testimonio',
    marcador: '[NOMBRE]',
    quienLoTrae: 'franco',
    que: 'Quién lo dijo: nombre y cargo, con el permiso pedido.',
    formato: 'Nombre · cargo · empresa. Una línea.',
  },
]
