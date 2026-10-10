/**
 * PULIDO 12 — el invariante: npm run test:s63-pulido-12
 *
 * Sólo defectos OBJETIVOS (medidos en el banco, con su recibo en `docs/rediseno/entregas/pulido-12/`), cada uno con su control
 * positivo (el detector ve el estado de antes):
 *   1 · la cabecera de 860 a 1023: con la barra a la vista (Contacto y Login arriba a la derecha), el progreso ya no va arriba a
 *       la derecha (se pisaba con Login, 27 × 32 px): vuelve a la esquina de abajo.
 *   C1 · el pie simétrico: la columna izquierda llega hasta donde llega el formulario del otro lado (las letras, a la misma
 *        distancia del logo que el formulario), el logo centrado, y a 1024 nada de la izquierda se sale de su columna.
 *   2 · Quiénes somos al salir (desde 1024): el cuerpo, que en el reposo queda justo debajo del logo, subía a través de él en toda
 *       la salida; ahora se va si su caja cruza la del logo y vuelve en el reposo.
 *   5 · los viajes y el scroll sin el cuadro largo del principio y del final: Lenis ya no escribe su estado del scroll como clase de
 *       `<html>` (cada clase recalculaba el estilo de la página entera), sino como atributo de la raíz de /v3.
 *   1 · la caída del logo contra las piezas 3D del pie: no se cruzan (margen mínimo de más de 4 u), con el gancho del banco.
 *   3 · la tarjeta del resultado y el teléfono que rota: el alto guardado se suelta si cambia el ancho (la tarjeta del panel de
 *       Contacto quedaba más alta que la pantalla y «Reintentar» afuera), y el formulario del pie que se vuelve a montar al cruzar
 *       1024 (una tablet que gira) arranca donde estaba (lo escrito y la tarjeta se perdían).
 * El log: `docs/rediseno/SPRINT-PULIDO-12.md`.
 */
import { readFileSync } from 'node:fs'

import { VIGENCIA_MS, anotar, recuperar, recuperarAlMontar, anotarElPedido, pedidoEnCurso } from '../formularios/memoriaDelFormulario'
import { sigueValiendo } from '../formularios/altoGuardado'
import { ESQUIVA_AL_SALIR, pedidoAlSalir } from '../escena/titulos3d/esquivaAlSalir'
import { ATRIBUTO_DEL_SCROLL_EN_CURSO, clasesQuietas } from '../../_componentes/lenisSinClasesDeScroll'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const recibo = <T,>(nombre: string): T => JSON.parse(readFileSync(`docs/rediseno/entregas/pulido-12/${nombre}`, 'utf8')) as T

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La cabecera de 860 a 1023: el progreso no se pisa con Login')
interface Parada {
  readonly ancho: number
  readonly y: number
  readonly choques: readonly string[]
}
const CABECERA = recibo<{ antes: Parada[]; despues: Parada[] }>('cabecera.json')
const ESQUINA = leer('_chrome/recorrido/InfinitoDelRecorrido.tsx')
const APERTURA = leer('_chrome/contacto/apertura.ts')
const cabeceraLimpia = (paradas: readonly Parada[]): boolean => paradas.length >= 21 && paradas.some((p) => p.ancho >= 1000 && p.ancho < 1024) && paradas.filter((p) => p.ancho < 1024).every((p) => p.choques.length === 0)
const progresoAlPie = (c: string, a: string): boolean =>
  c.includes('const conLaBarra = useLaBarraSeVe()') && c.includes('const alPie = abajo || conLaBarra') && c.includes("data-abajo={alPie ? '' : undefined}") &&
  // El parlante sigue arriba a la izquierda con la barra (sólo la bandera lo baja).
  c.includes("<div data-parte=\"lugar-del-parlante\" className={cn(!abajo && 'max-escritorio:fixed") &&
  // En el servidor, sin la barra (abajo de 1024 lo común es el menú): el HTML no dibuja el progreso abajo en el teléfono.
  a.includes("return useSyncExternalStore(suscribir, conLaBarra, () => false)")
