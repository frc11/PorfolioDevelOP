import type { Metadata } from 'next'

import { Envoltorio } from '../_componentes/layout/Envoltorio'
import { Cuerpo, EtiquetaDeSeccion, Micro } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'

/**
 * ⚠️ INSTRUMENTO, NO PANTALLA. DEUDA CON FECHA DE BAJA.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ SE BORRA con su ruta hija `/v3/tipografia/muestra`.                     │
 * │ Baja: el día que /v3 reemplace al home, y a más tardar el 2026-12-31.   │
 * │ `robots: noindex, nofollow`. No forma parte del sitio.                  │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ── Qué destraba ──────────────────────────────────────────────────────────
 *
 * **Nadie miró los ocho niveles renderizados**, ni en la familia del sistema
 * original ni en Chivo. Es un pendiente declarado desde S0 y tiene un objeto
 * concreto: **la cap height de Chivo es 686 contra 720**, un 4,72% más chica a
 * igual tamaño en px. En los niveles de display, donde el texto va en Title
 * Case, la mayúscula domina el tamaño óptico percibido — así que un titular
 * que llenaba su caja en la familia sobre la que se calculó la escala se va a
 * leer ~5% más chico en Chivo aunque el número sea idéntico.
 *
 * En cuerpo de texto no se va a notar: ahí manda la x-height, y esa coincide
 * casi exacto (511 contra 510, factor 0,998, dentro de banda).
 *
 * Esta página no decide nada de eso. Lo pone donde se pueda mirar.
 *
 * ── Los cuatro anchos son tokens, no números ──────────────────────────────
 *
 * 375 es `--fluido-piso` y 1440 es `--fluido-techo` —las dos ANCLAS MEDIDAS de
 * la banda, y ninguna de las dos es un breakpoint—; 860 es `--breakpoint-medio`,
 * que cae adentro; y 1920 es `--container-tope`, donde la banda deja de
 * interpolar desde V3-C. Los cuatro se consumen por `var()`: si la banda se
 * moviera, esta página se mueve con ella.
 *
 * ⚠️ **EL CUARTO MARCO LO AGREGA V3-C, Y SIN ÉL ESTA PÁGINA NO MOSTRABA EL
 * CAMBIO.** Mientras la banda terminaba en 1440, el marco de `--fluido-techo`
 * era a la vez el ancla y el techo y alcanzaba con tres. Desde que la recta se
 * prolonga hasta `--container-tope`, el marco más ancho de los tres viejos
 * mostraba el ANCLA y ningún tamaño de arriba de ella: los cinco techos nuevos
 * no se veían en la única ruta que existe para mirarlos.
 *
 * El contenedor scrollea en horizontal a propósito. La alternativa sería
 * escalar los marcos para que entren, y un juicio óptico sobre tipografía
 * escalada no vale nada.
 */
export const metadata: Metadata = {
  title: 'v3 · tipografía — instrumento interno',
  description: 'Los ocho niveles en tres anchos. No forma parte del sitio público.',
  robots: { index: false, follow: false, nocache: true },
}

/** Los cuatro anchos, cada uno con el token del que sale. La clase va escrita
 *  entera: Tailwind escanea el fuente y no vería `w-[var(--${token})]`. */
const ANCHOS = [
  { id: 'piso', token: '--fluido-piso', px: '375px', clase: 'w-[var(--fluido-piso)]' },
  { id: 'medio', token: '--breakpoint-medio', px: '860px', clase: 'w-[var(--breakpoint-medio)]' },
  // `ancla` y no `techo`: desde V3-C este ancho es por donde PASA la recta
  // —donde cada nivel vale su token fijo—, no donde deja de interpolar.
  { id: 'ancla', token: '--fluido-techo', px: '1440px', clase: 'w-[var(--fluido-techo)]' },
  { id: 'tope', token: '--container-tope', px: '1920px', clase: 'w-[var(--container-tope)]' },
] as const

export default function PaginaTipografia() {
  return (
    <div className="bg-fondo text-tinta relative z-10 min-h-svh py-[var(--spacing-12)]">
      <Envoltorio>
        <div className="flex flex-col gap-[var(--spacing-6)]">
          <EtiquetaDeSeccion>Instrumento interno · deuda con fecha de baja</EtiquetaDeSeccion>
          <Titular nivel="titulo-l" como="h1">
            Los ocho niveles, en cuatro anchos
          </Titular>
          <Cuerpo className="max-w-[var(--breakpoint-medio)]">
            Cada marco es un viewport propio: los seis niveles fluidos usan{' '}
            <code className="font-codigo">clamp()</code> con <code className="font-codigo">vw</code>, que
            se resuelve contra el viewport y no contra el contenedor. Sin marcos, los cuatro anchos
            mostrarían el mismo tamaño. Nada está escalado.
          </Cuerpo>
        </div>
      </Envoltorio>

      <div className="mt-[var(--spacing-12)] w-full overflow-x-auto">
        <div className="flex w-max items-start gap-[var(--spacing-8)] px-[var(--pad-lateral-compacto)]">
          {ANCHOS.map((ancho) => (
            <figure key={ancho.id} className="flex flex-col gap-[var(--spacing-2)]">
              <figcaption>
                <Micro como="span" className="font-codigo uppercase opacity-casi">
                  {`${ancho.px} · var(${ancho.token})`}
                </Micro>
              </figcaption>
              <iframe
                src="/v3/tipografia/muestra"
                title={`Muestra tipográfica a ${ancho.px}`}
                loading="lazy"
                // `border-borde` y no una tinta con alfa: `--color-borde` ES
                // el token del separador decorativo, y se da vuelta solo en la
                // sección invertida.
                className={`${ancho.clase} border-borde h-svh border`}
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
