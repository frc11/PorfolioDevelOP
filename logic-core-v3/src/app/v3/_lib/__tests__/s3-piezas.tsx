/**
 * EL PADRÓN DE PIEZAS — cada componente del sprint, listo para renderizar.
 *
 * ── Para qué ──────────────────────────────────────────────────────────────
 *
 * `s3-foco.invariant.tsx` recorre esta lista y afirma, **pieza por pieza**,
 * que lo que se enfoca existe y que el anillo del sistema le llega. "El foco
 * anda" no es una afirmación verificable; "las nueve piezas interactivas
 * exponen un elemento focalizable y ninguna lo recorta" sí.
 *
 * ── La cobertura se verifica, no se promete ───────────────────────────────
 *
 * Cada entrada declara de qué archivo sale, y el invariante afirma que los 12
 * archivos de componente están cubiertos. Un componente nuevo sin entrada acá
 * hace fallar la comprobación en vez de quedar afuera en silencio.
 *
 * ⚠ NOTA DE ARNÉS: `tsx` compila el JSX con el runtime clásico —emite
 * `React.createElement` sin importar nada— así que los componentes, que no
 * importan React, lo buscan en el ámbito global. La asignación de abajo corre
 * al importar este módulo, o sea antes de cualquier render. Es del arnés:
 * `next build` usa el runtime automático y no la necesita.
 */

import React from 'react'

import { Cta, CtaEnlace } from '../../_componentes/chrome/Cta'
import CursorPropio from '../../_componentes/chrome/CursorPropio'
import { EnlaceDeNavegacionFlotante, Navegacion } from '../../_componentes/chrome/Navegacion'
import { FormularioDeNovedades } from '../../_componentes/chrome/Novedades'
import { BloqueDeColumnasDelPie, Pie, TituloDeCierreDelPie } from '../../_componentes/chrome/Pie'
import {
  BotonSocialDelPie,
  EnlaceDeContactoDelPie,
  EnlaceDelPieConIcono,
  EnlaceDeTextoDelPie,
} from '../../_componentes/chrome/PiePiezas'
import { Envoltorio } from '../../_componentes/layout/Envoltorio'
import { Grilla } from '../../_componentes/layout/Grilla'
import { Imagen } from '../../_componentes/medios/Imagen'
import { Caption, Cuerpo, EtiquetaDeSeccion, Micro, TextoBase } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { ROTULO_DE_MUESTRA } from '../cta'
import { sizesPorViewport } from '../imagen'
import { ENLACES_DE_MUESTRA } from '../navegacion'

;(globalThis as unknown as { React: typeof React }).React = React

const V3 = 'src/app/v3'
/** Un icono cualquiera. Las piezas lo reciben por prop: no traen contenido. */
const ICONO = <svg viewBox="0 0 16 16" aria-hidden="true" />

export interface PiezaDelPadron {
  readonly id: string
  /** El archivo del que sale. Sirve para afirmar la cobertura. */
  readonly archivo: string
  /** Si tiene que exponer al menos un elemento focalizable. */
  readonly interactiva: boolean
  readonly nodo: React.ReactNode
}

