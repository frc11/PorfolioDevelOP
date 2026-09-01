'use client'

import { SERVICIOS } from '../_contrato/acento'
import { Bloque } from '../_contrato/coreografia'
import { seccionDe, type PropsDeSeccion } from '../_contrato/forma'
import { Seccion } from '../_contrato/Seccion'
import { CabeceraDeServicios } from './CabeceraDeServicios'
import { ContenidoDeServicio } from './ContenidoDeServicio'
import { CLASE_DE_BLOQUE_DE_SERVICIO } from './geometria'
import { ServiciosEnSecuencia } from './ServiciosEnSecuencia'

/**
 * SERVICIOS — la sección más coreografiada del sitio. UN momento, no tres.
 *
 * ── La observación que define la sección ──────────────────────────────────
 *
 * > Al scrollear cambian **a la vez** el nombre del servicio, el video del
 * > panel y el párrafo con resaltado progresivo. **No son tres animaciones: es
 * > una.**
 *
 * Un solo `sticky` largo, un solo progreso, cinco canales colgando de él. Es el
 * mismo patrón que la escena de este proyecto ya usa: un número alimentando
 * varios canales. La matemática entera —el reparto en tramos— es
 * `tramoDeSecuencia`, del contrato, y no se reescribe acá.
 *
 * ── Por qué el `Bloque` lleva el alto y no sólo el `Panel` ────────────────
 *
 * `position: sticky` se pega dentro de la caja de su PADRE. El hijo pegado
 * tiene que serlo de un elemento tan alto como la sección: si el `Bloque`
 * midiera lo que mide su contenido —una pantalla— el rango de pegado sería
 * CERO, sin un solo error en consola. Y el `Bloque` es además el elemento
 * MEDIDO, así que tampoco puede ser él el `sticky`: un elemento pegado devuelve
 * su caja pegada, no la de su lugar en el layout, y ahí el ancla dejaría de
 * significar lo que dice.
 *
 * Por eso el mismo valor aparece dos veces —en el `Panel` y en el `Bloque`— y
 * las dos veces sale de la MISMA fuente, `seccionDe('servicios').alto`. No se
 * escribe: se lee.
 *
 * ── `inerciaSegundos: null` es una decisión, y va declarada ───────────────
 *
 * Los canales discretos —el nombre, el medio, el acento— no pueden llegar
 * tarde: con un resorte, el nombre cambiaría DESPUÉS de que el scroll paró, y
 * el acento con él. La inercia del `scrub` de la referencia vive en los tweens
 * individuales, no en un pin. Si a alguien le parece que otro valor es mejor,
 * se cambia acá y en un solo lugar — pero es un cambio de comportamiento, no un
 * ajuste.
 */

/** El alto declarado de la sección. Lo escribe el lane A; este lane lo lee. */
const ALTO_DECLARADO = seccionDe('servicios').alto

/**
 * Sin inercia. Ver la nota de arriba: es la decisión, no un valor por defecto.
 */
const INERCIA_DE_LA_SECUENCIA: number | null = null

/**
 * LA RAMA SIN COREOGRAFÍA — la cabecera y tres bloques, uno por servicio.
 *
 * Los tres bloques son hermanos y nunca están anidados, cada uno de una pantalla
 * de alto: así nunca hay dos acentos en el mismo cuadro, que es la regla de la
 * voz única cumplida por estructura y no por disciplina. Es una lectura
 * declarada —"una pantalla por bloque" es lo verificable en el marcado; "nunca
 * dos en el mismo cuadro" es lo que eso implica en una ventana— y el instrumento
 * afirma la mitad que se puede afirmar: tres cajas con su pantalla, cero
 * anidamientos.
 *
 * La cabecera va ARRIBA de los tres y no adentro de ninguno (SITIO-S11): es el
 * encabezado que nombra a la sección entera, y adentro de un bloque se repetiría
 * tres veces. Acá no es una caja de pantalla, así que el flujo sigue midiendo
 * las TRES declaradas —`s10-mobile` §2 lo cuenta en los cuatro anchos— y lo
 * único que la sección gana de alto es la tinta de la cabecera, sobre un
 * `min-height` que es un piso.
 *
 * No lleva ningún aviso de que acá no hay coreografía. Un texto que sólo
 * aparece abajo del umbral rompería justamente lo que esta rama existe para
 * garantizar: que mobile lea lo mismo que escritorio.
 */
function ServiciosApilados(): React.JSX.Element {
  return (
    <div className="flex w-full flex-col">
      <CabeceraDeServicios />
      {SERVICIOS.map((servicio) => (
        <div key={servicio.id} data-servicio={servicio.id} className={CLASE_DE_BLOQUE_DE_SERVICIO}>
          <ContenidoDeServicio servicio={servicio} progreso={null} />
        </div>
      ))}
    </div>
  )
}

export function Servicios({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Bloque
        patron="pin"
        // El alto va en estilo inline y no en una clase porque el valor viene
        // del DATO: una clase armada como `min-h-[${alto}]` no la ve el escáner
        // de Tailwind y su regla no se emitiría nunca. Es la misma excepción
        // declarada que `Panel` ya usa para su `min-height`.
        style={{ minHeight: ALTO_DECLARADO }}
        className="relative"
      >
        {(progreso) =>
          progreso === null ? (
            <ServiciosApilados />
          ) : (
            <ServiciosEnSecuencia progreso={progreso} />
          )
        }
      </Bloque>
    </Seccion>
  )
}


