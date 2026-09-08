# B8 · LA LUZ MANDA — el reporte

**Qué es.** El velo de B6-A se saca; la oscuridad la pone la luz. El arco del sol
deja de ser una tarde monótona: mediodía, un atardecer en la pantalla en que
Trabajos entra, la noche durante su pin, un amanecer escondido y una mañana
sostenida hasta el final. Seis de las ocho secciones ven la sala. El contraste
se rompe a propósito y se declara, no se tapa.

**Dónde y cuándo.** Worktree `C:\v3-luz\logic-core-v3`, rama `v3/luz`, sobre el
merge de `v3/escena-viva` en `v3/luz` (`cda07be1`). 8 de septiembre de 2026.
Dev server en el **3001**, Chrome propio por CDP, perfil 1440×900. Sin subagentes.

**Lo que no se tocó**, verificado con `git status --porcelain` sobre sus rutas:
`anclaje.ts`, `recorrido.ts`, `CHOREO_KEYFRAMES`/`CHOREO_TRAMOS` (la coreografía
de cámara), el preloader, `scene-camera.ts`, los frozen, el contenido y la
composición de las ocho secciones. `choreography.ts` cambió en UNA cosa: el
bloque de `LIGHT_ARC` se fue a `lightArc.ts` y se re-exporta desde ahí.

---

## 1 · EL DIAGNÓSTICO, y por qué el velo se borra

> **Un velo oscuro sobre una sala de papel blanco da GRIS, nunca negro.**

B6-A abrió Trabajos y el Cierre con un fondo en gradiente (0,80 detrás del
texto, 0,40 desnudo) sobre una sala a nivel de luz 1. El humano lo grabó y el
veredicto fue que no se parecía en nada a la referencia. La causa es de
concepción: el papel a plena key da 249 sobre 255; un velo al 0,8 encima lo
deja en ~50 — gris —, y para llegar al negro de la referencia el velo tendría que
ser opaco, que es lo mismo que cerrar la sección.

La palanca correcta ya existía: `nivel = sin(elevación)/sin(36°)`, la relación
que S11 derivó de la geometría. A nivel 0,08 el mismo papel da **33 sobre 255**
en el modelo de sombreado de S6–S12 (`scripts-b8/modelo-de-luz.ts`, que
reproduce el control de S11 —248,3 / 218,7— antes de mover el nivel), y en la
captura real la sala del pin de Trabajos midió **luminancia media 0,020–0,031**
(§3). Sin velo, sin gris.

Se borraron `_estilos/velo.css`, `superficies-velo.ts`, los tres tokens
(`--color-velo-denso`, `--color-velo-ralo`, `--opacity-densa`) y el import del
layout. `superficies.invariant.ts` §1 afirma ahora la AUSENCIA: ni clase de velo,
ni hoja en el disco, ni token en el tema — con control positivo.

---

## 2 · EL ARCO — una tarde, una noche, una mañana (`escena/lightArc.ts`)

| parada | progreso | dónde cae (leído del anclaje/visibilidad, no copiado) | nivel | elevación | azimut | kelvin |
|---|---:|---|---:|---:|---:|---:|
| mediodía | 0 | el primer píxel | 1 | 36° | −42° | 6500 |
| fin del hero | 0,125 | pantalla 1 (S9: el sol quieto en la primera pantalla) | 1 | 36° | −42° | 6500 |
| **empieza el atardecer** | 0,46875 | Trabajos toca el pie del cuadro (pantalla 7) | 1 | 36° | 101,92° | 6500 |
| **noche** | 0,5 | Trabajos llena el cuadro (pantalla 8) | **0,08** | **2,70°** | 115° | 6500 |
| fin de la noche | 0,625 | Trabajos se va (pantalla 11) — la meseta de B4-A, a oscuras | 0,08 | 2,70° | 123,5° | 6675 |
| fin del amanecer | 0,7375 | la escena vuelve a dibujar: el margen de reanudación antes de que el diferencial asome | 0,5 | 17,1° | 131,15° | 6832,5 |
| **mañana** | 0,8525 | el ancla del diferencial (`TRAMOS_ANCLADOS`) | **0,643** | **22,2°** | 135,28° | 7219 |
| final | 1 | el final del scroll | 0,643 | 22,2° | 138° | 7700 |

**Qué cuenta.** El día arranca a mediodía y la sala se lee entera mientras
alguien lee el hero, Quiénes somos y Números. En la única pantalla de scroll en
que Trabajos entra, **atardece** —el nivel cae de 1 a 0,08 y el sol se pone
rasante—: los proyectos vienen del fondo de una sala a oscuras, con las
partículas brillando. La noche dura exactamente el pin. Entre que Trabajos se
va y el diferencial asoma la escena no dibuja (`visibilidad.ts`), y ahí
**amanece escondido**: el diferencial entra con el sol subiendo y llega a su
ancla con **la misma luz que S9 le dio a ese punto** (0,643), que se sostiene
hasta el final. La mañana es más baja que la tarde (22,2° contra 36°): el día
termina con menos luz de la que empezó, pero termina con luz.

**Lo que no se movió.** La recta de azimut de S9 (−42° → 115° entre 0,125 y
0,5), los azimuts de cada nudo, el barrido de 180°, el kelvin monótono, la
relación nivel/elevación. `s20-arco.invariant.ts` (37 afirmaciones, 5 controles)
afirma cada parada contra `progresoDePantalla` del anclaje real: si el anclaje
se moviera, el arco se pone en rojo.

**Las dos reglas nuevas, aprobadas en la PARADA 1:**

- **El contraluz se ata a la sala por debajo de 0,34** (`probeLighting.ts`,
  `rimIntensityAt`). De 0,34 a 1 es exactamente la fórmula de S6 —nada de lo
  que S6–S12 midieron se mueve, 0,34 era el nivel más bajo del arco viejo—; por
  debajo cae linealmente a cero. Sin esto el contraluz lavaba la noche de gris:
  a nivel 0,08 vale 0,445 contra los 1,375 que S6 le habría dado.
- **La rampa del paralaje del mouse se mudó al atardecer**
  (`choreographyPhysics.ts`): sus dos nudos son `ATARDECER.desde` y
  `ATARDECER.hasta`, leídos. Un cambio de amplitud de 14° adentro de un cambio
  de luz de 36° a 2,7° es un evento adentro de otro. `s18-azimut` afirma que
  TODO cambio de amplitud a la vista cae adentro del atardecer, y sus dos
  controles positivos (la rampa en el hero, la tabla de B5) ven cambios fuera.

**Y un defecto que el arco destapó:** `SHADOW_FAR` era 64 y la sombra del logo
con el sol a 2,7° mide **168 unidades** (profundidad 189,6 en la cámara de
sombra). Subió a 200. `s7-sol` §3 y `s20-arco` §5 lo afirman, y el control
positivo muestra que con 64 no entraba.

---

## 3 · LA LUMINANCIA DE CADA SECCIÓN, antes y después — PARADA 2 (b)

