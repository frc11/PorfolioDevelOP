'use client'

import { AnimatePresence, motion } from 'motion/react'
import { startTransition, useActionState, useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { Carga } from '../../_componentes/carga/Carga'
import { MarcaDeGoogle } from './CamposDelIngreso'
import { ROTULOS_DEL_INGRESO } from './contenido'
import { REPOSO, resolverElIngreso, type AccionesDelIngreso, type Resultado } from './envio'
import { ConClave, ConLink } from './FormulariosConEmail'
import { bajarElTelon } from './telon'

/**
 * [B7] EL FORMULARIO DEL LOGIN — el de cliente y admin (uno solo: `loginAction` decide adónde va cada rol), con todas sus maneras
 * de entrar: Google, la contraseña y el Magic Link. La lógica es la de siempre (`acciones.ts`); la presentación, la de los
 * formularios del sitio nuevo: píldoras redondeadas, el foco de la píldora, los errores en el campo (borde punteado y su texto) y
 * un aviso para el lector, la carga de develOP mientras procesa, el error del servidor tal como lo escribe.
 *
 * Las dos maneras con email se eligen con dos chips (los del contacto: el marcado lleno), y se cambian con un fundido corto
 * (`AnimatePresence` en `wait`). Las acciones llegan por prop: el invariante lo renderiza con unas de mentira.
 *
 * [C2 · 80] Mientras algo viaja (Google, la contraseña o el Magic Link) los chips y Google esperan, deshabilitados: cambiar de
 * pestaña con un envío en curso desmontaba el formulario que lo esperaba y dejaba la pantalla vacía.
 */

type Modo = 'clave' | 'link'
const MODOS: readonly Modo[] = ['clave', 'link']
const CURVA = [0.25, 0.46, 0.45, 0.94] as const

export function FormularioDelIngreso({
  acciones,
  alEntrar = bajarElTelon,
  modoInicial = 'clave',
}: {
  readonly acciones: AccionesDelIngreso
  /** Con la redirección al panel: el telón (el fundido simple). */
  readonly alEntrar?: () => void
  /** Para el invariante: con qué manera arranca. */
  readonly modoInicial?: Modo
}): React.JSX.Element {
  const [modo, setModo] = useState<Modo>(modoInicial)
  const [ocupado, setOcupado] = useState(false)
  return (
    <div className="flex flex-col gap-[var(--spacing-5)]">
      <ConGoogle acciones={acciones} alEntrar={alEntrar} bloqueado={ocupado} alOcupar={setOcupado} />
      <div aria-hidden="true" className="flex items-center gap-[var(--spacing-3)]">
        <span className="bg-borde h-px flex-1" />
        <span className="text-micro text-tinta-tenue leading-texto">{ROTULOS_DEL_INGRESO.separador}</span>
        <span className="bg-borde h-px flex-1" />
      </div>
      <div role="group" aria-label={ROTULOS_DEL_INGRESO.grupoDeModos} className="flex gap-[var(--spacing-2)]">
        {MODOS.map((m) => (
          <button
            key={m}
            type="button"
            data-pieza="modo-del-ingreso"
            aria-pressed={modo === m}
            disabled={ocupado}
            onClick={() => {
              if (!ocupado) setModo(m)
            }}
            className={cn(
              'text-caption min-h-[var(--spacing-12)] flex-1 rounded-[var(--radius-pastilla-s)] border px-[var(--spacing-4)] transition-colors disabled:opacity-casi',
              modo === m ? 'border-tinta bg-tinta text-fondo' : 'border-borde-fuerte hover:border-tinta',
            )}
          >
            {ROTULOS_DEL_INGRESO.modos[m]}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={modo} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: CURVA }}>
          {modo === 'clave' ? <ConClave acciones={acciones} alEntrar={alEntrar} alOcupar={setOcupado} /> : <ConLink acciones={acciones} alOcupar={setOcupado} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** «Continuar con Google»: la acción de siempre (la redirección afuera, a Google). Mientras sale, la carga en el botón. */
function ConGoogle({
  acciones,
  alEntrar,
  bloqueado,
  alOcupar,
}: {
  readonly acciones: AccionesDelIngreso
  readonly alEntrar: () => void
  /** Otro envío viaja: Google espera. */
  readonly bloqueado: boolean
  readonly alOcupar: (ocupado: boolean) => void
}): React.JSX.Element {
  const [resultado, entrar, entrando] = useActionState(async (): Promise<Resultado> => resolverElIngreso(acciones.conGoogle, alEntrar), REPOSO)
  const ocupado = entrando || resultado.estado === 'entrando'
  const error = resultado.estado === 'error' ? resultado.mensaje : ''
  useEffect(() => {
    alOcupar(ocupado)
    return () => alOcupar(false)
  }, [ocupado, alOcupar])
  return (
    <div className="flex flex-col">
      <button
        type="button"
        data-pieza="ingreso-google"
        disabled={ocupado || bloqueado}
        aria-busy={ocupado}
        onClick={() => startTransition(() => entrar())}
        className="text-caption font-medio border-borde-fuerte hover:border-tinta flex min-h-[var(--spacing-12)] w-full items-center justify-center gap-[var(--spacing-3)] rounded-[var(--radius-pastilla-s)] border px-[var(--spacing-4)] transition-colors disabled:opacity-casi"
      >
        {ocupado ? <Carga tamano="chico" etiqueta={ROTULOS_DEL_INGRESO.ingresando} /> : <MarcaDeGoogle />}
        {ROTULOS_DEL_INGRESO.google}
      </button>
      {/* La región existe desde el principio (una región que nace con su texto no siempre se anuncia). */}
      <p role="alert" className={cn('text-micro leading-texto', error !== '' && 'mt-[var(--spacing-2)]')}>
        {error}
      </p>
    </div>
  )
}
