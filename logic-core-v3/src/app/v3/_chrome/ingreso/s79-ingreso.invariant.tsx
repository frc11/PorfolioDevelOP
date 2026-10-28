/**
 * s79 · EL LOGIN QUE SE DESPLIEGA COMO UNA DEMO (B7, noche del 2026-10-22).
 *
 * Sin navegador, la primera mitad: el despliegue (que es el de las demos: su tiempo, su curva y su reloj), el marcado de la hoja y
 * del formulario (render de servidor, con acciones de mentira: NINGUNA llamada al login de verdad) y la validación espejo del
 * servidor. La segunda (la URL, la respuesta, la sala tapada, el disparador y el AA) está en `s79-ingreso-url.invariant.tsx`. Cada
 * afirmación lleva su control positivo.
 *
 * Lo que depende del navegador (los tiempos medidos, |Δy| = 0 con «Volver» y con la flecha, el fundido al panel, la consola) lo
 * mide `scripts-carga/ingreso.ts`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { RAIZ } from '../../_lib/__tests__/s3-archivos'
import { quitarComentarios } from '../../_lib/__tests__/s3-escaneo'
import { ESCALA_DEL_FUNDIDO, MS_DEL_FUNDIDO } from '../../_secciones/trabajos/demos/apertura'
import { FASES_DEL_GENIE, MS_DEL_GENIE, correrPorTiempo, filaDelGenie, liderDelGenie, type Caja } from '../../_secciones/trabajos/demos/genie'
import { DESPLIEGUE, FASES_DEL_DESPLIEGUE, cajaDeLaPantalla, cajaDelOrigen, formaDelDespliegue, msDelTramo, opacidadDelContenido } from '../despliegue/despliegue'
import { ROTULOS_DEL_INGRESO, TITULO_DEL_INGRESO } from './contenido'
import { MENSAJES_DEL_INGRESO, validarIngreso, type AccionesDelIngreso } from './envio'
import { FormularioDelIngreso } from './FormularioDelIngreso'
import { HojaDelIngreso } from './HojaDelIngreso'

const leer = (r: string): string => readFileSync(path.join(RAIZ, r), 'utf8').replace(/\r\n/g, '\n')
const V3 = 'src/app/v3'
const CARPETA = `${V3}/_chrome/ingreso`
const fuente = (r: string): string => quitarComentarios(leer(r))

;(async () => {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('1 · El despliegue es el de las demos: el mismo tiempo, la misma curva, el mismo reloj')

  const mismosTiempos = (d: { readonly ms: number; readonly fundidoMs: number; readonly escalaDelFundido: number }): boolean =>
    d.ms === MS_DEL_GENIE && d.fundidoMs === MS_DEL_FUNDIDO && d.escalaDelFundido === ESCALA_DEL_FUNDIDO
  afirmar(mismosTiempos(DESPLIEGUE), `el tiempo del despliegue ES el del Genie de las demos (${String(MS_DEL_GENIE)} ms) y el fundido el suyo (${String(MS_DEL_FUNDIDO)} ms, escala ${String(ESCALA_DEL_FUNDIDO)})`)
  controlPositivo('  el chequeo vería un despliegue con su propio tiempo', { ...DESPLIEGUE, ms: 600 }, mismosTiempos)

  const DESPLIEGUE_TS = fuente(`${V3}/_chrome/despliegue/despliegue.ts`)
  const GANCHO = fuente(`${V3}/_chrome/despliegue/useDespliegue.ts`)
  const importado = (d: string): boolean =>
    /from '\.\.\/\.\.\/_secciones\/trabajos\/demos\/genie'/.test(d) && /from '\.\.\/menu\/silueta'/.test(d) && /from '\.\.\/\.\.\/_secciones\/trabajos\/demos\/apertura'/.test(d) && !/function filaDelGenie|\b560\b|\b200\b|0\.96/.test(d)
  afirmar(importado(DESPLIEGUE_TS), '  importado, no copiado: el Genie y el fundido de las demos y la silueta del menú, sin un número propio')
  controlPositivo('  el detector VE una copia del tiempo', `${DESPLIEGUE_TS}\nconst MS = 560`, importado)

  // La curva: cada vértice recto de la forma cae sobre el contorno de las filas del Genie de las demos (`filaDelGenie`: los bordes
  // izquierdo y derecho de fila a fila, y el de arriba y el de abajo), en todo el recorrido.
  const pantalla = cajaDeLaPantalla(1440, 900)
  const login: Caja = { x: 1318, y: 22, ancho: 74, alto: 30 }
  const lider = liderDelGenie(pantalla, login)
  interface P {
    readonly x: number
    readonly y: number
  }
  const vertices = (camino: string): P[] => [...camino.matchAll(/L (-?[\d.]+) (-?[\d.]+)/g)].map((v) => ({ x: Number(v[1]), y: Number(v[2]) }))
  const aLaRecta = (p: P, a: P, b: P): number => {
    const [dx, dy] = [b.x - a.x, b.y - a.y]
    const largo2 = dx * dx + dy * dy
    const t = largo2 === 0 ? 0 : Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / largo2))
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
  }
  const contornoDeLasDemos = (m: number): (readonly [P, P])[] => {
    const filas = Array.from({ length: 41 }, (_, k) => filaDelGenie(k / 40, m, pantalla, login, lider, FASES_DEL_DESPLIEGUE))
    const iz = filas.map((f) => ({ x: f.izquierda, y: f.y }))
    const de = filas.map((f) => ({ x: f.derecha, y: f.y }))
    const tramos = (l: P[]): (readonly [P, P])[] => l.slice(1).map((p, i) => [l[i], p] as const)
    return [...tramos(iz), ...tramos(de), [iz[0], de[0]], [iz[40], de[40]]]
  }
  const sobreElContorno = (forma: (m: number) => string): boolean =>
    [0.1, 0.25, 0.4, 0.55, 0.7, 0.85].every((m) => {
      const contorno = contornoDeLasDemos(m)
      const vs = vertices(forma(m))
      return vs.length > 10 && vs.every((v) => contorno.some(([a, b]) => aLaRecta(v, a, b) < 0.08))
    })
  afirmar(sobreElContorno((m) => formaDelDespliegue(m, pantalla, login)), '  la forma sigue la curva de las demos: cada vértice cae sobre el contorno de `filaDelGenie` (el embudo y el deslizamiento, con sus fases solapadas)', `fases: embudo ${String(FASES_DEL_GENIE.embudo.desde)}–${String(FASES_DEL_GENIE.embudo.hasta)}, deslizamiento ${String(FASES_DEL_GENIE.deslizamiento.desde)}–${String(FASES_DEL_GENIE.deslizamiento.hasta)}`)
  // El control: una forma que interpola la caja en línea recta (otra curva) no cae sobre las filas.
  const enLineaRecta = (m: number): string => {
    const x0 = login.x * m
    const x1 = pantalla.ancho + (login.x + login.ancho - pantalla.ancho) * m
    const y1 = pantalla.alto + (login.y + login.alto - pantalla.alto) * m
    return `M ${String(x0)} 0 L ${String(x1)} 0 L ${String(x1)} ${String(y1 / 2)} L ${String(x1)} ${String(y1)} L ${String(x0)} ${String(y1)} L ${String(x0)} ${String(y1 / 2)} L ${String(x0 + 1)} 1 L ${String(x0 + 2)} 2 L ${String(x0 + 3)} 3 L ${String(x0 + 4)} 4 L ${String(x0 + 5)} 5 Z`
  }
  controlPositivo('  el detector VE otra curva (la caja interpolada en línea recta)', enLineaRecta, sobreElContorno)

  // Las puntas: desplegada, la pantalla entera (sin radio); adentro, la caja del botón.
  const caja = (camino: string): { x0: number; y0: number; x1: number; y1: number } => {
    const n = [...camino.matchAll(/-?\d+(?:\.\d+)?/g)].map((v) => Number(v[0]))
    const xs = n.filter((_, i) => i % 2 === 0)
    const ys = n.filter((_, i) => i % 2 === 1)
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
  }
  const puntas = (forma: (m: number) => string): boolean => {
    const a = caja(forma(0))
    const b = caja(forma(1))
    return a.x0 === 0 && a.y0 === 0 && a.x1 === pantalla.ancho && a.y1 === pantalla.alto && Math.abs(b.x0 - login.x) < 0.2 && Math.abs(b.y0 - login.y) < 0.2 && Math.abs(b.x1 - login.x - login.ancho) < 0.2 && Math.abs(b.y1 - login.y - login.alto) < 0.2
  }
  afirmar(puntas((m) => formaDelDespliegue(m, pantalla, login)), '  sale del botón (m = 1: su caja) y termina en la pantalla entera (m = 0): «un fondo negro tapa la página»')
  controlPositivo('  el detector VE una forma que no llega a la pantalla entera', (m: number) => formaDelDespliegue(Math.max(m, 0.2), pantalla, login), puntas)

  // [C2 · 80] UNA SOLA EXPANSIÓN, sin meseta: el área cubierta por cuadro (a 60 Hz, de cerrada a abierta) sube siempre y ningún paso se
  // queda por debajo de la mitad del paso parejo mientras cubre entre el 4 y el 96 %. Con las fases de las demos el área sube, baja y
  // sigue: ésa era la traba a mitad de camino. Se prueba en los cuatro anchos, con el botón arriba a la derecha y abajo a la izquierda.
  const areaCubierta = (m: number, v: Caja, d: Caja, fases?: typeof FASES_DEL_DESPLIEGUE): number => {
    const l = liderDelGenie(v, d)
    const filas = 200
    let a = 0
    let previa = filaDelGenie(0, m, v, d, l, fases)
    for (let k = 1; k <= filas; k += 1) {
      const f = filaDelGenie(k / filas, m, v, d, l, fases)
      a += ((previa.derecha - previa.izquierda + (f.derecha - f.izquierda)) / 2) * Math.abs(f.y - previa.y)
      previa = f
    }
    return a / (v.ancho * v.alto)
  }
  const GEOMETRIAS: readonly (readonly [Caja, Caja])[] = [
    [cajaDeLaPantalla(1440, 900), { x: 1318, y: 22, ancho: 74, alto: 30 }],
    [cajaDeLaPantalla(1440, 900), { x: 100, y: 800, ancho: 80, alto: 40 }],
    [cajaDeLaPantalla(1024, 768), { x: 900, y: 20, ancho: 48, alto: 48 }],
    [cajaDeLaPantalla(768, 1024), { x: 650, y: 20, ancho: 48, alto: 48 }],
    [cajaDeLaPantalla(390, 844), { x: 320, y: 16, ancho: 48, alto: 48 }],
  ]
  const sinMeseta = (fases: typeof FASES_DEL_DESPLIEGUE): boolean =>
    GEOMETRIAS.every(([v, d]) => {
      const cuadros = Math.round((DESPLIEGUE.ms / 1000) * 60)
      let previa = areaCubierta(1, v, d, fases)
      for (let i = 1; i <= cuadros; i += 1) {
        const a = areaCubierta(1 - i / cuadros, v, d, fases)
        if (a < previa - 1e-9) return false
        if (previa > 0.04 && a < 0.96 && (a - previa) * cuadros < 0.5) return false
        previa = a
      }
      return true
    })
  afirmar(sinMeseta(FASES_DEL_DESPLIEGUE), '  una sola expansión continua: el área cubierta por cuadro sube siempre y sin meseta (1440, 1024, 768 y 390; botón arriba o abajo)')
  controlPositivo('  el detector VE la traba de las fases de las demos (el área sube, baja y sigue)', FASES_DEL_GENIE, sinMeseta)
  controlPositivo('  y una pausa a mitad (el área quieta unos cuadros)', { embudo: { desde: 0, hasta: 0.2 }, deslizamiento: { desde: 0.8, hasta: 1 } }, sinMeseta)

  // El reloj: el de las demos, lineal en el tiempo y de punta a punta en sus 560 ms.
  const cuadros: FrameRequestCallback[] = []
  globalThis.requestAnimationFrame = ((f: FrameRequestCallback) => cuadros.push(f)) as typeof requestAnimationFrame
  globalThis.cancelAnimationFrame = (() => undefined) as typeof cancelAnimationFrame
  const muestras: { t: number; m: number }[] = []
  let terminado = -1
  correrPorTiempo(DESPLIEGUE.ms, (t) => muestras.push({ t, m: 1 - t / DESPLIEGUE.ms }), () => {
    terminado = muestras.length
  })
  for (let ahora = 1000; cuadros.length > 0 && ahora < 3000; ahora += 1000 / 60) cuadros.shift()?.(ahora)
  const ultimo = muestras.at(-1)
  afirmar(ultimo?.t === DESPLIEGUE.ms && ultimo.m === 0 && terminado === muestras.length && muestras.every((s, i) => i === 0 || s.t > muestras[i - 1].t), `  el reloj: ${String(muestras.length)} cuadros a 60 Hz, el último exacto en ${String(DESPLIEGUE.ms)} ms y desplegado (m = 0), y recién ahí termina`)
  afirmar(/requestAnimationFrame\(\(\) => \{\s*cancelador\.current = correrPorTiempo\(ms,/.test(GANCHO) && /correrPorTiempo/.test(DESPLIEGUE_TS), '  y arranca UN CUADRO DESPUÉS del que pinta la primera pose, como la ventana de las demos y el menú')
  afirmarIgual([msDelTramo(1, 0, true), msDelTramo(0.25, 1, true), msDelTramo(1, 0, false)], [MS_DEL_GENIE, MS_DEL_GENIE * 0.75, MS_DEL_FUNDIDO], '  cerrar a mitad de camino tarda lo que falta, no el entero (y el fundido, el suyo)')
  afirmarIgual([opacidadDelContenido(1), opacidadDelContenido(0.5), opacidadDelContenido(0)], [0, 0.5, 1], '  lo de adentro aparece con el avance («al mismo tiempo»): nada antes de salir, todo al terminar')
  afirmar(cajaDelOrigen({ left: 1318, top: 22, width: 74, height: 30 }, 1440, 900) !== null && cajaDelOrigen({ left: 0, top: 0, width: 0, height: 0 }, 1440, 900) === null && cajaDelOrigen({ left: -200, top: 10, width: 74, height: 30 }, 1440, 900) === null, '  sin un botón a la vista (escondido o fuera del cuadro) no hay de dónde salir: el fundido')
  const sonidos = (g: string): boolean => /sonar\('abre'\)/.test(g) && /sonar\('cierra'\)/.test(g)
  afirmar(sonidos(GANCHO) && sonidos(fuente(`${V3}/_secciones/trabajos/demos/VentanaDeDemo.tsx`)) && /from '\.\.\/\.\.\/_lib\/sonido\/bus'/.test(GANCHO), '  los sonidos de abrir y cerrar son los de las demos, por el bus (con el sonido apagado no suenan: el mute)')
  controlPositivo('  el detector VE un sonido propio', GANCHO.replace("sonar('cierra')", "sonar('tic')"), sonidos)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('3 · La hoja: un diálogo de pantalla completa, con el título, «Probá el panel» y «Volver al home»')

  const formularioDePrueba = <form data-prueba="" />
  const HOJA = renderToStaticMarkup(
    <HojaDelIngreso abierto origen={null}>
      {formularioDePrueba}
    </HojaDelIngreso>,
  )
  const esDialogo = (h: string): boolean => /role="dialog"/.test(h) && /aria-modal="true"/.test(h) && /aria-labelledby="ingreso-titulo"/.test(h) && h.includes(`id="ingreso-titulo"`) && h.includes(`>${TITULO_DEL_INGRESO}</h2>`)
  afirmar(esDialogo(HOJA), `un diálogo modal con nombre: «${TITULO_DEL_INGRESO}»`)
  controlPositivo('  el chequeo vería una hoja sin rol de diálogo', HOJA.replace('role="dialog"', ''), esDialogo)
  afirmar(/data-pieza="ingreso"[^>]*class="fixed inset-0 /.test(HOJA) && /data-seccion="invertida" data-parte="fondo" aria-hidden="true" class="bg-fondo absolute inset-0"/.test(HOJA), '  la pantalla entera en todos los anchos (también en el teléfono): el fondo es el negro de la sala invertida')
  afirmar((HOJA.match(/style="opacity:0"/g) ?? []).length === 2, '  el fondo y lo de adentro arrancan invisibles: nada se ve antes de la primera pose del despliegue')
  const probar = /data-parte="probar-el-panel"><button type="button"[^>]*data-pieza="cta"/
  const sinEnlace = (h: string): boolean => probar.test(h) && !/data-parte="probar-el-panel"><a /.test(h) && h.includes(ROTULOS_DEL_INGRESO.probar)
  afirmar(sinEnlace(HOJA), '  «Probá el panel» (C1) está: un botón visible que todavía no hace nada, sin enlace roto')
  controlPositivo('  el detector VE un «Probá el panel» que es un enlace', HOJA.replace(probar, '<span data-parte="probar-el-panel"><a href="#">'), sinEnlace)
  const volver = (h: string): boolean => new RegExp(`<button type="button" data-parte="volver"[^>]*>${ROTULOS_DEL_INGRESO.volver}</button>`).test(h) && h.indexOf('data-parte="volver"') < h.indexOf('probar-el-panel')
  afirmar(volver(HOJA), '  y abajo, «Volver al home» a la izquierda de «Probá el panel» [C2 · 80]')
  controlPositivo('  el detector VE «Volver al home» a la derecha', HOJA.replace(/(<button type="button" data-parte="volver"[\s\S]*?<\/button>)([\s\S]*?)(<span data-parte="probar-el-panel">[\s\S]*?<\/span>)/, '$3$2$1'), volver)
  const HOJA_FUENTE = fuente(`${CARPETA}/HojaDelIngreso.tsx`)
  afirmar(/useDialogo\(contenido, alPedirElCierre\)/.test(HOJA_FUENTE) && /alPedirElCierre = cerrarIngreso/.test(HOJA_FUENTE) && /onClick=\{alPedirElCierre\}/.test(HOJA_FUENTE), '  Esc y «Volver al home» cierran como la flecha (`cerrarIngreso`); el foco atrapado y la página quieta: el `useDialogo` de las demos')
  afirmar(/data-lenis-prevent=""/.test(HOJA) && /overflow-y-auto overscroll-contain/.test(HOJA), '  la rueda no llega a la página (Lenis la ignora) y lo de adentro se desplaza adentro si no entra')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('4 · El formulario de siempre (cliente y admin), con la arquitectura de los formularios del sitio')

  const DE_MENTIRA: AccionesDelIngreso = { conClave: async () => null, conLink: async () => null, conOlvido: async () => null, conGoogle: async () => undefined }
  const CON_CLAVE = renderToStaticMarkup(<FormularioDelIngreso acciones={DE_MENTIRA} alEntrar={() => undefined} />)
  const CON_LINK = renderToStaticMarkup(<FormularioDelIngreso acciones={DE_MENTIRA} alEntrar={() => undefined} modoInicial="link" />)
  const ACCIONES_DEL_LOGIN = leer('src/app/login/actions.ts')
  const nombres = (h: string, n: readonly string[]): boolean => n.every((x) => h.includes(`name="${x}"`) && ACCIONES_DEL_LOGIN.includes(`formData.get('${x}')`))
  afirmar(nombres(CON_CLAVE, ['email', 'password']) && nombres(CON_LINK, ['magic-email']), 'los campos llevan los nombres que leen las acciones de siempre (`email`, `password`, `magic-email`)')
  controlPositivo('  el detector VE un campo con otro nombre', CON_CLAVE.replace('name="password"', 'name="clave"'), (h: string) => nombres(h, ['email', 'password']))
  afirmar(CON_CLAVE.includes('type="password"') && /autocomplete="current-password"/i.test(CON_CLAVE) && CON_CLAVE.includes(`aria-label="${ROTULOS_DEL_INGRESO.mostrarClave}"`), '  la contraseña es un campo de contraseña, con su ojo (mostrar u ocultar) del login de siempre')
  afirmar(CON_CLAVE.includes(ROTULOS_DEL_INGRESO.google) && CON_CLAVE.includes('data-pieza="ingreso-google"') && /aria-pressed="true"[^>]*>Contraseña</.test(CON_CLAVE) && /aria-pressed="false"[^>]*>Magic Link</.test(CON_CLAVE), '  todos los inicios de sesión: Google, la contraseña y el Magic Link (dos chips, como los del contacto)')
  const pildoras = (h: string): number => (h.match(/data-foco="pastilla"/g) ?? []).length
  afirmar(pildoras(CON_CLAVE) === 2 && pildoras(CON_LINK) === 1, '  los campos son las píldoras redondeadas del sitio, con su foco (`data-foco="pastilla"`)')
  const sinAccionDelForm = (h: string): boolean => !/<form[^>]* action=/.test(h) && /<form[^>]*novalidate/i.test(h)
  afirmar(sinAccionDelForm(CON_CLAVE) && sinAccionDelForm(CON_LINK), '  `noValidate` y la validación propia; el envío NO es la `action` del form (React lo vaciaría): lo escrito se queda con un error')
  controlPositivo('  el detector VE un form con su action', CON_CLAVE.replace('<form', '<form action="javascript:x"'), sinAccionDelForm)
  afirmar(/role="alert"/.test(CON_CLAVE) && /data-pieza="cta"/.test(CON_CLAVE) && CON_CLAVE.includes(ROTULOS_DEL_INGRESO.ingresar), '  la región del error existe desde el principio y el envío es el CTA del sitio')
  afirmar(/<Carga tamano="medio" etiqueta=\{ROTULOS_DEL_INGRESO\.ingresando\} \/>/.test(fuente(`${CARPETA}/FormulariosConEmail.tsx`)) && /conDuracionMinima\(acciones\.conClave\(null, envio\)\)/.test(fuente(`${CARPETA}/FormulariosConEmail.tsx`)), '  mientras procesa, el logo de carga de develOP (con la espera mínima: no parpadea)')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('5 · La validación del cliente es la del servidor, con sus mismos mensajes')

  const espejo = (m: Readonly<Record<string, string>>): boolean => Object.values(m).every((t) => ACCIONES_DEL_LOGIN.includes(`'${t}'`))
  afirmar(espejo(MENSAJES_DEL_INGRESO), 'cada mensaje del cliente es, letra por letra, uno de `loginAction` / `magicLinkAction`')
  controlPositivo('  el detector VE un mensaje inventado', { ...MENSAJES_DEL_INGRESO, emailFalta: 'Poné tu email.' }, espejo)
  afirmarIgual(
    [validarIngreso({ email: '', clave: '' }), validarIngreso({ email: 'sinarroba', clave: '1234567' }), validarIngreso({ email: ' Ana@Ejemplo.com ', clave: '12345678' })],
    [{ email: MENSAJES_DEL_INGRESO.emailFalta, clave: MENSAJES_DEL_INGRESO.claveFalta }, { email: MENSAJES_DEL_INGRESO.emailInvalido, clave: MENSAJES_DEL_INGRESO.claveLargo }, {}],
    '  vacío, mal y bien: las mismas reglas (el email recortado, con `@`; la contraseña de 8 a 128)',
  )


  cerrar('s79-ingreso.invariant')
})()
