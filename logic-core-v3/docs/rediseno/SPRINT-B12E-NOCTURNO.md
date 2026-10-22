# SPRINT B12E · NOCTURNO — el Portfolio en el teléfono y la tablet: el carrusel (2026-10-22)

Tarea T0-B1.2e de la cola (`docs/cola/2026-10-22/10-T0-pendientes.md`, la sección «B1.2e», y el punto 6 de `11-T0-extra.md`). Rama
`nocturno/2026-10-22-b12e`. Plan arriba, log abajo, qué mirar al final. La verificación en el navegador la hace el orquestador.

---

## 1. El plan

**El pedido, al pie de la letra (servicios):** debajo de 1024 (incluido 768) las historias salen del Portfolio; primero el título
«Portfolio» y después un CARRUSEL que no ocupa toda la pantalla, sin trampa de scroll; cada tarjeta con el video del proyecto y TODA la
información de antes; la rotación cada 10 s con una línea que se llena, mantener apretado pausa, flechas y deslices de costado, pausa fuera de
la vista y con movimiento reducido, el reloj que vuelve a empezar en cada cambio y la vuelta infinita en los dos sentidos; debajo, «la tuya»
como bloque propio (el formulario que ya existe) y después Demos. El escritorio (≥ 1024) intacto.

**Lo que había (lectura):**
- `Trabajos.tsx`: la sección entera es un pin (`EscenarioDelPortfolio`, pegado una pantalla) sobre 1025,67svh: la aproximación (900 de la
  regla), cuatro pasos de 1,5 pantallas y la cola (la salida y Demos, 2.931). Debajo de 1024 el CSS decidía las historias
  (`--modo-del-portfolio`) y el panel montaba `HistoriasDelPortfolio` (el componente común `_componentes/historias/`), con el dedo frenado
  (`touch-action: none` y el `touchmove` cancelado): la trampa de scroll.
- La REGLA DE ALTURAS del Portfolio: `TRAMO_ESTIRADO` (`tramoDelSelector.ts`), `k = 5.400 / lo que la escena veía` por ancho (tablet 3.722,
  teléfono 4.462 de la regla).
- Demos llega con un reloj que se cuenta desde el arranque de la cola (`mostradoDeDemos`).

**La estructura (decidida):**
- **Un componente común, reusable** (`_componentes/carrusel/`): `maquinaDelCarrusel.ts` (puro: la rotación, la vuelta, el reloj, las pausas,
  los deslices) y `CarruselDeTarjetas.tsx` (una tarjeta a la vez, todas montadas en la misma celda para que el alto no salte; las flechas en
  el disco del botón de sonido; una línea por tarjeta, la de ahora se llena; la vista con `touch-action: pan-y`; nada se cancela). No sabe
  del Portfolio: B5 lo usa con las demos.
- **Debajo de 1024 la sección deja de ser un pin de pasos**: un FLUJO que se scrollea (`FlujoDelPortfolio.tsx`), hermano de la caja del
  Portfolio, con tres pantallas (cada pieza centrada en la suya, debajo de la barra): el título, el carrusel de los tres proyectos
  (`TarjetaDelProyecto.tsx`) y «la tuya». Después, la cola de siempre: el escenario pegado queda sólo para Demos (`escenario-de-demos`).
- **El alto**: el flujo mide lo que mide y nunca menos que el medio de la tabla (3,3133 pantallas, 2.982 de la regla); detrás siguen la
  pantalla de la cola y la cola (4,2567 pantallas). Con el flujo en su mínimo la sección mide exactamente la tabla (757svh): el alto mínimo del
  panel no la estira por el final. La variable de los pasos va en cero (`PANTALLAS_EXTRA_CON_EL_CARRUSEL`).
- **La escena (REGLA DE ALTURAS)**: el mismo `TRAMO_ESTIRADO`, con el medio medido en el DOM (`useMedioDelCarrusel`): `k = medio /
  lo que veía` (`tramoDelCarrusel`). Afuera del flujo la escena ve lo de hoy, bit a bit, con el medio que sea (s76 §48). El reloj de Demos
  arranca donde termina el flujo (`mostradoDeLaCola`); Demos sabe dónde está su cola (el foco del teclado, `salidaDeLaCola`).
- **Sin trampa**: con el carrusel nada se le pide al orden (ni la cámara con el oscurecido, ni el título del escenario, ni la barra, ni el
  panel), la rueda no manda ni atrapa la entrada, el clic afuera no sale; el flujo y la tarjeta no pegan nada ni cancelan el dedo.
- **Lo que se va**: `HistoriasDelPortfolio.tsx` y `HistoriaDelProyecto.tsx`; las variantes de las historias en `orden.ts` (F5, F5b) y en el
  encabezado (la subida de 55svh); los dos defectos de las historias; el banco `historias.ts` y su cuenta (los reemplaza `carrusel.ts`).
- **El banco nuevo** (`scripts-carga/carrusel.ts`, la cuenta pura en `carrusel-cuenta.ts`): la matriz a 390, 768, 820 × 1180 y
  1023 × 768, con sus dos controles inyectados (la trampa de las historias y el observador que miente). No lo corre este subagente.

