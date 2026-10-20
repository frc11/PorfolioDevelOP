'use client'

import { animate, useMotionValue } from 'motion/react'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { avanceDeLaIntro } from '../../_lib/escena/ruta/pistaDeLaIntro'
import type { IdDePagina } from '../../_lib/escena/ruta/preset'
import { useTituloDeVolumen, useTituloListo, useTitulosDeVolumen } from '../../_lib/titulos3d/registro'
import { LLEGADA_DEL_TITULAR_S } from '../../_lib/titulos3d/titular'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { SELECTOR_DE_LA_INTRO } from '../pagina/atributoDeLaIntro'
import { Titular } from '../tipografia/Titular'
import { CAIDA_DEL_TITULO, CARA_DEL_DOM, TITULO_DE_PAGINA, combinacionDeLaBandera, partesDelTitulo, type PresetDelTitulo } from './presets'

const sinCambios = (): (() => void) => () => undefined
/** `?titulo=1|2|3`, leída después de hidratar (el servidor pinta la de siempre). */
const combinacionDeLaPagina = (): PresetDelTitulo => combinacionDeLaBandera(new URLSearchParams(window.location.search).get('titulo'))

/** El texto del DOM con el título armado: apagado desde 1024 (sigue en el árbol accesible y en su lugar, como el titular del hero). */
const APAGADO = 'escritorio:opacity-0'

/**
 * [B12a.4] EL TÍTULO DE UNA PÁGINA (P-H13, P-H14; `docs/rediseno/B12a-API.md` §3) — lo renderiza `IntroDeLaPagina`. El `h1` dice el
 * título entero (las dos partes unidas con un espacio): siempre en el DOM y el visible sin WebGL, con movimiento reducido o abajo de
 * 1024. Desde 1024, con la escena, cada parte es un título de volumen con su fuente del preset (`TITULO_DE_PAGINA`, o la de
 * `?titulo=`): va en la pantalla (sigue al `h1`, fijo arriba mientras dura la intro), llega con el gesto y el reloj del titular del hero
 * y, cuando la intro pasa `CAIDA_DEL_TITULO.avance` (el papel ya entró), cae; al volver arriba, llega de nuevo. Con las dos partes
 * armadas el texto del DOM se apaga.
 */
export function TituloDePagina({ id, titulo, partes: dadas }: { readonly id: IdDePagina; readonly titulo: string; readonly partes?: readonly [string, string] }): React.JSX.Element {
  const partes = partesDelTitulo(titulo, dadas)
  const preset = useSyncExternalStore(sinCambios, combinacionDeLaPagina, () => TITULO_DE_PAGINA)
  const material = useTitulosDeVolumen()
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const reducido = usePrefiereMenosMovimiento()
  const activo = material !== 'no' && escritorio && !reducido
  const presencia = useMotionValue(1)
  const lugar1 = useRef<HTMLSpanElement | null>(null)
  const lugar2 = useRef<HTMLSpanElement | null>(null)
  const id1 = `pagina-${id}-1`
  const id2 = `pagina-${id}-2`
  // `rearma` (como Portfolio): la llegada sigue a la presencia; el que llega una vez por carga (el hero) espera el velo de carga, que en una
  // página no existe (medido en el sitio: el título quedaba armado y sin llegar nunca, como el logo de B12a.2).
  // `parteDelMouse` entero: en la página la cámara sigue al mouse, y el título va pegado a su `h1` (sin él, se corría con el mouse: medido).
  const comun = { lectura: 0, salida: null, queda: true, gesto: 'azar', colocacion: 'pantalla', rearma: true, minimoS: LLEGADA_DEL_TITULAR_S, asiento: preset.asiento, saleCayendo: preset.saleCayendo, parteDelMouse: 1, activo } as const
  useTituloDeVolumen({ ...comun, id: id1, texto: partes[0], lugar: lugar1, llegada: presencia, fuente: preset.fuentes[0] })
  useTituloDeVolumen({ ...comun, id: id2, texto: partes[1], lugar: lugar2, llegada: presencia, fuente: preset.fuentes[1] })
  const listo1 = useTituloListo(id1)
  const listo2 = useTituloListo(id2)
  const listo = listo1 && (partes[1] === '' || listo2)

  // El gatillo de la caída: el avance de la intro, medido en el layout de su bloque (el mismo que mide la escena).
  useEffect(() => {
    const bloque = lugar1.current?.closest(SELECTOR_DE_LA_INTRO) ?? null
    if (bloque === null || !activo) return undefined
    let adentro = true
    let animacion: ReturnType<typeof animate> | null = null
    const leer = (): void => {
      const arriba = bloque.getBoundingClientRect().top + window.scrollY
      const ahora = avanceDeLaIntro(arriba, window.scrollY, window.innerHeight) < CAIDA_DEL_TITULO.avance
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
  }, [activo, presencia])

  // La cara de cada parte sale de la combinación (que se elige en el cliente): en línea, con el peso exacto de su instancia.
  const cara = (i: 0 | 1): React.CSSProperties => ({ fontFamily: CARA_DEL_DOM[preset.fuentes[i]].familia, fontWeight: CARA_DEL_DOM[preset.fuentes[i]].peso })
  return (
    <Titular nivel="titulo-xl" como="h1" className="flex flex-col items-start">
      <span ref={lugar1} data-parte="titulo-1" className={cn('block', listo && APAGADO)} style={cara(0)}>
        {partes[0]}
      </span>
      {partes[1] === '' ? null : (
        <>
          {' '}
          <span ref={lugar2} data-parte="titulo-2" className={cn('text-fluido-titulo-l block', listo && APAGADO)} style={cara(1)}>
            {partes[1]}
          </span>
        </>
      )}
    </Titular>
  )
}
