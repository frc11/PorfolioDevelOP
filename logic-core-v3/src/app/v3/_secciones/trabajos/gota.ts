/**
 * LA GOTA — cómo entra la noche de Trabajos. **[B12]**
 *
 * > *«Que la transición de escena a Star Wars tenga un efecto de gota o algo
 * > exótico y deluxe.»*
 *
 * ── ⚠️ NO ARRANCA DE CERO: ES EL MECANISMO DE B3 CON OTRA FORMA ────────────
 *
 * B3 construyó el **revelado** (`_lib/escena/revelado.ts`): una función pura que
 * produce un `mask-image` de gradiente y una capa fina que lo escribe en el DOM
 * por cuadro. Ahí la forma es un `linear-gradient` que ablanda la COSTURA
 * horizontal entre un panel opaco y uno transparente. Acá es exactamente lo
 * mismo —función pura + `mask-image`, cero JavaScript por cuadro más allá de
 * escribir una cadena— con **la forma cambiada: un `radial-gradient` que se
 * abre desde el centro del cuadro**. Una gota.
 *
 * La pluma del borde tampoco es un número nuevo: es `REVELADO_FRACCION`, el
 * octavo con el que B3 ablanda su costura y con el que `visibilidad.ts` declara
 * su margen de reanudación. No se importa —traer `_lib/escena/revelado` a una
 * sección metería la tabla de superficies y el atributo del panel en la
 * conversación del empaquetador por una constante— sino que se escribe acá con
 * su procedencia, **y el invariante afirma la igualdad**. Es la misma costura
 * que `ANCLA_DEL_PIN` y `CORTE_DE_TRAMOS` ya tienen en este contrato.
 *
 * ── ⚠️ POR QUÉ LA GOTA PINTA Y NO ENMASCARA LA ESCENA ─────────────────────
 *
 * B3 enmascara el envoltorio de la escena, y donde la máscara es transparente
 * se ve **el piso de papel** que `layout.tsx` pinta detrás del canvas. Eso sirve
 * para entrar a una sección de papel y no sirve para entrar a la noche: la parte
 * oculta se vería BLANCA, que es lo contrario de lo que hay que contar.
 *
 * Así que la gota es una capa propia, adentro del panel de Trabajos, que pinta
 * `var(--color-fondo)` —adentro de `[data-seccion="invertida"]` ese token vale
 * **#0E0E0E**, o sea el color de la noche, no un color nuevo— y se enmascara a
 * sí misma. **No es el velo que B8 prohibió**: aquél era una superficie
 * translúcida sostenida sobre una sala clara —«un velo sobre papel da gris,
 * nunca negro»— y ésta es una capa OPACA que existe sólo durante la transición y
 * se disuelve. La oscuridad de la sección la sigue dando la luz: el sol al
 * mínimo (`lightArc.ts`, `NIVEL_DE_LA_NOCHE`).
 *
 * ── ⚠️ Y POR QUÉ EL RELEVO ES INVISIBLE, CON EL NÚMERO ────────────────────
 *
 * Porque las dos cosas que se relevan miden lo mismo. La capa pinta #0E0E0E,
 * o sea **gris 14**; la sala en la noche, con el modelo de luz de B8 en la pose
 * de Trabajos y el contraluz apagado, da **piso medio 11,2 y pared del fondo
 * 10,8** (`scripts-b8/modelo-de-luz.ts`, tabla B, nivel 0,04). Tres niveles de
 * gris de diferencia: cuando la gota se disuelve, lo que aparece detrás no es
 * otro fondo — son **las motas**, que es justamente lo que tiene que aparecer.
 */

/**
 * LA PLUMA DEL BORDE DE LA GOTA, en puntos porcentuales del radio.
 *
 * Es `REVELADO_FRACCION` de B3 —0,125, el mismo octavo del margen de
 * reanudación— leído como fracción del radio en vez de como fracción de la
 * ventana. `trabajos.invariant` §17 afirma la igualdad contra el módulo de B3,
 * con su control positivo.
 */
