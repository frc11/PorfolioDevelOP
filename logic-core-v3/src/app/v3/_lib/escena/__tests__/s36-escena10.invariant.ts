/**
 * SPRINT ESCENA 10 — CIERRE DE ESCENA 9 Y TÍTULOS 3D, lo que se puede prometer sin navegador. Cada afirmación lleva su
 * control positivo donde el chequeo podría pasar por no mirar nada. Una sección por ticket.
 *
 * T1 · el cierre de ESCENA 9 en el producto: el logo de noche claro, el negro satinado, la sombra del logo, ACES
 *      compensado y el scroll de nk, con sus banderas `=no` para el banco; lo demás borrado (las otras variantes, el
 *      brillante, el bloom, AgX y Neutral como opción, el sedoso, los títulos de ESCENA 9). Y la luz según el momento:
 *      de día la sombra del logo y la mancha de contacto, sin haz; de noche sólo la mancha dura del haz; el paso sigue a
 *      la noche EN EL LOGO, que en el amanecer cambia cuando el frente lo alcanza (sin saltos).
 * T2 · el video de Servicios: quieto mientras el scroll se mueve (vuelve a andar desde el mismo cuadro al frenar) y
 *      recodificado a 25 cuadros por segundo, a la menor resolución que se ve igual; la receta, en VIDEO-DE-SERVICIOS.md.
 * T3 · los títulos de volumen (prueba, `titulos=negro|blanco`): la Chivo extruida, una malla por título, quieta en el
 *      mundo donde la cámara del momento de la lectura la ve en el lugar del DOM; la llegada girando desde atrás, con un
 *      mínimo de tiempo; accesibles; de noche con el dibujo del logo; con las reglas de rendimiento. [CIERRE] Aprobados
 *      para la etapa de 3D: quedan con su bandera, apagados y sin borrar.
 * CIERRE · el destello de un cuadro: el amanecer decide su estado antes que el rig (el rig leía la noche sostenida del
 *      cuadro anterior: un cuadro de día al prenderse la compuerta); en un viaje que cambia de luz, quieto.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import * as THREE from 'three'
import { Font, type FontData } from 'three/examples/jsm/loaders/FontLoader.js'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { avanceDelCuadro, momentoEn } from '../amanecer/linea'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { nocheDelLogo } from '../entorno/nocheDelLogo'
import { NIVELES_DEL_HAZ } from '../entorno/vivo'
import { SATINADO } from '../estudio'
import * as logoDeNoche from '../logoDeNoche'
import { INK_ROUGHNESS } from '../probeScene'
import { manchasDelHaz } from '../sombra/sombraDelHaz'
import { TONO_COMPENSADO_GLSL } from '../tono'
import { camaraDeLaLectura, colocar, lineaDeBase } from '../titulos3d/colocacion'
import { VOLUMEN_DEL_TITULO, armarElTitulo } from '../titulos3d/geometria'
import { LLEGADA_DE_LAS_LETRAS, LLEGADA_NORMAL_GLSL, LLEGADA_PARS_GLSL, llegadaDeLaLetra } from '../titulos3d/llegada'
import { LECTURA } from '../../titulos3d/registro'
import { CONTENIDO as CONTENIDO_DE_TRABAJOS } from '../../../_secciones/trabajos/contenido'
import { FRASE } from '../../../_secciones/por-que-develop/contenido'

const ESCENA = path.join(process.cwd(), 'src/app/v3/_lib/escena')
const leer = (rel: string): string => readFileSync(path.join(ESCENA, rel), 'utf8').replace(/\r\n/g, '\n')
const deLaRaiz = (rel: string): string => readFileSync(path.join(process.cwd(), rel), 'utf8').replace(/\r\n/g, '\n')
/** Sin comentarios: lo que el código hace, no lo que la prosa cuenta. */
const codigo = (c: string): string => c.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '')

// ── T1 · el cierre de ESCENA 9 ────────────────────────────────────────────
titulo('T1 · el cierre de ESCENA 9: lo elegido, en el producto; lo demás, borrado')
afirmar(ENTORNO.logoDeNoche && ENTORNO.materialDelLogo && ENTORNO.sombraDelLogo, 'en el producto: el logo de noche, el negro satinado y la sombra del logo')
const sinCadaUno = entornoPedido('producto,logo-noche=no,material=no,sombra-logo=no')
afirmar(!sinCadaUno.logoDeNoche && !sinCadaUno.materialDelLogo && !sinCadaUno.sombraDelLogo && !BASE_LIMPIA.logoDeNoche && !BASE_LIMPIA.materialDelLogo && !BASE_LIMPIA.sombraDelLogo, '  el banco los apaga con `=no` para comparar; la base limpia no los tiene')
// [INTERFAZ 2] Las pruebas de ese sprint pasaron al producto o se borraron en su cierre: la única que queda es la de T3.
// [3D Y SONIDO] T1: los títulos de T3 pasaron al producto; la prueba que queda es el sonido (T2 de ese sprint).
// [RETOQUE 3D] 3J: + la del túnel lento (`tunel=lento`).
// [CIERRE RETOQUE 3D] D6 y P1: el túnel lento se borró y el polvo en facetas pasó al producto.
// [RONDA 2] F4: la única prueba es el filo de los títulos de día (s43 · F4). [RETOQUE DEL PIE] P1: se borró; las de ahora, en s44.
afirmar(!('aa' in PRUEBAS_APAGADAS) && !('aa' in entornoPedido('producto,aa=taa').pruebas), '  de las pruebas de ESCENA 9 no queda ninguna: el antialiasing es el del lienzo (CALIDAD 1); TAA y 8 muestras, con su bandera, se borraron (no queda ninguna)', Object.keys(PRUEBAS_APAGADAS).join())