afirmar(cabeceraLimpia(CABECERA.despues) && progresoAlPie(ESQUINA, APERTURA), `1 · de 390 a 1023 (arriba, a 1400 y a 4200 px) ningún control fijo se pisa con otro (${String(CABECERA.despues.length)} paradas): con la barra a la vista el progreso va abajo`)
controlPositivo('1 · el detector VE la cabecera de antes (a 1000 y 1023, Login × progreso)', CABECERA.antes, cabeceraLimpia)
controlPositivo('  y el progreso que no mira la barra', ESQUINA.replace("data-abajo={alPie ? '' : undefined}", "data-abajo={abajo ? '' : undefined}"), (c: string) => progresoAlPie(c, APERTURA))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C1 · El pie simétrico')
interface Distancias {
  readonly columnaIzquierdaLogo: number
  readonly logoFormulario: number
  readonly centroDelLogo: number
}
const C1 = recibo<{ antes: Record<string, Distancias>; despues: Record<string, Distancias>; bordesDespues1024: { columna: number[]; letrasDerecha: number; fueraVisible: string[] } }>('c1.json')
const ANCHOS_C1 = ['1024', '1280', '1366', '1440', '1920', '2560']
// La referencia es form–logo: la izquierda, a esa distancia (±2 px: la medida va en píxeles enteros), y el logo en el medio.
const simetrico = (r: Record<string, Distancias>): boolean => ANCHOS_C1.every((w) => r[w] !== undefined && Math.abs(r[w].columnaIzquierdaLogo - r[w].logoFormulario) <= 2 && Math.abs(r[w].centroDelLogo) <= 2)
const CIERRE = leer('_secciones/cierre/Cierre.tsx')
const RECORRIDO = leer('_secciones/cierre/RecorridoDelPie.tsx')
const geometriaBien = (c: string, r: string): boolean =>
  c.includes("const anchoDeLaColumna = volumen ? 'escritorio:w-[max(25%,min(calc(var(--spacing-20)*3.3),calc(50%-var(--hueco-del-pie))))]'") &&
  c.includes("{volumen && disposicion === 'producto' && <RecorridoDelPie repartido ") && r.includes("!enFila && repartido && 'justify-between gap-x-[var(--spacing-3)]'")
afirmar(simetrico(C1.despues) && geometriaBien(CIERRE, RECORRIDO), `C1 · a ${ANCHOS_C1.join(', ')}: columna izquierda–logo = logo–formulario (${ANCHOS_C1.map((w) => `${String(C1.despues[w]?.columnaIzquierdaLogo)}/${String(C1.despues[w]?.logoFormulario)}`).join(' · ')}) y el logo centrado`)
controlPositivo('C1 · el detector VE el pie de antes (de −7 a +117 px)', C1.antes, simetrico)
controlPositivo('  y el recorrido sin repartir', RECORRIDO.replace("!enFila && repartido && 'justify-between gap-x-[var(--spacing-3)]'", '!enFila && repartido && false'), (r: string) => geometriaBien(CIERRE, r))
const B = C1.bordesDespues1024
afirmar(B.letrasDerecha <= B.columna[1] && B.fueraVisible.length === 0 && B.columna[1] - B.columna[0] === 264, `C1 · a 1024 la columna izquierda mide 264 px y nada visible se sale (las letras llegan a ${String(B.letrasDerecha)}, el borde)`)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La tarjeta del resultado y el teléfono que rota')
interface Tarjeta {
  readonly caja: number[]
  readonly boton: number[] | null
  readonly ventana: number[]
}
interface Rotacion {
  readonly antes: Tarjeta | null
  readonly rotado: Tarjeta | null
  readonly deVuelta: Tarjeta | null
}
const ROTAR = recibo<{ antes: Record<string, Rotacion>; despues: Record<string, Rotacion> }>('rotar.json')
// Rotada y de vuelta, la tarjeta sigue estando (no se perdió) y cabe en el alto del cuadro (`caja`: x, y, ancho, alto); en el
// panel, que no se scrollea con la página, además se ve entera con su botón.
const entera = (t: Tarjeta | null): boolean => t !== null && t.boton !== null && t.caja[3] <= t.ventana[1]
const enLaPantalla = (t: Tarjeta | null): boolean => entera(t) && t !== null && t.boton !== null && t.caja[1] >= 0 && t.boton[1] <= t.ventana[1]
const rotaBien = (r: Record<string, Rotacion>): boolean =>
  ['390 844 pie', '390 844 modal', '768 1024 pie', '768 1024 modal'].every((k) => r[k] !== undefined && entera(r[k].rotado) && entera(r[k].deVuelta)) &&
  ['390 844 modal', '768 1024 modal'].every((k) => enLaPantalla(r[k].rotado) && enLaPantalla(r[k].deVuelta))
