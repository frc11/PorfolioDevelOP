/**
 * s78-c2-51 · [C2-51] EL RECOMENDADOR DE SERVICIOS (cola 2, 2026-10-23) — la lógica sobre las 125 combinaciones (siempre dos soluciones
 * distintas, determinística, el desempate documentado), los textos tal cual 05-TEXTOS, el flujo por etapas, la salida de abajo sin
 * gatillo de la máquina, la REGLA DE ALTURAS desde 1024 y lo que se renderiza (el servidor: la primera etapa; el resultado y el
 * contacto, montados a mano). Cada afirmación con su control positivo. El recorrido en el navegador: `scripts-carga/recomendador.ts`.
 */

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { GESTO_QUIETO } from '../../_componentes/gatillos/rueda'
import { PIE_DEL_ULTIMO_PX, aterrizajeDelPasoEnElTramo, decidirLaRueda, decidirLaTecla, salidaLibre, type ReglaDeGatillos } from '../../_componentes/gatillos/maquina'
import { seccionDe } from '../../_secciones/_contrato/forma'
import { ALTO_DE_LA_PISTA_ANCHA, ALTO_MINIMO_DE_LA_PISTA } from '../../_secciones/servicios/escenario/EscenarioDeServicios'
import { RENGLONES_DEL_TITULO_DEL_RECOMENDADOR } from '../../_secciones/servicios/recomendador/EncabezadoDelRecomendador'
import { INICIO_DEL_RECOMENDADOR, avanzar, type AccionDelRecomendador, type EstadoDelRecomendador } from '../../_secciones/servicios/recomendador/flujo'
import {
  IDS_DE_SOLUCION, PREGUNTAS, SOLUCIONES, TEXTOS_DEL_RECOMENDADOR, analisis, enMinuscula, mensajeDelContacto, ordenDeLasSoluciones, puntajes, recomendar, rotuloDeLaPagina,
  solucion, todasLasRespuestas, type IdDeSolucion, type Recomendacion, type Respuestas,
} from '../../_secciones/servicios/recomendador/logica'
import { PROCESANDO_MS } from '../../_secciones/servicios/recomendador/Procesando'
import { Recomendador } from '../../_secciones/servicios/recomendador/Recomendador'
import { ResultadoDelRecomendador } from '../../_secciones/servicios/recomendador/ResultadoDelRecomendador'
import { Servicios } from '../../_secciones/servicios/Servicios'
import { PANTALLAS_DE_LA_TABLA, tramoDeServicios } from '../../_secciones/servicios/tramoDeServicios'
import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const RAIZ = process.cwd()
const V3 = path.join(RAIZ, 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const CARPETA = '_secciones/servicios/recomendador'
const FUENTES = readdirSync(path.join(V3, CARPETA)).filter((a) => /\.tsx?$/.test(a)).map((a) => ({ a, texto: leer(`${CARPETA}/${a}`) }))
const TEXTOS_DE_LA_COLA = readFileSync(path.join(RAIZ, 'docs/cola/2026-10-23/05-TEXTOS.md'), 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La lógica sobre las 125 combinaciones')

const TODAS = todasLasRespuestas()
afirmar(TODAS.length === 125 && new Set(TODAS.map((r) => r.join())).size === 125, 'las 125 combinaciones (5 × 5 × 5), todas distintas')

/** El orden que dice el desempate, verificado de a pares (independiente de cómo lo calcule `ordenDeLasSoluciones`). */
function ordenBien(r: Respuestas, orden: readonly IdDeSolucion[]): boolean {
  const total = puntajes(r)
  const primera = PREGUNTAS[0].opciones[r[0]]?.puntos ?? {}
  return orden.length === 5 && new Set(orden).size === 5 && orden.every((x, i) => {
    const y = orden[i + 1]
    if (y === undefined) return true
    if (total[x] !== total[y]) return total[x] > total[y]
    if ((primera[x] ?? 0) !== (primera[y] ?? 0)) return (primera[x] ?? 0) > (primera[y] ?? 0)
    return IDS_DE_SOLUCION.indexOf(x) < IDS_DE_SOLUCION.indexOf(y)
  })
}
type Recomendar = (r: Respuestas) => Recomendacion
const recomiendaBien = (f: Recomendar): boolean =>
  TODAS.every((r) => {
    const rec = f(r)
    const otra = f(r)
    const orden = ordenDeLasSoluciones(r)
    const total = puntajes(r)
    return rec.a !== rec.b && rec.a === otra.a && rec.b === otra.b && total[rec.a] > 0 && total[rec.b] > 0 && rec.a === orden[0] && rec.b === orden[1] && ordenBien(r, orden)
  })
afirmar(recomiendaBien(recomendar), 'en las 125: A y B distintas, las dos con puntos, determinística (dos veces lo mismo) y en el orden del desempate (total, lo sumado en la pregunta 1, la tabla)')
const sinLaPrimera: Recomendar = (r) => {
  const total = puntajes(r)
  const [a, b] = [...IDS_DE_SOLUCION].sort((x, y) => total[y] - total[x] || IDS_DE_SOLUCION.indexOf(x) - IDS_DE_SOLUCION.indexOf(y))
  return { a: a ?? 'pagina', b: b ?? 'tienda' }
}
controlPositivo('  el detector ve el desempate sin la pregunta 1 (sólo la tabla)', sinLaPrimera, recomiendaBien)
controlPositivo('  el detector ve una recomendación que repite la solución', ((r: Respuestas) => ({ a: recomendar(r).a, b: recomendar(r).a })) as Recomendar, recomiendaBien)
let vuelta = 0
controlPositivo('  el detector ve una recomendación que cambia entre dos llamadas', ((r: Respuestas) => (vuelta++ % 2 === 0 ? recomendar(r) : { a: recomendar(r).b, b: recomendar(r).a })) as Recomendar, recomiendaBien)
const empates = TODAS.filter((r) => {
  const t = puntajes(r)
  const o = ordenDeLasSoluciones(r)
  return t[o[1] ?? 'pagina'] === t[o[2] ?? 'pagina'] || t[o[0] ?? 'pagina'] === t[o[1] ?? 'pagina']
}).length
afirmar(empates > 0, `el desempate trabaja de verdad: ${String(empates)} de las 125 tienen un empate en el primero o el segundo lugar`)

// Casos a mano (la tabla de 05-TEXTOS, sumada en la cabeza): el desempate por la pregunta 1 y el de la tabla.
const CASOS: readonly (readonly [Respuestas, IdDeSolucion, IdDeSolucion, string])[] = [
  [[0, 0, 0], 'pagina', 'chatbot', 'página 6; tienda y chatbot 2: gana chatbot, que sumó 1 en la pregunta 1'],
  [[4, 3, 0], 'automatizacion', 'gestion', 'automatización y gestión 3: gana automatización (3 en la pregunta 1); con la tabla sola ganaría gestión'],
  [[4, 4, 2], 'automatizacion', 'gestion', 'automatización 7, gestión 3'],
  [[1, 1, 1], 'tienda', 'chatbot', 'tienda 7, chatbot 3'],
  [[3, 3, 3], 'gestion', 'automatizacion', 'gestión 7, automatización 2'],
]
const casosBien = (f: Recomendar): boolean => CASOS.every(([r, a, b]) => f(r).a === a && f(r).b === b)
afirmar(casosBien(recomendar), `los ${String(CASOS.length)} casos sumados a mano: ${CASOS.map((c) => c[3]).join(' · ')}`)
controlPositivo('  el detector ve el desempate de la tabla sola en el caso que los separa', sinLaPrimera, casosBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · Los textos, tal cual 05-TEXTOS (y las frases armadas)')

const textosDeLaLogica = (): string[] => [
  TEXTOS_DEL_RECOMENDADOR.titulo, ...TEXTOS_DEL_RECOMENDADOR.parrafos, TEXTOS_DEL_RECOMENDADOR.siguiente, TEXTOS_DEL_RECOMENDADOR.atras, TEXTOS_DEL_RECOMENDADOR.ver,
  ...TEXTOS_DEL_RECOMENDADOR.procesando, TEXTOS_DEL_RECOMENDADOR.resultado, TEXTOS_DEL_RECOMENDADOR.elegi, TEXTOS_DEL_RECOMENDADOR.empezarDeNuevo,
  ...PREGUNTAS.flatMap((p) => [p.paso, p.texto, ...p.opciones.flatMap((o) => [o.texto, o.frase])]),
  ...SOLUCIONES.flatMap((s) => [s.nombre, s.porQue, s.complemento]),
]
const faltanEnLaCola = (textos: readonly string[]): string[] => textos.filter((t) => !TEXTOS_DE_LA_COLA.includes(t))
afirmarIgual(faltanEnLaCola(textosDeLaLogica()), [], `los ${String(textosDeLaLogica().length)} textos de cara al usuario están, letra por letra, en 05-TEXTOS («El recomendador»)`)
controlPositivo('  el detector ve un texto reescrito', [...textosDeLaLogica(), '¿No sabés qué servicio elegir?'], (t) => faltanEnLaCola(t).length === 0)
const puntosBien = (preguntas: typeof PREGUNTAS): boolean =>
  preguntas.every((p) => p.opciones.every((o) => {
    const fila = TEXTOS_DE_LA_COLA.split('\n').find((l) => l.startsWith(`| «${o.texto}»`)) ?? ''
    const celda = fila.split('|')[2]?.trim() ?? ''
    const declarados = Object.fromEntries(celda.split(',').map((x) => x.trim().split(' +')).map(([id, n]) => [id ?? '', Number(n)]))
    return JSON.stringify(Object.entries(o.puntos).sort()) === JSON.stringify(Object.entries(declarados).sort())
  }))
afirmar(puntosBien(PREGUNTAS), 'los puntos de cada opción son los de la tabla de 05-TEXTOS (leídos de la tabla, no copiados)')
controlPositivo('  el detector ve un punto cambiado', [{ ...PREGUNTAS[0], opciones: [{ ...PREGUNTAS[0].opciones[0], puntos: { pagina: 2, chatbot: 1 } }] }, PREGUNTAS[1], PREGUNTAS[2]] as unknown as typeof PREGUNTAS, puntosBien)

const analisisBien = (f: typeof analisis): boolean =>
  TODAS.every((r) => {
    const t = f(r)
    const { a, b } = recomendar(r)
    const A = solucion(a)
    const B = solucion(b)
    return !/[{}]/.test(t) && t.startsWith(`Por lo que contaste, ${PREGUNTAS[0].opciones[r[0]]?.frase ?? '?'}, y lo que buscás es ${PREGUNTAS[1].opciones[r[1]]?.frase ?? '?'}. Para ${PREGUNTAS[2].opciones[r[2]]?.frase ?? '?'}, lo que más sentido tiene es `) && t.includes(`${enMinuscula(A.nombre)}: ${A.porQue} Como complemento, ${enMinuscula(B.nombre)} ${B.complemento}`) && t.endsWith(B.complemento)
  })
afirmar(analisisBien(analisis), 'el análisis de las 125 se arma con la plantilla de 05-TEXTOS: dolor, deseo, objetivo, A en minúscula con su porqué y B con su complemento')
controlPositivo('  el detector ve el análisis con A y B al revés', ((r: Respuestas) => analisis(r, { a: recomendar(r).b, b: recomendar(r).a })) as typeof analisis, analisisBien)
afirmar(enMinuscula(solucion('chatbot').nombre) === 'un chatbot con IA que atienda por vos' && enMinuscula('Automatizaciones') === 'automatizaciones', '«en minúscula» es la primera letra: «IA» sigue en mayúsculas')
const MENSAJE_000 = 'Hice el recomendador y me salió una página web. Me cuesta: la gente no me encuentra en internet. Me vendría bien: verse más profesional y tener más visibilidad. Mi objetivo: llegar a más clientes.'
afirmarIgual(mensajeDelContacto([0, 0, 0], 'pagina'), MENSAJE_000, 'el mensaje precargado del contacto, con las tres respuestas')
afirmar(rotuloDeLaPagina('ia-automatizacion') === 'Ver la página de IA y automatizaciones' && rotuloDeLaPagina('web') === 'Ver la página de desarrollo web', 'el link chico: «Ver la página de {servicio}»')
afirmar(PROCESANDO_MS >= 2200 && PROCESANDO_MS <= 3000 && TEXTOS_DEL_RECOMENDADOR.procesando.length === 3, `el procesando: tres líneas en ${String(PROCESANDO_MS)} ms (≈ 2,5 s)`)
afirmarIgual(RENGLONES_DEL_TITULO_DEL_RECOMENDADOR.flatMap((r) => r.palabras).join(' '), TEXTOS_DEL_RECOMENDADOR.titulo, 'los renglones del título dicen el título, tal cual')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El flujo por etapas (puro)')

const correr = (acciones: readonly AccionDelRecomendador[], desde: EstadoDelRecomendador = INICIO_DEL_RECOMENDADOR): EstadoDelRecomendador => acciones.reduce(avanzar, desde)
type Avanzar = typeof avanzar
// [L4] `volver` (lo que pasa después de un envío con éxito): del contacto a las dos soluciones, con las respuestas intactas y sin reiniciar; sin elegida, no hace nada.
const volvioBien = (f: Avanzar, resultado: EstadoDelRecomendador, elegida: EstadoDelRecomendador): boolean => {
  const vuelta = f(elegida, { tipo: 'volver' })
  return vuelta.fase === 'resultado' && vuelta.elegida === null && vuelta.respuestas.join() === elegida.respuestas.join() && f(resultado, { tipo: 'volver' }) === resultado && f(INICIO_DEL_RECOMENDADOR, { tipo: 'volver' }) === INICIO_DEL_RECOMENDADOR && f(vuelta, { tipo: 'elegir', solucion: 'gestion' }).elegida === 'gestion'
}
const flujoBien = (f: Avanzar): boolean => {
  const c = (a: readonly AccionDelRecomendador[]): EstadoDelRecomendador => a.reduce(f, INICIO_DEL_RECOMENDADOR)
  const sinElegir = c([{ tipo: 'siguiente' }])
  const atras = c([{ tipo: 'responder', opcion: 2 }, { tipo: 'siguiente' }, { tipo: 'responder', opcion: 4 }, { tipo: 'atras' }])
  const alFinal = c([{ tipo: 'responder', opcion: 4 }, { tipo: 'siguiente' }, { tipo: 'responder', opcion: 3 }, { tipo: 'siguiente' }, { tipo: 'responder', opcion: 0 }, { tipo: 'siguiente' }])
  const resultado = f(alFinal, { tipo: 'procesado' })
  const elegida = f(resultado, { tipo: 'elegir', solucion: 'gestion' })
  const ajena = f(resultado, { tipo: 'elegir', solucion: 'tienda' })
  const otraVez = f(elegida, { tipo: 'elegir', solucion: 'automatizacion' })
  const fuera = f(INICIO_DEL_RECOMENDADOR, { tipo: 'responder', opcion: 9 })
  return (
    sinElegir.etapa === 0 && sinElegir.falta && !f(sinElegir, { tipo: 'responder', opcion: 1 }).falta &&
    atras.etapa === 0 && atras.respuestas.join() === '2,4,' && !atras.falta &&
    alFinal.fase === 'procesando' && f(alFinal, { tipo: 'atras' }).fase === 'procesando' &&
    resultado.fase === 'resultado' && elegida.elegida === 'gestion' && ajena.elegida === null && otraVez.elegida === 'gestion' &&
    fuera === INICIO_DEL_RECOMENDADOR && f(elegida, { tipo: 'reiniciar' }) === INICIO_DEL_RECOMENDADOR &&
    volvioBien(f, resultado, elegida)
  )
}
afirmar(flujoBien(avanzar), 'sin elegir no avanza (y avisa hasta que elija); Atrás vuelve y conserva lo respondido; la tercera pasa al procesando, que termina en el resultado; se elige A o B (una sola vez); Empezar de nuevo vuelve al principio')
controlPositivo('  [L4] el detector ve un «volver» que reinicia todo (el envío borraría el resultado)', ((e: EstadoDelRecomendador, a: AccionDelRecomendador) => (a.tipo === 'volver' ? INICIO_DEL_RECOMENDADOR : avanzar(e, a))) as Avanzar, flujoBien)
controlPositivo('  [L4] y un «volver» que deja el contacto abierto', ((e: EstadoDelRecomendador, a: AccionDelRecomendador) => (a.tipo === 'volver' ? e : avanzar(e, a))) as Avanzar, flujoBien)
controlPositivo('  el detector ve un «Siguiente» que avanza sin respuesta', ((e: EstadoDelRecomendador, a: AccionDelRecomendador) => (a.tipo === 'siguiente' && e.fase === 'preguntas' && e.etapa < 2 ? { ...e, etapa: e.etapa + 1 } : avanzar(e, a))) as Avanzar, flujoBien)
controlPositivo('  y un «Atrás» que borra lo respondido', ((e: EstadoDelRecomendador, a: AccionDelRecomendador) => (a.tipo === 'atras' && e.etapa > 0 ? { ...e, etapa: e.etapa - 1, respuestas: [null, null, null] } : avanzar(e, a))) as Avanzar, flujoBien)
afirmar(correr([{ tipo: 'responder', opcion: 0 }, { tipo: 'siguiente' }, { tipo: 'siguiente' }]).falta, '  y en la segunda etapa también')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El último tramo sin gatillo (la máquina, pura)')

const LIBRE: ReglaDeGatillos = { cantidad: 4, pasoPx: 1350, salidaDeAbajoLibre: true }
const COMUN: ReglaDeGatillos = { cantidad: 4, pasoPx: 1350 }
type Decidir = typeof decidirLaRueda
const momento = (paso: number, px: number, ahora: number, gesto = GESTO_QUIETO, ocupado = false) => ({ paso, enVuelo: false, ocupado, gesto, px, ahora, hacia: 3.5 * 1350 + px })
const libreBien = (d: Decidir, r: ReglaDeGatillos): boolean => {
  // Un gesto nuevo hacia abajo desde IA (3): todos sus eventos son de la página (un trackpad entero).
  let gesto = GESTO_QUIETO
  const trackpad = Array.from({ length: 40 }, (_, k) => {
    const x = d(momento(3, Math.max(2, 40 - k), 10000 + k * 16, gesto), r)
    gesto = x.gesto
    return x.decision.tipo
  })
  // Lo que queda del gesto que trajo a IA (ya dio su paso): se traga. Subiendo desde IA: un paso, como siempre. Con la transición: se traga.
  const r1 = d(momento(3, 30, 5050, { acumulado: 0, ultimo: 5000, disparado: true }), r).decision
  // (`paso` sin sentido: el gancho lo traga.)
  const resto = r1.tipo === 'tragar' || (r1.tipo === 'paso' && r1.sentido === null) ? 'tragar' : r1.tipo
  const arriba = d(momento(3, -100, 20000), r).decision
  const ocupado = d(momento(3, 100, 30000, GESTO_QUIETO, true), r).decision.tipo
  // Y en Software (2) bajar sigue siendo un gatillo.
  const software = d(momento(2, 100, 40000), r).decision
  return trackpad.every((t) => t === 'pagina') && resto === 'tragar' && arriba.tipo === 'paso' && arriba.sentido === -1 && ocupado === 'tragar' && software.tipo === 'paso' && software.sentido === 1
}
afirmar(libreBien(decidirLaRueda, LIBRE), 'con la salida libre, desde IA la rueda que baja es de la página (cada evento de un trackpad entero); el resto del gesto que trajo a IA se traga; subir y la transición, como siempre; en Software, gatillo')
controlPositivo('  el detector ve la máquina sin la salida libre (B4: el gesto vuela al recomendador)', COMUN, (r) => libreBien(decidirLaRueda, r))
afirmar(decidirLaTecla(3, 4, false, false, false, salidaLibre(3, 1, LIBRE)) === 'pagina' && decidirLaTecla(3, 4, false, false, true, true) === 'pagina' && decidirLaTecla(3, 4, false, true, false, true) === 'tragar' && decidirLaTecla(3, 4, false, false, false, salidaLibre(3, -1, LIBRE)) === 'paso' && decidirLaTecla(2, 4, false, false, false, salidaLibre(2, 1, LIBRE)) === 'paso', 'el teclado: bajar desde IA es de la página (también la tecla sostenida), salvo con la transición; subir y desde Software, un paso')
controlPositivo('  el detector ve el teclado sin la salida libre', COMUN, (r) => decidirLaTecla(3, 4, false, false, false, salidaLibre(3, 1, r)) === 'pagina')
const pieBien = (r: ReglaDeGatillos): boolean => r.cantidad * r.pasoPx - aterrizajeDelPasoEnElTramo(r.cantidad - 1, r) <= PIE_DEL_ULTIMO_PX && aterrizajeDelPasoEnElTramo(r.cantidad - 1, r) < r.cantidad * r.pasoPx && aterrizajeDelPasoEnElTramo(1, r) === 1.5 * r.pasoPx
afirmar(pieBien(LIBRE), `IA aterriza al pie de su tramo (a ${String(PIE_DEL_ULTIMO_PX)} px de soltarse): bajar ya mueve la página, sin rueda «retenida»; los demás, en su centro`)
controlPositivo('  el detector ve IA en el centro de su tramo (media pantalla y media de rueda sin que nada se mueva)', COMUN, pieBien)
const gatillos = leer('_componentes/gatillos/useGatillos.ts')
const escenario = leer('_secciones/servicios/escenario/EscenarioDeServicios.tsx')
const cableadoBien = (g: string, e: string): boolean =>
  /const libre = salidaDeAbajoLibre && !conElDefectoDeLosGatillos\('con-gatillo-al-final'\)/.test(g) && /pasoPx: [^}]*, salidaDeAbajoLibre: libre \}/.test(g) && /irA\(inicio\.current \+ aterrizajeDelPasoEnElTramo\(i, regla\.current\)/.test(g) && /decidirLaTecla\(.*salidaLibre\(actual\.current, sentido, regla\.current\)\)/.test(g) && /dy <= 0 && [^\n]*salidaLibre\(actual\.current, 1, regla\.current\)\) return\n\s*if \(e\.cancelable\) e\.preventDefault\(\)/.test(g) && /useGatillos\(\{[^}]*salidaDeAbajoLibre: true \}\)/.test(e)
