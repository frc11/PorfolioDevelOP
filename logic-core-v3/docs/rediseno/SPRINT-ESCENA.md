# SPRINT ESCENA — diagnóstico y variantes

Rama `rediseno/home` · dev 3000 · **no se cambia nada del producto**: las variantes viven detrás
de una bandera (`_lib/escena/variante.ts`) que queda en ACTUAL y sin commitear.

## Fase 1 — Inventario

Ningún archivo de la escena de /v3 es frozen: `HeroArtifact.tsx` no se importa desde /v3, y
`scene-camera.ts` sólo lo leen dos invariantes (`s10-logo-encuadre`, `s16-arnes`).

| Elemento | Qué es | Archivo | Costo |
|---|---|---|---|
| Piso | losa + ciclorama (la pared curva), `meshStandardMaterial`, recibe sombra y celosía | `StudioFloor.tsx`, `probeScene.ts` | 2 llamadas |
| Líneas y cruces del piso | 48 barras: encuadre, cruces de registro, ejes, cotas y escala graduada | `floorMarks.ts`, `InstancedBars.tsx` | 1 llamada (instanciada) |
| Cúpula de grilla | dos cilindros coaxiales con la trama, Lambert, transparentes, `BackSide` | `MoireScreen.tsx`, `probeMoire.ts` | 2 llamadas; con mezcla sobre el 51–57 % del cuadro |
| Sombra de la cúpula («celosía») | la trama de la cúpula proyectada sobre piso, marcas y logo, **analítica en el shader** (no hay mapa) | `celosiaShader.ts`, `celosiaPenumbra.ts`, `celosiaGeometry.ts` | 0 llamadas; ALU por píxel en piso y logo |
| Luces | hemisférica + principal (la única con sombra) + relleno + contraluz (sigue a la cámara) | `ProbeStage.tsx`, `lightRig.ts` | — |
| Arco de luz | el sol del recorrido: nivel, temperatura y **azimut**, por progreso | `lightArc.ts` | — |
| Sombra del logo | mapa de sombras 1024², PCF radio 4, ortho ±6,5; sólo el logo proyecta | `ProbeStage.tsx`, `probeAtmosphere.ts` | una pasada de profundidad más (las mallas del logo) |
| Oclusión de contacto | mancha fija bajo el logo, máscara 96² calculada al montar | `ContactOcclusion.tsx` | 1 llamada |
| Partículas | polvo 2.400 (`DepthParticles`, en conchas que giran) + bokeh 90 | `DepthParticles.tsx`, `BokehParticles.tsx`, `probeParticles.ts` | pocas llamadas; costo por vértice |
| Bruma | niebla lineal 20 → 150, del color del papel, apagada por el arco | `probeAtmosphere.ts`, `lightRig.ts` | — |
| Logo | extrusión del SVG, negro mate (`meshStandardMaterial`), celosía, emisión de noche | `ProbeLogo.tsx`, `logoEmision.ts` | 1 llamada por pieza del SVG, más su sombra |
| DPR | 1–1,5 arriba de 1024; **1 fijo abajo** (calidad compacta) | `ajustes.ts` | — |

- **La sombra atrás que se mueve es la celosía, verificado.** `lightRig.ts` le copia en cada
  cuadro la MISMA dirección del sol que usa la luz principal. El arco gira ese sol de −42° a
  +88,8° de azimut entre el hero y el final de Números, y sigue hasta 123,5° en la noche. Las
  bandas proyectadas por la cúpula barren el piso y el ciclorama con el scroll, y la sombra del
  logo gira con ellas. En las capturas, ACTUAL tiene las bandas diagonales y V1, que apaga la
  celosía, no.

## Fase 2 — Variantes (detrás de la bandera, sin commitear)

- `_lib/escena/variante.ts`: `BANDERA_DE_LA_ESCENA = 'actual'` y las cuatro recetas. El banco la
  pisa antes de cargar la página (`window.__varianteDeLaEscena`).
- **V1 LIMPIEZA**: sin marcas en el piso (`StudioFloor`); la celosía apagada, dándole al shader un
  sol sin componente horizontal, que descarta la proyección (`lightRig`); el logo sin la sombra
  del sol (`castShadow` de la principal, en `ProbeStage`), así que queda sólo su oclusión de
  contacto, suave y quieta. Sin sombra proyectada no hay mapa de sombras ni pasada de profundidad.
