import { Grilla, type ColumnasDeGrilla } from '../../_componentes/layout/Grilla'
import { Caption, Cuerpo, Micro } from '../../_componentes/tipografia/Textos'

import { Estado, Ficha } from './Ficha'

/**
 * LAS PRIMITIVAS DE LAYOUT — la parte del sistema que invierte lo esperado.
 *
 * ── Qué hay que poder ver acá ─────────────────────────────────────────────
 *
 * Que al angostar la ventana **el aire de los costados no cambia** —32px
 * fijos, los mismos a 375 que a 1920— mientras **las columnas sí se angostan**.
 * Es lo contrario del patrón habitual, y es lo que está medido: el padding
 * lateral es fijo en px con los mismos tres márgenes absolutos a 768 y a 1024,
 * y 151 de 177 grillas cambian de ancho de columna entre 1025 y 1920 mientras
 * las 177 conservan su canaleta.
 *
 * Y una tercera cosa, en el cruce de 1025: **la canaleta salta de 12 a 16px** y
 * **la grilla de cinco columnas aparece**. Abajo del umbral no existe: cero
 * apariciones a 768 y a 1024, cuarenta arriba.
 */

const COLUMNAS: readonly ColumnasDeGrilla[] = [2, 3, 4, 5, 'lateral']

export function GaleriaLayout() {
  return (
    <>
      <Ficha
        titulo="Envoltorio · a sangre, con padding lateral fijo"
        nota="max-width: 100% domina con 66,2% en los cuatro anchos medidos. No hay contenedor fijo en px: el único tope global es 1920, y es del contenido."
      >
        <Estado rotulo="el borde punteado es el límite del contenido">
          <div className="border-borde w-full border border-dashed p-[var(--spacing-2)]">
            <Cuerpo>
              Angostá la ventana: este aire lateral no se mueve. Son 32px fijos —
              <span className="font-codigo">--pad-lateral-compacto</span>— y siguen siendo 32 a 1920.
            </Cuerpo>
          </div>
        </Estado>
      </Ficha>

      <Ficha
        titulo="Grilla · columnas fluidas, canaletas fijas"
        nota="La canaleta conmuta en 1025 por la variante `escritorio:`, que Tailwind genera desde --breakpoint-escritorio. El número no se escribe en ningún lado."
      >
        {COLUMNAS.map((columnas) => (
          <Estado key={String(columnas)} rotulo={`columnas: ${String(columnas)}`}>
            <Grilla columnas={columnas} className="w-full">
              {celdasDe(columnas).map((celda) => (
                <div
                  key={celda}
                  className="border-borde bg-superficie-1 border p-[var(--spacing-2)]"
                >
                  <Micro className="font-codigo uppercase opacity-casi">{celda}</Micro>
                </div>
              ))}
            </Grilla>
          </Estado>
        ))}
        <Caption className="opacity-casi">
          `lateral` es la única con un ancho declarado: 140px, medido en 92 contenedores y
          corroborado por el rail de la referencia. Colapsa abajo de tablet, porque 140 fijos contra
          375 dejan la columna fluida en 155 y eso no es una grilla.
        </Caption>
      </Ficha>
    </>
  )
}

function celdasDe(columnas: ColumnasDeGrilla): readonly string[] {
  if (columnas === 'lateral') return ['140', 'fluida']
  return Array.from({ length: columnas }, (_, i) => `col ${i + 1}`)
}
