/**
 * INVARIANTE — la lógica de los slots de precio `proyecto` y `planes`. **[SERVICIOS S2]**
 *
 * Corre a mano (P-H7): `npx tsx src/app/v3/_servicios/__tests__/slots.invariant.ts`.
 *
 * Sin markup y sin navegador: `vistaDelPrecioPorProyecto.ts` y `vistaDeLosPlanes.ts` son funciones puras de los datos. Cada comprobación lleva su control
 * positivo (el mismo detector, contra una entrada armada para fallar). El render de los componentes lo afirma `pagina.invariant.tsx`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { vistaDeLosPlanes, type PrecioPorPlanes, type TarjetaDeUnPlan, type VistaDeLosPlanes } from '../bloques/precio/vistaDeLosPlanes'
import { vistaDelPrecioDeUnProyecto, type PrecioPorProyecto } from '../bloques/precio/vistaDelPrecioPorProyecto'
import { IA_Y_AUTOMATIZACIONES } from '../datos/ia-y-automatizaciones'
import { SOFTWARE_A_MEDIDA } from '../datos/software-a-medida'
import { MARCADOR_A_DEFINIR, numero, usd } from '../formato'
import { PRECIOS_DESDE } from '../precios'
import type { Plan } from '../tipos'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

function delProyecto(): PrecioPorProyecto {
  const precio = SOFTWARE_A_MEDIDA.precio
  if (precio.tipo !== 'proyecto') throw new Error('software-a-medida: el precio ya no es por proyecto')
  return precio
}
function delosPlanes(): PrecioPorPlanes {
  const precio = IA_Y_AUTOMATIZACIONES.precio
  if (precio.tipo !== 'planes') throw new Error('ia-y-automatizaciones: el precio ya no es por planes')
  return precio
}
const PROYECTO = delProyecto()
const PLANES = delosPlanes()
const celdasDe = (v: VistaDeLosPlanes, clave: string): readonly string[] => v.filas.find((f) => f.clave === clave)?.celdas ?? []

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · El slot proyecto: el monto sale del dato')

const proyecto = vistaDelPrecioDeUnProyecto(PROYECTO)
afirmarIgual(proyecto.monto, 'USD 1.000', 'el monto es el del SPEC §7.2: «USD 1.000»')
afirmarIgual(proyecto.monto, usd(PRECIOS_DESDE['software-a-medida'].usd), '  y es el mismo «desde» que publica `PRECIOS_DESDE` para la sección Servicios del home (una sola fuente)')
afirmarIgual(proyecto.nota, PROYECTO.nota, '  la aclaración del SPEC («se cotiza según lo que necesites») sale del dato, tal cual')
afirmarIgual(vistaDelPrecioDeUnProyecto({ tipo: 'proyecto', desde: 2500, nota: 'x' }).monto, 'USD 2.500', 'la cifra se deriva: con otro dato sale otro monto, con el punto de miles')
const montoDeLaFuente = (v: { monto: string }): boolean => v.monto === usd(PRECIOS_DESDE['software-a-medida'].usd)
controlPositivo('un monto escrito a mano y distinto se detecta', { monto: 'USD 100' }, montoDeLaFuente)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El slot planes en desarrollo: la tabla del SPEC §7.3, con «[a definir]» donde falta')

const dev = vistaDeLosPlanes(PLANES, true)
afirmarIgual(dev.columnas, ['Starter', 'Pro', 'Business'], 'las columnas son los tres planes, en el orden del SPEC')
afirmarIgual(dev.filas.map((f) => f.clave), ['mensual', 'conversaciones', 'soporte', 'cambios-web', 'funcionalidades'], 'las filas, en el orden de la tabla del SPEC; la de funcionalidades al final')
afirmarIgual(dev.filas.map((f) => f.rotulo).slice(0, 4), ['Por mes', 'Conversaciones', 'Soporte', 'Cambios web incluidos'], '  con los rótulos del SPEC')
afirmarIgual(celdasDe(dev, 'mensual'), ['USD 49', 'USD 90', 'USD 150'], 'por mes: 49, 90 y 150, en USD')
afirmarIgual(celdasDe(dev, 'conversaciones'), ['500', '3.000', '5.000'], 'conversaciones: 500, 3.000 y 5.000, con el punto de miles')
afirmarIgual(celdasDe(dev, 'soporte'), ['Estándar', 'Estándar', 'Prioritario 24 h'], 'soporte, tal cual')
afirmarIgual(celdasDe(dev, 'cambios-web'), ['Solo ediciones chicas', '+ 1 mediano por mes', '+ 1 mediano y 1 grande por mes'], 'cambios web incluidos, tal cual')
afirmarIgual(celdasDe(dev, 'funcionalidades'), [MARCADOR_A_DEFINIR, MARCADOR_A_DEFINIR, MARCADOR_A_DEFINIR], 'funcionalidades de cada plan: [a definir] (SPEC §7.3 y §11)')
afirmarIgual(dev.implementacionDesde, MARCADOR_A_DEFINIR, 'implementación desde: [a definir] en desarrollo')
afirmarIgual(dev.nota, PLANES.nota, 'la nota («implementación: pago único») sale del dato')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · El slot planes en producción: lo que no hay, no se monta')

const prod = vistaDeLosPlanes(PLANES, false)
afirmarIgual(prod.filas.map((f) => f.clave), ['mensual', 'conversaciones', 'soporte', 'cambios-web'], 'sin la fila de funcionalidades: depende de un dato que falta')
afirmarIgual(prod.implementacionDesde, null, 'sin línea de «implementación desde»: no hay monto')
const sinMarcador = (v: VistaDeLosPlanes): boolean => !JSON.stringify(v).includes(MARCADOR_A_DEFINIR)
afirmar(sinMarcador(prod), 'ni un «[a definir]» en toda la vista de producción')
controlPositivo('la vista de desarrollo no pasa por producción', dev, sinMarcador)
afirmarIgual(celdasDe(prod, 'mensual'), celdasDe(dev, 'mensual'), 'lo que hay es igual en los dos modos: el modo solo decide lo que falta')

const A_MEDIAS: PrecioPorPlanes = { ...PLANES, planes: PLANES.planes.map((p, i): Plan => (i === 0 ? { ...p, funcionalidades: ['Chat', 'Leads'] } : p)) }
afirmarIgual(vistaDeLosPlanes(A_MEDIAS, false).filas.map((f) => f.clave).includes('funcionalidades'), false, 'si el dato falta en UN solo plan, en producción no se publica la fila (una comparación a medias es peor que ninguna)')
afirmarIgual(celdasDe(vistaDeLosPlanes(A_MEDIAS, true), 'funcionalidades'), ['Chat · Leads', MARCADOR_A_DEFINIR, MARCADOR_A_DEFINIR], '  y en desarrollo se ve el plan que sí lo tiene y el marcador en los que no')
const TODOS: PrecioPorPlanes = { ...PLANES, planes: PLANES.planes.map((p, i): Plan => ({ ...p, funcionalidades: [`F${i}`] })) }
afirmarIgual(celdasDe(vistaDeLosPlanes(TODOS, false), 'funcionalidades'), ['F0', 'F1', 'F2'], 'con el dato en todos los planes, la fila sale también en producción')
afirmarIgual(vistaDeLosPlanes({ ...PLANES, implementacionDesde: 300 }, false).implementacionDesde, 'USD 300', 'con el monto de la implementación, la línea sale en los dos modos')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Las cifras se derivan, y ninguna celda sale vacía ni rota')

const OTROS: PrecioPorPlanes = { ...PLANES, planes: [{ nombre: 'X', mensual: 77, conversaciones: 12345, soporte: 's', cambiosWeb: 'c', funcionalidades: null }] }
const otros = vistaDeLosPlanes(OTROS, false)
afirmarIgual([celdasDe(otros, 'mensual'), celdasDe(otros, 'conversaciones')], [['USD 77'], ['12.345']], 'con otros planes salen otras cifras: ninguna está escrita en la lógica')
const celdasSanas = (v: VistaDeLosPlanes): boolean => v.filas.every((f) => f.celdas.length === v.columnas.length && f.celdas.every((c) => c.trim() !== '' && !/^(null|undefined|NaN|0)$/.test(c)))
afirmar(celdasSanas(dev) && celdasSanas(prod), 'cada fila tiene una celda por plan, y ninguna es vacía, null, undefined, NaN ni 0')
controlPositivo('una celda vacía se detecta', { ...prod, filas: [{ clave: 'soporte', rotulo: 'Soporte', celdas: ['', 'x', 'y'] }] }, celdasSanas)
controlPositivo('un precio que se pinta como 0 se detecta', { ...prod, filas: [{ clave: 'mensual', rotulo: 'Por mes', celdas: ['0', '0', '0'] }] }, celdasSanas)
const sinWhatsapp = (v: VistaDeLosPlanes | { monto: string; nota: string }): boolean => !/whatsapp/i.test(JSON.stringify(v))
afirmar(sinWhatsapp(dev) && sinWhatsapp(prod) && sinWhatsapp(proyecto), 'el bot de WhatsApp no se ofrece: ni en un plan, ni en una fila, ni en una nota (SPEC §7.3)')
controlPositivo('una vista que lo ofrece se detecta', { monto: 'USD 1', nota: 'Incluye WhatsApp' }, sinWhatsapp)

// ═══════════════════════════════════════════════════════════════════════════
titulo('5 · Las tarjetas (por debajo de 768) son la tabla leída por plan')

const datosDeLaTarjeta = (t: TarjetaDeUnPlan | undefined): string[] => (t?.datos ?? []).map((d) => `${d.rotulo}: ${d.valor}`)
afirmarIgual(prod.tarjetas.map((t) => t.nombre), prod.columnas, 'una tarjeta por plan, con el nombre y en el orden de las columnas')
for (const [indice, plan] of PLANES.planes.entries()) {
  afirmarIgual(
    datosDeLaTarjeta(prod.tarjetas[indice]),
    [`Por mes: ${usd(plan.mensual)}`, `Conversaciones: ${numero(plan.conversaciones)}`, `Soporte: ${plan.soporte}`, `Cambios web incluidos: ${plan.cambiosWeb}`],
    `${plan.nombre}: sus cuatro datos, cada uno con su rótulo, sacados del dato del plan`,
  )
}
afirmarIgual([prod.tarjetas.map((t) => t.datos.length), dev.tarjetas.map((t) => t.datos.length)], [[4, 4, 4], [5, 5, 5]], 'en producción cuatro datos por tarjeta; en desarrollo suma funcionalidades, como la fila de la tabla')
afirmarIgual(datosDeLaTarjeta(dev.tarjetas[0]).at(-1), `Funcionalidades: ${MARCADOR_A_DEFINIR}`, '  y en desarrollo esa fila es el marcador, igual que en la tabla')
const comoColumna = (v: VistaDeLosPlanes): boolean =>
  v.tarjetas.length === v.columnas.length &&
  v.tarjetas.every((t, i) => t.datos.length === v.filas.length && t.datos.every((d, j) => d.clave === v.filas[j]?.clave && d.rotulo === v.filas[j]?.rotulo && d.valor === v.filas[j]?.celdas[i]))
afirmar(comoColumna(dev) && comoColumna(prod) && comoColumna(vistaDeLosPlanes(A_MEDIAS, true)), 'cada tarjeta es una columna de la tabla: mismas claves, mismos rótulos, mismos valores y el mismo orden, también con un dato a medias')
controlPositivo(
  'una tarjeta con un valor que la tabla no tiene se detecta',
  { ...prod, tarjetas: prod.tarjetas.map((t, i) => (i === 0 ? { ...t, datos: t.datos.map((d, j) => (j === 0 ? { ...d, valor: 'USD 1' } : d)) } : t)) },
  comoColumna,
)
controlPositivo('una tarjeta a la que le falta un dato se detecta', { ...prod, tarjetas: prod.tarjetas.map((t) => ({ ...t, datos: t.datos.slice(1) })) }, comoColumna)
afirmarIgual(datosDeLaTarjeta(otros.tarjetas[0]), ['Por mes: USD 77', 'Conversaciones: 12.345', 'Soporte: s', 'Cambios web incluidos: c'], 'con otro plan sale otra tarjeta: ninguna cifra ni rótulo está escrito en la lógica de las tarjetas')

// ═══════════════════════════════════════════════════════════════════════════
titulo('6 · Son datos puros: ni react, ni next, ni un .tsx')

const sinReact = (codigo: string): boolean => !/from\s+['"](react|react\/[^'"]*|next|next\/[^'"]*)['"]|from\s+['"][^'"]*\.tsx['"]/.test(codigo)
for (const archivo of ['vistaDeLosPlanes.ts', 'vistaDelPrecioPorProyecto.ts', 'rotulos.ts']) {
  afirmar(sinReact(readFileSync(path.join(AQUI, '../bloques/precio', archivo), 'utf8')), `${archivo} no importa react, next ni un .tsx`)
}
controlPositivo('un fuente que importa react se detecta', "import { useState } from 'react'", sinReact)

cerrar('servicios-slots')
