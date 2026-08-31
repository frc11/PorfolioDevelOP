/**
 * EL ENCHUFE DEL PESO — el árbol declarado del layout RAÍZ, y su contrato.
 *
 * ⚠ **ESTE ARCHIVO NO LO ESCRIBE EL SUBAGENTE.** Lo escribió el agente
 * principal en la Fase 0 de SITIO-S8, antes de despachar.
 *
 * ⚠️⚠️ **ESTO TOCA EL SITIO VIVO. `src/app/layout.tsx` lo comparten el home
 * actual, el panel de administración, el dashboard de clientes y las landings
 * de producción — Matsu y Sonrisa Norte usan esto.** Por eso el enchufe de este
 * frente no es un punto de montaje: es **un inventario congelado de lo que el
 * layout renderiza hoy**, contra el que se puede afirmar que sigue
 * renderizando lo mismo después.
 *
 * ── El problema, diagnosticado y arrastrado seis sprints ───────────────────
 *
 * `/v3` pesa **440,7 KiB gzip** en su carga inicial abajo de 1025, contra un
 * techo de 300. La descomposición, medida sobre el build de la línea de base
 * (HEAD de SITIO-S7):
 *
 *     /v3 entero        28 archivos · 1442,7 KiB crudo · 440,7 KiB gzip
 *       heredado        25 archivos · 1387,0 KiB crudo · 423,0 KiB gzip
 *       propio de /v3    3 archivos ·   55,8 KiB crudo ·  17,7 KiB gzip
 *
 * O sea que **el 96,1% del crudo y el 96,0% del gzip vienen del layout raíz**.
 *
 * ⚠ **La instrucción del sprint dice 99,7% y ese número está vencido**, no
 * equivocado: valía cuando `/v3` era el esqueleto de S1 y lo propio era UN
 * archivo de ~4,5 KiB. SITIO-S7 compuso las ocho secciones y lo propio pasó a
 * 55,8 KiB. La conclusión no se mueve —la abrumadora mayoría del peso es
 * heredada y no es de estos sprints— pero la cifra se publica corregida, con su
 * instrumento, porque una cifra sin instrumento es prosa (regla 11 de §3).
 *
 * La causa está diagnosticada desde S1 y escrita en `bundle.invariant.ts`:
 *
 * > El layout raíz importa estáticamente Navbar, Shutter, Preloader, Lenis,
 * > sonner y el widget de chat. `PublicOnlyComponents` los apaga en `/v3`
 * > devolviendo `null`, **pero el import estático ya metió los chunks en la
 * > carga inicial de TODA ruta. Apagar un componente no lo saca del bundle.**
 *
 * Es **la compuerta al revés, una capa más arriba**: exactamente la lección que
 * S1 aplicó al escenario, sin aplicar en la raíz.
 *
 * ── LAS CUATRO REGLAS DURAS DE ESTE FRENTE ────────────────────────────────
 *
 * **1 · No se cambia QUÉ renderiza. Se cambia CÓMO se importa.** Import
 * dinámico donde el componente no se necesita en el primer render. Nada más.
 *
 * **2 · Cada componente tiene que renderizar idéntico**, con comprobación que
 * lo verifique y su control positivo. La lista congelada de abajo es contra qué.
 *
 * **3 · Ningún cambio de comportamiento. Si un componente necesita cambiar para
 * poder diferirse, NO se difiere: se reporta.** Esta regla es la que decide los
 * casos difíciles, y hay varios: un proveedor que envuelve a `children` no se
 * puede pedir con `ssr: false` sin sacar a `children` del HTML servido.
 *
 * **4 · `ssr: false` cambia el HTML servido.** Si un componente se renderiza
 * hoy en el servidor y se lo difiere con `ssr: false`, el HTML que sale del
 * servidor deja de tenerlo: cambia lo que ve un buscador, lo que ve alguien sin
 * JavaScript, y puede meter un salto de layout cuando el componente aparece
 * tarde. Si un componente lo necesita, **se dice en vez de hacerlo**.
 *
 * ── Y una que no es regla sino aviso ───────────────────────────────────────
 *
 * Si el techo de 300 KiB no se alcanza sin cambiar comportamiento, **se dice
 * con el número**. Es un resultado legítimo y es el que hay que reportar: la
 * alternativa —forzarlo cambiando comportamiento en un layout que comparte el
 * sitio vivo— es la que no está autorizada.
 */

/**
 * Qué naturaleza tiene cada pieza montada, que es lo que decide si se puede
 * diferir. No es una opinión sobre el resultado: es una propiedad estructural
 * que se puede leer del código, y por eso está acá y no en la cabeza de nadie.
 *
 *   `envoltorio`  recibe `children`. Diferirlo con `ssr: false` saca el árbol
 *                 entero del HTML servido. **No se difiere.**
 *   `hoja`        no recibe `children`: se monta al lado. Es donde el import
 *                 dinámico puede hacer algo.
 *   `head`        vive en el `<head>` y corre antes del primer pintado. Su
 *                 valor entero es llegar temprano. **No se difiere.**
 */
