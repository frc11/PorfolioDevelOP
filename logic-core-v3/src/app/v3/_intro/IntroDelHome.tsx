import { HomeIntro } from '@/components/layout/HomeIntro'

/**
 * EL PRELOADER DEL HOME NUEVO — el punto de montaje, y nada más.
 *
 * ── Por qué este archivo es de cuatro líneas, y tiene que serlo ────────────
 *
 * El preloader está TERMINADO desde S8d y verificado desde hace catorce
 * sprints: trazo, letras, transformación de color, relevo 2D→3D escondido en la
 * inversión de la tinta, partículas que caen y el logo acomodándose en la
 * escena. Nunca se había montado en `/v3`. Este sprint lo MONTA — no lo
 * reescribe, no lo copia y no le cambia un valor.
 *
 * Todo lo que se ve lo pone `@/components/layout/HomeIntro`. Acá no hay una
 * fase, ni un color, ni un instante, ni un umbral: si alguno apareciera, habría
 * dos definiciones del mismo preloader y una de las dos se quedaría vieja.
 * `s8-intro.invariant.ts` lo custodia — afirma que este archivo importa **un
 * solo** módulo y que no nombra ninguna de las piezas internas del intro.
 *
 * ── Por qué el import es ESTÁTICO ─────────────────────────────────────────
 *
 * El overlay tiene que viajar **en el HTML del servidor**, siempre. Es la mitad
 * del mecanismo del gate pre-paint: el servidor no conoce `sessionStorage`, así
 * que manda el overlay en el HTML y el `<script>` del `<head>` decide, antes del
 * primer pintado, si se ve o no —una regla de `globals.css` lo esconde cuando el
 * `<html>` no lleva `data-home-intro`—. Con `dynamic(…, { ssr: false })` el
 * overlay no estaría en ese HTML y la primera visita vería un flash del hero
 * antes de que la capa apareciera, que es exactamente el defecto que el gate
 * existe para no tener. El porqué completo está en `contrato.ts`.
 *
 * Lo que un import estático NO arrastra es `three`: `IntroLogo3D` pide su canvas
 * con `dynamic(() => import('./IntroLogoCanvas'), { ssr: false })`.
 *
 * ── LO QUE CUESTA, medido sobre el build de la integración ────────────────
 *
 * ⚠️ **La razón que este bloque publicaba se venció adentro del mismo sprint, y
 * conviene que quede escrito por qué.** Decía que el chunk del overlay ya estaba
 * en la carga inicial de `/v3` sin que `/v3` montara nada, *«porque lo arrastra
 * `HomeIntroBoot`, que el layout raíz sí monta»*. Era cierto sobre el build de
 * la línea de base y **dejó de serlo el mismo día**: el frente del peso descubrió
 * que ese arrastre era un defecto —el layout pedía el gate al BARRIL del
 * preloader, que vive en el grupo de chunks de la página del home— y lo sacó.
 *
 * Medido sobre el build de la integración, la conclusión sobrevive con otra
 * causa: el chunk del overlay (`8409-*.js`, **28,0 KiB crudo · 8,7 KiB gzip**)
 * está en la carga inicial de `/v3` **porque `/v3` monta el intro**, y cuenta
 * como HEREDADO porque `/` monta el mismo componente y comparte el archivo. Es
 * la única diferencia de heredado entre `/v3` y las otras seis rutas de `/v3`
 * —1111,5 contra 1083,5 KiB— y está nombrada en `test:s7-compuerta` y en
 * `test:s2-bundle`. `motion/react` ya estaba en las dos cargas iniciales.
 *
 * O sea: **montar el intro en `/v3` cuesta 8,7 KiB gzip**, y son compartidos con
 * el home vivo. La cuenta y su ventana están en `s8-intro.invariant.ts` §6.
 *
 * ── Server Component a propósito ──────────────────────────────────────────
 *
 * No lleva `'use client'`: la frontera la marca `HomeIntro`, que sí lo lleva.
 * Poner una segunda frontera acá no agregaría nada y metería este archivo en el
 * bundle del cliente sin necesidad.
 */
export function IntroDelHome() {
  return <HomeIntro />
}