afirmar(cableadoBien(gatillos, escenario), 'el gancho lo cumple (la regla, el aterrizaje, la tecla y el dedo sin `preventDefault`) y Servicios lo pide')
controlPositivo('  el detector ve Servicios sin pedirlo', escenario.replace('salidaDeAbajoLibre: true', 'salidaDeAbajoLibre: false'), (e) => cableadoBien(gatillos, e))

// [L2] La salida de arriba libre (Servicios en el teléfono: el cruce con Demos, sin gatillo en los dos sentidos).
const ARRIBA: ReglaDeGatillos = { cantidad: 4, pasoPx: 844, salidaDeArribaLibre: true, salidaDeAbajoLibre: true }
const momentoEn = (paso: number, px: number, ahora: number, hacia: number, gesto = GESTO_QUIETO) => ({ paso, enVuelo: false, ocupado: false, gesto, px, ahora, hacia })
const arribaBien = (r: ReglaDeGatillos): boolean => {
  // Desde la entrada (0), un trackpad entero hacia arriba es de la página.
  let gesto = GESTO_QUIETO
  const trackpad = Array.from({ length: 40 }, (_, k) => {
    const x = decidirLaRueda(momentoEn(0, -Math.max(2, 40 - k), 10000 + k * 16, 0.5 * 844 - 100, gesto), r)
    gesto = x.gesto
    return x.decision.tipo
  })
  // Desde arriba (Demos, −1), el gesto que entra no se atrapa: es de la página.
  const entra = decidirLaRueda(momentoEn(-1, 120, 20000, 60), r).decision.tipo
  // Desde la entrada, bajar sigue siendo un paso (el primer servicio, L3); desde Desarrollo web (1), subir también.
  const baja = decidirLaRueda(momentoEn(0, 100, 30000, 300), r).decision
  const sube = decidirLaRueda(momentoEn(1, -100, 40000, 1200), r).decision
  return trackpad.every((t) => t === 'pagina') && entra === 'pagina' && baja.tipo === 'paso' && baja.sentido === 1 && sube.tipo === 'paso' && sube.sentido === -1
}
afirmar(arribaBien(ARRIBA), '[L2] con la salida de arriba libre: desde la entrada la rueda que sube es de la página, la que llega desde Demos no se atrapa, y bajar desde la entrada (o subir desde web) sigue siendo un paso')
controlPositivo('  el detector ve la máquina de antes (la entrada atrapa y la salida de arriba vuela)', LIBRE, arribaBien)
afirmar(decidirLaTecla(0, 4, false, false, false, salidaLibre(0, -1, ARRIBA)) === 'pagina' && decidirLaTecla(0, 4, false, false, false, salidaLibre(0, 1, ARRIBA)) === 'paso' && !salidaLibre(0, -1, LIBRE), '[L2] el teclado: subir desde la entrada es de la página; bajar, un paso; sin la opción, como siempre')
controlPositivo('  el detector ve el teclado sin la salida de arriba', LIBRE, (r) => decidirLaTecla(0, 4, false, false, false, salidaLibre(0, -1, r)) === 'pagina')
const topeBien = (r: ReglaDeGatillos): boolean => aterrizajeDelPasoEnElTramo(0, r) <= PIE_DEL_ULTIMO_PX && aterrizajeDelPasoEnElTramo(0, r) >= 0 && aterrizajeDelPasoEnElTramo(1, r) === 1.5 * r.pasoPx
afirmar(topeBien(ARRIBA), `[L2] la entrada aterriza en el tope de su tramo (a ${String(PIE_DEL_ULTIMO_PX)} px de soltarse): subir ya mueve la página; los demás, en su centro`)
controlPositivo('  el detector ve la entrada en el centro de su tramo', LIBRE, topeBien)
const arribaCableado = (g: string, e: string): boolean =>
  /const arriba = salidaDeArribaLibre && !conElDefectoDeLosGatillos\('con-gatillo-arriba'\)/.test(g) && /salidaDeArribaLibre: arriba, salidaDeAbajoLibre: libre \}/.test(g) &&
  // [L3] Reemplazada por la spec: el dedo que ya dio su paso (`dioPaso`) no sale libre (con el candado corto de Servicios, seguía de largo).
  /if \(dy > 0 && enVuelo\.current === null && !ocupado\(\) && !dedo\.dioPaso && salidaLibre\(actual\.current, -1, regla\.current\)\) return/.test(g) && /if \(dedo\.desdeArriba && regla\.current\.salidaDeArribaLibre === true\) dedo\.disparado = true/.test(g) &&
  /if \(dy <= 0 && enVuelo\.current === null && !ocupado\(\) && !dedo\.dioPaso && salidaLibre\(actual\.current, 1, regla\.current\)\) return/.test(g) && /dedo\.disparado = true\n\s*dedo\.dioPaso = true/.test(g) &&
  /useGatillos\(\{[^}]*salidaDeArribaLibre: telefono, salidaDeAbajoLibre: true \}\)/.test(e)
