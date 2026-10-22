'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import * as THREE from 'three'

import { REGISTRO_DE_VARIANTES, type IdDeVariante } from '../../../_variantes/registro'
import { hayPrimerCuadro } from '../../carga'
import type { NivelDeCalidad } from '../calidad'
import { ENERGIA_DE_LA_RUTA } from '../energia/energiaDeLaRuta'
import { hayBanco } from '../entorno'
import { LUZ_DE_ABAJO_EN_VIVO } from '../final/luzDeAbajo'

import { RESOLUCION_DEL_CIERRE, cierreManda } from './cierreDeLaPagina'
import { RANURA_EN_VIVO, VARIANTE_DIBUJADA, claveDeLaVariante, escenaLista } from './listaDeLaRuta'
import { AVANCE_DE_LA_INTRO } from './pistaDeLaIntro'
import { presetActual, suscribirseAlPreset } from './preset'
import { atenderLaSalida, pedirLaSalidaDeLaVariante } from './salidaDeLaVariante'
import { COMPOSICION_DE_LA_LUZ, SALIDA_DE_LA_VARIANTE_MS, type ComponenteDeVariante } from './variante'

/** Hasta dónde llega la luz de abajo prestada (u): más allá del piso (radio 45 en plena, 34 en compacta), así lo cubre entero. */
const RADIO_DE_LA_LUZ_PRESTADA = 100

/**
 * El claro del acento de un servicio, leído de su token (`--color-acento-<id>-claro`); sin acento, blanco. Una vez por montaje.
 * [NOCTURNO B9] Exportado: lo usan también las grietas del cristal (la luz con el acento de la página).
 */
export function acentoDelToken(acento: string | null): THREE.Color {
  const color = new THREE.Color(1, 1, 1)
  if (acento === null || typeof document === 'undefined') return color
  const valor = getComputedStyle(document.documentElement).getPropertyValue(`--color-acento-${acento}-claro`).trim()
  if (valor !== '') color.setStyle(valor)
  return color
}

/** La variante montada: de qué página es (el id del preset) y su acento, fijado al cargarla (al salir no cambia, aunque la ruta sí). */
type Montada = { readonly id: IdDeVariante; readonly pagina: string; readonly Componente: ComponenteDeVariante; readonly acento: THREE.Color }
/** Una salida en curso: quién la pidió (la navegación, con la señal, o la ruta que cambió sin pedirla) y si ya llegó a la composición. */
type Salida = { readonly motivo: 'senal' | 'ruta'; hecha: boolean; promesa: Promise<void> }

type EstadoDeLaRanura = { readonly id: string | null; readonly saliendo: boolean; readonly duena: boolean; readonly energia: number; readonly color: string; readonly geometrias: number; readonly texturas: number; readonly salidaMs: number }
/**
 * Sólo con banco: el estado de la ranura; `__ranuraSinVariante` (la misma página sin montar la variante, para medir su costo) y
 * `__ranuraSinLaSenal` (el control de la salida: la señal se ignora y la variante sale recién cuando cambia la ruta, como antes) y
 * [B12a.8] `__ranuraSinBfcache` (el control de P-H35: al volver del bfcache la salida no se olvida) y [B13] `__cierreSinResolucion` (el
 * control de la resolución: la variante recibe siempre 0 y el piso no se calma antes del pie).
 */
type VentanaDelBanco = Window & { __ranuraDelBanco?: () => EstadoDeLaRanura; __pedirLaSalidaDelBanco?: () => Promise<void>; __ranuraSinVariante?: boolean; __ranuraSinLaSenal?: boolean; __ranuraSinBfcache?: boolean; __cierreSinResolucion?: boolean }

/** [B13] La resolución del control del banco: siempre 0. */
const SIN_RESOLUCION: Readonly<{ current: number }> = { current: 0 }

/**
 * [T0] La marca de que la variante DIBUJÓ: su cuadro corre después del de la variante (se suscribe después), así la clave queda anotada
 * con la luz de la variante ya escrita en ese mismo cuadro. Al desmontarse, la borra si es la suya.
 */
