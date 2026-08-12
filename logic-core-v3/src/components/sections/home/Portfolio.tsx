import {
  ChapterLabel,
  CtaButton,
  DataStat,
  DisplayHeading,
  MonoLabel,
  RuleDivider,
  SectionShell,
  Surface,
} from '@/components/design-system'

/**
 * S2 del home — la prueba. Tema crema.
 *
 * Lámina de case study: UN caso real arriba, demos conceptuales abajo, en ese
 * orden y con esa jerarquía. Reemplaza al carrusel de 6 tarjetas que mezclaba
 * el único cliente real con cinco propuestas inventadas y les daba el mismo
 * tratamiento visual.
 *
 * **Server Component, cero JS.** No lleva `'use client'`: el reveal es la
 * animación CSS del sistema (`animate-ds-reveal`), no Framer. La versión
 * anterior traía `useState`, `useRef`, `useInView`, `useMotionValue`,
 * `useTransform` y `AnimatePresence` para un carrusel de demos — todo eso se
 * fue con el carrusel.
 *
 * **Sin acentos.** La sección corre en crema, y tres de los cuatro acentos no
 * llegan a 3:1 sobre ese lienzo (cian 2.10, verde 2.19, ámbar 1.86). Es la
 * Regla del Acento sobre Oscuro; acá no hay excepción que pedir.
 *
 * **Un solo árbol JSX.** El responsive va por clases. El componente viejo
 * servía `PortfolioDesktop` y `PortfolioMobile` completos y los ocultaba con
 * `hidden md:block` / `block md:hidden`: los dos árboles viajaban en el HTML,
 * que es parte de por qué el documento pesaba 465 KB.
 *
 * `id="portfolio"` lo consume `Navbar` (`MAIN_NAV_ITEMS` y `HASH_TO_LABEL`).
 * No se renombra.
 */

// ─── Contenido ───────────────────────────────────────────────────────────────

/**
 * Lo que todavía no existe fuera de la cabeza de Franco va acá, marcado y en un
 * solo lugar. La forma es la del texto final (misma extensión, misma
 * estructura); el contenido dice que falta. Ninguna cifra inventada: el sitio ya
 * tuvo un claim fabricado que sobrevivió dos auditorías.
 *
 * GATE DE MERGE: ninguna rama con estos placeholders a la vista se mergea a
 * main. La lista consolidada, con archivo y línea, va en la bitácora al cerrar
 * B3.
 */
const CASO = {
  cliente: 'Concesionaria San Miguel',
  rubro: 'Concesionaria — Tucumán',
  contexto: '[CONTEXTO — 1 línea: qué perdían antes de develOP]',
  entregable:
    '[ENTREGABLE — 2 a 3 líneas: el sistema concreto que se entregó. No "un sitio web": qué hace, quién lo usa adentro de la concesionaria y qué reemplazó.]',
  href: '[URL DEL CASO]',
} as const

/**
 * El VALOR es placeholder; el LABEL no. El label es la categoría de lo que se
 * midió —una decisión de qué mostrar, que ya está tomada— y escribirlo es lo
 * que deja juzgar si la fila de datos tiene el peso que necesita.
 */
const RESULTADOS: readonly { value: string; label: string }[] = [
  { value: '[+00%]', label: 'Consultas canalizadas' },
  { value: '[00 días]', label: 'Tiempo a producción' },
  { value: '[000]', label: 'Vehículos publicados' },
]

/** La terna de verticales es decisión comercial pendiente. */
const DEMOS: readonly { rubro: string; que: string }[] = [
  { rubro: '[RUBRO 1]', que: '[QUÉ RESUELVE — 1 línea]' },
  { rubro: '[RUBRO 2]', que: '[QUÉ RESUELVE — 1 línea]' },
  { rubro: '[RUBRO 3]', que: '[QUÉ RESUELVE — 1 línea]' },
]

// ─── Piezas ──────────────────────────────────────────────────────────────────

/**
 * Campo del caso: etiqueta mono arriba, cuerpo abajo, regla de 1px como
 * separador. El mismo patrón que el esqueleto del styleguide, ya calibrado.
 */
function CaseField({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-ds-rule pt-5">
      <MonoLabel>{label}</MonoLabel>
      <p className="max-w-ds-prose text-ds-body text-ds-fg">{children}</p>
    </div>
  )
}

