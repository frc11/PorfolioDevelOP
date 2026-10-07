'use client'

import { animate, motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from 'react'

import { useContacto } from '../../_chrome/contacto/apertura'
import { PERSPECTIVA_DE_LA_PLACA } from '../../_chrome/contacto/placa'
import {
  CTA_DEL_FINAL,
  CTA_EN_VIVO,
  filoEn,
  gestoDelToque,
  inclinacionDeLaLosa,
  letraDelHaz,
  varianteDelCta,
  type CajaEnLaVentana,
  type VarianteDelCta,
} from '../../_lib/escena/ctaDelFinal/estado'

/**
 * [PULIDO 1] P17-B · EL CTA DEL FINAL, CON SU VARIANTE DE PRUEBA (`?cta=a|b|c|d`). Sin bandera no hay variante y esto no
 * agrega nada: el CTA de hoy, igual (`CtaDelFinal` devuelve sus hijos tal cual; `LetrasDelCta`, el texto). Con bandera:
 * escribe lo que la escena necesita (`CTA_EN_VIVO`: la llegada, el hover, el toque, el puntero, las cajas y si Contacto se
 * abrió desde acá) y pone lo que la variante tiene del lado del DOM (la losa, las letras del haz, el marco del portal); lo de
 * la escena está en `escena/ctaDelFinal/`. El porqué de cada una, en `estado.ts`.
 */
const sinCambios = (): (() => void) => () => undefined

/** La variante de esta carga, después de hidratar (el servidor no la conoce: el primer render es el CTA de hoy). */
export function useVarianteDelCta(): VarianteDelCta | null {
  return useSyncExternalStore(sinCambios, varianteDelCta, () => null)
}

/** El reloj de la variante (s desde que el CTA llegó; −1 sin llegar) para las letras del haz. */
const RelojDelCta = createContext<MotionValue<number> | null>(null)

const cajaDe = (r: DOMRect, destino: CajaEnLaVentana): void => {
  destino.x = r.left / window.innerWidth
  destino.y = r.top / window.innerHeight
  destino.ancho = r.width / window.innerWidth
  destino.alto = r.height / window.innerHeight
}

interface PropsDelCta {
  /** Cuánto llegó el CTA (0 a 1); `null`: lo mide acá, al entrar en la pantalla (la lista, abajo de 1024). */
  readonly llegada: MotionValue<number> | null
  readonly className?: string
  readonly children: React.ReactNode
}

export function CtaDelFinal({ llegada, className, children }: PropsDelCta): React.JSX.Element {
  const variante = useVarianteDelCta()
  if (variante === null) return <>{children}</>
  return (
    <ConVariante variante={variante} llegada={llegada} className={className}>
      {children}
    </ConVariante>
  )
}

function ConVariante({ variante, llegada, className, children }: PropsDelCta & { readonly variante: VarianteDelCta }): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const quieto = useReducedMotion() === true
  const enPantalla = useInView(caja, { amount: 0.5 })
  // La llegada: la del escenario o, en la lista, la de entrar en la pantalla (por tiempo).
  const propia = useMotionValue(0)
  useEffect(() => {
    if (llegada !== null) return undefined
    if (quieto) {
      propia.set(enPantalla ? 1 : 0)
      return undefined
    }
    const a = animate(propia, enPantalla ? 1 : 0, { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] })
    return () => a.stop()
  }, [llegada, enPantalla, propia, quieto])
  const llego = llegada ?? propia
  // Contacto abierto desde este CTA: la salida (y la escena se entera).
  const { abierto: contactoAbierto, origen } = useContacto()
  const salida = useMotionValue(0)
  useEffect(() => {
    const abierto = contactoAbierto && origen !== null && (caja.current?.contains(origen) ?? false)
    CTA_EN_VIVO.abierto = abierto
    if (quieto) {
      salida.set(abierto ? 1 : 0)
      return undefined
    }
    const a = animate(salida, abierto ? 1 : 0, { duration: CTA_DEL_FINAL.losa.acostarseS, ease: [0.55, 0, 0.8, 0.4] })
    return () => a.stop()
  }, [contactoAbierto, origen, salida, quieto])
  // El reloj desde que llegó (para las letras del haz y el filo).
  const reloj = useMotionValue(-1)
  const desde = useRef<number | null>(null)

  // Lo que la escena lee, en cada cuadro mientras se ve (las cajas se mueven con el escenario).
  useEffect(() => {
    CTA_EN_VIVO.variante = variante
    return () => {
      CTA_EN_VIVO.variante = null
      CTA_EN_VIVO.llegada = 0
      CTA_EN_VIVO.hover = false
      CTA_EN_VIVO.abierto = false
    }
  }, [variante])
  useAnimationFrame((ahora) => {
    if (!enPantalla && llego.get() <= 0) return
    const l = llego.get()
    CTA_EN_VIVO.llegada = l
    if (caja.current !== null) {
      cajaDe(caja.current.getBoundingClientRect(), CTA_EN_VIVO.caja)
      const boton = caja.current.querySelector('a, button')
      if (boton !== null) cajaDe(boton.getBoundingClientRect(), CTA_EN_VIVO.boton)
    }
    if (l >= 0.98 && desde.current === null) desde.current = ahora
    if (l < 0.3) desde.current = null
    reloj.set(desde.current === null ? -1 : quieto ? 99 : (ahora - desde.current) / 1000)
  })

  // El hover (el puntero o el foco del teclado en el botón) y el toque (el dedo: el gesto una vez).
  const alEntrar = (e: React.PointerEvent): void => {
    if (e.pointerType === 'touch') return
    CTA_EN_VIVO.hover = true
  }
  const alSalir = (): void => {
    CTA_EN_VIVO.hover = false
  }
  const alMover = (e: React.PointerEvent): void => {
    CTA_EN_VIVO.puntero.x = e.clientX / window.innerWidth
    CTA_EN_VIVO.puntero.y = e.clientY / window.innerHeight
  }
  const alApretar = (e: React.PointerEvent): void => {
    alMover(e)
    CTA_EN_VIVO.toqueEn = performance.now()
  }
  const alEnfocar = (e: React.FocusEvent): void => {
    if (e.target instanceof Element && e.target.matches(':focus-visible')) CTA_EN_VIVO.hover = true
  }

  return (
    <RelojDelCta.Provider value={reloj}>
      <div
        ref={caja}
        data-cta-variante={variante}
        {...(variante === 'd' ? { 'data-cta-desde-el-punto': '' } : {})}
        className={className}
        onPointerEnter={alEntrar}
        onPointerLeave={alSalir}
        onPointerMove={alMover}
        onPointerDown={alApretar}
        onFocus={alEnfocar}
        onBlur={alSalir}
      >
        {variante === 'a' ? (
          <Losa llegada={llego} salida={salida} quieto={quieto}>
            {children}
          </Losa>
        ) : variante === 'd' ? (
          <Portal llegada={llego} salida={salida} quieto={quieto}>
            {children}
          </Portal>
        ) : variante === 'b' ? (
          <LuzDelBoton reloj={reloj} salida={salida}>
            {children}
          </LuzDelBoton>
        ) : (
          children
        )}
      </div>
    </RelojDelCta.Provider>
  )
}

