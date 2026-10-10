/**
 * PULIDO 11 — el invariante: npm run test:s62-pulido-11
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por subpunto:
 *   A1 · abrir Contacto sin el cuadrado negro: las caras de la placa se ven recién con el viaje terminado (la causa, medida con
 *        los cuadros del compositor: la cara de atrás asomaba antes de que la hoja se rasterizara).
 *   A2 · Quiénes somos: el titular no cruza el logo en la ENTRADA (esquiva con la caja del bloque; recibos de la entrada a 1024,
 *        1280, 1366, 1440 y 1920) y el cuerpo llega entero al reposo (su último renglón ya no queda a media máscara).
 *   A3 · mobile, el cartel de Portfolio: abajo de 1024 se desvanece en la huida antes de que el agrandamiento lo corte.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-11.md`.
 */
import { existsSync, readFileSync } from 'node:fs'

import { renderToStaticMarkup } from 'react-dom/server'

import { PlacaDelContacto } from '../../_chrome/contacto/PlacaDelContacto'
import { pedidoQueEsquiva, seCruzan, type Caja } from '../escena/titulos3d/esquivaDelLogo'
import { llegadaHastaElPie } from '../../_secciones/quienes-somos/geometria'
import { DESCANSO_ANTES_DE_SALIR_PX, ENTRADA_EN_CUADRO_PX } from '../../_secciones/_contrato/asentamiento'
import { opacidadDeLaHuidaAngosta, type AngostoDelCartel } from '../../_secciones/trabajos/angosto'
import { DISTANCIA_DEL_VUELO, poseDeLaHuida } from '../../_secciones/trabajos/tunel'
import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'

const V3 = 'src/app/v3'
const leer = (ruta: string): string => readFileSync(`${V3}/${ruta}`, 'utf8').replace(/\r\n/g, '\n')

// ═══════════════════════════════════════════════════════════════════════════
titulo('A1 · Abrir Contacto sin el cuadrado negro')

