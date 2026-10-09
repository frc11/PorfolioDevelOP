/**
 * PULIDO 9 — el invariante: npm run test:s60-pulido-9
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por punto:
 *   H1 · el polvo posado se vuelve a levantar: con la rueda (muescas con pausas cortas) el frente del despertar ya no se apaga,
 *        y a los N s la altura media y la dispersión vuelven a las del polvo suspendido; reversible.
 *   H2 · el formulario del pie: enviando sin moverse de su placa (el orden del rearmado) y de sólo lectura; la placa se
 *        transforma en la tarjeta de gracias (volteo, hundido y el fundido) y vuelve; el error deja todo; las banderas.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-9.md`.
 */
import { readFileSync } from 'node:fs'

import * as THREE from 'three'

import { ENVIO_SIMULADO, envioSimulado } from '../formularios/enviar'
import { GRACIAS, varianteDeGracias, type VarianteDeGracias } from '../formularios/gracias'
import { TRANSFORMACION_DEL_PIE, poseDeLaTransformacion } from '../escena/pie3d/transformacionDelPie'
import { FLOOR_Y } from '../escena/probeScene'
import { NUNCA, POSARSE, avanzarElPolvoEn, frenteInicial, polvoInicial, tomarElFrente, type EstadoDelPolvoVivo, type FrenteDelPolvo } from '../escena/polvo/posarse'
import { FISICA, SIMULACION_DEL_POLVO_GLSL } from '../escena/polvo/simulacion'
import { POLVO_PAREJO, posicionesDelPolvoParejo } from '../escena/polvo/volumen'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')
const sinComentarios = (s: string): string => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// ═══════════════════════════════════════════════════════════════════════════
titulo('H1 · El polvo posado se vuelve a levantar')

// La máquina de la quietud es la de verdad (`avanzarElPolvoEn`); lo que la escena le pasa a la simulación (el despertar y su
// origen) sale del cableado de `Fisica.tsx`, fijado por texto abajo. Cada mota sigue, en la vertical, las reglas del shader con
// sus constantes: se suelta del aire con la quietud, cae al piso a tiempo, la levanta el frente (la regla `despierta`, fijada
// por texto) y sube a su lugar; pasado el soplo, vuelve al aire.
type Cableado = (e: EstadoDelPolvoVivo, f: FrenteDelPolvo) => { readonly desperto: number; readonly origen: readonly number[] }
const cableadoDeHoy: Cableado = (e, f) => {
  if (e.desperto - e.antes > POSARSE.empiezaS) tomarElFrente(f, e)
  return { desperto: f.desperto, origen: f.origen }
}
/** El de antes: el despertar sólo en el cuadro en que era el último, si no uno de nunca. */
const cableadoDeAntes: Cableado = (e) => ({ desperto: e.desperto - e.antes > POSARSE.empiezaS ? e.desperto : -1e9, origen: e.origen })

const DT = 1 / 30
const L = POLVO_PAREJO.lado
// La cámara mira hacia −z; la caja va delante (como `libre` del shader) y el despertar del scroll sale 6 u delante de ella.
const CAMARA = [0, FLOOR_Y + 3, 0] as const
const CENTRO = [0, CAMARA[1], -(L / 2 - POLVO_PAREJO.atras)] as const
const ORIGEN = [0, FLOOR_Y, -6] as const
const posiciones = posicionesDelPolvoParejo()
const N = posiciones.length / 3
const azar = (k: number): number => {
  const s = Math.sin(k * 12.9898 + 4.1414) * 43758.5453
  return s - Math.floor(s)
}
const [fx, fy, fz] = [new Float32Array(N), new Float32Array(N), new Float32Array(N)]
const pisoDe = new Float32Array(N)
for (let k = 0; k < N; k += 1) {
  fx[k] = CENTRO[0] + posiciones[k * 3]
  fy[k] = CENTRO[1] + posiciones[k * 3 + 1]
  fz[k] = CENTRO[2] + posiciones[k * 3 + 2]
  const r = azar(k) * 7.31
  pisoDe[k] = FLOOR_Y + 0.02 + (r - Math.floor(r)) * POSARSE.alturaPosada
}
// Las que el aire dibuja (su lugar arriba del piso del volumen): su altura y su dispersión en el aire son las de referencia.
const visibles = [...Array(N).keys()].filter((k) => fy[k] > POLVO_PAREJO.piso)
const estadistica = (alturas: (k: number) => number): { media: number; dispersion: number } => {
  let [s, s2] = [0, 0]
  for (const k of visibles) {
    s += alturas(k)
    s2 += alturas(k) ** 2
  }
  const media = s / visibles.length
  return { media, dispersion: Math.sqrt(Math.max(0, s2 / visibles.length - media * media)) }
}
const SUSPENDIDO = estadistica((k) => fy[k])

