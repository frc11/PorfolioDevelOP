'use client'

import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Caption, Cuerpo, EtiquetaDeSeccion, Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { sizesPorColumnas } from '../../_lib/imagen'
import { BloqueDeSeccion, type EstadoDeSeccion } from '../_contrato/coreografia'
import { MarcoDeMedio } from '../_contrato/medios'
import { NumeroDeSeccion, Seccion } from '../_contrato/Seccion'
import type { PropsDeSeccion } from '../_contrato/forma'
import { Pieza, TextoPorLineas } from '../_contrato/piezas'

import { CONTENIDO } from './contenido'

/**
 * 02 · QUIÉNES SOMOS — dos pantallas de papel, sin canvas y sin pinneo.
 *
 * ── El lugar que ocupa en el recorrido, y por qué importa que sea larga ────
 *
 * `secciones.ts` le da `papel-opaco` y **200svh**, sin `pinneada`. Las tres
 * cosas se leen con `seccionDeA('quienes-somos')` y ninguna se declara acá: el
 * alto y la superficie son del recorrido, no de la sección.
 *
 * Es el tramo más largo del sitio en el que el canvas NO se ve, y está entre el
 * Hero —que sí lo deja ver— y Números —que tampoco—. Esa es su función
 * estructural: **la escena vale porque desaparece un rato largo**. Si esta
 * sección fuera corta, el canvas volvería antes de que el visitante lo extrañe
 * y dejaría de ser un acontecimiento para pasar a ser el fondo.
 *
 * ── El reparto de las dos pantallas ───────────────────────────────────────
 *
 * Los 200svh se reparten en DOS cajas de `min-h-svh`, una por pantalla, así que
 * la suma da exactamente el alto declarado y ninguna queda vacía ni acumula
 * todo. El corte NO es a la mitad del texto: cae donde **cambia el sujeto**.
 *
 *   Pantalla 1 — LA AGENCIA. Número de sección en el rail de 140px, etiqueta,
 *     lugar, el titular en h2 y los dos párrafos: qué es develOP y cómo
 *     trabaja. Se lee sin nombres propios: todavía se habla de un "nosotros".
 *   Pantalla 2 — LAS DOS PERSONAS. La foto del equipo con su epígrafe, y
 *     Franco y Valentino con su rol y su hueco. Acá el "nosotros" se vuelve
 *     dos nombres y dos caras.
 *
 * Cualquier otro corte parte una idea al medio: la bajada y el "cómo
 * trabajamos" son una sola respuesta en dos párrafos, y las dos personas no se
 * pueden separar una de otra sin que la segunda pantalla quede coja.
 *
 * ⚠ La sección **no es pinneada**, así que las dos pantallas SCROLLEAN: no hay
 * nada clavado y el visitante no pierde el control del scroll en ningún tramo.
 *
 * ── La coreografía: un P1 y CINCO P2, cada uno en su propio bloque ────────
 *
 * P1 para el titular, con `TextoPorLineas`, que ya trae la rama quieta y el
 * árbol de encabezados. P2 para los cinco bloques de cuerpo — bajada, cómo
 * trabajamos, la foto, Franco y Valentino.
 *
 * Cada P2 va en **su propio `BloqueDeSeccion` con `piezas={1}`**, que es lo que
 * mide el patrón: un solo target por instancia, con lo cual el escalonado queda
 * inerte y la duración aplicada coincide con la declarada. El escalonado real
 * de la sección no sale de un `stagger` sino de la GEOMETRÍA: cada bloque
 * resuelve su ancla contra su propia caja, así que entran cuando le toca a cada
 * uno. Un solo bloque con cinco piezas los haría entrar a todos con el mismo
 * disparo, que es justamente lo que no se quiere en una sección de dos
 * pantallas.
 *
 * ── Abajo de 1025 y con `prefers-reduced-motion` ──────────────────────────
 *
 * `BloqueDeSeccion` entrega `progreso: null` y esta sección renderiza su
 * variante quieta: **el mismo contenido, completo y legible, sin una sola
 * transformada ni un `will-change`**. No es una degradación; es la otra mitad.
 * El pinneo no entra en la cuenta porque esta sección no lo tiene, así que
 * abajo del umbral el ritmo es el del scroll normal — que para dos pantallas de
 * texto es exactamente lo que corresponde.
 */

