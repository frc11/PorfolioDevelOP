import type * as THREE from 'three'

import { NIVEL_DE_LA_NOCHE } from './lightArc'
import { RIM_NIGHT_LEVEL } from './probeLighting'

/**
 * B13 · EL LOGO EMITE — cuánta luz sale de la pieza en cada punto del arco.
 *
 * ── El diagnóstico, en una línea ──────────────────────────────────────────
 *
 * **El objeto de la referencia emite y el nuestro absorbe.** El nuestro es
 * `INK_COLOR` (#0F0F0F, albedo lineal 0,0046) y por eso no puede hacer dos
 * cosas: no deja que el texto le pase por encima —los dos son el mismo negro,
 * 1,00:1 medido— y **no aporta nada al cuadro cuando la sala se apaga**.
 *
 * ── ⚠ Por qué NO alcanza con aclarar la tinta, y es el argumento que decide ─
 *
 * Con la sala en la noche de Trabajos (`NIVEL_DE_LA_NOCHE` = 0,04) la
 * irradiancia que llega a cualquier superficie es la misma para el logo y para
 * el papel: **el albedo más alto posible (blanco puro) deja al logo en el mismo
 * valor que la losa**, o sea invisible sobre su propio fondo. Un objeto no
 * puede ser más claro que la luz que recibe. La única forma de que la pieza sea
 * MÁS clara que la sala que la rodea es que emita: radiancia que sale del
 * fragmento y no depende de ninguna luz.
 *
 * ── ⚠ Y la trampa, que es la razón de que esto sea una CURVA y no un valor ─
 *
 * **Sobre papel claro un objeto que emite desaparece.** La sala del hero está a
 * nivel 1: el papel sale en ~248 de 255 y no queda techo — un logo que emitiera
 * blanco ahí se fundiría con el fondo. La emisión, entonces, **no puede ser
 * constante: tiene que depender del nivel de luz de la escena**, apagándose
 * cuando la sala está encendida y encendiéndose cuando la sala se apaga.
 *
 * ── Las dos puntas no se eligen: ya estaban declaradas ────────────────────
 *
 * Son las mismas dos que ya usan el contraluz (`rimIntensityAt`) y el brillo de
 * las motas (`brilloDeLaNocheEn`): `RIM_NIGHT_LEVEL` (0,34) es el nivel en el
 * que este proyecto declara que **empieza la noche**, y `NIVEL_DE_LA_NOCHE`
 * (0,04) es su fondo. Arriba de 0,34 la emisión es **exactamente cero**, así
 * que todo lo que S6–S12, B8 y B11 midieron con luz queda intacto —el hero,
 * Quiénes somos, Números y el diferencial no se mueven un byte de valor— y el
 * único régimen nuevo es el que la noche abrió.
 *
 * ── Cero color ────────────────────────────────────────────────────────────
 *
 * Un logo que emite emite **blanco**: los tres canales llevan el mismo número.
 * Lo que cambia es cuánto, nunca de qué color.
 *
 * `s22-emision.invariant.ts` afirma la curva, las dos fronteras, el valor en
 * pantalla que produce y el cableado.
 */

/**
 * LA EMISIVA, EN LUZ LINEAL, CON LA SALA EN SU NOCHE MÁS PROFUNDA.
 *
 * ⚠️ **No es un byte de pantalla: es la entrada del operador.** El fragmento del
 * logo entrega esta radiancia a `NeutralToneMapping`, que la devuelve como gris
 * de pantalla; el toe aplasta por debajo de 0,08 y el codo comprime por encima
 * de 0,76, así que el valor no se lee directo. Con 0,16 el logo sale en **97,2
 * de 255** sobre una sala de **19,9**.
 *
 * ── ⚠️ EL VALOR NO SE ELIGIÓ: LO ACOTAN DOS MEDICIONES, UNA POR PUNTA ─────
 *
 * `scripts-b13/b-referencia.ts` midió nk.studio a 1920 en 44 paradas: su objeto
 * aparece en 21, es **más claro que su sala en 20 de esas 21**, y el contraste
 * de su barra contra su sala va de **1,92:1 a 7,90:1 con mediana 2,9:1**. Con
 * 0,16 el nuestro da **2,97:1** — la mediana de la referencia— y es el valor del
 * barrido que más se le acerca.
 *
 * ── Y la restricción que lo acota por arriba, que es de Trabajos ──────────
 *
 * Trabajos es la única sección INVERTIDA que deja ver la sala: escribe con tinta
 * CLARA (`#F7F7F5`). Sobre un logo que emite, esa tinta pierde contraste — al
 * revés que la oscura—. `scripts-b13/e-noche.ts` barre 0,05 → 0,30 y el rango en
 * el que se cumplen **las dos** cosas —la banda de la referencia y AA (4,5:1)
 * para la tinta clara— es **0,10 a 0,20**. Con 0,16 la tinta clara encima da
 * **5,77:1**. Por encima de 0,21 se cae de AA; por debajo de 0,10 el logo no
 * llega ni al piso de la referencia.
 */
export const EMISION_EN_LA_NOCHE = 0.16

/**
 * Cuánta emisiva le toca al logo según el nivel del arco: **0 con luz** (nivel
 * ≥ `RIM_NIGHT_LEVEL`), `EMISION_EN_LA_NOCHE` en la noche
 * (nivel ≤ `NIVEL_DE_LA_NOCHE`), y una S suave entre medio para que el
 * atardecer no lo encienda de golpe.
 *
 * Es la MISMA rampa que `brilloDeLaNocheEn` usa para las motas, con las mismas
 * dos constantes importadas: el logo y el polvo se encienden juntos, que es lo
 * que hace que la noche se lea como un solo hecho y no como dos efectos.
 */
export function emisionDelLogoEn(level: number): number {
  const t = (RIM_NIGHT_LEVEL - level) / (RIM_NIGHT_LEVEL - NIVEL_DE_LA_NOCHE)
  const u = Math.max(0, Math.min(1, t))
  return u * u * (3 - 2 * u) * EMISION_EN_LA_NOCHE
}

/**
 * Escribe la emisiva en el material del logo. La llama `OrbitRig` en el MISMO
 * cuadro en el que alimenta a `applyLightRig` y al brillo de las motas, con el
 * nivel del arco que ya tiene muestreado: la luz de la sala, el brillo del
 * polvo y la emisión de la pieza no se pueden desincronizar porque salen del
 * mismo número en el mismo frame.
 *
 * `setScalar` y no `set('#…')`: el espacio de trabajo de three es lineal, así
 * que un escalar entra tal cual y `refreshMaterialUniforms` lo sube al uniform
 * `emissive` sin conversión. Es la misma puerta que usa el logo del preloader
 * (`IntroLogoCanvas.tsx`, `material.emissive.setRGB(...)`), y por eso los dos
 * hablan el mismo idioma aunque sean objetos distintos.
 */
export function escribirEmisionDelLogo(
  material: THREE.MeshStandardMaterial | null,
  level: number,
): void {
  if (material === null) return
  material.emissive.setScalar(emisionDelLogoEn(level))
}
