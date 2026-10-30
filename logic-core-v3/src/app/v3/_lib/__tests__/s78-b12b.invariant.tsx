/**
 * s78 · B12b (2026-10-22) · EL VIAJE DESDE EL CTA DE UN SERVICIO DEL HOME HASTA SU PÁGINA, sin navegador. Cada afirmación con su control
 * positivo. Lo que se ve (0 cuadros en blanco, la llegada con el logo en su hueco, los sonidos) lo mide el banco en el navegador
 * (`scripts-carga/viaje.ts`, lo corre el orquestador); el plan y qué mirar, en `docs/rediseno/SPRINT-B12B-NOCTURNO.md`.
 *
 *   1 · el reloj del viaje: fuera de él no cambia nada; adentro, la cámara baja de la partida a la composición y la noche entra de a poco,
 *       todo antes de navegar;
 *   2 · la escena lo lee: la pose y la luz de la intro (con el preset del destino apilado) y la atadura que la despierta;
 *   3 · el pedido: el CTA lo anota en su clic, viaja con el próximo `cubrirConElVelo` y se olvida al terminar el clic;
 *   4 · el velo lo atiende: sin banda, la página nueva tapada y aparece con el sonido de la llegada; sin escena, la banda;
 *   5 · el CTA de cada servicio va a la página de su preset, y los sonidos son del sprite (por el bus: respetan el mute).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import React from 'react'

import { modoDelViaje, VIAJE_POR_DEFECTO } from '../../_componentes/navegacion/viajeAlServicio'
import { PRESET as PRESET_DE_LA_BASE } from '../../pagina-base/preset'
import { IDS_DE_SERVICIO } from '../../_secciones/_contrato/acento'
import { DESTINO_DEL_SERVICIO, PRESET_DEL_DESTINO } from '../../_secciones/servicios/escenario/datos'
import { SELECTOR_DE_LA_INTRO } from '../../_componentes/pagina/atributoDeLaIntro'
import { buildTrack } from '../escena/choreographySampler'
import type { MutableChoreoPose, MutableLightLevels } from '../escena/choreographyTypes'
import { NIVEL_DE_LA_NOCHE } from '../escena/lightArc'
import { poseDeLaIntro } from '../escena/ruta/composicionEnLaEscena'
import { COMPOSICION_INICIAL, PISTA_DE_LA_INTRO, luzDeLaPagina, pistaDeLaPagina } from '../escena/ruta/pistaDeLaIntro'
import { apilarElPreset } from '../escena/ruta/preset'
import {
  POSE_DE_PARTIDA,
  SONIDOS_DEL_VIAJE,
  TIEMPOS_DEL_VIAJE,
  arrancarElViaje,
  camaraDelViaje,
  faseDelViaje,
  llegarConElViaje,
  mezclarConLaPartida,
  nivelConLaNocheDelViaje,
  nocheDelViaje,
  prepararElViaje,
  suscribirAlViajeAlServicio,
  terminarElViajeAlServicio,
  viajeAlServicioEnCurso,
  type FaseDelViaje,
} from '../escena/ruta/viajeDelServicio'
import { SONIDOS } from '../sonido/catalogo'
import { atenderElVelo, cubrirConElVelo, hayVelo, pedirElViaje, type PedidoDelVelo, type ViajeDelVelo } from '../veloDeNavegacion'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = path.join(process.cwd(), 'src/app/v3')
const leer = (r: string): string => readFileSync(path.join(V3, r), 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (c: string): string => c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const CUADRO_MS = 1000 / 60

async function principal(): Promise<void> {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('1 · El reloj del viaje')

  // Fuera de un viaje: la cámara y la luz son las de la página, EXACTAS (el rig no cambia un número para nadie).
  type Reloj = (ahora: number, fase?: FaseDelViaje, inicio?: number) => number
  const fueraNoToca = (camara: Reloj, noche: Reloj, mezclar: typeof mezclarConLaPartida, nivel: typeof nivelConLaNocheDelViaje): boolean => {
    const pose: MutableChoreoPose = { angleDeg: 38.25, height: 5.2, distance: 15.5, frameX: 0.31, frameY: -0.07 }
    const copia = { ...pose }
    mezclar(pose, camara(123))
    const niveles = [1, 0.5, 0.34, 0.1, NIVEL_DE_LA_NOCHE, 0.01]
    return camara(123) === 1 && noche(123) === 1 && (Object.keys(copia) as (keyof MutableChoreoPose)[]).every((k) => Object.is(pose[k], copia[k])) && niveles.every((l) => Object.is(nivel(l, NIVEL_DE_LA_NOCHE, noche(5)), Math.min(l, NIVEL_DE_LA_NOCHE)))
  }
  afirmar(faseDelViaje() === 'quieto' && fueraNoToca(camaraDelViaje, nocheDelViaje, mezclarConLaPartida, nivelConLaNocheDelViaje), 'fuera de un viaje el reloj vale 1: la pose de la página y la noche del preset (el mínimo de siempre), exactas')
  controlPositivo('  el detector ve un reloj que se queda en la partida fuera del viaje', (() => 0) as Reloj, (r: Reloj) => fueraNoToca(r, nocheDelViaje, mezclarConLaPartida, nivelConLaNocheDelViaje))
  controlPositivo('  y una página que se queda de día fuera del viaje (la noche del preset no se aplica)', ((l: number) => l) as typeof nivelConLaNocheDelViaje, (f: typeof nivelConLaNocheDelViaje) => fueraNoToca(camaraDelViaje, nocheDelViaje, mezclarConLaPartida, f))

  // Adentro: preparando (la escena despierta detrás del papel) en la partida y de día; con su reloj, de a poco, sin saltos por cuadro.
  const recorrido = (camara: Reloj, noche: Reloj): { readonly saltoCamara: number; readonly saltoNoche: number; readonly fin: boolean; readonly inicio: boolean } => {
    let saltoCamara = 0
    let saltoNoche = 0
    let [c0, n0] = [camara(0, 'viajando', 0), noche(0, 'viajando', 0)]
    for (let t = CUADRO_MS; t <= TIEMPOS_DEL_VIAJE.camaraMs + CUADRO_MS; t += CUADRO_MS) {
      const [c, n] = [camara(t, 'viajando', 0), noche(t, 'viajando', 0)]
      saltoCamara = Math.max(saltoCamara, Math.abs(c - c0))
      saltoNoche = Math.max(saltoNoche, Math.abs(n - n0))
      ;[c0, n0] = [c, n]
    }
    const fin = camara(TIEMPOS_DEL_VIAJE.camaraMs, 'viajando', 0) === 1 && noche(TIEMPOS_DEL_VIAJE.camaraMs, 'viajando', 0) === 1
    const inicio = camara(9999, 'preparando', Number.NaN) === 0 && noche(9999, 'preparando', Number.NaN) === 0 && camara(0, 'viajando', 0) === 0 && noche(0, 'viajando', 0) === 0
    return { saltoCamara, saltoNoche, fin, inicio }
  }
  const deAPoco = (camara: Reloj, noche: Reloj): boolean => {
    const r = recorrido(camara, noche)
    return r.inicio && r.fin && r.saltoCamara <= 0.03 && r.saltoNoche <= 0.04
  }
  const r = recorrido(camaraDelViaje, nocheDelViaje)
  afirmar(deAPoco(camaraDelViaje, nocheDelViaje), `de la partida (0) a la composición (1) y del día a la noche, con su curva: el salto más grande por cuadro, ${(r.saltoCamara * 100).toFixed(1)} % de la cámara y ${(r.saltoNoche * 100).toFixed(1)} % de la noche (nunca de golpe)`)
  controlPositivo('  el detector ve la noche de golpe (la del preset apilado sin el viaje)', ((ahora: number, fase: FaseDelViaje = 'viajando', inicio = 0) => (fase === 'viajando' && ahora - inicio < TIEMPOS_DEL_VIAJE.nocheDesdeMs ? 0 : 1)) as Reloj, (n: Reloj) => deAPoco(camaraDelViaje, n))
  controlPositivo('  y la cámara que salta a la composición', ((ahora: number, fase: FaseDelViaje = 'viajando') => (fase === 'preparando' || ahora <= 0 ? 0 : 1)) as Reloj, (c: Reloj) => deAPoco(c, nocheDelViaje))

  // Todo antes de navegar: el papel arriba, la noche entera y los nanobots apagados cuando la cámara llega (después se navega quieto).
  const antesDeNavegar = (t: { readonly [K in keyof typeof TIEMPOS_DEL_VIAJE]: number }): boolean => t.levantaMs <= t.camaraMs && t.nocheHastaMs <= t.camaraMs && t.nocheDesdeMs < t.nocheHastaMs && t.apaganMs <= t.levantaMs && t.esperaMaximaMs <= 2000 && t.camaraMs <= 2200
  afirmar(antesDeNavegar(TIEMPOS_DEL_VIAJE), `todo termina antes de navegar: el papel sube en ${String(TIEMPOS_DEL_VIAJE.levantaMs)} ms, anochece de ${String(TIEMPOS_DEL_VIAJE.nocheDesdeMs)} a ${String(TIEMPOS_DEL_VIAJE.nocheHastaMs)} y la cámara llega a los ${String(TIEMPOS_DEL_VIAJE.camaraMs)} (la página se monta con la escena quieta)`)
  controlPositivo('  el detector ve la noche que sigue entrando después de navegar', { ...TIEMPOS_DEL_VIAJE, nocheHastaMs: TIEMPOS_DEL_VIAJE.camaraMs + 300 }, antesDeNavegar)

  // La pose de partida: de frente, más alta y más lejos que la composición, adentro del rango del recorrido del home.
  const partidaBien = (p: typeof POSE_DE_PARTIDA): boolean => p.angleDeg === COMPOSICION_INICIAL.angleDeg && p.height > COMPOSICION_INICIAL.height && p.height <= 9 && p.distance > COMPOSICION_INICIAL.distance && p.distance <= 34 && p.frameX === 0 && p.frameY === 0
  afirmar(partidaBien(POSE_DE_PARTIDA), `la partida, de frente (${String(POSE_DE_PARTIDA.angleDeg)}°), a ${String(POSE_DE_PARTIDA.height)} de alto y ${String(POSE_DE_PARTIDA.distance)} de distancia: la cámara BAJA a la composición, calma, sin girar (dentro del rango del home)`)
  controlPositivo('  el detector ve una partida girada (un ángulo raro)', { ...POSE_DE_PARTIDA, angleDeg: 40 }, partidaBien)

  // La máquina: preparar → arrancar → llegar → terminar, con aviso a la atadura en cada paso; arrancar sólo desde preparando.
  let avisos = 0
  const baja = suscribirAlViajeAlServicio(() => {
    avisos += 1
  })
  arrancarElViaje(10)
  const sinPreparar = faseDelViaje() === 'quieto' && !viajeAlServicioEnCurso()
  prepararElViaje()
  const preparando = faseDelViaje() === 'preparando' && viajeAlServicioEnCurso() && camaraDelViaje(5000) === 0 && nocheDelViaje(5000) === 0
  arrancarElViaje(1000)
  const viajando = faseDelViaje() === 'viajando' && camaraDelViaje(1000) === 0 && camaraDelViaje(1000 + TIEMPOS_DEL_VIAJE.camaraMs) === 1 && camaraDelViaje(1000 + TIEMPOS_DEL_VIAJE.camaraMs / 2) > 0.3
  llegarConElViaje()
  const llegando = faseDelViaje() === 'llegando' && camaraDelViaje(1001) === 1 && nocheDelViaje(1001) === 1
  terminarElViajeAlServicio()
  terminarElViajeAlServicio()
  baja()
  afirmar(sinPreparar && preparando && viajando && llegando && faseDelViaje() === 'quieto' && avisos === 4, 'la máquina: preparando (la partida, de día) → viajando (con su reloj) → llegando (navegó: la composición y la noche) → quieto; arrancar sólo después de preparar; cada paso avisa a la atadura (4 avisos)')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('2 · La escena lo lee: la pose y la luz de la intro, y la atadura que la despierta')

  const track = buildTrack(PISTA_DE_LA_INTRO)
  const pose = (): MutableChoreoPose => {
    const p: MutableChoreoPose = { angleDeg: 0, height: 0, distance: 0, frameX: 0, frameY: 0 }
    poseDeLaIntro(track, 0, p, 1.6, 50, 0, 0)
    return p
  }
  const igual = (a: MutableChoreoPose, b: typeof POSE_DE_PARTIDA): boolean => (['angleDeg', 'height', 'distance', 'frameX', 'frameY'] as const).every((k) => Math.abs(a[k] - b[k]) < 1e-9)
  prepararElViaje()
  const enLaPartida = igual(pose(), POSE_DE_PARTIDA)
  terminarElViajeAlServicio()
  const enLaComposicion = igual(pose(), COMPOSICION_INICIAL)
  afirmar(enLaPartida && enLaComposicion, 'el rig (la pose de la intro con la pista del destino): durante el viaje, de la partida; fuera, la composición inicial (sin un número cambiado)')
  const rig = leer('_lib/escena/ruta/composicionEnLaEscena.ts')
  const poseCableada = (c: string): boolean => /sampleTrack\(track, avance, objetivo\)\s*(?:\/\/[^\n]*\n\s*)?mezclarConLaPartida\(objetivo, camaraDelViaje\(performance\.now\(\)\)\)\s*const hueco/.test(c)
  afirmar(poseCableada(rig), '  la mezcla va DESPUÉS de la pista y ANTES del encuadre del hueco: el logo va en su hueco durante todo el descenso')
  controlPositivo('  el detector ve la mezcla después del encuadre (el logo se saldría del hueco al bajar)', rig.replace(/(\s*\/\/[^\n]*\n\s*mezclarConLaPartida\(objetivo, camaraDelViaje\(performance\.now\(\)\)\))/, '').replace('  objetivo.frameY = e.frameY\n', '  objetivo.frameY = e.frameY\n  mezclarConLaPartida(objetivo, camaraDelViaje(performance.now()))\n'), poseCableada)

  // La luz: con el preset del destino apilado (de noche) en el home, durante el viaje la noche no entra de golpe; fuera, la de siempre.
  const sacar = apilarElPreset(PRESET_DE_LA_BASE)
  const nivel = (): number => {
    const a: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 45 }
    luzDeLaPagina(pistaDeLaPagina(), 0.7, a)
    return a.level
  }
  prepararElViaje()
  const deDia = nivel()
  terminarElViajeAlServicio()
  const deNoche = nivel()
  sacar()
  afirmar(deDia === 1 && deNoche === NIVEL_DE_LA_NOCHE, `la luz: con el preset del destino apilado, preparando el viaje es la del día (${String(deDia)}); fuera del viaje, la noche del preset (${String(deNoche)}), exacta`)

  const atadura = sinComentarios(leer('_lib/escena/ataduraAlScroll.ts'))
  const despierta = (a: string): boolean => /const viajando = viajeEnCurso\(\) !== null \|\| viajeAlServicioEnCurso\(\)/.test(a) && /const desuscribirDelViajeAlServicio = suscribirAlViajeAlServicio\(pedir\)/.test(a) && /desuscribirDelViajeAlServicio\(\)/.test(a) && /const enCuadro =\s*viajando \|\|/.test(a)
  afirmar(despierta(atadura), '  la atadura dibuja la escena durante el viaje (aunque el papel de Servicios la tape: el papel se levanta) y vuelve a leer al empezar y al terminar')
  controlPositivo('  el detector ve la atadura que no se entera (al levantar el papel se vería el último cuadro, viejo)', atadura.replace(' || viajeAlServicioEnCurso()', ''), despierta)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('3 · El pedido: anotado en el clic, con el próximo `cubrirConElVelo`, olvidado al terminar el clic')

  const pedidos: PedidoDelVelo[] = []
  const v: ViajeDelVelo = () => Promise.resolve('escena')
  const sinVelo = !hayVelo()
  // Sin el velo montado, cubrir resuelve en el acto y el viaje no corre (nadie repondría la ruta).
  let corrio = false
  pedirElViaje(() => {
    corrio = true
    return Promise.resolve('escena')
  })
  await cubrirConElVelo()
  const soltarElVelo = atenderElVelo((p) => {
    pedidos.push(p)
    p.cubierto()
  })
  pedirElViaje(v)
  await cubrirConElVelo()
  await cubrirConElVelo()
  pedirElViaje(v)
  await Promise.resolve()
  await cubrirConElVelo()
  const conVelo = hayVelo()
  soltarElVelo()
  afirmar(sinVelo && !corrio && conVelo && pedidos.length === 3 && pedidos[0]?.viaje === v && pedidos[1]?.viaje === null && pedidos[2]?.viaje === null, 'el viaje pedido en el clic viaja con ESE `cubrirConElVelo` (el siguiente va con la banda) y se olvida al terminar la tarea del clic; sin el velo montado no corre')
  const enlace = sinComentarios(leer('_componentes/navegacion/EnlaceDeRuta.tsx'))
  const antesDeCubrir = (c: string): boolean => {
    const clic = c.indexOf('onClick?.(e)')
    const cubre = c.indexOf('cubrirConElVelo()')
    return clic > 0 && cubre > clic && /void Promise\.all\(\[pedirLaSalidaDeLaVariante\(\), sinVelo\(\) \? Promise\.resolve\(\) : cubrirConElVelo\(\)\]\)/.test(c)
  }
  afirmar(antesDeCubrir(enlace), '  `EnlaceDeRuta` (sin cambios) corre el `onClick` del CTA antes de cubrir, en la misma tarea: ahí se anota el viaje')
  controlPositivo('  el detector ve un enlace que cubre antes de correr el `onClick` (el viaje llegaría tarde)', enlace.replace('onClick?.(e)', '').replace('{children}\n    </Link>', '{children}\n    </Link>\n    onClick?.(e)'), antesDeCubrir)
  afirmar(VIAJE_POR_DEFECTO === 'escena' && modoDelViaje('') === 'escena' && modoDelViaje('?viaje=velo') === 'velo' && modoDelViaje('?viaje=escena') === 'escena' && modoDelViaje('?viaje=otro') === VIAJE_POR_DEFECTO, '`?viaje=velo` compara con el velo de siempre; sin la bandera (o con otro valor), el viaje')

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('4 · El velo lo atiende: la escena cubre, la página nueva llega tapada y aparece con la llegada')

  const velo = sinComentarios(leer('_chrome/velo/VeloDeNavegacion.tsx'))
  const veloBien = (c: string): boolean =>
    c.includes("b.style.visibility = f === 'quieto' || modo === 'viaje' ? 'hidden' : 'visible'") &&
    /if \(p\.viaje === null\) \{\s*cubrirConLaBanda\(p\)\s*return\s*\}\s*modo = 'viaje'/.test(c) &&
    /if \(cubrio !== 'escena'\) \{\s*colorear\(\)\s*cubrirConLaBanda\(p\)\s*return\s*\}\s*tapada = taparLaPaginaQueLlega\(\)\s*pasar\('cubrio'\)\s*pintar\('cubierto', 1\)\s*p\.cubierto\(\)/.test(c) &&
    /if \(modo === 'viaje'\) \{\s*sonarElViaje\('llega'\)[\s\S]*?llega\.mostrar\(TIEMPOS_DEL_VIAJE\.fundidoDeLaLlegadaMs, quieto\)/.test(c) &&
    c.includes("animar('cubriendo', tiempos().cubrirMs") && c.includes("animar('destapando', tiempos().destaparMs") && c.includes('if (puedeDestapar(pintados, escenaDeLaRutaLista(), ahora - t0)) destapar()')
  afirmar(veloBien(velo), 'en el viaje la banda no se dibuja; la página nueva queda tapada ANTES de navegar; con su primer cuadro estable aparece encima de la escena y suena la llegada; sin la escena a tiempo, la banda de siempre (que sigue igual)')
  controlPositivo('  el detector ve la banda dibujada encima del viaje', velo.replace(" || modo === 'viaje'", ''), veloBien)
  controlPositivo('  y la página que se tapa DESPUÉS de navegar (el primer cuadro, con el scroll del home)', velo.replace('tapada = taparLaPaginaQueLlega()\n        pasar', 'pasar').replace('p.cubierto()\n        vence = window.setTimeout(destapar, VENCE_MS)\n      })\n    })', 'p.cubierto()\n        tapada = taparLaPaginaQueLlega()\n        vence = window.setTimeout(destapar, VENCE_MS)\n      })\n    })'), veloBien)
  const tapada = sinComentarios(leer('_chrome/velo/paginaTapada.ts'))
  const tapadaBien = (c: string): boolean =>
    /const viejas = new Set\(document\.querySelectorAll\('main'\)\)/.test(c) && /m\.style\.opacity = '0'/.test(c) && /scrollDeLaRuta\(\)/.test(c) && /new MutationObserver\(revisar\)/.test(c) && /observador\.observe\(document\.body, \{ childList: true, subtree: true \}\)/.test(c)
  afirmar(tapadaBien(tapada), '  la página nueva entra en la microtarea del commit (un observador del documento, antes de pintar): transparente y con el scroll de su ruta (el `<Link>` va con `scroll={false}`)')
  controlPositivo('  el detector ve la página que entra con el scroll del home', tapada.replace('scrollDeLaRuta()', ''), tapadaBien)

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('5 · El CTA de cada servicio, su destino y los sonidos')

  const destinoBien = (presets: typeof PRESET_DEL_DESTINO): boolean =>
    IDS_DE_SERVICIO.every((id) => presets[id] === PRESET_DE_LA_BASE && DESTINO_DEL_SERVICIO[id] === '/v3/pagina-base') &&
    PRESET_DE_LA_BASE.noche === 'noche' && PRESET_DE_LA_BASE.pista === PISTA_DE_LA_INTRO && PRESET_DE_LA_BASE.tramos?.intro === SELECTOR_DE_LA_INTRO && PRESET_DE_LA_BASE.variante !== null
  afirmar(destinoBien(PRESET_DEL_DESTINO), 'cada servicio viaja con el preset de su página de destino, el MISMO objeto que declara la página (hoy, la base: de noche, con la pista de la intro y su variante)')
  controlPositivo('  el detector ve una copia del preset (la escena armaría la pista dos veces y la ranura no sabría que es la misma)', { ...PRESET_DEL_DESTINO, web: { ...PRESET_DE_LA_BASE } }, destinoBien)
  const panel = sinComentarios(leer('_secciones/servicios/escenario/PanelDeServicio.tsx'))
  // [L3] Reemplazada por la spec (ítem 50): los paneles ya no tienen el CTA; el título, el video y «Leer más…» son `EnlaceAlServicio` (en
  // varios renglones), y el link del recomendador sigue siendo `EnlaceDelServicio`. Los DOS enlaces del archivo piden el viaje.
  const ctaBien = (c: string): boolean => (c.match(/<EnlaceDeRuta\s+href=\{DESTINO_DEL_SERVICIO\[id\]\}\s+onClick=\{\(e\) => pedirElViajeAlServicio\(e, PRESET_DEL_DESTINO\[id\]\)\}\s+[^>]*data-viaje-del-servicio=\{id\}/g) ?? []).length === 2
  afirmar(ctaBien(panel), '  los enlaces a la página del servicio (`EnlaceAlServicio`: el título, el video y «Leer más…» de los paneles y las pantallas sueltas; `EnlaceDelServicio`: el del recomendador) piden el viaje en su clic, con `data-viaje-del-servicio` para el banco')
  controlPositivo('  el detector ve el enlace del panel sin el pedido (pasaría el velo)', panel.replace(/\s+onClick=\{\(e\) => pedirElViajeAlServicio\(e, PRESET_DEL_DESTINO\[id\]\)\}/, ''), ctaBien)
  const viaje = sinComentarios(leer('_componentes/navegacion/viajeAlServicio.ts'))
  type SonidosDelViaje = { readonly sale: string; readonly llega: string }
  const sonidosBien = (s: SonidosDelViaje, c: string): boolean =>
    s.sale !== s.llega && Object.hasOwn(SONIDOS, s.sale) && Object.hasOwn(SONIDOS, s.llega) && /import \{ sonar \} from '\.\.\/\.\.\/_lib\/sonido\/bus'/.test(c) && !/howler|sonido\/motor/.test(c) && /arrancarElViaje\(ahora\)\s*sonarElViaje\('sale'\)/.test(c)
  afirmar(sonidosBien(SONIDOS_DEL_VIAJE, viaje), `los sonidos: «${SONIDOS_DEL_VIAJE.sale}» al salir (cuando el papel empieza a subir) y «${SONIDOS_DEL_VIAJE.llega}» al llegar (cuando aparece la página), del sprite y por el bus: con el sonido apagado no suenan`)
  controlPositivo('  el detector ve un sonido que no está en el sprite', { ...SONIDOS_DEL_VIAJE, llega: 'campana' } as SonidosDelViaje, (s: SonidosDelViaje) => sonidosBien(s, viaje))
  controlPositivo('  y el viaje que suena por su cuenta (sin el bus: ignoraría el mute)', `${viaje}\nimport { Howl } from 'howler'`, (c: string) => sonidosBien(SONIDOS_DEL_VIAJE, c))
  const levanta = (c: string): boolean => /const papel = enlace\.closest\('main'\)/.test(c) && /papel\.style\.clipPath = `inset\(/.test(c) && /papel\.animate\(\[\{ transform: 'translateY\(0px\)' \}, \{ transform: `translateY\(\$\{String\(-alto\)\}px\)` \}\]/.test(c) && /const sacarElPreset = apilarElPreset\(destino\)/.test(c) && /retenerLosGestos\(\(\) => true\)/.test(c) && /escenaCorriendo\(\) && escenaDeLaRutaLista\(\)/.test(c)
  afirmar(levanta(viaje), '  el papel que se levanta es lo que se ve del `<main>` del home (recortado al cuadro, sube una pantalla); antes, el preset del destino apilado, los gestos retenidos y la escena despierta con la variante del destino dibujada')
  controlPositivo('  el detector ve un viaje que levanta el papel sin esperar a la escena (se vería el último cuadro, viejo)', viaje.replace('escenaCorriendo() && escenaDeLaRutaLista()', 'true'), levanta)
}

principal()
  .then(() => cerrar('s78-b12b'))
  .catch((e: unknown) => {
    console.error(e)
    process.exit(1)
  })
