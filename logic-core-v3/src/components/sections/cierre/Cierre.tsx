import {
  ChapterLabel,
  CtaButton,
  DisplayHeading,
  Lead,
  MonoLabel,
  SectionShell,
} from '@/components/design-system'
import { getWhatsappHref } from '@/lib/whatsapp'
import { ContactoCta } from './ContactoCta'

/**
 * S6 del home — el cierre. Tema crema.
 *
 * La sección que faltaba. El esqueleto de B1-S5 la tenía (`( 06 )`, "Empecemos
 * por una llamada.", dos CTAs) pero no existía como componente, y B4-S3 borra
 * `PortalDemoCTA`, que era la llamada a la acción del home hasta hoy. Sin esta
 * sección la demolición dejaba la página terminando sin ningún cierre.
 *
 * **Cierra en claro, y eso es deliberado.** La alternancia estricta la pone en
 * crema, lo que obliga a resolver el CTA sobre lienzo claro — era un hueco real
 * del sistema: los 22 botones del styleguide vivían sobre oscuro y el relieve
 * estaba calculado contra fondo oscuro. Con `--shadow-ds-control` invertido por
 * tema, el mismo componente se apoya bien en los dos.
 *
 * **Server Component.** El único JS es el CTA secundario (`ContactoCta`), que
 * está aparte justamente para no arrastrar la sección entera al cliente.
 *
 * **Sin `id`.** Ningún consumidor ancla acá: el Navbar manda "Contacto" a
 * `/contact`, que es una página propia, y la tool `navigate_to_page` del chatbot
 * tampoco lo lista. Agregarle un ancla sería inventar un destino que nadie pide.
 */

/**
 * La promesa de tiempo NO está verificada y por eso va marcada.
 *
 * El esqueleto proponía "Te respondemos hoy. Coordinamos una llamada de 30
 * minutos": son dos claims —un tiempo de respuesta y una duración— y ninguno de
 * los dos está en la lista de datos reales. Los timelines de entrega (15/7/5
 * días) sí lo están, pero son otra cosa: cuánto tarda el trabajo, no cuánto
 * tarda la respuesta.
 *
 * GATE DE MERGE: ninguna rama con este placeholder a la vista se mergea a
 * `main`.
 */
const PROMESA = '[TIEMPO DE RESPUESTA Y DURACIÓN DE LA LLAMADA — a definir con dato real]'

export function Cierre() {
  return (
    <SectionShell theme="light">
      <div className="animate-ds-reveal flex flex-col items-start gap-8 md:gap-10">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ChapterLabel number="06" />
          <MonoLabel>Contacto</MonoLabel>
        </div>

        <DisplayHeading size="lg" as="h2">
          Empecemos por una llamada.
        </DisplayHeading>

        {/*
          Lo único que afirma es lo que la sección 04 ya demostró: que del otro
          lado está el que construye. No hay un segundo claim escondido acá.
        */}
        <Lead>
          Hablás directo con el ingeniero que lo va a construir, sin un ejecutivo de cuentas en el
          medio.
        </Lead>

        <p className="max-w-ds-prose text-ds-body text-ds-fg-muted">{PROMESA}</p>

        <div className="flex flex-wrap items-center gap-4">
          {/*
            Destino externo: va por `href`, igual que el CTA del hero. El número
            sale de `lib/whatsapp.ts`, que es la fuente única del sitio — antes
            convivían seis literales distintos para el mismo número.
          */}
          <CtaButton href={getWhatsappHref()} target="_blank">
            Escribinos por WhatsApp
          </CtaButton>

          <ContactoCta />
        </div>
      </div>
    </SectionShell>
  )
}