const FORMS = [leer('_secciones/cierre/FormularioDelPie.tsx'), leer('_chrome/contacto/FormularioDeContacto.tsx')]
const sueltaAlRotar = (f: typeof sigueValiendo): boolean => f(390, 390) && !f(390, 844) && !f(844, 390) && FORMS.every((x) => x.includes('const [alto, setAlto] = useAltoGuardado()'))
afirmar(sueltaAlRotar(sigueValiendo), '3 · el alto guardado al enviar se suelta si cambia el ancho de la ventana (no con un cambio sólo de alto), en los dos formularios')
controlPositivo('3 · el detector VE el alto que nunca se suelta', (() => true) as typeof sigueValiendo, sueltaAlRotar)
// La memoria del formulario del pie: lo anotado vale mientras el dueño sigue montado (el nuevo se dibuja antes de que el viejo se
// desmonte) y `VIGENCIA_MS` después de irse; un envío en viaje se recupera como tal sólo si su pedido sigue en viaje (si no, en
// reposo: no queda «enviando» para siempre).
type M = { readonly estado: { readonly fase: string }; readonly datos: string }
const memoriaBien = (rec: typeof recuperar): boolean => {
  anotar('prueba', { estado: { fase: 'error' }, datos: 'hola' }, true, 1000)
  const conElDueno = rec<M>('prueba', 1000 + 60000)
  anotar('prueba', { estado: { fase: 'error' }, datos: 'hola' }, false, 1000)
  const reciente = rec<M>('prueba', 1000 + VIGENCIA_MS - 1)
  const vieja = rec<M>('prueba', 1000 + VIGENCIA_MS + 1)
  return conElDueno?.datos === 'hola' && reciente?.datos === 'hola' && vieja === null && VIGENCIA_MS <= 1000
}
afirmar(memoriaBien(recuperar), '3 · lo anotado se recupera con el dueño montado (el cambio de árbol) o recién ido, y no después')
controlPositivo('3 · el detector VE una memoria sin vencimiento', (<T,>(clave: string): T | null => recuperar<T>(clave, 1000)) as typeof recuperar, memoriaBien)
anotar('en-viaje', { estado: { fase: 'enviando' }, datos: 'x' }, true)
const sinPedido = recuperarAlMontar<M>('en-viaje', { fase: 'quieto' })
const pedido = anotarElPedido('en-viaje', new Promise<number>(() => undefined))
const conPedido = recuperarAlMontar<M>('en-viaje', { fase: 'quieto' })
afirmar(sinPedido?.estado.fase === 'quieto' && conPedido?.estado.fase === 'enviando' && pedidoEnCurso<number>('en-viaje') === pedido, '  un envío en viaje se recupera en viaje sólo si su pedido sigue (el nuevo recibe la respuesta); si no, en reposo')
// La revisión: si la respuesta llegaba entre el dibujo del formulario nuevo y su efecto, el pedido ya se había soltado y el nuevo
// quedaba «enviando» para siempre. El pedido se queda hasta el siguiente (una promesa resuelta igual entrega su respuesta).
const MEMORIA_SRC = leer('_lib/formularios/memoriaDelFormulario.ts')
const resuelto = Promise.resolve(1)
anotarElPedido('resuelto', resuelto)
const pedidoQueSeQueda = (src: string): boolean => !src.includes('pedidos.delete') && pedidoEnCurso<number>('resuelto') === resuelto
afirmar(pedidoQueSeQueda(MEMORIA_SRC), '  un pedido que ya llegó sigue a mano para el formulario que se monta (no queda «enviando» para siempre)')
controlPositivo('  el detector VE el pedido que se soltaba al llegar', `${MEMORIA_SRC}
pedido.then(() => pedidos.delete(clave))`, pedidoQueSeQueda)
const PIE = FORMS[0]
const pieRecuerda = (p: string): boolean =>
  p.includes("const [antes] = useState(() => recuperarAlMontar<Memoria>(MEMORIA, { fase: 'quieto' }))") && p.includes('useRecordar(MEMORIA, { datos, errores, intento, estado, vuelta } satisfies Memoria)') &&
  p.includes("useRespuestaEnViaje(MEMORIA, antes?.estado.fase === 'enviando', llego)") && p.includes('llego(await anotarElPedido(MEMORIA, conDuracionMinima(')