export const PLUMA_DE_LA_GOTA = 0.125

/**
 * CUÁNTO DURA LA DISOLUCIÓN, en fracción del recorrido del bloque de P7.
 *
 * **No es un número elegido: son los 240 px de `FUSION_DEL_CENSO`**, el umbral
 * con el que el censo de acontecimientos funde dos grupos, o sea la banda de
 * scroll más corta que se LEE como que algo pasó (`_contrato/asentamiento.ts`;
 * es el mismo número del que sale la meseta de los planos). Sobre el recorrido
 * del bloque —tres pantallas de la altura de calibración— da 240 / 3240.
 *
 * La derivación vive en `geometria.ts`, que es quien conoce las pantallas de la
 * sección; acá se declara qué significa.
 */

/**
 * LA VENTANA DE UNA GOTA, en fracción del progreso del bloque.
 *
 * `expansion` es donde el disco crece de nada a cubrir el cuadro; `disolucion`
 * es donde se apaga y deja ver lo que quedó detrás.
 */
export interface VentanaDeLaGota {
  readonly expansionHasta: number
  readonly disolucionHasta: number
}

/** Acota a [0, 1]. */
function acotar01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/**
 * EL RADIO DE LA GOTA, en puntos porcentuales de `farthest-corner`.
 *
 * `farthest-corner` es la esquina más lejana del centro, así que **100 % es
 * exactamente cubrir el cuadro entero** sin que haya que saber cuánto mide.
 * Arranca en `-PLUMA·100` para que en `t = 0` el gradiente sea transparente de
 * punta a punta —el borde emplumado todavía no entró al cuadro— y termina en
 * 100 para cubrirlo.
 */
export function radioDeLaGota(t: number): { readonly opaco: number; readonly borde: number } {
  const u = acotar01(t)
  const pluma = PLUMA_DE_LA_GOTA * 100
  const opaco = u * (100 + pluma) - pluma
  return { opaco: Math.round(opaco * 100) / 100, borde: Math.round((opaco + pluma) * 100) / 100 }
}

/**
 * LA MÁSCARA DE LA GOTA — un `radial-gradient` con el borde emplumado.
 *
 * `#000` = la capa se ve; `transparent` = no. Es la misma convención que
 * `maskDeRevelado` de B3, con `circle farthest-corner` en vez de `to bottom`.
 */
export function maskDeLaGota(t: number): string {
  const { opaco, borde } = radioDeLaGota(t)
  return `radial-gradient(circle farthest-corner at 50% 50%, #000 ${opaco}%, transparent ${borde}%)`
}

/**
 * EL ESTADO DE LA GOTA en un progreso del bloque, con su ventana.
 *
 * Devuelve la máscara y la opacidad. Fuera de la ventana devuelve `null`, y ahí
 * la capa NO se monta: cero costo, y ningún elemento pintando encima del
 * escenario cuando no hay transición que contar.
 */
export interface EstadoDeLaGota {
  readonly mask: string
  readonly opacidad: number
}

export function estadoDeLaGota(progreso: number, ventana: VentanaDeLaGota): EstadoDeLaGota | null {
  const { expansionHasta, disolucionHasta } = ventana
  if (!(expansionHasta > 0) || !(disolucionHasta > expansionHasta)) {
    throw new Error(`ventana de gota inválida: expansión ${expansionHasta}, disolución ${disolucionHasta}`)
  }
  if (progreso >= disolucionHasta) return null
  if (progreso <= expansionHasta) {
    return { mask: maskDeLaGota(progreso / expansionHasta), opacidad: 1 }
  }
  const u = (progreso - expansionHasta) / (disolucionHasta - expansionHasta)
  return { mask: maskDeLaGota(1), opacidad: Math.round((1 - acotar01(u)) * 1000) / 1000 }
}
