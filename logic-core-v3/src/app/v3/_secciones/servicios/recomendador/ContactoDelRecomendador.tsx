'use client'

import { useState } from 'react'

import { Cta } from '../../../_componentes/chrome/Cta'
import { CampoDePildora, CampoDeTextoLargo, ErrorDelCampo } from '../../../_componentes/formularios/Campos'
import { EstadoDeEnvio } from '../../../_componentes/formularios/EstadoDeEnvio'
import { CLASE_DEL_TEXTO_DEL_FORMULARIO } from '../../../_componentes/formularios/letraDelFormulario'
import { Titular } from '../../../_componentes/tipografia/Titular'
import { CAMPOS, PRECARGA_POR_SERVICIO, ROTULO_DEL_ENVIO, ROTULO_ENVIANDO, avisoDeErrores } from '../../../_chrome/contacto/contenido'
import { enviarContacto, validarContacto, type DatosDeContacto, type ErroresDeContacto } from '../../../_chrome/contacto/enviarContacto'
import type { EstadoDelEnvio, ResultadoDelEnvio } from '../../../_lib/formularios/estadoDeEnvio'
import { MAXIMOS } from '../../../_lib/formularios/validar'
import { EnlaceDelServicio } from '../escenario/PanelDeServicio'
import { BotonDelRecomendador } from './BotonDelRecomendador'
import { mensajeDelContacto, rotuloDeLaPagina, solucion, TEXTOS_DEL_RECOMENDADOR, tituloDelContacto, type IdDeSolucion, type Respuestas } from './logica'

/**
 * [C2-51] EL CONTACTO PRECARGADO DEL RECOMENDADOR — «Hablemos de {la elegida}», con Nombre, Email o teléfono y el Mensaje ya escrito
 * con las respuestas (`mensajeDelContacto`, editable). NO es un formulario nuevo: los campos son los del sitio (`Campos.tsx`, con el
 * arreglo global del autocompletado de `piezas.css`), la validación y el envío son los del contacto general (`validarContacto`,
 * `enviarContacto`: el mismo endpoint, `/api/contacto`), con los intereses de la precarga del servicio (`data-precarga`, como los
 * «Quiero mi…» de Servicios) y el envío estándar del sitio (`EstadoDeEnvio`: la carga de develOP, «¡Recibido!» o el error, y a los
 * 3 s vuelve el formulario: después del error, con lo escrito; después del éxito [L4] el recomendador vuelve a sus dos soluciones: `alEnviado`).
 * En la fila de acciones, «Enviar», el link a la página del servicio (el viaje de B12b: `EnlaceDelServicio`) y «Empezar de nuevo». Los bancos nunca envían de verdad (`/api/` interceptado).
 */

type CampoDelRecomendador = 'nombre' | 'medio' | 'mensaje'
type Datos = Pick<DatosDeContacto, CampoDelRecomendador>

const idDelCampo = (campo: string): string => `recomendador-${campo}`
const idDelError = (campo: string): string => `recomendador-error-${campo}`

interface Props {
  readonly respuestas: Respuestas
  readonly elegida: IdDeSolucion
  /** [L4] El envío terminó bien (y ya pasó el mensaje): el recomendador vuelve a las dos soluciones. */
  readonly alEnviado: () => void
  /** [L4] «Empezar de nuevo», en la fila de acciones del contacto. */
  readonly alEmpezar: () => void
}

