/**
 * SPRINT ESCENA 10 — CIERRE DE ESCENA 9 Y TÍTULOS 3D, lo que se puede prometer sin navegador. Cada afirmación lleva su
 * control positivo donde el chequeo podría pasar por no mirar nada. Una sección por ticket.
 *
 * T1 · el cierre de ESCENA 9 en el producto: el logo de noche claro, el negro satinado, la sombra del logo, ACES
 *      compensado y el scroll de nk, con sus banderas `=no` para el banco; lo demás borrado (las otras variantes, el
 *      brillante, el bloom, AgX y Neutral como opción, el sedoso, los títulos de ESCENA 9). Y la luz según el momento:
 *      de día la sombra del logo y la mancha de contacto, sin haz; de noche sólo la mancha dura del haz; el paso sigue a
 *      la noche EN EL LOGO, que en el amanecer cambia cuando el frente lo alcanza (sin saltos).
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { momentoEn } from '../amanecer/linea'
import { BASE_LIMPIA, ENTORNO, PRUEBAS_APAGADAS, entornoPedido } from '../entorno'
import { nocheDelLogo } from '../entorno/nocheDelLogo'
import { NIVELES_DEL_HAZ } from '../entorno/vivo'
import { SATINADO } from '../estudio'
import * as logoDeNoche from '../logoDeNoche'
import { INK_ROUGHNESS } from '../probeScene'
import { manchasDelHaz } from '../sombra/sombraDelHaz'
import { TONO_COMPENSADO_GLSL } from '../tono'

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
afirmar(Object.keys(PRUEBAS_APAGADAS).join() === 'aa', '  de las pruebas de ESCENA 9 queda sólo el antialiasing (no se decidió)', Object.keys(PRUEBAS_APAGADAS).join())

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

// El bloom, borrado: ni su capa, ni sus pasos, ni su bandera.
const pp = codigo(leer('gpu/posproceso.ts'))
afirmar(!/bloom|Bloom|LOS_QUE_BRILLAN|CAPA_DEL_BLOOM|UMBRAL_GLSL|BAJAR_GLSL|SUBIR_GLSL/.test(pp) && !/bloom/.test(codigo(leer('entorno.ts'))), 'el bloom se borró: ni la capa de lo que brilla, ni la cadena de niveles, ni la bandera')

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
  /vEnElHaz = uHaz \* uNocheDelLogo \* \(/.test(p) &&
  /float cuantoHaz = vEnElHaz \* mix\( uHazDia\.z, uHazNoche\.z, uNocheDelLogo \);/.test(p)
afirmar(conLaNocheDelLogo(haz, polvoVivo), '  la columna, el charco y el polvo del haz siguen a la noche en el logo (en el amanecer se van cuando el frente lo alcanza)')
controlPositivo('el detector VE el polvo del haz con la noche de la sala', [haz, polvoVivo.replace('vEnElHaz = uHaz * uNocheDelLogo * (', 'vEnElHaz = uHaz * (')], ([h, p]: string[]) => conLaNocheDelLogo(h, p))
afirmar(/cono\.current\.visible = dia\.x > 0 \|\| \(noche\.x > 0 && n > 0\)/.test(haz), '  sin haz la columna no se dibuja (regla 5)')
const entornoTsx = leer('entorno/Entorno.tsx')
const i = entornoTsx.indexOf('VIVO.uNocheDelLogo.value = nocheDelLogo(VIVO.uNoche.value, AMANECER_EN_VIVO.uBarridoDelDia.value, AMANECER_EN_VIVO.uFrenteDelDia.value)')
afirmar(i > entornoTsx.indexOf('VIVO.uNoche.value = BRILLO_DE_LA_NOCHE.uNoche.value') && i < entornoTsx.indexOf('if (e.E1) {') && /const noche = VIVO\.uNocheDelLogo\.value\s*m\.encendido = avanzarElEncendido/.test(entornoTsx), '  la escribe el entorno en cada cuadro, antes del haz; el encendido también la sigue (no se apaga al empezar el barrido)')

// Las manchas: de día la blanda; de noche sólo la dura del haz (la blanda, cero); el haz apagado un instante, ninguna.
const [dia, noche, apagado] = [manchasDelHaz(0, 1, true), manchasDelHaz(1, 1, true), manchasDelHaz(1, 0, true)]
afirmar(dia.opacidadBlanda > 0.5 && dia.opacidadDura === 0 && noche.opacidadBlanda === 0 && noche.opacidadDura > 1 && apagado.opacidadBlanda === 0 && apagado.opacidadDura === 0, 'de día, la mancha de contacto; de noche, sólo la mancha dura del haz; sin luz (el haz apagado en su encendido), ninguna', JSON.stringify({ dia, noche }))
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
afirmar(/const haz = manchasDelHaz\(VIVO\.uNocheDelLogo\.value, HAZ_ENCENDIDO\.k, conElHaz && entorno\.E1\)/.test(leer('ContactOcclusion.tsx')), '  la sombra de contacto la lee con la noche en el logo')

// La sombra del logo: de día con la principal; cuánto, el día que hay en el logo (sin el corte al 3 % de ESCENA 9).
const luzDelLogo = leer('LuzDelLogo.tsx')
const sombraSinSaltos = (c: string): boolean => /const fuerza = SOMBRA_DEL_LOGO\.fuerza \* Math\.min\(1, principal\.intensity \/ KEY_INTENSITY\) \* \(1 - VIVO\.uNocheDelLogo\.value\)/.test(c) && !/cruda < 0\.03/.test(c)
afirmar(sombraSinSaltos(luzDelLogo), 'la sombra del logo sobre el piso vivo va de día: la luz principal por el día en el logo (de noche, cero; en el amanecer vuelve con el frente), sin el corte al 3 %')
controlPositivo('el detector VE el corte de la prueba de ESCENA 9', `${luzDelLogo}\nconst fuerza = cruda < 0.03 ? 0 : cruda`, sombraSinSaltos)
afirmar(/\{e\.sombraDelLogo && e\.pisoVivo \? <SombraDelLogo \{\.\.\.props\} \/> : null\}/.test(luzDelLogo) && /const conSombra = entornoDeLaEscena\(\)\.sombraDelLogo/.test(leer('piso/PisoVivo.tsx')), '  se monta con el piso vivo (es quien la recibe), y el banco la apaga con `sombra-logo=no`')

cerrar('s36-escena10')
