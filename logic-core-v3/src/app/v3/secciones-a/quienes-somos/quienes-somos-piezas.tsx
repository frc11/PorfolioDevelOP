/**
 * PIEZAS DEL INVARIANTE — 02 · Quiénes somos.
 *
 * Módulo auxiliar de `quienes-somos.invariant.tsx`: acá viven los renders, los
 * ayudantes de conteo y las tablas que consumen las afirmaciones; allá viven
 * las afirmaciones. No es un instrumento y no corre solo — no tiene script.
 *
 * ── Qué se renderiza, y por qué cada mitad necesita a la otra ──────────────
 *
 * La sección se renderiza DE VERDAD, dos veces, en el mismo proceso y sin
 * navegador: una en su rama quieta (`modo="nunca"`, que es lo que ocurre abajo
 * de 1025 y con `prefers-reduced-motion`) y otra con la coreografía forzada
 * (`modo="siempre"`). Todas las afirmaciones son sobre el MARCADO que sale, no
 * sobre la intención del componente.
 *
 * Las dos ramas están porque cada una sola miente:
 *
 *   · "abajo de 1025 no se escribe ninguna transformada" pasa en verde si el
 *     sistema no anima NUNCA. El control es la rama con coreografía, donde la
 *     transformada tiene que estar;
 *   · "el contenido llega completo a la pantalla" pasa en verde si el marcado
 *     está vacío. El control es contar los textos y exigir que sean más de
 *     cero, y comparar la cuenta contra el objeto de contenido.
 *
 * ⚠ En un render de servidor no corren los efectos, así que **P1 sale en su
 * fase de medición**: texto plano, sin transformada. Por eso el control
 * positivo de "se escribe una transformada" lo dan los cinco bloques P2, que sí
 * la escriben en el primer cuadro. P1 se comprueba por otro lado: el atributo
 * del divisor, que sí cambia entre las dos ramas.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { MotionConfig } from 'motion/react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ProveedorDeCoreografia, type ModoDeCoreografia } from '../_contrato/coreografia'
import { marcadoresPedidos, textosDe } from '../_contrato/marcadores'
import { MarcoDeMedio } from '../_contrato/medios'
import { seccionDeA } from '../_contrato/forma'

import { CONTENIDO } from './contenido'
import { GEOMETRIA, QuienesSomos, SIZES_DE_LA_FOTO } from './QuienesSomos'

export const seccion = seccionDeA('quienes-somos')

function marcar(modo: ModoDeCoreografia, preferencia: 'always' | 'never'): string {
  return renderToStaticMarkup(
    <MotionConfig reducedMotion={preferencia}>
      <ProveedorDeCoreografia modo={modo}>
        <QuienesSomos seccion={seccion} />
      </ProveedorDeCoreografia>
    </MotionConfig>,
  )
}

/** La rama de abajo de 1025 — y la misma que produce la preferencia de S2. */
export const quieto = marcar('nunca', 'never')
/** El control positivo: la coreografía forzada, sin la preferencia. */
export const conMotion = marcar('siempre', 'never')
/** Y la preferencia mandando sobre el modo forzado: la política de S2 es total. */
export const conPreferencia = marcar('siempre', 'always')

export const veces = (html: string, aguja: string): number => html.split(aguja).length - 1
export const TEXTOS = textosDe(CONTENIDO)
export const FUENTE = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'QuienesSomos.tsx'),
  'utf8',
)

/** Los marcadores que el contenido pide, y el chequeo de que TODOS se ven. */
export const PEDIDOS = marcadoresPedidos(CONTENIDO)
export const todosSeVen = (html: string): boolean => PEDIDOS.every((m) => html.includes(m))

/** Lo verdadero declarado por el sprint: tiene que estar escrito, literal. */
export const LITERALES = ['Franco', 'Valentino', 'Tucumán']

/**
 * El `sizes` sobre el marcado, no sobre la intención. Con `fuente={null}` la
 * etiqueta `<img>` todavía no existe, así que se renderiza EL MISMO marco con
 * los MISMOS valores y una fuente de prueba: es exactamente lo que va a salir
 * el día que Franco traiga la foto, y demuestra que el `sizes` escrito hoy
 * produce descriptores de ANCHO y no de densidad — el defecto medido en las
 * 134 imágenes de la referencia.
 */
export const conFoto = renderToStaticMarkup(
  <MarcoDeMedio
    marcador={CONTENIDO.equipo.marcador}
    fuente="/prueba-de-invariante.jpg"
    alt={CONTENIDO.equipo.alt}
    ancho={GEOMETRIA.foto.ancho}
    alto={GEOMETRIA.foto.alto}
    sizes={SIZES_DE_LA_FOTO}
  />,
)
