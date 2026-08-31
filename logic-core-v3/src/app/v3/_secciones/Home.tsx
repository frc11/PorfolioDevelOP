import { REGISTRO } from './_contrato/registro'

/**
 * EL HOME — las ocho secciones, en el orden del recorrido.
 *
 * ── Esta función no decide NADA ───────────────────────────────────────────
 *
 * Ni el orden, ni la altura, ni la superficie, ni qué sección va. Recorre el
 * registro, que recorre `_lib/secciones.ts`. Es lo que hace que cambiar el
 * recorrido de superficies del sitio sea editar ocho valores en una tabla, y no
 * abrir una pantalla.
 *
 * **No lista las ocho a mano**, y no es prolijidad: una lista escrita a mano se
 * desincroniza de la tabla sin que nada se queje, y el modo de falla es que una
 * sección declarada deje de montarse. Recorriendo el registro, una sección
 * nueva en la tabla sin componente hace fallar la construcción con su nombre.
 *
 * ── Por qué está separado de `page.tsx` ───────────────────────────────────
 *
 * Porque el árbol de contenido tiene que poder pasarse como `children` a la
 * compuerta, que es un componente de cliente. Un archivo de ruta no puede ser
 * las dos cosas a la vez, y separar deja además el árbol montable desde un
 * instrumento sin arrastrar `metadata` ni el envoltorio de la ruta.
 *
 * ── Es un componente de SERVIDOR ──────────────────────────────────────────
 *
 * No lleva `'use client'`. Las ocho secciones sí lo son —consumen las
 * primitivas de la coreografía, que necesitan contexto— pero esta función sólo
 * las referencia, y referenciar un componente de cliente desde el servidor es
 * exactamente lo que el modelo espera.
 */
export function Home(): React.JSX.Element {
  return (
    <>
      {REGISTRO.map(({ id, Componente, seccion }) => (
        <Componente key={id} seccion={seccion} />
      ))}
    </>
  )
}
