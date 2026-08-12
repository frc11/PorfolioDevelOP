import type { ServiceAccent } from '@/components/design-system'

/**
 * Los cuatro frentes. Fuente única de la sección S5 del home.
 *
 * Nada de esto viene del monolito: `OurServices.tsx` traía por servicio precio
 * "DESDE", métrica de impacto, icono, href, copy largo y una demo animada
 * propia. De todo eso, lo único que sobrevive a la auditoría de contenido son
 * los timelines — y ni siquiera los cuatro.
 *
 * **Lo real, tal cual:** 15 días (web) · 7 días (IA) · 5 días (automatización),
 * y la asignación de acento por servicio, congelada en `CLAUDE.md`.
 *
 * **Lo que falta va marcado.** Software a medida no tiene plazo definido: el
 * monolito decía "entrega por etapas", que no es un número, y el censo lo dejó
 * anotado como pendiente. Se marca; no se estima.
 *
 * GATE DE MERGE: ninguna rama con estos placeholders a la vista se mergea a
 * `main`. Van al inventario consolidado de la bitácora.
 */
export interface Frente {
  /**
   * Rol de servicio. Define el acento y es la clave estable de la fila —
   * el nombre visible puede cambiar sin que se mueva ningún color.
   */
  service: ServiceAccent
  nombre: string
  /** Para quién es. Una línea, en la voz del que tiene el problema. */
  paraQuien: string
  /** Qué recibe. Una línea, concreta: el objeto, no la promesa. */
  entregable: string
  /**
   * Plazo. Se guarda en grafía natural y lo pasa a mayúsculas el token de
   * `MonoLabel`; así el lector de pantalla no lo deletrea letra por letra.
   */
  timeline: string
}

export const FRENTES: readonly Frente[] = [
  {
    service: 'web',
    nombre: 'Desarrollo web',
    paraQuien: 'Para negocios que hoy pierden consultas porque su web no vende.',
    entregable: 'Sitio a medida, rápido, con la conversión medida.',
    timeline: '15 días',
  },
  {
    service: 'ia',
    nombre: 'Agentes de IA',
    paraQuien: 'Para quienes responden las mismas preguntas todo el día.',
    entregable: 'Un agente entrenado con tu información, atendiendo en tu canal.',
    timeline: '7 días',
  },
  {
    service: 'automation',
    nombre: 'Automatización de procesos',
    paraQuien: 'Para operaciones que viven pegadas con planillas y copiar-pegar.',
    entregable: 'Los procesos conectados, corriendo solos.',
    timeline: '5 días',
  },
  {
    service: 'software',
    nombre: 'Software a medida',
    paraQuien: '[PARA QUIÉN — 1 línea]',
    entregable: '[ENTREGABLE — 1 línea]',
    timeline: '[00 días]',
  },
]
