'use client'

import { useEffect } from 'react'

import type { PrimitivasDeCoreografia } from './_contrato/coreografia'
import { PRIMITIVAS_ANIMADAS } from './_contrato/coreografia-animada'

/**
 * EL MÓDULO QUE VIAJA APARTE — lo único que la compuerta pide con `import()`.
 *
 * ── Por qué instala en vez de envolver ────────────────────────────────────
 *
 * La forma evidente era que este módulo exportara el proveedor y envolviera a
 * los hijos:
 *
 *     {arribaDelUmbral ? <ConCoreografia>{hijos}</ConCoreografia> : hijos}
 *
 * y es exactamente la que no sirve. `dynamic(..., { ssr: false })` renderiza su
 * fallback —`null`— hasta que el chunk llega, así que en ese intervalo **el
 * home entero desaparece**. Con el escenario de S1 eso no se nota porque es
 * ornamento y su fallback es un canvas que todavía no está; con las ocho
 * secciones es la página en blanco.
 *
 * Así que el árbol de contenido no cuelga de este módulo: cuelga del proveedor,
 * que es estático, y este módulo sólo le AVISA cuáles son las primitivas
 * cuando termina de cargar. Mientras tanto se ve el árbol quieto, que es
 * contenido completo y legible. El único efecto observable de la carga es que
 * la coreografía empieza un cuadro después, en vez de que no haya nada.
 *
 * ── El mecanismo de import es el de S1, sin inventar otro ─────────────────
 *
 * `dynamic(() => import(...), { ssr: false })` en `CompuertaDelHome.tsx`, igual
 * que `EscenarioCompuerta` y `CompuertaDeMotion`. `ssr: false` no es opcional y
 * por las dos razones de siempre: el ancho no existe en el servidor, y es lo
 * que hace que webpack emita el módulo en un chunk asíncrono aparte. Con un
 * import estático la coreografía entera viajaría en la carga inicial en TODOS
 * los anchos y la compuerta sería decorativa.
 *
 * ── Por qué renderiza `null` y no algo ────────────────────────────────────
 *
 * Porque no tiene nada que mostrar: lo que se ve ya está montado. Es un efecto,
 * no una vista.
 */
export default function InstaladorDeCoreografia({
  alInstalar,
}: {
  readonly alInstalar: (primitivas: PrimitivasDeCoreografia) => void
}): null {
  useEffect(() => {
    alInstalar(PRIMITIVAS_ANIMADAS)
  }, [alInstalar])

  return null
}
