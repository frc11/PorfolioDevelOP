import { forgotPasswordAction } from '@/app/forgot-password/actions'
import { googleSignInAction, loginAction, magicLinkAction } from '@/app/login/actions'

import { ENVIO_SIMULADO, envioSimulado } from '../../_lib/formularios/enviar'
import { LINK_ENVIADO } from './contenido'
import type { AccionesDelIngreso } from './envio'
import { entrarAlPanelSimulado } from './simulacion'

/**
 * [B7] LAS ACCIONES DEL LOGIN — las de siempre, sin tocarlas: `loginAction`, `magicLinkAction` y `googleSignInAction` de
 * `src/app/login/actions.ts` (que llaman a `signIn` de `src/auth.ts`). El formulario nuevo las recibe por acá.
 *
 * SÓLO EN DESARROLLO, con la bandera de los formularios del sitio (`?envio=lento|error`, `_lib/formularios/enviar.ts`), se
 * simulan: ninguna llama al login de verdad. `error`: la espera de siempre y el error del servidor; `lento`: la espera y el éxito
 * (el Magic Link, su aviso; la contraseña y Google, la redirección al panel de `simulacion.ts`). En producción la bandera no existe.
 */

/** El error que el servidor escribe para unas credenciales que no van (el mismo texto de `loginAction`). */
const ERROR_SIMULADO = 'Email o contraseña incorrectos.'
/** El de `magicLinkAction`. */
const ERROR_SIMULADO_DEL_LINK = 'No se pudo generar el Magic Link. Intentá de nuevo.'
/** El de `forgotPasswordAction` para un email que no pasa su validación. */
const ERROR_SIMULADO_DEL_OLVIDO = 'Email inválido.'

const simulado = (): 'lento' | 'error' | null => envioSimulado(window.location.search)
const esperar = (): Promise<void> => new Promise((listo) => window.setTimeout(listo, ENVIO_SIMULADO.demoraMs))

export const ACCIONES_DEL_INGRESO: AccionesDelIngreso = {
  conClave: async (previo, datos) => {
    const modo = simulado()
    if (modo === null) return loginAction(previo, datos)
    if (modo === 'error') {
      await esperar()
      return ERROR_SIMULADO
    }
    return entrarAlPanelSimulado()
  },
  conLink: async (previo, datos) => {
    const modo = simulado()
    if (modo === null) return magicLinkAction(previo, datos)
    await esperar()
    return modo === 'error' ? ERROR_SIMULADO_DEL_LINK : LINK_ENVIADO
  },
  conOlvido: async (_previo, datos) => {
    const modo = simulado()
    if (modo === null) {
      const r = await forgotPasswordAction(null, datos)
      return r === null ? null : r.type === 'success' ? LINK_ENVIADO : r.message
    }
    await esperar()
    return modo === 'error' ? ERROR_SIMULADO_DEL_OLVIDO : LINK_ENVIADO
  },
  conGoogle: async () => {
    const modo = simulado()
    if (modo === null) return googleSignInAction()
    if (modo === 'error') {
      await esperar()
      throw new Error('simulado')
    }
    await entrarAlPanelSimulado()
  },
}