Instrumento: `npx tsx scripts-b8/c-las-ocho.ts --etiqueta=antes|despues`
(1440×900, cinco capturas por posición por `Page.captureScreenshot`, media de la
captura S = la sala sola). JSON en `docs/rediseno/outputs/b8/c-las-ocho-*.json`,
capturas en `docs/rediseno/capturas/b8/`. La referencia (`a-referencia.json`):
proyectos **0,0010**, hero 0,042, pantallas oscuras con texto 0,037–0,067, papel 0,991.

| sección | superficie antes → después | luminancia media de la sala, antes | después | gris después |
|---|---|---|---|---|
| Hero | papel-transparente → ídem | 0,734 | **0,726** (mediodía: la misma luz — ver la nota de la franja) | 212 |
| Quiénes somos | papel-opaco → **papel-transparente** | (opaca: 0,613 rancio) | **0,524–0,627** | 174–200 |
| Números | papel-opaco → **papel-transparente** | (opaca) | **0,540–0,780** | 175–220 |
| **Trabajos** | oscuro-opaco → **oscuro-transparente, la noche** | (opaca: la sala a nivel 1 medía 0,614) | **0,020–0,059** | **36–48** |
| Servicios | papel-opaco | 0,929 (el panel) | 0,929 | 247 |
| Tu panel | papel-opaco | 0,929 | 0,929 | 247 |
| Por qué develOP | papel-transparente → ídem | 0,361 | **0,323** (y=14400 es el ancla, 0,8525: nivel 0,643 en las dos curvas — la misma luz; ver la nota de la franja) | 147 |
| Cierre | oscuro-opaco → **oscuro-transparente** | 0,929 | **0,304** la sala; el pie pinta #0E0E0E encima (§11.1) | 146 |

**La nota de la franja: el hero y el diferencial bajaron sin que cambiara su
luz, y es el REVELADO.** Las dos poses tienen la misma luz antes y después
(nivel 1 y 0,643 en las dos curvas). Medida la captura S por franjas
(`.b8-capturas/x-franja.ts`): arriba de los últimos 135 px, el hero da 0,7141
antes y 0,7139 después, y el diferencial 0,3322 y 0,3308 — idénticos. La
diferencia está toda en la franja inferior de 135 px, que es la rampa del
revelado (`REVELADO_FRACCION` de 1080): antes había un `sale` en el pie del
cuadro —Quiénes somos y el Cierre eran opacos— y la escena se enmascaraba a
transparente dejando ver el papel (franja 0,8445 y 0,5226); ahora las dos
vecinas son transparentes, no hay costura, y la franja muestra la sala
(0,7908 y 0,2760). No es `SHADOW_FAR`: medido con 64, la captura da lo mismo
(0,7255 y 0,3237).

La sala de Trabajos pasó de **0,614 a 0,020–0,031** en el pin (gris 36–48):
más oscura que el hero de la referencia (0,042) y en el rango de sus pantallas
oscuras con texto (0,037–0,067); su sección de proyectos (0,0010, negro) sigue
más abajo. Las capturas: `docs/rediseno/capturas/b8/despues-<sección>-pose-{C,S}.png`
(C lo que se ve, S la sala sola) y `despues-<sección>-peor-y<scroll>-C.png`
donde el peor bloque no está en la pose.

**La celosía, la penumbra y el moiré con el sol bajo — PARADA 1 (c), medido.**
En la noche la celosía NO llega al piso: un sol a 2,7° sale por las paredes,
no por las rendijas (`s11-piso` §4 afirma 0 % de marcas en banda en Números y
Trabajos; `s11-proyeccion` §1 mide el alcance en 52 %). No «se lava»: no hay
key que proyecte, y la varianza de luminancia de la sala lo dice — **2,6·10⁻⁴
en el pin contra 5,6·10⁻² en el hero y 7,4·10⁻² en Números** (la trama del
piso y las bandas son la varianza). En la mañana vuelven: 2,6·10⁻² en el
diferencial (0,5) y 1,1·10⁻² en el Cierre (0,643), con las bandas visibles en
`despues-cierre-pose-S.png`. El moiré del piso vive de la key; en la noche no
hay moiré y no hay nada que medir. El sol no tiene cuerpo desde S11: lo que se
lee es lo que proyecta, y en la noche proyecta nada.

---

## 4 · TRABAJOS — cómo entran los proyectos — PARADA 2 (c)

B8 no tocó cómo entran: tocó la luz con la que entran. Lo que se afirma es
que lo que B4-A y B6-A construyeron sigue en pie, medido en el pin de Trabajos
**en la noche**:

| qué | cómo se midió | resultado |
|---|---|---|
| **El lente de P7** —los −3000 px del patrón caen a 63,6 unidades, adentro de la pared del fondo (58–64), medido por B6-A— | `scripts-b8/g-escena.ts` §1: `perspective` y `perspective-origin` COMPUTADOS del bloque de P7 en y=7200, 8100 y 9000, contra el foco de la escena (`FOCO_EN_ALTOS_DE_VENTANA × innerHeight`) y el centro del viewport en coordenadas del bloque | **1427,22 px** en las tres (esperado 1427,22) · origen **688 px 209 px** (esperado 688,0 / 209,3) · el bloque en (32, 240,75) de 1376×627 · pegado `sticky top 0` |
| **La meseta de B4-A** — cada proyecto llega, se queda y sale; nunca los tres invisibles a la vez, barrido sobre el pin entero con el fotograma de P7 | `trabajos.invariant` §16 (`s5-trabajos`) | 137 afirmaciones, 0 fallas |
| **El techo de velocidad de B2 (4,6531)** | `s16-techo` | 16 afirmaciones, 0 fallas |
| **La coreografía de cámara** | `git diff` sobre `CHOREO_KEYFRAMES`/`CHOREO_TRAMOS` | vacío (§7) |
| **La luz con la que entran** | `c-las-ocho despues`, la sala sola en las cinco posiciones del pin (y=7200 → 9000) | luminancia **0,031 · 0,029 · 0,024 · 0,020 · 0,059**, gris 36–48; nivel 0,08, sol a 2,7° |

**Desde qué profundidad, en la noche:** la misma de B6-A —el patrón de −3000 px
con el lente de la escena—, sobre una sala que ya no es papel sino sombra: el
proyecto entra desde la pared del fondo (58–64 unidades) hacia una cámara a la
que el contraluz, atado a la sala, ya no le lava el fondo de gris (0,445 contra
1,375 de S6 a ese nivel). Las capturas del pin: `docs/rediseno/capturas/b8/b8-trabajos-{7200,8100,9000}-C.png`
(el «antes», con el velo, son las `abierto-trabajos-*` y `final-trabajos-*` de
`capturas/b6/`), y `despues-trabajos-pose-{C,S}.png` con la sala sola.

**Lo que el barrido midió de los proyectos** (`c-las-ocho despues`, y=7200 →
9000): los tres nombres en cuadro por turnos —Esquina en la pantalla 8 (11,97:1),
El Garage en 8,5 (9,67 en tránsito, 12,14 a plena), Banú en 10 (5,28)—, el
chip [MÉTRICA] a 5,29 (6,38 a plena), y ningún proyecto por debajo de AA. Lo
que sí cae es el texto que los rodea, y es D-B8.2 (§6): las partículas brillan
debajo de los glifos.