/** Un guion: cuántos segundos y si en cada instante hay movimiento (la rueda: una muesca de 0,1 s cada 0,6 s). */
interface Tramo {
  readonly s: number
  readonly mueve: (t: number) => boolean
}
const QUIETO: Tramo = { s: 15, mueve: () => false }
const RUEDA_S = 10
const RUEDA: Tramo = { s: RUEDA_S, mueve: (t) => t % 0.6 < 0.1 }

/** Corre el guion; devuelve la altura media y la dispersión al final de cada tramo. */
function simular(cableado: Cableado, guion: readonly Tramo[]): { media: number; dispersion: number }[] {
  const modo = new Uint8Array(N)
  const y = Float32Array.from(fy)
  const desde = new Float32Array(N)
  const polvo: EstadoDelPolvoVivo = { ...polvoInicial(0), origen: [0, 0, 0] }
  const frente = frenteInicial()
  let reloj = 0
  const salida: { media: number; dispersion: number }[] = []
  for (const tramo of guion) {
    for (let t = 0; t < tramo.s; t += DT) {
      reloj += DT
      avanzarElPolvoEn(polvo, reloj, tramo.mueve(t) ? ORIGEN : null, false)
      const u = cableado(polvo, frente)
      const quieta = reloj - polvo.quieto
      for (let k = 0; k < N; k += 1) {
        const retraso = azar(k) * POSARSE.desparejoS
        const piso = pisoDe[k]
        const despierta = u.desperto > desde[k] && reloj >= u.desperto + Math.hypot(fx[k] - u.origen[0], fz[k] - u.origen[2]) / POSARSE.velocidad
        if (modo[k] === 0) {
          if (quieta > POSARSE.empiezaS + retraso) [modo[k], desde[k]] = [1, reloj]
          else y[k] = fy[k]
          continue
        }
        if (modo[k] === 1 || modo[k] === 2) {
          if (despierta) [modo[k], desde[k]] = [5, reloj]
          else if (modo[k] === 1) {
            const falta = Math.max(0.6, POSARSE.asentadoS + retraso * 0.3 - quieta)
            y[k] -= Math.max(FISICA.caida.minima, (y[k] - piso) / falta) * DT
            if (y[k] <= piso) [y[k], modo[k]] = [piso, 2]
            continue
          } else continue
        }
        // Levantada: sube a su lugar (con su constante y su tope) y, pasado el soplo, si llegó vuelve al aire.
        const lugar = Math.max(fy[k], piso)
        const hacia = Math.max(-FISICA.vuelta.tope, Math.min(FISICA.vuelta.tope, (lugar - y[k]) / FISICA.vuelta.s))
        y[k] = Math.max(piso, y[k] + hacia * DT)
        const pasado = reloj - desde[k] - (FISICA.soplo.s + azar(k) * FISICA.soplo.azar)
        if (pasado <= 0) continue
        const llego = Math.abs(y[k] - fy[k]) < FISICA.vuelta.entrega || fy[k] < POLVO_PAREJO.piso || pasado > FISICA.vuelta.esperaS
        if (llego) modo[k] = 0
        else if (quieta > POSARSE.empiezaS + retraso) [modo[k], desde[k]] = [1, reloj]
      }
    }
    salida.push(estadistica((k) => (modo[k] === 0 ? fy[k] : y[k])))
  }
  return salida
}

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
  /<span aria-hidden="true" className="invisible col-start-1 row-start-1">\s*\{enviando \? c\.enviar : c\.enviando\}/.test(c) &&
  /className="absolute left-\[var\(--spacing-2\)\] size-\[var\(--spacing-4\)\] animate-spin/.test(c)
afirmar(quietoAlEnviar(pie), '  mientras viaja: los campos, de sólo lectura; el botón guarda el ancho del rótulo más largo y la ruedita va en su aire (nada cambia de lugar)')
controlPositivo('  el detector VE los campos escribibles al enviar', pie.replace(/readOnly=\{enviando\} /, ''), quietoAlEnviar)

