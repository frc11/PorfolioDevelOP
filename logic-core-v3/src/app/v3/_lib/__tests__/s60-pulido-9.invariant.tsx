/**
 * PULIDO 9 — el invariante: npm run test:s60-pulido-9
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   H1 · el polvo posado se vuelve a levantar: con la rueda (muescas con pausas cortas) el frente del despertar ya no se apaga,
 *        y a los N s la altura media y la dispersión vuelven a las del polvo suspendido; reversible.
 *   H2 · el formulario del pie: enviando sin moverse de su placa (el orden del rearmado) y de sólo lectura; la placa se
 *        transforma en la tarjeta de gracias (volteo, hundido y el fundido) y vuelve; el error deja todo; las banderas.
 *   H3 · Contacto: la carga 3D (un anillo en el material de la escena) y la tarjeta de gracias, que se cierra sola a los 3 s.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-9.md`.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'

import { DESPUES_DEL_ENVIO } from '../../_chrome/contacto/contenido'
import { CIERRE_MS } from '../../_chrome/contacto/FormularioDeContacto'
import { ENVIO_SIMULADO, envioSimulado } from '../formularios/enviar'
import { ANUNCIO_DE_EXITO, RESULTADO } from '../formularios/gracias'
import { VOLTEO, varianteDelVolteo, type VarianteDelVolteo } from '../formularios/volteo'
import { poseDeLaTransformacion } from '../escena/pie3d/transformacionDelPie'
import { FLOOR_Y } from '../escena/probeScene'
import { NUNCA, POSARSE, frenteInicial, polvoInicial, quietoConHisteresis, tomarElFrente, type EstadoDelPolvoVivo } from '../escena/polvo/posarse'
import { FISICA, SIMULACION_DEL_POLVO_GLSL } from '../escena/polvo/simulacion'
import { QUIETO, SUSPENDIDO, simular, type Cableado, type Tramo } from './modeloDelPolvo'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('H1 · El polvo posado se vuelve a levantar')

// El modelo (`modeloDelPolvo.ts`, compartido con `s61`): la máquina de la quietud de verdad y las reglas del shader con sus
// constantes. Lo que la escena le pasa a la simulación sale del cableado de `Fisica.tsx`, fijado por texto abajo.
const cableadoDeHoy: Cableado = (e, f) => {
  if (e.desperto - e.antes > POSARSE.empiezaS) tomarElFrente(f, e)
  // [PULIDO 10] J10 · y la quietud con la histéresis (la de hoy).
  return { desperto: f.desperto, origen: f.origen, quieto: quietoConHisteresis(e.quieto, f) }
}
/** El de antes: el despertar sólo en el cuadro en que era el último, si no uno de nunca. */
const cableadoDeAntes: Cableado = (e) => ({ desperto: e.desperto - e.antes > POSARSE.empiezaS ? e.desperto : -1e9, origen: e.origen, quieto: e.quieto })

const RUEDA_S = 10
const RUEDA: Tramo = { s: RUEDA_S, mueve: (t) => t % 0.6 < 0.1 }

// 1 · Con la rueda vuelve: posado (15 s quieto) → la rueda → a los RUEDA_S, la media y la dispersión del polvo suspendido.
// Y otra vez (reversible).
const GUION = [QUIETO, RUEDA, QUIETO, RUEDA] as const
const vuelve = (c: Cableado): boolean => {
  const [posado, levantado, otraVezPosado, otraVezLevantado] = simular(c, GUION)
  const enElPiso = (e: { media: number }): boolean => e.media < FLOOR_Y + 0.3
  const suspendido = (e: { media: number; dispersion: number }): boolean => Math.abs(e.media - SUSPENDIDO.media) < 0.3 && Math.abs(e.dispersion - SUSPENDIDO.dispersion) < 0.3
  return enElPiso(posado) && suspendido(levantado) && enElPiso(otraVezPosado) && suspendido(otraVezLevantado)
}
const medido = simular(cableadoDeHoy, GUION).map((e) => `${e.media.toFixed(2)} ± ${e.dispersion.toFixed(2)}`).join(' → ')
afirmar(vuelve(cableadoDeHoy), `1 · posado, con la rueda se levanta y a los ${String(RUEDA_S)} s tiene la altura media y la dispersión del polvo suspendido; otra vez quieto se posa y vuelve igual`, `suspendido ${SUSPENDIDO.media.toFixed(2)} ± ${SUSPENDIDO.dispersion.toFixed(2)}; posado → rueda → posado → rueda: ${medido}`)
controlPositivo('1 · el detector VE el código de antes: la muesca siguiente apaga el frente y lo lejano queda en el piso', cableadoDeAntes, vuelve)

