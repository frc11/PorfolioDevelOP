'use client'

import dynamic from 'next/dynamic'

import { CONSULTA_ESCENARIO } from '../_lib/compuerta'
import { calidadPorAncho } from '../_lib/escena/calidad'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'

/**
 * LA ESCENA — se monta en TODO ancho, y el umbral decide con cuánto
 * presupuesto.
 *
 * ── ⚠️ ESTE ARCHIVO CAMBIÓ DE TRABAJO, Y HAY QUE DECIR CUÁL ERA ────────────
 *
 * Hasta este sprint era **la compuerta de 1025**: abajo del umbral devolvía
 * `null`, el `import()` no corría y el navegador no pedía el chunk. Esa frase
 * —*"no es una clase de CSS que esconde: el bundle no se importa"*— fue la
 * decisión de S1 y se cumplió durante todo el rediseño.
 *
 * **La decisión del dueño la dio vuelta, y es una sola línea: escena de fondo en
 * todos los anchos, animaciones de texto sólo arriba de 1025.** Es lo que hace
 * la referencia — manda el mundo a 390 y no manda la coreografía.
 *
 * Así que la compuerta se partió en dos, y este archivo se quedó con la mitad
 * que dejó de ser compuerta:
 *
 *   · **la escena** — acá. Se monta siempre. No hay `return null`.
 *   · **la coreografía** — sigue en 1025 y no se movió un píxel:
 *     `_secciones/CompuertaDelHome.tsx` (las ocho secciones),
 *     `_componentes/chrome/CursorCompuerta.tsx` (el cursor) y
 *     `_componentes/CompuertaDelScrollSuave.tsx` (Lenis). Las tres siguen
 *     leyendo `ESCENARIO_MIN_ANCHO_PX`, importado y no reescrito.
 *
 * ── Qué quedó del mecanismo viejo, y por qué no se escribió uno nuevo ──────
 *
 * **Todo salvo el `return null`.** El hook es el mismo (`useAnchoMinimo`), la
 * consulta es la misma (`CONSULTA_ESCENARIO`, el mismo 1025) y el `import()`
 * diferido es el mismo. Lo único que cambió es **qué se hace con la respuesta**:
 * antes decidía si montar, ahora elige el nivel. La decisión en sí vive afuera,
 * en `_lib/escena/calidad.ts`, como función pura y sin un solo import — que es
 * lo que la hace afirmable sin montar React, igual que
 * `deberiaCorrerElScrollSuave` y `deberiaMontarseElCursor`.
 *
 * ── Por qué `ssr: false` sigue sin ser opcional ────────────────────────────
 *
 * Cambió el motivo de la mitad, y la otra mitad queda igual. Ya NO es que "el
 * servidor no puede decidir el ancho" —el montaje no depende del ancho—, pero
 * sigue siendo que **un `<canvas>` con contexto WebGL no se puede renderizar en
 * el servidor**, y sobre todo que con `ssr: false` webpack emite el módulo en un
 * chunk asíncrono aparte. Con un import estático la escena entera —`three`,
 * `@react-three/fiber` y los cuarenta módulos de la sala— viajaría en la **carga
 * inicial** de `/v3`, que es una cosa distinta de descargarse: la carga inicial
 * bloquea el primer pintado.
 *
 * Eso último no es una afirmación de confianza: la ruta gemela
 * `/v3/control-estatico` hace exactamente el import estático, y
 * `bundle.invariant.ts` comprueba que ahí la marca SÍ aparece en la carga
 * inicial. Es el control positivo, y sigue vigente palabra por palabra.
 *
 * ── Por qué no hay salto de layout, y por qué no hay mismatch ──────────────
 *
 * Las dos razones se conservan intactas y ninguna dependía del umbral. El
 * escenario está `fixed inset-0` (`CLASES_FUERA_DE_FLUJO`), o sea que **no
 * ocupa espacio en el flujo del documento**: montarlo no puede mover un panel. Y
 * `ssr: false` significa que el servidor no emite nada y que el primer render de
 * cliente tampoco, así que el HTML servido y la hidratación siguen siendo
 * idénticos.
 *
 * ── ⚠️ EL `key`, Y POR QUÉ NO ES UN DETALLE ────────────────────────────────
 *
 * Tres de los cinco campos del nivel se consumen **en la construcción** y no se
 * pueden cambiar después: `gl.antialias` es un atributo del contexto de WebGL,
 * y `motas` siembra el store en un `useState` con inicializador perezoso. Sin el
 * `key`, cruzar 1025 redimensionando cambiaría el `dpr` y dejaría los otros tres
 * con el valor del nivel anterior — o sea un cuarto nivel que nadie declaró.
 *
 * Con el `key`, cruzar el umbral **rehace la escena**, que es exactamente lo que
 * pasaba antes de este sprint (antes la desmontaba de un lado y la montaba del
 * otro). El comportamiento observable en el cruce no cambió; lo que cambió es
 * que del lado angosto ahora hay escena.
 */
const EscenaDelHome = dynamic(() => import('../_lib/escena/EscenaDelHome'), { ssr: false })

export function EscenarioCompuerta() {
  const arribaDelUmbral = useAnchoMinimo(CONSULTA_ESCENARIO)
  const calidad = calidadPorAncho(arribaDelUmbral)

  return <EscenaDelHome key={calidad} calidad={calidad} />
}
