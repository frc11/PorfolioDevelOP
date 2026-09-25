# SPRINT ESCENA 2 — base limpia y exploración del entorno

Rama `rediseno/home` · dev 3000 · candado de Chrome (`scratchpad/candado.sh`; el candado vive en
`~/.cache/b4-medicion/chrome.lock` y se borra solo al terminar).

## Parte A — la base limpia (commit + tag `escena-base-limpia`)

### Qué se aplicó

La escena del producto (y la de `/probe-escena`, que usa el mismo `ProbeStage`) quedó así:

- **sin las marcas del piso**: se borraron `floorMarks.ts`, `InstancedBars.tsx`, los colores de las
  marcas y `BarPlacement` de `probeScene.ts`;
- **sin la celosía** (la sombra de la cúpula): se borró `celosiaShader.ts` y se sacó su cableado de
  `StudioFloor`, `ProbeLogo`, `ProbeStage`, `OrbitRig` y `lightRig` (el bloque 6b);
- **sin la sombra del logo** que giraba con el sol:
  - no hay mapa de sombras: se fueron `shadows` del Canvas, `castShadow`/`receiveShadow`, las
    props `shadow-*` de la principal, el bloque del mapa en `OrbitRig`, `SOMBRAS_DEL_CANVAS`,
    `sombraPx`/`sombraRadio` y las constantes `SHADOW_*`;
  - la oclusión de contacto sigue apoyando el logo;
- **bruma 42 → 110**, que arranca detrás del logo;
- **sin reflejo**, sin la bandera vieja (`variante.ts`) y sin la rama V3 (las motas compactas).

Se quedan, porque no proyectan nada y sacarlos movería la luz o el preloader:
- el factor de cielo del hemisférico (`probeCelosia.ts`);
- `celosiaGeometry.ts` y `celosiaPenumbra.ts`, que usan el intro y el panel del laboratorio;
- la deriva de la textura de la envolvente.

### ¿El logo quedó idéntico? Sí.

El logo se midió como la mancha oscura conexa más grande de la escena sola
(`scripts-escena/logo-componente.ts`), en tres tomas a 1 s a 1440 × 900. Resultados:

| Momento | Variante | Caja (x · y) | Centro | Área |
|---|---|---|---|---|
| Por qué develOP | ACTUAL | 430–1011 · 247–652 | (727,5 · 418,1) | ~105.000 |
| Por qué develOP | base aplicada | 430–1009 · 249–651 | (726,3 · 418,2) | ~104.400 |
| Pie | ACTUAL | 598–841 · 365–534 | (721,9 · 436,9) | ~17.900 |
| Pie | base aplicada | 598–841 · 365–534 | (722,0 · 437,0) | ~18.100 |

- **Por qué develOP:** la base aplicada difiere de ACTUAL en 1–2 px de borde y 1,2 px de centro. Es
  el canto que la celosía oscurecía, no pose ni tamaño.
- **Pie:** la caja es la misma al píxel.
- La base por bandera dio lo mismo antes de aplicarla.
- La diferencia de tamaño y pose que asomó en la primera corrida era una hoja vieja
  (`actual-v1.png`), no la escena.

### Los invariantes

- **Nuevo:** `test:s28-base`, 19 afirmaciones, con controles positivos en cada barrido. Afirma:
  - sin sombras, sin gobo, sin marcas, sin reflejo y sin bandera: lee el código sin comentarios;
  - la bruma derivada de los keyframes y del estudio:
    - la pose más lejana ve el logo a 40,3 y su borde (a 43,9) se vela un 0,23 %;
    - la pared detrás del logo en esa pose cae entera en la niebla;
    - con la bruma vieja (20 → 150) el mismo medidor ve el velo y la pared asoma;
  - la oclusión de contacto montada.
- **Reescrito:**
  - `s7-sol`: la key apunta exactamente al sol del arco, con control del comparador;
  - `s12-penumbra`: sin la sección del GLSL, la perilla del panel se queda;
  - `s8-escena`: la lista de módulos mudados, de 29 a 26.
- **Retirado:** `s11-celosia`. Probaba el enganche del gobo contra three, y el gobo ya no existe.
- **En verde:** `tsc --noEmit`; eslint sobre el alcance; y las suites `s7e-*`, `s9e`, `s10e-*`,
  `s11e`, `s12e`, `s8-escena`, `s9-instrumentos`, `s9-sentry`, `s10-raf` (con sus 2 fuera de
  ventana de siempre), `s14e`, `s15e-*`, `s16-arnes`, `s18`, `s19-sincronia`, `s19-lente`,
  `s20-brillo`, `s22-emision`, `s23-final` y `s24-dia`.
- **Build:** `next build` aislado en `.next-b13` (con el heap de 4096 que fija `netlify.toml`; con
  el de 2 GB por defecto se queda sin memoria).
- **Fuera de alcance, no tocado:**
  - `s17-revelado` falla desde SPRINT VIAJES: la llamada a `aplicarRevelado` se mudó a
    `ataduraAlScroll.ts` y ganó `!viajando`.
  - `s8-tres` y `s8-intro` piden un build en `.next`, que el `next dev` del checkout ocupa.

## Mapa de lo que se sacó para la base (parte A, referencia)

Todo en `src/app/v3/_lib/escena/` salvo donde se indica.