// 2 · El cableado de la escena es ése: el frente se toma del despertar que encontró el polvo posado y es lo que lee la
// simulación (el despertar, su origen y el remolino). Y la regla del shader con la que llega a cada mota es la del modelo.
const fisica = leer('_lib/escena/polvo/Fisica.tsx')
const cableado = (c: string): boolean =>
  /const conRemolino = despertar\.desperto - despertar\.antes > POSARSE\.empiezaS\n\s*\/\/[^\n]*\n\s*if \(conRemolino\) tomarElFrente\(m\.frente, despertar\)/.test(c) &&
  c.includes('p.desperto = m.frente.desperto\n') &&
  c.includes('p.origen = m.frente.origen\n') &&
  c.includes('p.remolino = m.frente.delCursor ? 1 : 0') &&
  !c.includes('-1e9')
afirmar(cableado(fisica) && /bool despierta = uDesperto > desde && uReloj >= uDesperto \+ distance\( p\.xz, uOrigen\.xz \) \/ \$\{POSARSE\.velocidad\.toFixed\(1\)\};/.test(leer('_lib/escena/polvo/simulacion.ts')), '2 · la escena le pasa a la simulación el frente del último despertar con polvo posado; el shader lo hace llegar a cada mota como el modelo')
controlPositivo('2 · el detector VE el cableado de antes (un despertar de nunca fuera de su cuadro)', fisica.replace('p.desperto = m.frente.desperto\n', 'p.desperto = conRemolino ? despertar.desperto : -1e9\n'), cableado)
const frente = frenteInicial()
const estado: EstadoDelPolvoVivo = { ...polvoInicial(0), desperto: 9, antes: 2, origen: [1, 2, 3], delCursor: true }
tomarElFrente(frente, estado)
estado.origen[0] = 7
afirmar(frenteInicial().desperto === -NUNCA && frente.desperto === 9 && frente.origen.join() === '1,2,3' && frente.delCursor, '  el frente empieza en nunca y copia el despertar (el origen se copia, no se guarda)')

// 3 · Ninguna levantada queda así mientras hay movimiento: la de cerca de las caras de la caja, cuando llegó, se apaga en su
// lugar (su peso baja) y recién apagada es del aire; con la quietud se posa antes, como siempre.
const sim = SIMULACION_DEL_POLVO_GLSL
const vuelveDeCerca = (c: string): boolean => {
  const posa = c.indexOf(`if ( uPosarse > 0.5 && quieta > ${POSARSE.empiezaS.toFixed(1)} + retraso ) {\n\t\t\tsalida0 = vec4( p, modoConPeso( 1.0, peso, dt ) );`)
  const apaga = c.indexOf(`\t\tif ( llego ) {\n\t\t\tif ( peso <= dt / ${FISICA.fundido.saleS.toFixed(2)} ) {\n\t\t\t\tsalida0 = vec4( p - f, modoConPeso( 0.0, peso, dt ) );`)
  return posa > 0 && apaga > posa && c.slice(apaga).includes('salida0 = vec4( p, 5.0 + modoConPeso( 0.0, peso, dt ) );')
}
afirmar(vuelveDeCerca(sim), '3 · la levantada de cerca de las caras vuelve al aire cuando llegó, apagándose (con la quietud se posa antes)', 'medido en Portfolio de noche después de 15 s de rueda: antes 5.125 de 14.000 seguían levantadas; ahora 0')
controlPositivo('3 · el detector VE la levantada de cerca de las caras sin salida', sim.replace(/\t\tif \( llego \) \{[\s\S]*?\n\t\t\}\n\t\}/, '\t}'), vuelveDeCerca)

