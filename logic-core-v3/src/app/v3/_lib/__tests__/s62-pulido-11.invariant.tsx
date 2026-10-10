/**
 * PULIDO 11 — el invariante: npm run test:s62-pulido-11
 *
 * Cada comportamiento nuevo del sprint queda FIJADO acá, con su control positivo. Una sección por subpunto:
 *   A1 · abrir Contacto sin el cuadrado negro: las caras de la placa se ven recién con el viaje terminado (la causa, medida con
 *        los cuadros del compositor: la cara de atrás asomaba antes de que la hoja se rasterizara).
 *   A2 · Quiénes somos: el titular no cruza el logo en la ENTRADA (esquiva con la caja del bloque; recibos de la entrada a 1024,
 *        1280, 1366, 1440 y 1920) y el cuerpo llega entero al reposo (su último renglón ya no queda a media máscara).
 *   A3 · mobile, el cartel de Portfolio: abajo de 1024 se desvanece en la huida antes de que el agrandamiento lo corte.
 *   A4b · Quiénes somos de noche (abajo de 1024): el velo detrás de los textos que cruzan el logo, sin cortar la mezcla, en AA.
 *   A4e · el CTA abajo de 1024: la frase desde la izquierda y HABLANOS desde la derecha, en volumen y anclados, función del
 *         scroll, terminando juntos; sin «Seis razones» que reaparezcan, sin volteo ni giro.
 *   A5 · J10 medido en el banco: con un solo toque el polvo termina de subir y queda en el aire antes de volver a posarse.
 *   B1 · el volteo de los dos formularios: lo nuevo comparte el eje de lo que estaba (`?volteo=centrado|columpio`).
 *   B2 · el éxito ENCAJA: la pieza del logo cae en su ranura, el pestillo, la onda de luz y después el texto.
 *   B3 · el error NO ENCAJA: el rojo (el primer color fuera del monocromo) como token y en AA; Reintentar con todo intacto.
 *   B4 · los rótulos del botón se suceden: la carga y «Reintentar» nunca a la vez (tampoco el relieve de la tecla 3D).
 *   B5 · la carga gira sobre el palito de la P, con el palito en el medio (el trazo, de respaldo).
 *   B6 · terminado el éxito, el formulario se limpia (los valores y el estado del autocompletado).
 *   C2 · la cabecera abajo de 1024: el parlante a la izquierda, el menú al centro y el progreso a la derecha, del mismo tamaño,
 *        en el mismo eje y adentro de la zona segura.
 * El plan y el log: `docs/rediseno/SPRINT-PULIDO-11.md`.
 */
import { existsSync, readFileSync } from 'node:fs'

import { MotionConfig } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as THREE from 'three'

import { LOGO_INK_VIEWBOX, LOGO_PATH_D } from '@/components/ui/LogoMark'

import { PlacaDelContacto } from '../../_chrome/contacto/PlacaDelContacto'
import { pedidoQueEsquiva, seCruzan, type Caja } from '../escena/titulos3d/esquivaDelLogo'
import { llegadaHastaElPie } from '../../_secciones/quienes-somos/geometria'
import { DESCANSO_ANTES_DE_SALIR_PX, ENTRADA_EN_CUADRO_PX } from '../../_secciones/_contrato/asentamiento'
import { opacidadDeLaHuidaAngosta, type AngostoDelCartel } from '../../_secciones/trabajos/angosto'
import { DISTANCIA_DEL_VUELO, poseDeLaHuida } from '../../_secciones/trabajos/tunel'
import { DESLIZAMIENTO_EN_LA_LISTA, LISTA_DEL_CTA, deslizadoEnLaLista, progresoEnLaLista, tocableEnLaLista } from '../escena/ctaDelFinal/transformacion'
import { anguloDelColumpio, poseDeLaTransformacion } from '../escena/pie3d/transformacionDelPie'
import { VOLTEO, caidaDelColumpio, transicionDelVolteo, type TransicionDelVolteo, type VarianteDelVolteo } from '../formularios/volteo'
import { RESULTADO } from '../formularios/gracias'
import { ENCAJE } from '../../_componentes/formularios/EncajeDelLogo'
import { TarjetaDeResultado } from '../../_componentes/formularios/TarjetaDeResultado'
import { EJE_DEL_PALITO, PALITO_DE_LA_P } from '../../_componentes/carga/Carga'
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4b · Quiénes somos de noche: el velo detrás de los textos (abajo de 1024), en AA y sin cortar la mezcla')

// Los textos de la sección abajo de 1024 mezclan (`difference`) y sobre el logo de noche (gris) daban gris sobre gris. El velo
// (la receta de Portfolio) va en la CAJA del texto, no en el texto que mezcla (adentro del grupo que se mezcla no oscurecería
// nada), y crece con la noche que se ve (`--noche-de-la-sala`, la escribe la sección). Medido con la noche puesta (subiendo de
// Portfolio): sin velo 4,04 y 3,52:1; con el velo al 92 %, 5,65 / 5,51 / 5,19:1.
const banda = leer('_estilos/banda.css')
const equipo = leer('_secciones/quienes-somos/equipo.tsx')
const velo = (css: string, eq: string, q: string): boolean => {
  const angosto = css.slice(css.indexOf('@media (width < 1024px)'))
  const marcas = [...eq.matchAll(/<(div|figcaption)\s+data-velo-de-noche=""([^>]*)>/g)]
  return /\[data-panel='quienes-somos'\] \[data-velo-de-noche\]::before \{[^}]*z-index: -1;[^}]*background: var\(--degrade-del-velo-de-noche\);/.test(angosto) &&
    /--velo-de-noche: color-mix\(in srgb, var\(--color-tinta\) calc\(var\(--noche-de-la-sala, 0\) \* 92%\), transparent\);/.test(angosto) &&
    marcas.length === 3 && marcas.every((m) => !m[2].includes('MEZCLA_SOBRE_LA_ESCENA')) &&
    q.includes("el.style.setProperty('--noche-de-la-sala', noche.toFixed(3))") && q.includes('useNocheEnLaSeccion(seccion.id)')
}
afirmar(velo(banda, equipo, quienes), 'A4b · el velo de noche abajo de 1024: detrás (z −1) de la caja de Franco, Valentino y Nosotros (nunca en el texto que mezcla), con la tinta de la noche que se ve')
controlPositivo('A4b · el detector VE el velo puesto EN el texto que mezcla (adentro del grupo: no oscurece nada)', [banda, equipo.replace('<div data-velo-de-noche="">', '<div data-velo-de-noche="" className={MEZCLA_SOBRE_LA_ESCENA}>'), quienes] as const, ([c, e, q]: readonly [string, string, string]) => velo(c, e, q))
type Medida = { bloque: string; contraste: number }
const reciboDelVelo = JSON.parse(readFileSync('docs/rediseno/entregas/pulido-11/velo-de-noche.json', 'utf8')) as { sinVelo: Medida[]; conVelo92: Medida[] }
const enAA = (r: Medida[]): boolean => r.length >= 3 && r.every((m) => m.contraste >= 4.5)
afirmar(enAA(reciboDelVelo.conVelo92), '  con el velo, los tres bloques en AA (≥ 4,5:1) con la noche puesta', reciboDelVelo.conVelo92.map((m) => `${m.bloque} ${String(m.contraste)}`).join(' · '))
controlPositivo('  el detector VE los de sin velo (por debajo de AA)', [...reciboDelVelo.sinVelo, { bloque: '-', contraste: 9 }], enAA)