| Qué | Dónde | Cómo queda |
|---|---|---|
| Las 48 barras del piso | `floorMarks.ts`, `InstancedBars.tsx` (se borran), `StudioFloor.tsx` (el `<InstancedBars>`), `probeScene.ts` (referencias a las marcas) | fuera |
| La sombra de la cúpula (celosía) | `applyCelosia` en `StudioFloor.tsx` y `ProbeLogo.tsx`; `createCelosiaUniforms` en `ProbeStage.tsx`; la prop `celosia` de `OrbitRig.tsx`; el bloque 6b de `lightRig.ts` (`uCelosiaSun`/knobs) | fuera del producto. Decidir si `celosiaShader.ts`, `celosiaGeometry.ts` y `celosiaPenumbra.ts` quedan como instrumento o se borran: el factor de cielo del hemisférico (`skyFactor`, `probeCelosia.ts`) **se queda**, porque no proyecta nada y cambiarlo movería la luz |
| La sombra del logo que gira con el sol | `castShadow` y props `shadow-*` de la principal (`ProbeStage.tsx`); `castShadow`/`receiveShadow` de las mallas (`ProbeLogo.tsx`); `shadows` del Canvas y `SOMBRAS_DEL_CANVAS` (`configuracionDelCanvas.ts`); `sombraPx`/`sombraRadio` (`ajustes.ts`) | sin mapa de sombras; queda la oclusión de contacto (`ContactOcclusion.tsx`) |
| La bruma | `FOG_NEAR`/`FOG_FAR` en `probeAtmosphere.ts` (hoy 20 → 150) | **42 → 110**: arranca detrás del logo (la cámara lo ve a 40 como máximo, en el pie) y cubre la pared del ciclorama. Revisar que `_intro/` no dependa de esos valores |
| El reflejo | `ReflejoDelLogo.tsx` (se borra), `construirGeometriasDelLogo` en `ProbeLogo.tsx` (vuelve a como estaba en `5b424350`) | fuera |
| La bandera vieja y V3 | `variante.ts` (se borra), su uso en los cinco archivos, las motas compactas de V3 en `EscenaDelHome.tsx` | fuera |

**Invariantes que tocan eso** (hay que reescribirlos con controles positivos, o retirarlos con
motivo si prueban algo que ya no existe):
- `/probe-escena/__tests__/`: `s11-celosia`, `s11-pantalla`, `s11-piso`, `s11-sin-sol`,
  `s12-penumbra`, `s7-sol` y los auxiliares `celosiaBeat.ts`, `celosiaFloor.ts`, `frameProbe.ts`,
  `shading.ts`, `harness.ts` y `occlusion.ts` (lee las marcas).
- `_lib/escena/__tests__/`: `soporte.ts`, `cuadro.ts`, `s10-logo.ts`, `s10-logo-lectura.ts` y
  `logoEmitido.ts`.
- `_intro/__tests__/`: `luz.ts` y `relevo.ts`.
- `_lib/__tests__/`: `s10-raf.invariant.ts` y `s9-acoplamiento.ts`.

`/probe-escena` (el laboratorio) usa el mismo `ProbeStage`: la base limpia lo cambia también ahí.

## Qué sigue, paso por paso

1. Con el dev server en 3000 (lo levanta Valentino, o yo si me lo pide), sin cambiar código:
   - `npx tsx scripts-escena/logo.ts actual actual` → la referencia de ACTUAL;
   - `npx tsx scripts-escena/logo.ts base-bandera base` → la base por bandera. Las dos cajas
     tienen que coincidir.
2. Aplicar la base según el mapa de arriba (parte A.1) y borrar la bandera vieja.
3. `npx tsx scripts-escena/logo.ts base-aplicada` → comparar contra `actual-1440.json` en Por qué
   develOP y el pie. **Si el logo no queda idéntico (caja y centro, dentro de la oscilación de
   ±1,15° medida entre tomas), es un bug: buscarlo antes de seguir** (parte A.2).
4. Reescribir los invariantes de escena con controles positivos (parte A.3), `tsc --noEmit`, lint,
   suites de escena y `test:s19`/`s24-dia`, commit y tag `escena-base-limpia`.
5. Parte B: `_lib/escena/entorno.ts` con E0–E8, todas apagadas y combinables, pisables por el banco
   antes de cargar (`window.__entornoDeLaEscena`).
   - **E0**: la mancha de contacto, prendida o apagada.
   - **E1**: óculo y haz, un cono aditivo con el polvo más brillante adentro; cálido de día, frío y
     con estrellas de noche.
   - **E2**: los monolitos, entre r ≈ 48 y 58 sobre la curva del ciclorama, medio tragados por la
     bruma. Ojo: la cámara del pie llega a r = 40.
   - **E3**: el día como recorrido, un tinte de la bruma y del haz atado al arco. El logo no cambia.
   - **E4**: el pulso, una onda en el piso cada ~6 s.
   - **E5**: anillos finos inclinados, sólo desde el ancla de Por qué develOP.
   - **E6**: el polvo que responde, terminado. Estela por movimiento de cámara contra una copia
     amortiguada de la matriz vista-proyección: el estiramiento sale solo con parallax de
     profundidad, y la inercia sale de la amortiguación. Sin estela con movimiento reducido. Hay que
     componer el `onBeforeCompile` con `conBrilloDeNoche` (`particleGlow.ts`), que ya lo usa.
   - **E7 y E8, propuestas**: el polvo que se corre ante el cursor y vuelve con inercia; y el foco:
     el polvo nítido en el plano del logo y más blando lejos de él, como un lente.
6. Comparación:
   - hojas de BASE, E0–E8 solas y E1+E2+E3+E6 en los cinco momentos, con asiento antes de cada
     captura (`scripts-escena/comparar.ts` ya lo hace);
   - clips de E4, E5 y E6;
   - tabla de llamadas, triángulos y fps a 1440 y en móvil con CPU ×4;
   - una línea de opinión por idea.
7. Commitear sólo `entorno.ts` con las banderas apagadas, el script y este reporte.