// ═══════════════════════════════════════════════════════════════════════════
titulo('H2 · El formulario del pie: enviando, gracias y error')

// 1 · La causa del desalineado: al rearmar una pieza (el botón pasa a «Enviando…»), la vieja se soltaba DESPUÉS de armar la
// nueva y `soltar` le borraba al mismo elemento el origen (`0 0`) que su homografía necesita. Ahora se suelta antes, y la
// nueva conserva la transformada.
const armadas = sinComentarios(leer('_lib/escena/pie3d/armadas.ts'))
const ordenBien = (c: string): boolean => {
  const rearmar = c.slice(c.indexOf('export function rearmar'), c.indexOf('function armar('))
  const suelta = rearmar.indexOf('else soltar(vieja)')
  const arma = rearmar.indexOf('const a = armar(p, medida, firma, estudio, estado)')
  const origen = c.slice(c.indexOf('function armar('), c.indexOf('export function soltar')).includes("pieza.elemento.style.transformOrigin = '0 0'")
  return suelta > 0 && arma > suelta && origen && rearmar.includes('p.elemento.style.transform = a.css')
}
afirmar(ordenBien(armadas), '1 · al rearmar el formulario («Enviando…», los errores), la vieja se suelta antes de armar la nueva: el DOM conserva el origen de su homografía y sigue sobre su placa', 'medido en el final con la órbita del mouse: antes los valores quedaban corridos de sus pozos; ahora, adentro')
controlPositivo('1 · el detector VE el orden de antes (armar y después soltar la vieja)', armadas.replace('      else soltar(vieja)\n', '\n').replace('    const a = armar(p, medida, firma, estudio, estado)\n', '    const a = armar(p, medida, firma, estudio, estado)\n    if (vieja !== undefined && !transforma) soltar(vieja)\n'), ordenBien)
const pie = sinComentarios(leer('_secciones/cierre/FormularioDelPie.tsx'))
const quietoAlEnviar = (c: string): boolean =>
  (c.match(/readOnly=\{enviando\}/g) ?? []).length === 2 &&
  // [PULIDO 11] B4 · un rótulo (Enviar: el error vive en su tarjeta). Mientras viaja, invisible guardando su ancho (y medido para la
  // tecla 3D, que lo apaga en el sombreador), con la carga chica encima: nada cambia de lugar.
  c.includes('{enviando && <Carga tamano="chico" textos={TEXTOS_DE_ENVIO} enLinea className="absolute inset-0 justify-center" />}') &&
  c.includes(`<span data-rotulo-de-la-tecla="" aria-hidden={enviando || undefined} className={cn('grid justify-items-center', enviando && 'invisible')}>`)
afirmar(quietoAlEnviar(pie), '  mientras viaja: los campos, de sólo lectura; el botón guarda el ancho del rótulo más largo (invisible) y la carga va encima (nada cambia de lugar)')
controlPositivo('  el detector VE los campos escribibles al enviar', pie.replace(/readOnly=\{enviando\} /, ''), quietoAlEnviar)