function MarcaDeDibujo({ clave }: { readonly clave: string }): null {
  useFrame(() => {
    VARIANTE_DIBUJADA.clave = clave
  })
  useEffect(
    () => () => {
      if (VARIANTE_DIBUJADA.clave === clave) VARIANTE_DIBUJADA.clave = null
    },
    [clave],
  )
  return null
}

/**
 * [B12a.3] LA RANURA DE VARIANTES — adentro del lienzo: monta la variante del preset de la página (`preset.variante`, un id del registro,
 * P-H29e) y le presta lo que puede tocar (`PropsDeLaVariante`, `variante.ts`).
 *
 * · **La carga:** con un import dinámico del registro (`_variantes/registro.ts`), sólo cuando una página la pide.
 * · **Un dueño por tramo (P-H29a):** mientras la intro de la página está a la vista (el avance de la intro menor que 1), o la variante está
 *   saliendo, la luz de abajo y el color de la energía son de la ranura: los escribe en su cuadro, DESPUÉS del final del pie (está montada
 *   después de él), con la energía y el color que dejó la variante; fuera de la intro no escribe nada y manda el final. Sin variante, deja
 *   la luz de la composición (P-H29f). En el home (sin pista) no hace nada. [B13] En el cierre de la página (desde que manda su pista)
 *   también es de la ranura: el final del home no corre en una página, y la variante se resuelve con la señal del tramo del pie.
 * · **[B13] La resolución:** le pasa `resolucion` (`RESOLUCION_DEL_CIERRE`, 0 → 1 en la pantalla que sigue al CTA): en 1, la variante en
 *   reposo y con la luz de la composición (el piso liso y calmo, antes del pie).
 * · **La salida (P-H29d):** la pide la navegación antes de irse (`pedirLaSalidaDeLaVariante`); `saliendo` pasa a `true` y la variante tiene
 *   `SALIDA_DE_LA_VARIANTE_MS` para volver a la composición, con la página quieta. Si la ruta cambia sin pedirla (la flecha del navegador),
 *   arranca ahí. Terminada y con la página ida, se desmonta (con movimiento reducido o la escena tapada, en el acto).
 */
