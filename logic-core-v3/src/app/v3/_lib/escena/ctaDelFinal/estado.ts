import { entornoDeLaEscena } from '../entorno'
import { FIRME, GUION_S, guionEn } from '../entorno/encendido'

/**
 * [PULIDO 1] P17-B · EL CTA DEL FINAL EN VIVO — las variantes de prueba del CTA de «Por qué develOP» (`?cta=a|b|c|d`; sin
 * bandera, ninguna: el CTA de hoy, igual que antes). Sin `three`: lo escribe el DOM (`_componentes/ctaDelFinal/`) y lo leen
 * las piezas de la escena en cada cuadro (`CtaDelFinal.tsx`). La forma es la de `EN_VIVO` del final: un estado chico de
 * módulo, porque lo leen piezas que corren por cuadro.
 *
 *   a · LOSA     el CTA nace acostado en el piso y se levanta como una placa (con espesor); en hover, el filo blanco recorre
 *                el borde; al abrir Contacto se vuelve a acostar.
 *   b · HAZ      el haz baja sobre el CTA con el parpadeo de su encendido y las letras se encienden en secuencia con él; el
 *                botón queda iluminado desde arriba; al abrir Contacto, el haz se apaga.
 *   c · BLOQUES  los bloques del piso suben y arman un escalón bajo el CTA; en hover, los de cerca pulsan en blanco; al abrir
 *                Contacto, bajan.
 *   d · PORTAL   el CTA es un marco que se dibuja; en hover, el moiré de atrás se deforma hacia el cursor; en el clic, la
 *                placa de Contacto sale desde ese punto.
 *
 * Con el dedo no hay hover: un toque hace el gesto del hover una vez (`toqueEn`) y abre Contacto como el clic.
 */
export type VarianteDelCta = 'a' | 'b' | 'c' | 'd'

/** Una caja en fracciones de la ventana (0 a 1, desde arriba a la izquierda). */
export interface CajaEnLaVentana {
  x: number
  y: number
  ancho: number
  alto: number
}

export const CTA_EN_VIVO = {
  /** La variante montada (la escena dibuja la suya sólo con esto). */
  variante: null as VarianteDelCta | null,
  /** Cuánto llegó el CTA (0 a 1: lo destacado y el botón). */
  llegada: 0,
  /** Si está el puntero encima (o el foco del teclado en el botón). */
  hover: false,
  /** El último toque o clic (ms, `performance.now`): con el dedo, el gesto del hover una vez. */
  toqueEn: Number.NEGATIVE_INFINITY,
  /** Dónde está el puntero (o el último toque), en fracciones de la ventana. */
  puntero: { x: 0.5, y: 0.5 },
  /** La caja del bloque del CTA y la del botón, en fracciones de la ventana. */
  caja: { x: 0, y: 0, ancho: 0, alto: 0 } as CajaEnLaVentana,
  boton: { x: 0, y: 0, ancho: 0, alto: 0 } as CajaEnLaVentana,
  /** Si el contacto está abierto desde este CTA (la salida de cada variante). */
  abierto: false,
}

/** La variante pedida en esta carga (`null`: el CTA de hoy). Se lee después de hidratar: el servidor no la conoce. */
export function varianteDelCta(): VarianteDelCta | null {
  const v = entornoDeLaEscena().pruebas.cta
  return v === 'no' ? null : v
}