// 2 · La transformación de la placa (pura): la saliente y la entrante se cambian donde no se ve el cambio; al final, la
// entrante en su lugar exacto; de vuelta, igual.
const CAJA = { ancho: 253, alto: 181 }
const DESDE = { ancho: 253, alto: 400, dx: 0, dy: -63 }
const ESPESOR = 30
type Pose = (v: VarianteDelVolteo, t: number, entrante: boolean, quieto?: boolean) => { m: THREE.Matrix4; visible: boolean; aparece: number }
const pose: Pose = (v, t, entrante, quieto = false) => {
  const m = new THREE.Matrix4()
  const r = poseDeLaTransformacion(v, quieto, t, entrante, CAJA, DESDE, ESPESOR, m)
  return { m, ...r }
}
const normal = (m: THREE.Matrix4): THREE.Vector3 => new THREE.Vector3(0, 0, 1).transformDirection(m)
const esquina = (m: THREE.Matrix4): THREE.Vector3 => new THREE.Vector3(0, 0, 0).applyMatrix4(m)
const MITAD = 0.5 - 1e-4
const volteoBien = (p: Pose): boolean => {
  // [PULIDO 11] B1 · el volteo es `centrado` (la misma cuenta); el columpio, en s62.
  const [s0, sMitad, eMitad, e1] = [p('centrado', 0, false), p('centrado', MITAD, false), p('centrado', 0.5, true), p('centrado', 1, true)]
  const enSuLugar = esquina(s0.m).distanceTo(new THREE.Vector3(DESDE.dx, -DESDE.dy, 0)) < 1e-6 && normal(s0.m).z > 0.999
  const deCanto = Math.abs(normal(sMitad.m).z) < 0.01 && Math.abs(normal(eMitad.m).z) < 0.01
  const cambia = s0.visible && sMitad.visible && !p('centrado', 0.5, false).visible && eMitad.visible && !p('centrado', MITAD, true).visible
  return enSuLugar && deCanto && cambia && e1.m.equals(new THREE.Matrix4()) && e1.visible
}
afirmar(volteoBien(pose), '2 · volteo: la placa gira sobre X desde su lugar; a los 90° (de canto) la entrante sigue el giro con el mensaje y termina en su lugar exacto', `${String(VOLTEO.centrado.s)} s`)
controlPositivo('2 · el detector VE un cambio de placa que no es de canto (a los 45°)', ((v, t, e, q) => pose(v, e ? Math.max(t, 0.75) : Math.min(t, 0.25), e, q)) as Pose, volteoBien)
// [PULIDO 11] B1 · el hundido se borró (el humano eligió el volteo para los dos formularios).
const fundidoBien = (p: Pose): boolean => [0, 0.3, 0.7, 1].every((t) => Math.abs(p('centrado', t, true, true).aparece + p('centrado', t, false, true).aparece - 1) < 1e-9) && p('columpio', 0.5, true, true).m.equals(new THREE.Matrix4()) && p('centrado', 1, false, true).aparece === 0
afirmar(fundidoBien(pose), '  con movimiento reducido, un fundido: la saliente se va y la entrante aparece, quietas')
controlPositivo('  el detector VE el volteo con movimiento reducido', ((v, t, e) => pose(v, t, e, false)) as Pose, fundidoBien)