---

## 5 · LAS PARTÍCULAS sobre el fondo oscuro — PARADA 2 (d)

Instrumento: `scripts-b8/particulas.ts` (umbral = mediana del gris + 40,
componentes 4-conexas, área ≤ 400 px), el mismo que midió la referencia en la
PARADA 1: **≈600 por pantalla, ⌀ 1,6 px, gris 47 sobre negro**.

| corrida | por pantalla (1440×900) | por 100k px² | ⌀ mediana | ⌀ p90 | pico mediano | fondo |
|---|---:|---:|---:|---:|---:|---:|
| brillo a 1,0 (el recibo de la calibración, `c-las-ocho-despues-brillo1.json`) | 873–881 | 67,4–68,0 | 3,39 px | 5,2–5,6 | **220** | 41–51 |
| **brillo a 0,25 lineal (embarcado)** | **799–847** | 61,7–65,4 | **2,99–3,19 px** | 4,5–4,7 | **117–119** | 39–51 |

Cómo brillan: `particleGlow.ts`. Un uniform que sigue al nivel del arco mezcla la
tinta de vértice hacia un gris lineal de 0,25 (tres canales iguales) por debajo
de 0,34 y es exactamente cero con luz; las lejanas, que de día van hacia el
papel, de noche bajan al mismo gris al que suben las cercanas. La cantidad es la
del campo de siempre (3000 + 90). Contra la referencia: **más motas por pantalla
(≈820 contra ≈600), el doble de diámetro (3,0 contra 1,6 px) y un pico dos veces
y media más alto sobre un fondo que no es negro (118 sobre 45 contra 47 sobre
0).** El diámetro es el tamaño de siempre con la atenuación de siempre; no se
tocó. Lo que las partículas le hacen al texto claro está en §6 (D-B8.2).

---

## 6 · LA LISTA COMPLETA DE LO QUE FALLA DE CONTRASTE — PARADA 2 (e)

Dos instrumentos, y dicen cosas distintas a propósito:

- **El modelo de CPU** (`s8-tinta` §4, `s8-tinta-ventanas.ts`): el peor píxel
  del cuadro SIN el logo, barriendo la ventana entera de cada sección, con la
  tinta que lleva. Mide la LUZ.
- **La captura real** (`scripts-b8/c-las-ocho.ts --etiqueta=despues`, filas
  derivadas con `scripts-b8/d-filas-de-acceso.ts`, transcritas a
  `s10-acceso-escena.ts`): el peor píxel bajo cada glifo, logo incluido. Mide
  lo que el visitante ve.

### 6.1 · Por captura, sección por sección y bloque por bloque

| sección | tinta | bloques | fallan AA | peor | dónde | deuda |
|---|---|---:|---:|---:|---|---|
| Hero | `--color-tinta@1` | 7 | **3** | 2,94:1 | «piloto automático.», y=0, 6.769 px de glifo, 2 bajo AA — el logo detrás | D-B8.5 |
| Quiénes somos | `--color-tinta@1` | 15 | **12** | 1,00:1 | «Trabajamos desde Tucumán…», y=1800, 7.015 px, 3.069 bajo AA — el logo detrás | D-B8.6 |
| Quiénes somos | `--color-tinta@0.6` | 2 | **2** | 1,97:1 (a plena 2,77) | «Tucumán, Argentina», y=900 | D-B8.6 |
| Números | `--color-tinta@1` | 8 | **6** | 1,00:1 | «Lo que se puede contar», y=4050, 5.999 px, 1.250 bajo AA — el logo detrás | D-B8.1 |
| Números | `--color-tinta-media@1` | 5 | **4** | 1,02:1 | «Años en el mercado», y=5400 | D-B8.1 |
| **Trabajos** | `--color-tinta@1` (clara) | 7 | **3** | 2,53:1 | «Lo que cambió», y=9000, 412 px, 5 bajo AA; «Trabajos» 4,30 (6 px bajo AA); el cuerpo 3,78 (142 px) — **las partículas que brillan, debajo de los glifos** | D-B8.2 |
| Trabajos | `--color-tinta@0.87` | 2 | 0 | 5,29:1 (a plena 6,38) | «[MÉTRICA]» | — |
| Por qué develOP | `--color-tinta@1` | 7 | **5** | 1,11:1 | «El diferencial no está en el diseño…», y=14400, 9.872 px, 1.423 bajo AA — el logo detrás y el amanecer a medio hacer | D-B8.3 |
| Cierre | `--color-tinta@1` (clara) | 20 | 0 | 18,00:1 | sobre el pie que pinta #0E0E0E — la sala no se ve (§11.1) | (D-B8.4 por el modelo) |
| Cierre | `--color-tinta@0.6` | 3 | 0 | 6,85:1 | ídem | |
| Cierre | `--color-tinta-tenue@1` | 2 | 0 | 6,44:1 | la ayuda y el placeholder del formulario | |

**Total sobre la escena: 78 bloques, 35 bajo AA en su peor píxel.** Las
opacas no cambian con B8: Servicios muestra 36 «fallas» a opacidad 0,3 que a
plena dan 17,6:1 (el revelado en tránsito, §11.9) y Tu panel 1 (1,07:1 en un
cuerpo a 0,977 — lo mismo que medía antes).

### 6.2 · Por el modelo — dónde está cada cruce

| sección | tinta | ventana p=[…] | peor de la ventana | dónde | deuda |
|---|---|---|---:|---|---|
| Hero | oscura | [0, 0,125] | 8,71:1 | p=0,125 | pasa |
| Quiénes somos | oscura | [0, 0,375] | 7,67:1 | p=0,352 | pasa |
| Números | oscura | [0,2917, 0,5] | **1,20:1** | p=0,5 — pasa AA hasta p=0,4882, 0,012 antes de irse: la última pantalla cae adentro del atardecer | D-B8.1 |
| Trabajos | clara | [0,4688, 0,625] | **1,02:1** | p=0,4688 — asoma con la sala a pleno sol; se lee desde p≈0,49; en la noche 13,6:1 | D-B8.2 |
| Por qué develOP | oscura | [0,7411, 1] | **3,19:1** | p=0,7411 — asoma a nivel 0,504, con el amanecer a medio hacer; llega a AA en p=0,816, mientras el panel todavía entra; en el ancla (0,8525, donde llena el cuadro) 4,98:1; en p=1 5,12:1 | D-B8.3 |
| Cierre | clara | [0,8525, 1] | **1,59:1** | de punta a punta — tinta clara sobre la sala a 0,643 | D-B8.4 |

Los cruces de la tinta oscura: baja de AA en **p=0,4882** (adentro del
atardecer, 0,47–0,50) y vuelve a pasarlo en **p≈0,816** (mientras el diferencial
entra); desde el ancla (0,8525) hasta el final se sostiene (4,98 → 5,12). Con el
arco viejo p=1 daba 2,34:1.

