import { CONSULTA_MENOS_MOVIMIENTO } from '../../_lib/cursor'

/**
 * [B12c] QUIÉN VE EL PRELOADER, DECIDIDO ANTES DEL PRIMER PINTADO — el script que `PreloaderDelSitio` inserta en el `<head>` del HTML del
 * servidor (`useServerInsertedHTML`, como el gate del intro viejo: `components/layout/home-intro/introBoot.tsx`). El servidor no conoce el
 * almacenamiento ni el tipo de navegación; este script sí, y corre antes de que se pinte nada:
 *
 *   · **Una vez por día:** la primera entrada del día (fecha LOCAL), por cualquier página de /v3. La fecha queda en `localStorage`
 *     (`CLAVE_DEL_DIA`) apenas se decide. Sin almacenamiento (privado, bloqueado), se muestra igual: no hay cómo saber si ya se vio.
 *   · **Nunca en una recarga ni volviendo con las flechas** (el tipo de la navegación del documento: `reload`, `back_forward`). La
 *     navegación interna no recarga el documento: el layout ni se vuelve a montar.
 *   · **Las salidas de las pruebas** (ninguna se activa navegando el sitio; ver abajo).
 *
 * Si se ve: la cubierta del layout se muestra (la custom property `--preloader-del-sitio` en el `<html>`: la lee `_estilos/preloader.css`)
 * y el scroll queda bloqueado desde el primer instante (la rueda, el toque y las teclas que scrollean, en la ventana y en la captura: así
 * tampoco le llegan a Lenis). La decisión, el bloqueo y cómo soltarlo quedan en `window.__preloaderDelSitio` (`EnLaVentana`).
 *
 * ── LAS SALIDAS DE LAS PRUEBAS, y por qué no se activan por accidente en producción ───────────────────────────────────────────────────
 *
 *   1. `navigator.webdriver === true`: el navegador está automatizado (Playwright, Puppeteer, chrome-devtools-mcp lo marcan). Un
 *      navegador de una persona nunca lo está. Es el mismo criterio del gate del intro viejo.
 *   2. `sessionStorage['home:intro'] === '1'`: la siembra que TODOS los bancos ya ponen con `addInitScript` (`scripts-carga/*`,
 *      `scripts-b4/navegador.ts`, `scripts-b5/b5-comun.ts`), incluidos los que manejan su Chrome por CDP sin marca de automatización. En
 *      /v3 nadie la escribe: sólo `markIntroPlayed()` del intro viejo del home vivo (`/`), en la misma pestaña; se va con D8.
 *   3. `?preloader=no` en la URL: para mirar a mano sin esperar (hay que escribirlo).
 *
 * Las pruebas que SÍ lo quieren ver ponen `window.__preloaderDelBanco = 'normal'` (sin las salidas 1 y 2: decide el día y la navegación)
 * o `'mostrar'` (siempre); a mano, `?preloader=si` (siempre, también en una recarga: para mirarlo de nuevo).
 *
 * ⚠️ ES5 y sin nada de afuera: corre bloqueante en el `<head>`, antes de cualquier polyfill (el mismo criterio del gate del intro). Lo
 * prueba `s78-preloader` corriéndolo con una ventana falsa.
 */

/** La fecha local de la última vez que se vio (`AAAA-M-D`). */
export const CLAVE_DEL_DIA = 'develop-v3-preloader'

/** La siembra de los bancos (la del intro viejo, `INTRO_SESSION_KEY`): con ella el preloader no aparece. */
export const CLAVE_DE_LOS_BANCOS = 'home:intro'

/** `?preloader=no` lo saltea; `?preloader=si` lo muestra siempre. */
export const BANDERA = 'preloader'

/** La custom property del `<html>` que muestra la cubierta (`_estilos/preloader.css`). */
export const PROPIEDAD_DE_LA_CUBIERTA = '--preloader-del-sitio'

/** El tope: pase lo que pase, a los 20 s del arranque el bloqueo se suelta solo y la cubierta se va (también sin JavaScript). */
export const TOPE_MS = 20000

/** Lo que el banco pide (`addInitScript`): `normal` decide como una persona; `mostrar` lo muestra siempre. */
export type PedidoDelBanco = 'normal' | 'mostrar'

/** Los defectos para los controles del banco (`window.__defectosDelPreloader`, nunca la URL). */
export type DefectoDelPreloader = 'sin-freno' | 'en-recargas' | 'sin-bloqueo'