afirmar(arribaCableado(gatillos, escenario), '[L2] el gancho lo cumple (la regla con su defecto del banco; el dedo que sube desde la entrada es de la página y el que llega desde arriba se queda en ella) y Servicios lo pide sólo en el teléfono')
controlPositivo('  el detector ve Servicios pidiéndolo en todo ancho', escenario.replace('salidaDeArribaLibre: telefono', 'salidaDeArribaLibre: true'), (e) => arribaCableado(gatillos, e))

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · La REGLA DE ALTURAS desde 1024')

const tramoBien = (f: typeof tramoDeServicios): boolean => {
  const mas = f(1440, 900, 7470)
  const tablet = f(768, 1024, 1338 * 1.5)
  return f(1440, 900, 8 * 900) === null && mas !== null && Math.abs(mas.k - 7470 / 7200) < 1e-9 && mas.arranque === 900 && Math.abs(mas.largo - 7200) < 1e-9 && f(1024, 768, 6144) === null && tablet !== null && Math.abs(tablet.k - 1.5) < 1e-9
}
afirmar(PANTALLAS_DE_LA_TABLA === 8 && tramoBien(tramoDeServicios), 'desde 1024 el alto viejo es la tabla (8 pantallas): igual, sin tramo; más (el recomendador que crece), k = alto nuevo / 8 pantallas sobre la sección entera; abajo, lo medido')
controlPositivo('  el detector ve el modelo de B4 (desde 1024 nunca hay tramo)', ((w: number, h: number, n: number) => (w >= 1024 ? null : tramoDeServicios(w, h, n))) as typeof tramoDeServicios, tramoBien)
afirmar(ALTO_DE_LA_PISTA_ANCHA === '700svh' && ALTO_MINIMO_DE_LA_PISTA === '500svh' && !/flex-1/.test(escenario.split('data-pieza="pista-de-servicios"')[1]?.split('\n')[0] ?? 'flex-1') && seccionDe('servicios').alto === '800svh', 'la pista fija (700svh desde 1024: lo que medía estirada; 500svh abajo), sin estirarse con el recomendador; la tabla sin tocar')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Lo que se renderiza')

