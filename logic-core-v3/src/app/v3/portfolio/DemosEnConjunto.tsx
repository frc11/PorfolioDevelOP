'use client'

import { useCallback, useState } from 'react'

import { Imagen } from '../_componentes/medios/Imagen'
import { Cuerpo } from '../_componentes/tipografia/Textos'
import { CONSULTA_ESCENARIO } from '../_lib/compuerta'
import { useAnchoMinimo } from '../_lib/useAnchoMinimo'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'
import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_PORTADA, type Demo } from '../_secciones/trabajos/demos/catalogo'
import { VentanaDeDemo } from '../_secciones/trabajos/demos/VentanaDeDemo'

import { DEMOS } from './contenido'
import { ALZA, ESTANTE_EN_REPOSO, PISADA, POSE_DE_LAS_TAPAS, corrimiento, elegirLaTapa, papelDeLaTapa, soltarLaTapa, transicionDelAlza, transicionDelCorrimiento, type EstadoDelEstante } from './estante'

/** El ancho de una tapa: un quinto largo del ancho en el teléfono, hasta 15rem. Todo el estante se mide en esta unidad. */
const ANCHO_DE_LA_TAPA = { '--ancho-de-la-tapa': 'min(19vw, 15rem)' } as React.CSSProperties

/**
 * [M1] LAS DEMOS, EN CONJUNTO — el estante del prototipo 17 (`demos-en-conjunto`): las cinco tapas del catálogo del home, apoyadas una
 * encima de la otra y apenas torcidas; con el mouse (o el foco del teclado) una se levanta, se endereza y dice su rubro. Tres arreglos
 * pedidos: los tres pasos numerados se fueron (un texto corrido); una tapa ya no atraviesa a las de adelante (`estante.ts`: las vecinas se
 * corren primero, el apilado no cambia nunca); y desde 1024 un clic abre la demo con el mecanismo del home, la ventana con el Genie
 * (`VentanaDeDemo`), acá mismo. Abajo de 1024 hace lo que hace el home en el teléfono: abre la demo en otra pestaña. Con un modificador
 * (o la rueda), el ancla hace lo suyo.
 */
export function DemosEnConjunto(): React.JSX.Element {
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const [estante, setEstante] = useState<EstadoDelEstante>(ESTANTE_EN_REPOSO)
  const [abierta, setAbierta] = useState<{ readonly demo: Demo; readonly pieza: HTMLAnchorElement } | null>(null)
  const elegir = useCallback((i: number) => {
    const ahora = performance.now()
    setEstante((e) => elegirLaTapa(e, i, ahora))
  }, [])
  const soltar = useCallback((i: number) => {
    const ahora = performance.now()
    setEstante((e) => soltarLaTapa(e, i, ahora))
  }, [])
  const alCerrar = useCallback((): void => setAbierta(null), [])

  const alHacerClic = (e: React.MouseEvent<HTMLAnchorElement>, demo: Demo): void => {
    if (!escritorio || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    setAbierta({ demo, pieza: e.currentTarget })
  }

  return (
    <div className="flex flex-col gap-[var(--spacing-12)]">
      <div className="grid grid-cols-1 gap-[var(--spacing-6)] escritorio:grid-cols-2 escritorio:gap-[var(--spacing-16)]">
        <TituloQueSube titulo={DEMOS.titulo} como="h2" nivel="titulo-l" />
        <Gatillo desde="abajo">
          <Cuerpo className="escritorio:text-base">{DEMOS.texto}</Cuerpo>
        </Gatillo>
      </div>
      <div className="overflow-x-clip">
        <ul data-pieza="estante-de-demos" aria-label="Las demos" style={ANCHO_DE_LA_TAPA} className="flex items-end justify-center pt-[var(--spacing-12)] pb-[var(--spacing-8)]">
          {CATALOGO_DE_DEMOS.map((demo, i) => {
            const pose = POSE_DE_LAS_TAPAS[i % POSE_DE_LAS_TAPAS.length]
            const papel = papelDeLaTapa(i, estante.activa, estante.ultima)
            const elegida = papel === 'elegida'
            return (
              <li
                key={demo.slug}
                data-tapa={demo.slug}
                data-papel={papel}
                className="relative w-[var(--ancho-de-la-tapa)] shrink-0 will-change-transform"
                style={{
                  marginInline: `calc(var(--ancho-de-la-tapa) * ${String(-PISADA / 2)})`,
                  transform: `translateX(calc(var(--ancho-de-la-tapa) * ${corrimiento(papel).toFixed(4)}))`,
                  transition: transicionDelCorrimiento(papel, estante),
                }}
              >
                <a
                  href={demo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-haspopup={escritorio ? 'dialog' : undefined}
                  aria-label={escritorio ? `${demo.nombre}, demo de ${demo.rubro}` : `${demo.nombre}, demo de ${demo.rubro} (${DEMOS.abreAparte})`}
                  data-demo={demo.slug}
                  className="block no-underline outline-offset-4"
                  onPointerEnter={(e) => {
                    if (e.pointerType === 'mouse' || e.pointerType === 'pen') elegir(i)
                  }}
                  onPointerLeave={() => soltar(i)}
                  onFocus={(e) => {
                    if (e.currentTarget.matches(':focus-visible')) elegir(i)
                  }}
                  onBlur={() => soltar(i)}
                  onClick={(e) => alHacerClic(e, demo)}
                >
                  <span
                    data-parte="cara"
                    className="block origin-bottom will-change-transform"
                    style={{
                      transform: elegida
                        ? `translateY(calc(var(--ancho-de-la-tapa) * ${String(-ALZA)})) rotate(0deg)`
                        : `translateY(${String(pose.baja)}%) rotate(${String(pose.giro)}deg)`,
                      transition: transicionDelAlza(papel, estante),
                    }}
                  >
                    <Imagen src={demo.portada} alt="" ancho={MEDIDA_DE_LA_PORTADA.ancho} alto={MEDIDA_DE_LA_PORTADA.alto} sizes="(min-width: 1024px) 15rem, 19vw" className="block aspect-[2/3] w-full rounded-medio object-cover shadow-flotante" />
                  </span>
                  <span
                    className="mt-[var(--spacing-4)] block text-center font-codigo text-micro tracking-wide text-tinta-media uppercase transition-opacity duration-[var(--duracion-media)] ease-[var(--ease-salida)] tablet:text-caption"
                    style={{ opacity: elegida ? 1 : 0 }}
                  >
                    {demo.rubro}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
      {abierta === null ? null : <VentanaDeDemo key={abierta.demo.slug} demo={abierta.demo} pieza={abierta.pieza} alEmpezarACerrar={() => undefined} alCerrar={alCerrar} />}
    </div>
  )
}
