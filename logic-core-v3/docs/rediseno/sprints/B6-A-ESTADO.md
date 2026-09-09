# B6-A — La escena persistente · ESTADO

Trabajos y el Cierre dejan ver la sala a través de un velo en gradiente; P7 mira
con el lente de la cámara de la escena; la rampa de azimut de B5 vive en la
banda suspendida. Quiénes somos y Números NO se abren, y la causa queda escrita
con sus dos números. Todo lo que sigue tiene su instrumento en `scripts-b6/` y
sus cifras en `docs/rediseno/outputs/b6/*.json`.

> **Lo que este documento NO dice.** No dice que la escena se siente continua.
> Eso lo juzga el humano grabando, y es el gate real del bloque. Acá hay números
> con su instrumento y las capturas de `docs/rediseno/capturas/b6/`.

---

## 1. Las cuatro decisiones de la PARADA 1, y las dos condiciones

| # | decisión | cómo quedó |
|---|---|---|
| 1 | El velo es un **gradiente**: 0,80 detrás del texto, 0,40 en la zona desnuda | `_estilos/velo.css` sobre `--color-velo-denso` / `--color-velo-ralo`; el borde de la columna de texto sale de tokens de layout (1048 px); la rampa mide una columna lateral (140 px). Trabajos declara su franja; el Cierre es denso entero |
| 2 | Trabajos: tinta plena en el texto secundario | `Proyecto.tsx`: el rótulo «Lo que cambió» perdió `opacity-casi` |
| 3 | El Cierre se abre; la causa de que muestre poco es el sol, no el velo | `secciones.ts`: `oscuro-transparente`, con la nota. En esa pose el arco del sol está en 0,34 (decisión de S11): la sala está en penumbra por diseño. No se tocó |
| 4 | La rampa de azimut a la banda suspendida [0,14 · 0,46] | `choreographyPhysics.ts`: `[0.46, 8]` en vez de `[0.73, 8]`. `s18-azimut` con TRES bandas y la tabla de B5 como control positivo |
| 5 | `EL_DIFERENCIAL` por id, con control positivo | `s13b-reparto.ts`: `'por-que-develop'`; `s16-anclaje` §1 afirma que es la sección del tramo que declara su ancla y ve fallar `'cierre'` |
| 6 | Quiénes somos y Números NO abren; la causa escrita | §4 de este documento |

El blur queda descartado por inútil y por deuda: 5,12:1 contra 4,98:1 de la
alfa plana, 34,6 % del desvío de gris contra 40,0 %, y ~77 `backdrop-blur` de
deuda en el sitio viejo. Su costo en cuadros fue un cuadro de 67 ms en un
barrido de 2 s: muestra chica, no es la razón del descarte.

## 2. Lo que se construyó

**La cuarta superficie.** `oscuro-transparente` en `superficies.ts`, con la
clase `velo` de `_estilos/velo.css`. Sin escena montada el panel es el sólido
de siempre (`[data-v3]:has([data-escena])` enciende el gradiente): abajo del
umbral de 1025 no hay velo sobre nada. Tres tokens nuevos, registrados en
`padron-de-tokens.ts` y en `tokens.invariant.ts`: `--opacity-densa` (0,8, el
primer escalón con el que el texto secundario pasa AA sobre el velo: 0,70 → 4,09;
0,80 → 4,84, medido), `--color-velo-denso` y `--color-velo-ralo`, en los dos
temas. Tres propiedades de componente registradas en `s3-registro-de-tokens.ts`:
`--velo-columna`, `--velo-rampa`, `--velo-borde`.

**El revelado sin costura entre transparentes contiguas.** `bordesDeRevelado`
mira la vecindad: un transparente ablanda su borde sólo contra un opaco. Medido
en el navegador (`g-escena.ts`): entra en Números → Trabajos, sale en Trabajos →
Servicios, entra en Tu panel → Por qué develOP, y NINGUNA máscara en Por qué
develOP → Cierre.

