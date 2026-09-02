/**
 * EL MARCADO DE LA PÁGINA — las cuatro formas en las que este banco renderiza
 * el home, y una sola caché.
 *
 * Sale de `s10-banco.ts` en SITIO-S12, cuando el patch del esqueleto (§7.43) lo
 * cruzó las 300 líneas. **La costura es real y no de conveniencia:** este
 * archivo sabe renderizar la PÁGINA —el chrome y las ocho, en el orden de
 * `page.tsx`— y no sabe nada del layout; `s10-banco.ts` sabe qué esqueleto pone
 * el layout alrededor y no sabe renderizar. Cambiar una rama no toca el
 * esqueleto, y arreglar el esqueleto no toca una rama.
 *
 * El banco sigue siendo **UNA puerta**: `s10-banco.ts` re-exporta todo esto, y
 * ningún frente tiene que saber en qué archivo quedó cada cosa.
 */

import { createElement, Fragment } from 'react'

import { ChromeDelHome } from '../../_chrome/ChromeDelHome'
import { REGISTRO } from '../../_secciones/_contrato/registro'
import { Home } from '../../_secciones/Home'
import { marcar } from '../../_secciones/_invariantes/render'
import { type Rama } from './s10-referencias'

/**
 * EL ÁRBOL DE LA PÁGINA, en el orden de `page.tsx`.
 *
 * ⚠ **Desde SITIO-S12 la página trae su propio ESQUELETO, y por eso el `<main>`
 * está acá y no en el envoltorio derivado del layout.** El corte de §7.43 —el
 * pie afuera del `<main>`, la pastilla afuera del `<main>`— sólo se puede montar
 * desde la página, porque `CompuertaDelHome` tiene que envolver al `<main>` Y al
 * pie o las columnas dejan de animarse. El porqué completo está en
 * `v3/layout.tsx`.
 *
 * El `<main>` se escribe con las clases con las que `page.tsx` lo emite. No es
 * una segunda fuente de la estructura —el esqueleto del LAYOUT se sigue
 * derivando— sino el mismo espejo de `page.tsx` que este helper siempre fue, con
 * una pieza más.
 */
const HOME = (): React.JSX.Element =>
  createElement(
    Fragment,
    null,
    createElement(ChromeDelHome),
    createElement('main', { className: 'relative z-10' }, createElement(Home)),
  )

/** La caché del banco: el mismo árbol no se renderiza dos veces. */
const cache = new Map<string, string>()

export function conCache(clave: string, producir: () => string): string {
  const guardado = cache.get(clave)
  if (guardado !== undefined) return guardado
  const producido = producir()
  cache.set(clave, producido)
  return producido
}

/**
 * EL HOME ENTERO en una rama: el chrome y las ocho, en el orden de `page.tsx`.
 *
 * ⚠ **Sin el overlay del intro, y NO por una decisión de alcance: no se puede.**
 * `HomeIntro` consume `usePreloader`, que tira fuera de `PreloaderProvider`
 * —un contexto del sitio vivo, que este sprint tiene prohibido tocar—, así que
 * `renderToStaticMarkup` corta con *«usePreloader must be used within a
 * PreloaderProvider»*. Queda declarado como hueco (`HUECO_DEL_INTRO`) en vez de
 * omitido en silencio: lo que el overlay le agregue al orden de tabulación de la
 * primera visita **este sprint no lo mide**.
 */
export function marcadoDelHome(rama: Rama): string {
  return conCache(`home:${rama}`, () => marcar(HOME(), { anima: rama === 'animada' }))
}

/** Una sección sola, en una rama. Mismo componente que monta el home. */
export function marcadoDeSeccion(id: string, rama: Rama): string {
  return conCache(`seccion:${id}:${rama}`, () => {
    const entrada = REGISTRO.find((m) => m.id === id)
    if (entrada === undefined) throw new Error(`sección desconocida en el banco: ${id}`)
    return marcar(createElement(entrada.Componente, { seccion: entrada.seccion }), {
      anima: rama === 'animada',
    })
  })
}

/**
 * EL MARCADO QUE SE SIRVE CON `prefers-reduced-motion` PUESTA.
 *
 * ⚠ **ESTE HELPER ESTABA MAL Y LO ENCONTRÓ EL FRENTE DE ACCESIBILIDAD EN
 * SITIO-S10.** Forzaba `anima: true` con `MotionConfig reducedMotion="always"`,
 * y con eso devolvía **52 transformadas y 52 `will-change`**: un estado que
 * producción NUNCA sirve. La compuerta que apaga el movimiento no vive en
 * `MotionConfig` sino en `CompuertaDelHome`, que el banco no monta —
 * `deberiaAnimar(arribaDelUmbral, !politica.montaElMotorDeProgreso)` da `false`
 * con la preferencia puesta, en cualquier ancho, y ahí las primitivas animadas
 * ni siquiera se instalan.
 *
 * **Lo que producción sirve es el ÁRBOL QUIETO**, y eso es lo que devuelve esto
 * ahora. La preferencia se sigue forzando en el motor porque no cuesta nada y
 * cierra la otra mitad: si alguna primitiva quieta escribiera una transformada
 * por su cuenta, con la preferencia puesta tendría que dejar de hacerlo igual.
 *
 * Un helper que modela un estado que nadie sirve no es conservador: **es una
 * respuesta a otra pregunta**, y se lee igual de bien.
 */
export function marcadoConMovimientoReducido(): string {
  return conCache('home:reducido', () => marcar(HOME(), { anima: false, preferencia: 'always' }))
}

/**
 * EL CONTROL, y no se sirve nunca: el árbol animado CON la preferencia puesta.
 *
 * No existe en producción —la compuerta lo impide— y por eso está separado y
 * dicho. Sirve para una sola cosa: demostrar que un detector de transformadas
 * **no está ciego**. Un «cero transformadas» sobre el árbol quieto no prueba
 * nada si el detector tampoco las ve donde sí están.
 */
export function marcadoAnimadoConPreferenciaForzada(): string {
  return conCache('home:animado-con-preferencia', () =>
    marcar(HOME(), { anima: true, preferencia: 'always' }),
  )
}
