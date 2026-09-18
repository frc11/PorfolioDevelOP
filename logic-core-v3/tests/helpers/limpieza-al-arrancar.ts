import { activarRegistro, corridasDelRegistro, descartarRegistro } from './siembra-registro'

/**
 * P39 — `globalSetup` de las suites que siembran en la base compartida (setter,
 * leados, perf). Dos cosas, en este orden:
 *
 *   1. borra lo que dejaron las corridas INTERRUMPIDAS — solo los ids que su
 *      registro anotó y no llegó a dar de baja, y solo de procesos que ya no
 *      existen (una corrida viva en paralelo no se toca);
 *   2. activa el registro para ESTA corrida (los workers heredan la variable).
 *
 * Es la única limpieza que alcanza a una corrida que no llegó a su `afterAll`: la
 * del cierre, por construcción, no corre en esa. Ver `siembra-registro.ts`.
 */
export default async function limpiezaAlArrancar(): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('limpieza al arrancar: falta DATABASE_URL (el config carga .env.local)')

  const dir = activarRegistro(url)
  const { interrumpidas, vivas } = corridasDelRegistro(dir)
  if (vivas.length > 0) {
    console.log(`[siembra] ${vivas.length} registro(s) de procesos vivos — no se tocan`)
  }
  if (interrumpidas.length === 0) return

  // Import diferido: sin corridas que limpiar, el setup no abre conexión a la base.
  const { borrarPorIdentidad, disconnect } = await import('./setter-db')
  try {
    for (const corrida of interrumpidas) {
      const borrado = await borrarPorIdentidad({
        avisoIds: corrida.pendientes.aviso,
        leadIds: corrida.pendientes.lead,
        userIds: corrida.pendientes.usuario,
      })
      descartarRegistro(corrida.archivo)
      console.log(
        `[siembra] corrida interrumpida (pid ${corrida.pid}): pendientes ${corrida.pendientes.lead.length} leads · ` +
          `${corrida.pendientes.usuario.length} usuarios · ${corrida.pendientes.aviso.length} avisos → borrados ` +
          `${borrado.leads} leads · ${borrado.usuarios} usuarios · ${borrado.avisos} avisos`,
      )
    }
  } finally {
    await disconnect()
  }
}