// ─── Sección ─────────────────────────────────────────────────────────────────

export function Portfolio() {
  return (
    <SectionShell theme="light" id="portfolio">
      <div className="animate-ds-reveal flex flex-col gap-12 md:gap-16">
        {/*
          Número solo, sin título. Es el formato que fijó B1-S5 para el home: el
          título del ChapterLabel repetía el titular de la sección, que va justo
          abajo. Lo que el título decía —"LA PRUEBA"— lo dice el MonoLabel de al
          lado, que es la etiqueta del contenido y no un segundo kicker.
        */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ChapterLabel number="02" />
          <MonoLabel>Caso real</MonoLabel>
        </div>

        <DisplayHeading size="lg" as="h2">
          Esto ya funciona.
        </DisplayHeading>

        <div className="flex flex-col gap-2">
          {/*
            El nombre del cliente NO es un CaseField: es el sujeto de toda la
            sección y va en la escala del subhead, no en la del cuerpo.
          */}
          <MonoLabel>{CASO.rubro}</MonoLabel>
          <p className="font-ds-sans text-ds-subhead font-medium text-balance text-ds-fg">
            {CASO.cliente}
          </p>
        </div>

        {/* La narración del caso en dos columnas; los datos van abajo, aparte. */}
        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          <CaseField label="Contexto">{CASO.contexto}</CaseField>
          <CaseField label="Qué construimos">{CASO.entregable}</CaseField>
        </div>

        {/*
          Los resultados van a ANCHO COMPLETO y no dentro de una columna al lado
          de la narración. No es una preferencia de composición: `--text-ds-data`
          llega a 48px en mono, y tres cifras de 6-9 caracteres necesitan ~170px
          cada una. Metidas en la mitad angosta de un grid de dos columnas
          quedaban en ~150px y se pisaban entre ellas — medido a 1440. A ancho de
          página cada una tiene ~380px y respira.

          Además es lo que la sección quiere decir: en la lámina de la prueba, la
          cifra es el objeto principal, no una nota al margen de la narración.
        */}
        <Surface padding="lg" className="flex flex-col gap-8">
          <MonoLabel>Resultados</MonoLabel>

          {/*
            Una sola columna en mobile: tres cifras de `--text-ds-data` (32px en
            su piso) lado a lado a 390px se comprimen hasta dejar de leerse como
            dato duro.
          */}
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
            {RESULTADOS.map((resultado) => (
              <DataStat key={resultado.label} value={resultado.value} label={resultado.label} />
            ))}
          </div>

          <RuleDivider />

          <div className="flex flex-col items-start gap-4">
            <CtaButton tone="secondary" href={CASO.href} target="_blank">
              Ver el sitio
            </CtaButton>
            <p className="max-w-ds-prose text-sm leading-relaxed text-ds-fg-muted">
              Ninguna cifra de esta sección está estimada. Las casillas quedan con el placeholder a
              la vista hasta que Franco cierre los números del caso.
            </p>
          </div>
        </Surface>

        {/* ── Bloque secundario: demos por rubro ── */}
        <div className="flex flex-col gap-8 border-t border-ds-rule pt-12 md:pt-16">
          <div className="flex flex-col gap-3">
            <MonoLabel>Demos conceptuales</MonoLabel>
            {/*
              La honestidad acá es un activo, así que la aclaración va en el
              cuerpo de la sección y no en una nota al pie en gris chico, que es
              donde estaba antes.
            */}
            <p className="max-w-ds-prose text-ds-body text-ds-fg-muted">
              Sistemas que armamos para mostrar cómo se aplica a cada rubro. No son clientes: son
              demostraciones.
            </p>
          </div>

          <ul className="grid gap-px border border-ds-rule bg-ds-rule sm:grid-cols-3">
            {DEMOS.map((demo) => (
              // Grid de 1px: el `gap-px` sobre fondo de regla dibuja las líneas
              // divisorias sin que cada celda tenga que declarar bordes que se
              // dupliquen en los encuentros. Sin glow, sin sombra, sin radio.
              <li key={demo.rubro} className="flex flex-col gap-3 bg-ds-canvas p-6">
                <MonoLabel>Demo conceptual — {demo.rubro}</MonoLabel>
                <p className="text-ds-body text-ds-fg-muted">{demo.que}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  )
}
