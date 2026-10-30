'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { ACTUALIZADO, SECCIONES } from './texto'

/** La línea de lectura: la sección activa es la última cuyo título ya pasó el 30 % de la pantalla. */
const LINEA = 0.3

/**
 * [L7e · G1] EL ÍNDICE CON EL SUBRAYADO QUE VIAJA — la página legal, sin escena: el texto en papel con su índice clavado al costado. El
 * ítem de la sección que estás leyendo se subraya, y el subrayado no salta: VIAJA de un ítem al otro (el subrayado del CTA, su grosor
 * y su curva de salida; la sección activa de la barra del home). Abajo de 1024, el índice va arriba, sin clavar.
 */
export function IndiceLegal(): React.JSX.Element {
  const [activa, setActiva] = useState(0)
  const lista = useRef<HTMLOListElement>(null)
  const raya = useRef<HTMLSpanElement>(null)

  // Cuál sección se lee: la última cuyo título pasó la línea.
  useEffect(() => {
    const titulos = SECCIONES.map((s) => document.getElementById(s.id))
    let pedido = 0
    const medir = (): void => {
      pedido = 0
      const linea = window.innerHeight * LINEA
      let indice = 0
      titulos.forEach((t, i) => {
        if (t !== null && t.getBoundingClientRect().top < linea) indice = i
      })
      // Al fondo de la página, la última: sus títulos ya no pueden subir hasta la línea.
      if (window.scrollY + window.innerHeight >= document.documentElement.offsetHeight - 2) indice = titulos.length - 1
      setActiva(indice)
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(medir)
    }
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    medir()
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [])

  // La raya va a la caja del texto del ítem activo: su posición y su ancho, con la transición de la hoja.
  useLayoutEffect(() => {
    const texto = lista.current?.querySelectorAll<HTMLElement>('[data-texto-del-item]')[activa]
    const r = raya.current
    if (texto === undefined || r === null) return
    r.style.transform = `translate(${String(texto.offsetLeft)}px, ${String(texto.offsetTop + texto.offsetHeight + 2)}px)`
    r.style.width = `${String(texto.offsetWidth)}px`
  }, [activa])

  return (
    <div className="mx-auto max-w-6xl px-6 pt-36 pb-48 escritorio:pt-44">
      <header className="max-w-3xl">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Legal</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">Política de</span>
          <span className="block font-liviano tracking-titulo italic uppercase">privacidad</span>
        </h1>
        <p className="mt-4 font-codigo text-caption text-tinta-media">Última actualización: {ACTUALIZADO}</p>
      </header>
      <div className="mt-16 grid gap-12 escritorio:grid-cols-[16rem_1fr] escritorio:gap-20">
        <nav aria-label="Índice" className="escritorio:sticky escritorio:top-32 escritorio:self-start">
          <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">En esta página</p>
          <ol ref={lista} className="relative mt-4 space-y-3">
            {SECCIONES.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} aria-current={i === activa ? 'location' : undefined} className={`text-cuerpo no-underline transition-colors duration-[var(--duracion-media)] ease-[var(--ease-salida)] ${i === activa ? 'text-tinta' : 'text-tinta-media'}`}>
                  <span data-texto-del-item="" className="inline-block">
                    {s.titulo}
                  </span>
                </a>
              </li>
            ))}
            {/* La raya que viaja: una sola, que se mueve de un ítem al otro. */}
            <span
              ref={raya}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 block h-[calc(var(--border-hairline)*3)] bg-tinta transition-[transform,width] duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none"
            />
          </ol>
        </nav>
        <div className="max-w-[42rem] space-y-14">
          {SECCIONES.map((s) => (
            <section key={s.id} aria-labelledby={s.id}>
              <h2 id={s.id} className="scroll-mt-32 text-titulo-s leading-titulo font-semi escritorio:text-titulo-m">
                {s.titulo}
              </h2>
              <div className="mt-4 space-y-4">
                {s.parrafos.map((p) => (
                  <p key={p.slice(0, 24)} className="text-base leading-texto">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