/**
 * EL FILO: un tramo blanco que recorre el borde (del CTA en la losa), mientras hay hover o en el gesto de un toque. Un
 * rectángulo de SVG con `pathLength` 1: el tramo es el trazo y el recorrido, su corrimiento.
 */
function Filo({ quieto }: { readonly quieto: boolean }): React.JSX.Element {
  const corrimiento = useMotionValue(0)
  const opacidad = useSpring(0, { stiffness: 380, damping: 38, mass: 0.9 })
  const desde = useRef<number | null>(null)
  useAnimationFrame((ahora) => {
    const toque = gestoDelToque((performance.now() - CTA_EN_VIVO.toqueEn) / 1000)
    const activo = CTA_EN_VIVO.hover || toque > 0
    opacidad.set(activo ? 1 : 0)
    if (!activo) {
      desde.current = null
      return
    }
    desde.current ??= ahora
    corrimiento.set(quieto ? 0 : -filoEn((ahora - desde.current) / 1000))
  })
  const L = CTA_DEL_FINAL.losa.filo
  return (
    <motion.svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible" style={{ opacity: opacidad }}>
      {/* El canto: un trazo de tinta fino debajo y el blanco encima, para que el brillo se lea también sobre el papel. */}
      <motion.rect x="0" y="0" width="100%" height="100%" pathLength={1} fill="none" stroke="var(--color-tinta)" strokeOpacity={0.7} strokeWidth={5} strokeDasharray={`${String(L)} ${String(1 - L)}`} style={{ strokeDashoffset: corrimiento }} />
      <motion.rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        pathLength={1}
        fill="none"
        stroke="var(--color-fondo)"
        strokeWidth={2.5}
        strokeDasharray={`${String(L)} ${String(1 - L)}`}
        style={{ strokeDashoffset: corrimiento, filter: 'drop-shadow(0 0 0.35em var(--color-fondo))' }}
      />
    </motion.svg>
  )
}