const html = renderToStaticMarkup(<Recomendador />)
const veces = (h: string, aguja: string): number => h.split(aguja).length - 1
const primeraBien = (h: string): boolean =>
  veces(h, '<h3') === 1 && h.includes('id="titulo-del-recomendador"') && veces(h, 'type="radio"') === 5 && veces(h, 'data-pieza="opcion-del-recomendador"') === 5 && h.includes(`<legend`) && h.includes(PREGUNTAS[0].texto) &&
  PREGUNTAS[0].opciones.every((o) => h.includes(o.texto)) && TEXTOS_DEL_RECOMENDADOR.parrafos.every((p) => h.includes(p)) && veces(h, 'aria-current="step"') === 1 && h.includes(TEXTOS_DEL_RECOMENDADOR.siguiente) && !h.includes(TEXTOS_DEL_RECOMENDADOR.atras) && veces(h, 'stroke-width="1.5"') >= 5
afirmar(primeraBien(html), 'el servidor publica el encabezado (un h3 con el título y los dos párrafos) y la primera etapa: el indicador, la pregunta y sus cinco opciones con ícono, y «Siguiente» (sin «Atrás»)')
controlPositivo('  el detector ve la lista de radios de B4 (nueve opciones)', html.replace('type="radio"', 'type="radio" data-x type="radio" type="radio" type="radio" type="radio"'), primeraBien)
afirmar(renderToStaticMarkup(<Servicios seccion={seccionDe('servicios')} />).includes('data-pieza="recomendador"'), 'el recomendador va adentro de la sección de Servicios: la zona donde el chat se desvanece (C2-21) lo incluye')