export type NaturalezaDePieza = 'envoltorio' | 'hoja' | 'head'

export interface PiezaDelLayout {
  /** El identificador con el que aparece en el JSX. */
  readonly nombre: string
  /** De dónde se importa hoy, tal cual está escrito en `layout.tsx`. */
  readonly modulo: string
  readonly naturaleza: NaturalezaDePieza
  /** Qué hay que saber antes de decidir. No es el veredicto: es el dato. */
  readonly nota: string
}

/**
 * ⚠️ **EL ÁRBOL CONGELADO — lo que `src/app/layout.tsx` renderiza HOY, en
 * orden.** Es la línea de base contra la que se afirma «renderiza idéntico».
 *
 * Se lee de arriba abajo como el JSX. `PublicOnlyComponents` aparece tres veces
 * a propósito: son tres envoltorios distintos en tres lugares distintos del
 * árbol, y colapsarlos en uno sería cambiar qué renderiza.
 */
export const ARBOL_DEL_LAYOUT: readonly PiezaDelLayout[] = [
  {
    nombre: 'HomeIntroBoot',
    modulo: '@/components/layout/HomeIntro',
    naturaleza: 'head',
    nota:
      'Inyecta el `<script>` pre-paint que decide si el intro del home corre. Todo su valor es ' +
      'llegar antes del primer pintado; diferirlo lo destruye. SITIO-S8 le cambió la lista de ' +
      'rutas (`home-intro/introRutas.ts`). ⚠️ Y ES LA ÚNICA DESVIACIÓN DEL INVENTARIO: el frente ' +
      '`peso` apuntó el import al módulo real (`home-intro/introBoot`) en vez del BARRIL, porque ' +
      'el barril vive en el grupo de chunks de la página del home y arrastraba 71,4 KiB gzip a ' +
      'toda ruta. El campo `modulo` de abajo se deja como estaba A PROPÓSITO: es la línea de ' +
      'base, y `s8-diferido` afirma que la desviación es EXACTAMENTE una y que el módulo ' +
      'declarado re-exporta ese binding desde el que el layout pide ahora — o sea que es la ' +
      'misma función, seguida por el disco y no por comparación de cadenas.',
  },
  {
    nombre: 'PreloaderProvider',
    modulo: '@/context/PreloaderContext',
    naturaleza: 'envoltorio',
    nota: '⚠ ARCHIVO CONGELADO. Se lee y se consume; jamás se edita. Envuelve todo el `<body>`.',
  },
  {
    nombre: 'SmoothScroll',
    modulo: '@/components/layout/SmoothScroll',
    naturaleza: 'envoltorio',
    nota:
      'Lenis. Envuelve a `children`. Es el candidato con más peso y el que más cuidado pide: ' +
      'diferir el ENVOLTORIO saca el árbol del HTML servido. Diferir la LIBRERÍA adentro del ' +
      'componente sería cambiar el componente — si hace falta, se reporta.',
  },
  {
    nombre: 'TransitionProvider',
    modulo: '@/context/TransitionContext',
    naturaleza: 'envoltorio',
    nota: '⚠ ARCHIVO CONGELADO. Envuelve al Shutter, a `children` y a la Navbar.',
  },
  {
    nombre: 'PublicOnlyComponents',
    modulo: '@/components/layout/PublicOnlyComponents',
    naturaleza: 'envoltorio',
    nota:
      'Primera de tres apariciones: envuelve al Shutter. Es la compuerta de RUNTIME que devuelve ' +
      '`null` en portales, `/styleguide`, `/probe-escena` y `/v3`. Es exactamente la pieza que ' +
      'demuestra el problema: apaga el componente y no saca el chunk.',
  },
  {
    nombre: 'Shutter',
    modulo: '@/components/layout/Shutter',
    naturaleza: 'hoja',
    nota:
      'Un `motion.div` fijo, `pointer-events-none`, opacidad 0 en reposo. No ocupa espacio en el ' +
      'flujo, así que aparecer tarde no puede mover la página. Consume `useTransitionContext`.',
  },
  {
    nombre: 'children',
    modulo: '—',
    naturaleza: 'envoltorio',
    nota: 'El contenido de la ruta. No es una pieza del chrome; está en la lista para fijar el ORDEN.',
  },
  {
    nombre: 'PublicOnlyComponents',
    modulo: '@/components/layout/PublicOnlyComponents',
    naturaleza: 'envoltorio',
    nota: 'Segunda aparición: envuelve a la Navbar, DESPUÉS de `children`.',
  },
  {
    nombre: 'Navbar',
    modulo: '@/components/layout/Navbar',
    naturaleza: 'hoja',
    nota:
      '⚠ Chrome VISIBLE del sitio vivo, arriba del pliegue en toda ruta pública. Se renderiza hoy ' +
      'en el servidor. `ssr: false` acá cambia el HTML servido y saca la navegación de lo que ve ' +
      'un buscador: eso es regla 4, y si hace falta se reporta en vez de hacerse.',
  },
  {
    nombre: 'PublicOnlyComponents',
    modulo: '@/components/layout/PublicOnlyComponents',
    naturaleza: 'envoltorio',
    nota: 'Tercera aparición: envuelve al Preloader de marketing, fuera de `SmoothScroll`.',
  },
  {
    nombre: 'Preloader',
    modulo: '@/components/ui/Preloader',
    naturaleza: 'hoja',
    nota:
      'Con `isHomePage={false}`: su rama de home no corre ni renderiza el velo — el intro del home ' +
      'lo maneja `HomeIntro`. Queda vivo SOLO por la rama de marketing (las landings de clientes).',
  },
  {
    nombre: 'Toaster',
    modulo: 'sonner',
    naturaleza: 'hoja',
    nota:
      'Dependencia externa. No muestra nada hasta que alguien dispara un toast. Es la hoja más ' +
      'obviamente diferible del árbol — pero «obvio» no es «medido»: hay que mirar qué renderiza ' +
      'hoy en el HTML servido antes de decidir.',
  },
  {
    nombre: 'ChatWidgetMount',
    modulo: '@/components/layout/ChatWidgetMount',
    naturaleza: 'hoja',
    nota:
      'YA difiere el widget pesado por dentro (`dynamic(ssr:false)` sobre `@/modules/chatbot`) y ' +
      'devuelve `null` hasta que el chrome se revela. Lo que queda en la carga inicial es su ' +
      'propio módulo más `useChromeRevealed` y `prefetchBotConfig`.',
  },
]