/** Las caras de detrás del frente de la losa: el espesor (abajo, arriba y los costados), en tinta clara. */
const CARAS_DE_LA_LOSA = [
  { cara: 'abajo', className: 'inset-x-0 bottom-0 bg-[color-mix(in_srgb,var(--color-tinta)_22%,var(--color-fondo))]', origen: 'center bottom', giro: 'rotateX(90deg)', alto: true },
  { cara: 'arriba', className: 'inset-x-0 top-0 bg-[color-mix(in_srgb,var(--color-tinta)_12%,var(--color-fondo))]', origen: 'center top', giro: 'rotateX(-90deg)', alto: true },
  { cara: 'izquierda', className: 'inset-y-0 left-0 bg-[color-mix(in_srgb,var(--color-tinta)_16%,var(--color-fondo))]', origen: 'left center', giro: 'rotateY(90deg)', alto: false },
  { cara: 'derecha', className: 'inset-y-0 right-0 bg-[color-mix(in_srgb,var(--color-tinta)_16%,var(--color-fondo))]', origen: 'right center', giro: 'rotateY(-90deg)', alto: false },
] as const

/**
 * a · LA LOSA: el CTA en una placa de papel con espesor y cantos vivos que nace acostada en el piso (girada sobre su borde de abajo, vista
 * desde arriba con la perspectiva de la placa de Contacto) y se levanta con la llegada; con Contacto abierto desde acá se
 * vuelve a acostar, como la placa de Contacto al irse. En hover, el filo blanco recorre su borde.
 */
function Losa({ llegada, salida, quieto, children }: { readonly llegada: MotionValue<number>; readonly salida: MotionValue<number>; readonly quieto: boolean; readonly children: React.ReactNode }): React.JSX.Element {
  const giro = useTransform(() => (quieto ? 0 : inclinacionDeLaLosa(llegada.get(), salida.get())))
  const E = CTA_DEL_FINAL.losa.espesorPx
  return (
    <div style={{ perspective: PERSPECTIVA_DE_LA_PLACA, perspectiveOrigin: '50% 0%' }}>
      <motion.div
        data-parte="losa"
        className="relative flex flex-col items-center border border-[color-mix(in_srgb,var(--color-tinta)_14%,transparent)] bg-[color-mix(in_srgb,var(--color-fondo)_78%,transparent)] px-[var(--spacing-12)] py-[var(--spacing-8)]"
        style={{ rotateX: giro, transformOrigin: 'center bottom', transformStyle: 'preserve-3d' }}
      >
        {children}
        {CARAS_DE_LA_LOSA.map((c) => (
          <div
            key={c.cara}
            data-cara={c.cara}
            aria-hidden="true"
            className={`pointer-events-none absolute ${c.className}`}
            style={{ [c.alto ? 'height' : 'width']: E, transformOrigin: c.origen, transform: c.giro }}
          />
        ))}
        <Filo quieto={quieto} />
      </motion.div>
    </div>
  )
}