afirmar(pieRecuerda(PIE) && rotaBien(ROTAR.despues), '3 · rotado y de vuelta, la tarjeta sigue y entra entera (a 390 × 844 y 768 × 1024, el pie y el panel): el pie que se vuelve a montar arranca donde estaba')
controlPositivo('3 · el detector VE las rotaciones de antes (el panel a 844 × 390 con «Reintentar» afuera; el pie de 768 que pierde la tarjeta)', ROTAR.antes, rotaBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La caída del logo contra las piezas 3D del pie')
// Con el reloj del final clavado cada 0,05 s (105 momentos): ningún punto de la superficie del logo adentro de la caja de una pieza
// y lo más cerca que pasa, a más de una unidad; las dos caídas, de 1024 a 2560. (Las corridas con la raíz del pie contada como una
// pieza más: el mínimo es el mismo, la raíz contiene a todas.)
interface Corrida {
  readonly momentos: number
  readonly piezas: number
  readonly conCruce: number
  readonly margenMinimo: number
}
const CRUCES = recibo<{ corridas: Record<string, Corrida> }>('cruces.json').corridas
const SILUETA = leer('_lib/escena/SiluetaDelBanco.tsx')
const sinCruces = (c: Record<string, Corrida>): boolean =>
  ['lenta-1024', 'angulo-1024', 'lenta-1440', 'angulo-1440', 'lenta-1920', 'angulo-2560'].every((k) => c[k] !== undefined && c[k].momentos >= 100 && c[k].piezas > 0 && c[k].conCruce === 0 && c[k].margenMinimo > 1)
afirmar(sinCruces(CRUCES) && SILUETA.includes("o.name.startsWith('pie de volumen · ')"), `1 · el logo que cae no atraviesa ninguna pieza del pie (margen mínimo ${String(Math.min(...Object.values(CRUCES).map((c) => c.margenMinimo)))} u)`)
controlPositivo('1 · el detector VE un cruce', { ...CRUCES, 'lenta-1440': { ...CRUCES['lenta-1440'], conCruce: 3, margenMinimo: 0 } }, sinCruces)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Quiénes somos al salir: el cuerpo no cruza el logo')
interface Fila {
  readonly dy: number
  readonly cruce: number
  readonly opacidad: number
}
const SALIDA = recibo<{ antes: Record<string, Fila[]>; despues: Record<string, Fila[]> }>('quienes-salida.json')
// Pasado el reposo más de `saleDesdePx` (la medida toca el pie de la P ya en el reposo: es gruesa, de 8 px), ninguna fila con el cuerpo visible (opacidad > 0,05) y cruzando la silueta del logo; en el reposo,
// entero (A2: el reposo no se toca). En los seis anchos de escritorio.
const salidaLimpia = (r: Record<string, Fila[]>): boolean =>
  ['1024x768', '1280x800', '1366x768', '1440x900', '1920x1080', '2560x1440'].every((w) => r[w] !== undefined && r[w].length >= 20 && r[w][0].dy === 0 && r[w][0].opacidad === 1 && r[w].every((f) => f.dy <= ESQUIVA_AL_SALIR.saleDesdePx || f.cruce === 0 || f.opacidad <= 0.05))
const QUIENES = leer('_secciones/quienes-somos/QuienesSomos.tsx')
const TITULOS = leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx')
const enganchado = (q: string, t: string): boolean => q.includes('<div ref={enElPlano} data-esquiva-al-salir="">') && t.includes('esquivarAlSalir(() => (m.current.logo === null ? null : cajaHolgadaDelLogo(m.current.logo, state.camera, tam.width, tam.height))')
afirmar(salidaLimpia(SALIDA.despues) && enganchado(QUIENES, TITULOS), `2 · al salir de Quiénes somos el cuerpo se va antes de cruzar el logo (con la cámara de verdad) y en el reposo está entero, a ${Object.keys(SALIDA.despues).join(', ')}`)
controlPositivo('2 · el detector VE la salida de antes (el cuerpo visible a través del logo de 24 a ~600 px)', { ...SALIDA.despues, ...SALIDA.antes }, salidaLimpia)
// La regla (con `pasado`: px de scroll después del reposo de la sección, el del viaje del menú): en el reposo nunca esquiva; se va
// recién pasados `saleDesdePx` y si cruza, y no vuelve hasta estar a menos de `vuelveHastaPx` del reposo (dos marcas: no titila).
const LOGO_Q = { izquierda: 400, arriba: 200, derecha: 900, abajo: 700 }
const ABAJO = { izquierda: 100, arriba: 720, derecha: 600, abajo: 900 }
const CRUZA = { izquierda: 100, arriba: 600, derecha: 600, abajo: 800 }
const ARRIBA = { izquierda: 100, arriba: 20, derecha: 600, abajo: 150 }
const { saleDesdePx, vuelveHastaPx } = ESQUIVA_AL_SALIR
const reglaBien = (f: typeof pedidoAlSalir): boolean =>
  vuelveHastaPx < saleDesdePx &&
  f(0, CRUZA, LOGO_Q, false).pedido === 1 && f(vuelveHastaPx, CRUZA, LOGO_Q, true).pedido === 1 && f(saleDesdePx, CRUZA, LOGO_Q, false).pedido === 1 &&
  f(saleDesdePx + 16, ABAJO, LOGO_Q, false).pedido === 1 && f(saleDesdePx + 16, CRUZA, LOGO_Q, false).pedido === 0 &&
  f(vuelveHastaPx + 4, ARRIBA, LOGO_Q, true).pedido === 0 && f(400, ARRIBA, LOGO_Q, true).pedido === 0 && f(400, ARRIBA, LOGO_Q, false).pedido === 1
afirmar(reglaBien(pedidoAlSalir), `  en el reposo no esquiva; se va pasados ${String(saleDesdePx)} px si cruza y vuelve recién a menos de ${String(vuelveHastaPx)} px del reposo`)
controlPositivo('  el detector VE una regla que vuelve apenas deja de cruzar', ((pasado: number, caja: Parameters<typeof pedidoAlSalir>[1], logo: Parameters<typeof pedidoAlSalir>[2]) => pedidoAlSalir(pasado, caja, logo, false)) as typeof pedidoAlSalir, reglaBien)
controlPositivo('  y una que se va apenas pasa el reposo (la primera versión: un empujón de 9 px lo borraba)', ((pasado: number, caja: Parameters<typeof pedidoAlSalir>[1], logo: Parameters<typeof pedidoAlSalir>[2], seFue: boolean) => (pasado > vuelveHastaPx ? { pedido: 0 as const, seFue: true } : pedidoAlSalir(pasado, caja, logo, seFue))) as typeof pedidoAlSalir, reglaBien)
const TITULOS_LIMPIA = TITULOS.includes('useEffect(() => soltarLosQueEsquivan, [])')
afirmar(TITULOS_LIMPIA, '  al desmontarse la escena de los títulos, lo marcado vuelve a la vista (sin opacidad ni estado viejo)')

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Los viajes sin el cuadro largo: el estado del scroll de Lenis no es una clase de <html>')
const VIAJES = recibo<{ costoMs: Record<string, number>; antes: { viajeServiciosTuPanel1440: { cuadrosLargos: number[][] } }; despues: { viajeServiciosTuPanel1440: { cuadrosLargos: number[][]; tareaMasLargaMs: number }[] } }>('viajes.json')
const LENIS_V3 = leer('_componentes/ScrollSuaveDeV3.tsx')
const DEMOS_CSS = leer('_estilos/demos.css')
const sinClaseDeScroll = (f: typeof clasesQuietas): boolean =>
  [false, true].every((parado) => [false, true].every((trabado) => {
    const c = f({ isStopped: parado, isLocked: trabado })
    return c.includes('lenis') && c.includes('lenis-stopped') === parado && c.includes('lenis-locked') === trabado && !c.includes('lenis-scrolling') && !c.includes('lenis-smooth')
  })) &&
  LENIS_V3.includes('sinClasesDeScroll(lenis)') && DEMOS_CSS.includes(`[data-v3][${ATRIBUTO_DEL_SCROLL_EN_CURSO}] iframe {`)
afirmar(sinClaseDeScroll(clasesQuietas) && VIAJES.costoMs.claseEnHtml > 3 && VIAJES.costoMs.atributoDataEnHtml < 0.5, `5 · el estado del scroll va en \`${ATRIBUTO_DEL_SCROLL_EN_CURSO}\` (una clase en <html> costaba ${String(VIAJES.costoMs.claseEnHtml)} ms de estilo; un atributo, ${String(VIAJES.costoMs.atributoDataEnHtml)}) y los iframes siguen sin puntero mientras corre`)
controlPositivo('5 · el detector VE las clases de Lenis de siempre (lenis-scrolling y lenis-smooth)', ((e: { readonly isStopped: boolean; readonly isLocked: boolean }) => [...clasesQuietas(e), 'lenis-scrolling', 'lenis-smooth']) as typeof clasesQuietas, sinClaseDeScroll)
const viajeLimpio = (d: { cuadrosLargos: number[][] }[]): boolean => d.length >= 2 && d.every((x) => x.cuadrosLargos.length === 0)
afirmar(viajeLimpio(VIAJES.despues.viajeServiciosTuPanel1440), '  el viaje Servicios → Tu panel a 1440 sin cuadros de más de 20 ms (dos corridas con la traza)')
controlPositivo('  el detector VE el viaje de antes (27 ms al arrancar y al terminar)', [VIAJES.antes.viajeServiciosTuPanel1440, VIAJES.antes.viajeServiciosTuPanel1440], viajeLimpio)

cerrar('s63-pulido-12')