const nada = (): void => undefined
/** El texto que se lee (sin etiquetas, con los espacios juntados): un rótulo puede ir partido en piezas. */
const textoDe = (h: string): string => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')
const resultado = renderToStaticMarkup(<ResultadoDelRecomendador respuestas={[0, 0, 0]} elegida={null} despachar={nada} reducido idDelTitulo="r" />)
const resultadoBien = (h: string): boolean =>
  /data-a="pagina" data-b="chatbot"/.test(h) && veces(h, 'data-pieza="tarjeta-de-solucion"') === 2 && /data-solucion="pagina" data-destacada="si"/.test(h) && /data-solucion="chatbot" data-destacada="no"/.test(h) &&
  h.includes(TEXTOS_DEL_RECOMENDADOR.elegi) && h.includes(TEXTOS_DEL_RECOMENDADOR.empezarDeNuevo) && analisis([0, 0, 0]).split(' ').every((p) => h.includes(`>${p}<`)) && !h.includes('data-pieza="contacto-del-recomendador"')
afirmar(resultadoBien(resultado), 'el resultado: el análisis (palabra por palabra, para pintarse), las dos tarjetas (A destacada), «Elegí la que más te cierre.» y «Empezar de nuevo»; sin contacto hasta elegir')
controlPositivo('  el detector ve el resultado con una sola tarjeta', resultado.replace('data-pieza="tarjeta-de-solucion"', 'data-pieza="otra"'), resultadoBien)
const conContacto = renderToStaticMarkup(<ResultadoDelRecomendador respuestas={[0, 0, 0]} elegida="chatbot" despachar={nada} reducido idDelTitulo="r" />)
const partesDelContacto = (h: string): string[] =>
  Object.entries({
    // [L4] El contacto aparece EN EL LUGAR de las tarjetas: ni una tarjeta, ni «Elegí…», y las tres acciones juntas en la fila del envío.
    'sin tarjetas': veces(h, 'data-pieza="tarjeta-de-solucion"') === 0 && !h.includes(TEXTOS_DEL_RECOMENDADOR.elegi),
    // [L8a] La página del servicio arriba (a la derecha del título); abajo, «Empezar de nuevo» a la izquierda y «Enviar» a la derecha.
    'las tres acciones': /data-parte="cabecera-del-contacto"[\s\S]*?data-viaje-del-servicio="ia-automatizacion"[\s\S]*?data-parte="fila-del-envio"[\s\S]*?data-parte="empezar-de-nuevo"[\s\S]*?type="submit"/.test(h),
    'la precarga': /<form[^>]*data-precarga="ia-automatizacion"/.test(h),
    'el mensaje': h.includes(mensajeDelContacto([0, 0, 0], 'chatbot')),
    'el título': textoDe(h).includes('Hablemos de un chatbot con IA que atienda por vos'),
    'el envío': h.includes('data-pieza="estado-de-envio"'),
    'el autocompletado': /autocomplete="email"/i.test(h),
    'el viaje': /data-viaje-del-servicio="ia-automatizacion"/.test(h),
    'el link': textoDe(h).includes('Ver la página de IA y automatizaciones'),
  }).filter(([, bien]) => !bien).map(([parte]) => parte)
