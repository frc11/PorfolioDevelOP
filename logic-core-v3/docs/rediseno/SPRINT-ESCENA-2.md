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

## Parte B — la exploración del entorno (sin commitear al producto)

### Cómo está armada

Cada idea tiene su propia bandera en `_lib/escena/entorno.ts`:
- **Todas quedan en `false`.** Se combinan libres entre sí.
- **Cómo se prenden:** el banco las prende antes de cargar la página, con
  `window.__entornoDeLaEscena = 'E1,E2'`.
- **Qué se commitea:** sólo `entorno.ts`, con las banderas apagadas. Lo que las implementa queda sin
  commitear en el árbol de trabajo:
  - `_lib/escena/entorno/`: `Entorno.tsx`, `vivo.ts`, `polvoVivo.ts`, `Haz.tsx`, `Monolitos.tsx`,
    `Pulso.tsx` y `Anillos.tsx`;
  - dos líneas en `ProbeStage.tsx`, que montan `<Entorno>` después del rig y la bandera E0 de la
    mancha;
  - una línea en `DepthParticles.tsx`, el parche del polvo.

Cómo encajan las piezas:
- **`Entorno.tsx` va después de `<OrbitRig>`**, así su `useFrame` lee el cuadro que el rig ya
  escribió. **No toca la cámara ni el arco:** lee el progreso del `rig` y la noche de
  `BRILLO_DE_LA_NOCHE`.
- **E1, E6, E7 y E8 son un solo parche** sobre el `PointsMaterial` del polvo (`polvoVivo.ts`):
  - encadena el `onBeforeCompile` de `conBrilloDeNoche`, no lo pisa;
  - compila sólo los bloques de las ideas prendidas.
- **Movimiento reducido:** sin estela (E6), sin empuje (E7), sin pulso (E4), y anillos quietos
  (E5).
- **Casi monocromo y barato:**
  - sin volumétricos y sin mapas de sombra nuevos;
  - el haz es un cono aditivo con degradé;
  - el pulso es un anillo analítico en un solo plano.

### Material de comparación

Todo queda en `~/.cache/b4-medicion/escena2/entorno/`:
- **Hojas:** `hoja-<idea>-1440.png`, una por idea (E0–E8 y `E1+E2+E3+E6`). Los cinco momentos van
  en filas, con BASE a la izquierda y la idea a la derecha.
- **Capturas sueltas:** `<momento>-1440-<variante>.png`.
- **Clips:**
  - `clip-E4-1440.mp4`: el hero quieto, 13 s;
  - `clip-E5-1440.mp4`: Por qué develOP quieto, 9 s;
  - `clip-E6-1440.mp4`: un tirón de scroll hacia Quiénes somos, frenada, vuelta rápida y quietud;
  - `clip-E7-1440.mp4`: un barrido del puntero sobre el hero;
  - `clip-base-1440.mp4`: el mismo gesto de E6, sin ideas, para comparar.
- **Scripts:**
  - `scripts-escena/entorno.ts`, en modos `capturas`, `fps` y `clip`;
  - `scripts-escena/hojas-entorno.sh`, que arma las hojas;
  - `scripts-escena/tinte.ts`, que da el color medio de una franja contra BASE.

**El asiento.** Antes de cada captura hubo un empujón de 1 px y se buscó que dos capturas a 1,5 s
coincidieran por bloques (menos de 1,5 de diferencia media).
- En el hero y en el pie asentó al primer intento.
- En Quiénes somos, Trabajos y Por qué develOP **no asentó ni en BASE**, así que cada captura
  esperó el máximo, unos 14 s.
- Posible causa: la interfaz de esas secciones, que sigue moviéndose (carruseles). No lo
  verifiqué. La cámara sí está quieta después de 14 s.

### Costo

Las cifras son cuadros por segundo / llamadas de dibujo / triángulos del último cuadro, iguales
en los cinco momentos salvo donde se indica.

| Variante | 1440 | 375, CPU ×4 |
|---|---|---|
| BASE | 75 / 11 / 23.486 | 75 / 11 / 23.486 |
| E0 mancha | 75 / 10 / 23.484 | 75 / 10 / 23.484 |
| E1 óculo y haz | 75 / 14 / 23.712 | 75 / 14 / 23.712 |
| E2 monolitos | 75 / 12–13 / 23.498–23.510 | 75 / 11–12 / 23.486–23.498 |
| E3 el día | 75 / 11 / 23.486 | 75 / 11 / 23.486 |
| E4 pulso | 75 / 12 / 23.582 | 75 / 12 / 23.582 |
| E5 anillos | 75 / 13 / 28.766 | 75 / 13 / 28.766 |
| E6 polvo que responde | 75 / 11 / 23.486 | 75 / 11 / 23.486 |
| E7 cursor | 75 / 11 / 23.486 | 75 / 11 / 23.486 |
| E8 foco | 75 / 11 / 23.486 | 75 / 11 / 23.486 |
| E1+E2+E3+E6 | 75 / 15–16 / 23.724–23.736 | 75 / 14–15 / 23.712–23.724 |

