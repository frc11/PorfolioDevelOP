/**
 * TRABAJOS — la tabla que Franco edita. **[B1: el Portfolio con el selector lateral]**
 *
 * ── Por qué este archivo no tiene un solo JSX ni un solo número ────────────
 *
 * Reemplazar lo inventado por lo verdadero tiene que ser editar ESTA tabla (y `proyectos.ts`, que es su parte tipada) y nada más.
 * Las medidas de los videos, el paso del selector y las anclas son geometría y viven en `portfolio/`.
 *
 * ── Qué de acá es VERDAD y qué es relleno ──────────────────────────────────
 *
 * Verdad, y por eso NO va en `PEDIDO`:
 *
 *   · Los tres proyectos (`proyectos.ts`): los nombres reales de `_contrato/escaneo.ts`, los dominios que trajo el humano, y lo que
 *     dictó Valentino para cada ficha —el rubro y qué se hizo (de las frases de PORTFOLIO), la fecha, el servicio y el problema—,
 *     con sus palabras.
 *   · `laTuya.frase` y `laTuya.boton`: las dictó el dueño para el CTA del túnel («¿El próximo proyecto sos vos?», «Clickeá acá
 *     para empezar») y pasan a la última tira.
 *   · Los rótulos de la ficha: son la forma de la ficha, no un dato.
 *
 * Relleno, y por eso va en `PEDIDO` con clase `prosa` y SIN marcador visible (decisión de la aprobación de B1): `bajada` (la
 * descripción del Portfolio) y `laTuya.bajada`. C2 los reescribe.
 *
 * Lo que FALTA y se ve como falta (`PEDIDO` con su marcador): el `problemaResuelto` de Esquina y de Banú y las tres reseñas. Van
 * por la llave del contenido inventado (`_contrato/inventado.ts`): con la llave prendida un texto de RELLENO (para ver la ficha
 * completa), apagada su marcador (`[TEXTO]`, `[TESTIMONIO] · pendiente`, `[NOMBRE]`). `resultado` no existe en ningún proyecto y
 * no se muestra.
 *
 * ── Lo que se fue con el túnel (al archivo, `_archivo/tunel-portfolio/`) ───
 *
 * Las capturas (`pagina.fuente` y su `alt`) y la dirección del navegador del CTA (`cta.direccion`, «tu-empresa.com.ar»): la
 * página ya no las muestra. Una cadena que nadie muestra no queda en la tabla (`s5-contenido` afirma que cada texto llega a la
 * pantalla); el archivo guarda su copia.
 *
 * ⚠ Sin apóstrofos, comillas ni `&` en ninguna cadena: `renderToStaticMarkup` los escapa a entidades y el invariante afirma que
 * cada texto del contenido aparece literal en el marcado.
 */

import type { EntradaDePedido } from '../_contrato/pedido'

import { PROYECTOS, textosDelProyecto } from './proyectos'

/**
 * ⚠️ **B12 · EL RÓTULO DE SECCIÓN, RETIRADO.** Era `CONTENIDO.etiqueta`; sale de `CONTENIDO` y queda acá para que el invariante
 * afirme su AUSENCIA sin escribir la cadena a mano.
 */
export const ROTULO_DE_SECCION_RETIRADO = 'Trabajos'

export const CONTENIDO = {
  /** El h2. Una palabra: la sección se nombra a sí misma. */
  titular: 'Portfolio',

  /** Qué se está mirando. Relleno: lo reescribe C2 (`PEDIDO`). */
  bajada:
    'Cada uno de estos proyectos se pensó desde cero para el negocio que lo ' +
    'iba a usar. Acá abajo no hay plantillas.',

  /** El nombre del grupo de tiras, para los lectores de pantalla. */
  acordeon: 'Los proyectos',

  /** [verdad] Los tres, en el orden de la spec: los textos de `proyectos.ts` (sus medios llevan dígitos y no entran acá). */
  proyectos: PROYECTOS.map(textosDelProyecto),

  /** Los rótulos de la ficha y el enlace al sitio. */
  ficha: {
    fecha: 'Fecha',
    servicio: 'Servicio',
    queHicimos: 'Qué hicimos',
    problema: 'El problema',
    resuelto: 'Lo que resolvimos',
    /** Sólo se ve si algún proyecto tiene resultado (hoy, ninguno). */
    resultado: 'Resultado',
    resena: 'Lo que dice el cliente',
    visitar: 'Visitar sitio',
    abreAparte: 'se abre en una pestaña nueva',
  },

  /** «La próxima es la tuya»: la última tira, con el «?» y el botón a la hoja de contacto de siempre. */
  laTuya: {
    nombre: 'La próxima es la tuya',
    frase: '¿El próximo proyecto sos vos?',
    bajada: 'Contanos qué tenés en mente y lo pensamos desde cero para tu negocio.',
    boton: 'Clickeá acá para empezar',
  },
} as const

/**
 * LO QUE FALTA, dicho por el propio contenido. Una casilla que se llena SALE de esta lista. Los marcadores no se listan acá: los
 * extrae `marcadoresPedidos()` del contenido.
 */
export const PEDIDO: readonly EntradaDePedido[] = [
  {
    ruta: 'bajada',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'La descripción del Portfolio, arriba del lado del texto (la reescribe C2)',
    formato: 'Una o dos frases, unas veinticinco palabras',
  },
  {
    ruta: 'laTuya.bajada',
    clase: 'prosa',
    marcador: null,
    quienLoTrae: 'valentino',
    que: 'El texto de «la próxima es la tuya», debajo de la frase (lo reescribe C2)',
    formato: 'Una frase, unas quince palabras',
  },
  {
    ruta: 'proyectos[1].problemaResuelto',
    clase: 'prosa',
    marcador: '[TEXTO]',
    quienLoTrae: 'valentino',
    que: 'Qué le resolvió la página a Esquina Estudio',
    formato: 'Una frase',
  },
  {
    ruta: 'proyectos[2].problemaResuelto',
    clase: 'prosa',
    marcador: '[TEXTO]',
    quienLoTrae: 'valentino',
    que: 'Qué le resolvió la página a Banú Scents',
    formato: 'Una frase',
  },
  ...PROYECTOS.flatMap((p, i): EntradaDePedido[] => [
    {
      ruta: `proyectos[${i}].resena.texto`,
      clase: 'testimonio',
      marcador: '[TESTIMONIO]',
      quienLoTrae: 'valentino',
      que: `La reseña de ${p.nombre} (la pide Valentino)`,
      formato: 'Dos o tres renglones, con las palabras del cliente',
    },
    {
      ruta: `proyectos[${i}].resena.autor`,
      clase: 'testimonio',
      marcador: '[NOMBRE]',
      quienLoTrae: 'valentino',
      que: `Quién firma la reseña de ${p.nombre}`,
      formato: 'Nombre y, si quiere, el cargo',
    },
  ]),
]

/**
 * LOS PATRONES QUE ESTA SECCIÓN CONSUME — declarados, no inferidos. **P2** trae el titular y la bajada del encabezado (el gesto de
 * «El equipo»); **P7** es el patrón del BLOQUE: la rama de la coreografía (con o sin ella) y la perspectiva de la cámara.
 */
export const PATRONES_DE_LA_SECCION = ['P2', 'P7'] as const
