/**
 * s79 · EL LOGIN, COLA 2 TAREA 80 — lo que se prueba sin navegador: el marcado de la hoja (título centrado, «Volver al home» a la
 * izquierda y «Probá el panel» a la derecha, la flecha para salir con su nombre), los botones del formulario (los del sitio, no la
 * barra larga: «Ingresar» a la derecha de «¿Olvidaste tu contraseña?», «Enviar Magic Link» abajo a la derecha), el error del
 * servidor en el formato del sitio, los chips y Google quietos mientras algo viaja (el Magic Link durante la carga dejaba la
 * pantalla vacía), la vuelta de la caché de ida y vuelta (`pageshow` persistido: el login abierto y sin «cargando») y la regla del
 * foco de la carga. La expansión sin meseta está en `s79-ingreso.invariant.tsx` (sección 2). Cada afirmación lleva su control.
 *
 * Lo que depende del navegador (la curva medida por cuadro, la vuelta real desde Google, el rectángulo del loader, los 200 ms del
 * fundido a 390) lo mide `scripts-carga/ingreso.ts`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { RAIZ } from '../../_lib/__tests__/s3-archivos'
import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { ROTULOS_DEL_INGRESO } from './contenido'
import { abrirIngreso, estadoDelIngreso, reiniciarIngreso, usarEntorno, volverDeLaCache, type Historial, type Ubicacion } from './apertura'
import type { AccionesDelIngreso } from './envio'
import { FormularioDelIngreso } from './FormularioDelIngreso'
import { HojaDelIngreso } from './HojaDelIngreso'

const leer = (r: string): string => readFileSync(path.join(RAIZ, r), 'utf8').replace(/\r\n/g, '\n')
const CARPETA = 'src/app/v3/_chrome/ingreso'
const fuente = (r: string): string => quitarComentarios(leer(r))

;(async () => {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('11 · La hoja: título centrado, abajo «Volver» a la izquierda y «Probá el panel» a la derecha, y la flecha para salir')

  const HOJA = renderToStaticMarkup(
    <HojaDelIngreso abierto origen={null}>
      <form />
    </HojaDelIngreso>,
  )
  const centrado = (h: string): boolean => /<h2 id="ingreso-titulo" class="[^"]*\btext-center\b/.test(h)
  afirmar(centrado(HOJA), 'el título «Iniciá sesión para entrar al panel» está centrado')
  controlPositivo('  el detector VE el título alineado a la izquierda', HOJA.replace('text-center ', ''), centrado)

  const filaDeAbajo = (h: string): boolean => {
    const fila = /<div class="[^"]*\bborder-t\b[^"]*">([\s\S]*?<\/span>)<\/div>/.exec(h)
    return fila !== null && /\bjustify-between\b/.test(fila[0]) && fila[1].indexOf('data-parte="volver"') >= 0 && fila[1].indexOf('data-parte="volver"') < fila[1].indexOf('data-parte="probar-el-panel"')
  }
  afirmar(filaDeAbajo(HOJA), '  abajo, en un mismo renglón: «Volver al home» a la izquierda y «Probá el panel» a la derecha')
  controlPositivo('  el detector VE la columna de antes (centrada, una arriba de la otra)', HOJA.replace('justify-between', 'flex-col items-center'), filaDeAbajo)

  const flecha = (h: string): boolean => /<button type="button" data-parte="flecha-de-salida" aria-label="Cerrar"/.test(h) && /stroke-width="1\.5"/.test(h)
  afirmar(flecha(HOJA) && ROTULOS_DEL_INGRESO.cerrar === 'Cerrar', '  arriba, una flecha para salir con su `aria-label` «Cerrar» (el icono solo, trazo 1,5)')
  controlPositivo('  el detector VE una flecha sin nombre accesible', HOJA.replace(' aria-label="Cerrar"', ''), flecha)
  const FLECHA = fuente(`${CARPETA}/FlechaDeSalida.tsx`)
  const HOJA_FUENTE = fuente(`${CARPETA}/HojaDelIngreso.tsx`)
  const haceLoMismo = (h: string, f: string): boolean => /<FlechaDeSalida origen=\{origen\} alTocar=\{alPedirElCierre\} \/>/.test(h) && /onClick=\{alPedirElCierre\}/.test(h) && /onClick=\{alTocar\}/.test(f)
  afirmar(haceLoMismo(HOJA_FUENTE, FLECHA), '  y hace lo mismo que «Volver al home» (`alPedirElCierre`: Esc, la flecha atrás y los dos botones cierran igual)')
  controlPositivo('  el detector VE una flecha que no cierra', FLECHA.replace('onClick={alTocar}', ''), (f: string) => haceLoMismo(HOJA_FUENTE, f))
  const enSuLugar = (f: string): boolean => /origen \?\? botonDelIngreso\(\)/.test(f) && /getBoundingClientRect\(\)/.test(f) && /r\.left \+ r\.width \/ 2/.test(f) && /setProperty\('left', /.test(f) && /setProperty\('top', /.test(f)
  afirmar(enSuLugar(FLECHA), '  en el mismo lugar donde estaba «Login»: centrada en su caja (la del botón de donde sale, o la del de la página)')
  controlPositivo('  el detector VE una flecha que no mide el botón', FLECHA.replace('getBoundingClientRect()', 'toString()'), enSuLugar)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('12 · Los botones del formulario son los del sitio; los errores, en el formato del sitio')

  const DE_MENTIRA: AccionesDelIngreso = { conClave: async () => null, conLink: async () => null, conGoogle: async () => undefined }
  const CON_CLAVE = renderToStaticMarkup(<FormularioDelIngreso acciones={DE_MENTIRA} alEntrar={() => undefined} />)
  const CON_LINK = renderToStaticMarkup(<FormularioDelIngreso acciones={DE_MENTIRA} alEntrar={() => undefined} modoInicial="link" />)
  const sinBarra = (h: string): boolean => /data-pieza="cta" data-variante="linea"/.test(h) && !/data-variante="bloque"/.test(h)
  afirmar(sinBarra(CON_CLAVE) && sinBarra(CON_LINK), '«Ingresar» y «Enviar Magic Link» son el botón del sitio (la variante de línea), no la barra larga de abajo')
  controlPositivo('  el detector VE la barra larga', CON_CLAVE.replace('data-variante="linea"', 'data-variante="bloque"'), sinBarra)

  const aLaDerechaDelOlvido = (h: string): boolean => {
    const fila = /<div class="[^"]*\bjustify-between\b[^"]*">([\s\S]*?)<\/div>/.exec(h)
    return fila !== null && fila[1].indexOf(ROTULOS_DEL_INGRESO.olvido) >= 0 && fila[1].indexOf(ROTULOS_DEL_INGRESO.olvido) < fila[1].indexOf('data-pieza="cta"')
  }
  afirmar(aLaDerechaDelOlvido(CON_CLAVE), '  «Ingresar» va a la derecha de «¿Olvidaste tu contraseña?», en el mismo renglón')
  controlPositivo('  el detector VE el botón antes del enlace', CON_CLAVE.replace(/(<a href="[^"]*forgot-password"[\s\S]*?<\/a>)(<button[\s\S]*?<\/button>)/, '$2$1'), aLaDerechaDelOlvido)
  const abajoALaDerecha = (h: string): boolean => /<div class="flex justify-end[^"]*"><button type="submit" data-pieza="cta"/.test(h)
  afirmar(abajoALaDerecha(CON_LINK), '  y «Enviar Magic Link», abajo a la derecha')
  controlPositivo('  el detector VE el botón a la izquierda', CON_LINK.replace('flex justify-end', 'flex justify-start'), abajoALaDerecha)

  const CAMPOS = fuente(`${CARPETA}/FormulariosConEmail.tsx`)
  const GOOGLE = fuente(`${CARPETA}/FormularioDelIngreso.tsx`)
  const enElFormatoDelSitio = (c: string, g: string): boolean => /<ErrorDelCampo id=\{id\} texto=\{texto\} \/>/.test(c) && !/error-texto/.test(c) && !/error-texto/.test(g)
  afirmar(enElFormatoDelSitio(CAMPOS, GOOGLE), '  el error del servidor y el de Google tienen el formato de los errores de los campos del sitio, sin un rojo propio')
  controlPositivo('  el detector VE el rojo de antes', `${CAMPOS}\nconst c = 'text-error-texto'`, (c: string) => enElFormatoDelSitio(c, GOOGLE))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('13 · Con un envío en curso, nada cambia de manera de entrar (el Magic Link durante la carga dejaba la pantalla vacía)')

  const quieto = (g: string, c: string): boolean =>
    /disabled=\{ocupado\}/.test(g) &&
    /if \(!ocupado\) setModo\(m\)/.test(g) &&
    /disabled=\{ocupado \|\| bloqueado\}/.test(g) &&
    /alOcupar=\{setOcupado\}/.test(g) &&
    /useAvisarOcupado\(ocupado, alOcupar\)/.test(c) &&
    /useAvisarOcupado\(enviando, alOcupar\)/.test(c)
  afirmar(quieto(GOOGLE, CAMPOS), 'los chips (Contraseña y Magic Link) y Google esperan mientras la contraseña, el Magic Link o Google viajan')
  controlPositivo('  el detector VE unos chips que se pueden tocar con la carga', GOOGLE.replace('disabled={ocupado}', ''), (g: string) => quieto(g, CAMPOS))
  controlPositivo('  y un formulario que no avisa que está ocupado', CAMPOS.replace('useAvisarOcupado(enviando, alOcupar)', ''), (c: string) => quieto(GOOGLE, c))
  afirmar(!/aria-pressed="[a-z]+" disabled/.test(CON_CLAVE) && (CON_CLAVE.match(/data-pieza="modo-del-ingreso"/g) ?? []).length === 2, '  en reposo, los chips funcionan (el bloqueo es sólo mientras viaja)')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('14 · La vuelta de la caché de ida y vuelta (de Google): el login abierto y sin «cargando»')

  interface Entrada {
    estado: unknown
    url: string
  }
  const pila: Entrada[] = [{ estado: { __NA: true }, url: '/v3' }]
  let actual = 0
  const ubicacion = (): Ubicacion => {
    const u = new URL(pila[actual].url, 'http://x')
    return { pathname: u.pathname, search: u.search, hash: u.hash }
  }
  const historial: Historial = {
    get state() {
      return pila[actual].estado
    },
    pushState: (datos, _s, url) => {
      pila.splice(actual + 1)
      pila.push({ estado: { ...(datos as object), __NA: true }, url })
      actual = pila.length - 1
    },
    replaceState: (datos, _s, url) => {
      pila[actual] = { estado: { ...((datos ?? {}) as object), __NA: true }, url }
    },
    back: () => {
      actual = Math.max(0, actual - 1)
    },
  }
  usarEntorno(() => historial, ubicacion)
  const boton = { isConnected: true } as unknown as HTMLElement
  reiniciarIngreso()
  abrirIngreso(boton)
  const antes = estadoDelIngreso().vuelta
  volverDeLaCache(() => boton)
  afirmar(estadoDelIngreso().abierto && estadoDelIngreso().montado && estadoDelIngreso().vuelta === antes + 1, 'al volver de la caché con `?ingresar` en la URL, el login sigue abierto y la `key` del formulario sube (se arma de nuevo: sin «cargando»)')
  volverDeLaCache(() => boton)
  afirmar(estadoDelIngreso().abierto && estadoDelIngreso().vuelta === antes + 2, '  cada vuelta lo arma de nuevo')
  // Sin `?ingresar` en la URL (la entrada de atrás), el login sigue a la URL y se cierra.
  actual = 0
  volverDeLaCache(() => boton)
  afirmar(!estadoDelIngreso().abierto, '  y si la URL de la entrada ya no lo pide, se cierra (el estado del login vive en la URL)')
  reiniciarIngreso()
  usarEntorno()

  const APERTURA = fuente(`${CARPETA}/apertura.ts`)
  const INGRESO = fuente(`${CARPETA}/Ingreso.tsx`)
  const ABIERTO = fuente(`${CARPETA}/IngresoAbierto.tsx`)
  const TELON = fuente(`${CARPETA}/telon.ts`)
  const oyePageshow = (a: string): boolean => /addEventListener\('pageshow', alVolverDeLaCache\)/.test(a) && /removeEventListener\('pageshow', alVolverDeLaCache\)/.test(a) && /if \(e\.persisted\) volverDeLaCache\(botonDelIngreso\)/.test(a)
  afirmar(oyePageshow(APERTURA), '  `pageshow` con `persisted` dispara la vuelta (y el oyente se retira al desmontar)')
  controlPositivo('  el detector VE una vuelta que no mira `persisted`', APERTURA.replace('if (e.persisted) ', ''), oyePageshow)
  const limpia = (a: string, i: string, ab: string, t: string): boolean =>
    /quitarElTelon\(\)/.test(a) && /vuelta: estado\.vuelta \+ 1/.test(a) && /vuelta=\{vuelta\}/.test(i) && /<FormularioDelIngreso key=\{vuelta\}/.test(ab) && /export function quitarElTelon/.test(t)
  afirmar(limpia(APERTURA, INGRESO, ABIERTO, TELON), '  la vuelta quita el telón de la ida y rearma el formulario con `key={vuelta}`: Google, la contraseña y el Magic Link vuelven a reposo')
  controlPositivo('  el detector VE un formulario que conserva el «cargando»', ABIERTO.replace('key={vuelta} ', ''), (ab: string) => limpia(APERTURA, INGRESO, ab, TELON))

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('15 · El rectángulo alrededor del loader y el fundido a 390')

  const FOCO = leer('src/app/v3/_estilos/foco.css').replace(/\/\*[\s\S]*?\*\//g, '')
  const sinRectangulo = (css: string): boolean => /\[data-v3\]\[data-v3\] \[data-parte="carga"\]:focus-visible \{\s*outline-color: transparent;\s*\}/.test(css) && !/outline:\s*none|outline-style:\s*none|outline-width:\s*0/.test(css)
  afirmar(sinRectangulo(FOCO), 'la carga (que recibe el foco por código, para anunciarla) no dibuja el anillo de foco; la hoja sigue sin un `outline: none` (el foco del teclado se queda donde sí hace falta)')
  controlPositivo('  el detector VE la regla ausente', FOCO.replace('[data-parte="carga"]:focus-visible', '[data-parte="otra"]:focus-visible'), sinRectangulo)
  const tapaEnElFundido = (h: string): boolean => /const TAPAR_AL_EMPEZAR_EL_FUNDIDO = true/.test(h) && /fase\('abriendo'\)\s*if \(TAPAR_AL_EMPEZAR_EL_FUNDIDO && desde === null\) taparLaEscena\(TAPA, true\)/.test(h)
  afirmar(tapaEnElFundido(HOJA_FUENTE), '  en la entrada directa (sin botón: el fundido de 200 ms) la escena duerme desde que arranca, para que la carga de la página no se lleve los cuadros del fundido (bandera `TAPAR_AL_EMPEZAR_EL_FUNDIDO`)')
  controlPositivo('  el detector VE la bandera apagada', HOJA_FUENTE.replace('TAPAR_AL_EMPEZAR_EL_FUNDIDO = true', 'TAPAR_AL_EMPEZAR_EL_FUNDIDO = false'), tapaEnElFundido)

  cerrar('s79-ingreso-c2.invariant')
})()