// ═══════════════════════════════════════════════════════════════════════════
titulo('A4e · El CTA abajo de 1024: la frase desde la izquierda y HABLANOS desde la derecha')

// Antes, en la lista, las copias de «Seis razones» y de los seis valores reaparecían en el medio del bloque clavado y se
// volteaban en la frase (y «Seis razones» giraba en HABLANOS): «de la nada». Ahora las copias no se ven (sólo le dan a la escena
// de dónde medir), las piezas en volumen están ya formadas (las poses de 1) y se deslizan, cada grupo en su plano anclado en la
// sala: el lienzo (la frase) desde la izquierda y el marco (HABLANOS y su subrayado) desde la derecha, con el MISMO avance.
const recorrido = (r: number): number => deslizadoEnLaLista(progresoEnLaLista(r))
const deslizaBien = (f: (r: number) => number): boolean => {
  let antes = -1
  for (let r = 0; r <= 1.0001; r += 0.01) {
    const d = f(r)
    if (d < antes - 1e-9) return false
    antes = d
  }
  return f(LISTA_DEL_CTA.desde) === 0 && f(0.6) === 1 && f(1) === 1 && f(0.4) > 0.2 && f(0.4) < 0.8
}
afirmar(deslizaBien(recorrido), 'A4e · el deslizamiento es función del scroll (reversible, monótono): arranca a 0,2 del bloque clavado (el logo ya abajo) y termina a 0,6')
controlPositivo('A4e · el detector VE un salto (aparece de golpe)', (r: number) => (r >= 0.5 ? 1 : 0), deslizaBien)
afirmar(!tocableEnLaLista(DESLIZAMIENTO_EN_LA_LISTA.hasta * 0.6) && tocableEnLaLista(DESLIZAMIENTO_EN_LA_LISTA.hasta), '  HABLANOS se puede tocar apenas se lee (al 90 % del deslizamiento), no antes')
const escenaDelCta = leer('_lib/escena/ctaDelFinal/EscenaDelCta.tsx')
const ctaEnLaLista = leer('_secciones/por-que-develop/CtaTransformado.tsx')
const sinGiro = (e: string, l: string): boolean =>
  e.includes("const formado = enLaLista ? 1 : p") && /posesDe\(formado, /.test(e) && e.includes('s.cuadro = cuadroDeAhora(s, s.medidas, formado)') &&
  e.includes('const fuera = enLaLista ? 1 - deslizadoEnLaLista(p) : 0') && e.includes('correrDeCostado(a.marco, fuera * tam.width)') && e.includes('correrDeCostado(a.lienzo, -fuera * tam.width)') &&
  e.includes('correrElLugarDeCostado(s.planos.cta, fuera * tam.width)') &&
  (l.match(/className="pointer-events-none invisible absolute/g) ?? []).length === 2 && !/opacity: listo \? 0 : copia/.test(l) && /<DestinoDelCta rotulo=\{CTA\.rotulo\} destino=\{CTA\.destino\} progreso=\{progreso\} enLaLista \/>/.test(l)
afirmar(sinGiro(escenaDelCta, ctaEnLaLista), '  en la escena: poses y frase ya formadas en la lista; el marco a la derecha y el lienzo a la izquierda con el mismo avance (terminan juntos); el enlace va con HABLANOS; las copias, invisibles')
controlPositivo('  el detector VE la lista de antes (el giro y el volteo con el progreso)', [escenaDelCta.replace('posesDe(formado, ', 'posesDe(p, '), ctaEnLaLista] as const, ([e, l]: readonly [string, string]) => sinGiro(e, l))

// ═══════════════════════════════════════════════════════════════════════════
titulo('A5 · J10 en el banco: el polvo con un solo toque')

// El recibo (`a5-polvo.ts`, 1440 × 900, NVIDIA): posado del todo, UNA muesca de la rueda y los modos cada 250 ms. Lo que J10
// pidió: una vez despertado termina de subir (ninguna cae antes de que estén todas en el aire) y pasa un tiempo en el aire
// (~6 s) antes de volver a evaluar si se posa. Medido: todas en el aire a los 9,3 s; la primera cae a los 15,7 s (6,4 s
// después); a los 26 s, posadas otra vez (el modelo de s61 decía 7,0 y 15,6: la subida real es un poco más lenta).
type Cuadro = { s: number; modos: number[] }
const polvo = JSON.parse(readFileSync('docs/rediseno/entregas/pulido-11/polvo-con-un-toque.json', 'utf8')) as { posado: number[]; toque: Cuadro[] }
const conHisteresis = (serie: Cuadro[]): boolean => {
  const lleno = serie.find((c) => c.modos[0] === 14000)
  const cae = serie.find((c) => c.s > 0.5 && c.modos[1] > 0)
  if (lleno === undefined || cae === undefined) return false
  return cae.s > lleno.s && cae.s - lleno.s >= 5 && serie.filter((c) => c.s < lleno.s && c.modos[1] > 0).length === 0 && serie[serie.length - 1].modos[2] > 13500
}
afirmar(polvo.posado[2] > 13500 && conHisteresis(polvo.toque), 'A5 · con un toque: todas suben antes de que caiga ninguna, quedan ≥ 5 s en el aire y después se vuelven a posar')
controlPositivo('A5 · el detector VE el polvo de antes (a los 4 s vuelve a bajar antes de terminar de subir)', polvo.toque.map((c) => (c.s > 4 && c.s < 6 ? { s: c.s, modos: [c.modos[0], 900, c.modos[2], c.modos[3], c.modos[4], c.modos[5]] } : c)), conHisteresis)

// ═══════════════════════════════════════════════════════════════════════════
titulo('B1 · El volteo: lo nuevo comparte el eje de lo que estaba (`?volteo=centrado|columpio`)')

// El salto de PULIDO 10: la tarjeta de gracias era más chica que el formulario y su columna se recentraba, así que al cambiar de
// canto la nueva aparecía corrida. Ahora la tarjeta guarda la caja del formulario (`alto`) y las dos giran sobre EL MISMO eje en
// todo el volteo: `centrado`, el horizontal del medio; `columpio`, la bisagra del borde de arriba. Con la pose pura de la placa 3D
// (`transformacionDelPie.ts`, px de la pieza: y hacia arriba, la cara en z = 0, la cámara en +z) y con la del DOM (Motion).
const CAJA_B1 = { ancho: 420, alto: 380 }
const ESPESOR_B1 = 30
type Pose = typeof poseDeLaTransformacion
const enLaPose = (pose: Pose, v: VarianteDelVolteo, t: number, entrante: boolean, p: THREE.Vector3): THREE.Vector3 => {
  const m = new THREE.Matrix4()
  pose(v, false, t, entrante, CAJA_B1, { ...CAJA_B1, dx: 0, dy: 0 }, ESPESOR_B1, m)
  return p.clone().applyMatrix4(m)
}
const MUESTRAS_B1 = Array.from({ length: 81 }, (_, k) => k / 80)
// El eje: sus dos puntas (en el medio del espesor).
const ejeDe = (v: VarianteDelVolteo): THREE.Vector3[] => {
  const y = v === 'centrado' ? -CAJA_B1.alto / 2 : 0
  return [new THREE.Vector3(0, y, -ESPESOR_B1 / 2), new THREE.Vector3(CAJA_B1.ancho, y, -ESPESOR_B1 / 2)]
}
const compartenElEje = (pose: Pose): boolean =>
  (['centrado', 'columpio'] as const).every((v) => MUESTRAS_B1.every((t) => [false, true].every((entrante) => ejeDe(v).every((p) => enLaPose(pose, v, t, entrante, p).distanceTo(p) < 1e-6))))
afirmar(compartenElEje(poseDeLaTransformacion), 'B1 · en las dos estrategias, la que estaba y la nueva giran sobre el mismo eje en todo el volteo (centrado: el del medio; columpio: la bisagra de arriba)')
const conSalto: Pose = (v, q, t, e, c, d, esp, m) => {
  const r = poseDeLaTransformacion(v, q, t, e, c, d, esp, m)
  if (e) m.premultiply(new THREE.Matrix4().makeTranslation(0, -63, 0))
  return r
}
controlPositivo('B1 · el detector VE el salto de antes (la nueva corrida 63 px, la columna recentrada)', conSalto, compartenElEje)

// Se cambian DE CANTO: la que estaba se deja de ver y la nueva aparece justo cuando las dos están a 90° (la normal de la cara, de
// costado). El corte del columpio es el final de su caída.
const normalZ = (v: VarianteDelVolteo, t: number, entrante: boolean): number => {
  const m = new THREE.Matrix4()
  poseDeLaTransformacion(v, false, t, entrante, CAJA_B1, { ...CAJA_B1, dx: 0, dy: 0 }, ESPESOR_B1, m)
  return new THREE.Vector3(0, 0, 1).transformDirection(m).z
}
const CORTE = { centrado: 0.5, columpio: VOLTEO.columpio.cae / (VOLTEO.columpio.cae + VOLTEO.columpio.asienta) } as const
const seVeDe = (v: VarianteDelVolteo, t: number, entrante: boolean): boolean => poseDeLaTransformacion(v, false, t, entrante, CAJA_B1, { ...CAJA_B1, dx: 0, dy: 0 }, ESPESOR_B1, new THREE.Matrix4()).visible
const deCanto = (corte: Readonly<Record<VarianteDelVolteo, number>>): boolean =>
  (['centrado', 'columpio'] as const).every((v) => {
    const c = corte[v]
    return Math.abs(normalZ(v, c - 1e-6, false)) < 1e-3 && Math.abs(normalZ(v, c, true)) < 1e-3 && seVeDe(v, c - 1e-6, false) && !seVeDe(v, c, false) && !seVeDe(v, c - 1e-6, true) && seVeDe(v, c, true)
  })
afirmar(deCanto(CORTE), '  las dos se cambian de canto (a 90°): una deja de verse en el mismo instante en que la otra aparece')
controlPositivo('  el detector VE un cambio a destiempo (el columpio cambiando a la mitad del tiempo, no al final de la caída)', { ...CORTE, columpio: 0.5 }, deCanto)

// El columpio: la que estaba gira hacia ADENTRO (su borde de abajo se va al fondo, z < 0) y cae como un cuerpo (arranca quieta y
// acelera); la nueva vuelve SALIENDO (su borde de abajo viene de la cámara, z > 0) y se asienta con el resorte amortiguado: pasa
// de largo un rebote chico (de 3° a 12°), el segundo es casi nada y termina en su lugar exacto.
const BORDE_DE_ABAJO = new THREE.Vector3(CAJA_B1.ancho / 2, -CAJA_B1.alto, 0)
const ASIENTO_B1 = Array.from({ length: 600 }, (_, k) => CORTE.columpio + ((1 - CORTE.columpio) * k) / 599)
const columpioBien = (angulo: typeof anguloDelColumpio, pose: Pose): boolean => {
  const grados = ASIENTO_B1.map((t) => (angulo(t, true) * 180) / Math.PI)
  const primero = Math.max(...grados)
  const cruce = grados.findIndex((g) => g > 0)
  const despues = grados.slice(cruce)
  const segundo = -Math.min(...despues.slice(despues.findIndex((g) => g < 0)))
  return (
    enLaPose(pose, 'columpio', CORTE.columpio * 0.9, false, BORDE_DE_ABAJO).z < -CAJA_B1.alto * 0.5 &&
    enLaPose(pose, 'columpio', CORTE.columpio + 0.01, true, BORDE_DE_ABAJO).z > CAJA_B1.alto * 0.5 &&
    caidaDelColumpio(0.2) < 0.2 * 0.2 && caidaDelColumpio(0.5) < 0.5 * 0.5 && caidaDelColumpio(1) === 1 &&
    primero >= 3 && primero <= 12 && segundo < primero / 4 && angulo(1, true) === 0 && Math.abs(grados[grados.length - 2]) < 0.5
  )
}
afirmar(columpioBien(anguloDelColumpio, poseDeLaTransformacion), '  columpio: la que estaba cae hacia adentro (acelerando); la nueva vuelve saliendo y se asienta con un rebote chico y amortiguado')
controlPositivo('  el detector VE un asiento sin rebote (una curva suave que llega y se clava: no es un resorte)', ((t: number, e: boolean) => (e ? -(Math.PI / 2) * (1 - Math.min(1, Math.max(0, (t - CORTE.columpio) / (1 - CORTE.columpio)))) : anguloDelColumpio(t, e))) as typeof anguloDelColumpio, (f: typeof anguloDelColumpio) => columpioBien(f, poseDeLaTransformacion))

// El DOM (abajo de 1025 y el panel de Contacto), las mismas curvas: en CSS la y va hacia abajo y la z hacia quien mira, así que
// con el origen arriba `rotateX(−90°)` manda el borde de abajo al fondo (z = alto·sen(−90°)) y `rotateX(90°)` lo trae hacia afuera.
const grado = (x: TargetAndTransitionLike | false): unknown => (x === false ? undefined : x.rotateX)
type TargetAndTransitionLike = { readonly rotateX?: unknown }
const domBien = (d: TransicionDelVolteo, c: TransicionDelVolteo): boolean => {
  const asiento = grado(d.animate as TargetAndTransitionLike)
  return (
    d.style.transformOrigin === '50% 0%' && grado(d.exit as TargetAndTransitionLike) === -90 && grado(d.initial as TargetAndTransitionLike | false) === 90 &&
    Array.isArray(asiento) && asiento[asiento.length - 1] === 0 && Math.min(...(asiento as number[])) <= -3 && Math.min(...(asiento as number[])) >= -12 &&
    c.style.transformOrigin === '50% 50%' && grado(c.exit as TargetAndTransitionLike) === 90 && grado(c.initial as TargetAndTransitionLike | false) === -90
  )
}
afirmar(domBien(transicionDelVolteo('columpio', false), transicionDelVolteo('centrado', false)), '  en el DOM, lo mismo: el columpio con la bisagra arriba (sale hacia adentro, entra desde afuera y rebota); el centrado, por el medio')
controlPositivo('  el detector VE el columpio con la bisagra en el medio', { ...transicionDelVolteo('columpio', false), style: { transformOrigin: '50% 50%' } }, (d: TransicionDelVolteo) => domBien(d, transicionDelVolteo('centrado', false)))

// La revisión adversaria de B (antes del commit) encontró cuatro maneras de que el volteo saliera mal; las cuatro, cerradas:
//   · un rearme de la placa por otra cosa (la ventana cambió de tamaño) en medio del volteo lo cortaba sin avisar: la tarjeta
//     esperaba para siempre su encastre (sin texto ni botones). Ahora el corte avisa, y el aviso lleva el estado que quedó a la
//     vista (uno de vuelta al formulario no arranca el encastre de la tarjeta nueva);
//   · en los ~80 ms entre el cambio de estado y el rearme, lo nuevo del DOM se veía sobre la placa vieja: ahora se apaga en el
//     mismo cuadro (y un respaldo lo prende si el aviso no llega);
//   · la tarjeta podía ser más alta que el formulario (en el teléfono, ~400 contra ~300 px): ahora mide EXACTAMENTE su alto (el
//     lugar del encastre toma lo que sobra y el logo se achica para entrar);
//   · «Reintentar» tomaba el foco aunque la persona ya se hubiera ido a otra parte: ahora sólo si sigue en la tarjeta.
const PIE_R = leer('_secciones/cierre/FormularioDelPie.tsx')
const ARMADAS_R = leer('_lib/escena/pie3d/armadas.ts')
const TARJETA_R = leer('_componentes/formularios/TarjetaDeResultado.tsx')
const revisionBien = (pie: string, a: string, t: string, html: string): boolean =>
  a.includes('const cortado = vieja !== undefined && !transforma && vieja.transformacion !== null') && a.includes('if (cortado) avisarQueTermino(a)') &&
  a.includes('new CustomEvent(VOLTEO_TERMINADO, { detail: a.estado })') && !a.includes('new CustomEvent(VOLTEO_TERMINADO))') &&
  pie.includes("if (!(e instanceof CustomEvent) || e.detail !== estadoALaVista) return") && pie.includes("el.style.opacity = '0'") && pie.includes('(duracionDelVolteo(variante, reducido) + RESPALDO_DEL_VOLTEO_S) * 1000') && /useLayoutEffect\(\(\) => \{\s*const el = placa\.current/.test(pie) &&
  t.includes('raiz.current.contains(document.activeElement)) reintentar.current?.focus') &&
  /data-tarjeta="resultado"[^>]*style="height:300px"/.test(html) && !html.includes('min-height:300px')
const conAlto = renderToStaticMarkup(
  <MotionConfig reducedMotion="never">
    <TarjetaDeResultado tipo="error" mensaje="x" alto={300} empieza={false} alReintentar={() => undefined} />
  </MotionConfig>,
)
afirmar(revisionBien(PIE_R, ARMADAS_R, TARJETA_R, conAlto), '  la revisión: un volteo cortado avisa (con su estado), lo nuevo se apaga en el mismo cuadro (con respaldo), la tarjeta mide el alto exacto del formulario y Reintentar no roba el foco')
controlPositivo('  el detector VE el corte mudo de antes (el rearme suelta el volteo sin avisar)', ARMADAS_R.replace('if (cortado) avisarQueTermino(a)', ''), (a: string) => revisionBien(PIE_R, a, TARJETA_R, conAlto))
controlPositivo('  y la tarjeta con el alto como piso (más alta que el formulario)', conAlto.replace('style="height:300px"', 'style="min-height:300px"'), (h: string) => revisionBien(PIE_R, ARMADAS_R, TARJETA_R, h))

// ═══════════════════════════════════════════════════════════════════════════
titulo('B2 · El éxito ENCAJA: la pieza cae en su ranura, el pestillo, la onda de luz y después el texto')

// La tarjeta del resultado (`TarjetaDeResultado`) lleva el encastre del logo en chico (`EncajeDelLogo`): una ranura con la forma
// del logo y la pieza que baja. Con el éxito entra al ras (un rebote mínimo), suena el pestillo en el contacto, sale la onda de
// luz (el claro de la tarjeta: casi blanco sobre la tinta) y recién entonces aparece el texto. El copy: «Recibido. Te contestamos
// pronto.». Lo que se ve, renderizado (sin navegador) y con el código del encastre.
const ENCAJE_TSX = leer('_componentes/formularios/EncajeDelLogo.tsx')
const TARJETA_TSX = leer('_componentes/formularios/TarjetaDeResultado.tsx')
const RESULTADO_CSS = leer('_estilos/resultado.css')
const tarjeta = (tipo: 'exito' | 'error', empieza: boolean, reducido: boolean): string =>
  renderToStaticMarkup(
    <MotionConfig reducedMotion={reducido ? 'always' : 'never'}>
      <TarjetaDeResultado tipo={tipo} mensaje="No pudimos enviarlo. Probá de nuevo en un rato." empieza={empieza} alReintentar={() => undefined} alOtro={() => undefined} />
    </MotionConfig>,
  )
const exitoBien = (e: string, t: string, css: string, html: string): boolean =>
  RESULTADO.exito.titulo === 'Recibido.' && RESULTADO.exito.bajada === 'Te contestamos pronto.' &&
  // La pieza entra al ras (termina en y = 0) con el contacto en su caída y el texto después de que termina.
  ENCAJE.exito.contacto > 0.4 && ENCAJE.exito.contacto < 0.8 && ENCAJE.exito.termina > ENCAJE.exito.s && ENCAJE.exito.rebote > 0 && ENCAJE.exito.rebote < 40 &&
  e.includes('{ y: [-ENCAJE.caida, 0, -ENCAJE.exito.rebote, 0]') && e.includes("sonar(exito ? 'pestillo' : 'pulso')") &&
  e.includes('stroke="var(--resultado-luz)"') && css.includes('--resultado-luz: var(--resultado-claro);') &&
  t.includes('animate={listo ? { opacity: 1, y: 0 }') && t.includes('alTerminar={() => setListo(true)}') &&
  html.includes('data-encaje="encaja"') && html.includes('Recibido.') && html.includes('Te contestamos pronto.') && !html.includes(RESULTADO.reintentar)
afirmar(exitoBien(ENCAJE_TSX, TARJETA_TSX, RESULTADO_CSS, tarjeta('exito', false, false)), 'B2 · el éxito: la pieza encaja al ras con el pestillo, la onda de luz clara, y el texto «Recibido. Te contestamos pronto.» después')
controlPositivo('B2 · el detector VE el texto a la vista desde el principio (sin esperar el encastre)', TARJETA_TSX.replace('animate={listo ? { opacity: 1, y: 0 }', 'animate={true ? { opacity: 1, y: 0 }'), (t: string) => exitoBien(ENCAJE_TSX, t, RESULTADO_CSS, tarjeta('exito', false, false)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('B3 · El error NO ENCAJA: el rojo como token y en AA; «Reintentar» con todo lo escrito')

// El rojo es el primer color fuera del monocromo: dos tokens del tema (`--color-error`, el borde y el resplandor de la ranura que
// no deja entrar la pieza; `--color-error-texto`, el título del error) que la tarjeta toma por `resultado.css`. La tarjeta es
// siempre de tinta: en la sección clara, #111111; en la invertida (el pie de volumen), #0E0E0E. Los dos en AA de texto (4,5:1).
const TEMA = readFileSync('src/app/theme-develop.css', 'utf8')
const hexDelTema = (nombre: string, desde = 0): string => {
  const m = new RegExp(`${nombre}:\\s*(#[0-9A-Fa-f]{6})`).exec(TEMA.slice(desde))
  return m === null ? '' : m[1]
}
const INVERTIDA = TEMA.indexOf('[data-seccion="invertida"] {')
const luminancia = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contraste = (a: string, b: string): number => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const FONDOS_DE_LA_TARJETA = [hexDelTema('--color-tinta'), hexDelTema('--color-fondo', INVERTIDA)]
const rojoBien = (rojo: string, texto: string, fondos: readonly string[], css: string, t: string): boolean =>
  rojo !== '' && texto !== '' && fondos.length === 2 && fondos.every((f) => f !== '' && contraste(rojo, f) >= 4.5 && contraste(texto, f) >= 4.5) &&
  css.includes('--rojo-del-error: var(--color-error);') && css.includes('--texto-del-error: var(--color-error-texto);') &&
  t.includes("!exito && 'text-[var(--texto-del-error)]'")
afirmar(rojoBien(hexDelTema('--color-error'), hexDelTema('--color-error-texto'), FONDOS_DE_LA_TARJETA, RESULTADO_CSS, TARJETA_TSX), `B3 · el rojo es token del tema y pasa AA sobre la tarjeta (borde ${contraste(hexDelTema('--color-error'), FONDOS_DE_LA_TARJETA[0]).toFixed(2)}:1, texto ${contraste(hexDelTema('--color-error-texto'), FONDOS_DE_LA_TARJETA[0]).toFixed(2)}:1 en la clara)`)
controlPositivo('B3 · el detector VE un rojo oscuro de manual (#B00020: 2,4:1 sobre la tinta)', '#B00020', (r: string) => rojoBien(r, hexDelTema('--color-error-texto'), FONDOS_DE_LA_TARJETA, RESULTADO_CSS, TARJETA_TSX))

// NO ENCAJA: la pieza cae torcida, choca ARRIBA de la ranura (no entra), el borde se enciende en rojo, rebota y queda afuera,
// corrida y apoyada; suena un golpe grave (el pulso del logo). Y la tarjeta del error lleva «Reintentar».
const noEncajaBien = (e: string, html: string): boolean =>
  ENCAJE.error.choca < 0 && ENCAJE.error.rebota < ENCAJE.error.choca && ENCAJE.error.queda < 0 && ENCAJE.error.queda > ENCAJE.error.rebota && Math.abs(ENCAJE.error.corre) > 60 &&
  e.includes("stroke={exito ? 'var(--resultado-luz)' : 'var(--rojo-del-error)'}") && e.includes("sonar(exito ? 'pestillo' : 'pulso')") &&
  html.includes('data-encaje="no-encaja"') && html.includes(RESULTADO.error.titulo) && html.includes(`>${RESULTADO.reintentar}</button>`)
afirmar(noEncajaBien(ENCAJE_TSX, tarjeta('error', false, false)), '  el error: la pieza choca arriba de la ranura, el borde en rojo, rebota y queda afuera; la tarjeta con «Reintentar»')
controlPositivo('  el detector VE la tarjeta del error con la pieza que encaja', ENCAJE_TSX, (e: string) => noEncajaBien(e, tarjeta('error', false, false).replace('data-encaje="no-encaja"', 'data-encaje="encaja"')))

// «Reintentar» vuelve al formulario con TODO lo escrito: en el error nada vacía los datos ni vuelve a montar los campos (los dos
// formularios); el foco va a Enviar.
const PIE_B = leer('_secciones/cierre/FormularioDelPie.tsx')
const PANEL_B = leer('_chrome/contacto/FormularioDeContacto.tsx')
const ramaDelError = (f: string, desde: string, hasta: string): string => {
  const i = f.indexOf(desde)
  return i < 0 ? '' : f.slice(i, f.indexOf(hasta, i))
}
const intactoBien = (pie: string, panel: string): boolean => {
  const errorDelPie = ramaDelError(pie, "// [PULIDO 11] B3 · el error: la tarjeta que no encaja", '\n  }\n')
  const reintentarDelPie = ramaDelError(pie, 'const reintentar = (): void => {', '\n  }\n')
  const errorDelPanel = ramaDelError(panel, "if (r.estado === 'error') {", '\n    }\n')
  const reintentarDelPanel = ramaDelError(panel, 'const reintentar = (): void => {', '\n  }\n')
  return (
    [errorDelPie, reintentarDelPie, errorDelPanel, reintentarDelPanel].every((r) => r !== '' && !/setDatos|setVuelta|reset\(/.test(r)) &&
    reintentarDelPie.includes("pedirFoco.current = 'enviar'") && reintentarDelPanel.includes("pedirFoco.current = 'enviar'") &&
    pie.includes('key={`formulario-${String(vuelta)}`}')
  )
}
afirmar(intactoBien(PIE_B, PANEL_B), '  «Reintentar» vuelve al formulario con todo lo escrito (ni el error ni Reintentar vacían o remontan los campos); el foco, en Enviar')
controlPositivo('  el detector VE un error que vacía el formulario del pie', PIE_B.replace("setEstado({ fase: 'error', mensaje: r.error })", "setEstado({ fase: 'error', mensaje: r.error })\n      setDatos(VACIO)"), (p: string) => intactoBien(p, PANEL_B))

// ═══════════════════════════════════════════════════════════════════════════
titulo('B4 · Los rótulos del botón se suceden: la carga y «Reintentar» nunca a la vez')

// Lo que se veía (PULIDO 10, medido en el banco): en el pie de volumen el rótulo de la tecla está en RELIEVE en la geometría, así que
// con el botón ocupado la carga del DOM convivía con el relieve («Enviar» o «Reintentar») hasta que la placa se rearmaba. Ahora:
//   · en el DOM, la carga sólo con el botón ocupado y el rótulo, invisible y mudo mientras tanto (guarda el ancho); «Reintentar»
//     vive en la tarjeta del error, que es OTRA rama de la presencia (`mode="wait"`: la que sale termina antes de que entre la otra);
//   · en 3D, las letras del rótulo llevan w = −1 y el sombreador las descarta con el botón ocupado (`aria-busy`, leído cada cuadro):
//     el mismo cuadro, sin rearmar (el rótulo se sigue midiendo aunque esté mudo, así la firma de la placa no cambia);
//   · en el panel de Contacto, la carga es un estado entero (el formulario se fue) y la tarjeta del error, otro.
const ARMADAS_B = leer('_lib/escena/pie3d/armadas.ts')
const COREO_B = leer('_lib/escena/pie3d/coreografia.ts')
const GEOM_B = leer('_lib/escena/pie3d/geometria.ts')
const MEDIDA_B = leer('_lib/pie3d/medida.ts')
const sucesivos = (pie: string, panel: string, a: string, c: string, g: string, m: string, html: string): boolean =>
  // DOM del pie: la carga con el botón ocupado; el rótulo, invisible y mudo; la tarjeta en la otra rama, en espera.
  pie.includes('{enviando && <Carga ') && pie.includes("aria-hidden={enviando || undefined} className={cn('grid justify-items-center', enviando && 'invisible')}") &&
  pie.includes('<AnimatePresence mode="wait" initial={false}>') && pie.indexOf('<TarjetaDeResultado') < pie.indexOf('<Carga ') && !/Reintentar|REINTENTAR/.test(pie.slice(pie.indexOf('<Carga '))) &&
  // 3D: el relieve del rótulo marcado, descartado con el botón ocupado, leído cada cuadro; medido aunque esté mudo.
  g.includes('relieveDe(m, fuentes, true, v.tecla).map(deRotulo)') && c.includes('if ( vRotuloDelPie > 0.5 && uSinRotuloDelPie > 0.5 ) discard;') &&
  a.includes("a.uniformes.uSinRotuloDelPie.value = a.boton?.getAttribute('aria-busy') === 'true' ? 1 : 0") && m.includes("mudo.hasAttribute('data-rotulo-de-la-tecla')") &&
  // El panel: la carga y la tarjeta son estados distintos de la misma presencia.
  /\{enviando \? \([\s\S]*?<Carga [\s\S]*?\) : enviado \|\| fase === 'error' \? \([\s\S]*?<TarjetaDeResultado/.test(panel) &&
  // La tarjeta del error: «Reintentar» y ninguna carga.
  html.includes(RESULTADO.reintentar) && !html.includes('data-pieza="carga"')
afirmar(sucesivos(PIE_B, PANEL_B, ARMADAS_B, COREO_B, GEOM_B, MEDIDA_B, tarjeta('error', true, true)), 'B4 · la carga, el rótulo y «Reintentar» se suceden: en el DOM, en la tecla 3D (el relieve se apaga en el mismo cuadro) y en el panel')
controlPositivo('B4 · el detector VE la tecla 3D de antes (el relieve dibujado con el botón ocupado)', COREO_B.replace('if ( vRotuloDelPie > 0.5 && uSinRotuloDelPie > 0.5 ) discard;', ''), (c: string) => sucesivos(PIE_B, PANEL_B, ARMADAS_B, c, GEOM_B, MEDIDA_B, tarjeta('error', true, true)))
controlPositivo('  y el rótulo a la vista encima de la carga', PIE_B.replace("enviando && 'invisible')", "false && 'invisible')"), (p: string) => sucesivos(p, PANEL_B, ARMADAS_B, COREO_B, GEOM_B, MEDIDA_B, tarjeta('error', true, true)))

// ═══════════════════════════════════════════════════════════════════════════
titulo('B5 · La carga gira sobre el palito de la P, con el palito en el medio')

// El giro es la carga de siempre (el trazo, de respaldo: `?carga=trazo`, sin WebGL o con movimiento reducido, quieto). Giraba sobre
// el centro de la tinta, que no es el del logo (la P está a la derecha): el logo parecía bambolearse. Ahora el eje es el del palito
// de la P, sacado del trazado (`LOGO_PATH_D`: sus dos bordes verticales), y el logo se corre lo que falta para que el palito
// quede en el medio del área.
const puntosDelTrazado = (d: string): Array<readonly [number, number]> => {
  const fichas = d.match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)/g) ?? []
  const n: Record<string, number> = { M: 2, L: 2, T: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, A: 7, Z: 0 }
  const puntos: Array<readonly [number, number]> = []
  let [x, y, x0, y0, k] = [0, 0, 0, 0, 0]
  let orden = 'M'
  while (k < fichas.length) {
    if (/[A-Za-z]/.test(fichas[k])) orden = fichas[k++]
    const O = orden.toUpperCase()
    const rel = orden !== O
    if (O === 'Z') {
      ;[x, y] = [x0, y0]
      continue
    }
    const a = fichas.slice(k, k + n[O]).map(Number)
    k += n[O]
    if (O === 'H') x = a[0] + (rel ? x : 0)
    else if (O === 'V') y = a[0] + (rel ? y : 0)
    else [x, y] = rel ? [x + a[a.length - 2], y + a[a.length - 1]] : [a[a.length - 2], a[a.length - 1]]
    if (O === 'M') {
      ;[x0, y0] = [x, y]
      orden = rel ? 'l' : 'L'
    }
    puntos.push([x, y])
  }
  return puntos
}
// El palito: los puntos de abajo de la P (y > 690, a la derecha de x = 500) que forman sus dos bordes verticales.
const DEL_PALITO = puntosDelTrazado(LOGO_PATH_D).filter(([x, y]) => y > 690 && x > 500)
const BORDE_IZQUIERDO = Math.min(...DEL_PALITO.map(([x]) => x))
const BORDE_DERECHO = Math.max(...DEL_PALITO.filter(([, y]) => y > 800 && y < 880).map(([x]) => x))
const palitoBien = (eje: number, carga: string): boolean => {
  const x = LOGO_INK_VIEWBOX.x + eje * LOGO_INK_VIEWBOX.width
  return (
    Math.abs(BORDE_IZQUIERDO - PALITO_DE_LA_P.izquierda) < 2 && Math.abs(BORDE_DERECHO - PALITO_DE_LA_P.derecha) < 2 && Math.abs(x - (BORDE_IZQUIERDO + BORDE_DERECHO) / 2) < 2 &&
    carga.includes("transformOrigin: `${eje} 50%`") && carga.includes('translateX(${((0.5 - EJE_DEL_PALITO) * 100).toFixed(2)}%)') && carga.includes("variante === 'giro' && !reducido ? <Giro")
  )
}
const CARGA_B = leer('_componentes/carga/Carga.tsx')
afirmar(palitoBien(EJE_DEL_PALITO, CARGA_B), `B5 · el giro sobre el eje del palito de la P (x ${String(BORDE_IZQUIERDO)}–${String(BORDE_DERECHO)} del trazado), con el palito centrado; con movimiento reducido, el trazo quieto`)
controlPositivo('B5 · el detector VE el giro de antes (sobre el centro de la tinta)', 0.5, (e: number) => palitoBien(e, CARGA_B))

// ═══════════════════════════════════════════════════════════════════════════
titulo('B6 · Terminado el éxito, el formulario se limpia')

// Con el éxito, lo escrito se va (los valores, el intento) y al volver («Enviar otro mensaje») los campos son NUEVOS: la clave del
// grupo cambia y React los monta de cero, sin el estado del autocompletado del navegador (que no se borra cambiando el valor).
// El panel de Contacto vacía sus datos y se cierra solo (al reabrirse, se monta de nuevo). El estilo del autocompletado es el de
// J6 (s61); su posición sobre la placa, en el banco.
const limpioBien = (pie: string, panel: string): boolean => {
  const exito = ramaDelError(pie, '// [PULIDO 11] B6 · el éxito: lo escrito se va', '} else {')
  return exito.includes('setDatos(VACIO)') && exito.includes('setIntento(false)') && exito.includes('setVuelta((n) => n + 1)') && pie.includes('key={`formulario-${String(vuelta)}`}') && /setFase\('exito'\)\n\s+setIntento\(false\)\n\s+setDatos\(\{ intereses: \[\], \.\.\.VACIO \}\)/.test(panel)
}
afirmar(limpioBien(PIE_B, PANEL_B), 'B6 · el éxito limpia el formulario: los valores se vacían y los campos se vuelven a montar (sin el autocompletado viejo)')
controlPositivo('B6 · el detector VE campos que no se vuelven a montar (el autocompletado viejo se queda)', PIE_B.replace('setVuelta((n) => n + 1)', ''), (p: string) => limpioBien(p, PANEL_B))

// ═══════════════════════════════════════════════════════════════════════════
titulo('C2 · La cabecera abajo de 1024: parlante, menú y progreso del mismo tamaño y en el mismo eje')

// Lo pedido: el SONIDO arriba a la izquierda, el MENÚ al centro y el PROGRESO (el infinito) arriba a la derecha, los tres del
// tamaño del botón del menú (un disco de 48 px: fondo, borde y sombra), en el mismo eje horizontal y adentro de la zona segura.
// Antes (J9) el parlante iba en fila a la izquierda del progreso, chico (32 px) y sin disco. El parlante sigue montado por el
// infinito (s47: no se ubica solo en escritorio); abajo de 1024, su lugar es fijo arriba a la izquierda. Con `?progreso=abajo`, la
// columna de abajo de antes. Lo que se ve (y que no tape nada a 320, 375 y 390), en el banco.
const ARRIBA = 'top-[max(var(--spacing-4),env(safe-area-inset-top))]'
const DISCO = 'max-escritorio:size-[var(--spacing-12)] max-escritorio:rounded-full max-escritorio:border max-escritorio:border-borde max-escritorio:bg-fondo max-escritorio:shadow-[var(--shadow-flotante)]'
const ESQUINA_C2 = leer('_chrome/recorrido/InfinitoDelRecorrido.tsx')
const SONIDO_C2 = leer('_chrome/sonido/ControlDelSonido.tsx')
const MENU_C2 = leer('_chrome/menu/MenuMovil.tsx')
const cabeceraBien = (esquina: string, sonido: string, menu: string): boolean => {
  const delMenu = /data-parte="boton-del-menu"[\s\S]*?className="([^"]*)"/.exec(menu)?.[1] ?? ''
  return (
    // El menú: el disco de 48 px, al centro, en el eje.
    delMenu.split(' ').includes(ARRIBA) && delMenu.includes('inset-x-0') && delMenu.includes('mx-auto') && delMenu.includes('size-[var(--spacing-12)]') && delMenu.includes('rounded-full') &&
    // El progreso: arriba a la derecha (zona segura) y su caja, el mismo disco.
    esquina.includes(`max-escritorio:not-data-abajo:${ARRIBA} max-escritorio:not-data-abajo:right-[max(var(--spacing-4),env(safe-area-inset-right))]`) &&
    esquina.includes(`!abajo && '${DISCO} max-escritorio:justify-center max-escritorio:gap-0'`) &&
    // El parlante: su lugar fijo arriba a la izquierda (zona segura) y su botón, el mismo disco; el cartel, debajo (arriba se saldría).
    esquina.includes(`<div data-parte="lugar-del-parlante" className={cn(!abajo && 'max-escritorio:fixed max-escritorio:${ARRIBA} max-escritorio:left-[max(var(--spacing-4),env(safe-area-inset-left))]')}>`) &&
    sonido.includes(`!abajo && '${DISCO}'`) && sonido.includes("'max-escritorio:top-full max-escritorio:bottom-auto max-escritorio:left-0") &&
    sonido.includes('const abajo = useSyncExternalStore(sinCambios, abajoEnLaPagina, () => false)')
  )
}
afirmar(cabeceraBien(ESQUINA_C2, SONIDO_C2, MENU_C2), 'C2 · abajo de 1024: el parlante arriba a la izquierda, el menú al centro y el progreso arriba a la derecha, los tres discos de 48 px en el mismo eje y la zona segura')
controlPositivo('C2 · el detector VE la cabecera de antes (el parlante en fila con el progreso, chico)', SONIDO_C2.replace(`!abajo && '${DISCO}'`, "!abajo && ''"), (so: string) => cabeceraBien(ESQUINA_C2, so, MENU_C2))
controlPositivo('  y un menú fuera del eje (sin la zona segura)', MENU_C2.replace(ARRIBA, 'top-[var(--spacing-4)]'), (m: string) => cabeceraBien(ESQUINA_C2, SONIDO_C2, m))

cerrar('s62-pulido-11')