const contactoBien = (h: string): boolean => partesDelContacto(h).length === 0
afirmar(contactoBien(conContacto), 'elegida una: [L4] las tarjetas se cambian en el mismo lugar por el contacto precargado, con «Enviar», «Ver la página de…» y «Empezar de nuevo» en una fila, y (`data-precarga` del servicio, el mensaje con las respuestas, `EstadoDeEnvio`, el autocompletado) y el link chico a la página (el viaje)', `faltan: ${partesDelContacto(conContacto).join(', ') || 'nada'}`)
controlPositivo('  el detector ve el contacto sin la precarga', conContacto.replace('data-precarga="ia-automatizacion"', ''), contactoBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('6b · [L4] La distribución de escritorio, el indicador del teléfono y que enviar no mueva la página')

// El encabezado a un tercio y el recomendador a dos, centrados en alto entre sí; abajo de 1024, la columna.
const distribucionBien = (h: string): boolean =>
  h.includes('--columnas-del-recomendador:minmax(0,1fr) minmax(0,2fr)') && /escritorio:grid-cols-\[var\(--columnas-del-recomendador\)\]/.test(h) && /data-pieza="recomendador"[^>]*class="[^"]*\bescritorio:items-center\b/.test(h) && /data-pieza="recomendador"[^>]*class="[^"]*\bflex-col\b/.test(h)
