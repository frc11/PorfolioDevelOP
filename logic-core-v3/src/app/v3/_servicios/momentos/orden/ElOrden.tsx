'use client'

import { useCallback, useRef } from 'react'

import { Envoltorio } from '../../../_componentes/layout/Envoltorio'
import { useMovimientoReducido } from '../../../_lib/motion/reducido'
import { CLASES_DEL_PAPEL, EncabezadoDelBloque, idDelTituloDe } from '../../bloques/Bloque'
import { tramo } from '../avance'
import { useAvanceDelRecorrido } from '../useAvanceDelRecorrido'
import { ANCHO_DEL_PAPEL, APARICION_DEL_TABLERO, CIERRE_DEL_ORDEN, COLUMNAS, LUGARES, PAPELES, TABLERO, TITULO_DEL_ORDEN, papelEn } from './datos'

/**
 * [M3] EL SISTEMA QUE SE ORDENA — el prototipo 14 (el mecanismo, aprobado) con la estética del sitio (lo que cambió, en el resultado):
 *   · la mesa es una hoja del papel del sitio con las rayas finas de su grilla, no tres cajas de kanban; las columnas se nombran en la
 *     monoespaciada de las etiquetas y cuentan lo que ya llegó (la cuenta es real: los papeles que se asentaron);
 *   · cada papel es papel: el filete de tinta, el rótulo en monoespaciada arriba (qué es: pedido, turno, stock…) y el texto en cuerpo;
 *     mientras viaja va LEVANTADO (la sombra crece y queda arriba de los demás) y al llegar se APOYA: sin sombra, derecho, con el
 *     cuadrado del acento en la esquina, la marca de las secciones;
 *   · el tiempo es el del sitio: las curvas del sistema (`simetrica` para el viaje), escalonados en orden, y al final una sola línea.
 * El escenario queda clavado mientras se ordena; al subir, se desordena. Con movimiento reducido, ya ordenado y quieto.
 */
export function ElOrden(): React.JSX.Element {
  const reducido = useMovimientoReducido()
  const idDelTitulo = idDelTituloDe('el-orden')
  return (
    <section data-bloque="el-orden" aria-labelledby={idDelTitulo} className={`${CLASES_DEL_PAPEL} pt-12 escritorio:pt-20`}>
      <Envoltorio>
        <div className="escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--grilla-canal-amplio)]">
          <EncabezadoDelBloque nombre="el-orden" titulo={TITULO_DEL_ORDEN} />
        </div>
      </Envoltorio>
      {reducido ? (
        <Envoltorio className="py-10">
          <Mesa />
        </Envoltorio>
      ) : (
        <Recorrido />
      )}
    </section>
  )
}

function Recorrido(): React.JSX.Element {
  const recorrido = useRef<HTMLDivElement>(null)
  const mesa = useRef<HTMLDivElement>(null)
  const pintar = useCallback((avance: number) => {
    const m = mesa.current
    if (m === null) return
    m.style.setProperty('--tablero', tramo(avance, ...APARICION_DEL_TABLERO).toFixed(3))
    const llegados = [0, 0, 0]
    m.querySelectorAll<HTMLElement>('[data-papel]').forEach((el, i) => {
      const p = papelEn(i, avance)
      el.style.left = `${p.x.toFixed(2)}%`
      el.style.top = `${p.y.toFixed(2)}%`
      el.style.rotate = `${p.giro.toFixed(2)}deg`
      el.style.zIndex = p.levantado > 0.02 ? '2' : '1'
      el.style.setProperty('--levantado', p.levantado.toFixed(3))
      if (p.llego) {
        el.setAttribute('data-llego', '')
        llegados[PAPELES[i].columna] += 1
      } else el.removeAttribute('data-llego')
    })
    m.querySelectorAll<HTMLElement>('[data-cuenta]').forEach((c, i) => {
      c.textContent = String(llegados[i]).padStart(2, '0')
    })
    m.style.setProperty('--cierre', tramo(avance, 0.86, 0.96).toFixed(3))
  }, [])
  useAvanceDelRecorrido(recorrido, pintar, { modo: 'clavado' }, true)
  return (
    <div ref={recorrido} data-recorrido-del-orden="" className="relative" style={{ height: '300svh' }}>
      <div className="sticky top-0 flex h-svh items-center">
        <Envoltorio className="pt-20 pb-6 escritorio:pt-24">
          <Mesa mesa={mesa} animada />
        </Envoltorio>
      </div>
    </div>
  )
}

