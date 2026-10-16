> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# Diseño

> **Borrador E11** · base `57c421bc` · destino propuesto `logic-core-v3/docs/DISENO.md`.
> Tres superficies con sistemas distintos: sitio público, portal y admin, LeadOS. raíz:DESIGN.md y raíz:PRODUCT.md se mantienen (son el insumo de la herramienta Impeccable) y esta página los cita.
> Fuentes: rutas relativas a `logic-core-v3/`; `CE` y `CP` = contexto estable y profundo del Drive. **[A DECIDIR]** = contradicción sin resolver.

## 1. Sitio público

- En producción está la **home clásica** (Hero, About, PortalDemo, TodoIncluido, ModulosOpcionales y demás) (src/app/page.tsx:7-19). El rediseño vive experimental en `origin/redesign/home` (docs/bitacora-rediseno.md:3604-3610). Cómo volver a él: docs/bitacora-rediseno.md:3720-3736, recuperable con `git show 57c421bc:logic-core-v3/docs/bitacora-rediseno.md`.
- Dirección escrita del rediseño en raíz:DESIGN.md: monocromo cálido, Geist y Geist Mono, un acento por servicio solo sobre oscuro, plano y sin sombras ambientales, sin glass ni `backdrop-blur` (DESIGN.md:86-101, 166-170, 209-211, 289-291).
- **[A DECIDIR]** Dirección visual del sitio v3: DESIGN.md (Geist) contra la investigación de agosto (Instrument Sans, GSAP, Lenis, Sanity, canvas WebGL persistente; `docs/_insumos/drive/Franco/Work Flow/04-MAPA (1).md:89-104`) y contra «estética en definición» (CP:169). El código usa Geist y no tiene gsap ni sanity (src/app/layout.tsx:2; package.json).
- **[A DECIDIR]** El 3D del hero: «no tocar» o «eliminar»; hoy sigue con R3F (src/components/layout/Hero.tsx:3-9).
- Navegación: siempre `triggerTransition()`, nunca `router.push()` (raíz:CLAUDE.md:12-14).
- Acentos por servicio: DECISIONES D-55.
- Voz: voseo, frases cortas, datos antes que adjetivos, sin jerga de agencia; restraint = premium (CE:66-70; raíz:PRODUCT.md:62-67). Nada que no exista (raíz:PRODUCT.md:75, 83).
- Accesibilidad: CustomCursor y NoiseOverlay fuera (D-53).

### 1.1 Performance

- La regresión de la home clásica se aceptó de forma declarada (docs/bitacora-rediseno.md:3683-3693). Línea base mobile anterior al rediseño: Lighthouse 34/100, LCP 6,1 s, JS inicial 723 KB (docs/sprints/sprint-b0-bis-cierre.md:57-60).
- El widget arrastra 438 kB gz a toda ruta pública, 230 kB de three/R3F por los avatares 3D importados estáticos; diferir el widget no mueve el LCP (docs/probe-bundle-inicial.md:8-24).
- Plan B vigente para sacar three del inicio: `BrandedIntroCanvas` dinámico dentro de `MarketingIntro` (MarketingIntro.tsx:19-20); Preloader importa `MarketingIntro` de forma estática (Preloader.tsx:10).
- No tocar: el code-splitting del home, los canvas con `ssr:false`, las libs de PDF lazy, el widget lazy, las queries ya paralelizadas, el runtime del bot (R2) y el cache del admin (R3) (docs/auditoria-total-pre-deploy.md:75-90).
- Impeccable: 115 warnings (56 gray-on-color, 37 gradient-text, entre otros) sobre `redesign/home` en c216079 (docs/impeccable-baseline.md; docs/impeccable-baseline.json). La herramienta vive en raíz:.github/skills/impeccable/.

## 2. Portal del cliente y admin

- Tokens del portal: zinc-950, cian único, radios de 16 a 24 px, motion sobrio, desde `@/lib/design-tokens` (docs/design-system.md). **[A DECIDIR]** glassmorphism: el portal lo usa sutil (docs/design-system.md:7) y raíz:CLAUDE.md:97 lo fija como patrón.
- Valores canónicos del admin (mayo, vigencia a confirmar): `p-5` en cards, `p-6` en secciones, `rounded-2xl` (hero `rounded-3xl`), `space-y-6` y `space-y-3`, `border-white/10` (énfasis `/20`), `bg-white/[0.02]` (hover `/[0.04]`) (docs/design-system-audit.md:88-97).
- Lucide siempre con `strokeWidth={1.5}`; `AnimatePresence` con `mode=wait` (raíz:CLAUDE.md:95-96).
- `<Select>` compartido con chevron; los status selectors con `Loader2` (`ticket-chat.tsx`, `TicketStatusSelector.tsx`) quedan nativos (raíz:CLAUDE.md, lección del Select compartido).
- Modales portaleados a `body` por el `backdrop-filter` (D-50). Playground vigente: `/styleguide` (D-45).
- **[A DECIDIR]** Librería de animación: raíz:CLAUDE.md:3 y :80 dicen Framer Motion; package.json:153 tiene `motion` y 3 archivos todavía importan `framer-motion` sin que esté instalado (About.tsx, Portfolio.tsx, KineticText.tsx).

## 3. LeadOS

- Color semántico: cian = acción (docs/b9-plan-visual.md:28, 63), vigencia a confirmar; hay 111 clases cian literales sin token (docs/auditorias/A3-VIABILIDAD-BIS-2026-08.md).
- Consistencia: usar `Callout` y no cajas a mano, eyebrow con el token de 0.24em, una sola familia de sombras (docs/auditoria-consistencia-setter.md).
- Dos perfiles visuales de documentos: documentación interna print-first y biblioteca del setter screen-first (CE:71).

## 4. 3D

- `src/components/3d/HeroArtifact.tsx` está congelado (raíz:CLAUDE.md:163).
- `dpr={[1, 1.5]}` como máximo e `IntersectionObserver` en toda animación pesada (raíz:CLAUDE.md:70-71).
- En canvas chicos transparentes no va EffectComposer: el glow se finge con sprites additive (`CoreHalo.tsx`) (raíz:CLAUDE.md:191-192).