export function ContactoDelRecomendador({ respuestas, elegida, alEnviado, alEmpezar }: Props): React.JSX.Element {
  const servicio = solucion(elegida).servicio
  const precargado = (): Datos => ({ nombre: '', medio: '', mensaje: mensajeDelContacto(respuestas, elegida) })
  const [datos, setDatos] = useState<Datos>(precargado)
  const [errores, setErrores] = useState<ErroresDeContacto>({})
  const [intento, setIntento] = useState(false)
  const [estado, setEstado] = useState<EstadoDelEnvio>('reposo')
  const [aviso, setAviso] = useState('')
  // Lo que viaja: los tres campos, el interés del servicio (la precarga de su `data-precarga`) y lo que no se pregunta, vacío.
  const completos = (d: Datos): DatosDeContacto => ({ intereses: PRECARGA_POR_SERVICIO[servicio] ?? [], presupuesto: '', empresa: '', ...d })

  const escribir = (campo: CampoDelRecomendador, valor: string): void => {
    const siguiente = { ...datos, [campo]: valor }
    setDatos(siguiente)
    if (intento) setErrores(validarContacto(completos(siguiente)))
  }

  const alEnviar = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (estado !== 'reposo') return
    setIntento(true)
    const form = e.currentTarget
    // Inválido responde al toque (sin la carga); válido se desvanece en la carga mientras viaja.
    if (Object.keys(validarContacto(completos(datos))).length === 0) setEstado('enviando')
    const r = await enviarContacto(completos(datos))
    if (r.estado === 'invalido') {
      setEstado('reposo')
      setErrores(r.errores)
      setAviso('')
      requestAnimationFrame(() => setAviso(avisoDeErrores(Object.keys(r.errores).length)))
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setErrores({})
    setEstado(r.estado === 'error' ? 'error' : 'exito')
  }

  // El mensaje del envío terminó: vuelve el formulario (después del éxito, con el mensaje precargado otra vez; todavía no se ve).
  const alVolver = (despuesDe: ResultadoDelEnvio): void => {
    if (despuesDe === 'exito') {
      setDatos(precargado())
      setIntento(false)
      setEstado('reposo')
      alEnviado()
      return
    }
    setEstado('reposo')
  }

  const enviando = estado === 'enviando'
  const comun = (campo: CampoDelRecomendador, rotulo: string, ejemplo: string, maximo: number) => ({
    rotulo, nombre: campo, id: idDelCampo(campo), valor: datos[campo], alEscribir: (v: string) => escribir(campo, v), ejemplo, maximo,
    idDelError: idDelError(campo), conError: campo !== 'mensaje' && errores[campo] !== undefined, claseDelTexto: CLASE_DEL_TEXTO_DEL_FORMULARIO,
  })
  return (
    <div data-pieza="contacto-del-recomendador" data-solucion={elegida} className="flex flex-col gap-[var(--spacing-5)]">
      {/* [L8a] El título a la izquierda y, a su derecha, el botón a la página del servicio (abajo de 1024 se apilan). */}
      <div data-parte="cabecera-del-contacto" className="flex flex-col items-start gap-[var(--spacing-2)] escritorio:flex-row escritorio:items-center escritorio:justify-between escritorio:gap-[var(--spacing-6)]">
        <Titular nivel="titulo-m" como="h4">
          {tituloDelContacto(elegida)}
        </Titular>
        <EnlaceDelServicio id={servicio} rotulo={rotuloDeLaPagina(servicio)} enTinta />
      </div>
      {/* `grid-cols-1`: la columna del envío no crece con su contenido (a 390 las píldoras se salían 6 px del recuadro). */}
      <EstadoDeEnvio estado={estado} alVolver={alVolver} className="grid-cols-1">
        <form noValidate data-precarga={servicio} onSubmit={(e) => void alEnviar(e)} className="flex flex-col gap-[var(--spacing-3)]">
          <div className="grid grid-cols-1 gap-[var(--spacing-3)] escritorio:grid-cols-2">
            <div className="flex flex-col gap-[var(--spacing-1)]">
              <CampoDePildora {...comun('nombre', CAMPOS.nombre.rotulo, CAMPOS.nombre.ejemplo, MAXIMOS.nombre)} autocompletar="name" />
            </div>
            <div className="flex flex-col gap-[var(--spacing-1)]">
              <CampoDePildora {...comun('medio', CAMPOS.medio.rotulo, CAMPOS.medio.ejemplo, MAXIMOS.contacto)} autocompletar="email" requerido modoDeEntrada="email" />
              <ErrorDelCampo id={idDelError('medio')} texto={errores.medio} />
            </div>
          </div>
          <CampoDeTextoLargo {...comun('mensaje', TEXTOS_DEL_RECOMENDADOR.mensaje, CAMPOS.mensaje.ejemplo, MAXIMOS.mensaje)} renglones={4} />
          {/* [L8a] Abajo, como los pasos: «Empezar de nuevo» a la izquierda y «Enviar» (el principal) a la derecha. */}
          <div data-parte="fila-del-envio" className="mt-[var(--spacing-2)] flex flex-col-reverse items-start gap-[var(--spacing-5)] escritorio:flex-row escritorio:items-center escritorio:justify-between">
            <BotonDelRecomendador parte="empezar-de-nuevo" rotulo={TEXTOS_DEL_RECOMENDADOR.empezarDeNuevo} alTocar={alEmpezar} />
            <Cta type="submit" rotulo={enviando ? ROTULO_ENVIANDO : ROTULO_DEL_ENVIO} deshabilitado={enviando} className="shrink-0" />
          </div>
        </form>
      </EstadoDeEnvio>
      {/* El aviso de los errores de los campos (el resultado del envío lo anuncia `EstadoDeEnvio`). */}
      <p role="alert" className="sr-only">
        {aviso}
      </p>
    </div>
  )
}
