/**
 * EL ENCHUFE DE LA ESCENA — el punto de montaje y su contrato.
 *
 * ⚠ **ESTE ARCHIVO NO LO ESCRIBE EL SUBAGENTE.** Lo escribió el agente
 * principal en la Fase 0 de SITIO-S8, ANTES de despachar, y es la razón por la
 * que cuatro frentes pueden trabajar a la vez sin pisarse: cada uno escribe lo
 * que va ADENTRO de su enchufe, nunca el enchufe.
 *
 * ── Qué es el enchufe, en tres piezas ──────────────────────────────────────
 *
 *   1. `_componentes/EscenarioCompuerta.tsx` — la compuerta de 1025, que ya
 *      existía desde S1 y **no se reescribe**. Lo único que este sprint le
 *      cambió es a qué módulo le apunta el `import()`.
 *   2. `_lib/escena/EscenaDelHome.tsx` — el módulo perezoso. Lo escribe el
 *      subagente de la escena. Tiene que existir con ese nombre exacto y con
 *      **export por defecto**, porque es lo que la compuerta pide.
 *   3. Este archivo — el contrato: qué le exige el punto de montaje al módulo,
 *      escrito como tipo y como dato, para que se pueda afirmar sin montar
 *      React.
 *
 * ── Las cinco condiciones del montaje, y por qué cada una ──────────────────
 *
 * **1 · Entra por la compuerta que ya existe.** No se construye otra. El umbral
 * de 1025 vive UNA vez en `_lib/compuerta.ts` y lo comparten el escenario, el
 * cursor y la coreografía del home; una compuerta nueva sería un cuarto lugar
 * donde el número puede quedar desincronizado.
 *
 * **2 · Está fuera del flujo del documento.** `CLASES_FUERA_DE_FLUJO` —`fixed
 * inset-0 z-0 pointer-events-none`— es lo que hace que cruzar el umbral en
 * cualquiera de los dos sentidos no pueda mover un panel: montar o desmontar
 * algo que no ocupa espacio no corre nada. Es también lo que lo deja ABAJO del
 * flujo (`z-0` contra el `z-10` de `<main>`) y ARRIBA del piso de papel del
 * envoltorio.
 *
 * **3 · Lleva la marca, y la lleva como valor de atributo.** Ver
 * `_lib/marcaEscena.ts`: es la única forma de preguntarle a la salida del build
 * si el código de la escena está o no está en la carga inicial de `/v3`, sin
 * pasar por cómo se llamó el chunk.
 *
 * **4 · `three` sólo se alcanza desde acá.** La condición dura del sprint: la
 * escena pesa cientos de KiB y `three` **no viaja hoy** en la carga inicial de
 * `/v3` —medido: cero de las huellas de three en los 28 archivos que pide—.
 * Tiene que seguir sin viajar. En la práctica eso significa que ningún módulo
 * que la carga inicial alcance puede importar un valor de `three`,
 * `@react-three/fiber` ni `@react-three/drei`: ni la compuerta, ni el contrato,
 * ni la marca. **Este archivo, en particular, no importa un solo valor**: son
 * tipos y constantes de cadena, y el `import type` se borra al compilar.
 *
 * **5 · No cambia un valor de la escena.** Mudar no es reescribir. Los módulos
 * que hoy viven en `probe-escena/_components/` se mueven y se les ajustan los
 * imports; ni una constante, ni un keyframe, ni un canal de luz cambia de
 * valor. `/probe-escena` sigue funcionando consumiendo desde el destino, porque
 * es la herramienta de calibración y se usa.
 *
 * ── Lo que este contrato NO decide, a propósito ────────────────────────────
 *
 * **Cómo se ata el recorrido al scroll.** Es §7.2 de `DIRECCION-ESCENA.md` y
 * sigue abierto: los seis tramos están compuestos sobre OCHO pantallas de 0,125
 * exacto, y la tabla real del home (`_lib/secciones.ts`) declara alturas que no
 * suman ocho. Poner acá un mapeo sería decidir por adelantado la pregunta que
 * el subagente tiene que medir y reportar. El contrato exige que el progreso
 * salga del scroll de la página y no de un control, y nada más.
 */

