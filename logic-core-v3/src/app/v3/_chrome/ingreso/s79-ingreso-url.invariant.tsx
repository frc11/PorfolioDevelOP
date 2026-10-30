/**
 * s79 · EL LOGIN QUE SE DESPLIEGA COMO UNA DEMO (B7) — la segunda mitad: la URL y el historial (con un historial de mentira), la
 * respuesta (la redirección baja el telón; nunca el error interno), la sala tapada, el disparador y el peso, y el contraste AA sobre
 * el negro. La primera mitad (el despliegue, la hoja y el formulario) está en `s79-ingreso.invariant.tsx`. Cada afirmación lleva su
 * control positivo; ninguna llama al login de verdad.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, razonDeContraste, titulo } from '../../_lib/__tests__/afirmar'
import { RAIZ } from '../../_lib/__tests__/s3-archivos'
import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { LIMITE_DE_LINEAS_DE_CODIGO, contarLineasDeCodigo } from '../../_lib/__tests__/s8-largos'
import { abrirLaEntrada } from '../../_lib/entrada'
import { escenaTapada, suscribirALaTapa, taparLaEscena } from '../../_lib/escena/tapa'
import { envioSimulado } from '../../_lib/formularios/enviar'
import { ENLACE_DE_LOGIN } from '../enlaces'
import {
  MARCA_DE_LA_ENTRADA,
  abrirIngreso,
  cerrarIngreso,
  conIngreso,
  esUnClicParaElLogin,
  estadoDelIngreso,
  pideIngreso,
  reiniciarIngreso,
  seguirALaUrl,
  seguirCuandoEntre,
  sinIngreso,
  soltarIngreso,
  usarEntorno,
  type Historial,
  type Ubicacion,
} from './apertura'
import { ERROR_INESPERADO, LINK_ENVIADO } from './contenido'
import { esUnaRedireccion, resolverElIngreso, type Resultado } from './envio'

const leer = (r: string): string => readFileSync(path.join(RAIZ, r), 'utf8').replace(/\r\n/g, '\n')
const V3 = 'src/app/v3'
const CARPETA = `${V3}/_chrome/ingreso`
const fuente = (r: string): string => quitarComentarios(leer(r))
const HOJA_FUENTE = fuente(`${CARPETA}/HojaDelIngreso.tsx`)

;(async () => {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('2 · La URL cambia al abrir (`?ingresar`) con pushState, y la flecha atrás cierra')

  afirmarIgual(
    [conIngreso({ pathname: '/v3', search: '', hash: '' }), conIngreso({ pathname: '/v3', search: '?envio=error', hash: '#servicios' }), sinIngreso({ pathname: '/v3', search: '?envio=error&ingresar', hash: '#servicios' }), sinIngreso({ pathname: '/v3/pagina-base', search: '?ingresar', hash: '' })],
    ['/v3?ingresar', '/v3?envio=error&ingresar#servicios', '/v3?envio=error#servicios', '/v3/pagina-base'],
    'la URL con y sin `?ingresar`: lo demás (las banderas, el ancla) se queda',
  )
  afirmar(pideIngreso('?ingresar') && pideIngreso('?a=1&ingresar') && !pideIngreso('?a=1'), '  y se lee de la consulta')

  // Un historial de mentira, con la marca en el estado como lo deja el `pushState` parcheado de next (copia el estado que se le pasa).
  interface Entrada {
    estado: unknown
    url: string
  }
  const pila: Entrada[] = [{ estado: { __NA: true }, url: '/v3' }]
  let actual = 0
  const llamadas: string[] = []
  const ubicacion = (): Ubicacion => {
    const u = new URL(pila[actual].url, 'http://x')
    return { pathname: u.pathname, search: u.search, hash: u.hash }
  }
  const historial: Historial = {
    get state() {
      return pila[actual].estado
    },
    pushState: (datos, _s, url) => {
      llamadas.push(`push ${url}`)
      pila.splice(actual + 1)
      pila.push({ estado: { ...(datos as object), __NA: true }, url })
      actual = pila.length - 1
    },
    replaceState: (datos, _s, url) => {
      llamadas.push(`replace ${url}`)
      pila[actual] = { estado: { ...((datos ?? {}) as object), __NA: true }, url }
    },
    back: () => {
      llamadas.push('back')
      actual = Math.max(0, actual - 1)
      seguirALaUrl(() => null) // el popstate
    },
  }
  usarEntorno(() => historial, ubicacion)
  const boton = { isConnected: true } as unknown as HTMLElement
  reiniciarIngreso()
  abrirIngreso(boton)
  afirmar(estadoDelIngreso().abierto && estadoDelIngreso().origen === boton && pila[actual].url === '/v3?ingresar' && (pila[actual].estado as Record<string, unknown>)[MARCA_DE_LA_ENTRADA] === true, 'abrir empuja `/v3?ingresar` (con la marca de la entrada) y sale de «Login»', llamadas.join(' · '))
  cerrarIngreso()
  afirmar(!estadoDelIngreso().abierto && estadoDelIngreso().montado && llamadas.at(-1) === 'back' && pila[actual].url === '/v3', '  «Volver al home» cierra como la flecha: vuelve a la entrada de antes (`history.back()`), sin dejar una entrada muerta; la hoja sigue montada mientras vuelve al botón')
  soltarIngreso()
  afirmar(!estadoDelIngreso().montado, '  y se desmonta cuando terminó de volver')
  // La flecha de adelante vuelve a abrir; la de atrás, cierra.
  actual = 1
  seguirALaUrl(() => boton)
  const abiertaPorLaFlecha = estadoDelIngreso().abierto
  actual = 0
  seguirALaUrl(() => boton)
  afirmar(abiertaPorLaFlecha && !estadoDelIngreso().abierto, '  la flecha de adelante lo vuelve a abrir y la de atrás lo cierra (el login sigue a la URL)')
  soltarIngreso()
  // La entrada directa con `?ingresar` (sin marca): cerrar reemplaza la URL (atrás se iría del sitio).
  pila.splice(0, pila.length, { estado: { __NA: true }, url: '/v3?ingresar' })
  actual = 0
  llamadas.length = 0
  seguirALaUrl(() => null)
  const directa = estadoDelIngreso()
  cerrarIngreso()
  afirmar(directa.abierto && directa.origen === null && llamadas.join() === 'replace /v3' && pila.length === 1, '  la entrada directa abre con el fundido (sin botón) y al cerrar reemplaza la URL: nunca un atrás que saque del sitio', llamadas.join(' · '))
  const cierraBien = (f: () => void): boolean => {
    pila.splice(0, pila.length, { estado: { __NA: true }, url: '/v3' })
    actual = 0
    llamadas.length = 0
    reiniciarIngreso()
    abrirIngreso(boton)
    f()
    return !pideIngreso(ubicacion().search) && llamadas.length === 2
  }
  afirmar(cierraBien(cerrarIngreso), '  después de cerrar, la URL ya no dice `?ingresar`')
  controlPositivo('  el detector VE un cierre que deja la URL abierta', () => {
    reiniciarIngreso()
  }, cierraBien)
  soltarIngreso()
  reiniciarIngreso()
  usarEntorno()
  afirmar(!esUnClicParaElLogin({ button: 0, metaKey: true, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false }) && !esUnClicParaElLogin({ button: 1, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false }) && esUnClicParaElLogin({ button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false }), '  con Ctrl/Cmd o la rueda, «Login» sigue siendo el enlace a `/login` (otra pestaña): sólo el clic principal lo despliega')

  const TODO = ['apertura.ts', 'Ingreso.tsx', 'IngresoAbierto.tsx', 'HojaDelIngreso.tsx', 'FormularioDelIngreso.tsx', 'FormulariosConEmail.tsx', 'CamposDelIngreso.tsx', 'envio.ts', 'acciones.ts', 'telon.ts', 'contenido.ts', 'simulacion.ts'].map((a) => `${CARPETA}/${a}`)
  const DEL_DESPLIEGUE = [`${V3}/_chrome/despliegue/despliegue.ts`, `${V3}/_chrome/despliegue/useDespliegue.ts`]
  const codigo = [...TODO, ...DEL_DESPLIEGUE].map(fuente).join('\n')
  const sinRouter = (c: string): boolean => !/router\.push|useRouter|next\/router/.test(c) && /pushState\(\{ \[MARCA_DE_LA_ENTRADA\]: true \}/.test(c)
  afirmar(sinRouter(codigo), '  con `history.pushState` (next lo integra a su router): ningún `router.push`')
  controlPositivo('  el detector VE un router.push', `${codigo}\nrouter.push('/v3?ingresar')`, sinRouter)
  const sinMoverElScroll = (c: string): boolean => !/scrollTo\(|scrollBy\(|scrollIntoView\(|scrollY\s*=/.test(c)
  afirmar(sinMoverElScroll(codigo), '  y nada mueve el scroll de la página (la hoja es fija: |Δy| = 0 al cerrar, lo mide el banco)')
  controlPositivo('  el detector VE un scroll movido', `${codigo}\nwindow.scrollTo(0, 0)`, sinMoverElScroll)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('6 · La respuesta: el error tal como lo escribe el servidor; al entrar, el telón (el fundido al panel)')

  let telones = 0
  const bajar = (): void => {
    telones += 1
  }
  const redireccion = Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;push;/dashboard;307;' })
  const r1 = await resolverElIngreso(async () => 'Email o contraseña incorrectos.', bajar)
  const r2 = await resolverElIngreso(async () => LINK_ENVIADO, bajar)
  const r3 = await resolverElIngreso(async () => {
    throw redireccion
  }, bajar)
  const r4 = await resolverElIngreso(async () => {
    throw new Error('ECONNREFUSED 10.0.0.3:5432')
  }, bajar)
  afirmarIgual([r1, r2, r3, r4, telones] as readonly unknown[], [{ estado: 'error', mensaje: 'Email o contraseña incorrectos.' }, { estado: 'link-enviado' }, { estado: 'entrando' }, { estado: 'error', mensaje: ERROR_INESPERADO }, 1], 'el error del servidor a la vista; el Magic Link, su aviso; la redirección baja el telón UNA vez y queda entrando; otra falla, el error genérico')
  const sinElInterno = (r: Resultado): boolean => r.estado === 'error' && !/ECONNREFUSED|5432/.test(r.mensaje)
  afirmar(sinElInterno(r4), '  nunca el mensaje interno')
  controlPositivo('  el detector VE el error interno expuesto', { estado: 'error', mensaje: 'ECONNREFUSED 10.0.0.3:5432' } as Resultado, sinElInterno)
  afirmar(esUnaRedireccion(redireccion) && !esUnaRedireccion(new Error('NEXT_REDIRECT')) && !esUnaRedireccion(null), '  la redirección se reconoce por el `digest` de next, no por el texto')
  const ACCIONES = fuente(`${CARPETA}/acciones.ts`)
  const lasDeSiempre = (a: string): boolean => /import \{ googleSignInAction, loginAction, magicLinkAction \} from '@\/app\/login\/actions'/.test(a) && /return loginAction\(previo, datos\)/.test(a) && /return magicLinkAction\(previo, datos\)/.test(a) && /return googleSignInAction\(\)/.test(a)
  afirmar(lasDeSiempre(ACCIONES), '  llama a lo mismo de siempre: las tres acciones de `src/app/login/actions.ts` (y `auth.ts` detrás), sin tocarlas')
  controlPositivo('  el detector VE un login propio', ACCIONES.replace('return loginAction(previo, datos)', "return fetch('/api/auth/callback')"), lasDeSiempre)
  afirmar(envioSimulado('?envio=lento', true) === null && envioSimulado('?envio=error', false) === 'error' && /if \(process\.env\.NODE_ENV === 'production'\) return 'No disponible\.'/.test(fuente(`${CARPETA}/simulacion.ts`)), '  la simulación (`?envio=lento|error`) existe sólo en desarrollo: en producción la bandera no existe y la acción simulada no hace nada')
  const TELON_TS = fuente(`${CARPETA}/telon.ts`)
  afirmar(/document\.body\.appendChild\(telon\)/.test(TELON_TS) && /window\.location\.pathname !== ruta/.test(TELON_TS) && /telon\.style\.opacity = '0'/.test(TELON_TS) && /TELON\.esperaMaximaMs/.test(TELON_TS), '  el telón: fuera de React (sobrevive al cambio de ruta), se funde cuando la ruta ya es la del panel, y nunca queda para siempre')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('7 · La escena duerme detrás del negro')

  let avisos = 0
  const soltarElOyente = suscribirALaTapa(() => {
    avisos += 1
  })
  taparLaEscena('ingreso', true)
  taparLaEscena('ingreso', true)
  taparLaEscena('prueba-del-panel', true)
  const conDos = escenaTapada()
  taparLaEscena('ingreso', false)
  const conUno = escenaTapada()
  taparLaEscena('prueba-del-panel', false)
  soltarElOyente()
  afirmar(conDos && conUno && !escenaTapada() && avisos === 2, 'la tapa tiene dueños (el login hoy, la prueba del panel mañana) y avisa sólo cuando cambia si está tapada', `${String(avisos)} avisos`)
  const ATADURA = fuente(`${V3}/_lib/escena/ataduraAlScroll.ts`)
  const duerme = (a: string): boolean =>
    /if \(escenaTapada\(\) && hayPrimerCuadro\(\)\) \{\s*if \(siguiente\(estadoRef\.current, FUERA_DE_CUADRO\) !== estadoRef\.current\) setEstado\(\(previo\) => siguiente\(previo, FUERA_DE_CUADRO\)\)\s*return\s*\}\s*const secciones = medirLasSeccionesEn/.test(a) &&
    /const desuscribirDeLaTapa = suscribirALaTapa\(pedir\)/.test(a) && /desuscribirDeLaTapa\(\)/.test(a)
  afirmar(duerme(ATADURA), '  con la sala tapada la lectura de cada cuadro la da por fuera de cuadro (`frameloop` en `never`) antes que nada, nunca antes de su primer cuadro; soltarla vuelve a leer (y reanuda por `reanudando`, sin latigazo)')
  controlPositivo('  el detector VE la atadura de antes (la escena dibuja detrás del negro)', ATADURA.replace(/if \(escenaTapada\(\) && hayPrimerCuadro\(\)\) \{[\s\S]*?\n {6}\}\n/, ''), duerme)
  const tapaLaHoja = (h: string): boolean => /fase\('abierta'\)\s*taparLaEscena\(TAPA, true\)/.test(h) && /fase\('cerrando'\)\s*taparLaEscena\(TAPA, false\)/.test(h) && /useEffect\(\(\) => \(\) => taparLaEscena\(TAPA, false\), \[\]\)/.test(h)
  afirmar(tapaLaHoja(HOJA_FUENTE), '  la hoja la tapa cuando terminó de cubrir y la suelta apenas empieza a irse (y al desmontarse)')
  controlPositivo('  el detector VE una tapa puesta al empezar a abrir', HOJA_FUENTE.replace(/fase\('abierta'\)\s*taparLaEscena\(TAPA, true\)/, "fase('abierta')"), tapaLaHoja)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('8 · El disparador y el peso: «Login» de la barra, y la hoja en su propio pedazo de código')

  const BARRA = fuente(`${V3}/_chrome/barra/BarraDelHome.tsx`)
  const disparador = (b: string): boolean => /<a href=\{ENLACE_DE_LOGIN\.destino\} data-abre-ingreso="" aria-haspopup="dialog" data-pieza="barra-login"/.test(b) && ENLACE_DE_LOGIN.destino === '/login'
  afirmar(disparador(BARRA), '«Login» de la esquina despliega el login (`data-abre-ingreso`) y sigue siendo el enlace a `/login` sin JavaScript')
  controlPositivo('  el detector VE el Login de antes', BARRA.replace(' data-abre-ingreso="" aria-haspopup="dialog"', ''), disparador)
  const montado = /import \{ Ingreso \} from '\.\/ingreso\/Ingreso'/.test(fuente(`${V3}/_chrome/ChromeDelHome.tsx`)) && /<Ingreso \/>/.test(fuente(`${V3}/_chrome/ChromeDelHome.tsx`))
  const INGRESO = fuente(`${CARPETA}/Ingreso.tsx`)
  const perezoso = (i: string, a: string): boolean => /const IngresoAbierto = lazy\(\(\) => import\('\.\/IngresoAbierto'\)\)/.test(i) && !/from '\.\/(acciones|IngresoAbierto|FormularioDelIngreso|HojaDelIngreso)'/.test(i + a)
  afirmar(montado && perezoso(INGRESO, fuente(`${CARPETA}/apertura.ts`)), '  montado en el chrome (en el home y en las páginas); la hoja, el formulario y las acciones del login viajan perezosos: no pesan en la carga del home')
  controlPositivo('  el detector VE la hoja importada de entrada', `import IngresoAbierto from './IngresoAbierto'\n${INGRESO}`, (i: string) => perezoso(i, ''))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('9 · AA sobre el negro: lo que se lee y los bordes de los campos')

  const TEMA = leer('src/app/theme-develop.css')
  const invertida = TEMA.slice(TEMA.indexOf('[data-seccion="invertida"] {'))
  const hex = (bloque: string, token: string): string => new RegExp(`--color-${token}:\\s*(#[0-9A-Fa-f]{6})`).exec(bloque)?.[1] ?? '#000000'
  const negro = hex(invertida, 'fondo')
  const textos = { tinta: hex(invertida, 'tinta'), media: hex(invertida, 'tinta-media'), tenue: hex(invertida, 'tinta-tenue'), error: hex(TEMA, 'error-texto') }
  const razones = Object.entries(textos).map(([k, v]) => [k, razonDeContraste(v, negro)] as const)
  const todasAA = (rs: readonly (readonly [string, number])[]): boolean => rs.every(([, r]) => r >= 4.5)
  afirmar(todasAA(razones) && negro === '#0E0E0E', `el texto sobre el negro (${negro}) pasa AA: ${razones.map(([k, r]) => `${k} ${r.toFixed(2)}:1`).join(' · ')}`)
  controlPositivo('  el detector VE un gris que no pasa', [['gris', razonDeContraste('#555555', negro)]] as const, todasAA)
  const borde = /--color-borde-fuerte:\s*rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/.exec(invertida)
  const compuesto = (c: RegExpExecArray | null): string => {
    if (c === null) return '#000000'
    const a = Number(c[4])
    const fondo = [0x0e, 0x0e, 0x0e]
    return `#${[1, 2, 3].map((i) => Math.round(Number(c[i]) * a + fondo[i - 1] * (1 - a)).toString(16).padStart(2, '0')).join('')}`
  }
  const razonDelBorde = razonDeContraste(compuesto(borde), negro)
  afirmar(razonDelBorde >= 3, `  el borde de las píldoras y los chips (un límite de componente) da ${razonDelBorde.toFixed(2)}:1 ≥ 3:1; el foco y el error van en la tinta (${razonDeContraste(textos.tinta, negro).toFixed(2)}:1)`)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('9b · [L6 · 80] La entrada directa (`?ingresar`) espera al preloader del sitio: el login no se despliega debajo de él')

  // La primera entrada del día: la decisión del `<head>` dejó el preloader activo; la entrada está cerrada hasta que se va.
  ;(globalThis as unknown as { window: unknown }).window = { __preloaderDelSitio: { activo: true } }
  const conUrl = (u: string): void => {
    const url = new URL(u, 'http://x')
    usarEntorno(() => ({ state: null, pushState: () => undefined, replaceState: () => undefined, back: () => undefined }), () => ({ pathname: url.pathname, search: url.search, hash: url.hash }))
  }
  conUrl('/v3?ingresar')
  reiniciarIngreso()
  const dejarDeEsperar = seguirCuandoEntre()
  const abiertoConElPreloader = estadoDelIngreso().abierto
  abrirLaEntrada()
  const abiertoAlIrseElPreloader = estadoDelIngreso().abierto
  afirmar(!abiertoConElPreloader && abiertoAlIrseElPreloader, 'con el preloader tapando, el login de la URL NO se abre; apenas el preloader se va (la entrada se abre), se despliega')
  dejarDeEsperar()
  // El control: el defecto de antes (seguir a la URL en el acto, sin esperar) se abre debajo del preloader.
  const sinEsperar = (): boolean => {
    reiniciarIngreso()
    seguirALaUrl(() => null)
    return !estadoDelIngreso().abierto
  }
  controlPositivo('  el detector ve el login que se abre en el acto (debajo del preloader)', sinEsperar, (f: () => boolean) => f())
  reiniciarIngreso()
  usarEntorno()
  delete (globalThis as unknown as { window?: unknown }).window

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('10 · Ningún archivo pasa las 300 líneas de código')

  // Los dos invariantes también: s8-montaje los mide (la carpeta es del chrome).
  const largos = [...TODO, ...DEL_DESPLIEGUE, `${V3}/_lib/escena/tapa.ts`, `${CARPETA}/s79-ingreso.invariant.tsx`, `${CARPETA}/s79-ingreso-url.invariant.tsx`].map((a) => [a, contarLineasDeCodigo(leer(a))] as const)
  afirmar(largos.every(([, n]) => n <= LIMITE_DE_LINEAS_DE_CODIGO), `${String(largos.length)} archivos, el más largo ${String(Math.max(...largos.map(([, n]) => n)))} líneas de código`)

  cerrar('s79-ingreso-url.invariant')
})()