afirmar(distribucionBien(html), 'desde 1024, el encabezado a un tercio y el recomendador a dos tercios, centrados en alto entre sí; abajo de 1024, una columna')
controlPositivo('  el detector ve el recomendador sin centrar en alto', html.replace('escritorio:items-center', 'escritorio:items-start'), distribucionBien)
controlPositivo('  y las dos columnas iguales (el de antes: todo el ancho)', html.replace('minmax(0,1fr) minmax(0,2fr)', 'minmax(0,1fr) minmax(0,1fr)'), distribucionBien)

// Abajo de 1024, SÓLO el paso de ahora, centrado (número y nombre); la lista de los tres queda en el DOM para el lector, sin verse.
const pasoActualBien = (h: string): boolean =>
  /data-parte="paso-actual" aria-hidden="true" class="flex justify-center escritorio:hidden"/.test(h) && h.includes(`<span>${PREGUNTAS[0].paso}</span>`) &&
  /data-parte="indicador-de-pasos" class="max-escritorio:sr-only escritorio:grid/.test(h) && veces(h, 'aria-current="step"') === 1
afirmar(pasoActualBien(html), 'abajo de 1024 el indicador muestra sólo el paso de ahora, centrado (el número y el nombre); la lista de los tres sigue en el DOM, oculta (un solo aria-current)')
controlPositivo('  el detector ve el indicador de tres a la vista abajo de 1024 (el de antes)', html.replace('max-escritorio:sr-only escritorio:grid', 'grid'), pasoActualBien)
controlPositivo('  y el paso de ahora a la izquierda (sin centrar)', html.replace('flex justify-center escritorio:hidden', 'flex escritorio:hidden'), pasoActualBien)

