'use client'

import { animate, useMotionValue } from 'motion/react'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { entradaAbierta, retenerElScroll, suscribirALaEntrada } from '../../_lib/entrada'
import { dispararLasGrietas } from '../../_lib/escena/cristal/grietas'
import type { IdDePagina } from '../../_lib/escena/ruta/preset'
import { useTituloDeVolumen, useTituloListo, useTitulosDeVolumen } from '../../_lib/titulos3d/registro'
import { LLEGADA_DEL_TITULAR_S } from '../../_lib/titulos3d/titular'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { SELECTOR_DEL_TRAMO_DEL_TITULO } from '../pagina/atributoDeLaIntro'
import { Titular } from '../tipografia/Titular'
import { anchoDelTitulo } from './anchoDelTitulo'
import { fuentesConLaLegibilidad } from './legibilidad'
import { CAIDA_DEL_TITULO, CARA_DEL_DOM, TITULOS_CON_LETRAS, TITULO_DE_PAGINA, caeElTitulo, partesDelTitulo } from './presets'

const sinCambios = (): (() => void) => () => undefined
/** [L6] El preset fijo: la familia de `TITULO_DE_PAGINA` con el peso elegido (la liviana un paso más pesada, `legibilidad.ts`), también en el servidor. */
const PRESET = { ...TITULO_DE_PAGINA, fuentes: fuentesConLaLegibilidad(TITULO_DE_PAGINA.fuentes) }
/** [B12a.8] `?nombre=1` a `6`: uno de los títulos con letras (los de las páginas de servicio primero), para probar con los de verdad; sin ella, el de la página. */
const nombreDeLaUrl = (): string | null => TITULOS_CON_LETRAS[Number(new URLSearchParams(window.location.search).get('nombre')) - 1] ?? null

/** El texto del DOM con el título armado: apagado desde 1024 (sigue en el árbol accesible y en su lugar, como el titular del hero). */
const APAGADO = 'escritorio:opacity-0'

/** [B12a.8] T1 · El tamaño: la parte del ancho que le toca (la composición; sin ella, el 60 % del cuadro) entre su ancho en em. */
export const TAMANO_DEL_TITULO = 'calc(var(--ancho-del-titulo, 60vw) / var(--em-del-titulo))'

/** [B12a.8] El defecto, para el control positivo del arnés (`window.__defectosDeLaIntro = 'caida-tarde'`: cae con el `h1` ya subiendo); nunca la URL. */
const caidaTarde = (): boolean => (window as Window & { __defectosDeLaIntro?: unknown }).__defectosDeLaIntro === 'caida-tarde'
/** [B12a.8 · P-H33] El control: el título de noche en la tinta del entorno (`'titulo-de-tinta'`). */
const tituloDeTinta = (): boolean => typeof window !== 'undefined' && (window as Window & { __defectosDeLaIntro?: unknown }).__defectosDeLaIntro === 'titulo-de-tinta'
/** [B12a.8] T4 · El control de la perspectiva: el título pegado a la pantalla, como en B12a.6 (`'pegado-al-h1'`): no responde al mouse. */
const pegadoAlH1 = (): boolean => typeof window !== 'undefined' && (window as Window & { __defectosDeLaIntro?: unknown }).__defectosDeLaIntro === 'pegado-al-h1'

/** [B12a.8] T4 · El id de cada parte del título en volumen (lo usa también su bajada, que va en su plano: `BajadaDeLaIntro`). */
export const idDeLaParte = (id: IdDePagina, parte: 1 | 2): string => `pagina-${id}-${String(parte)}`