// El logo de noche: la variante clara (el filo casi blanco), la única.
const exportsDelLogo = Object.keys(logoDeNoche)
afirmar(logoDeNoche.BORDE_DEL_LOGO_DE_NOCHE.luz > 0.5 && logoDeNoche.BORDE_DEL_LOGO_DE_NOCHE.ancho === 10 && !exportsDelLogo.includes('VARIANTES_DEL_LOGO_DE_NOCHE') && !exportsDelLogo.includes('aplicarVariante'), 'el logo de noche es el claro, borde blanco (ancho 10 del SVG, luz 0,88): el negro fino y el grueso se borraron', JSON.stringify(logoDeNoche.BORDE_DEL_LOGO_DE_NOCHE))
const logo = leer('ProbeLogo.tsx')
afirmar(/if \(!e\.logoDeNoche\) return \{ material: built, contorno: null \}/.test(logo) && /conLogoDeNoche\(built, horneado\)/.test(logo), '  se instala en el material del logo salvo con `logo-noche=no`')

// El material: el negro satinado en el material de siempre (sin laca, el físico daba el mismo reflejo).
const satinado = (c: string): boolean => /new THREE\.MeshStandardMaterial\(\{\s*color: INK_COLOR,\s*\/\/[^\n]*\n\s*roughness: e\.materialDelLogo \? SATINADO\.roughness : INK_ROUGHNESS,/.test(c) && !/MeshPhysicalMaterial/.test(codigo(c))
afirmar(satinado(logo) && SATINADO.roughness < INK_ROUGHNESS, 'el negro satinado: la tinta de siempre, el estudio y una rugosidad menor, en el `MeshStandardMaterial` (el brillante, con laca, se borró)', `rugosidad ${String(SATINADO.roughness)} (mate: ${String(INK_ROUGHNESS)})`)
controlPositivo('el detector VE el material físico de la prueba', logo.replace('new THREE.MeshStandardMaterial({', 'new THREE.MeshPhysicalMaterial({'), satinado)
afirmar(!/brillante|clearcoat/.test(codigo(leer('estudio.ts'))), '  sin laca ni variante brillante en el estudio')

// El tono: ACES compensado para todo el lienzo; Neutral como opción y AgX, borrados.
const lienzo = leer('configuracionDelCanvas.ts')
const conAces = (c: string, glsl: string): boolean => /toneMapping: THREE\.CustomToneMapping,/.test(c) && /^instalarElTono\(\)$/m.test(c) && /ACESFilmicToneMapping\( color \) \* \( brilloDeHoy \/ max\( brilloDelTono, 1e-6 \) \)/.test(glsl) && !/AgXToneMapping/.test(glsl)
afirmar(conAces(lienzo, TONO_COMPENSADO_GLSL) && !/NeutralToneMapping,/.test(codigo(lienzo)) && !/tono=|agx/i.test(codigo(leer('entorno.ts'))), 'el tono es ACES compensado (el color de ACES con el brillo de Neutral), instalado antes de compilar; sin opción Neutral ni AgX')
controlPositivo('el detector VE el lienzo con Neutral', lienzo.replace('toneMapping: THREE.CustomToneMapping,', 'toneMapping: THREE.NeutralToneMapping,'), (c: string) => conAces(c, TONO_COMPENSADO_GLSL))

// El bloom y el antialiasing de prueba, borrados: el posproceso entero (su búfer, sus pasos, sus banderas).
const lienzoSinPrueba = (c: string): boolean => /return CONTEXTOS\[nivel\]/.test(c) && !/antialias: false|POSPROCESO/.test(codigo(c))
afirmar(!existsSync(path.join(ESCENA, 'gpu/posproceso.ts')) && !/bloom|aa=/.test(codigo(leer('entorno.ts'))) && lienzoSinPrueba(lienzo), 'el bloom y el antialiasing de prueba se borraron (el posproceso entero): el lienzo lleva su antialias de CALIDAD 1')
controlPositivo('el detector VE el lienzo sin muestras de la prueba', lienzo.replace('return CONTEXTOS[nivel]', 'return { ...CONTEXTOS[nivel], antialias: false }'), lienzoSinPrueba)

// El scroll de nk: sobre la instancia, sin tocar la construcción (la afirman `compuerta` y `s18`).
const motor = deLaRaiz('src/app/v3/_componentes/ScrollSuaveDeV3.tsx')
const nk = deLaRaiz('src/app/v3/_componentes/lenisDeNk.ts')
const lerpDeNk = Number(/\| `lerp` \| \*\*([0-9.]+)\*\* \|/.exec(deLaRaiz('docs/rediseno/s0/SCROLL.md'))?.[1] ?? 'NaN')
afirmar(/const lenis = new Lenis\(\{ \.\.\.OPCIONES_DE_LENIS \}\)\n[^\n]*\n\s*ponerElModoDeNk\(lenis\)/.test(motor) && Number(/LENIS_DE_NK = \{ lerp: ([0-9.]+), duration: undefined, easing: undefined \}/.exec(nk)?.[1] ?? 'NaN') === lerpDeNk, 'el scroll de /v3 va en el modo de nk (`lerp` medido en nk.studio, sin duración), puesto sobre la instancia recién construida', `lerp ${String(lerpDeNk)}`)
afirmar(!/sedoso|0\.075/.test(codigo(nk)) && !/\.(stop|start)\s*\(/.test(codigo(nk)) && !existsSync(path.join(process.cwd(), 'src/app/v3/_componentes/lenisDePrueba.ts')), '  el sedoso se borró, y no llama `stop()` ni `start()`')

// ── la luz según el momento ───────────────────────────────────────────────
titulo('T1 · la luz según el momento: de día la sombra del logo, de noche sólo la del haz, y un paso sin saltos')
// La noche en el logo: fuera del amanecer, la de la sala; en el barrido, de noche hasta que el frente alcanza al logo.
afirmar(nocheDelLogo(0, 0, 1e4) === 0 && nocheDelLogo(1, 0, 1e4) === 1 && nocheDelLogo(0.4, 0, 0) === 0.4, 'fuera del amanecer, la noche en el logo es la de la sala')
const guarda = (f: typeof nocheDelLogo): boolean => f(0, 1, 300) === 1 && f(0, 1, 46) === 1 && f(0, 1, -6) === 0
afirmar(guarda(nocheDelLogo), '  en el barrido la sala ya es de día, pero en el logo sigue de noche hasta que el frente lo alcanza (del radio 300 al 46 sigue la noche; en −6, día)')
controlPositivo('el detector VE la noche de la sala (cambia al empezar el barrido)', (noche: number) => noche, guarda)
/** El amanecer entero, cuadro a cuadro a 144 Hz del reloj del amanecer: el salto más grande entre dos cuadros. */
const saltoMaximo = (f: (m: ReturnType<typeof momentoEn>) => number): number => {
  let [peor, antes] = [0, Number.NaN]
  for (let s = 0; s <= 8; s += 1 / 144) {
    const v = f(momentoEn(s))
    if (!Number.isNaN(antes)) peor = Math.max(peor, Math.abs(v - antes))
    antes = v
  }
  return peor
}
const nocheDeLaSala = (m: ReturnType<typeof momentoEn>): number => (m.sostieneLaNoche ? 1 : 0)
const enElLogo = (m: ReturnType<typeof momentoEn>): number => nocheDelLogo(nocheDeLaSala(m), m.barre ? 1 : 0, m.frente)
// Reloj del amanecer: se muestra entero en 2,5 s como mínimo (ESCENA 8 T3), así que 1/144 del reloj es a lo sumo 1/47 s real.
afirmar(saltoMaximo(enElLogo) < 0.1, '  a lo largo del amanecer la noche en el logo no salta (el mayor cambio entre dos cuadros)', `${(saltoMaximo(enElLogo) * 100).toFixed(1)} % (la de la sala: ${(saltoMaximo(nocheDeLaSala) * 100).toFixed(0)} %)`)
controlPositivo('el detector VE el salto de la noche de la sala', nocheDeLaSala, (f: typeof nocheDeLaSala) => saltoMaximo(f) < 0.1)

// El haz: de día no existe (sus niveles de día son cero) y aparece con la noche en el logo.
afirmar(NIVELES_DEL_HAZ.sutil.dia.every((v) => v === 0) && NIVELES_DEL_HAZ.sutil.noche.every((v) => v > 0) && ENTORNO.haz === 'sutil', 'el haz (E1) se sacó de día: la columna, el charco y el polvo del haz valen cero de día', JSON.stringify(NIVELES_DEL_HAZ.sutil))
const haz = leer('entorno/Haz.tsx')
const polvoVivo = leer('entorno/polvoVivo.ts')
const conLaNocheDelLogo = (h: string, p: string): boolean =>
  /float cuanto = mix\( uHazDia\.x, uHazNoche\.x, uNocheDelLogo \);/.test(h) &&
  /return luz \* charco \* mix\( uHazDia\.y, uHazNoche\.y, uNocheDelLogo \);/.test(h) &&
  // [CIERRE RETOQUE 3D] B3: con el cono del encendido.
  /vEnElHaz = uHaz \* uConoDelHaz \* uNocheDelLogo \* \(/.test(p) &&
  /float cuantoHaz = vEnElHaz \* mix\( uHazDia\.z, uHazNoche\.z, uNocheDelLogo \);/.test(p)
afirmar(conLaNocheDelLogo(haz, polvoVivo), '  la columna, el charco y el polvo del haz siguen a la noche en el logo (en el amanecer se van cuando el frente lo alcanza)')
controlPositivo('el detector VE el polvo del haz con la noche de la sala', [haz, polvoVivo.replace('vEnElHaz = uHaz * uConoDelHaz * uNocheDelLogo * (', 'vEnElHaz = uHaz * uConoDelHaz * (')], ([h, p]: string[]) => conLaNocheDelLogo(h, p))
afirmar(/cono\.current\.visible = dia\.x > 0 \|\| \(noche\.x > 0 && n > 0\)/.test(haz), '  sin haz la columna no se dibuja (regla 5)')
const entornoTsx = leer('entorno/Entorno.tsx')
const i = entornoTsx.indexOf('VIVO.uNocheDelLogo.value = nocheDelLogo(VIVO.uNoche.value, AMANECER_EN_VIVO.uBarridoDelDia.value, AMANECER_EN_VIVO.uFrenteDelDia.value)')
afirmar(i > entornoTsx.indexOf('VIVO.uNoche.value = BRILLO_DE_LA_NOCHE.uNoche.value') && i < entornoTsx.indexOf('if (e.E1) {') && /* [RONDA 2] F3: con el `sinGuion` en el medio. */ /const noche = VIVO\.uNocheDelLogo\.value[\s\S]{0,400}?m\.encendido = avanzarElEncendido\(m\.encendido \?\? encendidoInicial\(noche, t\), noche,/.test(entornoTsx), '  la escribe el entorno en cada cuadro, antes del haz; el encendido también la sigue (no se apaga al empezar el barrido)')

// Las manchas: de noche sólo la dura del haz; el haz apagado un instante, ninguna. [Cierre de INTERFAZ 2] De día tampoco
// hay mancha blanda: la sombra de día es la real del logo (`sombra/delLogo.ts`); dos sombras no tenían sentido.
const [dia, noche, apagado] = [manchasDelHaz(0, 1, true), manchasDelHaz(1, 1, true), manchasDelHaz(1, 0, true)]
afirmar(dia.opacidadBlanda === 0 && dia.opacidadDura === 0 && noche.opacidadBlanda === 0 && noche.opacidadDura > 1 && apagado.opacidadBlanda === 0 && apagado.opacidadDura === 0, 'de día, ninguna mancha (la sombra es la del logo); de noche, sólo la mancha dura del haz; sin luz (el haz apagado en su encendido), ninguna', JSON.stringify({ dia, noche }))
/** El paso de un extremo al otro: cada 1 % de noche, la mancha cambia poco (continua). */
const continua = (f: typeof manchasDelHaz): boolean => {
  for (let k = 1; k <= 100; k += 1) {
    const [a, b] = [f((k - 1) / 100, 1, true), f(k / 100, 1, true)]
    if (Math.abs(a.opacidadBlanda - b.opacidadBlanda) > 0.02 || Math.abs(a.opacidadDura - b.opacidadDura) > 0.02) return false
  }
  return true
}
afirmar(continua(manchasDelHaz), '  y el paso de la una a la otra es continuo en la noche')
controlPositivo('el detector VE una mancha que cambia de golpe a media noche', (n: number, k: number, h: boolean) => manchasDelHaz(n < 0.5 ? 0 : 1, k, h), continua)
afirmar(/const haz = manchasDelHaz\(VIVO\.uNocheDelLogo\.value, HAZ_ENCENDIDO\.luz, conElHaz && entorno\.E1\)/.test(leer('ContactOcclusion.tsx')), '  la sombra de contacto la lee con la noche en el logo')

// La sombra del logo: de día con la principal; cuánto, el día que hay en el logo (sin el corte al 3 % de ESCENA 9).
const luzDelLogo = leer('LuzDelLogo.tsx')
const sombraSinSaltos = (c: string): boolean => /const fuerza = SOMBRA_DEL_LOGO\.fuerza \* Math\.min\(1, principal\.intensity \/ KEY_INTENSITY\) \* \(1 - VIVO\.uNocheDelLogo\.value\)/.test(c) && !/cruda < 0\.03/.test(c)
afirmar(sombraSinSaltos(luzDelLogo), 'la sombra del logo sobre el piso vivo va de día: la luz principal por el día en el logo (de noche, cero; en el amanecer vuelve con el frente), sin el corte al 3 %')
controlPositivo('el detector VE el corte de la prueba de ESCENA 9', `${luzDelLogo}\nconst fuerza = cruda < 0.03 ? 0 : cruda`, sombraSinSaltos)
afirmar(/\{e\.sombraDelLogo && e\.pisoVivo \? <SombraDelLogo \{\.\.\.props\} \/> : null\}/.test(luzDelLogo) && /const conSombra = entornoDeLaEscena\(\)\.sombraDelLogo/.test(leer('piso/PisoVivo.tsx')), '  se monta con el piso vivo (es quien la recibe), y el banco la apaga con `sombra-logo=no`')

// ── T2 · el video de Servicios ────────────────────────────────────────────
titulo('T2 · el video de Servicios: quieto mientras el scroll se mueve, y a 25 cuadros por segundo')
const video = deLaRaiz('src/app/v3/_secciones/servicios/VideoDeServicio.tsx')
const enMovimiento = deLaRaiz('src/app/v3/_lib/scrollEnMovimiento.ts')
const pausaConElScroll = (c: string): boolean =>
  /const soltar = seguirElScroll\(\s*QUIETO_PARA_VOLVER_MS,\s*\(\) => \{\s*if \(!el\.paused\) el\.pause\(\)\s*\},\s*\(\) => void el\.play\(\)/.test(c) &&
  /return \(\) => \{\s*soltar\(\)\s*el\.pause\(\)/.test(c) &&
  !/addEventListener\('scroll'/.test(codigo(c))
const quieto = Number(/export const QUIETO_PARA_VOLVER_MS = (\d+)/.exec(video)?.[1] ?? 'NaN')
afirmar(pausaConElScroll(video) && quieto >= 100 && quieto <= 400, 'con el scroll en movimiento el video se pausa en su cuadro, y vuelve a andar desde ahí cuando el scroll lleva un rato quieto', `${String(quieto)} ms (medido con la NVIDIA a 1440, dpr 1 y 1,5: de 74–80 cuadros perdidos por pasada a 0; vuelve 198 ms después de frenar)`)
controlPositivo('el detector VE el video de antes (sólo se pausaba fuera de pantalla)', video.replace('const soltar = seguirElScroll(', 'const soltar = () => undefined; (('), pausaConElScroll)
/** Un solo escucha para todos: se pone con el primero, se saca con el último, y sólo anota la hora y avisa. */
const unEscucha = (c: string): boolean => (codigo(c).match(/addEventListener\('scroll'/g) ?? []).length === 1 && /if \(suscriptos\.length === 0\) window\.addEventListener\('scroll', alScroll, \{ passive: true \}\)/.test(c) && /if \(suscriptos\.length === 0\) window\.removeEventListener\('scroll', alScroll\)/.test(c)
afirmar(unEscucha(enMovimiento), '  el movimiento lo avisa `_lib/scrollEnMovimiento.ts`: un solo escucha para los tres videos (la sección no escucha el scroll por su cuenta, como pide s6-servicios)')
controlPositivo('el detector VE un escucha por suscripción', enMovimiento.replace('if (suscriptos.length === 0) window.addEventListener', 'window.addEventListener'), unEscucha)
/** Los cuadros por segundo y el tamaño de la pista de video de un MP4 (una sola pista: `mdhd`, `stts` y `tkhd`). */
const delMp4 = (b: Buffer): { fps: number; ancho: number; alto: number } => {
  const caja = (nombre: string): number => b.indexOf(Buffer.from(nombre, 'latin1'))
  const mdhd = caja('mdhd')
  const escala = b.readUInt32BE(mdhd + (b[mdhd + 4] === 1 ? 24 : 16))
  const stts = caja('stts')
  const tkhd = caja('tkhd')
  const tk = b[tkhd + 4] === 1 ? 12 : 0
  return { fps: escala / b.readUInt32BE(stts + 16), ancho: b.readUInt32BE(tkhd + 80 + tk) / 65536, alto: b.readUInt32BE(tkhd + 84 + tk) / 65536 }
}
const muestra = delMp4(readFileSync(path.join(process.cwd(), 'public/recursos/servicios/placeholder.mp4')))
afirmar(muestra.fps === 25 && muestra.ancho === 960 && muestra.alto === 600, 'el video de muestra va a 25 cuadros por segundo (divide los 75 Hz: cada cuadro, tres refrescos) y a 960 × 600, la menor resolución que se ve igual a 1440', `${String(muestra.fps)} cuadros por segundo, ${String(muestra.ancho)} × ${String(muestra.alto)} (SSIM 0,991 contra la original al tamaño de 1440; 887 KB, lo mismo que antes)`)
/** Un MP4 mínimo con la escala y el paso de un video de 30 cuadros por segundo (el de antes). */
const de30 = Buffer.alloc(200)
de30.write('mdhd', 10, 'latin1')
de30.writeUInt32BE(15360, 26)
de30.write('stts', 60, 'latin1')
de30.writeUInt32BE(512, 76)
de30.write('tkhd', 100, 'latin1')
controlPositivo('el lector VE un video de 30 cuadros por segundo', de30, (x: Buffer) => delMp4(x).fps === 25)
afirmar(existsSync(path.join(process.cwd(), 'docs/rediseno/VIDEO-DE-SERVICIOS.md')) && /VIDEO-DE-SERVICIOS\.md/.test(deLaRaiz('src/app/v3/_secciones/servicios/contenido.ts')), '  cómo codificar el video de verdad queda escrito (`docs/rediseno/VIDEO-DE-SERVICIOS.md`) y el contenido lo nombra')

// ── T3 · los títulos de volumen ───────────────────────────────────────────
titulo('T3 · los títulos de volumen: extruidos con la Chivo, quietos en el mundo, con su llegada (en el producto desde 3D Y SONIDO)')
// [3D Y SONIDO] T1: pasaron al producto, el negro; `titulos=blanco` para comparar y `titulos=no` los apaga (s40).
afirmar(ENTORNO.titulos === 'negro' && entornoPedido('producto,titulos=blanco').titulos === 'blanco' && entornoPedido('producto,titulos=no').titulos === 'no' && entornoPedido('producto,titulos=otro').titulos === 'negro' && BASE_LIMPIA.titulos === 'no', 'en el producto, el negro; `titulos=blanco` los pide blancos y `titulos=no` los apaga (con banco o en la URL); la base no los tiene')
const pruebasDeLaEscena = leer('PruebasDeLaEscena.tsx')
// [PULIDO 2] 5 · el montaje suma el CTA del final con `?cta=` (en cualquier ancho); los títulos siguen sólo desde 1024.
// [PULIDO 3B] B1 · el del CTA ya es del producto (sin bandera): el montaje no se corta abajo de 1024.
const soloPerezoso = (c: string): boolean => /const TitulosDeVolumen = lazy\(\(\) => import\('\.\/titulos3d\/TitulosDeVolumen'\)\)/.test(c) && !/^import[^\n]*titulos3d\/TitulosDeVolumen/m.test(c) && /if \(entornoDeLaEscena\(\)\.titulos === 'no'\) return null/.test(c) && /\{escritorio && \(\s*<Suspense fallback=\{null\}>\s*<TitulosDeVolumen/.test(c)
afirmar(soloPerezoso(pruebasDeLaEscena), '  un módulo aparte que se descarga después, y sólo desde 1024 (la geometría de la Chivo y su fuente no viajan con la escena)')
controlPositivo('el detector VE la importación directa', `import TitulosDeVolumen from './titulos3d/TitulosDeVolumen'\n${pruebasDeLaEscena}`, soloPerezoso)

// La fuente: la Chivo del sitio en 400 (OFL), convertida a geometría; cada carácter de los títulos tiene su glifo.
const datosDeLaFuente = JSON.parse(deLaRaiz('src/app/v3/_fuentes/chivo-400-titulos.json')) as FontData
const textos = [CONTENIDO_DE_TRABAJOS.titular, FRASE.izquierda, FRASE.derecha]
const cubre = (glifos: Record<string, unknown>): boolean => textos.every((t) => [...t].every((c) => c in glifos))
afirmar(cubre(datosDeLaFuente.glyphs) && datosDeLaFuente.resolution === 1000 && /chivo-latin\.woff2/.test(String(datosDeLaFuente.original_font_information.source)) && existsSync(path.join(process.cwd(), 'src/app/v3/_fuentes/OFL-chivo.txt')), 'la Chivo del sitio (la WOFF2, instanciada en 400) como geometría: cada carácter de los títulos tiene su glifo (si cambian, se vuelve a correr `t3-fuente.py`)', `${String(Object.keys(datosDeLaFuente.glyphs).length)} glifos`)
controlPositivo('el detector VE un título con una letra que la fuente no tiene', { ...datosDeLaFuente.glyphs, P: undefined } as unknown as Record<string, unknown>, (g: Record<string, unknown>) => textos.every((t) => [...t].every((c) => g[c] !== undefined)))

// La geometría: una malla por título; cada vértice con el orden de su letra y su centro; el volumen hacia atrás.
const fuente = new Font(datosDeLaFuente)
const portfolio = armarElTitulo(fuente, 'Portfolio')
const letra = portfolio.geometria.getAttribute('aLetra')
const pivote = portfolio.geometria.getAttribute('aPivote')
const pos = portfolio.geometria.getAttribute('position')
/** El orden de las letras sigue a su x: la de más a la izquierda, 0; la de más a la derecha, 1. */
const ordenada = (g: THREE.BufferGeometry): boolean => {
  const [l, p] = [g.getAttribute('aLetra'), g.getAttribute('aPivote')]
  const porLetra = new Map<number, number>()
  for (let k = 0; k < l.count; k += 1) porLetra.set(l.getX(k), p.getX(k))
  const orden = [...porLetra.entries()].sort((a, b) => a[0] - b[0])
  return orden.length > 1 && orden[0][0] === 0 && orden[orden.length - 1][0] === 1 && orden.every(([, x], k) => k === 0 || x > orden[k - 1][1])
}
let [zMin, zMax] = [Infinity, -Infinity]
for (let k = 0; k < pos.count; k += 1) {
  zMin = Math.min(zMin, pos.getZ(k))
  zMax = Math.max(zMax, pos.getZ(k))
}
afirmar(portfolio.letras === 9 && pivote.count === pos.count && ordenada(portfolio.geometria) && zMax <= VOLUMEN_DEL_TITULO.bisel.grosor + 1e-6 && Math.abs(zMin + VOLUMEN_DEL_TITULO.profundidad + VOLUMEN_DEL_TITULO.bisel.grosor) < 1e-6 && pos.count / 3 < 10000, 'la geometría: una malla, cada vértice con el orden de su letra (de izquierda a derecha) y su centro; la cara de adelante en z = 0 y el volumen atrás', `«Portfolio»: ${String(pos.count / 3)} triángulos, espesor ${String(VOLUMEN_DEL_TITULO.profundidad)} em`)
const alReves = portfolio.geometria.clone()
const invertida = alReves.getAttribute('aLetra')
for (let k = 0; k < invertida.count; k += 1) invertida.setX(k, 1 - invertida.getX(k))
controlPositivo('el detector VE las letras en el orden al revés', alReves, ordenada)
const conDom = armarElTitulo(fuente, 'Portfolio', [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4])
conDom.geometria.computeBoundingBox()
afirmar(Math.abs((conDom.geometria.boundingBox?.min.x ?? 0) - (portfolio.geometria.boundingBox?.min.x ?? 0)) < 1e-6 && (conDom.geometria.boundingBox?.max.x ?? 0) > (portfolio.geometria.boundingBox?.max.x ?? 0) - 0.3 && letra.count === pos.count, '  cada letra va en la x que el DOM le da (el interletrado y el kerning del navegador)')

// La llegada: cada letra de 0 a 1, en orden; la salida, la misma; con movimiento reducido no se mueven (se disuelven).
const pasosT3 = Array.from({ length: 21 }, (_, k) => k / 20)
const llegaBien = (f: (p: number, orden: number) => number): boolean => [0, 0.5, 1].every((o) => f(0, o) === 0 && f(1, o) === 1 && pasosT3.every((p, k) => k === 0 || f(p, o) >= f(pasosT3[k - 1], o))) && pasosT3.every((p) => f(p, 0) >= f(p, 1))
afirmar(llegaBien(llegadaDeLaLetra), 'cada letra llega de 0 a 1 sin volver atrás, la primera antes que la última')
controlPositivo('el detector VE la llegada al revés', (p: number, o: number) => llegadaDeLaLetra(p, 1 - o), llegaBien)
const mismaCuenta = (glsl: string): boolean => glsl.includes(`( p - orden * ${(1 - LLEGADA_DE_LAS_LETRAS.dura).toFixed(5)} ) / ${LLEGADA_DE_LAS_LETRAS.dura.toFixed(5)}`) && /return 1\.0 - pow\( 1\.0 - u, 3\.0 \);/.test(glsl)
afirmar(mismaCuenta(LLEGADA_PARS_GLSL) && /float eDeLaLetra = (mix\( )?llegadaDeLaLetra\( uLlegada, aLetra \) \* \( 1\.0 - llegadaDeLaLetra\( uSalida, aLetra \) \)/.test(LLEGADA_NORMAL_GLSL), '  el vértice hace la misma cuenta (y se van igual: la salida con la misma curva)')
afirmar(/float faltaDeLaLetra = \( 1\.0 - eDeLaLetra \) \* \( 1\.0 - uQuieto \);/.test(LLEGADA_NORMAL_GLSL) && /vAparece = smoothstep\( 0\.0, [0-9.]+, eDeLaLetra \);/.test(LLEGADA_NORMAL_GLSL), '  con movimiento reducido no se mueven ni giran: sólo se disuelven en su lugar')
// [RONDA 2] F2: lo que se muestra ya no persigue con un mínimo de tiempo: es función del scroll, con el asiento al frenar (s43 · F2).
afirmar(/a\.mostrado\.llegada = mostradoDelScroll\(a\.mostrado\.llegada, enViaje \? 0 : a\.titulo\.llegada, asentar, dt, enViaje \? null : a\.titulo\.minimoS, a\.titulo\.asiento\)/.test((leer('titulos3d/TitulosDeVolumen.tsx') + leer('titulos3d/armado.ts'))) && /a\.mostrado\.salida = mostradoDelScroll\(a\.mostrado\.salida, a\.titulo\.salida, asentar, dt(, a\.titulo\.salidaMinimaS)?\)/.test((leer('titulos3d/TitulosDeVolumen.tsx') + leer('titulos3d/armado.ts'))), '  y se nota a cualquier velocidad: lo que se muestra es función del scroll en las dos direcciones, con el asiento al frenar (s43 · F2)')
controlPositivo('el detector VE la persecución de antes', `a.mostrado.llegada = persigue(a.mostrado.llegada, enViaje ? 0 : a.titulo.llegada, dt)`, (c: string) => /mostradoDelScroll\(a\.mostrado\.llegada/.test(c))
afirmar(LLEGADA_DE_LAS_LETRAS.profundidad >= 8 && LLEGADA_DE_LAS_LETRAS.vueltas >= 1, '  la llegada se nota: vienen de atrás (em) y giran sobre sí mismas', `${String(LLEGADA_DE_LAS_LETRAS.profundidad)} em, ${String(LLEGADA_DE_LAS_LETRAS.vueltas)} vueltas`)

// La colocación: con la cámara del momento de la lectura, el origen del título cae en el comienzo de su renglón del DOM.
const logoW = 5.3
const logoH = 3.9
const lugarDePrueba = { izquierda: 778, arriba: 333, linea: 113, cuerpo: 101, ancho: 1440, alto: 900 }
/** Cuánto se aparta (px) el comienzo de la línea de base del título, visto desde `camara`, del que pide el DOM. */
const apartamiento = (camara: THREE.PerspectiveCamera): number => {
  const grupo = new THREE.Group()
  colocar(grupo, camaraDeLaLectura(LECTURA.portfolio, 1440 / 900, logoW, logoH, new THREE.PerspectiveCamera()), lugarDePrueba, datosDeLaFuente)
  const origen = new THREE.Vector3(0, 0, 0).applyMatrix4(grupo.matrixWorld).project(camara)
  const unEm = new THREE.Vector3(1, 0, 0).applyMatrix4(grupo.matrixWorld).project(camara)
  const [x, y] = [((origen.x + 1) / 2) * 1440, ((1 - origen.y) / 2) * 900]
  const em = Math.hypot(((unEm.x - origen.x) / 2) * 1440, ((unEm.y - origen.y) / 2) * 900)
  return Math.max(Math.hypot(x - lugarDePrueba.izquierda, y - lineaDeBase(lugarDePrueba, datosDeLaFuente)), Math.abs(em - lugarDePrueba.cuerpo))
}
const deLectura = camaraDeLaLectura(LECTURA.portfolio, 1440 / 900, logoW, logoH, new THREE.PerspectiveCamera())
afirmar(apartamiento(deLectura) < 0.5, 'con la cámara del momento en que se lee, el título queda donde el DOM le guarda el lugar y de su cuerpo', `apartamiento ${apartamiento(deLectura).toFixed(3)} px (medido en la página, con el puntero al centro: 9 px, el margen izquierdo de la «P»)`)
controlPositivo('el detector VE la cámara de otro momento (el nudo `trabajos`)', camaraDeLaLectura('trabajos', 1440 / 900, logoW, logoH, new THREE.PerspectiveCamera()), (c: THREE.PerspectiveCamera) => apartamiento(c) < 0.5)

// Accesible: el texto del DOM queda para el lector y los buscadores; lo que se ve vive en el lienzo (aria-hidden).
const domT3 = deLaRaiz('src/app/v3/_componentes/titulos3d/TituloDeVolumen.tsx')
// [3D Y SONIDO] T1: el DOM esconde su texto recién con el título armado (`listo`) y sólo desde 1024 (s40).
afirmar(/\{listo && <span className="sr-only hidden escritorio:block">\{texto\}<\/span>\}/.test(domT3) && /<span ref=\{lugar\} className=\{listo \? 'block escritorio:invisible' : 'block'\}>/.test(domT3) && /aria-hidden="true"/.test(leer('EscenaDelHome.tsx')), 'accesible: con el título armado, en el DOM el texto entero para el lector (sr-only) y su lugar guardado sin anunciar (invisible); el 3D vive en el lienzo, que va con aria-hidden; antes, el texto de siempre')
const piezasT3 = deLaRaiz('src/app/v3/_secciones/trabajos/piezas.tsx')
const porQueT3 = deLaRaiz('src/app/v3/_secciones/por-que-develop/PorQueDevelop.tsx')
// [RETOQUE 3D] B1: Portfolio se queda (`queda`) y su `salida` sólo lo esconde con la primera foto del túnel tapando el cuadro.
afirmar(/<TituloDeVolumen id="portfolio" texto=\{CONTENIDO\.titular\} lectura=\{LECTURA\.portfolio\} llegada=\{progresoDeLaMascara\} salida=\{salidaDelTitulo\} llegadaDe=\{seccion\.id\}( minimoS=\{LENTOS\.llegadaDePortfolioS\})? queda \/>/.test(piezasT3) && /salidaDelTitulo\.set\(primeraFotoTapa\(p\) \? 1 : 0\)/.test(piezasT3) && (porQueT3.match(/volumen=\{\{ id: 'frase-(izquierda|derecha)', llegada: frase(, salida: (relevada \? null : levantada|null))?(, corrida: (relevada \? null : corrida|null))? \}\}/g) ?? []).length === 2 && /lectura=\{LECTURA\.frase\} subida=\{SUBIDA_DE_LA_FRASE_SVH \/ 100\}/.test(porQueT3), '  en Portfolio (llega con la máscara, se va con la huida del cartel) y en la frase de Por qué develOP (llega con la frase; [CIERRE RETOQUE 3D] B6: sin salida, s42)')

// De noche se leen como el logo; y las reglas de rendimiento.
const escena3d = (leer('titulos3d/TitulosDeVolumen.tsx') + leer('titulos3d/armado.ts') + leer('titulos3d/sincronia.ts'))
afirmar(/if \(variante === 'blanco'\) shader\.fragmentShader = shader\.fragmentShader\.replace\('#include <map_fragment>', `#include <map_fragment>\\n\$\{FILO_DE_DIA_GLSL\}`\)/.test((leer('titulos3d/TitulosDeVolumen.tsx') + leer('titulos3d/armado.ts'))), 'el blanco, de día, lleva un filo oscuro en el borde de las tapas (sobre el cielo claro se perdía); de noche lo reemplaza el claro')
afirmar(/conLogoDeNoche\(material, contorno, variante === 'blanco' \? \{ ancho: NOCHE_DEL_TITULO\.filo, tapa: NOCHE_DEL_TITULO\.tapaDelBlanco \} : \{ ancho: NOCHE_DEL_TITULO\.filo \}\)/.test(escena3d) && /if \(logo !== null\) a\.material\.emissive\.copy\(logo\.emissive\)/.test(escena3d) && /conElAmanecer\(material\)/.test(escena3d), 'de noche se leen como el logo: su misma emisión en el mismo cuadro y su dibujo (costados negros, tapas claras con filo); el amanecer los oscurece como a la sala')
const reglas = (c: string): boolean =>
  /a\.malla\.visible = (a\.sinLetras \? conRaya && llegada > 0 && salida < 1 : )?llegada > 0 && salida < 1/.test(c) &&
  /malla\.name = `titulo de volumen · \$\{titulo\.id\}`/.test(c) &&
  /dithering: true/.test(c) &&
  // [3D Y SONIDO] T1: compilado y calentado, y recién ahí listo para el DOM. [PASADA FINAL] A1: por lote, en `sincronia.ts`.
  /void Promise\.all\(nuevos\.map\(\(a\) => t\.gl\.compileAsync\(a\.grupo, t\.camara, t\.escena\)\)\)\.then\(\(\) => \{\s*if \(!vivo\(\)\) return\s*calentar\(t\.gl, t\.escena, t\.camara\)/.test(c) &&
  // [RETOQUE 3D] B1: la colocación se mudó a `colocarElArmado` (guarda el lugar para el que se queda).
  /const lugar = lugarDeLectura\(a\.titulo\.lugar, a\.titulo\.subida\)\s*a\.mundoPorPx = colocar\(a\.grupo, nudo, lugar, a\.fuente\.data\) \/\/ una vez por llegada/.test(c)
afirmar(reglas(escena3d), 'las reglas de §4: sin letras en camino no se dibuja (5), con nombre (6), con dithering (8), compilado y calentado al armarse (2), y el DOM se lee una vez por llegada, no por cuadro (3)')
controlPositivo('el detector VE un título que se dibuja siempre', escena3d.replace('a.malla.visible = a.sinLetras ? conRaya && llegada > 0 && salida < 1 : llegada > 0 && salida < 1', 'a.malla.visible = true'), reglas)

// ── CIERRE · el destello de un cuadro ─────────────────────────────────────
// Con scroll real lo mide `npm run test:escena-destello` (pide el servidor); acá, el orden del cuadro y el viaje.
titulo('CIERRE · el destello de un cuadro: el amanecer decide antes que el rig; en un viaje que cambia de luz, quieto')
const amanecer = codigo(leer('amanecer/Amanecer.tsx'))
/** El paso que escribe la noche sostenida, el barrido y el frente corre antes que el rig; los haces, en otro paso, después. */
const ordenDelCuadro = (c: string): boolean => {
  const pasos = c.split('useFrame(').slice(1)
  const estado = pasos.filter((p) => /NOCHE_DEL_AMANECER\.sostenida = m\.activo && momento\.sostieneLaNoche/.test(p) && /u\.uBarridoDelDia\.value =/.test(p) && /u\.uFrenteDelDia\.value =/.test(p))
  const haces = pasos.filter((p) => /dibujarLosHaces\(haces, state\.gl, state\.camera\)/.test(p))
  return /const ANTES_QUE_EL_RIG = -1\b/.test(c) && estado.length === 1 && /\}, ANTES_QUE_EL_RIG\)/.test(estado[0]) && !estado[0].includes('dibujarLosHaces') && haces.length === 1 && !haces[0].includes('ANTES_QUE_EL_RIG')
}
afirmar(ordenDelCuadro(amanecer), 'el estado del amanecer (la noche sostenida, el barrido, el frente) se decide con prioridad −1, antes del rig y de todo lo que lee la noche; los haces, en un paso aparte después del rig (la cámara de este cuadro)')
controlPositivo('el detector VE el paso del estado sin prioridad (después del rig: el cuadro de día)', amanecer.replace('}, ANTES_QUE_EL_RIG)', '})'), ordenDelCuadro)
const eventosDeR3f = readdirSync(path.join(process.cwd(), 'node_modules/@react-three/fiber/dist')).find((f) => /^events-.*\.cjs\.dev\.js$/.test(f)) ?? ''
const r3f = eventosDeR3f === '' ? '' : readFileSync(path.join(process.cwd(), 'node_modules/@react-three/fiber/dist', eventosDeR3f), 'utf8')
afirmar(/internal\.priority = internal\.priority \+ \(priority > 0 \? 1 : 0\)/.test(r3f) && /internal\.subscribers\.sort\(\(a, b\) => a\.priority - b\.priority\)/.test(r3f), '  en r3f una prioridad negativa corre antes que las de 0 y no se lleva el dibujo (sólo una positiva lo toma)', eventosDeR3f)
// [PULIDO 2] 2 · salvo el que llega al amanecer: ahí se completa adentro del viaje con el reloj del viaje (no con el vuelo: s53).
const viajeQuieto = (c: string): boolean => /const cambiaDeLuz = viaje !== null && luzDelViaje === null/.test(c) && /const activo = \(!cambiaDeLuz && \(enLaLlegada \?\? DIA_DEL_FINAL\.activo\)\) \|\| llegaAlAmanecer/.test(c) && /const llegaAlAmanecer = cambiaDeLuz && y1 !== undefined && bloque !== null && compuertaEnLaLlegada\(/.test(c) && /c\.viaje = viaje !== null \|\| m\.deUnViaje/.test(c) && /m\.deUnViaje = cambiaDeLuz/.test(c)
const alLlegar = avanceDelCuadro(0, 0.97, 1 / 75, { recien: true, carga: false, quieto: false, viaje: true, oculto: false, pie: false })
afirmar(viajeQuieto(amanecer) && alLlegar === 0.97, 'en un viaje del menú que cambia de luz el amanecer no corre (la sala la mueve el reloj del viaje) y al llegar va derecho al pedido; corría a la velocidad del vuelo', `al llegar: ${String(alLlegar)}`)
controlPositivo('el detector VE el amanecer que corre en el viaje', amanecer.replace('const activo = (!cambiaDeLuz && (enLaLlegada ?? DIA_DEL_FINAL.activo)) || llegaAlAmanecer', 'const activo = enLaLlegada ?? DIA_DEL_FINAL.activo'), viajeQuieto)

cerrar('s36-escena10')