// Enviar no mueve la página: ninguna pieza del recomendador (salvo `movimiento.ts`, que sólo corre al cambiar de etapa o de fase) hace un scroll ni cambia el hash.
const sinScroll = (texto: string): boolean => !/scrollIntoView|scrollTo\(|location\.hash|history\.(push|replace)State|useRouter|router\./.test(texto)
const sinCodigo = (f: { a: string; texto: string }): string => f.texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const sinMovimiento = FUENTES.filter((x) => x.a !== 'movimiento.ts').map(sinCodigo)
afirmar(sinMovimiento.every(sinScroll), 'el recomendador no mueve la página por su cuenta: sin scroll, sin hash, sin router (sólo `movimiento.ts`, al cambiar de etapa o de fase)')
controlPositivo('  el detector ve un scrollIntoView en el contacto', [...sinMovimiento, 'ref.current?.scrollIntoView()'].join('\n'), sinScroll)
const recomendador = leer(`${CARPETA}/Recomendador.tsx`)
const CLAVE = 'const ahora = `${estado.fase}|${String(estado.etapa)}`'
afirmar(recomendador.includes(CLAVE) && recomendador.includes('llevarALaVista(cuerpo.current, reducido)') && (recomendador.match(/llevarALaVista\(/g) ?? []).length === 1, 'y `llevarALaVista` sólo corre cuando cambia la etapa o la fase (no al elegir ni al enviar: `elegida` no es parte de la clave)')
controlPositivo('  el detector ve la clave con la solución elegida (cada elección o envío traería la página)', recomendador.replace(CLAVE, 'const ahora = `${estado.fase}|${String(estado.etapa)}|${String(estado.elegida)}`'), (t: string) => t.includes(CLAVE))

// ═══════════════════════════════════════════════════════════════════════════
titulo('7 · Las piezas del sitio, importadas (no copias), y la estética del home')

// Sin comentarios: la prosa puede nombrar lo que el código no hace («sin violeta», «`/api/` interceptado»).
const todo = FUENTES.map((f) => f.texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')).join('\n')
const piezasBien = (t: string): boolean =>
  /from '\.\.\/escenario\/TituloQueSePintaAlLlegar'/.test(t) && /from '\.\.\/\.\.\/_contrato\/Gatillo'/.test(t) && /\{ CARGA, Carga \} from '\.\.\/\.\.\/\.\.\/_componentes\/carga\/Carga'/.test(t) && /<EstadoDeEnvio estado=\{estado\} alVolver=\{alVolver\}[^>]*>/.test(t) &&
  /enviarContacto\(completos\(datos\)\)/.test(t) && /fundidoDelEnvio/.test(t) && /<AnimatePresence mode="wait"/.test(t) && !/\bfetch\(|\/api\//.test(t)
afirmar(piezasBien(todo), 'el título que se pinta, el gatillo que levanta, la carga y el estado de envío de develOP, el envío del contacto general y sus fundidos; ningún `fetch` ni ruta de `/api/` propios')
controlPositivo('  el detector ve un envío propio', `${todo}\nfetch('/api/contacto')`, piezasBien)
const iconosBien = (t: string): boolean => [...t.matchAll(/<(Icono|Check)\b[^>]*>/g)].every((m) => m[0].includes('strokeWidth={1.5}')) && /<(Icono|Check)\b/.test(t)
afirmar(iconosBien(todo), 'cada ícono de lucide con `strokeWidth={1.5}`')
controlPositivo('  el detector ve un ícono con otro trazo', `${todo}\n<Check className="x" />`, iconosBien)
const sinVioleta = (t: string): boolean => !/violet|violeta|acento-software|8b5cf6|purple|indigo/i.test(t)
afirmar(sinVioleta(todo), 'nada de violeta: papel, tinta y los tokens del sitio')
controlPositivo('  el detector ve el violeta del diagnóstico del sitio vivo', `${todo} violeta`, sinVioleta)

cerrar('s78-c2-51')
