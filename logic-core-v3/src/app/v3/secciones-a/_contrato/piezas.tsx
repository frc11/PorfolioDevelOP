'use client'

import { LineasDeTexto } from '../../motion/_componentes/LineasDeTexto'
import { Pieza } from '../../motion/_componentes/Pieza'

import type { EstadoDeSeccion } from './coreografia'

/**
 * LA ÚNICA PUERTA A LAS PIEZAS DE MOTION.
 *
 * ── El hallazgo que obliga a que exista un solo import ─────────────────────
 *
 * `Pieza` y `LineasDeTexto` son el sistema —el reporte de S2 lo dice con todas
 * las letras: *"Una sección nueva usa `BloqueDePatron` + `Pieza` (o
 * `LineasDeTexto` para P1) y no necesita saber nada más"*— pero **viven en
 * `src/app/v3/motion/_componentes/`**, que es la carpeta privada de la ruta de
 * demostración, y el mismo reporte declara que esa carpeta **se borra entera**
 * el día que el sitio esté armado: *"Al borrarla hay que borrar también …
 * `_componentes/` entero — el sistema vive en `_lib/motion/`, que se queda"*.
 *
 * Las dos frases no pueden ser verdad a la vez. Es una contradicción del
 * handoff de S2, no de este lane, y **arreglarla es mover archivos dentro del
 * sistema de motion: una decisión, no un detalle**. Este lane no la toma;
 * queda reportada.
 *
 * Lo que sí hace este lane es acotar el daño: **este archivo es el único de las
 * cuatro secciones que importa de esa carpeta.** El día que los tres módulos se
 * muevan a `_lib/motion/`, lo que cambia son dos líneas, acá. Un instrumento
 * afirma que ninguna sección importa de `motion/_componentes/` por su cuenta.
 *
 * ── Qué se reexporta y qué no ──────────────────────────────────────────────
 *
 * `Pieza` se reexporta tal cual: es el único lugar del sistema que escribe
 * estilo, y no hay nada que agregarle.
 *
 * `Piezas` —el envoltorio de N piezas del demo— **no** se reexporta. Emite un
 * `div` contenedor y un `div`/`span` por pieza, con las clases que se le pasen;
 * para una composición dispersa como la de Números, o para tres proyectos que
 * se posicionan uno encima del otro, esa forma no sirve y cada sección arma su
 * propio contenedor con `Pieza` adentro. Es la misma decisión que ya toma el
 * demo cuando P7 usa `contenedor="absolute inset-0"`.
 *
 * `LineasDeTexto` se envuelve en `TextoPorLineas`, y el porqué está abajo.
 */

export { Pieza }

/**
 * UN TEXTO QUE ENTRA LÍNEA POR LÍNEA — P1, con su variante quieta y con el
 * árbol de encabezados intacto.
 *
 * ── Por qué no alcanza con llamar a `LineasDeTexto` ────────────────────────
 *
 * Por dos razones, y la segunda es de marcado.
 *
 * **La primera** es que la variante sin coreografía hay que escribirla, y
 * escribirla CUATRO VECES —una por sección— es cuatro oportunidades de que una
 * se desvíe. Acá está una sola vez: con `progreso === null` el texto se
 * renderiza entero, en su etiqueta, sin partir y sin una transformada.
 *
 * **La segunda** es que `LineasDeTexto` emite un `<div>` como contenedor y no
 * acepta cuál etiqueta emitir. Un titular partido en líneas no puede ser
 * entonces el propio `<h1>`: `<div>` no es contenido de frase y `<h1><div>` es
 * marcado inválido. La salida, sin tocar el sistema de motion, es separar las
 * dos funciones que el `<h1>` cumplía:
 *
 *     <h1 class="sr-only">      el texto entero — el árbol de encabezados y
 *                               lo único que anuncia un lector de pantalla
 *     <div aria-hidden>         el bloque visual, partido en líneas
 *
 * El texto se anuncia UNA vez —la copia accesible que `LineasDeTexto` trae
 * adentro queda dentro del subárbol oculto— y el encabezado sigue estando donde
 * corresponde. Un instrumento lo afirma sobre el marcado real, con su control
 * positivo.
 *
 * ⚠ **El arreglo de verdad es una prop `como` en `LineasDeTexto`**, que dejaría
 * el `<h1>` como contenedor único y ahorraría el nodo extra. Es un cambio al
 * sistema de motion y este lane no lo hace. Queda reportado.
 */
export interface TextoPorLineasProps {
  readonly texto: string
  readonly estado: EstadoDeSeccion
  /**
   * La etiqueta del documento. **Sin valor por defecto**: elegir el nivel de un
   * encabezado es una decisión, igual que en `Titular`.
   */
  readonly como: 'h1' | 'h2' | 'h3' | 'p'
  /**
   * Las clases de tipografía del bloque. **Obligatorias**: el divisor mide
   * dónde corta cada línea, y una medición tomada sin la tipografía definitiva
   * agrupa las palabras con la métrica equivocada.
   */
  readonly className: string
  readonly id?: string
}

export function TextoPorLineas({
  texto,
  estado,
  como: Etiqueta,
  className,
  id,
}: TextoPorLineasProps): React.JSX.Element {
  const { progreso, spec } = estado

  if (progreso === null) {
    return (
      <Etiqueta id={id} data-texto-por-lineas="entero" className={className}>
        {texto}
      </Etiqueta>
    )
  }

  return (
    <div data-texto-por-lineas="partido">
      {/* El encabezado real. Es lo ÚNICO que entra al árbol de accesibilidad. */}
      <Etiqueta id={id} className="sr-only">
        {texto}
      </Etiqueta>
      <div aria-hidden="true">
        <LineasDeTexto
          texto={texto}
          progreso={progreso}
          claves={spec.claves}
          curva={spec.curva}
          duracionDeclarada={spec.cronograma.duracionDeclarada}
          escalonado={spec.cronograma.escalonado}
          className={className}
        />
      </div>
    </div>
  )
}

/**
 * El atributo que marca el estado del divisor. Lo busca el instrumento para
 * distinguir las dos ramas sin depender del texto, que es relleno y va a
 * cambiar.
 */
export const ATRIBUTO_TEXTO_POR_LINEAS = 'data-texto-por-lineas'
