'use client'

import { useState } from 'react'

import { AvisoDeScroll, type TonoDelAviso } from '../../_componentes/avisos/AvisoDeScroll'
import { Cta } from '../../_componentes/chrome/Cta'
import { Reluciente } from '../../_componentes/efectos/Reluciente'
import { CampoDePildora, CampoDeTextoLargo, ErrorDelCampo } from '../../_componentes/formularios/Campos'
import { EstadoDeEnvio } from '../../_componentes/formularios/EstadoDeEnvio'
import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Cuerpo, EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { MENSAJES_DEL_ENVIO, type EstadoDelEnvio, type MensajesDelEnvio } from '../../_lib/formularios/estadoDeEnvio'
import { useMovimientoReducido } from '../../_lib/motion/reducido'

/**
 * [C2 · 20] LA PÁGINA DE PRUEBA DE LAS PIEZAS (`/v3/piezas`, instrumento). Cada pieza sobre el papel y en una sección invertida
 * (`data-seccion="invertida"`: el tema dado vuelta, como el Portfolio y el pie de volumen).
 *
 * Los formularios de prueba envían a `ENVIO_DE_PRUEBA`, una ruta que no existe (sin banco: 404, el error); los bancos la interceptan con
 * `page.route`. `?simular=exito|error` responde sin red, a los 900 ms.
 */
export const ENVIO_DE_PRUEBA = '/api/piezas-de-prueba'
const SIMULADO_MS = 900

interface Datos {
  readonly nombre: string
  readonly mail: string
  readonly mensaje: string
}
const VACIOS: Datos = { nombre: '', mail: '', mensaje: '' }

async function responder(datos: Datos): Promise<boolean> {
  const simular = new URLSearchParams(window.location.search).get('simular')
  if (simular === 'exito' || simular === 'error') {
    await new Promise((listo) => window.setTimeout(listo, SIMULADO_MS))
    return simular === 'exito'
  }
  try {
    const r = await fetch(ENVIO_DE_PRUEBA, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) })
    return r.ok
  } catch {
    return false
  }
}

/** Un formulario de prueba con `EstadoDeEnvio`: el de contacto (con mensaje) o el chico de la newsletter (`compacto`). */
function FormularioDePrueba({ prefijo, compacto = false, mensajes, rotulo }: { readonly prefijo: string; readonly compacto?: boolean; readonly mensajes: MensajesDelEnvio; readonly rotulo: string }): React.JSX.Element {
  const [datos, setDatos] = useState<Datos>(VACIOS)
  const [estado, setEstado] = useState<EstadoDelEnvio>('reposo')
  const [error, setError] = useState<string | undefined>(undefined)
  const escribir = (campo: keyof Datos) => (valor: string): void => setDatos((d) => ({ ...d, [campo]: valor }))

  const alEnviar = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (estado !== 'reposo') return
    if (datos.mail.trim() === '') {
      setError('Escribí tu mail.')
      return
    }
    setError(undefined)
    setEstado('enviando')
    setEstado((await responder(datos)) ? 'exito' : 'error')
  }

  const idDelError = `${prefijo}-error-mail`
  // Al volver: después del éxito, vacío (el formulario todavía no se ve); después del error, con lo escrito.
  const alVolver = (despuesDe: 'exito' | 'error'): void => {
    if (despuesDe === 'exito') setDatos(VACIOS)
    setEstado('reposo')
  }
  return (
    <EstadoDeEnvio estado={estado} alVolver={alVolver} mensajes={mensajes} compacto={compacto}>
      <form data-demo={prefijo} noValidate onSubmit={(e) => void alEnviar(e)} className="flex flex-col gap-[var(--spacing-3)]">
        <CampoDePildora rotulo="Nombre" nombre="nombre" id={`${prefijo}-nombre`} valor={datos.nombre} alEscribir={escribir('nombre')} ejemplo="Ana" maximo={80} idDelError={null} conError={false} autocompletar="name" compacto={compacto} />
        <CampoDePildora rotulo="Mail" nombre="mail" id={`${prefijo}-mail`} valor={datos.mail} alEscribir={escribir('mail')} ejemplo="ana@ejemplo.com" maximo={120} idDelError={idDelError} conError={error !== undefined} autocompletar="email" requerido modoDeEntrada="email" compacto={compacto} />
        <ErrorDelCampo id={idDelError} texto={error} />
        {!compacto && <CampoDeTextoLargo rotulo="Mensaje" nombre="mensaje" id={`${prefijo}-mensaje`} valor={datos.mensaje} alEscribir={escribir('mensaje')} ejemplo="Contanos qué necesitás" maximo={1000} idDelError={null} conError={false} />}
        <Cta type="submit" rotulo={rotulo} className="self-start" />
      </form>
    </EstadoDeEnvio>
  )
}