import { CLASES_FUERA_DE_FLUJO, CONSULTA_ESCENARIO } from '../compuerta'

/**
 * El módulo perezoso, con su ruta exacta y su forma.
 *
 * La ruta está escrita como dato y no sólo adentro del `import()` porque el
 * instrumento la necesita para poder afirmar que el archivo existe y que la
 * compuerta le apunta a él. Un `import()` con una plantilla no se puede leer
 * desde afuera; una constante sí.
 */
export const MODULO_DE_LA_ESCENA = 'src/app/v3/_lib/escena/EscenaDelHome.tsx'

/** Cómo lo pide la compuerta. Se afirma contra el fuente de `EscenarioCompuerta`. */
export const IMPORT_DE_LA_ESCENA = '../_lib/escena/EscenaDelHome'

/**
 * La forma del módulo: un componente sin props, con export por defecto.
 *
 * Sin props es una decisión y no una simplificación. Todo lo que la escena
 * necesita saber del mundo lo lee de fuentes que ya existen y que NO pasan por
 * el árbol de React: el scroll de la página (que la compuerta no conoce) y el
 * estado del intro (`home-intro/introHandoff.ts`, un observable de módulo que
 * se lee adentro de un `useFrame` sin re-renderizar). Pasarle props obligaría a
 * que el punto de montaje —que está en la carga inicial— importara los tipos y
 * los valores de quien los produce, y ése es exactamente el camino por el que
 * `three` se cuela en el bundle base.
 */
export type ComponenteDeEscena = () => React.JSX.Element | null

/**
 * Los módulos de los que el árbol de la carga inicial de `/v3` NO puede
 * importar un VALOR. Es la condición 4 escrita como dato para poder afirmarla
 * sobre el fuente, además de medirla sobre el build.
 *
 * Los dos instrumentos hacen falta y no se reemplazan: el del build prueba el
 * resultado y no dice de dónde viene; el del fuente dice de dónde viene y no
 * prueba el resultado. Es la misma pareja que `s7-compuerta` y `s7-contrato`.
 */
export const PAQUETES_DE_TRES: readonly string[] = [
  'three',
  'three-stdlib',
  '@react-three/fiber',
  '@react-three/drei',
  '@react-three/postprocessing',
]

/**
 * Las huellas con las que se busca `three` en la salida del build.
 *
 * Son cadenas que three escribe y que sobreviven a la minificación —mensajes de
 * error y nombres de chunk de GLSL—, no nombres de export, que el minificador
 * renombra. Están medidas contra el build de la línea de base (HEAD de
 * SITIO-S7): las tres aparecen en el build y **ninguna aparece en la carga
 * inicial de `/v3`, ni en la de `/`, ni en la de `/probe-escena`**. Ése es el
 * estado que hay que conservar.
 *
 * Son tres y no una por la misma razón por la que `s7-compuerta` busca cinco
 * huellas del sistema de motion: una marca sola no prueba que la librería no se
 * coló por otro lado, y una huella que webpack mueva de chunk dejaría el
 * chequeo ciego sin que nada se queje.
 */
export const HUELLAS_DE_TRES: readonly string[] = [
  'THREE.WebGLRenderer',
  'shadowmap_pars_fragment',
  'THREE.Object3D',
]

/** Las clases con las que la escena sale del flujo. Una sola definición. */
export const CLASES_DE_LA_ESCENA = CLASES_FUERA_DE_FLUJO

/** La consulta de la compuerta. Una sola definición, la de S1. */
export const CONSULTA_DE_LA_ESCENA = CONSULTA_ESCENARIO