**El instrumento no separa las ideas por cuadros por segundo.**
- El techo de 75 es el refresco del monitor.
- Estrangular la CPU ×4 no frena una GPU de escritorio, que es donde gastan estas ideas (relleno
  aditivo del haz, puntos más grandes en E6 y E8).
- Lo comparable es la columna de llamadas y triángulos:
  - E6, E7 y E8 no agregan ni una llamada, porque viven en el shader del polvo;
  - E3 tampoco;
  - E1 suma 3 llamadas;
  - E5 suma 2 llamadas y 5.280 triángulos.
- En E2 la cantidad varía porque three descarta por encuadre las piezas que no están en cuadro.
- Para saber el costo real en un teléfono hace falta un teléfono.

### Una línea por idea

| Idea | Veredicto | Por qué |
|---|---|---|
| **E0 mancha** (apagarla) | **descartar** | Desde la base limpia la mancha es lo único que apoya el logo; sin ella flota en el blanco (hoja E0, hero). |
| **E1 óculo y haz** | **quedarse, ajustando el día** | De noche es lo mejor de la exploración: una columna fría cae sobre el logo en Trabajos y el polvo de adentro la toma. De día casi no está; el pedido era muy sutil, pero se puede subir un poco. El óculo y las estrellas no entran en cuadro en ninguno de los cinco momentos: la cámara siempre mira hacia abajo. |
| **E2 monolitos** | **descartar** | Se leen como barras flotando detrás de la retícula. Su base, sobre la curva del ciclorama, desaparece en el papel blanco. Es exactamente lo "pegado" que el pedido quería evitar. |
| **E3 el día como recorrido** | **ajustar** | Funciona pero está en el límite: sobre el fondo lejano mueve entre 0,3 y 3 niveles (mañana cálida en el hero; lila en Por qué develOP y el pie, medido con `tinte.ts`). En Trabajos la noche no se ve, porque arriba del cuadro manda la capa de la sección. Es casi imperceptible, como se pidió; si se quiere que se lea en la suma del recorrido, hay que duplicarlo. |
| **E4 pulso** | **ajustar** | Se lee y es tranquilo: un anillo fino sale de debajo del logo y se apaga antes de la pared. Pasa por detrás del texto del hero; con un período más largo o sólo en el pie molestaría menos. |
| **E5 anillos** | **ajustar** | En Por qué develOP enmarcan el logo con elegancia. En el pie cruzan la columna de enlaces ("Inicio", "Quiénes somos"). Riesgo: dos órbitas alrededor de un logo leen como "átomo". Probar un solo anillo, o sólo en Por qué develOP. |
| **E6 polvo que responde** | **se queda (decidido), terminado** | Estela con cabeza y cola que se apaga; más larga cerca por paralaje; al frenar se encoge en ~0,3 s, que es la inercia; sin estela con movimiento reducido. Ver `clip-E6` contra `clip-base`: en el cuadro 1,1 s las motas son estelas y en el 2,6 s vuelven a ser puntos. Cuesta cero llamadas. |
| **E7 el cursor** | **descartar** | Funciona: el empuje llega a 0,85 al barrer y se apaga al quedarse quieto. Pero con 2.400 motas repartidas en un volumen de radio 34, cerca del cursor hay pocas, y el claro casi no se ve; ni subiendo la fuerza al doble se lee. Pide polvo denso cerca de la cámara, que no hay. |
| **E8 el foco** | **ajustar** | Da un bokeh creíble de día (hero). De noche, con el brillo de la noche, engorda demasiadas motas y el cuadro se llena de discos. Hace falta bajar el crecimiento, o apagarlo de noche. |

**E1+E2+E3+E6 juntas** (hoja `hoja-E1+E2+E3+E6-1440.png`):
- de noche, el haz con el polvo encendido adentro es la imagen más fuerte de la exploración (la estela de E6 no aparece en las capturas, que se toman en reposo: se ve en su clip);
- los monolitos son lo que sobra.
- Recomendación: **E1+E3+E6, sin E2.**

### Mis dos ideas

- **E7** — el polvo se corre al paso del cursor y vuelve con inercia: la sala responde a la mano, no
  sólo al scroll.
- **E8** — el foco: el polvo nítido en el plano del logo y más blando lejos de él, como un lente de
  verdad.

### Estado

- Todas las banderas quedan en `false`: el producto es la base limpia.
- Commit de esta parte: `entorno.ts`, `scripts-escena/entorno.ts`,
  `scripts-escena/hojas-entorno.sh`, `scripts-escena/tinte.ts` y este reporte.
- Lo que implementa las ideas sigue sin commitear en el árbol de trabajo:
  `_lib/escena/entorno/`, más `ProbeStage.tsx` y `DepthParticles.tsx`.
- **Verificado:**
  - `tsc` limpio;
  - eslint limpio sobre `entorno/`, `entorno.ts`, `ProbeStage.tsx`, `DepthParticles.tsx` y el
    script;
  - con las banderas apagadas, `s28-base` y las suites de escena siguen en verde.
- **Sin verificar en el navegador:**
  - E6 con movimiento reducido: por construcción, el rig pone la estela en 0 y la copia de la
    matriz sigue a la cámara cuadro a cuadro;
  - el costo real en un teléfono.
