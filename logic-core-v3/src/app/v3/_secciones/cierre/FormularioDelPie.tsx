import { BloqueSolido } from '../../_componentes/volumen/BloqueSolido'
import { HREF_DEL_MAIL, MAIL } from './contacto'
import { CONTACTO_DEL_FORMULARIO } from './contenido'

/**
 * [RETOQUE 3D] 3I · EL CONTACTO DEL PIE — un formulario simple (nombre, mail y mensaje) con campos de verdad: se
 * enfocan, se escriben y los anuncia el lector. TODAVÍA NO ENVÍA: el botón está deshabilitado y lo dice un aviso honesto
 * (como el newsletter de Tu panel), con el mail como salida mientras tanto; el envío (y su validación del lado del
 * servidor) se configura en la etapa siguiente. Es el destino de todo lo que lleva a contacto (`#contacto`: el viaje lo
 * resuelve a su sección y le da el foco al llegar). El borde, el límite de componente del sistema (3:1 de día y de noche).
 * [CIERRE RETOQUE 3D] D5: cada campo y el botón son un bloque sólido (`BloqueSolido`): desde 1025 el borde lo pone su tapa.
 */
const CAMPO = 'block w-full rounded-[var(--radius-sutil)] border border-borde-fuerte escritorio:border-transparent bg-transparent px-[var(--spacing-3)] py-[var(--spacing-2)] text-cuerpo leading-texto tracking-texto placeholder:opacity-60'
const ROTULO = 'text-micro leading-micro tracking-micro font-medio uppercase'

export function FormularioDelPie(): React.JSX.Element {
  const c = CONTACTO_DEL_FORMULARIO
  return (
    <form id="contacto" tabIndex={-1} data-pieza="contacto-del-pie" aria-label={c.nombreAccesible} className="flex flex-col gap-[var(--spacing-3)]">
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <label htmlFor="contacto-nombre" className={ROTULO}>
          {c.nombre}
        </label>
        <BloqueSolido className="block w-full">
          <input id="contacto-nombre" name="nombre" type="text" autoComplete="name" required className={CAMPO} />
        </BloqueSolido>
      </div>
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <label htmlFor="contacto-mail" className={ROTULO}>
          {c.mail}
        </label>
        <BloqueSolido className="block w-full">
          <input id="contacto-mail" name="mail" type="email" autoComplete="email" required placeholder={c.ejemploDeMail} className={CAMPO} />
        </BloqueSolido>
      </div>
      <div className="flex flex-col gap-[var(--spacing-1)]">
        <label htmlFor="contacto-mensaje" className={ROTULO}>
          {c.mensaje}
        </label>
        <BloqueSolido className="block w-full">
          <textarea id="contacto-mensaje" name="mensaje" rows={3} required className={`${CAMPO} resize-none`} />
        </BloqueSolido>
      </div>
      <BloqueSolido className="self-start">
        <button type="submit" disabled aria-describedby="contacto-aviso" className="block rounded-[var(--radius-pastilla-s)] border border-borde-fuerte escritorio:border-transparent px-[var(--spacing-5)] py-[var(--spacing-2)] text-cuerpo font-semi disabled:cursor-not-allowed disabled:opacity-60">
          {c.enviar}
        </button>
      </BloqueSolido>
      <p id="contacto-aviso" className="text-micro leading-micro tracking-micro">
        {c.aviso}{' '}
        <BloqueSolido>
          <a href={HREF_DEL_MAIL} className="block underline decoration-1 underline-offset-4 escritorio:px-[var(--spacing-2)] escritorio:py-[var(--spacing-1)]">
            {MAIL}
          </a>
        </BloqueSolido>
        .
      </p>
    </form>
  )
}
