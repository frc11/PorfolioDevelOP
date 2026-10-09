# SPRINT PULIDO 8 — la limpieza, «HABLANOS» que se nota botón y el verificar pendiente

Rama `rediseno/home`. Invariante nuevo: `npm run test:s59-pulido-8` (`src/app/v3/_lib/__tests__/s59-pulido-8.invariant.tsx`).

Aprobados por el humano: el pie entero (la descarga y las contraformas lisas) y el volteo.

## G1 · La limpieza

- **`?volteo=juntos` es el producto:** las seis placas se voltean a la vez, de `ARRANCA_EL_VOLTEO` (0,48) a `FIN_DEL_VOLTEO` (0,68),
  que sigue siendo el fin del giro de «HABLANOS». Se borraron la cascada (`VOLTEO.voltea.cada`, `arrancaElVolteo`, `VOLTEOS`) y la
  bandera.
- **`?meta=contorno` se borró con su código:**
  - `ctaDelFinal/contorno.ts` entero;
  - su estado en `transformacion.ts` (`METAMORFOSIS`, `ATRAS`, `estadoDeLaMetamorfosis`);
  - su ruido (`RUIDO_DE_LA_METAMORFOSIS_GLSL`);
  - el stencil que le pedía al lienzo (`configuracionDelCanvas.ts`);
  - `fondoDelMarco` y lo que el cuadro le pasaba sólo a ella.
- Lo que el volteo tomaba de `contorno.ts` quedó en `volteo.ts`:
  - el grosor y el tramo máximo de las letras;
  - el cuadro, ahora `CuadroDelVolteo`, sólo con lo que lee: los valores, el progreso y cuánto se ven;
  - los íconos, que se extruyen directo del SVG, sin el remuestreo de la metamorfosis.
- `MetamorfosisArmada.poner` recibe sólo el cuadro.

### Gate

- Lint de lo tocado, limpio.
- `tsc` 0.
- `s53` 54/0, `s54` 52/0, `s55` 21/0, `s56` 24/0, `s57` 15/0, `s58` 21/0, `s59` 5/0.
- Verdes: s38, s44, s51, s52 (nocturno-final y pulido-1), s34 y s36 (leen la configuración del lienzo).
- Captura a 1440 (`p` = 0,02 y 0,56): los íconos se dibujan en el relevo y las seis placas giran juntas.

### Las aserciones viejas que cambiaron

| Dónde | Antes | Ahora | Por qué |
|---|---|---|---|
| `s55` C1 · la metamorfosis, las dos técnicas, las banderas | el estado de `contorno` (en 0 nada, primero atrás, termina con «HABLANOS»); sus puntos remuestreados y sin partículas; `?meta=contorno` pedible; con sus 3 controles | borradas; las reemplaza `s59` G1 · 1 (ya no existen) | `contorno` se borró con su código. Lo que termina con «HABLANOS», en el volteo, lo fija `s58` F2 · 2 |
| `s55` C1 · 4 · continuo | lo que no salta incluía el estado de `contorno` | incluye el del volteo (lo que se va, lo alineado y el ángulo por π); mismos umbrales y controles | Ídem: el estado que existe es el del volteo |
| `s55` C1 · 7 · atrás del logo | la frase de `contorno` va de `−ATRAS` a 0 (`zF`) | el centro de cada placa, medio espesor atrás (`VOLTEO.espesor`); mismo control (z positivo) | Ídem |
| `s56` D1 · 5 | `contorno` en `?meta=contorno`; asignación óptima, emparejado por lugar, remuestreo equidistante, arranque alineado, turbulencia en campana, topología fija con stencil (8 controles) | borradas; las reemplaza `s59` G1 · 1 (el archivo, su estado y el stencil ya no existen) | Ídem |
| `s57` E1 · 1 a 3 | ningún contorno se cruza; el cartel y la frase que se arma no se pisan; el fundido a la malla exacta (5 controles) | borradas; las reemplaza `s59` G1 · 1. El cartel contra las placas del volteo ya lo fija `s58` F2 · 4 | Ídem |
| `s57` E1 · 5 · las decisiones | (PULIDO 7) `meta=fusion` no pide nada y en el producto `meta` es `no` | vuelve la de antes de PULIDO 7: la clave `meta` no está en las pruebas (ni en las sueltas), con su control de entonces | `?meta=` se borró entera. Es la más fuerte de las dos |
| `s58` F2 · 2 · la coreografía | en cascada (cada placa 0,035 después de la anterior) y `juntos` a la vez | las seis a la vez; arranca en `FIN_DEL_VOLTEO − dura` y termina con el giro; mismos controles | La cascada se borró: `juntos` es el producto |
| `s58` F2 · 3 y 4 | las placas con `'cascada'` | las placas a la vez | Ídem. Siguen 0 cruces con el giro |
| `s58` F2 · 5 · el producto | el volteo sin bandera, `?meta=contorno` y `?volteo=juntos` pedibles | el volteo sin bandera y sin ninguna rama de pruebas en la escena; que las banderas no existen lo fija `s59` G1 | Ídem |
| `s52-pulido-1` · las banderas | `rebobinado`, `angel`, `meta=contorno` y `volteo=juntos` | `rebobinado` y `angel` | Las dos banderas del volteo se borraron |