// 2 · La transformación de la placa (pura): la saliente y la entrante se cambian donde no se ve el cambio; al final, la
// entrante en su lugar exacto; de vuelta, igual.
const CAJA = { ancho: 253, alto: 181 }
const DESDE = { ancho: 253, alto: 400, dx: 0, dy: -63 }
const ESPESOR = 30
type Pose = (v: VarianteDeGracias, t: number, entrante: boolean, quieto?: boolean) => { m: THREE.Matrix4; visible: boolean; aparece: number }
const pose: Pose = (v, t, entrante, quieto = false) => {
  const m = new THREE.Matrix4()
  const r = poseDeLaTransformacion(v, quieto, t, entrante, CAJA, DESDE, ESPESOR, m)
  return { m, ...r }
}
const normal = (m: THREE.Matrix4): THREE.Vector3 => new THREE.Vector3(0, 0, 1).transformDirection(m)
const esquina = (m: THREE.Matrix4): THREE.Vector3 => new THREE.Vector3(0, 0, 0).applyMatrix4(m)
const MITAD = 0.5 - 1e-4
const volteoBien = (p: Pose): boolean => {
  const [s0, sMitad, eMitad, e1] = [p('volteo', 0, false), p('volteo', MITAD, false), p('volteo', 0.5, true), p('volteo', 1, true)]
  const enSuLugar = esquina(s0.m).distanceTo(new THREE.Vector3(DESDE.dx, -DESDE.dy, 0)) < 1e-6 && normal(s0.m).z > 0.999
  const deCanto = Math.abs(normal(sMitad.m).z) < 0.01 && Math.abs(normal(eMitad.m).z) < 0.01
  const cambia = s0.visible && sMitad.visible && !p('volteo', 0.5, false).visible && eMitad.visible && !p('volteo', MITAD, true).visible
  return enSuLugar && deCanto && cambia && e1.m.equals(new THREE.Matrix4()) && e1.visible
}
afirmar(volteoBien(pose), '2 · volteo: la placa gira sobre X desde su lugar; a los 90° (de canto) la entrante sigue el giro con el mensaje y termina en su lugar exacto', `${String(TRANSFORMACION_DEL_PIE.volteo.s)} s`)
controlPositivo('2 · el detector VE un cambio de placa que no es de canto (a los 45°)', ((v, t, e, q) => pose(v, e ? Math.max(t, 0.75) : Math.min(t, 0.25), e, q)) as Pose, volteoBien)
const H = TRANSFORMACION_DEL_PIE.hundido
const hundidoBien = (p: Pose): boolean => {
  const antesDeCambiar = p('hundido', H.aplana - 1e-4, false)
  const alCambiar = p('hundido', H.aplana, true)
  const plana = (m: THREE.Matrix4): boolean => new THREE.Vector3().setFromMatrixScale(m).z < H.plano + 0.01
  const mismoLugar = esquina(antesDeCambiar.m).distanceTo(esquina(alCambiar.m)) < 0.5 && Math.abs(new THREE.Vector3().setFromMatrixScale(alCambiar.m).y * CAJA.alto - DESDE.alto) < 0.5
  return plana(antesDeCambiar.m) && plana(alCambiar.m) && mismoLugar && p('hundido', 1, true).m.equals(new THREE.Matrix4()) && !p('hundido', H.aplana, false).visible
}
afirmar(hundidoBien(pose), '  hundido: el relieve se hunde hasta aplanarse, la plana toma el lugar y el tamaño de la saliente, se ajusta al suyo y el mensaje sale en relieve hasta su lugar exacto')
controlPositivo('  el detector VE la entrante que aparece en su tamaño (salta)', ((v, t, e, q) => (e && t < 1 ? { m: new THREE.Matrix4().makeScale(1, 1, H.plano), visible: t >= H.aplana, aparece: 1 } : pose(v, t, e, q))) as Pose, hundidoBien)
const fundidoBien = (p: Pose): boolean => [0, 0.3, 0.7, 1].every((t) => Math.abs(p('volteo', t, true, true).aparece + p('volteo', t, false, true).aparece - 1) < 1e-9) && p('hundido', 0.5, true, true).m.equals(new THREE.Matrix4()) && p('volteo', 1, false, true).aparece === 0
afirmar(fundidoBien(pose), '  con movimiento reducido, un fundido: la saliente se va y la entrante aparece, quietas')
controlPositivo('  el detector VE el volteo con movimiento reducido', ((v, t, e) => pose(v, t, e, false)) as Pose, fundidoBien)