export const PIEZAS: readonly PiezaDelPadron[] = [
  {
    id: 'cta-boton',
    archivo: `${V3}/_componentes/chrome/Cta.tsx`,
    interactiva: true,
    nodo: <Cta rotulo={ROTULO_DE_MUESTRA} />,
  },
  {
    id: 'cta-enlace',
    archivo: `${V3}/_componentes/chrome/Cta.tsx`,
    interactiva: true,
    nodo: <CtaEnlace href="#x" rotulo={ROTULO_DE_MUESTRA} />,
  },
  {
    id: 'cta-deshabilitado',
    archivo: `${V3}/_componentes/chrome/Cta.tsx`,
    // Un botón deshabilitado NO es focalizable, y está bien que no lo sea.
    interactiva: false,
    nodo: <Cta rotulo={ROTULO_DE_MUESTRA} deshabilitado />,
  },
  {
    id: 'navegacion-pastilla',
    archivo: `${V3}/_componentes/chrome/Navegacion.tsx`,
    interactiva: true,
    nodo: <Navegacion />,
  },
  {
    id: 'navegacion-enlace',
    archivo: `${V3}/_componentes/chrome/Navegacion.tsx`,
    interactiva: true,
    nodo: <EnlaceDeNavegacionFlotante enlace={ENLACES_DE_MUESTRA[0]} />,
  },
  {
    id: 'pie-enlace-icono',
    archivo: `${V3}/_componentes/chrome/PiePiezas.tsx`,
    interactiva: true,
    nodo: <EnlaceDelPieConIcono href="#x" rotulo="Trabajos" icono={ICONO} />,
  },
  {
    id: 'pie-social',
    archivo: `${V3}/_componentes/chrome/PiePiezas.tsx`,
    interactiva: true,
    nodo: <BotonSocialDelPie href="#x" rotulo="Instagram" icono={ICONO} />,
  },
  {
    id: 'pie-contacto',
    archivo: `${V3}/_componentes/chrome/PiePiezas.tsx`,
    interactiva: true,
    nodo: <EnlaceDeContactoDelPie href="#x" rotulo="Escribinos" />,
  },
  {
    id: 'pie-enlace-texto',
    archivo: `${V3}/_componentes/chrome/PiePiezas.tsx`,
    interactiva: true,
    nodo: <EnlaceDeTextoDelPie href="#x">enlace inline</EnlaceDeTextoDelPie>,
  },
  {
    id: 'novedades',
    archivo: `${V3}/_componentes/chrome/Novedades.tsx`,
    interactiva: true,
    nodo: <FormularioDeNovedades rotuloDeEnvio="Suscribirme" icono={ICONO} />,
  },
  {
    id: 'novedades-deshabilitado',
    archivo: `${V3}/_componentes/chrome/Novedades.tsx`,
    // El campo sigue siendo focalizable: lo deshabilitado es el envío.
    interactiva: true,
    nodo: <FormularioDeNovedades rotuloDeEnvio="Suscribirme" icono={ICONO} deshabilitado />,
  },
  {
    id: 'pie',
    archivo: `${V3}/_componentes/chrome/Pie.tsx`,
    interactiva: false,
    nodo: (
      <Pie>
        <BloqueDeColumnasDelPie>
          <TituloDeCierreDelPie>Construimos lo que te falta</TituloDeCierreDelPie>
        </BloqueDeColumnasDelPie>
      </Pie>
    ),
  },
  {
    id: 'cursor',
    archivo: `${V3}/_componentes/chrome/CursorPropio.tsx`,
    interactiva: false,
    nodo: <CursorPropio />,
  },
  {
    id: 'compuerta-del-cursor',
    archivo: `${V3}/_componentes/chrome/CursorCompuerta.tsx`,
    // No se renderiza: en el servidor las dos compuertas dicen "no montes", y
    // eso ya lo afirma `s3-cursor.invariant.ts` sobre la función pura.
    interactiva: false,
    nodo: null,
  },
  {
    id: 'envoltorio',
    archivo: `${V3}/_componentes/layout/Envoltorio.tsx`,
    interactiva: false,
    nodo: <Envoltorio>contenido</Envoltorio>,
  },
  {
    id: 'grilla',
    archivo: `${V3}/_componentes/layout/Grilla.tsx`,
    interactiva: false,
    nodo: (
      <Grilla columnas="lateral">
        <span>01</span>
        <span>Hero</span>
      </Grilla>
    ),
  },
  {
    id: 'titular',
    archivo: `${V3}/_componentes/tipografia/Titular.tsx`,
    interactiva: false,
    nodo: (
      <Titular nivel="titulo-xl" como="h1">
        Construimos Software que Trabaja
      </Titular>
    ),
  },
  {
    id: 'textos',
    archivo: `${V3}/_componentes/tipografia/Textos.tsx`,
    interactiva: false,
    nodo: (
      <>
        <EtiquetaDeSeccion>Sección</EtiquetaDeSeccion>
        <Cuerpo>Cuerpo</Cuerpo>
        <Caption>Caption</Caption>
        <Micro>Micro</Micro>
        <TextoBase>Base</TextoBase>
      </>
    ),
  },
  {
    id: 'imagen',
    archivo: `${V3}/_componentes/medios/Imagen.tsx`,
    interactiva: false,
    nodo: (
      <Imagen src="/logodevelOP.png" alt="" ancho={1024} alto={1024} sizes={sizesPorViewport(33)} />
    ),
  },
]
