/**
 * LAS OCHO SECCIONES DEL SITIO v3 — el recorrido, como tabla.
 *
 * Sin contenido, sin copy, sin imágenes: este sprint construye el esqueleto.
 * Cada entrada es un bloque con su altura declarada y su nombre visible como
 * texto plano, para poder identificarlo mirando la página.
 *
 * ── El hallazgo estructural que ordena todo esto ───────────────────────────
 *
 * La referencia NO es una pila de secciones con fondo: es un canvas permanente
 * a viewport completo con paneles de DOM deslizándose encima. Por eso el
 * escenario está en `layout.tsx` y no acá, y por eso esta lista es solo el
 * FLUJO DEL DOCUMENTO. La consecuencia práctica es la que importa: la capa 3D
 * se enchufa y se desenchufa sin tocar una línea de esta tabla.
 *
 * ── Las alturas ────────────────────────────────────────────────────────────
 *
 * En `svh` y no en `vh`: en mobile la barra del navegador entra y sale, y con
 * `vh` cada panel salta cuando se esconde. `svh` es la altura chica y estable.
 *
 * Las separaciones son CERO. Está medido —33 de 36 separaciones en 0px— y no
 * es un descuido de la referencia: el ritmo vive en el pinneado, no en el aire
 * entre bloques. Ningún panel declara margen.
 */

import type { ModoSuperficie } from './superficies'

export interface Seccion {
  /** Ancla y `data-panel`. Estable: la coreografía va a apuntar acá. */
  readonly id: string
  /** El número que se ve en la columna lateral de 140px. */
  readonly numero: string
  /** El nombre visible, en texto plano. Es todo el "contenido" que hay. */
  readonly nombre: string
  /** La superficie. LAS OCHO ARRANCAN EN `papel-opaco`. */
  readonly superficie: ModoSuperficie
  /** Altura declarada del bloque. */
  readonly alto: string
  /**
   * Si la sección es la demostración de pinneado con `sticky`.
   * Exactamente una lo es, y el invariante lo afirma.
   */
  readonly pinneada?: true
}

export const SECCIONES: readonly Seccion[] = [
  { id: 'hero', numero: '01', nombre: 'Hero', superficie: 'papel-opaco', alto: '100svh' },
  { id: 'quienes-somos', numero: '02', nombre: 'Quiénes somos', superficie: 'papel-opaco', alto: '100svh' },
  { id: 'numeros', numero: '03', nombre: 'Números', superficie: 'papel-opaco', alto: '80svh' },
  { id: 'trabajos', numero: '04', nombre: 'Trabajos', superficie: 'papel-opaco', alto: '120svh' },
  /**
   * SERVICIOS — la sección pinneada de demostración.
   *
   * Es la más coreografiada de la referencia, así que es la que sirve para
   * demostrar que el mecanismo funciona. 300svh de recorrido con un hijo
   * `sticky` de 100svh: el panel queda clavado 200svh de scroll.
   *
   * **Sin una línea de JavaScript.** Es CSS `sticky` puro, y por eso sobrevive
   * abajo de la compuerta de 1025 — mobile conserva el ritmo gratis.
   */
  { id: 'servicios', numero: '05', nombre: 'Servicios', superficie: 'papel-opaco', alto: '300svh', pinneada: true },
  { id: 'tu-panel', numero: '06', nombre: 'Tu panel', superficie: 'papel-opaco', alto: '100svh' },
  { id: 'por-que-develop', numero: '07', nombre: 'Por qué develOP', superficie: 'papel-opaco', alto: '100svh' },
  { id: 'cierre', numero: '08', nombre: 'Cierre', superficie: 'papel-opaco', alto: '100svh' },
]

/** La superficie con la que arrancan las ocho. Lo usa el invariante. */
export const SUPERFICIE_INICIAL: ModoSuperficie = 'papel-opaco'