// 3 · El DOM: la tarjeta de gracias (la misma que Contacto), anunciada y con el foco; «Enviar otro mensaje» vuelve vacío;
// el error deja todo lo escrito; desde 1025 lo transforma la escena (`data-estado` y `data-gracias`, que lee el rearmado).
const estadosBien = (c: string, a: string): boolean =>
  /data-estado=\{estado\.fase === 'gracias' \? 'gracias' : 'formulario'\} data-gracias=\{variante\}/.test(c) &&
  /<TarjetaDeGracias foco=\{tomarElFoco\('tarjeta'\)\} enVolumen=\{enVolumen\} alOtro=\{otroMensaje\} \/>/.test(c) &&
  /<p role="status" className="sr-only">\s*\{estado\.fase === 'gracias' \? ANUNCIO_DE_GRACIAS : ''\}/.test(c) &&
  /if \(r\.ok\) \{\s*pedirFoco\.current = 'tarjeta'\s*setEstado\(\{ fase: 'gracias' \}\)\s*setDatos\(VACIO\)/.test(c) &&
  /\} else \{\s*setEstado\(\{ fase: 'error', mensaje: r\.error \}\)/.test(c) && (c.match(/setDatos\(VACIO\)/g) ?? []).length === 1 &&
  /<AnimatePresence mode="wait" initial=\{false\}>/.test(c) && /transicionDeGracias\(variante, reducido, enVolumen\)/.test(c) &&
  a.includes("const estado = p.elemento.getAttribute('data-estado')") && a.includes("varianteDeGracias(p.elemento.getAttribute('data-gracias'))")
afirmar(estadosBien(pie, armadas), '3 · al llegar, la tarjeta de gracias anunciada y con el foco (y «Enviar otro mensaje»); con error, lo escrito queda y el error a la vista; desde 1025 la placa 3D se transforma')
controlPositivo('3 · el detector VE un error que borra lo escrito', pie.replace("setEstado({ fase: 'error', mensaje: r.error })", "setEstado({ fase: 'error', mensaje: r.error })\n      setDatos(VACIO)"), (c: string) => estadosBien(c, armadas))
const tarjeta = sinComentarios(leer('_componentes/formularios/TarjetaDeGracias.tsx'))
const tarjetaBien = (c: string): boolean => /tabIndex=\{-1\} data-tarjeta="gracias"/.test(c) && /data-relieve="" data-fuente="archivo"/.test(c) && /\{GRACIAS\.titulo\}/.test(c) && /\{GRACIAS\.bajada\}/.test(c) && /onClick=\{alOtro\}/.test(c) && /py-\[var\(--spacing-2\)\]/.test(c)
afirmar(tarjetaBien(tarjeta) && GRACIAS.titulo === 'Gracias por tu mensaje.' && GRACIAS.bajada === 'Te contestamos pronto.' && varianteDeGracias(null) === 'volteo' && varianteDeGracias('hundido') === 'hundido' && varianteDeGracias('otra') === 'volteo', '  la tarjeta: enfocable, con el título en Archivo en relieve, la bajada y el enlace (con aire para el dedo); `?gracias=` elige la variante')
controlPositivo('  el detector VE una tarjeta que no recibe el foco', tarjeta.replace('tabIndex={-1} ', ''), tarjetaBien)

// 4 · Las banderas para probar los estados: sólo en desarrollo, y no tocan la ruta (ni su límite de intentos).
const enviar = sinComentarios(leer('_lib/formularios/enviar.ts'))
const banderasBien = (f: typeof envioSimulado): boolean => f('?envio=lento', false) === 'lento' && f('?envio=error', false) === 'error' && f('?envio=otro', false) === null && f('', false) === null && f('?envio=lento', true) === null && f('?envio=error', true) === null && ENVIO_SIMULADO.demoraMs === 2500 && /return simulado === 'error' \? \{ ok: false, error: ERROR_DE_RED \} : \{ ok: true \}/.test(enviar)
afirmar(banderasBien(envioSimulado), '4 · `?envio=lento` (2,5 s y llega) y `?envio=error` (2,5 s y el error), sólo en desarrollo; no tocan la ruta')
controlPositivo('4 · el detector VE las banderas en producción', ((c: string) => envioSimulado(c, false)) as typeof envioSimulado, banderasBien)

cerrar('s60-pulido-9')
