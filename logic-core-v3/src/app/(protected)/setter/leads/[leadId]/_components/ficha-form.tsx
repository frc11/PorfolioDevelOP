'use client'

import { useMemo, useRef, useState, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button, Field, Input, Select, TextArea } from '@/components/ui'
import { EnlaceFichaSchema, FichaSchema, type Ficha } from '@/lib/leados/contracts'
import {
  BLOQUES_DE_FICHA,
  bloqueCompleto,
  bloqueInicial,
  bloqueSiguiente,
  bloqueTieneContenido,
  camposDelBloque,
  deudaDelBloque,
  valoresDeFicha,
  type BloqueFichaId,
  type BloqueId,
  type CampoFicha,
} from '@/lib/leados/ficha-bloques'
import { campoFichaFlojo } from '@/lib/leados/ficha-calidad'
import { fichaFaltantes } from '@/lib/leados/flow'
import { GUIA_FICHA } from '@/lib/leados/guidance-content'
import { useAutosave } from '@/lib/use-autosave'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { guardarFicha } from '@/app/(protected)/setter/_actions/dossier.actions'
import { AutosaveStatus } from '@/app/(protected)/setter/_components/autosave-status'
import {
  BloquesSecuenciales,
  type BloqueSecuencial,
  type EstadoBloque,
} from '@/app/(protected)/setter/_components/bloques-secuenciales'
import { CampoMejora } from '@/app/(protected)/setter/_components/campo-mejora'

/**
 * El REGISTRO de la ficha: campos + nudges de calidad + gate visible con
 * faltantes + guardar con autosave y guardia. Un solo consumidor (M1, la
 * pantalla fusionada de ficha+veredicto), y un solo camino de escritura: misma
 * action (`guardarFicha`, ownership adentro, jamás transiciona stage), mismos
 * hooks (`useAutosave` + `useUnsavedGuard`), mismos mensajes (`fichaFaltantes` +
 * `GUIA_FICHA`).
 *
 * ── P16 · Los mismos campos, ordenados POR FUENTE ────────────────────────────
 * Lo único que cambió es el ORDEN y el AGRUPAMIENTO. Ni un campo se agregó, se
 * sacó ni se renombró; el payload que sale (`aPayload`) es idéntico y el gate
 * (`fichaFaltantes`) sigue siendo el mismo y sigue viviendo afuera.
 *
 * Por qué. El formulario pedía las observaciones en un orden y el material
 * («material para construir la demo», al final) en otro, así que el setter
 * recorría Instagram, Google y la web dos veces: una para anotar y otra para
 * bajar el logo y las fotos. Ahora cada fuente es un bloque con sus dos mitades
 * juntas —lo que se mira y lo que se lleva— y se visita una sola vez. El censo
 * de qué campo sale de dónde vive en `ficha-bloques.ts`, con sus tres casos
 * ambiguos anotados; las palabras, en `GUIA_FICHA.grupos`.
 *
 * El bloque siguiente se abre SOLO cuando el actual queda completo (no hay botón
 * de «siguiente»: un click que no aporta información es un click que sobra), y
 * cualquiera se abre a mano desde su cabecera — sin eso, un negocio sin web
 * quedaría en un callejón.
 */

/**
 * El estado del formulario, derivado del censo: una clave por campo de la ficha,
 * ni una más. Que sea un mapeo sobre `CampoFicha` es lo que hace que agregar un
 * campo acá sin asignarle bloque —o asignarle bloque a uno que no existe— no
 * compile. El chequeo lo hace el compilador, no una lista paralela.
 */
type FichaFormState = {
  [Campo in CampoFicha]: Campo extends 'igManejadoPor'
    ? '' | 'DUENO' | 'CM' | 'NO_SABE'
    : string
}

/** Los campos del material que son DIRECCIONES (se validan como tales). */
const CAMPOS_ENLACE = ['resenasUrl', 'imagenesUrl', 'otraRedUrl'] as const
type CampoEnlace = (typeof CAMPOS_ENLACE)[number]

/** Los campos que se escriben en un `<textarea>`, con el alto que ya tenían. */
const FILAS_TEXTAREA: Partial<Record<CampoFicha, number>> = {
  identidadNotas: 3,
  resenas: 5,
  comoSePresenta: 3,
  queVende: 3,
  otros: 3,
}