/**
 * [B12a.4] EL TÍTULO DE UNA PÁGINA (P-H13, P-H14; `docs/rediseno/B12a-API.md` §3) — lo renderiza `IntroDeLaPagina`. El `h1` dice el
 * título entero (las dos partes unidas con un espacio): siempre en el DOM y el visible sin WebGL, con movimiento reducido o abajo de
 * 1024. Desde 1024, con la escena, cada parte es un título de volumen con su fuente del preset (`TITULO_DE_PAGINA`):
 * va en la pantalla (sigue al `h1`, fijo arriba mientras dura la intro), llega con el gesto y el reloj del titular del hero
 * y, [B12a.8] cuando a su tramo le falta `CAIDA_DEL_TITULO.antes` para soltarse (`caeElTitulo`), cae; al volver arriba, llega de nuevo.
 * Con las dos partes armadas el texto del DOM se apaga.
 *
 * [B12a.8] T1 · EL PROTAGONISTA: en UNA línea (nunca una palabra sola en un renglón), las dos partes una al lado de la otra, y del tamaño
 * que le da la parte del ancho que pone la composición (`--ancho-del-titulo`) dividida por su ancho en em (`anchoDelTitulo.ts`): el
 * servidor ya lo pinta así. El `h1` lleva la cara de la primera parte (el espacio entre las dos es suyo, como en la cuenta).
 */