**Riesgos:**
- La escena detrás del carrusel: sin el oscurecido ni la pose del Portfolio, se ve la cámara del scroll en ese tramo (p 0,475 → 0,55,
  más rápida con `k` < 1). No se pudo mirar: lo mira el orquestador.
- El texto sobre la escena (el título y la bajada) va sin hoja; las tarjetas y «la tuya» llevan la hoja de la ficha de las historias (AA
  medido en F7 sobre video). Hay que medir el AA del título sobre la escena de noche.
- El alto estimado a 390 × 844: la tarjeta ~650 px y «la tuya» ~690 px, justos en su pantalla; si una pantalla no entra, crece y el medio
  con ella (la escena lo sabe por la medida). El banco imprime los altos.
- Antes de hidratar, el marcado servido es el de escritorio (el modo se lee en el cliente, como las historias): con un ancla en la URL, el
  primer cuadro puede ser el del pin. El ancla se vuelve a poner cuando el CSS decide el carrusel.

---

## 2. Log

**Hecho (2026-10-22, noche):**

1. **El componente común** — `_componentes/carrusel/maquinaDelCarrusel.ts` y `CarruselDeTarjetas.tsx`.
   - La máquina: 10 s por tarjeta; a los 10 s la siguiente (sin sonar); después de la última, la primera; la anterior desde la primera, la
     última; el reloj en cero en cada cambio (las flechas, el deslice, el tiempo o un salto desde afuera: `reinicio` vuelve a cero el medio);
     pausas: mantener apretado (200 ms quieto), fuera de la vista (menos de la mitad a la vista, o la pestaña oculta), movimiento reducido y
     el foco del teclado adentro (`:focus-visible`, WCAG 2.2.2); pausado, el reloj no se pierde. Deslices: de costado (más de 8 px, más de
     costado que vertical, al menos 40 px) cambian; vertical, nada (es de la página). Un cuadro cuenta a lo sumo 100 ms.
   - El componente: las tarjetas en la misma celda (la activa encima, las otras invisibles, `inert` y `aria-hidden`); la transición, la que
     se va en 180 ms corriéndose 16 px hacia su lado y, después (el respiro), la nueva en 320 ms desde el otro, con la curva de la casa (con
     movimiento reducido, el corte); las flechas con el disco del botón de sonido (`CLASE_DEL_BOTON_PAUSA`) y lucide de trazo 1,5; una línea
     por tarjeta (la de ahora, un valor de Motion: sin renders por cuadro); ← → con el foco adentro; `aria-live` apagado mientras rota; un tic
     por deslice (las flechas suenan solas). El reloj corre con `requestAnimationFrame` sólo mientras rota.
2. **El Portfolio debajo de 1024** — `Trabajos.tsx`, `EscenarioDelPortfolio.tsx`, `FlujoDelPortfolio.tsx`, `TarjetaDelProyecto.tsx`.
   - El CSS escribe `--modo-del-portfolio: carrusel` debajo de 1024 y el cliente lo lee (`carruselDe`).
   - El flujo: «Portfolio» con su bajada (el encabezado de siempre, con su P2 al cruzar la línea del gatillo del contrato y un fundido: nunca
     asoma cortado), el carrusel y «la tuya» (el título, la frase, la bajada y `FormularioDeLaTuya`, con el «?» que se arma detrás), cada uno
     en su pantalla; el carrusel y «la tuya» entran con el `Gatillo` del contrato. Las anclas de los proyectos van en la pantalla del carrusel
     (y lo llevan a ese proyecto); la de «la tuya», en la suya.
   - La tarjeta: el video de escritorio (16:10, contenido; sin el enlace encima: mantener apretado sobre un enlace abre el menú del teléfono),
     el nombre (h3) y el rubro con «Visitar sitio ↗» a la derecha, y la `Ficha` de la tira entera (con `compacta`: en el teléfono los valores
     en `caption`), con su secuencia al activarse, y la marca de agua. Toda la información de `PROYECTOS`: **ningún texto se acortó**.
3. **La REGLA DE ALTURAS** — `medioDelCarrusel.ts`, `useMedioDelCarrusel.ts`, `tramoDelSelector.ts` (`tramoDelCarrusel`), `usePortfolio.ts`.
4. **Demos** — `pasos.ts` (`mostradoDeLaCola`, `pxDelMostradoDeLaCola`) y `CapaDeDemos.tsx` (la prop `salidaDeLaCola`, opcional: el foco
   del teclado la trae a su cola, esté donde esté).
5. **Lo que se fue** — las dos piezas de las historias del Portfolio, sus variantes en `orden.ts`, `useOrdenDeLaEscena.ts`,
   `EncabezadoDelPortfolio.tsx` (la subida queda como `seFunde`, sólo el fundido) y `medida.ts` (dos defectos), las salidas en
   `useMandosDelPortfolio.ts`, `useAnclaDeLaCarga.ts` (ahora sabe del carrusel), y el banco `historias.ts` con su cuenta.
6. **Los invariantes** — reemplazados por la spec, con su control (ver la tabla).