/** El papel y la sección invertida, lado a lado desde la tablet. */
function Par({ id, titulo, papel, invertida }: { readonly id: string; readonly titulo: string; readonly papel: React.ReactNode; readonly invertida: React.ReactNode }): React.JSX.Element {
  return (
    <section id={id} data-piezas={id} className="flex flex-col gap-[var(--spacing-4)]">
      <Titular nivel="titulo-s" como="h2">
        {titulo}
      </Titular>
      <div className="grid gap-[var(--spacing-6)] tablet:grid-cols-2">
        <div data-fondo="papel" className="border-borde-fuerte flex flex-col gap-[var(--spacing-6)] rounded-[var(--radius-medio)] border p-[var(--spacing-6)]">
          {papel}
        </div>
        <div data-fondo="invertida" data-seccion="invertida" className="bg-fondo text-tinta flex flex-col gap-[var(--spacing-6)] rounded-[var(--radius-medio)] p-[var(--spacing-6)]">
          {invertida}
        </div>
      </div>
    </section>
  )
}

function Avisos({ tono, alTocar }: { readonly tono: TonoDelAviso; readonly alTocar: () => void }): React.JSX.Element {
  return (
    <>
      <AvisoDeScroll texto="Scrolleá para explorarlo" tono={tono} />
      <AvisoDeScroll texto="Scrolleá una vez más para ver las preguntas frecuentes" tono={tono} alTocar={alTocar} />
    </>
  )
}

function Relucientes(): React.JSX.Element {
  return (
    <>
      <a href="#reluciente" className="font-display font-fuerte tracking-display leading-titulo text-fluido-titulo-m self-start uppercase">
        <Reluciente como="texto">Hablanos</Reluciente>
      </a>
      <button type="button" className="bg-tinta text-fondo font-semi text-cuerpo relative self-start overflow-hidden rounded-full px-[var(--spacing-8)] py-[var(--spacing-4)]">
        Probar ahora
        <Reluciente />
      </button>
    </>
  )
}

/** El autocompletado: dos píldoras y un campo con fondo propio (el fondo y la tinta de cada uno se quedan). */
function Autocompletado({ prefijo }: { readonly prefijo: string }): React.JSX.Element {
  const [nombre, setNombre] = useState('')
  const [mail, setMail] = useState('')
  const [telefono, setTelefono] = useState('')
  return (
    <form data-demo={prefijo} noValidate onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-[var(--spacing-3)]">
      <CampoDePildora rotulo="Nombre" nombre="nombre" id={`${prefijo}-nombre`} valor={nombre} alEscribir={setNombre} ejemplo="Ana" maximo={80} idDelError={null} conError={false} autocompletar="name" />
      <CampoDePildora rotulo="Mail" nombre="mail" id={`${prefijo}-mail`} valor={mail} alEscribir={setMail} ejemplo="ana@ejemplo.com" maximo={120} idDelError={null} conError={false} autocompletar="email" modoDeEntrada="email" />
      <label htmlFor={`${prefijo}-telefono`} className="text-caption font-medio flex flex-col gap-[var(--spacing-1)]">
        Teléfono (un campo con fondo propio)
        <input id={`${prefijo}-telefono`} name="telefono" type="tel" autoComplete="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="bg-tinta/10 text-cuerpo rounded-[var(--radius-sutil)] px-[var(--spacing-3)] py-[var(--spacing-2)]" />
      </label>
    </form>
  )
}

export function PiezasDePrueba(): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const bajar = (): void => window.scrollBy({ top: window.innerHeight * 0.8, behavior: reducido ? 'auto' : 'smooth' })
  return (
    <div className="bg-fondo text-tinta relative z-10 min-h-svh pb-[var(--spacing-20)]">
      <div className="pt-[var(--spacing-12)]">
        <Envoltorio>
          <div className="flex flex-col gap-[var(--spacing-12)]">
            <div className="flex flex-col gap-[var(--spacing-4)]">
              <EtiquetaDeSeccion>Instrumento interno · cola 2 · tarea 20</EtiquetaDeSeccion>
              <Titular nivel="titulo-l" como="h1">
                Las piezas compartidas
              </Titular>
              <Cuerpo>El envío de los formularios, el aviso de scroll, el reluciente y el autocompletado: cada uno sobre el papel y en una sección invertida.</Cuerpo>
            </div>
            <Par
              id="envio"
              titulo="1 · EstadoDeEnvio"
              papel={<FormularioDePrueba prefijo="envio-papel" mensajes={MENSAJES_DEL_ENVIO.contacto} rotulo="Enviar" />}
              invertida={<FormularioDePrueba prefijo="envio-invertida" compacto mensajes={MENSAJES_DEL_ENVIO.newsletter} rotulo="Suscribirme" />}
            />
            <Par id="aviso" titulo="2 · AvisoDeScroll (papel y escena)" papel={<><Avisos tono="papel" alTocar={bajar} /><AvisoDeScroll texto="Seguí bajando, que todavía hay más" tono="escena" /></>} invertida={<Avisos tono="papel" alTocar={bajar} />} />
            <Par id="reluciente" titulo="3 · Reluciente" papel={<Relucientes />} invertida={<Relucientes />} />
            <Par id="autocompletado" titulo="4 · El autocompletado" papel={<Autocompletado prefijo="auto-papel" />} invertida={<Autocompletado prefijo="auto-invertida" />} />
          </div>
        </Envoltorio>
      </div>
    </div>
  )
}
