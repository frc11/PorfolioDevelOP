'use client'

import { Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { BloqueSolido } from '../../_componentes/volumen/BloqueSolido'
import { enviarAlServidor } from '../../_lib/formularios/enviar'
import { MAXIMOS, validarElPie, type CampoDelPie, type DatosDelPie, type ErroresDelPie } from '../../_lib/formularios/validar'
import { useModoDelPie, usePiezaDelPie, usePieListo } from '../../_lib/pie3d/registro'
import { CONTACTO_DEL_FORMULARIO } from './contenido'

/**
 * [RETOQUE 3D] 3I · EL CONTACTO DEL PIE — un formulario simple (nombre, mail y mensaje) con campos de verdad: se
 * enfocan, se escriben y los anuncia el lector. Es el destino de todo lo que lleva a contacto (`#contacto`: el viaje lo
 * resuelve a su sección y le da el foco al llegar). [CIERRE RETOQUE 3D] D5: cada campo y el botón son un bloque sólido.
 *
 * [RONDA 2] F1 · ENVÍA: a `/api/contacto` (validación en el navegador y en el servidor). Al enviar, cada campo con error
 * lo dice a su lado y el foco va al primero; mientras viaja, el botón ocupado; el resultado, en sus regiones vivas (el
 * error del servidor, normal; el «listo», y el formulario vacío). Sin carteles de «todavía no envía».
 *
 * [RONDA 2] F5 · cada campo es una placa con la ranura hundida (`forma="ranura"`) y Enviar, la tecla principal (más
 * grande y más alta); entre los campos, más aire.
 *
 * [RETOQUE DEL PIE] P2 · desde 1025, UNA placa en WebGL (`escena/pie3d/`): el formulario entero se anota como pieza, con
 * su aire alrededor; los campos son pozos en su cara y Enviar, una tecla que sale de ella. Los campos y el botón siguen
 * siendo los del DOM, sobre la placa (la escena les escribe la transformada cada cuadro). Con el 3D listo, la sala se
 * invierte (`data-seccion`: la tinta clara sobre el negro, como el foco) y los rótulos los dibuja la placa en relieve.
 *
 * [EL ENCASTRE] 1E · el único obligatorio es el mail (el nombre y el mensaje, opcionales; el largo lo frena cada campo) y
 * el foco lo dibuja la caja del campo (`data-foco="campo"`, `foco.css`): su borde, más oscuro y más grueso, sin anillo.
 *
 * [NOCTURNO FINAL] C4 · abajo de 1024 va en la tarjeta sólida de su columna y en una grilla de seis: el nombre y el mail
 * lado a lado, el mensaje (de dos renglones) y Enviar (lleno, de tinta) en la fila de abajo. Los campos a 16 px: con menos,
 * Safari del iPhone agranda la página al tocarlos. Desde 1024, como estaba (una columna, sobre la placa 3D).
 */
const MAXIMO_DE: Record<CampoDelPie, number> = { nombre: MAXIMOS.nombre, mail: MAXIMOS.contacto, mensaje: MAXIMOS.mensaje }
const CAMPO ='block w-full rounded-[var(--radius-sutil)] border border-borde-fuerte escritorio:border-transparent bg-transparent px-[var(--spacing-3)] py-[var(--spacing-2)] escritorio:px-[var(--spacing-4)] escritorio:py-[var(--spacing-3)] text-cuerpo max-escritorio:text-base leading-texto tracking-texto placeholder:opacity-60 aria-invalid:border-current'
/** [NOCTURNO FINAL] C4 · el lugar de cada campo en la grilla de abajo de 1024 (de seis): el nombre y el mail, mitad y mitad. */
// [PULIDO 3] A2 · en la tablet, en columna: un campo por renglón y el mensaje con el alto que sobra.
const LUGAR_DEL_CAMPO: Readonly<Record<CampoDelPie, string>> = { nombre: 'col-span-3', mail: 'col-span-3', mensaje: 'col-span-4 tablet:max-escritorio:grid tablet:max-escritorio:flex-1 tablet:max-escritorio:grid-rows-[auto_1fr_auto]' }
const ROTULO = 'text-micro leading-micro tracking-micro font-medio uppercase'
const ERROR = 'text-micro leading-micro tracking-micro'
const VACIO: DatosDelPie = { nombre: '', mail: '', mensaje: '' }

type Estado = { readonly fase: 'quieto' | 'enviando' | 'listo' } | { readonly fase: 'error'; readonly mensaje: string }

export function FormularioDelPie(): React.JSX.Element {
  const c = CONTACTO_DEL_FORMULARIO
  const [datos, setDatos] = useState<DatosDelPie>(VACIO)
  const [errores, setErrores] = useState<ErroresDelPie>({})
  const [intento, setIntento] = useState(false)
  const [estado, setEstado] = useState<Estado>({ fase: 'quieto' })
  const enviando = estado.fase === 'enviando'
  const volumen = useModoDelPie() === 'volumen'
  const listo = usePieListo()
  const enVolumen = volumen && listo
  const placa = useRef<HTMLFormElement | null>(null)
  usePiezaDelPie(placa, { id: 'formulario-del-pie', forma: 'formulario', activo: volumen })

  const escribir = (campo: CampoDelPie, valor: string): void => {
    const siguiente = { ...datos, [campo]: valor }
    setDatos(siguiente)
    // Después del primer intento, los errores se corrigen mientras se escribe.
    if (intento) setErrores(validarElPie(siguiente))
    if (estado.fase === 'listo' || estado.fase === 'error') setEstado({ fase: 'quieto' })
  }

  const alEnviar = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (enviando) return
    setIntento(true)
    const encontrados = validarElPie(datos)
    setErrores(encontrados)
    const primero = (['nombre', 'mail', 'mensaje'] as const).find((k) => encontrados[k] !== undefined)
    if (primero !== undefined) {
      const form = e.currentTarget
      requestAnimationFrame(() => form.querySelector<HTMLElement>(`#contacto-${primero}`)?.focus())
      return
    }
    setEstado({ fase: 'enviando' })
    const r = await enviarAlServidor('/api/contacto', { origen: 'pie', nombre: datos.nombre.trim(), mail: datos.mail.trim(), mensaje: datos.mensaje.trim() })
    if (r.ok) {
      setEstado({ fase: 'listo' })
      setDatos(VACIO)
      setIntento(false)
    } else setEstado({ fase: 'error', mensaje: r.error })
  }

  const campo = (k: CampoDelPie): { readonly id: string; readonly invalido: boolean; readonly describe: string | undefined } => ({
    id: `contacto-${k}`,
    invalido: errores[k] !== undefined,
    describe: errores[k] !== undefined ? `contacto-${k}-error` : undefined,
  })

  return (
    <form id="contacto" ref={placa} tabIndex={-1} noValidate data-pieza="contacto-del-pie" data-seccion={enVolumen ? 'invertida' : undefined} aria-label={c.nombreAccesible} onSubmit={(e) => void alEnviar(e)} className={cn('grid grid-cols-6 gap-[var(--spacing-3)] tablet:max-escritorio:flex tablet:max-escritorio:flex-1 tablet:max-escritorio:flex-col escritorio:flex escritorio:flex-col escritorio:gap-[var(--spacing-5)]', volumen && 'escritorio:p-[var(--spacing-5)]', enVolumen && 'text-tinta')}>
      {(['nombre', 'mail', 'mensaje'] as const).map((k) => {
        const f = campo(k)
        return (
          <div key={k} className={cn('flex flex-col gap-[var(--spacing-1)]', LUGAR_DEL_CAMPO[k])}>
            <label htmlFor={f.id} className={cn(ROTULO, enVolumen && 'text-transparent')}>
              {c[k]}
            </label>
            <BloqueSolido forma="ranura" className="block w-full">
              {k === 'mensaje' ? (
                <textarea id={f.id} name={k} rows={3} maxLength={MAXIMO_DE[k]} data-foco="campo" value={datos[k]} onChange={(e) => escribir(k, e.target.value)} aria-invalid={f.invalido || undefined} aria-describedby={f.describe} className={cn(CAMPO, 'resize-none max-escritorio:h-[calc(var(--spacing-12)+var(--spacing-6))] tablet:max-escritorio:min-h-full')} />
              ) : (
                <input
                  id={f.id}
                  name={k}
                  type={k === 'mail' ? 'email' : 'text'}
                  autoComplete={k === 'mail' ? 'email' : 'name'}
                  required={k === 'mail'}
                  maxLength={MAXIMO_DE[k]}
                  data-foco="campo"
                  placeholder={k === 'mail' ? c.ejemploDeMail : undefined}
                  value={datos[k]}
                  onChange={(e) => escribir(k, e.target.value)}
                  aria-invalid={f.invalido || undefined}
                  aria-describedby={f.describe}
                  className={CAMPO}
                />
              )}
            </BloqueSolido>
            {f.invalido && (
              <p id={f.describe} className={ERROR}>
                {errores[k]}
              </p>
            )}
          </div>
        )
      })}
      <BloqueSolido forma="principal" className="self-start max-escritorio:col-span-2 max-escritorio:self-end escritorio:mt-[var(--spacing-2)]">
        <button type="submit" disabled={enviando} aria-busy={enviando || undefined} className="flex items-center gap-[var(--spacing-2)] rounded-[var(--radius-pastilla-s)] border border-borde-fuerte escritorio:border-transparent px-[var(--spacing-5)] py-[var(--spacing-2)] escritorio:px-[var(--spacing-8)] escritorio:py-[var(--spacing-3)] text-cuerpo font-semi disabled:cursor-wait max-escritorio:w-full max-escritorio:justify-center max-escritorio:border-transparent max-escritorio:bg-tinta max-escritorio:px-[var(--spacing-3)] max-escritorio:text-fondo">
          {enviando && <Loader2 aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-4)] animate-spin motion-reduce:animate-none" />}
          {enviando ? c.enviando : c.enviar}
        </button>
      </BloqueSolido>
      {/* Las dos regiones vivas existen desde el principio (una que nace con su texto no siempre se anuncia). */}
      <p role="alert" className={cn(ERROR, 'col-span-6', estado.fase !== 'error' && 'sr-only')}>
        {estado.fase === 'error' ? estado.mensaje : ''}
      </p>
      <p role="status" className={cn(ERROR, 'col-span-6 empty:hidden')}>
        {estado.fase === 'listo' ? c.listo : ''}
      </p>
    </form>
  )
}
