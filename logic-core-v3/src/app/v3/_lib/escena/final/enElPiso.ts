import * as THREE from 'three'

import { ANCLAS_DEL_DIBUJO } from '../piso/ondaDirigida'
import { DISTANCIA_AL_LOGO_GLSL, HUECO } from './hueco'
import { CORRIENTES_DE_LA_LUZ_GLSL, ENERGIA_EN_LA_SIMULACION_GLSL, LUZ_DE_ABAJO, LUZ_DE_ABAJO_EN_VIVO, RUIDO_DE_LA_LUZ_GLSL } from './luzDeAbajo'
import { ABRE_LA_JUNTA_GLSL, DESCARGA_DEL_FILO_GLSL, FILO, FILO_EN_VIVO } from './filoConPoder'

/**
 * [CIERRE] 3 · EL FINAL EN EL PISO VIVO — lo que el final le suma al piso, inyectado al armarlo (como la onda dirigida de
 * INTERFAZ 2): sin final todo vale cero y el piso es exactamente el de siempre.
 *
 *   · EL GOLPE (`uGolpe`): cuando el logo se encastra, un anillo fuerte que nace en él y corre por el piso (en la ecuación
 *     de ondas: el piso se levanta con su física, se refleja y se amortigua). [2E] Lo dibuja el resplandor de las juntas.
 *   · [EL ENCASTRE] 2F · EL PISO BAJO EL MOUSE (`uRastro`; reemplaza al piso que vibraba y al círculo oscuro de CIERRE,
 *     que se leía como una sombra que seguía al mouse): por donde pasa el mouse queda un rastro de puntos que se apagan
 *     con inercia (`rastro.ts`); en la simulación, levanta un poco los bloques; en el dibujo, por las rendijas que se
 *     abren (un bloque más alto que su vecino) sale el resplandor de abajo, con la forma de las juntas. Con el poder.
 *     [RETOQUE DEL ENCASTRE] 1E · ese resplandor era de tinta (oscuro, denso): ahora es LUZ (`LUZ_EN_EL_PISO`).
 *
 * [EL ENCASTRE] 2D · EL HUECO EXACTO (`hueco.ts`): el piso descarta sus tapas y costados donde la máscara del logo
 * acostado dice «adentro» (`uHueco`, en el plano del logo: (x, −z)) y su campo ancho pasa el umbral de la apertura
 * (`uApertura`: se abre desde el medio de los trazos hacia el borde exacto); el borde del corte se oscurece apenas (el
 * labio del pozo). Alrededor del logo el mar se calma (`uCalmaDelFinal`, en la simulación: el piso queda al ras) y el
 * techo que lo esquivaba se apaga (el logo entra en el piso). La mancha de contacto se va con la cámara (`uSinMancha`).
 * [RETOQUE DEL ENCASTRE] 1B · el labio, apenas (el hueco es del tono del piso) y se va al quedar al ras; 1C · el piso
 * calmo queda `HUECO.bajoElRas` debajo de la cara del logo al ras (sin contorno: `hueco.ts`).
 *
 * [EL ENCASTRE] 2E · EL PODER: cuando el logo queda al ras, desde las JUNTAS de los bloques alrededor del logo sale un
 * resplandor (`uPoder`), vivo (fluye y respira con un ruido lento) y más fuerte cerca del logo. El golpe es su pulso: el
 * frente corre por el piso con su física y enciende las juntas por donde pasa. [RETOQUE DEL ENCASTRE] 1F · ese resplandor
 * era de tinta: ahora es la luz de abajo (`LUZ_EN_EL_PISO`), más tenue que bajo el mouse, y el piso entero queda
 * energizado: las ondas y el mar dejan escapar la luz por las rendijas que abren al pasar.
 */
export const GOLPE_EN_EL_PISO = {
  /**
   * [NOCTURNO FINAL] B1 · LA SÚPER ONDA: la del encastre y la de la llegada del logo al cargar (`intro/caida.ts`),
   * mucho más grande que las de siempre (que se note): más lejos, más fuerte, más ancha y más larga. Antes: 1,7 s, 32 u,
   * 70 y 1,3 u (apenas más que un principal del pulso).
   */
  duracionS: 2.6,
  /** Hasta dónde llega el frente (u), su empuje y su ancho (u). */
  alcance: 58,
  fuerza: 120,
  ancho: 2.1,
  /**
   * Cuánto más alta se dibuja mientras dura (u): el piso dibuja sus ondas con un tope suave (`tanh`, 0,42 u: «llamativa,
   * no invasiva»), y con ese tope la súper onda no podía verse más alta que una de siempre.
   */
  masAlta: 1,
} as const