**El lente de P7.** `_lib/motion/lente.ts`: la `perspective` es el foco de la
cámara de la escena, `calc(100svh × 1,5857)` (1427 px a 900 de alto), y el
`perspective-origin` es el centro del viewport en coordenadas del bloque. Con
ese lente los −3000 px con los que P7 arranca caen a 63,6 unidades de la
cámara, adentro de la pared del fondo de la celosía (58 a 64); con los 1000 px
del patrón caían a 82, detrás de la sala. P7 no cambió un valor: cambia el
lente. Medido en el navegador: `perspective 1427.22px`, `origin 688px 209px`
(el bloque vive en (32, 240,75) del hijo pegado). Meseta de B4-A y techo de B2
intactos (`s5-trabajos`, `s16-techo`).

## 3. Los números

### La referencia (`a-referencia.ts`, `a-referencia-tarjetas.ts`; 1440×900)

Seis cargas de nk.studio en total —el instrumento falló tres veces sobre su DOM
y una sección clara no tiene canvas—; se declara. Su escena es un canvas fijo
de 1440×900 con luminancia media entre 0,001 y 0,066 en 23,5 pantallas: casi
negra. Sus secciones oscuras son el canvas DESNUDO —la varianza detrás del
texto es la de la zona desnuda—; sus secciones claras son papel opaco (alfa 1,
luminancia 0,991) y ahí el canvas desaparece. Sus únicos paneles oscuros con
texto son tarjetas de 181×231 px con fondo alfa 0 y `blur(12px)`: dejan pasar
30,6 a 33,1 % del desvío de gris, y su texto queda en 9,68 y 12,22 en el peor
píxel. Su texto sobre la escena desnuda: medianas de 16 a 20, peor píxel de 1,13
a 2,95 con 2 a 6 bloques por pantalla bajo AA. **Ellos no velan porque su sala
es negra; la nuestra en la pose de Trabajos tiene media 0,74.**

### El velo, medido con la escena real (`d-velo.ts`, pose de Trabajos, y=8100)

| variante | pasa (gris · lum.) | peor a tinta plena | peor texto secundario |
|---|---|---|---|
| alfa 0,40 | 60,0 % · 11,7 % | 2,60 ✗ | 1,84 ✗ |
| alfa 0,60 (el token de S3) | 40,0 % · 2,3 % | 4,98 ✓ | 2,90 ✗ |
| alfa 0,80 | 20,1 % · 0,2 % | 6,65 ✓ | 4,84 ✓ |
| blur 12 + 0,60 | 34,6 % · 2,0 % | 5,12 ✓ | 2,95 ✗ |
| **gradiente 0,80 → 0,40** | 60,6 % · 13,7 % | 6,65 ✓ | 4,76 ✓ |
| opaco (control) | 0,0 % · 0,0 % | — | — |

Los pisos desde los tokens (`superficies-velo.ts`, con blanco detrás): sobre el
denso, tinta plena 9,9:1 y a `opacity-casi` 5,0:1; la tinta tenue 3,2:1 —por eso
sobre el velo se cita medida—; sobre el ralo, la tinta plena 2,47:1 —por eso el
ralo va sólo donde no hay texto—.

### El producto final (`c-las-seis.ts` etiqueta `final`, 1440×900, media pantalla)

| sección | bloques | fallan | peor píxel | pasa (gris) | veredicto |
|---|---|---|---|---|---|
| Trabajos | 9 | 0 | 5,91 («[MÉTRICA]» sobre el acento, en tránsito; 7,20 a tinta plena; el resto de 8,03 a 10,28) | 67,3 % del panel; 20,0 % en la columna densa, 60,0 % en la franja | abre |
| Cierre | 25 | 0 | 6,44 (la ayuda y el placeholder del formulario, tinta tenue) | 20,3 %, denso entero | abre |

**La franja final de Trabajos:** la columna densa llega a x=1048, la rampa mide
140 px y la franja desnuda son **252 px a 1440 (17,5 % del ancho)** y 732 px a
1920 (38 %). En el Cierre no hay franja: el pie llega a x=1407 de 1440, así que
el velo es denso entero.

### Lo que cuesta y lo que no