/**
 * Los archivos CONGELADOS que este frente puede leer y no puede editar, ni
 * siquiera para diferirlos, **con la huella de su contenido**.
 *
 * ── Por qué una huella y no una fecha ──────────────────────────────────────
 *
 * La primera versión de este check comparaba `mtime` contra la fecha del
 * enchufe de la Fase 0: cualquier congelado escrito DESPUÉS de esa marca se
 * había tocado. Funcionaba, y **se rompió sola en la Fase 2**, en cuanto el
 * agente principal volvió a editar el enchufe que servía de vara — el archivo
 * de referencia se movió al presente y su propio contrapeso quedó en rojo sin
 * que ningún congelado se hubiera tocado.
 *
 * Es el mismo defecto de forma que la regla 12 nombra para los checks contra
 * `git`: **medía el momento, no el código**, y encima con una vara móvil. No se
 * aflojó (regla 8): se REEMPLAZÓ por la propiedad que se quería afirmar, que es
 * del contenido y no de la fecha. Es además la forma que el frente del intro ya
 * había usado en este mismo sprint para los dos contextos.
 *
 * `\r` normalizado: un `core.autocrlf` distinto no puede mover la huella.
 *
 * ⚠ **La ventana, declarada:** la huella se tomó DURANTE el sprint, así que
 * prueba que el archivo no cambió DESDE ENTONCES, no que nunca cambió. Para lo
 * segundo hace falta una huella registrada antes, y el repo no la tiene.
 */
export const CONGELADOS_DEL_LAYOUT: Readonly<Record<string, string>> = {
  'src/context/PreloaderContext.tsx': '8664d01dd44be214243aae378db16beef9699597b0cbac673f9bf4d8e744cc46',
  'src/context/TransitionContext.tsx': '75adc80403677b57a7957c91d3ebca0b6720fa17f3fd80a3c2c1152c9e7b3b87',
  'src/components/3d/HeroArtifact.tsx': 'df32381246231045d699c22bd0ae3fac780792fb95b64677e86771137297a52a',
  'src/lib/prisma.ts': 'f93b357e622bbfdd00f53c869eadd20fd82bfcd812e39690f39c1b654ccb325d',
  'src/auth.ts': '4edce37b066b6ecba37c845b41dde4a2d28f6a3e2b0fdff0ed04a926a6484fb8',
  'prisma/schema.prisma': 'd1c5e71cccb42d7caff73243303c5864688d783d8bf772b816be74362895e885',
}

/**
 * ⚠️ **LA LÍNEA DE BASE, MEDIDA SOBRE EL BUILD DE HEAD (SITIO-S7).**
 *
 * Producida por el barrido de la Fase 0 sobre `.next/`, con el mismo método que
 * `s3-bundle.ts`: los `<script src>` del HTML prerenderizado de cada ruta,
 * `statSync` para el crudo y `gzipSync` para el comprimido. **No es una cifra
 * copiada de un reporte**: se puede volver a producir corriendo el instrumento
 * de este frente contra un build de HEAD.
 *
 * `heredado` = los archivos que `/v3` comparte con `/`, que es la partición de
 * S1 y la única que atribuye el peso a quien lo produce.
 */
export const LINEA_DE_BASE = {
  /** Commit del build medido. */
  commit: '09113f42',
  v3: { archivos: 28, crudoKiB: 1442.7, gzipKiB: 440.7 },
  heredado: { archivos: 25, crudoKiB: 1387.0, gzipKiB: 423.0 },
  propio: { archivos: 3, crudoKiB: 55.8, gzipKiB: 17.7 },
  /** La carga inicial del home vivo, contra la que se parte. */
  home: { archivos: 25 },
} as const