### 6.3 · La pregunta de la PARADA 2: ¿el Cierre sigue teniendo sentido como sección oscura?

Las tres variantes, medidas con el mismo instrumento sobre la misma pose
(y=15300, la sala a 0,643 detrás, luminancia 0,302–0,303), quitándole al pie su
relleno sólo mientras se mide (`--cierre=…`, `VARIAR_EL_CIERRE`):

| variante | qué es | bloques | fallan AA | peor | por tinta |
|---|---|---:|---:|---:|---|
| **como está** | `oscuro-transparente` en la tabla; el pie pinta #0E0E0E y tapa la sala | 25 | **0** | 6,44:1 | plena 18,00 · @0,6 6,85 · tenue 6,44 |
| `oscuro-transparente` de verdad | el pie sin relleno: tinta clara sobre la sala iluminada | 25 | **25** | **1,00:1** | plena 1,50 · @0,6 1,31 · tenue 1,00 |
| `papel-transparente` | sin `data-seccion`: tinta oscura sobre la sala iluminada, el pie sin relleno | 25 | **13** | 1,01:1 | plena 2,49 (8 de 20) · @0,6 1,90 (3 de 3) · tenue 1,01 (2 de 2) |
| `papel-opaco` | sin `data-seccion`, `bg-fondo`: el pie pinta papel | 25 | **0** | 4,83:1 | plena 17,6 · @0,6 4,83 · tenue 6,43 |

**La decisión (PARADA 2): el Cierre queda como está, 0 de 25.** Y la razón va
escrita porque no es la que parecía: la variante que abre de verdad rompe
25 de 25 y la de papel rompe 13, y **en las dos el peor es 1,00–1,01 por EL
LOGO detrás del texto, no por la luz** (la tinta clara contra un papel a 150 da
1,50 en el mejor de los bloques plenos; el 1,00 es el titular sobre el logo, y en
papel-transparente los 13 que fallan son el logo y las bandas claras detrás de la
tinta oscura). Abrir el Cierre es un problema de **acomodar el texto**, no de
superficie, y por eso va al bloque siguiente junto con las otras cinco deudas
(D-B8.4 en `deudas-b8.ts`, con las cuatro variantes y su número). La superficie
del pie se decide después de mover el texto, no antes.

---

### 6.4 · D-B8.3, la salida barata: MEDIDA, NO APLICADA

Autorizada en la PARADA 2: terminar el amanecer en 0,643 **antes de que la
escena reanude** (la parada de 0,7375 pasa de 0,5 a 0,643; todo lo demás
igual). Se midió editando el arco en el árbol de trabajo sólo durante la
medición y restaurándolo byte a byte (SHA-1 `0da41422…` antes y después);
el commit lleva la curva aprobada. Instrumentos: el modelo de CPU
(`.b8-capturas/d-b8-3.ts`, el mismo muestreador de `s8-tinta`) y la captura
real (`c-las-ocho --solo=por-que-develop`).

**Qué le hace al diferencial:**

| | curva aprobada | salida barata |
|---|---|---|
| nivel al asomar (p=0,7411) | 0,504 (17,3°) | **0,643 (22,2°)** |
| peor píxel del cuadro al asomar, tinta oscura | 3,19:1 | **4,28:1** |
| la tinta pasa AA desde | p=0,8156 | **p=0,7688** |
| en el ancla (0,8525) y en p=1 | 4,98 · 5,12 | 4,98 · 5,12 (igual) |
| la ventana del diferencial (`s13b`) | [0,8232, 1] | [0,8232, 1] (igual) |
| la captura en y=14400 (el ancla): bloques bajo AA, peor | 5 de 7, 1,11 | **5 de 7, 1,11 — idéntica al centésimo** (sala 0,323 contra 0,324) |

O sea: la salida barata **acorta la entrada bajo AA de 0,075 a 0,028 de
progreso** (de 0,7411 a 0,769 en vez de a 0,816) y no llega a sacarla del
todo, porque el peor píxel al asomar es 4,28 con la sala a plena mañana. Y **no
toca ni un píxel de lo que la captura midió**: los 5 de 7 son el logo detrás
del texto, a la misma luz en las dos curvas. D-B8.3 sigue siendo, sobre todo,
la misma deuda que las otras cinco: dónde está el texto.

**Qué le hace al resto de la curva:**

- **Nadie ve subir el sol.** El amanecer entero (0,08 → 0,643) queda entre
  0,625 y 0,7375, donde la escena no dibuja. El diferencial entra a plena
  mañana en vez de con el sol subiendo; el «evento» del amanecer desaparece de
  la vista. Con la curva aprobada, la subida de 0,504 a 0,643 se ve durante la
  entrada del diferencial (0,7411 → 0,8525).
- **El calibrador**: la pose `demos` (p=0,75) sube de 89,8 a **105,8** con
  celosía (96,6 → 113,4 sin ella). Las otras cinco poses no se mueven.
- **La sombra del logo** en p=0,75 pasa de 24,8 a 19,3 unidades (la del
  cierre, ya desde la reanudación). Nada cambia en la noche ni en la mañana
  desde el ancla.
- **Los invariantes**: `s20-arco` seguiría verde (las paradas son las mismas;
  el nivel de 0,7375 no está afirmado como 0,5), `s8-tinta` §3 movería la
  «vuelta a AA» de 0,816 a 0,769 (adentro del mismo tramo afirmado),
  `s12-tension`/`s12-barrido` cambian la cifra publicada de `demos` y nada
  más. Ninguno se pondría en rojo; los números publicados se re-citarían.

---

## 6b · 🔴 EL PIE — la sala nunca se vio detrás del Cierre, ni con velo ni sin él

`chrome/Pie.tsx` emite `<footer data-pieza="pie">`, y `[data-pieza="pie"]`
pinta `var(--color-fondo)` por hoja. Adentro de `[data-seccion="invertida"]` ese
token vale #0E0E0E. **El pie envuelve la sección entera** —el titular, el CTA, el
recorrido, el contacto, las novedades, la firma—, así que lo que pinta es la
sección completa, de arriba a abajo. Diagnosticado en el navegador con
`elementsFromPoint` en cuatro puntos del viewport (`scripts-b8/h-cierre-negro.ts`):
en los cuatro, el único elemento que pinta es el `<footer>`, `rgb(14, 14, 14)`;
la escena está visible, sin máscara, a opacidad 1, y la captura S (la sala
sola) la muestra iluminada a 0,304.

Tres consecuencias, y las tres importan más que el Cierre:

1. **Ninguna cantidad de trabajo sobre la SUPERFICIE lo hubiera arreglado.** El
   velo de B6-A, el nivel del arco de B8, `oscuro-transparente`, `papel-transparente`:
   todo eso decide qué pinta el PANEL, y el panel del Cierre no pinta nada. Lo
   que tapa la sala es un componente del chrome, dentro de la sección, que no
   sabe qué superficie declara la tabla. La sala nunca se vio detrás del Cierre
   con el velo, y tampoco se ve sin él.