- **Suspensión** (`s9-visibilidad`): tres bandas visibles, 7 de 17 pantallas;
  la banda suspendida baja de 80,9 % a **55,9 %** con margen (58,8 % sin
  margen; cuatro bordes interiores × un octavo = 2,9 puntos). Ahorra 2.012
  cuadros por pasada contra 2.912.
- **FPS** (`e-vitales.ts`, mismo contador y perfil que B5): mediana 75,19 y p05
  74,63 en los tres recorridos, iguales a B5; mínimo 37,45 en el cuadro 439 del
  primer recorrido, el mismo cuadro y el mismo valor que B5 (D-B5.5); 1/0/0
  cuadros largos contra 2/0/1.
- **`prefers-reduced-motion`** (`f-reducido.ts`, la preferencia la pone
  `Emulation.setEmulatedMedia`): con la preferencia la escena cambia 0 % de sus
  píxeles en 5 s en el hero, en Trabajos y en el Cierre; sin ella, 21,7 / 20,4 /
  10,4 %. Seis casos, cero fallas.
- **Anclaje y progreso:** `derivarAnclaje` usa la transparencia sólo para las
  ventanas; con la tabla nueva imprime los mismos nudos. `s9-anclaje` publica
  cuatro ventanas de progreso: [0 · 0,125], [0,4688 · 0,625], [0,7411 · 1] y la
  del Cierre [0,8525 · 1] adentro de la del diferencial.
- **Peso** (`s5-peso`, dos builds del mismo día con el mismo `node_modules`,
  `docs/rediseno/outputs/b6/peso.json`): lo propio de /v3 pasa de 62,6 a
  **62,8 KiB crudo** sin el preámbulo de Sentry (20,6 → 20,7 gzip). El delta de
  B6-A son **225 bytes**: +217 en el chunk de `secciones`/`superficies` (la
  cuarta superficie y la lista derivada), +65 en `layout` (la referencia a
  `velo.css`), −58 en `page`. `lente.ts` y `revelado.ts` no están en la carga
  inicial. ⚠ **El techo de 61,25 ya estaba roto en HEAD** en este entorno, por
  1,31 KiB: HEAD extraído con `git archive` y buildeado igual da 62,56. B7
  midió el mismo commit en 61,40 en su worktree, con las mismas versiones y sin
  `NEXT_PUBLIC_*` inlineadas: la diferencia de 1,16 KiB entre entornos no está
  atribuida. **El techo se partió por dueño en `s5-presupuesto.ts`, con la
  forma que B7 estrenó**: `MONTAJE_DE_B6A_KIB = 0,25` (propio, se afirma: 0,22
  medidos más 0,03 de aire) y `HEREDADO_SIN_DECLARAR_KIB = 1,35` (heredado, se
  publica con su dueño: 1,31 medidos más 0,04). **El número final es 62,85
  KiB** = 60 + 1,25 + 0,25 + 1,35, contra 62,78 medidos. El día que alguien
  atribuya el desvío de HEAD y lo devuelva, borrar esa línea baja el techo solo.

## 4. Quiénes somos y Números NO abren en este bloque — la causa, con números

**La causa es el LOGO, no el velo.** Con la tabla abierta y la escena real
detrás (`c-las-seis-abierto.json`, papel-transparente, tinta oscura):

| sección | bloques | fallan | qué cae sobre el logo |
|---|---|---|---|
| Quiénes somos | 17 | 12 | el cuerpo «Trabajamos desde Tucumán…»: **39,9 %** de sus glifos sobre el logo → 1,00:1; la foto del equipo, 43,1 % |
| Números | 13 | 12 | el rótulo «Números»: **100 %** sobre el logo → 1,11:1; el cuerpo «Preferimos pocos números…», 82,0 % → 1,00:1; el titular, 16,9 % |

Ningún velo razonable lo salva: el peor píxel es el logo mismo (1,00:1 contra la
tinta oscura, como midió SITIO-S10 en el Hero). Lo que abriría estas dos es
mover el texto o mover la pose, y ninguna de las dos es de B6-A. Es el insumo
de B6-B; la decisión de que B6-B exista es del humano.

