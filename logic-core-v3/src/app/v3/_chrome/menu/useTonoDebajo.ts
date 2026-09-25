'use client'

import { useEffect, useState, type RefObject } from 'react'

import { nocheEfectiva } from '../../_lib/escena/nocheDisparada'
import { SECCIONES } from '../../_lib/secciones'
import { panelEn, tonoDebajo, type PanelEnElCuadro, type Tono } from './tono'

const SUPERFICIE_DE = new Map(SECCIONES.map((s) => [s.id, s.superficie]))

/**
 * El tono de lo que queda bajo el centro del botón, leído por cuadro mientras el botón está.
 * La noche cambia con su propia curva (la gota), no sólo con el scroll: por eso es un cuadro
 * y no un evento. Sólo re-renderiza cuando el tono cambia.
 */
export function useTonoDebajo(boton: RefObject<HTMLElement | null>, activo: boolean): Tono {
  const [tono, setTono] = useState<Tono>('claro')
  useEffect(() => {
    if (!activo) return
    const paneles = [...document.querySelectorAll<HTMLElement>('[data-panel]')]
    let cuadro = 0
    const leer = (): void => {
      const b = boton.current?.getBoundingClientRect()
      if (b !== undefined) {
        const cajas: PanelEnElCuadro[] = paneles.map((p) => {
          const r = p.getBoundingClientRect()
          return { id: p.getAttribute('data-panel') ?? '', tope: r.top, pie: r.bottom }
        })
        const superficie = SUPERFICIE_DE.get(panelEn(cajas, b.top + b.height / 2) ?? '')
        if (superficie !== undefined) setTono(tonoDebajo(superficie, nocheEfectiva()))
      }
      cuadro = requestAnimationFrame(leer)
    }
    cuadro = requestAnimationFrame(leer)
    return () => cancelAnimationFrame(cuadro)
  }, [boton, activo])
  return tono
}