2. **El bloque anterior midió «abre, 0 de 25 fallan» sobre una sección que
   estaba tapada por su propio componente.** B6-A publicó 18,00:1 para 20
   bloques del Cierre «detrás del velo denso»: era el pie. Es un verde que
   describía otra cosa —no la lectura de la tinta sobre la sala velada, sino la
   tinta sobre un rectángulo #0E0E0E—, y pasó por todos los controles porque el
   instrumento mide lo que está debajo del glifo y debajo del glifo había pie.
   La captura de B8 lo repitió al número (18,00 / 6,85 / 6,44) hasta que las
   variantes le quitaron el relleno.
3. **`Cierre.tsx` lo declaraba, como consecuencia buscada, cuando la sección
   era opaca:** «`[data-pieza="pie"]` pinta `var(--color-fondo)`, que ese bloque
   ya redefinió», para que la sección fuera correcta con `papel-opaco` y con
   `oscuro-opaco` sin tocar una línea. Cuando B6-A la pasó a transparente, esa
   frase dejó de ser una garantía y pasó a ser el tapón, y nadie la releyó.

No se tocó: es estilo del chrome y de la sección, y la decisión de la PARADA 2
es que el Cierre queda como está (§6.3). Lo que este hallazgo deja para el
bloque siguiente es el orden: primero el texto donde el logo no quede detrás,
después qué pinta el pie.

---

## 7 · LO QUE NO SE MOVIÓ UN BIT — PARADA 2 (f)

**Por `git`:** `git diff --stat` sobre `anclaje.ts`, `anclajeDerivacion.ts`,
`recorrido.ts`, `visibilidad.ts`, `scene-camera.ts`, `_intro/`, los cuatro
frozen, `probe-escena/page.tsx` y los componentes de Trabajos, Cierre y el pie
devuelve **vacío**. En `/probe-escena` no hay un cambio fuera de `__tests__/`.
`choreography.ts` cambió **128 líneas y ninguna es de la coreografía**: se
borraron las 117 del bloque de `LIGHT_ARC` (su docblock y sus seis paradas) y
entraron 11 (un docblock y `export { LIGHT_ARC } from './lightArc'`).
`CHOREO_KEYFRAMES` y `CHOREO_TRAMOS` no tienen una línea en el diff.

**Por invariante, en la corrida final:**

| qué | instrumento | resultado |
|---|---|---|
| el anclaje (nudos, ventanas, el ancla 0,8525) | `s9-anclaje` | 46 afirmaciones, 0 fallas |
| el progreso y el diferencial (la ventana, el titular limpio) | `s13b-escena` | 48, 0 fallas |
| **el techo de velocidad de B2 (4,6531)** | `s16-techo` | 16, 0 fallas |
| **la meseta de B4-A** (cada proyecto llega, se queda y sale; nunca los tres invisibles), barrida sobre el pin entero con el fotograma de P7 | `s5-trabajos` (`trabajos.invariant` §16) | 137, 0 fallas |
| el revelado (costuras, sin costura entre transparentes contiguas) | `s17-revelado` | 35, 0 fallas |
| el arco cae en los nudos del anclaje, LEÍDOS | `s20-arco` §2 | 37, 0 fallas |

**Por navegador:** el lente de P7 y el revelado en las seis fronteras, en §4 y §8.

---

## 8 · FPS y `prefers-reduced-motion` — PARADA 2 (g)

**FPS** — `scripts-b8/e-vitales.ts`: el mismo contador de B5
(`CONTADOR_DE_CUADROS`), el mismo perfil (1440), una lectura quieta de 3 s y
tres recorridos de 12 s a 24 px por cuadro; las líneas de base LEÍDAS de
`b5-vitales.json` y `b6/e-vitales.json`. Lo que cambió: la escena dibuja 13 de
17 pantallas en vez de 7, sin velo, con la noche, `SHADOW_FAR` 200 y las
partículas brillando.

| | cuadros | mediana | p05 | mínimo | cuadros > 20 ms |
|---|---:|---:|---:|---:|---:|
| **B8** quieta | 226 | 75,19 | 74,63 | 74,07 | 0 |
| **B8** recorridos 1 · 2 · 3 | 901 · 900 · 900 | 75,19 | 74,63 | 74,07 · 73,53 · 73,53 | 0 · 0 · 0 |
| B6-A recorridos | 899 · 900 · 900 | 75,19 | 74,63 | 37,45 · 64,94 · 72,46 | 1 · 0 · 0 |
| B5 recorridos | 898 · 900 · 899 | 75,19 | 74,63 | 37,45 · 68,97 · 37,45 | 2 · 0 · 1 |

Peor de tres recorridos: mediana **75,19 contra 75,19** (B5 y B6-A), p05
**74,63 contra 74,63**, mínimo **73,53 contra 37,45 y 37,45**, cuadros largos
**0/0/0 contra 2/0/1 y 1/0/0**. La línea de base de B4-B para el mínimo es 73,5.
Ocho pantallas más de escena no costaron un cuadro en este equipo; el cuadro
de 26,7 ms que B5 y B6-A veían en el 439 no apareció (B7 ya había medido que
no se reproduce).

**`prefers-reduced-motion`, sin arnés** — `scripts-b8/f-reducido.ts`: la
preferencia la pone `Emulation.setEmulatedMedia` y se verifica que la página
la LEYÓ (`matchMedia`); dos capturas de la sala sola separadas por 5 s tienen
que ser prácticamente idénticas con la preferencia, y DIFERIR sin ella (el
control positivo que impide que «quieta» pase porque el canvas estaba negro —
en la noche de Trabajos eso importa el doble). Cinco poses: el hero, Quiénes
somos, Números, el pin de Trabajos y el Cierre.

| caso | pose | y | la página lee la preferencia | escena | píxeles que cambian en 5 s |
|---|---|---:|---|---|---:|
| reducido | hero | 0 | true | montada | **0 %** (media 0) |
| reducido | quienes-somos | 900 | true | montada | **0 %** |
| reducido | numeros | 3600 | true | montada | **0 %** |
| reducido | **trabajos (la noche)** | 8100 | true | montada | **0 %** |
| reducido | cierre | 15375 | true | montada | **0 %** |
| normal | hero | 0 | false | montada | 23,38 % (media 7,04) |
| normal | quienes-somos | 900 | false | montada | 20,57 % |
| normal | numeros | 3600 | false | montada | 14,08 % |
| normal | trabajos | 8100 | false | montada | 6,19 % (media 2,19) |
| normal | cierre | 15300 | false | montada | 14,76 % |

**10 casos, 0 con falla**: con la preferencia la sala no se mueve en ninguna de
las cinco poses —la noche incluida, donde las partículas que brillan podrían
haber pasado por «quieta»—, y sin ella se mueve en las cinco. Una cosa que el
instrumento destapó y no es de B8: **con la preferencia puesta, Servicios mide
2775 px y no 2700** (la política de movimiento reducido que B7 unificó cambia su
pin); la precondición de la grilla de B5 tira ahí, y este instrumento la
reemplazó por ocho paneles y el alto publicado (`f-reducido.json`,
`fueraDeGrilla`).