/**
 * d · EL PORTAL: un marco de tinta alrededor del CTA que se dibuja con la llegada (el trazo, de punta a punta, y las cuatro
 * esquinas). En hover se abre apenas; con Contacto abierto desde acá se agranda y se va (la placa sale del punto del clic:
 * `data-cta-desde-el-punto`, lo lee la apertura del contacto). La deformación del moiré la hace la escena.
 */
function Portal({ llegada, salida, quieto, children }: { readonly llegada: MotionValue<number>; readonly salida: MotionValue<number>; readonly quieto: boolean; readonly children: React.ReactNode }): React.JSX.Element {
  const dibujado = useTransform(llegada, (l) => (quieto ? 0 : 1 - Math.min(1, Math.max(0, l))))
  const abre = useSpring(1, { stiffness: 380, damping: 38, mass: 0.9 })
  useAnimationFrame(() => {
    abre.set(1 + (CTA_EN_VIVO.hover ? 0.012 : 0) + 0.012 * gestoDelToque((performance.now() - CTA_EN_VIVO.toqueEn) / 1000))
  })
  const escala = useTransform(() => abre.get() + 0.06 * salida.get())
  const opacidad = useTransform(salida, (s) => 1 - s)
  return (
    <div className="relative flex flex-col items-center px-[var(--spacing-12)] py-[var(--spacing-8)]">
      {children}
      <motion.svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible" style={{ scale: escala, opacity: opacidad }}>
        <motion.rect x="0" y="0" width="100%" height="100%" pathLength={1} fill="none" stroke="var(--color-tinta)" strokeWidth={1.5} strokeDasharray="1 1" style={{ strokeDashoffset: dibujado }} />
      </motion.svg>
    </div>
  )
}

/** b · el botón iluminado desde arriba: un charco de luz detrás, que se prende con el haz y se apaga al abrir Contacto. */
function LuzDelBoton({ reloj, salida, children }: { readonly reloj: MotionValue<number>; readonly salida: MotionValue<number>; readonly children: React.ReactNode }): React.JSX.Element {
  const luz = useTransform(() => {
    const s = reloj.get()
    const prendida = s < 0 ? 0 : letraDelHaz(0, s - CTA_DEL_FINAL.haz.bajaS)
    return Math.max(0, prendida - CTA_DEL_FINAL.haz.apagada) / (1 - CTA_DEL_FINAL.haz.apagada) * (1 - salida.get())
  })
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,var(--color-fondo),transparent_70%)]"
        style={{ opacity: luz }}
      />
      {children}
    </div>
  )
}

/**
 * b · LAS LETRAS DEL CTA: con la variante del haz, cada letra se enciende en secuencia con el parpadeo de encendido del haz
 * (`letraDelHaz`); para los lectores de pantalla, el texto entero. Sin esa variante, el texto tal cual (el CTA de hoy).
 */
export function LetrasDelCta({ texto, desde = 0 }: { readonly texto: string; readonly desde?: number }): React.JSX.Element {
  const reloj = useContext(RelojDelCta)
  const variante = useVarianteDelCta()
  if (variante !== 'b' || reloj === null) return <>{texto}</>
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span aria-hidden="true">
        {[...texto].map((letra, i) => (
          <Letra key={`${String(i)}-${letra}`} letra={letra} orden={desde + i} reloj={reloj} />
        ))}
      </span>
    </>
  )
}

function Letra({ letra, orden, reloj }: { readonly letra: string; readonly orden: number; readonly reloj: MotionValue<number> }): React.JSX.Element {
  const opacidad = useTransform(reloj, (s) => (s < 0 ? CTA_DEL_FINAL.haz.apagada : letraDelHaz(orden, s)))
  return <motion.span style={{ opacity: opacidad }}>{letra}</motion.span>
}