function estadoInicial(ficha: Ficha | null): FichaFormState {
  // Un solo mapeo ficha→valores, compartido con la derivación del bloque
  // abierto; acá solo se re-estrecha el enum del selector.
  return {
    ...valoresDeFicha(ficha),
    igManejadoPor: ficha?.identidad?.igManejadoPor ?? '',
  }
}

function aObjeto(state: FichaFormState) {
  return {
    identidad: {
      notas: state.identidadNotas,
      igManejadoPor: state.igManejadoPor === '' ? undefined : state.igManejadoPor,
    },
    presenciaDigital: state.presenciaDigital,
    resenas: state.resenas,
    contenidoReal: state.contenidoReal,
    senalesOperativas: state.senalesOperativas,
    materiales: {
      resenasUrl: state.resenasUrl,
      imagenesUrl: state.imagenesUrl,
      otraRedUrl: state.otraRedUrl,
      queVende: state.queVende,
      comoSePresenta: state.comoSePresenta,
    },
    otros: state.otros,
  }
}

/**
 * Validación de las direcciones contra el MISMO schema que persiste
 * (`EnlaceFichaSchema`), para que el mensaje del formulario y el del servidor no
 * puedan divergir. Vacío es válido: todo el material es opcional.
 */
function erroresDeEnlace(state: FichaFormState): Partial<Record<CampoEnlace, string>> {
  const errores: Partial<Record<CampoEnlace, string>> = {}
  for (const campo of CAMPOS_ENLACE) {
    const parsed = EnlaceFichaSchema.safeParse(state[campo])
    if (!parsed.success) {
      errores[campo] = parsed.error.issues[0]?.message ?? 'Link inválido'
    }
  }
  return errores
}

function aPayload(state: FichaFormState): Ficha {
  // FichaSchema convierte strings vacíos en undefined — el payload queda limpio
  const parsed = FichaSchema.safeParse(aObjeto(state))
  if (parsed.success) {
    return parsed.data
  }
  // Una dirección a medio pegar NO puede tirar abajo el autosave ni el aviso de
  // faltantes (que re-arma el payload en cada render). Se re-arma sin los
  // enlaces — el formulario ya los marca en rojo y bloquea el guardado
  // explícito — para que el resto del trabajo escrito se siga guardando solo.
  const sinEnlaces: FichaFormState = { ...state }
  for (const campo of CAMPOS_ENLACE) {
    sinEnlaces[campo] = ''
  }
  return FichaSchema.parse(aObjeto(sinEnlaces))
}

type FichaFormProps = {
  leadId: string
  ficha: Ficha | null
  /**
   * El CIERRE del recorrido: el veredicto, que es el último bloque del mismo
   * acordeón. Entra como slot porque quién decide cuál bloque está abierto es
   * este componente —es el único que ve lo que hay escrito en la ficha— y el
   * veredicto tiene que poder ser ese bloque abierto cuando ya no falta nada.
   * Se renderiza en el server y viaja como nodo: acá no se le toca nada.
   */
  cierre?: { titulo: string; contenido: ReactNode }
}