- **V2**: V1 + bruma hacia el horizonte (niebla 42 → 110: empieza después del logo, que la cámara ve a 40 como máximo, en el pie; con 16 → 72 la bruma lavaba el logo a gris en el pie) + reflejo muy leve del logo
  (`ReflejoDelLogo.tsx`): una copia espejada bajo el piso que sigue la pose del logo, pintada en la
  pasada opaca con mezcla multiplicativa y desvanecida con la distancia. No es un espejo: no suma
  una pasada de render. Para compartir las geometrías, `ProbeLogo.tsx` exporta
  `construirGeometriasDelLogo`.
- **V3**: V2 + 1.200 motas abajo de 1024 (eran 2.400). Los otros dos puntos del pedido no tienen
  qué cambiar: el mapa de sombras más chico no aplica (desde V1 no hay mapa), y el DPR en móvil ya
  está acotado a 1.
- Nada necesitó tocar un archivo frozen.

## Fase 3 — Comparación

Banco: `scripts-escena/comparar.ts` (capturas y fps), `scripts-escena/hojas.sh` (las hojas) y
`scripts-escena/asiento.ts` (la rareza del pie). Todo sale en `~/.cache/b4-medicion/escena/`.

- **Hojas lado a lado** (ACTUAL · V1 · V2 · V3, 1440 × 900): `hoja-hero-1440.png`,
  `hoja-quienes-somos-1440.png`, `hoja-trabajos-de-noche-1440.png`,
  `hoja-por-que-develop-1440.png` y `hoja-pie-1440.png`. La del hero trae una segunda fila con la
  zona bajo el logo ampliada.
- **La sombra del logo en el hero**: la que hoy es parte del look es casi entera la oclusión de
  contacto, no la sombra del sol, que es tenue. En V1 la mancha queda igual de presente y algo más
  definida, y deja de moverse con el scroll.
- **La rareza del pie, explicada: era del instrumento, no de la variante.** En la primera corrida,
  el pie de V1 salió con la cámara de Por qué develOP: la escena no se enteró del último scroll.
  Recorriendo igual y capturando a los 0,5, 2,5, 5, 10 y 15 s de llegar, ACTUAL y V1 quedan
  idénticas desde el primer medio segundo, con y sin capturas intermedias
  (`escena/asiento/tira*.png`). Una captura congela los pasos de render (CLAUDE.md) y a veces el
  re-emular no los destraba antes del scroll siguiente. Las variantes no tocan la cámara ni la
  escala del logo: sólo piso, sombras, bruma, reflejo y partículas. Desde entonces el comparador da
  un empujón de scroll de 1 px antes de cada captura y espera a que la escena se asiente (al menos
  2 s, ocho veces el tiempo de asiento de la cámara; en los momentos con deriva, hasta 15 s,
  porque la trama, la celosía y las motas se mueven solas y el cuadro nunca queda quieto del todo).
- **Rendimiento**, promedio de 3 s en cada momento, con el contador de llamadas de dibujo puesto
  por el banco:

  | | 1440 | móvil 375 · CPU ×4 | llamadas por cuadro | triángulos por cuadro |
  |---|---:|---:|---:|---:|
  | ACTUAL | 75,0–75,2 fps | 75,0–75,2 fps | 13 | 35 mil |
  | V1 | 75,0–75,2 fps | 75,0–75,3 fps | 11 | 23 mil |
  | V2 | 75,1–75,3 fps | 75,0–75,1 fps | 12 | 34 mil |
  | V3 | 75,0–75,1 fps | 75,0–75,3 fps | 12 | 34 mil |

  Las cuatro sostienen los 75 fps del monitor en los cinco momentos, también con la CPU cuatro
  veces más lenta: en esta máquina la escena no es el cuello de botella y los fps no distinguen
  variantes. El costo se ve en lo que se dibuja:
  - V1 saca la pasada de sombra del logo: 2 llamadas y 12 mil triángulos menos por cuadro.
  - El reflejo de V2 los devuelve casi todos.
  - Las motas de V3 no aparecen en esa cuenta, porque son puntos. Queda sin medir su efecto en un
    teléfono real, donde el GPU es lo que aprieta.

## Recomendación

V2 sin el reflejo: saca lo que molesta (las bandas que barren el piso y las marcas), conserva la
mancha bajo el logo del hero y la bruma lleva la cúpula hacia el horizonte sin tocar el logo.
El reflejo apenas se ve y cuesta 1 llamada y 11 mil triángulos por cuadro; V3 no gana nada medible acá.