Servicios y Tu panel quedan opacas por pedido explícito. Medidas igual con la
escena detrás: 107 de 119 y 23 de 24 bloques bajo AA en el peor píxel.

## 5. Inventario de defectos que este bloque encontró y no arregla

- **D-B6.1 · Por qué develOP, ya abierta, falla en el peor píxel.** 6 de 7
  bloques bajo AA (`c-las-seis-abierto.json`, y=14400): el titular chico «El
  diferencial no está…» en **1,11:1 con 944 píxeles de 8.634 bajo AA** (p1 2,30);
  los cuatro `titulo-xl` entre 2,19 y 2,42 contra 3:1 (de 12 a 87 píxeles cada
  uno). La sala en esa pose tiene media 0,289 y la tinta es oscura. **Es grave:
  es una sección que YA está abierta, y el 4,98:1 que se celebraba era sólo el
  titular grande.** Hermano de D-B5.1.
- **D-B6.2 · El Hero falla en el peor píxel por partículas bajo el glifo.** «piloto
  automático.» 2,77 y el cuerpo 3,32, con 26 píxeles de 6.769 bajo AA cada uno;
  medianas de 13 a 16. En la corrida final, 4 de 7 bloques (2,95 el peor).
- **Hallazgos a verificar, sobre papel opaco** (la barrida final los vio y el
  censo de S10 no los modela porque mide contra la superficie de la sección, no
  contra lo que cada texto tiene atrás): en Servicios, 36 bloques a
  `opacity-tenue` (0,3) mientras su línea no llegó, 1,40 a 2,65:1 sobre papel —
  un estado de tránsito de la coreografía, no de lectura, y queda anotado—; en
  Números, el titular «Lo que se puede contar» con 186 de 5.999 píxeles en
  1,00:1 en una posición; en Tu panel, «Bajar los contactos…» con 394 de 2.181
  en 1,07:1 en una posición. Los tres probablemente cruzan un marcador oscuro
  en tránsito; falta confirmarlo con la captura.

## 6. El cierre: build, verificar y frontera

- **Build** en primer plano, sin nada al lado, con `CIRCLE_NODE_TOTAL=2` y
  `--max-old-space-size=6144`: exit 0, compilado en 120 s (3 min 30 s en total),
  con el `next dev` del 3001 parado —los invariantes de peso leen `.next`— y
  vuelto a levantar después.
- **`npm run verificar`: 27 pasos, 0 con falla**, después de partir el techo
  de peso por dueño (§3): `s5-peso` da 62,8 contra 62,85, con 0,07 KiB de aire,
  y el techo viejo de 60 sigue mordiendo en 59,9. Antes de partirlo daba 1 con
  falla, y la falla era heredada: HEAD buildeado igual ya pesaba 62,56. s19
  entra con 26 afirmaciones y 5 controles.
- **`npm run test:frontera`**: 2 invariantes, 33 afirmaciones, 0 con falla.
  `tsc --noEmit` en cero.
- El commit `B6-A: la escena persistente` y el push a `v3/escena-viva`, con
  el OK de la PARADA 2.

## 7. Lo que se corre para reproducir esto

```
npm run verificar                        # todo
npm run test:frontera
npm run test:s19                         # el lente

npx tsx scripts-b6/banco-b6.invariant.ts # los controles del banco, sin navegador
npx tsx scripts-b6/c-las-seis.ts --etiqueta=final   # las ocho, cada bloque, cada media pantalla
npx tsx scripts-b6/d-velo.ts             # la perilla del velo, con el control opaco
npx tsx scripts-b6/g-escena.ts           # el lente de P7 y el revelado en las fronteras
npx tsx scripts-b6/e-vitales.ts          # FPS contra b5-vitales.json
npx tsx scripts-b6/f-reducido.ts         # prefers-reduced-motion en las tres poses
npx tsx scripts-b6/a-referencia.ts       # nk.studio, pantalla por pantalla (una navegación)
```

Todo corre contra `http://localhost:3001` (el puerto de esta sesión) y con un
Chrome propio por CDP. Las capturas intermedias van a `.b6-capturas/`
(ignorada); las del reporte, a `docs/rediseno/capturas/b6/`.
