'use server'

import { redirect } from 'next/navigation'

import { ENVIO_SIMULADO } from '../../_lib/formularios/enviar'

/**
 * [B7] EL ÉXITO SIMULADO DEL LOGIN — SÓLO EN DESARROLLO, para ver el fundido al panel sin llamar al login de verdad (los bancos no
 * tocan la autenticación: la base es compartida). Con `?envio=lento` el formulario lo llama en lugar de la acción real: espera lo
 * mismo que los envíos simulados del sitio y redirige al panel como lo haría `loginAction` (sin sesión, el panel manda al login de
 * siempre: lo que se mira es el fundido). No lee nada, no escribe nada y no toca `auth`. En producción no hace nada.
 */
export async function entrarAlPanelSimulado(): Promise<string | null> {
  if (process.env.NODE_ENV === 'production') return 'No disponible.'
  await new Promise<void>((listo) => setTimeout(listo, ENVIO_SIMULADO.demoraMs))
  redirect('/dashboard')
}