/** Los números de las cuatro, con nombre. */
export const CTA_DEL_FINAL = {
  /** Lo que dura el gesto de un toque con el dedo (s). */
  toqueS: 0.7,
  losa: {
    /** Acostada en el piso: girada sobre su borde de abajo (grados). */
    acostada: 90,
    /** Una vuelta del filo blanco por el borde (s) y el largo del filo (fracción del perímetro). */
    vueltaDelFiloS: 1.4,
    filo: 0.22,
    /** El espesor de la placa (px CSS) y lo que tarda en volver a acostarse al abrir Contacto (s, el de la placa de Contacto). */
    espesorPx: 14,
    acostarseS: 0.65,
  },
  haz: {
    /** El guion del encendido del haz (`encendido.ts`), apretado a esto (s). */
    guionS: 1.3,
    /** Lo que tarda el haz en bajar del óculo al CTA (s) y cuánto corre el encendido de una letra a la siguiente (s). */
    bajaS: 0.55,
    pasoEntreLetrasS: 0.035,
    /** Una letra apagada (antes de su encendido). */
    apagada: 0.14,
    /** Lo que sube la luz con el hover y lo que tarda en apagarse al abrir Contacto (s). */
    hover: 0.35,
    apagaS: 0.35,
  },
  bloques: {
    /** El alto del escalón (mundo), lo que tarda en armarse (s) y cuánto se escalona del centro a los bordes (fracción). */
    alto: 1.1,
    armaS: 1.1,
    escalona: 0.55,
    /** El margen del escalón alrededor de la caja del CTA proyectada en el piso (mundo) y su fondo (mundo). */
    margen: 1.5,
    fondo: 6,
    /** El pulso blanco de los bloques de cerca: hasta dónde llega su anillo (mundo), cada cuánto sale uno (s) y cuánto se
     * oscurece la zona mientras pulsa (para que el blanco se lea sobre el papel). */
    radioDelPulso: 12,
    pulsoS: 1.2,
    oscurece: 0.12,
    bajaS: 0.6,
  },
  portal: {
    /** El marco se dibuja con la llegada; la deformación del moiré: cuánto (fracción del radio) y su radio (fracción del alto). */
    tiron: 0.42,
    radio: 0.22,
    /** Lo que tarda la deformación en entrar y salir (s, el resorte). */
    entraS: 0.35,
  },
} as const

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const suave = (x: number): number => {
  const u = acotar01(x)
  return u * u * (3 - 2 * u)
}

/** a · cuánto está acostada la losa (grados): acostada sin llegar, de pie llegada, y acostada otra vez con Contacto abierto. */
export function inclinacionDeLaLosa(llegada: number, salida: number): number {
  const L = CTA_DEL_FINAL.losa
  return L.acostada * Math.max(1 - suave(llegada), suave(salida))
}

/** a · dónde va el filo blanco (fracción del perímetro, desde arriba a la izquierda, en el sentido del reloj) a los `s`. */
export function filoEn(s: number): number {
  const v = s / CTA_DEL_FINAL.losa.vueltaDelFiloS
  return v - Math.floor(v)
}

/** b · el haz a los `s` de que el CTA llegó: cuánto bajó (0 a 1) y su luz (0 a 1, con el parpadeo del encendido). */
export function hazDelCta(s: number): { readonly baja: number; readonly luz: number } {
  const H = CTA_DEL_FINAL.haz
  if (s <= 0) return { baja: 0, luz: 0 }
  return { baja: suave(s / H.bajaS), luz: Math.min(1, guionEn((s / H.guionS) * GUION_S) / FIRME) }
}

/** b · cuánto se ve la letra `i` (de `n`) a los `s` de que el CTA llegó: apagada hasta su encendido, que va en secuencia. */
export function letraDelHaz(i: number, s: number): number {
  const H = CTA_DEL_FINAL.haz
  const propio = s - H.bajaS * 0.5 - i * H.pasoEntreLetrasS
  if (propio <= 0) return H.apagada
  const k = Math.min(1, guionEn((propio / H.guionS) * GUION_S) / FIRME)
  return H.apagada + (1 - H.apagada) * k
}

/** c · cuánto subió el bloque a `d` del centro del escalón (0 en el centro, 1 en el borde) con el escalón en `armado`. */
export function alturaDelEscalon(armado: number, d: number): number {
  const e = CTA_DEL_FINAL.bloques.escalona
  return CTA_DEL_FINAL.bloques.alto * suave((armado * (1 + e) - acotar01(d) * e) / 1)
}

/** El gesto de un toque (0 a 1 a 0) a los `s` del toque: con el dedo, el hover una vez. */
export function gestoDelToque(s: number): number {
  const T = CTA_DEL_FINAL.toqueS
  if (s < 0 || s > T) return 0
  return Math.sin((Math.PI * s) / T)
}
