'use client'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { idDelTitularDeSeccion } from '../../_componentes/tipografia/Titular'
import { Pie } from '../../_componentes/chrome/Pie'
import { Caption, Micro } from '../../_componentes/tipografia/Textos'
import { Bloque } from '../_contrato/coreografia'
import { CanalDeTitular } from '../_contrato/canales'
import type { PropsDeSeccion } from '../_contrato/forma'
import { EncabezadoDeSeccion, Seccion } from '../_contrato/Seccion'
import { ColumnasDelPie } from './ColumnasDelPie'
import {
  CTA_DE_CIERRE,
  ETIQUETA_DE_SECCION,
  LINEA_DE_CIERRE,
  TITULAR_DE_CIERRE,
} from './contenido'

/**
 * EL CIERRE — el último cuadro del sitio. La mitad de DOM de "la cámara se
 * aleja": las columnas que suben.
 *
 * ── Qué es de este lane y qué no ──────────────────────────────────────────
 *
 * La observación de la referencia tiene dos mitades: **la cámara se aleja y la
 * marca retrocede hacia el horizonte** (eso es de la ESCENA, y este lane no la
 * toca) **mientras las columnas de enlaces suben** (eso es DOM, y es esto). La
 * mitad que falta queda reportada como hueco declarado, no como olvido.
 *
 * ── El pie se consume entero; acá no se rehace nada ───────────────────────
 *
 * `Pie` pone el `<footer>`, su envoltorio y el apilado de `--spacing-12`; sus
 * piezas y sus estados viven en `chrome/` y en `_estilos/pie.css`. Este archivo
 * no declara un `<footer>`, ni una regla de pie, ni un `data-pieza`: pone
 * contenido adentro de la caja que ya existe.
 *
 * ── Por qué NO se le pasa `invertido` a `Pie` ─────────────────────────────
 *
 * La sección ya lleva `data-seccion="invertida"` cuando su superficie lo pide
 * —lo escribe `Panel` leyendo `_lib/secciones.ts`, que es del lane A— y
 * `[data-pieza="pie"]` pinta `var(--color-fondo)`, que ese bloque ya redefinió.
 * Pasar `invertido` sería declarar dos veces la misma decisión y clavarla acá
 * en vez de en la tabla. Consecuencia buscada: la sección es correcta con
 * `papel-opaco` —lo que la tabla dice HOY— y con `oscuro-opaco` —lo que el
 * contrato acordó— sin tocar una línea. El instrumento lo afirma renderizando
 * el MISMO subárbol bajo las dos superficies.
 *
 * ── Dos bloques, no uno ───────────────────────────────────────────────────
 *
 * P1 y P2 no comparten ni ancla ni `scrub` —P1 mide `top bottom-=80px` con un
 * segundo de inercia; P2 mide `top bottom` sin inercia—, así que cada uno
 * cuelga de su propio progreso. Un solo bloque para los dos obligaría a elegir
 * un ancla y a mentir sobre la otra.
 *
 * ── El titular usa `CanalDeTitular` y no `TituloDeCierreDelPie` ───────────
 *
 * Los dos dan la misma medición —`titulo-xl`, `tracking.titulo`, peso normal—
 * porque los tres salen del default de `NIVELES_TIPOGRAFICOS['titulo-xl']`. La
 * diferencia es que el canal es el único que sabe partir el texto línea por
 * línea con P1 y traer su rama quieta. Reescribir eso adentro del título del
 * pie sería duplicar `CanalDeTitular`; lo único que hacía falta de la otra
 * pieza era `text-balance`, que entra por `className`.
 */

/**
 * El contenido de la sección, SIN su `<section>`.
 *
 * Está separado para que el instrumento pueda montarlo bajo una superficie
 * forzada y comprobar que el pie se ve correcto con las dos. En la ruta nadie
 * lo usa suelto: se usa `Cierre`.
 */
export function ContenidoDelCierre({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Pie>
      <EncabezadoDeSeccion seccion={seccion} nombre={ETIQUETA_DE_SECCION} />

      <Bloque patron="P1">
        {(progreso) => (
          /* ⚠ El envoltorio lleva el `id` con el que la `<section>` se nombra
             (S11, defecto 10). El `h2` sale de `CanalDeTitular`, que no tiene
             prop `id` —`canales.tsx` no es de este frente—, así que el id va en
             el elemento que lo contiene: el nombre accesible se computa del
             contenido, y el contenido de este `div` es exactamente el titular.
             Es una caja de bloque adentro del `Bloque`, que ya era una: no mueve
             un píxel del apilado de `--spacing-12` del pie. */
          <div id={idDelTitularDeSeccion(seccion.id)}>
            <CanalDeTitular
              progreso={progreso}
              patron="P1"
              texto={TITULAR_DE_CIERRE}
              nivel="titulo-xl"
              como="h2"
              className="text-balance"
            />
          </div>
        )}
      </Bloque>

      {/* El CTA no cuelga de ningún progreso: la instrucción le asigna P1 al
          titular y P2 a las columnas, y ninguno de los dos es esto. Un tercer
          bloque para un solo enlace sería coreografía que nadie pidió. El
          envoltorio evita que el `inline-flex` del CTA se estire a lo ancho
          del apilado del pie, que es un contenedor `flex` en columna. */}
      <div>
        <CtaEnlace href={CTA_DE_CIERRE.destino} rotulo={CTA_DE_CIERRE.rotulo} />
      </div>

      <Bloque patron="P2">
        {(progreso) => <ColumnasDelPie progreso={progreso} />}
      </Bloque>

      <LineaDeCierre />
    </Pie>
  )
}

/**
 * La última línea del documento. Fecha, razón social y legales no existen y no
 * se inventan: van con su marcador y con la nota que dice qué entra ahí.
 *
 * `opacity-casi` sobre la tinta y no `text-tinta-tenue`: los tokens de tinta
 * secundaria NO se redefinen en `[data-seccion="invertida"]`, así que sobre el
 * fondo oscuro quedan gris medio sobre casi negro. La opacidad, en cambio, se
 * da vuelta con la tinta. El instrumento publica las dos razones de contraste.
 */
function LineaDeCierre(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-[var(--spacing-1)]">
      <Caption como="p" className="font-codigo uppercase">
        {[LINEA_DE_CIERRE.marca, ...LINEA_DE_CIERRE.piezas].join(' · ')}
      </Caption>
      <Micro como="p" className="opacity-casi uppercase">
        {LINEA_DE_CIERRE.nota}
      </Micro>
    </div>
  )
}

/**
 * LA SECCIÓN. Recibe su entrada de la tabla y NADA MÁS: no consulta la
 * compuerta.
 *
 * Quien decide si hay coreografía es la composición del home, una sola vez y
 * arriba de las ocho. Es lo que permite que el instrumento renderice las DOS
 * ramas —instalando o no las primitivas animadas— sin inventar un atributo de
 * forzado en el producto.
 */
export function Cierre({ seccion }: PropsDeSeccion): React.JSX.Element {
  return (
    <Seccion seccion={seccion}>
      <ContenidoDelCierre seccion={seccion} />
    </Seccion>
  )
}