export function FichaForm({ leadId, ficha, cierre }: FichaFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<FichaFormState>(() => estadoInicial(ficha))
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  // Nudges de CALIDAD por campo: true = "este input quedó flojo, mostrá cómo
  // mejorarlo". Estado SEPARADO del form a propósito — no toca el autosave (que
  // observa `form`) ni los gates. Solo pinta el mensaje de `CampoMejora`.
  const [nudges, setNudges] = useState<Partial<Record<CampoFicha, boolean>>>({})
  // Espejo SÍNCRONO de los nudges. Hace falta porque el `onBlur` del campo (que
  // evalúa la calidad) y el `focusout` del bloque (que decide el avance) son el
  // MISMO evento: leyendo el state, el avance vería el valor viejo y se llevaría
  // por delante el mensaje que se acaba de decidir mostrar. Se escribe solo desde
  // manejadores de evento, nunca durante el render.
  const nudgesRef = useRef<Partial<Record<CampoFicha, boolean>>>({})
  // Una dirección recién se marca en rojo cuando el setter SALE del campo
  // (mismo criterio que los nudges) — nadie quiere ver un error mientras tipea.
  const [enlacesTocados, setEnlacesTocados] = useState<Partial<Record<CampoEnlace, boolean>>>({})
  /**
   * El bloque desplegado. Arranca DERIVADO de lo que hay escrito (el primero
   * incompleto; el cierre si no falta nada) y después lo mueven dos cosas: el
   * click en una cabecera y el avance automático al salir de un bloque
   * completo. No se persiste en ningún lado: la ficha ya guarda sola, así que al
   * volver la derivación reconstruye el mismo lugar sin inventar un dato nuevo.
   */
  const [abierto, setAbierto] = useState<BloqueId>(() => bloqueInicial(estadoInicial(ficha)))

  // Autosave del trabajo escrito: reusa `guardarFicha` (parcial-safe, NUNCA
  // transiciona de stage, ownership por `assignedToId` dentro de la action).
  const autosave = useAutosave<FichaFormState>({
    value: form,
    enabled: true,
    save: (estado) => guardarFicha(leadId, aPayload(estado)),
  })
  useUnsavedGuard(autosave.isDirty)

  const faltantesEnVivo = useMemo(() => fichaFaltantes(aPayload(form)), [form])
  const erroresEnlace = useMemo(() => erroresDeEnlace(form), [form])
  const hayEnlaceInvalido = Object.keys(erroresEnlace).length > 0

  const set = <Campo extends keyof FichaFormState>(campo: Campo, valor: FichaFormState[Campo]) => {
    setForm((actual) => ({ ...actual, [campo]: valor }))
    // Apenas edita, el nudge desaparece: nunca molesta MIENTRAS tipea (se
    // re-evalúa solo al salir del campo, en `evaluarCalidad`).
    nudgesRef.current = { ...nudgesRef.current, [campo]: false }
    setNudges((actual) => (actual[campo] ? { ...actual, [campo]: false } : actual))
    // Mismo criterio para el rojo de las direcciones: se apaga al corregir y
    // vuelve a evaluarse al salir del campo.
    setEnlacesTocados((actual) =>
      actual[campo as CampoEnlace] ? { ...actual, [campo]: false } : actual,
    )
  }

  /** El error de una dirección solo se pinta si el setter ya salió del campo. */
  const errorVisibleDe = (campo: CampoEnlace): string | undefined =>
    enlacesTocados[campo] ? erroresEnlace[campo] : undefined

  // Validación de CALIDAD al SALIR del campo (onBlur). ADVISORY: orienta cómo
  // enriquecer un input flojo; NO gatea el avance ni el submit (ver
  // `ficha-calidad.ts`). Lee el valor del evento — siempre el más fresco.
  const evaluarCalidad = (campo: CampoFicha, valor: string) => {
    const flojo = campoFichaFlojo(valor)
    nudgesRef.current = { ...nudgesRef.current, [campo]: flojo }
    setNudges((actual) => ({ ...actual, [campo]: flojo }))
  }

  /**
   * El avance por completitud, y la única regla que lo dispara: el foco salió
   * del bloque y el bloque quedó completo. Al salir de uno incompleto no pasa
   * nada — nunca arrastra al setter de vuelta ni le cierra lo que abrió a mano.
   */
  const salirDelBloque = (id: string) => {
    if (id !== abierto || id === 'cierre') return
    if (!bloqueCompleto(id as BloqueFichaId, form)) return
    // Un bloque con una sugerencia de calidad recién abierta NO avanza todavía:
    // el nudge se dispara al salir del campo, que es el mismo momento en que el
    // bloque puede quedar completo. Si avanzara, el bloque se plegaría con el
    // mensaje adentro y el setter nunca leería la sugerencia que acaba de pedir
    // al terminar de escribir. Medido: «tiene Instagram» en presencia digital
    // completaba el balance y se llevaba puesto el «Eso queda corto» en el mismo
    // frame.
    //
    // 🔴 Esto NO convierte el nudge en un gate (ver el límite duro de
    // `ficha-calidad.ts`): no habilita ni deshabilita ningún submit, no dispara
    // ninguna transición y no bloquea nada — el bloque siguiente sigue a un click
    // de distancia, y el veredicto se registra igual. Lo único que hace es no
    // ROBARLE la pantalla a un mensaje advisory en el instante en que aparece.
    if (camposDelBloque(id as BloqueFichaId).some((campo) => nudgesRef.current[campo])) return
    const siguiente = bloqueSiguiente(id as BloqueFichaId, form)
    if (siguiente && siguiente !== id) setAbierto(siguiente)
  }

  const guardar = () => {
    setServerError(null)
    // Validación de cliente antes de mandar (el servidor la repite en
    // `guardarFicha`). Se marcan TODAS las direcciones para que el rojo señale
    // cuál hay que arreglar, aunque el setter no haya pasado por el campo.
    if (hayEnlaceInvalido) {
      setEnlacesTocados(Object.fromEntries(CAMPOS_ENLACE.map((campo) => [campo, true])))
      const mensaje =
        'Revisá los links marcados: pegá la dirección completa (https://…) o dejalos vacíos.'
      setServerError(mensaje)
      toast.error(mensaje)
      return
    }
    startTransition(async () => {
      const result = await guardarFicha(leadId, aPayload(form))
      if (!result.success) {
        setServerError(result.error)
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.faltantes.length === 0
          ? 'Ficha guardada — ya tenés señal para dejar tu veredicto'
          : 'Borrador guardado — podés volver cuando quieras',
      )
      autosave.markSaved()
      router.refresh()
    })
  }

  // ── Los campos, dibujados desde el censo ───────────────────────────────────

  /** Un campo de texto: mismos label/hint/ejemplo y mismo nudge que siempre. */
  const campoTexto = (campo: Exclude<CampoFicha, 'igManejadoPor' | CampoEnlace>) => {
    const guia = GUIA_FICHA.campos[campo]
    // El nudge de calidad existe solo donde la guía trae un `mejora` — igual que
    // antes: el material (que es opcional) nunca tuvo nudge.
    const mejora = 'mejora' in guia ? guia.mejora : undefined
    return (
      <Field key={campo} label={guia.label} hint={guia.hint}>
        <TextArea
          value={form[campo]}
          onChange={(event) => set(campo, event.target.value)}
          onBlur={mejora ? (event) => evaluarCalidad(campo, event.target.value) : undefined}
          placeholder={'ejemplo' in guia ? guia.ejemplo : undefined}
          rows={FILAS_TEXTAREA[campo]}
        />
        {mejora && nudges[campo] && <CampoMejora mensaje={mejora} />}
      </Field>
    )
  }

  /** Una dirección: mismo schema, mismo rojo diferido al blur. */
  const campoEnlace = (campo: CampoEnlace) => {
    const guia = GUIA_FICHA.campos[campo]
    return (
      <Field key={campo} label={guia.label} hint={guia.hint} error={errorVisibleDe(campo)}>
        <Input
          type="url"
          inputMode="url"
          value={form[campo]}
          onChange={(event) => set(campo, event.target.value)}
          onBlur={() => setEnlacesTocados((actual) => ({ ...actual, [campo]: true }))}
          placeholder={guia.ejemplo}
        />
      </Field>
    )
  }

  const campoIgManejadoPor = () => (
    <Field
      key="igManejadoPor"
      label={GUIA_FICHA.campos.igManejadoPor.label}
      hint={GUIA_FICHA.campos.igManejadoPor.hint}
    >
      <Select
        value={form.igManejadoPor}
        onChange={(event) =>
          set('igManejadoPor', event.target.value as FichaFormState['igManejadoPor'])
        }
        options={[...GUIA_FICHA.campos.igManejadoPor.opciones]}
        aria-label="Quién maneja el Instagram"
      />
    </Field>
  )

  const dibujarCampo = (campo: CampoFicha): ReactNode => {
    if (campo === 'igManejadoPor') return campoIgManejadoPor()
    if ((CAMPOS_ENLACE as readonly string[]).includes(campo)) return campoEnlace(campo as CampoEnlace)
    return campoTexto(campo as Exclude<CampoFicha, 'igManejadoPor' | CampoEnlace>)
  }

  // ── El estado de cada bloque, en una línea ─────────────────────────────────

  const textos = GUIA_FICHA.validacion.bloque

  const estadoDe = (bloque: BloqueFichaId): EstadoBloque => {
    const deuda = deudaDelBloque(bloque, form)
    if (deuda.length > 0) {
      return {
        tono: 'pendiente',
        texto: textos.faltaPrefijo + deuda.map((id) => textos.requisitos[id]).join(' · '),
      }
    }
    // Sin deuda: completo si tiene algo escrito. Si no, es un bloque que se
    // puede saltear — y decirlo es lo que evita que el setter crea que tiene que
    // llenarlo para poder seguir (el negocio sin web es el caso).
    return bloqueTieneContenido(bloque, form)
      ? { tono: 'completo', texto: textos.completo }
      : { tono: 'opcional', texto: textos.opcional }
  }

  const bloques: BloqueSecuencial[] = BLOQUES_DE_FICHA.map((bloque, indice) => {
    const grupo = GUIA_FICHA.grupos[bloque]
    return {
      id: bloque,
      titulo: `${indice + 1} · ${grupo.titulo}`,
      estado: estadoDe(bloque),
      contenido: (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-zinc-400">{grupo.intro}</p>
          {camposDelBloque(bloque).map(dibujarCampo)}
          {'material' in grupo && grupo.material && (
            <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs leading-relaxed text-zinc-400">
              {grupo.material}
            </p>
          )}
        </div>
      ),
    }
  })

  if (cierre) {
    bloques.push({
      id: 'cierre',
      titulo: `${BLOQUES_DE_FICHA.length + 1} · ${cierre.titulo}`,
      // El cierre NO se gatea acá: el estado solo ANTICIPA lo que va a decir el
      // gate real (server-side, en `registrarEvaluacion`). El bloque se abre
      // igual y el formulario del veredicto está entero — quien decide si entra
      // sigue siendo el servidor.
      estado:
        faltantesEnVivo.length > 0
          ? { tono: 'pendiente', texto: textos.cierrePendiente }
          : { tono: 'opcional', texto: textos.cierreListo },
      contenido: cierre.contenido,
    })
  }

  // Si el bloque abierto no existe (el cierre no se montó porque la ficha no
  // trae slot), se cae al último que sí — nunca queda todo plegado.
  const abiertoEfectivo = bloques.some((bloque) => bloque.id === abierto)
    ? abierto
    : (bloques[bloques.length - 1]?.id ?? '')

  return (
    <div className="space-y-5">
      <BloquesSecuenciales
        aria-label="La ficha, por fuente"
        bloques={bloques}
        abierto={abiertoEfectivo}
        onAbrir={(id) => setAbierto(id as BloqueId)}
        onSalirDelBloque={salirDelBloque}
      />

      {faltantesEnVivo.length > 0 ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-3">
          <p className="text-xs font-semibold text-amber-300">
            {GUIA_FICHA.validacion.pendienteTitulo}
          </p>
          <ul className="mt-1.5 space-y-1">
            {faltantesEnVivo.map((faltante) => (
              <li key={faltante} className="text-xs leading-relaxed text-amber-200/80">
                · {faltante}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3 text-xs font-medium text-emerald-300">
          {GUIA_FICHA.validacion.completo}
        </p>
      )}

      {serverError && (
        <p role="alert" className="text-xs text-red-400">
          {serverError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          onClick={guardar}
          loading={isPending}
          icon={<Save size={15} strokeWidth={1.5} />}
        >
          Guardar ficha
        </Button>
        <AutosaveStatus phase={autosave.phase} isDirty={autosave.isDirty} busy={isPending} />
        {/* P23 — la promesa NOMBRA su sujeto. Esta fila vive debajo del acordeón
            entero, y el último bloque es el veredicto, que NO tiene autosave: sin
            el sujeto, «se guarda solo» se leía como que también lo cubría a él, y
            el setter perdía su juicio al salir. El chip de estado de al lado es
            del mismo sujeto (lee `autosave.isDirty` de la ficha). Lo que le pasa
            al veredicto lo dice el veredicto, en su propio bloque. */}
        <p className="text-[11px] text-zinc-600">
          La ficha se guarda sola mientras escribís. Podés cerrar y seguir después.
        </p>
      </div>
    </div>
  )
}