/**
 * LA GEOMETRÍA — todos los números de la sección, juntos y fuera del contenido.
 *
 * Están acá y no en `contenido.ts` porque son técnicos: los decide quien
 * construye la sección y no cambian el día que llegue la foto real. Mezclarlos
 * con el contenido obligaría a exceptuarlos del escáner de cifras, y una
 * excepción es por donde vuelve a entrar la primera cifra inventada.
 */
export const GEOMETRIA = {
  foto: {
    /**
     * 3:2 apaisado — [decidido, con razón].
     *
     * Es una foto de DOS personas, una al lado de la otra. El encuadre que eso
     * pide es horizontal y de plano medio: 3:2 es la proporción nativa de una
     * cámara y la que menos recorta dos figuras puestas a la par. Las dos
     * alternativas obvias fallan por lados opuestos: 16:9 deja demasiado aire
     * a los costados o corta las cabezas para llenarlo, y 1:1 obliga a apretar
     * a las dos personas contra el centro o a apilarlas, que es exactamente lo
     * que la sección no quiere decir.
     *
     * 1800 × 1200 es el ARCHIVO que se pide, no una caja de pantalla: la caja
     * más grande que produce esta composición es ~60 % de un viewport de 1920,
     * o sea ~1114 px de CSS, y 1800 la cubre con margen para densidad alta sin
     * pasarse del candidato de 1920 de la escalera de Next. Con `fuente={null}`
     * hoy sólo se usa la relación; el día de la foto ya está el ancho pedido.
     */
    ancho: 1800,
    alto: 1200,
    /**
     * Cuántas columnas ocupa, de cuántas. **Es la entrada del `sizes`**, y por
     * eso la grilla de la segunda pantalla es de CINCO y no de dos o tres.
     *
     * `sizesPorColumnas` compone su condición desde el breakpoint de escritorio
     * (1025), que es el mismo y único corte que escribe `sizesPorViewport`. De
     * las grillas del sistema, **la de 5 columnas es la única que colapsa ahí**
     * —`grid-cols-1 escritorio:grid-cols-5`, la firma estructural medida del
     * breakpoint—; las de 2, 3 y 4 colapsan en 768. Con cualquiera de ésas el
     * `sizes` MENTIRÍA en toda la banda de 768 a 1024: diría 100vw mientras la
     * caja real ya vale la mitad, y el navegador bajaría el doble de imagen.
     * Con 5 columnas la caja y el `sizes` conmutan en el mismo píxel.
     *
     * `sizesPorTresTramos` era la otra candidata y se descartó: sus dos tramos
     * de arriba darían el MISMO porcentaje, porque acá la caja no cambia de
     * fracción en 1025 — cambia de existir a no existir.
     */
    columnas: 3,
    columnasTotales: 5,
  },
  /**
   * Cuántas líneas promete el titular. Es inerte para P1 —`LineasDeTexto`
   * recalcula la cantidad con las líneas que MIDE, que es el punto entero del
   * divisor— y va declarado igual porque es lo que el bloque promete y lo que
   * hace comparable esta sección con el rango medido del patrón (1 a 6).
   */
  lineasDelTitular: 2,
} as const

/** El `sizes` real de la foto. Exportado para que el instrumento afirme el
 *  MISMO valor que se le pasa al marco, y no una copia escrita a mano. */
export const SIZES_DE_LA_FOTO = sizesPorColumnas(
  GEOMETRIA.foto.columnas,
  GEOMETRIA.foto.columnasTotales,
)

/**
 * Un bloque P2 con su única pieza, y su rama quieta.
 *
 * Existe para que las cinco instancias no repitan el `estado.progreso === null`
 * cinco veces: cinco copias son cinco oportunidades de que una se desvíe y
 * quede sin variante quieta, que es el defecto que ninguna comprobación de
 * "la sección se ve bien" encontraría.
 */
function SubeEntero({
  estado,
  className,
  children,
}: {
  readonly estado: EstadoDeSeccion
  readonly className?: string
  readonly children: React.ReactNode
}): React.JSX.Element {
  if (estado.progreso === null) return <div className={className}>{children}</div>
  return (
    <Pieza spec={estado.spec} indice={0} progreso={estado.progreso} className={className}>
      {children}
    </Pieza>
  )
}