/** Lo que el script deja en la ventana si el preloader se ve. */
export interface EnLaVentana {
  readonly activo: true
  /** `prefers-reduced-motion` al decidir. */
  readonly reducido: boolean
  /** `performance.now()` al decidir. */
  readonly desde: number
  /** Mientras es `true`, la rueda, el toque y las teclas que scrollean no mueven la página (salvo adentro de un diálogo o un campo). */
  bloqueado: boolean
  /** Suelta el bloqueo y saca los oyentes. Una vez. */
  soltar: () => void
}

export type VentanaConElPreloader = Window & {
  __preloaderDelSitio?: EnLaVentana
  __preloaderDelBanco?: PedidoDelBanco
  __defectosDelPreloader?: DefectoDelPreloader
}

/** Lo que el bloqueo deja pasar: lo que nace adentro de un diálogo con scroll propio o de un campo (y las teclas sobre un control). */
export const DEJA_PASAR = '[data-lenis-prevent],input,textarea,select,[contenteditable]'
const TECLAS_DEJA_PASAR = `${DEJA_PASAR},button,a[href],[role="button"],summary`

/** El script, en una línea (ES5). */
export const SCRIPT_DE_LA_DECISION = [
  '(function(){try{',
  'var w=window,h=document.documentElement,b=w.__preloaderDelBanco,q=w.location.search,f=new Date(),',
  "hoy=f.getFullYear()+'-'+(f.getMonth()+1)+'-'+f.getDate(),ver=false;",
  `if(/[?&]${BANDERA}=si(&|$)/.test(q)||b==='mostrar')ver=true;`,
  `else if(!/[?&]${BANDERA}=no(&|$)/.test(q)){`,
  `var auto=false;if(b!=='normal'){auto=w.navigator.webdriver===true;try{auto=auto||w.sessionStorage.getItem('${CLAVE_DE_LOS_BANCOS}')==='1'}catch(e){}}`,
  "var p=w.performance,n=p&&p.getEntriesByType?p.getEntriesByType('navigation')[0]:null,",
  "t=n?n.type:(p&&p.navigation?(p.navigation.type===1?'reload':p.navigation.type===2?'back_forward':'navigate'):'navigate'),",
  "vuelta=(t==='reload'||t==='back_forward')&&w.__defectosDelPreloader!=='en-recargas',visto=null;",
  `try{visto=w.localStorage.getItem('${CLAVE_DEL_DIA}')}catch(e){}`,
  'ver=!auto&&!vuelta&&visto!==hoy}',
  'if(!ver)return;',
  `try{w.localStorage.setItem('${CLAVE_DEL_DIA}',hoy)}catch(e){}`,
  `h.style.setProperty('${PROPIEDAD_DE_LA_CUBIERTA}','block');`,
  `var a=w.performance.now(),o={capture:true,passive:false},d={activo:true,reducido:w.matchMedia('${CONSULTA_MENOS_MOVIMIENTO}').matches,desde:a,bloqueado:w.__defectosDelPreloader!=='sin-bloqueo'};`,
  `var pasa=function(e,s){var x=e.target;return !d.bloqueado||w.performance.now()-a>${String(TOPE_MS)}||(x&&x.closest&&x.closest(s)!==null)};`,
  `var frena=function(e){if(pasa(e,'${DEJA_PASAR}'))return;e.preventDefault();e.stopPropagation()};`,
  "var k={' ':1,Spacebar:1,PageUp:1,PageDown:1,Home:1,End:1,ArrowUp:1,ArrowDown:1};",
  `var tecla=function(e){if(k[e.key]===1&&!pasa(e,'${TECLAS_DEJA_PASAR}'))e.preventDefault()};`,
  "w.addEventListener('wheel',frena,o);w.addEventListener('touchmove',frena,o);w.addEventListener('keydown',tecla,true);",
  "d.soltar=function(){d.bloqueado=false;w.removeEventListener('wheel',frena,o);w.removeEventListener('touchmove',frena,o);w.removeEventListener('keydown',tecla,true)};",
  'w.__preloaderDelSitio=d',
  '}catch(e){}})()',
].join('')

/** La decisión que el script dejó en la ventana (`null` si no se ve: otra entrada del día, una recarga, una prueba). */
export function decisionDeLaVentana(): EnLaVentana | null {
  if (typeof window === 'undefined') return null
  const d = (window as VentanaConElPreloader).__preloaderDelSitio
  return d !== undefined && d.activo === true ? d : null
}

/** El defecto pedido por el banco, si hay uno. */
export function defectoDelPreloader(): DefectoDelPreloader | null {
  if (typeof window === 'undefined') return null
  return (window as VentanaConElPreloader).__defectosDelPreloader ?? null
}
