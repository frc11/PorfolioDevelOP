# SPRINT ESCENA 2 — base limpia y exploración del entorno

Rama `rediseno/home` · dev 3000 · candado de Chrome (`scratchpad/candado.sh`; el candado vive en
`~/.cache/b4-medicion/chrome.lock` y se borra solo al terminar).

## Dónde quedó (antes de reiniciar la PC)

- **Commit WIP `wip(escena2): antes de reiniciar`**: el trabajo en curso guardado, sin terminar.
  - La bandera vieja del sprint anterior (`_lib/escena/variante.ts`) y su cableado, en ACTUAL (el
    producto se ve como siempre):
    - `ProbeStage.tsx`: sombra del logo, niebla y reflejo;
    - `StudioFloor.tsx`: las marcas;
    - `lightRig.ts`: la celosía;
    - `EscenaDelHome.tsx`: las motas;
    - `ProbeLogo.tsx`: `construirGeometriasDelLogo`, que sólo usa el reflejo;
    - `ReflejoDelLogo.tsx`.
  - Una receta provisoria **`base`** en esa bandera: V2 sin el reflejo, o sea la base limpia que
    pide la parte A (sin marcas, sin celosía, sin la sombra del logo, bruma 42 → 110).
  - La sonda **`scripts-escena/logo.ts`**. Recorre Hero → Quiénes → Trabajos → Por qué → pie por
    scroll. En Por qué develOP y en el pie mide la caja y el centro de la tinta del logo sobre la
    escena sola (`<main>` escondido, luminancia < 60), en tres tomas a 1 s. Con segundo argumento
    pisa la bandera vieja.
- **No se aplicó nada de la parte A ni de la B.** La primera corrida de `logo.ts` no llegó a medir:
  el dev server se había caído por falta de memoria (el puerto 3000 no escuchaba).

## Mapa de lo que hay que sacar para la base (parte A)

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
