import { cn } from '@/lib/utils'

import {
  CLASE_INTERLETRADO,
  CLASE_INTERLINEADO,
  CLASE_PESO,
  NIVELES_TIPOGRAFICOS,
  type Interletrado,
  type Peso,
} from '../../_lib/tipografia'

/**
 * LOS CUATRO NIVELES DE TITULAR — 20 · 32 · 44 · 56 px.
 *
 * ── El nivel y la etiqueta son cosas distintas ────────────────────────────
 *
 * `nivel` es el tamaño; `como` es el elemento HTML. Se separan a propósito: la
 * jerarquía visual y la jerarquía del documento no tienen por qué coincidir, y
 * cuando se las fuerza a coincidir se termina eligiendo un `h3` porque el `h2`
 * era muy grande. Eso rompe el árbol de encabezados para quien navega por
 * encabezados, que es exactamente para quien existe el árbol.
 *
 * ── Fijo o fluido ─────────────────────────────────────────────────────────
 *
 * Los cuatro niveles tienen contraparte fluida en `clamp()`, con banda de
 * 375 a 1440px. Ninguno de los dos extremos es un breakpoint: el techo salió
 * de la convergencia de seis ajustes independientes en 1440,00 ± 0,01 y el
 * piso de un barrido donde 375 es 207 veces más nítido que el vecino. El
 * `clamp()` deja de interpolar ahí adentro, no en una media query.
 *
 * El defecto es **fluido**: 53,9% de las cadenas medidas lo son, y es el
 * régimen de los niveles de display.
 *
 * ── Por qué los defaults de interlineado e interletrado no son estéticos ──
 *
 * Salen de la columna "tokens que consume" del inventario de los 27
 * componentes compartidos. `titulo-xl` con `tracking.titulo` es lo que mide el
 * título de cierre del pie; `titulo-s` con `tracking.texto` es lo que mide el
 * link de contacto. Se pueden pisar por prop —`/v3/tipografia` los recorre
 * todos— pero el default es la medición.
 */

/* ── EL NOMBRE ACCESIBLE DE UNA SECCIÓN (SITIO-S11, defecto 10) ─────────────
 *
 * `s10-acceso` §5 midió el home entero y encontró que **el documento tiene DOS
 * landmarks —`main` y `navigation`— donde podría tener DIEZ**: una `<section>`
 * sin nombre accesible NO aporta una `region` (así lo dice HTML-AAM y así lo
 * modela `s10-lectura.ts`, que las descartaba una por una con la razón escrita
 * al lado: *«no tiene nombre accesible, así que no aporta landmark»*). Navegar
 * por regiones no servía para recorrer el home: se llegaba al `main` y ahí se
 * terminaba la lista.
 *
 * ── Por qué `aria-labelledby` y no `aria-label` ────────────────────────────
 *
 * Porque el nombre de la región tiene que ser **el mismo texto que se lee en
 * pantalla**, y ese texto ya existe: es el titular de la sección. Con
 * `aria-label` habría una segunda copia del nombre —la de la tabla— que se
 * puede desviar del titular sin que nada se queje, y encima el Hero no tiene
 * rótulo visible (`Hero.tsx` declara con todas las letras que «Hero es el
 * nombre del bloque en el recorrido, no una palabra que el visitante lea»), así
 * que un `aria-label` ahí anunciaría una palabra que no está en ningún lado.
 *
 * ── El id se DERIVA de la tabla, no se escribe ocho veces ──────────────────
 *
 * `idDelTitularDeSeccion` es la única fórmula, y la usan las dos puntas: acá,
 * que la CONSUME en el `aria-labelledby`, y cada sección, que la EMITE en su
 * encabezado. Ninguna de las dos escribe la cadena. Si un día el id cambia de
 * forma, cambia en una línea y las dos puntas se mueven juntas — que es la
 * misma razón por la que `ATRIBUTO_DE_SECCION` vive en el contrato y no en cada
 * instrumento.
 *
 * ⚠ **La punta que emite el id NO está de este lado, y por eso hay una regla:
 * un `aria-labelledby` que apunta a un id inexistente deja la sección SIN
 * nombre** —y por lo tanto sin `region`— **sin un solo error en consola**, que
 * es la peor forma de fallar. `s10-acceso` §5 es el que lo ve: cuenta las ocho
 * regiones sobre el marcado del documento, así que una sección cuyo encabezado
 * se olvide del id se cae de la lista y se nota.
 * ────────────────────────────────────────────────────────────────────────── */
export function idDelTitularDeSeccion(id: string): string {
  return `titular-${id}`
}

export type NivelDeTitular = 'titulo-s' | 'titulo-m' | 'titulo-l' | 'titulo-xl'
type EtiquetaDeTitular = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'

export interface TitularProps {
  readonly children: React.ReactNode
  readonly nivel: NivelDeTitular
  /** El elemento del documento. Sin default: elegirlo es una decisión. */
  readonly como: EtiquetaDeTitular
  /** `false` fija el tamaño en el valor de arriba de 1440px. */
  readonly fluido?: boolean
  readonly interletrado?: Interletrado
  readonly peso?: Peso
  readonly className?: string
  readonly id?: string
}

export function Titular({
  children,
  nivel,
  como: Etiqueta,
  fluido = true,
  interletrado,
  peso = 'normal',
  className,
  id,
}: TitularProps) {
  const definicion = NIVELES_TIPOGRAFICOS[nivel]
  // `claseFluida` es `null` sólo en `cuerpo` y `base`, que no son titulares;
  // el `??` es la red por si alguien agrega un nivel sin contraparte fluida.
  const claseDeTamano = fluido ? (definicion.claseFluida ?? definicion.claseFija) : definicion.claseFija

  return (
    <Etiqueta
      id={id}
      data-pieza="titular"
      data-nivel={nivel}
      data-fluido={fluido ? 'si' : 'no'}
      className={cn(
        'font-titulo',
        claseDeTamano,
        CLASE_INTERLINEADO[definicion.interlineado],
        CLASE_INTERLETRADO[interletrado ?? definicion.interletrado],
        CLASE_PESO[peso],
        className,
      )}
    >
      {children}
    </Etiqueta>
  )
}