/** La mesa: el tablero (las rayas y las columnas) y los papeles. Quieta, los papeles ya están en su lugar. */
function Mesa({ mesa, animada = false }: { readonly mesa?: React.Ref<HTMLDivElement>; readonly animada?: boolean }): React.JSX.Element {
  return (
    <div
      ref={mesa}
      className="mx-auto flex w-full flex-col gap-4"
      style={{ '--tablero': animada ? '0' : '1', '--cierre': animada ? '0' : '1', maxWidth: 'min(100%, calc((100svh - 15rem) * 1.6))' } as React.CSSProperties}
    >
      <div className="relative aspect-3/4 w-full tablet:aspect-16/10">
        <div aria-hidden="true" className="absolute inset-0">
          {/* Las columnas, a mano (un dibujo, no una grilla de layout): un tercio cada una, en todos los anchos. */}
          {COLUMNAS.map((c, i) => (
            <div key={c} className="absolute inset-y-0" style={{ left: `${((i * 100) / 3).toFixed(3)}%`, width: `${(100 / 3).toFixed(3)}%` }}>
              {/* La raya de la grilla: se dibuja de arriba hacia abajo (la primera columna no lleva). */}
              {i > 0 ? <span className="absolute inset-y-0 left-0 w-px origin-top bg-borde-fuerte" style={{ scale: '1 var(--tablero)' }} /> : null}
              <div className="flex items-baseline justify-between gap-2 border-b border-borde px-3 pt-2 pb-2" style={{ opacity: 'var(--tablero)' }}>
                <span className="font-codigo text-micro tracking-wide text-tinta uppercase">{c}</span>
                <span data-cuenta="" className="font-codigo text-micro tracking-wide text-acento tabular-nums">
                  {animada ? '00' : String(PAPELES.filter((p) => p.columna === i).length).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
        </div>
        <ul role="list" aria-label="Lo que anda suelto en un negocio, ordenado en tres columnas">
          {PAPELES.map((p, i) => {
            const lugar = animada ? { left: p.x, top: p.y, giro: p.giro } : { left: LUGARES[i].x, top: LUGARES[i].y, giro: 0 }
            return (
              <li
                key={`${p.rotulo}-${p.texto}`}
                data-papel=""
                data-llego={animada ? undefined : ''}
                className="group absolute flex flex-col gap-1 overflow-hidden rounded-sutil border border-tinta/25 bg-fondo p-2 tablet:p-3"
                style={{
                  left: `${String(lugar.left)}%`,
                  top: `${String(lugar.top)}%`,
                  width: `${ANCHO_DEL_PAPEL.toFixed(3)}%`,
                  height: `${String(TABLERO.alto)}%`,
                  rotate: `${String(lugar.giro)}deg`,
                  boxShadow: '0 calc(var(--levantado, 0) * 18px) calc(var(--levantado, 0) * 36px) color-mix(in oklab, var(--color-tinta) calc(var(--levantado, 0) * 22%), transparent)',
                }}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-codigo text-micro tracking-wide text-tinta-media uppercase">{p.rotulo}</span>
                  <span aria-hidden="true" className="size-1.5 shrink-0 bg-acento opacity-0 transition-opacity duration-[var(--duracion-rapida)] group-data-llego:opacity-100" />
                </span>
                <span className="text-caption leading-snug text-tinta tablet:text-cuerpo">{p.texto}</span>
              </li>
            )
          })}
        </ul>
      </div>
      <p className="text-cuerpo leading-texto text-tinta escritorio:text-base" style={{ opacity: 'var(--cierre)' }}>
        {CIERRE_DEL_ORDEN}
      </p>
    </div>
  )
}
