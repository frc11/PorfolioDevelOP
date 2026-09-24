/**
 * EL CONTENIDO DE «POR QUÉ develOP» — la frase, los seis valores y el CTA. **[FINAL]**
 *
 * Es copy y nada más: los tiempos viven en `_lib/escena/finalDelRecorrido.ts` y la
 * composición en `geometria.ts`. Voseo, frases cortas y cero cifras: la sección vieja
 * tenía dos diferenciales con cifras inventadas y un testimonio entero, y se fueron con
 * sus entradas de INVENTOS —las dos puntas juntas—. No queda nada pedido en esta sección.
 *
 * ⚠️ El copy es PROPUESTA del planificador y se construye tal cual; el dueño lo veta al
 * volver.
 */

import type { EntradaDePedido } from '../_contrato/pedido'

/** El nombre de la sección: el `h2` para lectores de pantalla y la entrada del menú. */
export const NOMBRE_DE_SECCION = 'Por qué develOP'

/** La frase, partida a los dos lados del logo. Se anuncia entera, en orden. */
export const FRASE = { izquierda: 'Seis razones', derecha: 'para elegirnos' } as const

/** Los íconos, por clave: uno por valor, de la misma librería y con el mismo trazo. */
export type IconoDeValor = 'medida' | 'diseno' | 'rapido' | 'calidad' | 'panel' | 'personas'

export interface Valor {
  readonly clave: IconoDeValor
  readonly titulo: string
  readonly linea: string
}

/** Los seis valores. Los tres primeros van a la izquierda del logo y los tres últimos a la derecha. */
export const VALORES: readonly Valor[] = [
  { clave: 'medida', titulo: 'Hecho a medida', linea: 'Sin plantillas: cada sitio se diseña para tu negocio.' },
  { clave: 'diseno', titulo: 'Diseño que se destaca', linea: 'Tu sitio no se parece al de tu competencia.' },
  { clave: 'rapido', titulo: 'Rápido, sin atajos', linea: 'Entregamos rápido sin recortar calidad.' },
  {
    clave: 'calidad',
    titulo: 'Calidad que se nota',
    linea: 'Carga rápido, se ve bien en cualquier pantalla y está bien construido por dentro.',
  },
  { clave: 'panel', titulo: 'Tu panel, tu control', linea: 'Ves cómo va tu proyecto y pedís cambios sin esperar un mail.' },
  {
    clave: 'personas',
    titulo: 'Hablás con quien lo hace',
    linea: 'Sin intermediarios: te atienden las personas que construyen tu sitio.',
  },
]

/** El CTA del tiempo C. El destino queda en `#contacto` hasta que se defina. */
export const CTA = {
  frase: 'Este sitio empezó con una charla.',
  destacado: 'El tuyo también.',
  rotulo: 'Hablanos',
  destino: '#contacto',
} as const

/** Lo que falta en esta sección: nada. La tabla queda vacía y `s7-pedido` la sigue cruzando. */
export const PEDIDO: readonly EntradaDePedido[] = []
