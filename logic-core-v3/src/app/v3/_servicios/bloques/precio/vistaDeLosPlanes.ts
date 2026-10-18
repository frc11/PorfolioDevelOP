/**
 * [SERVICIOS S2] LA LÓGICA DEL SLOT `planes` (IA y automatizaciones) — la tabla de planes, sin markup.
 *
 * Datos puros, como `vistaDelPrecioPorProyecto.ts`: formato y tipos, nada de react. Convierte los planes en columnas (los nombres) y filas (una por
 * atributo, con una celda por plan, en el orden de la tabla del SPEC §7.3), con «[a definir]» solo en desarrollo (plan §8.4):
 *
 *   · las filas con dato salen siempre; la de funcionalidades depende de un dato que falta (`null`);
 *   · en desarrollo esa fila muestra el marcador; en producción NO se monta, y tampoco si el dato falta en un solo plan: una
 *     comparación a medias es peor que ninguna;
 *   · lo mismo con «implementación desde»: sin monto no hay línea.
 *
 * Las tarjetas (una por plan, por debajo de 768) son la MISMA tabla leída por columnas: salen de las filas, no de los planes, así
 * que ni un valor ni un rótulo se formatea dos veces y las dos versiones no pueden diferir (ni en lo que falta).
 *
 * El WhatsApp no se ofrece (SPEC §7.3): no es un plan ni una fila, y nada de acá lo nombra.
 */

import { numero, textoOMarcador, usd, usdOMarcador } from '../../formato'
import type { Plan, Precio } from '../../tipos'

export type PrecioPorPlanes = Extract<Precio, { readonly tipo: 'planes' }>

export type ClaveDeFila = 'mensual' | 'conversaciones' | 'soporte' | 'cambios-web' | 'funcionalidades'

export interface FilaDeLosPlanes {
  readonly clave: ClaveDeFila
  readonly rotulo: string
  /** Una por plan, en el orden de las columnas. Nunca vacía. */
  readonly celdas: readonly string[]
}

/** Un dato de una tarjeta: el rótulo de la fila y lo que el plan dice en ella. */
export interface DatoDeUnaTarjeta {
  readonly clave: ClaveDeFila
  readonly rotulo: string
  readonly valor: string
}

/** Un plan leído como tarjeta: su nombre y un dato por fila de la tabla, en el mismo orden. */
export interface TarjetaDeUnPlan {
  readonly nombre: string
  readonly datos: readonly DatoDeUnaTarjeta[]
}

export interface VistaDeLosPlanes {
  /** Los nombres de los planes, en el orden del SPEC. */
  readonly columnas: readonly string[]
  readonly filas: readonly FilaDeLosPlanes[]
  /** Las mismas filas leídas por plan: una tarjeta por columna. */
  readonly tarjetas: readonly TarjetaDeUnPlan[]
  /** «Implementación: pago único.» */
  readonly nota: string
  /** «USD 300», o el marcador en desarrollo, o `null` (sin línea) en producción. */
  readonly implementacionDesde: string | null
}

/** Los rótulos de la tabla del SPEC §7.3. El último es de la pregunta «qué funcionalidades trae cada plan». */
const ROTULOS: Readonly<Record<ClaveDeFila, string>> = {
  mensual: 'Por mes',
  conversaciones: 'Conversaciones',
  soporte: 'Soporte',
  'cambios-web': 'Cambios web incluidos',
  funcionalidades: 'Funcionalidades', // C2: provisorio
}

function filaDe(clave: ClaveDeFila, celdas: readonly string[]): FilaDeLosPlanes {
  return { clave, rotulo: ROTULOS[clave], celdas }
}

/** La fila de funcionalidades, o `null` si no se monta: alguna celda sin dato en producción. */
function filaDeFuncionalidades(planes: readonly Plan[], enDesarrollo: boolean): FilaDeLosPlanes | null {
  const celdas = planes.map((plan) => textoOMarcador(plan.funcionalidades === null ? null : plan.funcionalidades.join(' · '), enDesarrollo))
  return celdas.every((celda): celda is string => celda !== null) ? filaDe('funcionalidades', celdas) : null
}

/** La tabla leída por columnas: el plan `i` toma la celda `i` de cada fila. */
function tarjetasDe(columnas: readonly string[], filas: readonly FilaDeLosPlanes[]): readonly TarjetaDeUnPlan[] {
  return columnas.map((nombre, indice) => ({
    nombre,
    datos: filas.flatMap((fila) => {
      const valor = fila.celdas[indice]
      return valor === undefined ? [] : [{ clave: fila.clave, rotulo: fila.rotulo, valor }]
    }),
  }))
}

export function vistaDeLosPlanes(precio: PrecioPorPlanes, enDesarrollo: boolean): VistaDeLosPlanes {
  const { planes } = precio
  const funcionalidades = filaDeFuncionalidades(planes, enDesarrollo)
  const columnas = planes.map((plan) => plan.nombre)
  const filas = [
    filaDe('mensual', planes.map((plan) => usd(plan.mensual))),
    filaDe('conversaciones', planes.map((plan) => numero(plan.conversaciones))),
    filaDe('soporte', planes.map((plan) => plan.soporte)),
    filaDe('cambios-web', planes.map((plan) => plan.cambiosWeb)),
    ...(funcionalidades === null ? [] : [funcionalidades]),
  ]
  return {
    columnas,
    filas,
    tarjetas: tarjetasDe(columnas, filas),
    nota: precio.nota,
    implementacionDesde: usdOMarcador(precio.implementacionDesde, enDesarrollo),
  }
}