---

## 9 · LAS AFIRMACIONES REESCRITAS, una por una — regla 15, con el docblock

Ninguna se aflojó ni se borró. Cada una lleva en su docblock **qué custodiaba
antes y por qué cambió**. Tres clases:

**(a) Las que describían la DECISIÓN que B8 cambió** (qué secciones ven la
sala, dónde vive la rampa, la forma del arco). Se re-derivaron contra la
decisión nueva:

| archivo | custodiaba | custodia ahora |
|---|---|---|
| `superficies.invariant` §1 | el velo: clase, hoja, tokens, pisos en gradiente | la AUSENCIA del velo: sin clase, sin `velo.css` en el disco, sin los tres tokens en el tema, las mismas clases que `papel-transparente` salvo la tinta — con control positivo |
| `superficies.invariant` §2 | cuatro transparentes | seis transparentes y dos opacas, tabla contra tabla |
| `s9-visibilidad` §1.2 | 4 y 4 · 7/4 · 12 de 18 pantallas opacas | 6 y 2 · 7/2 · 5 de 18 |
| `s9-visibilidad` §2 | cuatro ventanas, tres bandas, «detrás de Números» como control | seis ventanas fundidas en DOS bandas ([0, 11] y [15, 17]); los controles son las dos opacas que quedan |
| `s9-visibilidad` §4 | «más de la mitad del recorrido sigue suspendido» (55,9 %) | lo suspendido es EXACTAMENTE el único hueco (de que Trabajos se va a que el diferencial asoma, 4 pantallas) menos el margen: 22,1 % — publicado con su derivación |
| `s9-anclaje` §6 | cuatro ventanas de progreso con dos huecos | seis; las cuatro primeras se encadenan; el único hueco es Servicios + Tu panel |
| `s18-azimut` §4b | la rampa termina ANTES del tramo de Trabajos, adentro de una banda suspendida; cambios a la vista = 0 | los dos nudos SON los bordes del atardecer (leídos); la rampa termina EXACTAMENTE donde arranca el tramo; TODO cambio a la vista cae adentro del atardecer, y en esa pantalla el sol pierde más del 90 % de su nivel; dos bandas visibles; los dos controles (rampa en el hero, tabla de B5) ven cambios FUERA del atardecer |
| `s16-encuadre` §5 (control) | «al final del recorrido la misma escena no llega a AA» (p=1) | la entrada cambió a la noche de Trabajos: en p=1 la mañana sostiene AA |
| `numeros.invariant` §1 · `quienes-somos.invariant` §1 | `papel-opaco` | `papel-transparente`, por decisión, con la deuda nombrada |
| `s4-ventana` §4 · `s4-agregado` §4 (nueva) | tres cifras del resumen | cuatro: `deudas declaradas`, con un fixture que declara una y pasa |
| `s5-presupuesto` / `s5-peso` | dos líneas heredadas (0,15 y 1,35, de dos entornos) | UNA: 0,07 KiB, medida sobre el árbol mergeado antes de tocar producto, con el recibo en bytes |

**(b) Las que medían una PROPIEDAD DE LA ESCENA con la forma del arco viejo**
(monotonía). Se reescribieron contra la propiedad que siempre custodiaron,
ahora sobre un arco con una noche en el medio:

| archivo | custodiaba | custodia ahora |
|---|---|---|
| `s8-tinta` §3 | «cae monótono y cruza AA en la última pantalla (0,85–0,9)» | DOS cruces: hacia abajo adentro del atardecer (p=0,4882), hacia arriba mientras el diferencial entra (p≈0,816); los dos reales en las dos direcciones; la mañana sostiene AA desde el ancla hasta el final; baja de punta a punta |
| `s8-tinta` §4 | el peor de los cuatro bordes de cada ventana, con la tinta oscura | la ventana entera barrida (`s8-tinta-ventanas.ts`), con la tinta que lleva cada sección (oscura contra el píxel más oscuro; invertida contra el más claro); hero y Quiénes somos pasan; Números, Trabajos, el diferencial y el Cierre son las deudas D-B8.1–4 |
| `s8-tinta-diferencial` §5 | «llena el cuadro ANTES del cruce de AA» · «ganó contraste contra el provisional» · «el cruce de AAA de la mediana quedó atrás del ancla» | «llena el cuadro DESPUÉS de la vuelta a AA» · el provisional también pasaría hoy: el ancla no se sostiene por contraste · la mediana pasa AA y NO llega a AAA en el ancla (la luz del ancla es la de S9) · la cola ya no cruza AA: lo que tapa al final es el Cierre |
| `s13b-diferencial` §4 + `s13b-ventana.ts` (nuevo) | `cruceDeAA` bisecaba sobre [0, 1] suponiendo monotonía; «NINGUNO de los dos repartos cae adentro» | la bisección busca, desde donde el titular queda limpio, la primera caída bajo AA (o el final del recorrido); el heredado sigue afuera por el titular, el otro (0,9167) cae ADENTRO por contraste y lo descarta el corrimiento de `tu-panel` (`s16` §5, con 0,9167 sumado a los candidatos) |

**(c) Las 15 de `/probe-escena/__tests__`** —de las 18 autorizadas; las otras
tres pasaron con el arco real (dos de s12, y la del shadow map con el FAR
nuevo)—, cada una con su docblock:

