'use client'

import { Titular, idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { seccionDe } from '../_contrato/forma'
import { ContenidoDeSeccion, EncabezadoDeSeccion } from '../_contrato/Seccion'
import { TITULAR } from './contenido'

/**
 * LA CABECERA DE SERVICIOS — el encabezado que NOMBRA a la sección.
 *
 * ── El defecto 16 de SITIO-S10, y por qué era uno ─────────────────────────
 *
 * Servicios era **la única de las ocho sin un encabezado propio**. Sus tres
 * servicios entraban al documento como `h2` HERMANOS de los titulares de las
 * otras siete, así que quien navega por encabezados leía tres secciones donde
 * hay una, y ninguna de las tres se llamaba «Servicios». `s10-acceso` §4 lo
 * publicó como el hallazgo 4 y su árbol impreso es la especificación.
 *
 * El arreglo es el árbol que ya usan las otras siete y no uno nuevo:
 *
 *     h2   el titular de la sección          ← lo que faltaba
 *       h3   Desarrollo web                  ← eran `h2`
 *       h3   IA y automatización
 *       h3   Software a medida
 *
 * Sin saltos de nivel y con el único `h1` del documento —el del Hero— arriba de
 * todo, que es lo que ese mismo instrumento afirma sección por sección.
 *
 * ── Por qué el titular va en `titulo-l` y los servicios se quedan en `titulo-xl` ──
 *
 * Porque el nivel del encabezado y el tamaño de la letra son cosas distintas, y
 * `<Titular>` las separa a propósito. Bajar los nombres de servicio a un cuerpo
 * más chico habría sido cambiar una composición calibrada a ojo para arreglar un
 * defecto de ÁRBOL, que no es lo que este sprint hace. Y el precedente ya está
 * en el sitio: **Números** tiene su `h2` en `titulo-l` y sus cifras en
 * `titulo-xl` — el titular nombra, el display muestra. Acá pasa lo mismo.
 *
 * ── Por qué es ESTÁTICA, y va declarado ───────────────────────────────────
 *
 * No cuelga de ningún canal. Podría hacerlo, pero el único progreso que le
 * llega a esta altura es el LOCAL del tramo activo, y con él la cabecera se
 * re-animaría tres veces mientras la sección está clavada — una vez por
 * servicio— que es exactamente lo contrario de lo que hace: quedarse quieta
 * nombrando la sección mientras los tres pasan por abajo. Colgarla del progreso
 * del pin pediría un SEGUNDO `Bloque`, y la sección afirma tener uno solo
 * (`s6-servicios` §7): un segundo motor de progreso es un cambio de mecanismo,
 * no un ajuste.
 *
 * ── Y por qué está en las DOS ramas ───────────────────────────────────────
 *
 * Porque las dos tienen que decir lo mismo. La pinneada la pone adentro del
 * panel clavado —así acompaña a los tres servicios durante los 200svh del
 * pin— y la apilada la pone arriba de los tres bloques, que es donde va cuando
 * no hay nada clavado. `s7-arboles` compara el vocabulario de las dos ramas y
 * no perdona una palabra de diferencia.
 */

/** La entrada del recorrido. El nombre y el número salen de acá, no del copy. */
const SECCION = seccionDe('servicios')

/**
 * EL ANCLA DEL TITULAR — para que la `<section>` pueda NOMBRARSE con él.
 *
 * ── Por qué un `id` y no nada ─────────────────────────────────────────────
 *
 * El defecto 10 de `s10-acceso` es que ninguna de las ocho `<section>` apunta
 * con `aria-labelledby` a su titular, así que el documento publica 2 landmarks
 * donde podría publicar 10. Ese cableado NO se hace acá —es del envoltorio, que
 * es de otro dueño— pero el destino del `aria-labelledby` tiene que existir en
 * ESTE marcado, y un `aria-labelledby` que apunta a un `id` que no existe deja a
 * la región SIN nombre: peor que no ponerlo. Así que la cabecera deja el ancla
 * puesta y el envoltorio la usa cuando le toque.
 *
 * ── Y por qué se DERIVA de la entrada del recorrido ───────────────────────
 *
 * Porque el `id` de la `<section>` ya sale de ahí —`Panel` emite
 * `id={seccion.id}`, o sea `servicios`— y el del titular tiene que ser otro y
 * predecible: `titular-` + el mismo identificador. Escrito a mano serían dos
 * cadenas capaces de desviarse solas; derivado, quien cablee el envoltorio puede
 * componer la misma sin importar esta constante, y quien prefiera importarla la
 * tiene exportada.
 *
 * ⚠ **SITIO-S11 — la fórmula dejó de estar escrita dos veces.** El envoltorio
 * ya está cableado (`_componentes/Panel.tsx` emite el `aria-labelledby` de las
 * ocho), y la componía con la MISMA plantilla que esta línea: dos copias de una
 * cadena que tienen que coincidir exactamente o la región se queda sin nombre en
 * silencio. Ahora las dos puntas llaman a `idDelTitularDeSeccion`, que es la
 * única fórmula; esta constante sigue exportada porque la cabecera es la que la
 * consume acá y porque la pieza se lee sola.
 */
export const ID_DEL_TITULAR = idDelTitularDeSeccion(SECCION.id)

export function CabeceraDeServicios(): React.JSX.Element {
  return (
    <ContenidoDeSeccion claseDeContenido="flex w-full flex-col gap-[var(--spacing-4)]">
      <EncabezadoDeSeccion seccion={SECCION} nombre={SECCION.nombre} />
      <Titular nivel="titulo-l" como="h2" id={ID_DEL_TITULAR}>
        {TITULAR}
      </Titular>
    </ContenidoDeSeccion>
  )
}