/**
 * [EL ENCASTRE] 2F · EL RASTRO DEL MOUSE en el piso: cuántos puntos, cada cuánto se agrega uno (u), en cuánto se apaga
 * (s: la inercia), su radio (u), cuánto levanta los bloques (u) y con qué fuerza los lleva (como la loma del cursor).
 */
export const RASTRO_EN_EL_PISO = { puntos: 8, cada: 0.55, apagaS: 0.9, radio: 1.7, alto: 0.3, rigidez: 120 } as const

/**
 * [EL ENCASTRE] 2D · el mar calmo alrededor del logo; y cuánto oscurece el labio.
 * [NOCTURNO FINAL] B3 · EL CÍRCULO ESTABLE (antes, una elipse angosta en la caja del logo, que sólo ocultaba el dibujo: el
 * mar seguía debajo y en el borde, en dos bloques y medio, el piso pasaba de las olas a cero: un rectángulo hundido en
 * escalones, que el golpe dejaba bien a la vista). Ahora es un CÍRCULO alrededor del centro del logo: entero hasta `radio`
 * (u: el logo y un margen) y con un borde ancho y suave (`borde`, u: cinco bloques), sin escalones; y es de verdad quieto:
 * adentro los bloques se asientan (la onda se amortigua, `amortigua` 1/s más) y no reaccionan al mouse, al pulso, al golpe
 * ni a las ondas (sus empujes se apagan con la calma). El orden en medio del caos.
 * [PULIDO 6] E2 · SIN EL CÍRCULO LISO («que haya poder alrededor suyo»): la calma es un MARGEN pegado al hueco, medido con la
 * distancia al contorno del logo (`distanciaAlLogo`), no con el radio. Al ras quedan los bloques que tocan el filo entero (el
 * centro de un bloque a menos de media diagonal más `margen`, u: el filo en su ancho mayor y un aire); en `borde` (u) vuelven al
 * caos. Los bloques pegados no tapan ni cortan el logo ni el hueco, y la luz igual sale por sus juntas hasta el borde mismo: la
 * calma aplana las alturas, no la energía (`luzDeAbajo.ts`).
 */
export const CALMA_EN_EL_PISO = { margen: FILO.desde + FILO.ancho * (1 + FILO.crece) + 0.04, borde: 1, amortigua: 30, labio: 0.1 } as const

/**
 * [PULIDO 1] P1 · el brillo del piso (zonas blancas sobre las tapas) se rehízo en [PULIDO 2] 4: la luz sale de ABAJO, por las
 * juntas (`luzDeAbajo.ts`: las zonas, el sector, el plano que brilla debajo; acá, lo que hace el piso con ella).
 */
/** [PULIDO 2] 4 · sólo para el banco: la luz apagada (para medir su costo por diferencia, en el mismo cuadro). */
export const LUZ_DEL_BANCO = { apagada: false }

/** Los uniformes del final en el piso: los comparten la simulación y el dibujo; los escribe `FinalDelPie`. */
export const FINAL_EN_EL_PISO = {
  /** nace (reloj de la escena), x, z (u), fuerza (0: ninguno). */
  uGolpe: { value: new THREE.Vector4(0, 0, 0, 0) },
  /** [EL ENCASTRE] 2F · el rastro del mouse: x, z (u) y cuánto vale cada punto (0: apagado). */
  uRastro: { value: Array.from({ length: RASTRO_EN_EL_PISO.puntos }, () => new THREE.Vector4(9999, 9999, 0, 0)) },
  /** [EL ENCASTRE] 2D · la máscara del logo acostado (R: la forma; G: el campo ancho) y su marco en el plano del logo. */
  uHueco: { value: null as THREE.Texture | null },
  uMarcoDelHueco: { value: new THREE.Vector4(0, 0, 1, 1) },
  /** [PULIDO 6] E2 · el campo de distancia al logo (u) y su marco en el plano del logo (`hueco.ts`). */
  uDistanciaAlLogo: { value: null as THREE.Texture | null },
  uMarcoDeLaDistancia: { value: new THREE.Vector4(0, 0, 1, 1) },
  /** 0 a 1: cuánto se abrió el hueco. */
  uApertura: { value: 0 },
  /** 0 a 1: cuánto se calmó el mar alrededor del logo; la media caja del logo en su plano (u). */
  uCalmaDelFinal: { value: 0 },
  uCajaDelLogo: { value: new THREE.Vector2(2.7, 2.4) },
  /** 0 a 1: cuánto se fue la mancha de contacto (con la cámara que sube). */
  uSinMancha: { value: 0 },
  /** [EL ENCASTRE] 2E · el poder liberado: 0 sin poder, 1 entero (con un destello al liberarse, un poco más). */
  uPoder: { value: 0 },
  /**
   * [PULIDO 1] P1 · cuánto se oscurece el piso entero mientras corre la luz (0 a `oscurece`): en el color que se ve, porque
   * el tono de ACES aplasta los blancos. [PULIDO 3] A1 · gradual con la expansión de la energía (`cuadroDelFinal.ts`).
   */
  uOscuroDelBrillo: { value: 0 },
}