export function TituloDePagina({ id, titulo, partes: dadas, deNoche = false }: { readonly id: IdDePagina; readonly titulo: string; readonly partes?: readonly [string, string]; readonly deNoche?: boolean }): React.JSX.Element {
  const deLaBandera = useSyncExternalStore(sinCambios, nombreDeLaUrl, () => null)
  const partes = deLaBandera === null ? partesDelTitulo(titulo, dadas) : partesDelTitulo(deLaBandera)
  const preset = PRESET
  const material = useTitulosDeVolumen()
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const reducido = usePrefiereMenosMovimiento()
  const activo = material !== 'no' && escritorio && !reducido
  // [B12c] Con el preloader del sitio puesto, el título espera tapado (presencia 0) y llega cuando la entrada se abre (`_lib/entrada.ts`).
  const entrada = useSyncExternalStore(suscribirALaEntrada, entradaAbierta, () => true)
  const presencia = useMotionValue(entradaAbierta() ? 1 : 0)
  const lugar1 = useRef<HTMLSpanElement | null>(null)
  const lugar2 = useRef<HTMLSpanElement | null>(null)
  const id1 = idDeLaParte(id, 1)
  const id2 = idDeLaParte(id, 2)
  // `rearma` (como Portfolio): la llegada sigue a la presencia; el que llega una vez por carga (el hero) espera el velo de carga, que en una
  // página no existe (medido en el sitio: el título quedaba armado y sin llegar nunca, como el logo de B12a.2).
  // [B12a.8] T4 · Fijo en el mundo, como la mayoría de los títulos del home (`parteDelMouse` 0): la cámara sigue al mouse con sus topes y su
  // suavizado y el título se ve en perspectiva (pegado a la pantalla, como en B12a.6, se veía plano).
  // [B12a.8 · P-H33] De noche, en papel (la tinta sobre la sala de noche daba 0,6 % de sus píxeles en 3:1; el papel, 98,8 % a 1440). T5: sin
  // halo ni velo detrás: se lee por su volumen, su material y su luz.
  const comun = { lectura: 0, salida: null, queda: true, gesto: 'azar', colocacion: 'pantalla', rearma: true, minimoS: LLEGADA_DEL_TITULAR_S, asiento: preset.asiento, saleCayendo: preset.saleCayendo, parteDelMouse: pegadoAlH1() ? 1 : 0, material: deNoche && !tituloDeTinta() ? 'blanco' : undefined, activo } as const
  useTituloDeVolumen({ ...comun, id: id1, texto: partes[0], lugar: lugar1, llegada: presencia, fuente: preset.fuentes[0] })
  useTituloDeVolumen({ ...comun, id: id2, texto: partes[1], lugar: lugar2, llegada: presencia, fuente: preset.fuentes[1] })
  const listo1 = useTituloListo(id1)
  const listo2 = useTituloListo(id2)
  const listo = listo1 && (partes[1] === '' || listo2)

  // El gatillo de la caída: [B12a.8] lo que le falta al tramo del título para soltarse (su fondo menos el alto de lo fijo), en el layout.
  useEffect(() => {
    const tramo = lugar1.current?.closest(SELECTOR_DEL_TRAMO_DEL_TITULO) ?? null
    const fijo = tramo?.firstElementChild ?? null
    if (tramo === null || !(fijo instanceof HTMLElement) || !activo) return undefined
    // [B12c] Lo que la presencia ya dice (con la entrada cerrada, 0: abierta, vuelve a leer y llega si está arriba).
    let adentro = presencia.get() >= 0.5
    let animacion: ReturnType<typeof animate> | null = null
    const leer = (): void => {
      if (!entradaAbierta()) return
      const ahora = !caeElTitulo(tramo.getBoundingClientRect().bottom, fijo.offsetHeight, window.innerHeight, caidaTarde() ? -0.3 : undefined)
      if (ahora === adentro) return
      adentro = ahora
      animacion?.stop()
      animacion = animate(presencia, ahora ? 1 : 0, { duration: CAIDA_DEL_TITULO.s, ease: [...CAIDA_DEL_TITULO.curva] })
    }
    leer()
    window.addEventListener('scroll', leer, { passive: true })
    window.addEventListener('resize', leer)
    return () => {
      window.removeEventListener('scroll', leer)
      window.removeEventListener('resize', leer)
      animacion?.stop()
    }
  }, [activo, presencia, entrada])

  // [B12c] El scroll espera a que el título entre: con la entrada cerrada lo retiene, y lo suelta cuando ya llegó (abierta la entrada y
  // armado, lo que tarda su llegada: el reloj del titular del hero). Sin título en volumen, nada que esperar.
  const retencion = useRef<(() => void) | null>(null)
  useEffect(() => {
    if (!activo) {
      retencion.current?.()
      retencion.current = null
      return undefined
    }
    if (!entrada) {
      retencion.current ??= retenerElScroll()
      return undefined
    }
    if (retencion.current === null || !listo) return undefined
    const reloj = window.setTimeout(() => {
      retencion.current?.()
      retencion.current = null
    }, LLEGADA_DEL_TITULAR_S * 1000)
    return () => window.clearTimeout(reloj)
  }, [activo, entrada, listo])
  useEffect(() => {
    const r = retencion
    return () => {
      r.current?.()
      r.current = null
    }
  }, [])

  // [NOCTURNO B9] El cristal se agrieta cuando el título terminó de entrar: abierta la entrada y, con el título en volumen, armado, más
  // lo que tarda su llegada (el mismo reloj que suelta el scroll). Sin volumen (abajo de 1024, sin WebGL), con el `h1` a la vista y el
  // mismo reloj. Las grietas se quedan: la caída y la nueva llegada del título no las vuelven a pedir.
  useEffect(() => {
    if (!entrada || (activo && !listo)) return undefined
    const reloj = window.setTimeout(() => dispararLasGrietas('avance', id), LLEGADA_DEL_TITULAR_S * 1000)
    return () => window.clearTimeout(reloj)
  }, [activo, entrada, listo, id])

  // La cara de cada parte sale del preset: en línea, con el peso exacto de su instancia.
  const cara = (i: 0 | 1): React.CSSProperties => ({ fontFamily: CARA_DEL_DOM[preset.fuentes[i]].familia, fontWeight: CARA_DEL_DOM[preset.fuentes[i]].peso })
  const tamano = { ...cara(0), '--em-del-titulo': anchoDelTitulo(partes, preset).toFixed(4), fontSize: TAMANO_DEL_TITULO } as React.CSSProperties
  return (
    <Titular nivel="titulo-xl" como="h1" className="whitespace-nowrap" style={tamano}>
      <span ref={lugar1} data-parte="titulo-1" className={cn('inline-block', listo && APAGADO)} style={cara(0)}>
        {partes[0]}
      </span>
      {partes[1] === '' ? null : (
        <>
          {' '}
          <span ref={lugar2} data-parte="titulo-2" className={cn('inline-block', listo && APAGADO)} style={cara(1)}>
            {partes[1]}
          </span>
        </>
      )}
    </Titular>
  )
}
