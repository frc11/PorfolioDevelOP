'use client'

import { cn } from '@/lib/utils'

/**
 * [B1.2d B] B4/B5 · LOS CAMPOS DE LOS FORMULARIOS DEL SITIO — los del modal de contacto (`_chrome/contacto/CamposDelContacto.tsx`),
 * sacados acá para que «la tuya» del Portfolio use los mismos y no una copia: la píldora redondeada con su rótulo adentro, el padding,
 * el foco de la píldora (`data-foco="pastilla"`, `foco.css`), el error con borde punteado (el foco es liso: no se confunden) y el
 * texto de ejemplo en la tinta tenue. El modal renderiza EXACTAMENTE lo mismo que antes (s76 compara su huella).
 *
 * Sin `id`, el rótulo envuelve al campo (el modal); con `id`, además lo nombra con `for` (los instrumentos de s10 leen ese nombre).
 */

/** [EL ENCASTRE] 1E · el foco lo dibuja la píldora (`data-foco="pastilla"`, en `foco.css`): su borde, más oscuro y más grueso. */
export const CLASE_DE_LA_PILDORA = 'flex items-center gap-[var(--spacing-2)] rounded-[var(--radius-pastilla-s)] border border-borde-fuerte px-[var(--spacing-4)] py-[var(--spacing-2)]'

/** El texto largo crece con lo que se escribe, de lo mínimo a ocho renglones (las clases enteras, para el escáner de Tailwind). */
const CRECE_DESDE = { 2: '[field-sizing:content] min-h-[2lh] max-h-[8lh]', 4: '[field-sizing:content] min-h-[4lh] max-h-[8lh]' } as const

/** El texto del error de un campo. Sin `role="alert"`: el aviso es UNO, al enviar; éste lo lee el lector al llegar al campo. */
export function ErrorDelCampo({ id, texto }: { readonly id: string; readonly texto: string | undefined }): React.JSX.Element | null {
  if (texto === undefined) return null
  return (
    <p id={id} className="text-micro leading-texto">
      {texto}
    </p>
  )
}

interface CampoComun {
  readonly rotulo: string
  readonly nombre: string
  readonly valor: string
  readonly alEscribir: (valor: string) => void
  readonly ejemplo: string
  readonly maximo: number
  /** El id del error (para `aria-describedby`), o `null` si el campo no tiene error que mostrar. */
  readonly idDelError: string | null
  readonly conError: boolean
  readonly id?: string
  readonly alEnfocar?: (e: React.FocusEvent<HTMLElement>) => void
  /** [C2 · 40] La letra del rótulo y del campo. Por defecto `text-caption` (el modal, igual que siempre). */
  readonly claseDelTexto?: string
}

/** La píldora de una línea: el rótulo y el campo, adentro. */
export function CampoDePildora({
  rotulo, nombre, valor, alEscribir, ejemplo, maximo, idDelError, conError, id, alEnfocar, claseDelTexto = 'text-caption',
  requerido = false, compacto = false, autocompletar, modoDeEntrada,
}: CampoComun & {
  readonly requerido?: boolean
  readonly compacto?: boolean
  readonly autocompletar: string
  readonly modoDeEntrada?: 'email'
}): React.JSX.Element {
  return (
    <label data-foco="pastilla" htmlFor={id} className={cn(CLASE_DE_LA_PILDORA, compacto && 'py-[var(--spacing-1)]', conError && 'border-tinta border-dashed')}>
      <span className={cn(claseDelTexto, 'shrink-0 font-medio')}>{rotulo}</span>
      <input
        id={id}
        name={nombre}
        type="text"
        inputMode={modoDeEntrada}
        autoComplete={autocompletar}
        required={requerido}
        maxLength={maximo}
        value={valor}
        onChange={(e) => alEscribir(e.target.value)}
        onFocus={alEnfocar}
        placeholder={ejemplo}
        aria-invalid={conError || undefined}
        aria-describedby={conError && idDelError !== null ? idDelError : undefined}
        className={cn(claseDelTexto, 'placeholder:text-tinta-tenue min-w-0 flex-1 bg-transparent')}
      />
    </label>
  )
}

/**
 * El texto largo: la píldora de esquinas suaves, con el rótulo arriba en el teléfono angosto, que crece con lo que se escribe
 * (`field-sizing`) desde lo mínimo hasta ocho renglones.
 */
export function CampoDeTextoLargo({
  rotulo, nombre, valor, alEscribir, ejemplo, maximo, idDelError, conError, id, alEnfocar, claseDelTexto = 'text-caption',
  compacto = false, renglones = 2,
}: CampoComun & { readonly compacto?: boolean; readonly renglones?: 2 | 4 }): React.JSX.Element {
  return (
    <label data-foco="pastilla" htmlFor={id} className={cn(CLASE_DE_LA_PILDORA, 'items-start rounded-[var(--radius-fuerte)] max-movil:flex-col max-movil:items-stretch', compacto ? 'py-[var(--spacing-2)]' : 'py-[var(--spacing-3)]', conError && 'border-tinta border-dashed')}>
      <span className={cn(claseDelTexto, 'shrink-0 font-medio')}>{rotulo}</span>
      <textarea
        id={id}
        name={nombre}
        rows={compacto ? renglones : renglones + 1}
        maxLength={maximo}
        value={valor}
        onChange={(e) => alEscribir(e.target.value)}
        onFocus={alEnfocar}
        placeholder={ejemplo}
        aria-invalid={conError || undefined}
        aria-describedby={conError && idDelError !== null ? idDelError : undefined}
        className={cn(claseDelTexto, `placeholder:text-tinta-tenue min-w-0 flex-1 resize-none bg-transparent ${CRECE_DESDE[renglones]}`)}
      />
    </label>
  )
}