**Las afirmaciones reemplazadas porque cambió la spec** (ninguna debilitada; cada una con su control):

| Dónde | Antes | Ahora |
|---|---|---|
| s76 §27 (B1.2d B, T2) | el CSS decide las historias; el escenario las monta | §44: el CSS decide el carrusel; ninguna pieza de la sección importa las historias |
| s76 §28 (T4) | la ficha corta de la historia | §46: la tarjeta trae TODA la información, de `PROYECTOS` (control: la ficha corta) |
| s76 §29 (P-H19) | el Portfolio con cuatro ítems | la máquina común con una lista de cuatro de prueba (la última sin tiempo) |
| s76 §30 (T8, T1) | además, la rueda del Portfolio salía de las historias | el freno del componente común y su tic; la rueda sin trampa con el carrusel, §45 |
| s76 §31 (T3) y §42 (F5, F5b) | la entrada del título, el orden con las historias y la cuenta de `historias-cuenta.ts` | §45: con el carrusel nada se pide al orden; §47: el flujo en su orden; §49: la cuenta de `carrusel-cuenta.ts` |
| s76 §43 (P-H31) | el Portfolio no pasa las dos props (leía `HistoriasDelPortfolio.tsx`) | sin las dos props, el marcado por defecto |
| s76 b12c §19 | el pedido con `historias` y `pideElEncabezado` | `adentro && !carrusel ? ADENTRO : AFUERA` |
| s76 b12d §33 | `ir` salía de las historias | `ir: (d) => ir(d, true)` |
| s76 escena (el vidrio) | el vidrio fuera de las historias | el vidrio siempre (debajo de 1024 no hay panel) |
| `trabajos.invariant` §6 y §9 | los dos rótulos de las historias; 37 archivos | las dos flechas del carrusel; 40 archivos (las cinco del carrusel) |
| `s5-compacto` | la excepción de las historias | la de las flechas del carrusel |
| `s5-archivos` | las dos piezas de las historias | las cinco del carrusel |

Nuevo: `s76-carrusel.invariant.tsx` (`test:s76-carrusel`, el componente común) y `s76-portfolio-carrusel.tsx` (§44 a §49, desde
`s76-portfolio.invariant.tsx`).

**Decisiones sin preguntar** (una línea cada una):
- El video de la tarjeta es el de escritorio (16:10): la tarjeta es apaisada en todo ancho; el del teléfono (vertical) ocupaba la pantalla.
- Debajo de 1024 la escena va sin la pose del Portfolio ni el oscurecido (el `camara` del orden queda afuera): el carrusel no ocupa la
  pantalla y el logo «en su hueco» no tiene hueco; las tarjetas llevan su hoja para el AA.
- El reloj también pausa con el foco del teclado adentro (WCAG 2.2.2), además de lo pedido.
- Cada pieza del flujo va en su pantalla (centrada), y el resto del mínimo del flujo queda al final, como respiro antes de Demos.
- «La tuya» lleva la misma hoja que las tarjetas y el «?» que se arma al cruzar la línea.
- En el teléfono la ficha de la tarjeta va en `caption` (los mismos textos, más chicos) para que la tarjeta no ocupe la pantalla.
- El ancla de un proyecto lleva el carrusel a ese proyecto; `#trabajos` y el viaje de la barra, a El Garage en el carrusel.

---

## 3. La REGLA DE ALTURAS: los altos y la `k`

La sección, antes (los pasos, en todo ancho): 1025,67svh (9.231 de la regla). Ahora, debajo de 1024: el flujo (como mínimo 331,33svh) más
425,67svh; con cada pieza en su pantalla, el flujo queda en su mínimo y la sección mide 757svh (la tabla). Desde 1024, igual que antes.

| Ancho × alto | Antes (px) | Ahora, con el flujo en su mínimo (px) | `k` antes | `k` ahora (medio 2.982) |
|---|---:|---:|---:|---:|
| 1440 × 900 | 9.231 | 9.231 (sin cambios) | 1,81087 | 1,81087 |
| 1024 × 768 | 7.877 | 7.877 (sin cambios) | 1,81087 | 1,81087 |
| 1023 × 768 | 7.877 | 5.814 | 1,45083 | 0,80118 |
| 820 × 1180 | 12.103 | 8.933 | 1,45083 | 0,80118 |
| 768 × 1024 | 10.503 | 7.752 | 1,45083 | 0,80118 |
| 390 × 844 | 8.657 | 6.389 | 1,21022 | 0,66831 |

`k = medio / lo que la escena veía` (3.722 de la regla en tablet, 4.462 en el teléfono, que el CSS decide abajo de 426). Si una pantalla del
flujo no entra en su alto, el flujo crece y la `k` con él: la mide el DOM (`useMedioDelCarrusel`) y el banco la imprime (caso `modo`). La
deriva en el navegador la mide el orquestador.

---

## 4. Qué mirar (el orquestador, en el navegador)

Ver el reporte del subagente (la lista con URL, ancho, acción y qué debería verse) y el banco `scripts-carga/carrusel.ts`.