| archivo | # | custodiaba | custodia ahora |
|---|---:|---|---|
| `s7-sol` §2 | 1 | «la elevación nunca sube: el sol baja y no vuelve» | un DÍA: baja una vez, sostiene la noche, sube una vez sin volver al mediodía; dos controles (sube antes de la noche; dos noches) |
| `s10-escena` §4 | 1 | «la sombra crece de punta a punta (×3,6)» | la más larga es la de la noche (×15, sol rasante); del amanecer al cierre se acorta sin volver a la de mediodía (×1,8); la razón con las bandas sigue siendo 1/tan |
| `s11-piso` §3 | 2 | «reproduce los SEIS de S10» · «la celosía baja el valor medio en las seis contra S10» | reproduce S10 en las dos poses cuya luz B8 no tocó (hero, Quiénes somos) y NO en las cuatro re-iluminadas; la celosía baja el valor medio en las seis contra la MISMA luz; hero < −8 intacto, Números (en la noche) < 0 |
| `s11-piso` §4 | 1 | «en TODA pose con replanteo, una parte grande cae adentro de una banda» | en toda pose CON LUZ (hero 77 %, cierre 75 %); en la noche el sol rasante no proyecta (0 %), y se afirma |
| `s11-proyeccion` §1 | 1 | «el alcance nunca se achica: se abre con el atardecer» | el alcance es función de la elevación (a igual elevación, igual alcance, de a pares); en las poses con luz no se achica (82 % → 100 %); en la noche cae a 52 % y se publica |
| `s11-proyeccion` §2 | 1 | «las bandas se alargan ×3,5 de punta a punta» | se alargan hasta la noche (×>10) y en el cierre quedan más largas que a mediodía, con la razón tan(36°)/tan(22,2°) afirmada como cuenta |
| `s11-proyeccion` §3 | 1 | «el barrido (u+v) es de los 180° de azimut, 51 celdas» | el barrido TANGENCIAL es del azimut (51 ± 1); el VERTICAL es de la elevación (la noche bajando y subiendo, > 1 celda) |
| `s12-barrido` §1 | 1 | «ninguna pose vuelve a la escena sin celosía de S10» (tabla de S10) | contra la escena sin celosía a la MISMA luz, que en las dos intactas reproduce S10; en la noche «por debajo», no «dos puntos por debajo» |
| `s12-barrido` §2 | 2 | «la portadora no se mueve hasta 0,5°» en las cuatro poses · «desde 0,75° cae» | en las poses con luz no se mueve; en la noche la portadora es una fracción de la del hero; el techo práctico lo marca el hero: aguanta 0,75° y cae en 1° |
| `s12-tension` §1 | 3 | «las cinco poses que V3-E no tocó siguen siendo las de S11» · «las poses con piso (hero y Trabajos) suben con el sol real» · «ninguna vuelve a S10» | Quiénes somos reproduce S11 y las cuatro re-iluminadas se movieron en la dirección de la decisión · el hero sube y la noche no se mueve (la penumbra es de la key) · contra la escena sin celosía a la misma luz |
| `s12-tension` §3 | 1 | «la penumbra como fracción de la banda se achica ~32 %» (cierre a 11,5°) | se ACHICA hacia el cierre aunque en mundo se ensanche (−24 % cerrando a 22,2°), publicado |

**Fuera de las 18, y se declara:** UNA línea en `probe-escena/__tests__/shading.ts`
—`rimIntensityAt(level) * dotRim` en lugar de la fórmula de S6 inline—, para
que el modelo de CPU del calibrador reproduzca el contraluz que el rig
escribe. Sin esa línea el calibrador mediría otra escena que la de producción.

**El calibrador sigue siendo útil, y está medido:** las dos poses que B8 no
re-iluminó (hero, Quiénes somos) reproducen S10 y S11 al décimo con el mismo
instrumento —son el ancla de continuidad—; las cuatro re-iluminadas muestran
ahora la noche y la mañana con los mismos sliders (celosía, penumbra, desajuste)
y con las mismas afirmaciones sobre lo que esos sliders hacen. Lo que el
calibrador ya no puede hacer es medir la celosía en Números y Trabajos —ahí no
hay key que proyecte—; para eso quedan el hero y el Cierre.

**Nuevos:** `s20-arco.invariant.ts` (37 afirmaciones, 5 controles),
`s20-brillo.invariant.ts` (19, 2), `s4-fixtures/deuda.invariant.ts`,
`s13b-ventana.ts`, `s8-tinta-ventanas.ts`, `deudas-b8.ts`.

---

## 10 · LOS GATES — PARADA 2 (a)

**El build**, en primer plano, con el dev server del 3001 detenido por ruta de
worktree (los tres `node.exe` cuya línea de comando contiene
`C:\v3-luz\logic-core-v3`), `CIRCLE_NODE_TOTAL=2` y `--max-old-space-size=6144`:
`npm run build` → **exit 0 en 3 min 54 s**, `/v3` y sus cuatro rutas
prerenderizadas.

**El peso**, con el recibo en bytes (`scripts-b8/peso.ts`):

| build | chunks propios | crudos | preámbulo de Sentry | escritos por el lane |
|---|---:|---:|---:|---:|
| `.next-b8` — el árbol mergeado antes de tocar producto | 5 | 65.350 B | 1.740 B | **63.610 B = 62,119 KiB** |
| `.next` — el build final de B8 | 5 | 65.258 B | 1.740 B | **63.518 B = 62,029 KiB** |

B8 **saca 92 B**: el velo pesaba más que el arco, el contraluz atado, el brillo y
`SHADOW_FAR` juntos. Las dos líneas heredadas del merge (0,15 de B7 y 1,35 de
B6-A, de dos entornos) se volvieron UNA: **0,07 KiB**, lo que queda sin dueño en
este entorno (63.610 − 63.539 de líneas con nombre). El techo: 60 + 1,25 (B4-A)
+ 0,55 (B7) + 0,25 (B6-A) **− 0,09 (B8)** + 0,07 (heredado) = **62,03 KiB**, y el
techo viejo de 60 sigue vigilando todo lo no declarado (`s5-peso`: 17
afirmaciones, 0 fallas, 0,00 KiB de aire — por construcción, como en B7).

**`npm run test:frontera`**: exit 0 — 2 invariantes, 23 afirmaciones, 10
controles positivos, 12 fuera de ventana, 0 con falla.

**`npm run verificar`** (`package.json` limpio · sin marcadores de conflicto ·
`tsc --noEmit` en 48 s · los 25 agregados, sin cortar en la primera falla):

| paso | resultado |
|---|---|
| 1 · `package.json` | limpio |
| 1b · conflictos en todo el repo | limpio |
| 2 · `tsc --noEmit` | ok |
| 3 · 25 agregados | **129 invariantes · 5.066 afirmaciones · 880 controles positivos · 17 fuera de ventana · 11 deudas declaradas · 0 con falla** |
| 4 · resumen | **28 pasos, 0 con falla** (`verificar-exit=0`) |

La primera corrida del gate dio 27 de 28 con `s20` en rojo: `s20-brillo` todavía
afirmaba el blanco puro (`vec3( 1.0 )`) y el tope de la curva después de que la
calibración bajó el gris a 0,25 y movió el tope al shader. Se reescribió contra
lo que el módulo hace ahora (la mezcla completa en la noche, UN escalar como
objetivo, el módulo sin un hex ni un `vec3` de tres valores) y la segunda corrida
cerró en 0. Las dos corridas están en `.b8-capturas/verificar-1.log` y
`verificar.log` (fuera del repo).

**Las deudas declaradas, contadas por el agregado**: `s8` publica 4
(`s8-tinta` §4, por el modelo) y `s10` publica 7 (`s10-acceso` §10, por la
captura: hero, Quiénes somos ×2, Números ×2, Trabajos, el diferencial). Ninguna
afirmación se aflojó ni se borró; cada deuda corre con su condición intacta y
cuenta aparte (`afirmar.ts`, `deudaDeclarada`; `s4-ventana` §4 y `s4-agregado`
§4 afirman que el corredor la lee y que no es una falla).

---

## 11 · TODO LO QUE FRENÓ — PARADA 2 (i)