const f = (n: number): string => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/** Dónde entra en la simulación: antes de `main` (las funciones), junto al empuje de la onda dirigida, el dibujo y el techo. */
export const ANCLAS_DEL_FINAL = {
  main: 'void main() {',
  empuje: 'fuerza += empujeDeLaOnda( p, r * uLado );',
  dibujo: 'float dibujo = ( onda + marEn( xz, uTiempo ) ) * enElMar;',
  techo: 'if ( uConLogo > 0.5 ) {',
  /** [PULIDO 3] A1 · la salida: la energía del bloque va al canal libre. */
  salida: 'salida = vec4( nueva, h, dibujo, 1.0 );',
} as const

const SIMULACION_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform vec4 uRastro[ ${String(RASTRO_EN_EL_PISO.puntos)} ];
uniform float uCalmaDelFinal;
uniform vec2 uCajaDelLogo;
// [PULIDO 6] E2 · la distancia al logo, para medir desde el filo (\`hueco.ts\`).
${DISTANCIA_AL_LOGO_GLSL}
// [NOCTURNO FINAL] B1 · el tope del dibujo de la onda, más alto mientras dura la súper onda.
float topeConElGolpe( float tope ) {
	if ( uGolpe.w <= 0.0 ) return tope;
	float t = ( uTiempo - uGolpe.x ) / ${f(GOLPE_EN_EL_PISO.duracionS)};
	if ( t < 0.0 || t > 1.0 ) return tope;
	return tope + uGolpe.w * ${f(GOLPE_EN_EL_PISO.masAlta)} * pow( 1.0 - t, 1.2 );
}
float empujeDelGolpe( vec2 xz ) {
	if ( uGolpe.w <= 0.0 ) return 0.0;
	float t = ( uTiempo - uGolpe.x ) / ${f(GOLPE_EN_EL_PISO.duracionS)};
	if ( t < 0.0 || t > 1.0 ) return 0.0;
	float frente = 1.5 + ${f(GOLPE_EN_EL_PISO.alcance)} * ( 1.0 - pow( 1.0 - t, 2.2 ) );
	// [PULIDO 6] E2 · el del encastre nace en el filo (la distancia al logo); el de la llegada del logo, en su punto.
	float desde = uCalmaDelFinal > 0.0 ? distanciaAlLogo( xz ) + 1.5 : length( xz - uGolpe.yz );
	float d = ( desde - frente ) / ${f(GOLPE_EN_EL_PISO.ancho)};
	return uGolpe.w * ${f(GOLPE_EN_EL_PISO.fuerza)} * exp( - d * d ) * pow( 1.0 - t, 1.5 ) * smoothstep( 0.0, 0.04, t );
}
// [EL ENCASTRE] 2F · el rastro del mouse levanta un poco los bloques (un resorte hacia una loma bajo cada punto).
float empujeDelRastro( vec2 p, float h ) {
	float f = 0.0;
	for ( int i = 0; i < ${String(RASTRO_EN_EL_PISO.puntos)}; i++ ) {
		vec4 q = uRastro[ i ];
		if ( q.z <= 0.0 ) continue;
		vec2 d = p - q.xy / uLado;
		float g = exp( - dot( d, d ) * uLado * uLado / ${f(RASTRO_EN_EL_PISO.radio * RASTRO_EN_EL_PISO.radio)} );
		f += q.z * ${f(RASTRO_EN_EL_PISO.rigidez)} * g * ( ${f(RASTRO_EN_EL_PISO.alto)} * g - h );
	}
	return f;
}
// [EL ENCASTRE] 2D · el mar calmo alrededor de la caja del logo acostado (en su plano: x, −z). [PULIDO 6] E2 · un margen pegado
// al hueco (la distancia al logo desde el centro del bloque: media diagonal y el margen, al ras; en el borde, al caos).
float calmaDelFinal( vec2 xz ) {
	if ( uCalmaDelFinal <= 0.0 ) return 0.0;
	float alRas = 0.7072 * uLado + ${CALMA_EN_EL_PISO.margen.toFixed(3)};
	return uCalmaDelFinal * ( 1.0 - smoothstep( alRas, alRas + ${f(CALMA_EN_EL_PISO.borde)}, distanciaAlLogo( xz ) ) );
}
// [PULIDO 2] 4 · con energía cada bloque queda a su alto (un azar por bloque entre \`alturas\`): el piso se desordena.
// [PULIDO 3] A1 · la energía es la del campo (\`luzDeAbajo.ts\`). [PULIDO 3B] B0 · y los pistones suben su racimo (lo suma
// \`main\`, con la altura de la luz): sin temblor. [PULIDO 6] E2 · los bloques pegados al hueco quedan al ras (la calma).
${ENERGIA_EN_LA_SIMULACION_GLSL}
float alturaDeLaLuz( vec2 xz, float e ) {
	if ( e <= 0.0 ) return 0.0;
	vec2 celda = floor( xz / uLado );
	return min( e, 1.4 ) * mix( ${f(LUZ_DE_ABAJO.alturas[0])}, ${f(LUZ_DE_ABAJO.alturas[1])}, azarDeLaLuz( celda + 0.37 ) ) * ( 1.0 - calmaDelFinal( xz ) );
}
`

/** La simulación del piso con el final: el golpe, el rastro del mouse, la calma y [PULIDO 3] A1 la energía de cada bloque. */
export function conElFinalEnLaSimulacion(glsl: string): string {
  if (Object.values(ANCLAS_DEL_FINAL).some((ancla) => !glsl.includes(ancla)) || !ONDA_CON_TOPE.test(glsl)) {
    throw new Error('[CIERRE] 3 · la simulación del piso cambió: el final no encuentra dónde entrar')
  }
  return glsl
    .replace(ANCLAS_DEL_FINAL.main, `${SIMULACION_GLSL}${ANCLAS_DEL_FINAL.main}`)
    .replace(
      ANCLAS_DEL_FINAL.empuje,
      `${ANCLAS_DEL_FINAL.empuje}\n\tfuerza += empujeDelGolpe( p * uLado ) + empujeDelRastro( p, h );\n\tfloat calmaAqui = calmaDelFinal( p * uLado );\n\tfuerza *= 1.0 - calmaAqui;\n\tamortigua += ${f(CALMA_EN_EL_PISO.amortigua)} * calmaAqui;`,
    )
    .replace(ANCLAS_DEL_FINAL.dibujo, `${ANCLAS_DEL_FINAL.dibujo}\n\tdibujo *= 1.0 - calmaDelFinal( xz );\n\tdibujo -= ${f(HUECO.bajoElRas)} * calmaDelFinal( xz );\n\tfloat pistonAqui;\n\tfloat energiaAqui = energiaDeLaLuz( xz, pistonAqui );\n\tdibujo += alturaDeLaLuz( xz, energiaAqui ) + pistonAqui;\n\tdibujo = mix( dibujo, fondoDeLaLuz( dibujo ), clamp( uEnergiaDeLaLuz * 4.0, 0.0, 1.0 ) );`)
    .replace(ANCLAS_DEL_FINAL.salida, 'salida = vec4( nueva, h, dibujo, energiaAqui );')
    .replace(ANCLAS_DEL_FINAL.techo, 'if ( uConLogo > 0.5 && uCalmaDelFinal <= 0.0 ) {')
    .replace(ONDA_CON_TOPE, 'float topeDeLaOnda = topeConElGolpe( $1 );\n\tfloat onda = topeDeLaOnda * tanh( nueva / topeDeLaOnda );')
}

/** [NOCTURNO FINAL] B1 · el dibujo de la onda con su tope suave (el número es el de `PISO_VIVO.onda.tope`). */
const ONDA_CON_TOPE = /float onda = ([0-9.]+) \* tanh\( nueva \/ \1 \);/

const DIBUJO_GLSL = /* glsl */ `
uniform vec4 uGolpe;
uniform sampler2D uHueco;
uniform vec4 uMarcoDelHueco;
uniform float uApertura;
uniform float uSinMancha;
uniform vec2 uCajaDelLogo;
// [EL ENCASTRE] 2E · el poder liberado (0 sin poder, 1 entero; en el destello, un poco más).
uniform float uPoder;
// [PULIDO 2] 4 · LA LUZ DE ABAJO EN EL PISO (\`luzDeAbajo.ts\`): la energía del bloque (cada uno se prende entero; [PULIDO 3]
// A1 · la de la simulación, que el vértice lee de la textura de alturas); la luz se SUMA en los costados (desde su base: más
// fuerte abajo, se apaga hacia arriba) y en los cantos de la tapa que dan a una rendija. La tapa no se blanquea; lo que brilla
// por las rendijas es el plano de abajo. [PULIDO 3B] B0 · y las corrientes que corren por las juntas, con el reloj de la luz.
uniform float uOscuroDelBrillo;
uniform float uRelojDeLaLuz;
uniform float uBrilloDeLaLuz;
varying float vEnergiaDelBloque;
${RUIDO_DE_LA_LUZ_GLSL}
${CORRIENTES_DE_LA_LUZ_GLSL}
${DISTANCIA_AL_LOGO_GLSL}
${DESCARGA_DEL_FILO_GLSL}
vec3 conLasJuntas( vec3 color, vec2 xz ) {
	float s = vEnergiaDelBloque;
	if ( s <= 0.0 ) return color;
	// [PULIDO 6] E2 · la descarga del filo, en la luz de la junta. [PULIDO 7] F1 · sin derramarse sobre la tapa (dejaba manchas
	// blancas): por donde pasa, la junta se abre (\`ABRE_LA_JUNTA_GLSL\`, en el vértice) y se ve la luz de abajo.
	float descarga = descargaDelFilo( vPiso.xz, uLado );
	float luz;
	if ( vTapa < 0.5 ) {
		luz = ${f(LUZ_DE_ABAJO.costado)} * exp( - max( 0.0, vAlto - vVecino ) / ${f(LUZ_DE_ABAJO.caeEn)} );
	} else {
		vec2 borde = min( vEnElBloque, 1.0 - vEnElBloque ) * uLado;
		luz = ${f(LUZ_DE_ABAJO.canto)} * exp( - min( borde.x, borde.y ) / ${f(0.04)} );
		// La tapa no se blanquea: la luz viene de abajo, así que en el sector queda apenas más en sombra.
		color *= 1.0 - ${f(LUZ_DE_ABAJO.sombraDeLaTapa)} * min( s, 1.0 );
	}
	float junta = brilloDeLaJunta( vPiso.xz, uRelojDeLaLuz ) * s + corrientesDeLaLuz( vPiso.xz, uLado ) * ( 0.4 + min( s, 1.0 ) );
	junta += descarga * ( 0.4 + min( s, 1.0 ) );
	return color + vec3( luz * junta * uBrilloDeLaLuz );
}
// [EL ENCASTRE] 2D · la máscara del logo acostado en este punto del piso: R, la forma; G, el campo ancho; [PULIDO 7] B, las contraformas.
vec3 mascaraDelHueco( vec2 xz ) {
	vec2 uv = ( vec2( xz.x, - xz.y ) - uMarcoDelHueco.xy ) / uMarcoDelHueco.zw;
	if ( any( lessThan( uv, vec2( 0.0 ) ) ) || any( greaterThan( uv, vec2( 1.0 ) ) ) ) return vec3( 0.0 );
	return texture2D( uHueco, uv ).rgb;
}
// [PULIDO 7] F1 · y con el hueco abierto entero, las contraformas: ahí va lo liso (\`liso.ts\`), sin bloques ni juntas.
bool enElHueco( vec2 xz ) {
	if ( uApertura <= 0.0 ) return false;
	vec3 m = mascaraDelHueco( xz );
	return ( m.r > 0.5 && m.g > ( 1.0 - uApertura ) * 0.95 ) || ( uApertura >= 1.0 && m.b > 0.5 );
}
// [PULIDO 4] C2 · el filo del logo encendido (PULIDO 3B · B0) se fue. [PULIDO 5] D2 · y el círculo difuso de PULIDO 4 también:
// la luz era el anillo (o el disco) de anilloDeLuz.ts. [PULIDO 6] E2 · se borró: la luz es el filo (\`filoConPoder.ts\`, su malla).
float labioDelHueco( vec2 xz ) {
	if ( uApertura <= 0.0 ) return 0.0;
	vec3 m = mascaraDelHueco( xz );
	return uApertura * ( 1.0 - min( 1.0, uPoder ) ) * smoothstep( 0.12, 0.45, m.g ) * ( 1.0 - smoothstep( 0.3, 0.6, m.r ) );
}
`

/** [PULIDO 2] 4 · dónde se achica el bloque en el vértice (después de llevarlo al disco, antes de anotar su alto y su lugar). */
const ANCLA_DEL_BLOQUE = 'vAlto = transformed.y;'

/** Las anclas del dibujo del piso que el final usa además de la de la onda: el arranque de `main`, la mancha y la niebla. */
export const ANCLAS_DEL_HUECO = {
  descarte: '#include <clipping_planes_fragment>',
  mancha: 'vec2 m = manchaDelContacto( vPiso.xz );',
  niebla: '#include <fog_fragment>',
} as const

/** El dibujo del piso con el final: el hueco, su labio, el resplandor de las juntas (el poder, el pulso, el rastro) y la mancha que se va. */
export function conElFinalEnElPiso<T extends THREE.Material>(material: T): T {
  const previo = material.onBeforeCompile.bind(material)
  const clavePrevia = material.customProgramCacheKey.bind(material)
  material.customProgramCacheKey = () => `${clavePrevia()}|final-del-pie`
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    const anclas = [ANCLAS_DEL_DIBUJO.funcion, ...Object.values(ANCLAS_DEL_HUECO)]
    if (anclas.some((ancla) => !shader.fragmentShader.includes(ancla))) {
      throw new Error('[CIERRE] 3 · el dibujo del piso cambió: el final no encuentra dónde entrar')
    }
    Object.assign(shader.uniforms, FINAL_EN_EL_PISO, LUZ_DE_ABAJO_EN_VIVO, FILO_EN_VIVO)
    // [PULIDO 2] 4 · con energía los bloques se separan un poco (se achican sobre su centro): se abren las rendijas. [PULIDO 3]
    // A1 · la energía del bloque es la de la simulación (el canal libre de su textura), más con las ondas.
    if (shader.vertexShader.includes(ANCLA_DEL_BLOQUE)) {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\nvarying float vEnergiaDelBloque;\n${RUIDO_DE_LA_LUZ_GLSL}\nuniform vec2 uCajaDelLogo;\nuniform float uRelojDeLaLuz;\n${DISTANCIA_AL_LOGO_GLSL}\n${DESCARGA_DEL_FILO_GLSL}`)
        .replace(ANCLA_DEL_BLOQUE, `vEnergiaDelBloque = texelFetch( uAlturas, celda, 0 ).a;\n\t\ttransformed.xz *= 1.0 - ${f(2 * LUZ_DE_ABAJO.separa)} * min( vEnergiaDelBloque, 1.6 ) * ( ${f(1 - LUZ_DE_ABAJO.variaLaSeparacion)} + ${f(LUZ_DE_ABAJO.variaLaSeparacion)} * azarDeLaLuz( floor( centro / uLado ) + 0.71 ) );\n${ABRE_LA_JUNTA_GLSL}\n\t\t${ANCLA_DEL_BLOQUE}`)
    }
    shader.fragmentShader = shader.fragmentShader
      .replace(ANCLAS_DEL_DIBUJO.funcion, `${DIBUJO_GLSL}${ANCLAS_DEL_DIBUJO.funcion}`)
      .replace(ANCLAS_DEL_HUECO.descarte, `${ANCLAS_DEL_HUECO.descarte}\n\tif ( enElHueco( vPiso.xz ) ) discard;`)
      .replace(ANCLAS_DEL_HUECO.mancha, 'vec2 m = manchaDelContacto( vPiso.xz ) * ( 1.0 - uSinMancha );')
      .replace(ANCLAS_DEL_HUECO.niebla, `gl_FragColor.rgb *= 1.0 - ${f(CALMA_EN_EL_PISO.labio)} * labioDelHueco( vPiso.xz );\n\tgl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;\n\tgl_FragColor.rgb = conLasJuntas( gl_FragColor.rgb, vPiso.xz );\n${ANCLAS_DEL_HUECO.niebla}`)
  }
  return material
}