// Medido (`pulido-11/_scripts/a1-contacto.ts`, `Page.startScreencast`, con las caras pintadas de colores puros): a 1440, desde
// el hero y desde Portfolio, en los cuadros de ~378 a ~406 ms la cara de atrás asomaba como un rectángulo chico en el medio
// (la hoja todavía sin rasterizar, la placa lejos en su viaje). Era el cuadrado negro (la cara era de tinta hasta PULIDO 10).
// Ahora las cinco caras están en el árbol desde el principio (el espesor de verdad de s49) pero no se ven hasta que el viaje
// terminó (`llego`): en el viaje la placa va de frente y no aportan nada. Medido después: cero cuadros con una cara a la vista
// en el viaje; con el mouse a un costado, el espesor se ve.
const PLACA = leer('_chrome/contacto/PlacaDelContacto.tsx')
const carasDespuesDelViaje = (f: string): boolean => /className=\{cn\('absolute', c\.className, !llego && 'invisible'\)\}/.test(f)
afirmar(carasDespuesDelViaje(PLACA), 'A1 · las caras de la placa están ocultas hasta que el viaje termina (`!llego && invisible`)')
controlPositivo('A1 · el detector VE las caras de antes (siempre a la vista)', PLACA.replace(", !llego && 'invisible')", ')'), carasDespuesDelViaje)
const alMontar = renderToStaticMarkup(
  <PlacaDelContacto activa>
    <div data-parte="hoja" />
  </PlacaDelContacto>,
)
const carasOcultas = (h: string): boolean => {
  const caras = [...h.matchAll(/<div data-cara="([a-z]+)" aria-hidden="true" class="([^"]*)"/g)]
  return caras.length === 5 && caras.every((c) => c[2].split(' ').includes('invisible'))
}
afirmar(carasOcultas(alMontar), '  al montarse (el primer cuadro del viaje), las cinco caras están en el árbol y ocultas')
controlPositivo('  el detector VE una cara a la vista al montarse', alMontar.replace(/ invisible"/, '"'), carasOcultas)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A2 · Quiénes somos: el titular no cruza el logo en la entrada; el cuerpo llega entero al reposo')

// Por qué el invariante de J1 no lo vio: medía sólo el REPOSO (el destino del viaje de la barra). En la entrada el titular sube
// desde abajo del cuadro hasta arriba del logo, que ya está en el medio, y lo cruzaba entre ~330 y ~90 px antes del reposo
// (medido a 1024, 1280, 1366, 1440 y 1920). Ahora, mientras su sección entra, el titular (las cuatro partes, con la caja del
// bloque) no llega si cruza la caja del logo proyectado: espera arriba de él y llega con su mínimo.
const logo: Caja = { izquierda: 400, arriba: 264, derecha: 800, abajo: 512 }
const cruzando: Caja = { izquierda: 190, arriba: 317, derecha: 572, abajo: 377 }
const libre: Caja = { izquierda: 190, arriba: 137, derecha: 572, abajo: 197 }
const esquiva = (f: typeof pedidoQueEsquiva): boolean => f(1, true, cruzando, logo) === 0 && f(1, true, libre, logo) === 1 && f(1, false, cruzando, logo) === 1 && f(0.4, true, libre, null) === 0.4
afirmar(esquiva(pedidoQueEsquiva) && seCruzan(cruzando, logo) && !seCruzan(libre, logo), 'A2 · mientras la sección entra, un título que cruza el logo pide 0; libre (o en el reposo, o sin logo), lo del scroll')
const sinEsquivar: typeof pedidoQueEsquiva = (p) => p
controlPositivo('A2 · el detector VE la llegada de antes (sin esquivar)', sinEsquivar, esquiva)
const titulos = leer('_lib/escena/titulos3d/TitulosDeVolumen.tsx')
const titular3d = leer('_secciones/quienes-somos/titular3d.tsx')
const quienes = leer('_secciones/quienes-somos/QuienesSomos.tsx')
const delModulo = leer('_lib/escena/titulos3d/esquivaDelLogo.ts')
const cableado = (t: string, r: string, q: string, m: string): boolean =>
  /if \(a\.titulo\.esquivaElLogo && !enViaje\) a\.mostrado\.llegada = llegadaQueEsquiva\(a\.titulo, a\.mostrado\.llegada, y, logoEnElCuadro, asentar, reanudado, dt\)/.test(t) &&
  (r.match(/esquivaElLogo: true/g) ?? []).length === 2 && /data-esquiva-del-logo=""/.test(q) && /titulo\.closest<HTMLElement>\('\[data-esquiva-del-logo\]'\) \?\? titulo/.test(m)
afirmar(cableado(titulos, titular3d, quienes, delModulo), '  cableado: la escena esquiva los títulos marcados (fuera de un viaje); las dos partes de cada renglón del titular, con la caja del bloque')
controlPositivo('  el detector VE el titular sin marcar (cada parte con su caja: «Queremos hacer» llegaba solo)', [titulos, titular3d, quienes.replace('data-esquiva-del-logo=""', ''), delModulo] as const, ([t, r, q, m]: readonly [string, string, string, string]) => cableado(t, r, q, m))
// Los recibos del banco (`pulido-11/_scripts/a2-quienes.ts`, NVIDIA): de que la sección asoma al reposo, cada 48–60 px, las cajas
// de texto (DOM y 3D) y la silueta del logo, con el detector de J1 (`solapes.ts`): cero solapes en la entrada y en el reposo.
const RECIBOS = ['1024x768', '1280x800', '1366x768', '1440x900', '1920x1080'].map((t) => ({ t, ruta: `docs/rediseno/entregas/pulido-11/solapes-entrada-${t}.json` }))
type Recibo = { paradas: { relativo: number; solapes: unknown[] }[]; reposoDelViaje: { solapes: unknown[] } }
const entradaLimpia = (r: Recibo): boolean => r.paradas.filter((p) => p.relativo <= 0).length >= 8 && r.paradas.filter((p) => p.relativo <= 0).every((p) => p.solapes.length === 0) && r.reposoDelViaje.solapes.length === 0
const recibos = RECIBOS.map(({ ruta }) => (existsSync(ruta) ? (JSON.parse(readFileSync(ruta, 'utf8')) as Recibo) : null))
afirmar(recibos.every((r) => r !== null && entradaLimpia(r)), '  los recibos de la entrada a 1024 × 768, 1280 × 800, 1366 × 768, 1440 × 900 y 1920 × 1080: cero solapes de que asoma al reposo', RECIBOS.map(({ t, ruta }) => `${t}: ${existsSync(ruta) ? 'medido' : 'falta'}`).join(' · '))
const conSolape = recibos[0] === null ? null : { ...recibos[0], paradas: recibos[0].paradas.map((p, k) => (k === 3 ? { ...p, solapes: [{ tipo: 'logo', a: '3d: agencia-1-marcado', b: 'logo', area: 1536 }] } : p)) }
controlPositivo('  el detector de los recibos VE una parada con el titular sobre el logo', conSolape, (r: Recibo | null) => r !== null && entradaLimpia(r))
// El cuerpo: su bloque usa la ventana visible (termina cuando su pie sube 240 px sobre el borde); en el reposo su pie queda a
// ~36 px del borde y llegaba con el 48 % de la ventana (a 1024 × 768: alto 231): el último renglón a media máscara. Lo que llega
// al canal del texto termina cuando el pie toca el borde de abajo.
const enElReposo = (alto: number, aire: number): number => (alto + aire - ENTRADA_EN_CUADRO_PX) / (alto + DESCANSO_ANTES_DE_SALIR_PX - ENTRADA_EN_CUADRO_PX)
const entero = (f: (p: number, alto: number) => number): boolean => [[231, 36], [211, 34], [150, 30], [300, 20]].every(([h, a]) => f(enElReposo(h, a), h) >= 1) && f(0, 231) === 0
afirmar(entero((p, h) => llegadaHastaElPie(p, h, ENTRADA_EN_CUADRO_PX, DESCANSO_ANTES_DE_SALIR_PX)) && /<CanalDeTexto progreso=\{progreso === null \? null : hastaElPie\} tipo="parrafo" texto=\{CONTENIDO\.bajada\}>/.test(quienes), '  el cuerpo llega entero al reposo (en el reposo de 1024 a 1920 su llegada ya terminó) y sigue arrancando en 0')
controlPositivo('  el detector VE la llegada de antes (la ventana visible tal cual)', (p: number) => p, entero)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A3 · Mobile: el cartel de Portfolio no se corta en la huida')

// Medido (`a3-portfolio.ts`, `a3c-huida.ts`, a 375 y 390): llegando por scroll, por el menú y desde el CTA del hero el cartel
// llega entero (sin desborde de costado: `a3b-desborde.ts`). Lo «corrido y cortado» era la HUIDA hacia el túnel: el cartel va de
// margen a margen y la `translateZ` lo agranda desde el centro del cuadro; a ~1,2× («ortfolio», «ada uno de estos…») la opacidad
// todavía era ~0,7. Abajo de 1024 se desvanece al ritmo de su agrandamiento: 0 justo cuando su borde tocaría el del cuadro.
const A_390: AngostoDelCartel = { margen: 32, mitad: 195, foco: 844 * 1.5857 }
const borde = (a: AngostoDelCartel): number => a.foco * (1 - (a.mitad - a.margen) / a.mitad) // la z en que el borde toca el del cuadro
const noCorta = (f: typeof opacidadDeLaHuidaAngosta): boolean => {
  for (let t = 0; t <= 1; t += 0.01) {
    const pose = poseDeLaHuida(t)
    if (pose === null) continue
    if (pose.z >= borde(A_390) && f(pose.opacidad, pose.z, A_390) > 0.001) return false
  }
  return f(0.8, 10, null) === 0.8 && f(1, 0, A_390) === 1
}
afirmar(noCorta(opacidadDeLaHuidaAngosta) && DISTANCIA_DEL_VUELO > borde(A_390), 'A3 · abajo de 1024 el cartel ya es invisible cuando la huida lo agranda hasta el borde del cuadro; en escritorio (sin angosto) la de siempre')
const sinAngosto: typeof opacidadDeLaHuidaAngosta = (o) => o
controlPositivo('A3 · el detector VE la huida de antes (a ~1,2× todavía se veía, cortado)', sinAngosto, noCorta)
const piezasA3 = leer('_secciones/trabajos/piezas.tsx')
const enElCartel = (f: string): boolean => f.includes("el.style.setProperty('opacity', opacidadDeLaHuidaAngosta(pose.opacidad, pose.z, angostoDe(el)).toFixed(4))") && f.includes('const angostoDe = useAngostoDelCartel()')
afirmar(enElCartel(piezasA3), '  el cartel lo usa en cada cuadro de la huida (con las medidas del angosto: margen, mitad y foco de su escenario)')
controlPositivo('  el detector VE el cartel de antes', piezasA3.replace('opacidadDeLaHuidaAngosta(pose.opacidad, pose.z, angostoDe(el))', 'pose.opacidad'), enElCartel)

cerrar('s62-pulido-11')