export function RanuraDeLaVariante({ calidad, reducido }: { readonly calidad: NivelDeCalidad; readonly reducido: boolean }): React.JSX.Element | null {
  const preset = useSyncExternalStore(suscribirseAlPreset, presetActual, () => null)
  const id = preset?.variante ?? null
  const pagina = preset?.id ?? null
  const [montada, setMontada] = useState<Montada | null>(null)
  /** La montada, para el cuadro: mientras la página que la pidió ya no está, la salida sigue siendo de la ranura. */
  const deQuien = useRef<{ readonly id: string; readonly pagina: string } | null>(null)
  const saliendo = useRef(false)
  const salida = useRef<Salida | null>(null)
  // La luz de abajo prestada (la energía y el color que deja la variante en su cuadro), y las dos funciones que le presta para escribirla.
  const luz = useRef({ energia: COMPOSICION_DE_LA_LUZ.brilloDelPiso as number, color: new THREE.Color(1, 1, 1) })
  const luzDeAbajo = useCallback((energia: number, color: THREE.Color): void => {
    luz.current.energia = energia
    luz.current.color.copy(color)
  }, [])
  const energia = useCallback((color: THREE.Color): void => {
    ENERGIA_DE_LA_RUTA.color.copy(color)
  }, [])
  const duena = useRef(false)
  /** Sólo para el banco: cuándo arrancó la última salida y cuándo llegó a la composición (ms). */
  const tiempos = useRef({ salida: Number.NaN, compuesta: Number.NaN })
  const gl = useThree((s) => s.gl)

  /** Arranca la salida (una sola: si ya hay una en curso, devuelve la suya). Con movimiento reducido o la escena tapada, en el acto. */
  const salir = useCallback(
    (motivo: Salida['motivo']): Promise<void> => {
      const enCurso = salida.current
      if (enCurso !== null) return enCurso.promesa
      saliendo.current = true
      const t0 = performance.now()
      const s: Salida = { motivo, hecha: false, promesa: Promise.resolve() }
      s.promesa = new Promise<void>((resolver) => {
        window.setTimeout(
          () => {
            s.hecha = true
            if (salida.current === s) {
              tiempos.current = { salida: t0, compuesta: performance.now() }
              luz.current.energia = COMPOSICION_DE_LA_LUZ.brilloDelPiso
              luz.current.color.setRGB(1, 1, 1)
              ENERGIA_DE_LA_RUTA.color.setRGB(1, 1, 1)
            }
            resolver()
          },
          reducido || !duena.current ? 0 : SALIDA_DE_LA_VARIANTE_MS,
        )
      })
      salida.current = s
      return s.promesa
    },
    [reducido],
  )

  // La carga y la salida: una variante a la vez; la que se va termina su salida antes de que se monte la que viene.
  useEffect(() => {
    deQuien.current = montada === null ? null : { id: montada.id, pagina: montada.pagina }
    const laPide = montada !== null && montada.id === id && montada.pagina === pagina
    if (montada !== null && !laPide) {
      // La página se fue: la salida (si la navegación no la pidió antes, arranca acá) y, terminada, el desmontaje.
      let vigente = true
      void salir('ruta').then(() => {
        if (vigente) setMontada(null)
      })
      return () => {
        vigente = false
      }
    }
    if (montada !== null) {
      // La página la sigue pidiendo. Si volvió en medio de una salida que arrancó la ruta (y no la navegación), la variante sigue.
      if (salida.current?.motivo === 'ruta') {
        saliendo.current = false
        salida.current = null
      }
      return undefined
    }
    // Sin variante montada: la que venga arranca sin salida pendiente.
    saliendo.current = false
    salida.current = null
    if (id === null || pagina === null || (hayBanco() && (window as VentanaDelBanco).__ranuraSinVariante === true)) return undefined
    let vigente = true
    void REGISTRO_DE_VARIANTES[id]().then((m) => {
      if (!vigente) return
      tiempos.current = { salida: Number.NaN, compuesta: Number.NaN }
      setMontada({ id, pagina, Componente: m.default, acento: acentoDelToken(presetActual()?.acento ?? null) })
    })
    return () => {
      vigente = false
    }
  }, [id, pagina, montada, salir])

  // La señal: mientras hay una variante montada, la navegación puede pedirle la salida antes de irse.
  useEffect(() => {
    if (montada === null) return undefined
    return atenderLaSalida(() => (hayBanco() && (window as VentanaDelBanco).__ranuraSinLaSenal === true ? Promise.resolve() : salir('senal')))
  }, [montada, salir])

  // [B12a.8 · P-H35] La página vuelve del bfcache (la flecha, después de una navegación que cambió de documento): la salida que se pidió
  // al irse quedó a medias o hecha, con la luz abajo. Si la página sigue pidiendo esta variante, la salida se olvida y la variante vuelve
  // a su avance (su luz, la del scroll de ahora).
  useEffect(() => {
    const alVolver = (e: PageTransitionEvent): void => {
      if (!e.persisted || (hayBanco() && (window as VentanaDelBanco).__ranuraSinBfcache === true)) return
      const deLaPagina = presetActual()
      const m = deQuien.current
      if (m === null || deLaPagina === null || deLaPagina.id !== m.pagina || deLaPagina.variante !== m.id) return
      saliendo.current = false
      salida.current = null
    }
    window.addEventListener('pageshow', alVolver)
    return () => window.removeEventListener('pageshow', alVolver)
  }, [])

  // [T0] 11 · 1 · El velo pregunta, antes de destapar, si la variante de ESTA página ya dibujó (`listaDeLaRuta.ts`): la página se destapa
  // con su noche y su acento desde el primer cuadro. Sin el primer cuadro de la escena (sin WebGL), o con la variante apagada por el banco, lista.
  useEffect(() => {
    const lista = (): boolean => escenaLista(presetActual(), VARIANTE_DIBUJADA.clave, hayPrimerCuadro(), hayBanco() && (window as VentanaDelBanco).__ranuraSinVariante === true)
    RANURA_EN_VIVO.lista = lista
    return () => {
      if (RANURA_EN_VIVO.lista === lista) RANURA_EN_VIVO.lista = null
    }
  }, [])

  // Al desmontar la ranura (el lienzo se rehace al cruzar 1024), la luz y la energía vuelven a ser del final.
  useEffect(
    () => () => {
      ENERGIA_DE_LA_RUTA.pedido = false
      LUZ_DE_ABAJO_EN_VIVO.uColorDeLaLuz.value.setRGB(1, 1, 1)
    },
    [],
  )

  useEffect(() => {
    if (!hayBanco()) return undefined
    const ventana = window as VentanaDelBanco
    // [B12a.8] P-H35 · pedir la salida como lo hace una navegación (el arnés del bfcache la pide y después cambia de documento).
    ventana.__pedirLaSalidaDelBanco = () => pedirLaSalidaDeLaVariante()
    ventana.__ranuraDelBanco = () => ({ id: montada?.id ?? null, saliendo: saliendo.current, duena: duena.current, energia: luz.current.energia, color: luz.current.color.getHexString(), geometrias: gl.info.memory.geometries, texturas: gl.info.memory.textures, salidaMs: tiempos.current.compuesta - tiempos.current.salida })
    return () => {
      delete ventana.__ranuraDelBanco
      delete ventana.__pedirLaSalidaDelBanco
    }
  }, [montada, gl])

  useFrame(() => {
    const deLaPagina = presetActual()
    const m = deQuien.current
    // La página que la pidió se fue y la variante sigue montada: la salida es de la ranura, aunque el efecto todavía no la haya arrancado.
    const yendose = m !== null && (deLaPagina === null || deLaPagina.id !== m.pagina || deLaPagina.variante !== m.id)
    const ahora = saliendo.current || yendose || (deLaPagina !== null && deLaPagina.pista !== null && AVANCE_DE_LA_INTRO.current < 1)
    // [B13] Y en el cierre de la página (desde que manda su pista): la variante se resuelve con la señal del tramo del pie.
    const enElCierre = deLaPagina !== null && deLaPagina.pista !== null && cierreManda()
    if (!ahora && !enElCierre) {
      if (duena.current) {
        ENERGIA_DE_LA_RUTA.pedido = false
        LUZ_DE_ABAJO_EN_VIVO.uColorDeLaLuz.value.setRGB(1, 1, 1)
      }
      duena.current = false
      return
    }
    duena.current = true
    ENERGIA_DE_LA_RUTA.pedido = true
    LUZ_DE_ABAJO_EN_VIVO.uEnergiaDeLaLuz.value = Math.min(1, Math.max(0, luz.current.energia))
    LUZ_DE_ABAJO_EN_VIVO.uExpansionDeLaLuz.value.set(RADIO_DE_LA_LUZ_PRESTADA, 1)
    LUZ_DE_ABAJO_EN_VIVO.uColorDeLaLuz.value.copy(luz.current.color)
  })

  if (montada === null) return null
  const { Componente } = montada
  const resolucion = hayBanco() && (window as VentanaDelBanco).__cierreSinResolucion === true ? SIN_RESOLUCION : RESOLUCION_DEL_CIERRE
  return (
    <>
      <Componente avance={AVANCE_DE_LA_INTRO} acento={montada.acento} calidad={calidad} reducido={reducido} luzDeAbajo={luzDeAbajo} energia={energia} saliendo={saliendo} resolucion={resolucion} />
      <MarcaDeDibujo clave={claveDeLaVariante(montada.pagina, montada.id)} />
    </>
  )
}