// 3 · El DOM: la tarjeta de gracias (la misma que Contacto), anunciada y con el foco; «Enviar otro mensaje» vuelve vacío;
// el error deja todo lo escrito; desde 1025 lo transforma la escena (`data-estado` y `data-gracias`, que lee el rearmado).
// [PULIDO 11] B · el resultado es la tarjeta del tamaño de la placa (éxito o error); Reintentar vuelve con todo lo escrito.
const estadosBien = (c: string, a: string): boolean =>
  /data-estado=\{resultado \? 'resultado' : 'formulario'\} data-volteo=\{variante\}/.test(c) &&
  /<TarjetaDeResultado[\s\S]*?tipo=\{estado\.fase === 'exito' \? 'exito' : 'error'\}[\s\S]*?alReintentar=\{reintentar\}[\s\S]*?alOtro=\{otroMensaje\}/.test(c) &&
  /<p role="status" className="sr-only">\s*\{estado\.fase === 'exito' \? ANUNCIO_DE_EXITO : ''\}/.test(c) &&
  /if \(r\.ok\) \{[\s\S]{0,240}?setEstado\(\{ fase: 'exito' \}\)\s*setDatos\(VACIO\)/.test(c) &&
  /\} else \{[\s\S]{0,160}?setEstado\(\{ fase: 'error', mensaje: r\.error \}\)/.test(c) && (c.match(/setDatos\(VACIO\)/g) ?? []).length === 1 &&
  /<AnimatePresence mode="wait" initial=\{false\}>/.test(c) && /transicionDelVolteo\(variante, reducido, enVolumen\)/.test(c) &&
  a.includes("const estado = p.elemento.getAttribute('data-estado')") && a.includes("varianteDelVolteo(p.elemento.getAttribute('data-volteo'))")
afirmar(estadosBien(pie, armadas), '3 · al llegar, la tarjeta del resultado anunciada y con el foco (y «Enviar otro mensaje»); con error, lo escrito queda y el error en su tarjeta, con Reintentar; desde 1025 la placa 3D voltea')
controlPositivo('3 · el detector VE un error que borra lo escrito', pie.replace("setEstado({ fase: 'error', mensaje: r.error })", "setEstado({ fase: 'error', mensaje: r.error })\n      setDatos(VACIO)"), (c: string) => estadosBien(c, armadas))
const tarjeta = sinComentarios(leer('_componentes/formularios/TarjetaDeResultado.tsx'))
const tarjetaBien = (c: string): boolean => /ref=\{lasDos\(foco, raiz\)\}\s*tabIndex=\{-1\}\s*data-tarjeta="resultado"/.test(c) && /data-sin-volumen=""/.test(c) && /RESULTADO\.exito\.titulo/.test(c) && /RESULTADO\.exito\.bajada/.test(c) && /onClick=\{alOtro\}/.test(c) && /onClick=\{alReintentar\}/.test(c) && /py-\[var\(--spacing-2\)\]/.test(c)
afirmar(tarjetaBien(tarjeta) && RESULTADO.exito.titulo === 'Recibido.' && RESULTADO.exito.bajada === 'Te contestamos pronto.' && varianteDelVolteo(null) === 'centrado' && varianteDelVolteo('columpio') === 'columpio' && varianteDelVolteo('hundido') === 'centrado', '  la tarjeta del resultado: enfocable, con el encastre, el título, la bajada y sus botones (con aire para el dedo); `?volteo=` elige la estrategia')
controlPositivo('  el detector VE una tarjeta que no recibe el foco', tarjeta.replace(/tabIndex=\{-1\}\s*/, ''), tarjetaBien)

// 4 · Las banderas para probar los estados: sólo en desarrollo, y no tocan la ruta (ni su límite de intentos).
const enviar = sinComentarios(leer('_lib/formularios/enviar.ts'))
const banderasBien = (f: typeof envioSimulado): boolean => f('?envio=lento', false) === 'lento' && f('?envio=error', false) === 'error' && f('?envio=otro', false) === null && f('', false) === null && f('?envio=lento', true) === null && f('?envio=error', true) === null && ENVIO_SIMULADO.demoraMs === 2500 && /return simulado === 'error' \? \{ ok: false, error: ERROR_DE_RED \} : \{ ok: true \}/.test(enviar)
afirmar(banderasBien(envioSimulado), '4 · `?envio=lento` (2,5 s y llega) y `?envio=error` (2,5 s y el error), sólo en desarrollo; no tocan la ruta')
controlPositivo('4 · el detector VE las banderas en producción', ((c: string) => envioSimulado(c, false)) as typeof envioSimulado, banderasBien)

// ═══════════════════════════════════════════════════════════════════════════
titulo('H3 · Contacto: la carga 3D y la tarjeta de gracias')

// 1 · Los estados del panel: el formulario se transforma en la carga (el anillo), la carga en la tarjeta (la misma del pie, la
// misma familia de transformación), y a los 3 s se cierra solo con una línea que se consume; con error, vuelve con todo.
const panel = sinComentarios(leer('_chrome/contacto/FormularioDeContacto.tsx'))
const panelBien = (c: string): boolean =>
  // [PULIDO 10] J3 · la carga es la de develOP (el anillo se fue); su estado lo anuncia ella (`role="status"`).
  /<motion\.div key="carga" ref=\{alLlegar\} tabIndex=\{-1\} \{\.\.\.cambio\} data-parte="carga"/.test(c) && c.includes('<Carga tamano="grande" textos={TEXTOS_DE_ENVIO} etiqueta={ROTULO_ENVIANDO} />') &&
  // [PULIDO 11] B · la tarjeta del resultado (éxito o error), con el volteo; la cuenta del cierre, desde que su texto está.
  /<motion\.div key="resultado" \{\.\.\.cambio\}[\s\S]{0,200}?<TarjetaDeResultado tipo=\{enviado \? 'exito' : 'error'\}/.test(c) && /const cambio = transicionDelVolteo\(variante, reducido\)/.test(c) &&
  /const reloj = window\.setTimeout\(cerrarContacto, CIERRE_MS\)\s*return \(\) => window\.clearTimeout\(reloj\)/.test(c) &&
  /animate=\{\{ width: textoListo \? '0%' : '100%' \}\} transition=\{\{ duration: textoListo \? CIERRE_MS \/ 1000 : 0, ease: 'linear' \}\}/.test(c) &&
  /if \(r\.estado === 'error'\) \{[\s\S]{0,240}?setFase\('error'\)/.test(c) && (c.match(/setDatos\(\{ intereses: \[\], \.\.\.VACIO \}\)/g) ?? []).length === 1 &&
  /<AnimatePresence onExitComplete=\{devolverElFoco\}>/.test(c) && /<p role="status" className="sr-only">\s*\{enviado \? DESPUES_DEL_ENVIO : ''\}/.test(c)
afirmar(panelBien(panel) && CIERRE_MS === 3000 && DESPUES_DEL_ENVIO === ANUNCIO_DE_EXITO, '1 · enviar transforma el formulario en la carga y la carga en la tarjeta de gracias (anunciada, con el foco); a los 3 s se cierra solo con su salida, el foco vuelve a quien lo abrió y una línea se consume; con error, todo lo escrito y el error', 'medido a 1440 y a 390: la línea de 766 a 291 px en 1,5 s; cerrado a los 3 s con el foco en quien lo abrió; Esc y la X cierran')
controlPositivo('1 · el detector VE un panel que no se cierra solo', panel.replace('const reloj = window.setTimeout(cerrarContacto, CIERRE_MS)', 'const reloj = 0'), panelBien)
controlPositivo('  y el «¡Gracias!» de texto suelto de antes', panel.replace(/<TarjetaDeResultado [^\n]*\/>/, '<p>¡Gracias! Te escribimos pronto.</p>'), panelBien)

// 2 · [PULIDO 10] J3 · El anillo se fue (lo reemplazó la carga de develOP, como pidió J3): el panel ya no carga un lienzo aparte
// ni un componente de three, y la carga tampoco (es SVG). Antes: el anillo 3D en su propio lienzo, con el material de la escena.
const carga = sinComentarios(leer('_componentes/carga/Carga.tsx'))
const sinLienzo = (p: string, c: string): boolean => !/AnilloDeCarga|dynamic\(|<Canvas|@react-three/.test(p) && !/<canvas|<Canvas|@react-three|from 'three'/.test(c)
afirmar(sinLienzo(panel, carga), '2 · la carga del panel es la de develOP, sin lienzo propio (ni el panel ni la carga traen WebGL)')
controlPositivo('2 · el detector VE el panel de antes (el anillo en su lienzo)', `${panel}
const AnilloDeCarga = dynamic(() => import('./AnilloDeCarga'), { ssr: false })`, (p: string) => sinLienzo(p, carga))

cerrar('s60-pulido-9')