/** Una persona: nombre en h3, rol real, y el hueco rotulado al lado del rol. */
function Persona({
  persona,
  rotulo,
}: {
  readonly persona: (typeof CONTENIDO.personas)[number]
  readonly rotulo: string
}): React.JSX.Element {
  return (
    <div data-pieza-a="persona" className="flex flex-col gap-2">
      <Titular nivel="titulo-s" como="h3">
        {persona.nombre}
      </Titular>
      <Caption como="p">{persona.rol}</Caption>
      {/* El hueco, con la estructura a la vista: rótulo + marcador, en la
          línea que sigue al rol. El borde punteado es el mismo lenguaje que
          usa `MarcoDeMedio` para el hueco de una foto — un pedido se ve igual
          en toda la sección. */}
      <p className="border-borde-fuerte flex flex-wrap items-baseline gap-2 border border-dashed px-3 py-2">
        <Micro como="span" className="uppercase opacity-casi">
          {rotulo}
        </Micro>
        <Micro como="span" className="font-codigo uppercase">
          {persona.enUnProyecto}
        </Micro>
      </p>
    </div>
  )
}

export function QuienesSomos({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <Envoltorio>
        {/* ── PANTALLA 1 · LA AGENCIA ─────────────────────────────────── */}
        <div
          data-pantalla="agencia"
          className="flex min-h-svh w-full flex-col justify-center gap-12 py-20"
        >
          <Grilla columnas="lateral">
            <NumeroDeSeccion seccion={seccion} />
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <EtiquetaDeSeccion>{CONTENIDO.etiqueta}</EtiquetaDeSeccion>
                <Caption como="p" className="pl-[var(--spacing-8)] opacity-casi">
                  {CONTENIDO.lugar}
                </Caption>
              </div>

              <BloqueDeSeccion patron="P1" piezas={GEOMETRIA.lineasDelTitular}>
                {(estado) => (
                  <TextoPorLineas
                    texto={CONTENIDO.titular}
                    estado={estado}
                    como="h2"
                    className="font-titulo text-fluido-titulo-l leading-titulo tracking-titulo"
                  />
                )}
              </BloqueDeSeccion>

              <Grilla columnas={2}>
                <BloqueDeSeccion patron="P2" piezas={1}>
                  {(estado) => (
                    <SubeEntero estado={estado}>
                      <Cuerpo>{CONTENIDO.bajada}</Cuerpo>
                    </SubeEntero>
                  )}
                </BloqueDeSeccion>
                <BloqueDeSeccion patron="P2" piezas={1}>
                  {(estado) => (
                    <SubeEntero estado={estado}>
                      <Cuerpo>{CONTENIDO.comoTrabajamos}</Cuerpo>
                    </SubeEntero>
                  )}
                </BloqueDeSeccion>
              </Grilla>
            </div>
          </Grilla>
        </div>

        {/* ── PANTALLA 2 · LAS DOS PERSONAS ───────────────────────────── */}
        <div
          data-pantalla="personas"
          className="flex min-h-svh w-full flex-col justify-center py-20"
        >
          <Grilla columnas={5} className="items-start">
            <BloqueDeSeccion patron="P2" piezas={1} className="escritorio:col-span-3">
              {(estado) => (
                <SubeEntero estado={estado}>
                  <figure className="flex flex-col gap-3">
                    <MarcoDeMedio
                      marcador={CONTENIDO.equipo.marcador}
                      fuente={null}
                      alt={CONTENIDO.equipo.alt}
                      ancho={GEOMETRIA.foto.ancho}
                      alto={GEOMETRIA.foto.alto}
                      sizes={SIZES_DE_LA_FOTO}
                    />
                    <figcaption>
                      <Caption como="p">{CONTENIDO.equipo.pie}</Caption>
                    </figcaption>
                  </figure>
                </SubeEntero>
              )}
            </BloqueDeSeccion>

            {/* Los dos apilados y en bloques separados: cada uno resuelve su
                ancla contra su propia caja, así que Valentino entra después de
                Franco sin que ningún `stagger` lo coordine. */}
            <div className="flex flex-col gap-12 escritorio:col-span-2">
              {CONTENIDO.personas.map((persona) => (
                <BloqueDeSeccion key={persona.nombre} patron="P2" piezas={1}>
                  {(estado) => (
                    <SubeEntero estado={estado}>
                      <Persona persona={persona} rotulo={CONTENIDO.rotuloDelPedido} />
                    </SubeEntero>
                  )}
                </BloqueDeSeccion>
              ))}
            </div>
          </Grilla>
        </div>
      </Envoltorio>
    </Seccion>
  )
}