1. 🔴 **EL CIERRE ESTÁ ABIERTO EN LA TABLA Y CERRADO POR SU PIE.** El barrido
   midió el Cierre en 18,00:1 en 20 de sus 25 bloques —exactamente lo que B6-A
   había publicado «detrás del velo»— con la sala iluminada a 0,643 detrás.
   Diagnosticado en el navegador (`elementsFromPoint`, `scripts-b8/h-cierre-negro.ts`):
   el `<footer data-pieza="pie">` de `chrome/Pie.tsx` pinta `var(--color-fondo)`
   por `[data-pieza="pie"]`, que adentro de `[data-seccion="invertida"]` vale
   #0E0E0E, y el pie envuelve la sección entera. O sea: **la sala nunca se vio
   detrás del Cierre, ni con velo ni sin velo.** El `Cierre.tsx` lo dice en su
   docblock («`[data-pieza="pie"]` pinta `var(--color-fondo)`, que ese bloque ya
   redefinió») como consecuencia BUSCADA cuando la sección era opaca. Es una
   regla de estilo del pie —contenido de sección, y del chrome—, así que no se
   tocó: se anota y **la decisión es tuya**, con las tres variantes medidas en
   §6 (el instrumento le quita el relleno al pie sólo mientras mide). Lo que
   sí se corrigió es lo que la tabla DICE: la superficie del Cierre sigue
   siendo `oscuro-transparente` porque es lo decidido, y el reporte publica que
   hoy no se cumple a la vista.
2. ⚠️ **EL INSTRUMENTO NO VEÍA LA TINTA CLARA SOBRE LA SALA.** La máscara de
   glifo sale de la captura T (la escena oculta): un panel transparente sin la
   escena deja ver el papel, y la tinta clara (#F7F7F5) sobre papel (#F7F7F5)
   no tiene glifo. La primera corrida leyó 1 bloque de 9 en la noche de
   Trabajos —el único con relleno propio, el chip [MÉTRICA]— y 2 de 25 en el
   Cierre sin pie. B6-A no lo sufría porque el velo pintaba el panel. Arreglado
   en `c-las-ocho.ts`: para T, el panel recibe el relleno plano que su
   superficie pintaría si fuera opaca (`var(--color-fondo)`), sólo mientras se
   captura la máscara. Las corridas anteriores a ese arreglo NO se citan.
3. ⚠️ **LA PRIMERA CORRIDA CON EL BRILLO A 1,0 ES EL RECIBO DE LA CALIBRACIÓN,
   no una medición del producto:** pico mediano de las partículas 220 sobre una
   sala de 50, ⌀ 3,4 px (`c-las-ocho-despues-brillo1.json`). La referencia tiene
   puntos de 47 sobre negro. Con 0,25 lineal el pico bajó a 117–119 y el
   diámetro mediano a 3,0 px (§5). La segunda regla del brillo salió de esa
   captura: de día la perspectiva atmosférica lleva las lejanas hacia el papel
   (#DCDCD9) y de noche eso las dejaba como manchas claras; ahora todas van al
   mismo gris.
4. ⚠️ **D-B8.3 TIENE DOS MITADES, y sólo una es de mi curva.** Por el modelo,
   el diferencial asoma en p=0,7411 con el amanecer a nivel 0,504 y la tinta
   oscura no llega a AA hasta p=0,816, mientras el panel todavía entra: ésa es
   mi curva. Por la captura, en y=14400 —que es la pantalla 16, o sea **el
   ancla, p=0,8525, a nivel 0,643 con cualquiera de las dos curvas**— fallan 5
   de 7 bloques con el peor en 1,11:1: ése es el logo detrás del titular, que
   ya fallaba en B6-A (6 de 7). El barrido mide el panel desde que llena el
   cuadro y por eso no ve la entrada; el modelo barre la ventana entera y por
   eso la ve. La salida barata —terminar el amanecer en 0,643 antes de la
   reanudación— está MEDIDA y NO aplicada en §6.4, con lo que le hace al
   diferencial y al resto de la curva: la decisión es tuya, con el número.
5. ⚠️ **LA LÍNEA 19, FUERA DE LAS 18 AUTORIZADAS** en `/probe-escena/__tests__`:
   `shading.ts` consume `rimIntensityAt(level)` en vez de la fórmula de S6
   inline. Sin ella el calibrador y el rig escribirían dos contraluces
   distintos por debajo de 0,34. Se declara acá y en §9.
6. ⚠️ **15 de las 18 reescrituras, no 18 — y las 3 que pasaron son el dato que
   dice que el calibrador sigue sirviendo.** Con el arco real (no el
   experimento de la PARADA 1) tres pasaron sin tocarse: la del shadow map de
   `s7-sol` §3 (porque `SHADOW_FAR` subió a 200), y una en cada archivo de s12
   que el experimento había puesto en rojo y el arco definitivo no. Un
   calibrador que hubiera dejado de medir la escena habría puesto en rojo las
   18 y alguna más; puso en rojo exactamente las que describían la tarde
   monótona, y ninguna de las que describen la óptica.
7. ⚠️ **EL HARNESS MATÓ EL DEV SERVER DEL 3001 POR MEMORIA** a mitad del
   bloque («stopped because the system is running low on memory»); el proceso
   hijo de Next sobrevivió y siguió sirviendo (verificado por PID y por
   `curl`). No se reinició. Memoria libre durante el bloque: 1,7 GB de 14, con
   el dev server en 1,4 GB y un Chrome ajeno en 1,0 GB.
8. ⚠️ **`tsconfig.json` cambió solo:** Next agregó `.next-b8/types/**/*.ts` y
   `.next-b8/dev/types/**/*.ts` al `include` cuando corrió el build aislado,
   igual que hizo con `.next-b5` y `.next-b7` en los bloques anteriores (esas
   líneas ya estaban commiteadas). Se stagea como ellos.
9. ⚠️ **EL RUIDO DEL REVELADO EN LA MEDICIÓN DE CONTRASTE.** Entre dos corridas
   idénticas el peor bloque del hero dio 2,56 y 2,94, y «Tucumán, Argentina»
   3,16 y 1,97: la captura cae en distintos instantes del revelado de
   Framer (`whileInView`), con opacidades en tránsito (0,6, 0,87). El barrido
   publica «a tinta plena» al lado, que es lo que no depende del instante.
   Los bloques a opacidad 0,3 de Servicios (36 «fallan») son ese mismo ruido
   sobre una sección opaca: a plena dan 17,6:1.
10. ⚠️ **LAS CAPTURAS S DE LAS OPACAS SON RANCIAS**, como en «antes»: con la
    escena suspendida detrás de Servicios y Tu panel, la captura de la sala
    sola muestra el último cuadro dibujado (la noche, 0,027). Sólo las seis
    transparentes tienen luminancia de sala con sentido.
11. ⚠️ **NÚMEROS Y EL ATARDECER: la deuda D-B8.1 la ve el modelo, no la captura.**
    El barrido para en la última posición en que el panel llena el cuadro
    (pantalla 7, donde el atardecer recién empieza); la pantalla en que Números
    se va mientras la sala se apaga (7 → 8) no tiene posición en el barrido.
    Lo que la captura sí mide de Números —10 de 13 bajo AA con el peor en
    1,00:1— es el logo detrás del texto, que B6-A ya había medido y que la
    instrucción ya daba por roto («Números en 12 de 13»).
