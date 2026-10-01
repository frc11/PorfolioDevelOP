'use client'

import { useEffect, useState, type RefObject } from 'react'

import { SECCIONES } from '../../_lib/secciones'
import { nocheQueSeVe } from '../cursor/estado'
import { tonoDebajo, type Tono } from './tono'

const SUPERFICIE_DE = new Map(SECCIONES.map((s) => [s.id, s.superficie]))

/**
 * El tono de lo que queda bajo el centro del botón, leído por cuadro mientras el botón está.
 * La noche cambia con su propia curva (la gota), no sólo con el scroll: por eso es un cuadro
 * y no un evento. Sólo re-renderiza cuando el tono cambia. [CALIDAD 1] B2: y sólo llama a
 * React cuando cambia (React igual reservaba la actualización en cada cuadro), sin armar un
 * arreglo de cajas por cuadro.
 */
export function useTonoDebajo(boton: RefObject<HTMLElement | null>, activo: boolean): Tono {
  const [tono, setTono] = useState<Tono>('claro')
  useEffect(() => {
    if (!activo) return
    const paneles = [...document.querySelectorAll<HTMLElement>('[data-panel]')]
    const ids = paneles.map((p) => p.getAttribute('data-panel') ?? '')
    let cuadro = 0
    let ultimo: Tono | null = null
    const leer = (): void => {
      const b = boton.current?.getBoundingClientRect()
      if (b !== undefined) {
        // `panelEn`, sin armar las cajas: gana la última que contiene el medio del botón.
        const y = b.top + b.height / 2
        let visto = ''
        for (let i = 0; i < paneles.length; i += 1) {
          const r = paneles[i].getBoundingClientRect()
          if (r.top <= y && y < r.bottom) visto = ids[i]
        }
        const superficie = SUPERFICIE_DE.get(visto)
        if (superficie !== undefined) {
          // [NAVBAR] La noche que SE VE (la del arco o la de la gota): llegando de un salto la gota sola es cero.
          const tono = tonoDebajo(superficie, nocheQueSeVe())
          if (tono !== ultimo) {
            ultimo = tono
            setTono(tono)
          }
        }
      }
      cuadro = requestAnimationFrame(leer)
    }
    cuadro = requestAnimationFrame(leer)
    return () => cancelAnimationFrame(cuadro)
  }, [boton, activo])
  return tono
}
