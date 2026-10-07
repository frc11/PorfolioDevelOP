# SPRINT PULIDO 1 — 8 puntos abiertos del feedback al SPRINT NOCTURNO FINAL

Rama `rediseno/home`, worktree `C:\rediseno-home\logic-core-v3`, ruta `/v3`. Fuente de verdad del sprint: este archivo
(el plan arriba, el log abajo). Un commit por punto, con push después de cada uno. Invariante nuevo:
`npm run test:s52-pulido-1` (una sección por punto, con su control positivo). Entregables:
`docs/rediseno/entregas/pulido-1/` (`mirar.txt`, `LEEME.txt` y las capturas).

Aprobados del nocturno (no se tocan; s47–s51 y `s52-nocturno-final` siguen verdes): 3, 4, 7, 8, 9, 10, 11, 13, 14, 15,
16, 19, 20 y 21.

## 0 · Dónde vive cada punto (leído antes de proponer)

| Punto | Qué | Dónde vive hoy |
|---|---|---|
| P12 | Texto sobre el logo de noche, teléfono y tablet | El halo de C1 en `_estilos/banda.css` (§4, abajo de 1024), sobre el cartel y la capa de demos de Trabajos (`trabajos/`); la mezcla de s7 en `_lib/superficies.ts` (`MEZCLA_SOBRE_LA_ESCENA`) no atraviesa el pin (`sticky`) |
| P2 | El rebobinado del encastre, más rápido | `escena/final/recorridoDelFinal.ts`: `pasoDelReloj` (fase `rebobina` a `−1/duracionS`, 6,4 s de punta a punta) y `RELOJ_DEL_FINAL` |
| P6 | El logo del intro baja «como un ángel» | `escena/intro/caida.ts` (`CAIDA_DEL_LOGO`: espera el 40 % arriba y cae con gravedad) y `intro/CaidaDelLogo.tsx` (su reloj arranca con `cargaLista()`); el titular: `LLEGADA_DEL_TITULAR_S` en `_secciones/hero/Hero.tsx` y su llegada por tiempo en `escena/titulos3d/TitulosDeVolumen.tsx` (`alCuadroDelQueQueda`: `persigue` lineal, arranca con la carga Y con el título armado) y `titulos3d/llegada.ts` (`llegadaDeLaLetra`: la primera letra arranca en 0, la última termina en 1). `HeroArtifact.tsx` no interviene (el logo de /v3 es `ProbeLogo`) |
| P18 | El formulario del pie, liquid glass | `_secciones/cierre/FormularioDelPie.tsx` y la tarjeta sólida de C4 en `cierre/ColumnasDelPie.tsx` (la caja de la columna del contacto); el material del menú en `_estilos/vidrio.css` (`[data-pieza="vidrio"]`) |
| P22 | El encastre en el teléfono y la tablet | `escena/ProbeStage.tsx` monta `FinalDelPie` sólo con calidad `plena` (desde 1025); el reloj, la cámara y el piso en `escena/final/` (`cuadroDelFinal.ts`, `recorridoDelFinal.ts`, `enElPiso.ts`, `hueco.ts`); los gestos (rueda, dedo y teclas) en `_lib/gestosDelScroll.ts`; el pie angosto en `_secciones/cierre/` (`Cierre.tsx`, `ColumnasDelPie.tsx`) |
| P1 | El brillo del piso | La «lava» de B2 en `escena/final/enElPiso.ts` (`LAVA_EN_EL_PISO`, `lavaEn`, `conLaLava`: focos gaussianos naranjas por celda de 7 u) y el atardecer del final en `recorridoDelFinal.ts` (`ATARDECER_DEL_FINAL`: −45 % y 3600 K) que aplica `OrbitRig.tsx` |
| P5 | El viaje del menú desde la cinemática avanzada | `_componentes/useDeslizamientoDelCta.ts` (`arrancar` espera `FINAL_EN_REPOSO` hasta `ESPERA_MAXIMA_DEL_FINAL_MS`), `escena/final/enReposo.ts` y la salida con tope del reloj (`RELOJ_DEL_FINAL.salida`, `velocidadDeSalida`) |
| P17 | El CTA final: cámara y variantes | La pose C en `escena/finalDelRecorrido.ts` (`POSES_DEL_FINAL.cta`: altura 0, distancia 32, `frameY` −1) y sus keyframes en `choreography.ts`; el bloque del CTA en `_secciones/por-que-develop/PorQueDevelop.tsx` (`data-pieza="cta-del-final"`) y su geometría en `geometria.ts` |

## 1 · El plan (en el orden pedido)

1. **P12** — reproducir a 390, 375 y 768 de noche en Portfolio (y en toda sección donde el texto cruce el logo), con
   captura del estado roto; encontrar la causa raíz y escribirla abajo; arreglarla para AA en todo el recorrido nocturno
   angosto sin tocar escritorio; invariante que falla con el código anterior.
2. **P2** — el rebobinado dura proporcional a lo avanzado, con tope ~1,6 s y una curva in-out suave (el reinicio a los
   2,5 s no se toca).
3. **P6** — el logo baja desde que arranca la primera letra hasta que termina la última, lineal; los tiempos salen de las
   constantes del titular (importadas: la constante sale de `Hero.tsx` a un módulo que leen los dos); `?angel=asentado`
   prueba un asentado en los últimos ~120 ms.
4. **P18** — el formulario angosto en vidrio líquido: el material del menú extraído a un selector común en
   `vidrio.css` (sin duplicar), AA de día y de noche, más chico, sin tapar el logo; escritorio igual.
5. **P22** — la cinemática del pie también abajo de 1024 (encuadre propio, rebobinar con el dedo, convivencia con el
   formulario, costo de teléfono, movimiento reducido = el estado final quieto) y la regla de alturas.
6. **P1** — el brillo blanco por sectores orgánicos de bloques, una o dos zonas a la vez, en el sombreador del piso, con
   la sala apenas más oscura y neutra; `?brillo=suave|medio|fuerte`.
7. **P5** — el viaje desde la cinemática avanzada dura lo mismo que los otros: la escena se deshace en paralelo al viaje
   (la cámara se mezcla en el primer ~30 %), sin esperas.
8. **P17** — A: la cámara del CTA sin el techo del domo en ningún ancho (invariante); B: variantes `?cta=a|b|c|d` (y una
   `e` si vale la pena), el default sigue siendo el de hoy; C: estados de toque en el teléfono.

## 2 · Gate por punto

Lint limpio en lo tocado; `tsc --noEmit` sin errores nuevos; s47–s52 verdes; `verificar` con los mismos 8 grupos rojos
heredados; captura del reposo a 1440 y 390 (y 768 en P12, P18, P22 y P17). La coreografía la aprueba el humano.

## 3 · Log

**Base del sprint** (antes de tocar nada): `tsc --noEmit` limpio (0 errores). `verificar`: los 8 grupos rojos heredados
(s1, s2, s3, s4, s5, s7, s8, s17), con estos invariantes adentro: s1-bundle, s2-bundle, s2-css, s3-peso, s4-cobertura,
s4-heredado, s5-compacto, s5-peso, s7-compuerta, s8-chrome, s8-montaje, s8-peso, s8-tres y s17-revelado (los que piden
un build de producción, la cobertura de s23–s36 y s39, el `encuadre` de las fotos, s32/s34 sobre las 300 líneas y el
`!viajando` de VIAJES). Son los mismos que dejó el cierre del nocturno.

**`visual-qa` en este entorno:** se despachó para P12 y devolvió que no tiene herramientas de captura (sólo lee
archivos). Las capturas del sprint son del banco del repo (un Chrome propio por CDP, `scripts-3d-sonido/banco.ts`), con
la placa leída en la página (NVIDIA). Las sondas y las hojas, en `~/.cache/b4-medicion/pulido-1/`.

### P12 · El texto sobre el logo de noche (teléfono y tablet)

**Reproducción** (`pulido-1/p12/hoja-antes-{390,375,768}.png`): de noche, en Portfolio, «Portfolio» y su bajada caen
sobre el logo durante ~1,3 pantallas, y «Demos» con su párrafo durante ~2 más. Las letras se pierden donde cruzan el filo
blanco y la tapa gris del logo de noche. Pasa igual a 390, 375 y 768.

**Causa raíz:** el halo de C1 está y aplica (medido en el DOM: el `text-shadow` llega al cartel y a las demos), pero es
UNA sombra fina y difusa (0,06 em sólida y dos desenfoques translúcidos): alrededor de un trazo de 15 px deja un borde de
~1 px y sus capas de afuera no oscurecen el filo ni la tapa del logo. No es el corte de ancho (aplica abajo de 1024), no
es el apilamiento (un halo no necesita mezclar) y la mezcla de s7 sigue sin ser opción (el pin es un `sticky`, C1).
Medido con el método de D2 (máscara de las letras con la escena oculta, fondo con el texto apagado, contraste de cada
píxel de letra contra lo que se ve a 3 px), sólo en los píxeles de letra que caen sobre el logo:

| | bajada del cartel (mediana · % bajo AA) | párrafo de Demos | sobre la noche, sin logo (referencia) |
|---|---|---|---|
| antes, 390 | 4,3 · 51–52 % | 3,5–4,6 · 47–63 % | 12,7 |
| antes, 375 (emulado) | 4,6 · 49 % | 2,7–4,9 · 44–88 % | 11,5 |
| antes, 768 (emulado) | 4,5 · 50 % | 2,7–5,6 · 37–75 % | 12,2 |
| después, 390 | 12,1 · 15 % | 10,0–10,4 · 13–16 % | 12,7 |
| después, 375 | 12,2 · 14 % | 10,2–11,2 · 8–14 % | 12,5 |
| después, 768 | 12,0 · 13 % | 11,9–12,4 · 15–18 % | 12,9 |

Cómo leer el «% bajo AA»: sobre la noche sola (blanco sobre casi negro) el método ya da 13–14 % para la bajada de 15 px
(son los píxeles del borde suavizado de cada letra). Después del arreglo, sobre el logo da lo mismo que sobre la noche: el
logo dejó de ser el problema. Los títulos («Portfolio», «Demos») son texto grande (AA = 3:1): mediana 9–15.

**Arreglo** (`_estilos/banda.css` §4, sólo abajo de 1024): el halo denso (la misma sombra corta apilada, la receta de D2)
y un velo del color de la noche detrás de la bajada del cartel y del párrafo de las demos (fondo + sombra de caja ancha y
suave, `--velo-sobre-la-escena` al 76 %, `--sombra-del-velo`): oscurece el logo sólo detrás del texto; sobre la noche
no se ve. Probé tres variantes en el banco antes de escribirla (sólo el halo denso: la bajada a 7,7 con 28 % bajo AA; con
velo al 62 %: 11,3; al 76 %: 12,1, igual que la noche). Escritorio no cambia (todo vive en la banda de abajo de 1024).

**Lo que queda bajo AA y por qué:** los cuadros en tránsito (el cartel yéndose cuando arranca el túnel, la ventana de las
demos abriéndose desde la tarjeta) bajan igual sobre el logo que sobre la noche: es el fundido/escala del texto, no el
logo.

Invariante: `s52-pulido-1` P12 (falla con el código anterior: se corrió antes del arreglo, 2 fallas; control positivo
con el CSS de C1). Tokens nuevos registrados en `s3-registro-de-tokens.ts`. Capturas antes/después:
`entregas/pulido-1/p12-antes-despues-{390,375,768}.png`.

### Banderas del sprint (commit aparte, antes de P2)

Todas en `escena/entorno.ts` (`Pruebas`), apagadas en el producto (`PRUEBAS_APAGADAS`: todas en `no`). Con banco van en el
pedido (`producto,cta=a`); sin banco, en la URL con `?pruebas=` o sueltas (`/v3?cta=a`), que arma la función pura
`pedidoDeLaUrl` (antes la lectura vivía adentro de `entornoDeLaEscena`).

| Bandera | Punto | Qué hace | Producto |
|---|---|---|---|
| `rebobinado=minimo` | P2 | la otra lectura del pedido: desde cualquier punto, al menos 1 s | proporcional (sin mínimo) |
| `angel=asentado` | P6 | el logo del intro se asienta en sus últimos ~120 ms | lineal puro |
| `brillo=suave` / `brillo=fuerte` | P1 | la intensidad del brillo del piso (y de cuánto se oscurece la sala) | `medio` (`brillo=medio` es el producto) |
| `cta=a` … `cta=d` | P17 | las variantes del CTA del final para elegir | el CTA de hoy |
| `encastre=desvanece` | P22 | abajo de 1024 el pie se desvanece mientras corre el encastre, sin escenario | el formulario arriba y el encastre en su propio escenario al final |
| `vuelta=corta` | P5 (sumada en su commit) | en un viaje del menú el final vuelve en el 35 % del viaje (≈ 1 s en el más corto) | a la velocidad del rebobinado de P2 (1,6 s), con techo en el 56 % del viaje |

Decisión de P22 tomada acá para que la bandera quede estable: por defecto, el formulario arriba y la cinemática en su
propio escenario después del pie, porque la cinemática arranca sola al llegar al fondo y, si el pie se desvaneciera, el
formulario desaparecería justo cuando alguien llega a usarlo.

Ajustado: `s35-escena9` (T2) fijaba el texto literal de la lectura de la URL; ahora fija las mismas tres cosas (lee
`?pruebas=`, el pedido va sobre el producto, del pedido se toman sólo las pruebas y el material de los títulos) contra
`pedidoDeLaUrl`, y además por comportamiento. `s52-pulido-1` suma la sección de las banderas (con dos controles: un
traductor que acepta cualquier valor y una URL que sólo lee `?pruebas=`). Gate: lint y `tsc` limpios; las 17 suites que
importan `entorno.ts` en verde (s29–s36, s38, s40, s42, s44, s46–s49, s52).

### P2 · El rebobinado del encastre, más rápido

**Antes** (medido en la página a 1440, `pulido-1/p2/antes-1440.json`): UN gesto rebobinaba a la velocidad de la
cinemática: desde 0,2 tardaba 1,6 s; desde la mitad, 3,5 s; desde el final entero y desde el quieto, más de 5 s (6,4 s
la cinemática entera).

**Qué cambió** (`escena/final/recorridoDelFinal.ts`, `cuadroDelFinal.ts`): el mecanismo de A1 es el mismo (un gesto,
solo, sin mover la página, hasta el logo parado; el reinicio a los 2,5 s no se tocó). Al rebobinar, `fin` deja de
perseguir una velocidad y pasa a ser función del tiempo del rebobinado: dura lo avanzado por 1,6 s (`REBOBINADO.topeS`;
desde el final entero 1,6 s, desde la mitad 0,8 s) con la curva `simetrica` del vocabulario (`_lib/motion/curvas.ts`,
`power1.inOut`: arranca y llega quieta). El giro y el alejamiento del quieto vuelven con el mismo reloj y la misma curva
(`quietoRebobinado`): antes volvían por su cuenta con tope (90°/s) y media vuelta tardaba 2,2 s. Un gesto hacia abajo a
mitad lo retoma desde la velocidad que traía (sin salto) y el quieto sigue desde donde quedó.

**Después** (medido en la página a 1440, `pulido-1/p2/despues-1440.json`): desde 0,2 → 0,32 s; desde 0,5 → 0,80 s; desde
el final entero → 1,55–1,59 s; desde el quieto girado 31° → 1,59 s. La página no se movió en ninguno.

**La lectura del pedido** («entre 1 y 2 s como máximo… proporcional a cuánto avanzó, con tope de ~1,6 s»): proporcional
con tope, así que desde muy cerca del principio dura menos de 1 s (hay poco que deshacer). La otra lectura (al menos 1 s
desde cualquier punto) está atrás de `?rebobinado=minimo`: medida, 0,99 / 0,99 / 1,57 / 1,59 s.

**Las aserciones viejas que cambiaron** (por cada una: qué afirmaba, qué afirma, por qué no es debilitarla):

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s52-nocturno-final` A1 · `unGestoBien` (duración) | rebobina en 6,4 s ± 0,3 (la velocidad de la cinemática) | rebobina entre 1 y 2 s y en 1,6 s ± 0,1 | La duración es la de P2 (lo pedido), con tolerancia más chica (0,1 contra 0,3). Lo demás que fija (UN gesto basta, entera y sola hasta `parada`, el reinicio a los 2,5 s ± 0,05) no cambió |
| `s52-nocturno-final` A1 · `unGestoBien` (velocidad) | ningún cuadro más rápido que la velocidad de la cinemática (1/6,4 por s, + 0,1 %) | ningún cuadro más rápido que el pico de la curva de P2 (2/1,6 por s, + 0,1 %) | Mismo tope relativo (0,1 %) sobre la velocidad máxima que ahora corresponde. En la primera versión del cambio había quedado + 5 %: se volvió a + 0,1 % (medido: 1,237/s contra 1,25 de tope) |
| `s52-nocturno-final` A1 · control «acelerado» | rebobinar al doble (3,2 s) tenía que fallar | rebobinar al doble (0,8 s) tiene que fallar | El mismo control, con su número nuevo: sigue cazando un rebobinado acelerado (cae fuera de 1–2 s) |
| `s52-nocturno-final` A1 · `enFase` (ayuda de la retención) | `{ fin, velocidad: 0, fase, paradaS: 0 }` | `{ ...relojQuieto(), fin, fase }` | Equivalente: el reloj tiene un campo más (`rebobinado`, en cero) y la ayuda arma el mismo estado; las afirmaciones de qué se retiene no cambiaron |
| `s51-retoque-encastre` 1D · `cinematicaBien` | rebobina sola en 6,4 s ± 0,3 | rebobina sola en 1,6 s ± 0,1 | Lo mismo que A1: la duración pedida, con tolerancia más chica; el resto de 1D (espera al pie entero, corre a una velocidad, la rueda abajo no la adelanta, fuera del fondo y en un viaje vuelve) igual |
| `s51-retoque-encastre` 1D · `enFase` | literal sin `rebobinado` | `{ ...relojQuieto(), fin, fase }` | Equivalente (ver arriba) |

`s52-pulido-1` P2 fija el detalle: proporcional desde 0,1, 0,25, 0,5, 0,75 y 1 (± dos cuadros), nunca más de 2 s, in-out
(el primer y el último paso por debajo del 25 % del pico desde la mitad para arriba), siempre hacia atrás y termina
parada; el quieto con lo que queda del rebobinado y el cuadro del final usándolo; la alternativa `rebobinado=minimo`.
Controles: el rebobinado de antes (6,4 s), uno del mismo largo pero lineal, un quieto que vuelve por su cuenta y una
alternativa sin el mínimo.

Reposo (en lugar de `visual-qa`): `pulido-1/reposo/hoja-p2.png`, el hero y el pie a 1440 y 390, sin errores en la consola.
La coreografía del rebobinado la mira el humano (`entregas/pulido-1/mirar.txt`).

### P6 · El logo del intro baja «como un ángel»

**Antes:** el logo esperaba arriba, fuera del cuadro, el 40 % de su reloj y después caía con gravedad (cada vez más
rápido) para llegar cuando terminaba de armarse el titular: aparecía tarde y bajaba de golpe. El reloj era el suyo
(desde la carga abierta) y la duración, una copia a mano: `LLEGADA_DEL_TITULAR_S` vivía en `Hero.tsx` y s52 comparaba
los dos números leyendo el fuente.

**Dónde vive el timing:** `HeroArtifact.tsx` no interviene (el logo de /v3 es `ProbeLogo`, en la escena); la bajada está
en `escena/intro/` y el titular en volumen en `escena/titulos3d/` (su llegada por tiempo: `persigue`, lineal, con
`minimoS` = la duración; la primera letra arranca con la llegada y la última termina con ella, `llegadaDeLaLetra`).

**Qué cambió:**
- La duración y los ids del titular viven en un módulo compartido, `_lib/titulos3d/titular.ts`; el hero y la escena la
  importan (ya no hay una copia). El velo de la carga (`VeloDeCarga.tsx`) conserva su propia lista de ids: tocarlo arrastraba
  dos fallas de lint anteriores al sprint en un archivo que P6 no necesita.
- La escena publica lo que MUESTRA del titular cada cuadro (`TITULAR_EN_VIVO`: lo llegado, el menor de los dos registros;
  si está armado; si su llegada sigue su camino). El logo va antes en el cuadro: toma lo del cuadro anterior y le suma lo
  que el titular suma en éste (el mismo `dt` y el mismo tope), así arrancan y llegan en el mismo cuadro y el logo baja a
  velocidad constante (`pasoDeLaBajada`, `caida.ts`).
- Sin titular en volumen (abajo de 1024, `titulos=no`, o si no se arma en 2,5 s con la carga abierta), el logo baja con
  su propio reloj, lineal y de la misma duración, desde la carga abierta. Si el titular se pausa a mitad (quien carga bajó
  antes de que termine: el titular queda fuera de la vista y no avanza), el logo sigue a la misma velocidad desde donde
  iba: si lo siguiera, quedaría colgado en el aire, visible desde la sección siguiente.
- Arranca con el borde de abajo del logo apenas arriba del borde de arriba del cuadro (`altoDesdeElBorde`, medido con la
  cámara de ese cuadro): se ve desde el primer instante. Antes esperaba a 14 u, bien afuera.
- `?angel=asentado`: hasta los últimos 0,12 s a velocidad constante (un poco mayor) y ahí frena parejo hasta posarse,
  llegando en el mismo instante (altura y velocidad continuas). El producto es lineal puro.

**Medido en la página** (un registrador por cuadro puesto antes de cargar, `pulido-1/p6/`): a 1440 el logo y la primera
letra arrancan en el mismo cuadro (el 9 del registro) y el logo y la última letra llegan en el mismo cuadro (el 141): 2,39 s,
velocidad mediana 0,4167 por segundo (1/2,4), p10–p90 0,395–0,431 (el registrador mide con el reloj de la página y la
escena con el `delta` del cuadro). La diferencia máxima entre lo bajado y lo llegado del titular, en todos los cuadros: 0.
A 390 (sin titular en volumen) baja con su reloj a la misma velocidad. Con `angel=asentado`, el mismo arranque y la misma
llegada (cuadros 46 y 178). Al primer intento el logo iba con su reloj aunque coincidía: en desarrollo la escena monta
después del plazo de la carga (4 s) y yo usaba ese plazo como «el titular no viene»; ahora espera al titular anotado hasta
2,5 s con la carga abierta.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s52-nocturno-final` B1 · `caidaBien` | espera arriba hasta el 40 %, después acelera (cada paso mayor o igual que el anterior), llega en 1 | baja con todos los pasos iguales (lineal) desde `alto` hasta 0 en 1 | La curva es la pedida en P6 y la condición es más estricta (pasos iguales a 1e-9, no sólo crecientes). Sigue fijando que sale de arriba, que no llega antes (`h(0,999) > 0`) y que llega en 1 |
| `s52-nocturno-final` B1 · el mismo reloj | leía `const LLEGADA_DEL_TITULAR_S = …` en `Hero.tsx` y lo comparaba con `CAIDA_DEL_LOGO.duracionS` | lee la constante en `_lib/titulos3d/titular.ts`, exige que el hero la importe de ahí (sin una copia local) y que la use en sus dos registros | Más fuerte: antes dos números iguales escritos en dos lugares pasaban; ahora tiene que ser la misma constante |
| `s52-nocturno-final` B1 · `montada` | buscaba la línea del reloj propio (`if (cargaLista()) s.u = …`) | busca la lectura de la carga y el paso de la bajada con el mismo `dt` acotado | Las mismas cuatro condiciones (la carga abierta, sólo si cargó arriba, la súper onda al llegar, sin montar con movimiento reducido) contra el código nuevo |
| `s52-nocturno-final` B1 · controles | la caída que llega antes | la caída que llega antes y la de antes (40 % arriba y gravedad) | Un control más |

`s52-pulido-1` P6 fija la sincronía cuadro a cuadro (60, 75, 120 y 144 Hz y un tirón; la carga abierta a 0, 0,3 y 1,1 s),
el reloj propio sin titular y la espera máxima, la pausa del titular, la constante única, lo que publica la escena, el
arranque apenas arriba del cuadro (con una cámara de verdad) y el asentado. Controles: un logo con su reloj de otra
duración, uno que sigue al titular con un cuadro de atraso, uno que no espera al titular anotado, uno que se queda con el
titular pausado, una copia a mano de la duración y un asentado que frena de golpe.

Reposo: `pulido-1/reposo/hoja-p6.png` (1440 y 390). En esta corrida el Chrome del banco usó la AMD integrada (la placa no
es fija: CLAUDE.md); las mediciones de tiempo no dependen de ella.

### P18 · El formulario del pie en el teléfono y la tablet: vidrio líquido

**Antes:** abajo de 1024 el contacto era la tarjeta sólida de C4 (el papel, un borde y la sombra flotante): tapaba la
parte de abajo del logo y pesaba. Medido además: su texto de ejemplo («nombre@dominio») daba 2,9:1 (el preflight de
Tailwind 4 lo pinta con la tinta a la mitad y la opacidad del campo, 60 %, va encima): no llegaba a AA.

**Qué cambió:**
- `vidrio.css`: el material del menú del teléfono (tinte, desenfoque y saturación, especular, filo, la variante oscura y el
  respaldo sin `backdrop-filter`) se define UNA vez y lo comparten dos selectores: `[data-pieza="vidrio"]` (el menú) y
  `[data-material="vidrio"]` (el formulario). Lo que es sólo del menú (el lugar fijo, la lente, el Genie, la franja) quedó
  sólo en el suyo. Lo propio del formulario, en su regla: el radio de una tarjeta, un tinte un poco más denso (66 % contra
  56 %: sus rótulos son chicos y, con el logo negro detrás, al 56 % quedaban en 4,8:1), un relleno del papel en los campos
  y el texto de ejemplo con su color (`--ejemplo-del-campo`, la tinta al 72 %). Tres tokens nuevos registrados.
- `cierre/ColumnasDelPie.tsx`: la columna del contacto envuelve su rótulo y el formulario en `CajaDeVidrio`, que lleva el
  material sólo con el pie plano (abajo de 1024; `useModoDelPie`, porque una sección no consulta la compuerta de ancho:
  s7-contrato) y el tono de la zona donde está (`useTonoDebajo`, el del botón del menú, leído sólo con la caja a la vista):
  vidrio claro sobre la sala de día, oscuro sobre la noche. Es el tono de la zona y no el contrario (el menú va al revés
  para resaltar): el formulario tiene que ser discreto. En escritorio no hay caja (la placa 3D): medido a 1440, ningún
  `data-material` en el pie.

**Medido** (`pulido-1/p18/`, con un nombre escrito, el mail vacío —se ve el ejemplo—, Enviar vacío —el error del mail y el
foco en él—; el contraste del COLOR, como WCAG: el núcleo de la letra contra la mediana de lo que tiene detrás, con el
vidrio y la escena):

| | rótulos | error | texto escrito | ejemplo | Enviar |
|---|---|---|---|---|---|
| antes (la tarjeta sólida, emulada), 390 | 16,2–17,5 | 11,7 | 17,6 | **2,9** | 17,6 |
| después, de día, 390 | 10,6–17,9 | 10,8 | 17,1 | 7,3 | 17,6 |
| después, de día, 375 | 11,7–17,1 | 10,1 | 17,3 | 7,3 | 17,6 |
| después, de día, 768 | 15,4–16,7 | 11,6 | 17,3 | 7,3 | 17,6 |
| vidrio oscuro sobre la sala de día (el peor caso), 390 | 5,9–10,6 | 6,6 | 14,6 | 8,2 | 18,0 |
| vidrio oscuro sobre la sala de día (el peor caso), 768 | 4,2–6,7 | 5,8 | 14,6 | 8,2 | 18,0 |

El foco: el borde del campo, oscuro y de dos filetes (`foco.css`), sobre el relleno claro (visible en
`p18/despues-*/uso-C.png`).

**De noche:** el pie fuerza el día (el amanecer salta a 0,9 si se llega antes) y en el banco no lo pude poner de noche
(congelar el amanecer no alcanza). Medí el peor caso posible: el vidrio oscuro forzado sobre la sala de día (la caja nunca
elige esa combinación: el tono es el de la zona). Ahí los campos, los ejemplos, el foco y los errores siguen en AA; el
único bajo 4,5 es el rótulo «CONTACTO» a 768 (4,2:1), en una combinación que el producto no muestra.

**Ocupa menos:** sin el borde, sin la sombra flotante y sin el papel opaco; el logo se ve detrás (desenfocado). El tamaño
de la caja no cambió (los campos siguen a 16 px por Safari).

`s52-nocturno-final` C4 fijaba «una tarjeta sólida» por sus clases (el papel, el borde y la sombra): P18 la cambia por
pedido. Ahora fija lo mismo contra la caja de vidrio (UNA caja propia con su rótulo y el formulario, nada que mezcle
adentro, mezclan sólo las otras tres), y suma que el rótulo esté adentro. `s52-pulido-1` P18: el material una sola vez
(control: un material copiado), lo propio del formulario (control: el ejemplo de base), la caja sólo con el pie plano y con
el tono de la zona (control: el vidrio también en escritorio). Capturas: `entregas/pulido-1/p18-antes-despues-*.png`.

### P22 · El encastre también en el teléfono y la tablet

**Antes:** el final del pie se montaba sólo con calidad plena (desde 1024) y con movimiento; abajo de 1024 la página
terminaba en el pie plano y no había cinemática.

**Layout elegido** (decidido con las banderas, arriba): el formulario arriba, usable, y la cinemática en su propio
ESCENARIO, una pantalla sin contenido después del pie (`_secciones/Home.tsx`, `pie.css`). Va FUERA de la tabla de
secciones (no lleva `data-panel`): la escena mide su recorrido sobre la extensión de las secciones
(`extensionDeLasSecciones.ts`), así que el escenario no la corre y el progreso se acota en 1 mientras se lo recorre (lo
mismo que hacía la «cola» de CIERRE 3, que se borró en RETOQUE DEL ENCASTRE 1D). La otra lectura, atrás de
`?encastre=desvanece`: sin escenario; el pie se desvanece en el primer 15 % de la cinemática y vuelve al rebobinar.

**REGLA DE ALTURAS** (`pulido-1/p22/alturas/`, a 390): la extensión de las secciones es la misma con y sin el escenario
(0–22267 px); el documento crece 844 px (el escenario). En anclas de las ocho secciones la escena da el mismo estado (el
amanecer pedido, la noche); lo único distinto es el final (antes corría al llegar al pie; ahora, en el escenario) y 0,006
del avance perseguido del amanecer (con el mismo pedido: es el tiempo de la persecución).

**Qué cambió en la escena:**
- `ProbeStage.tsx`: el final se monta también con calidad compacta; ahí, con movimiento reducido, en modo quieto. En
  escritorio con movimiento reducido sigue sin montarse (como antes: P22 es del teléfono y la tablet).
- `FinalDelPie.tsx`: la máscara del hueco a la mitad de resolución en el teléfono; los gestos se retienen sólo con el
  escenario a la vista (un escucha de `touchmove` no pasivo puesto todo el tiempo le costaría el scroll a iOS); el modo
  quieto y la otra lectura.
- `cuadroDelFinal.ts`: el modo quieto (`estadoQuieto`: el final entero de una vez al llegar al fondo y en cero fuera; sin
  el golpe, sin el golpecito, sin el giro ni el alejamiento del quieto y sin retener gestos) y la distancia del encuadre
  angosto.
- `recorridoDelFinal.ts`: EL ENCUADRE ANGOSTO (`distanciaDelFinalAngosto`): desde arriba, a la distancia en que el logo (y
  su hueco, que es su misma huella) ocupa la mitad de la dimensión del cuadro que lo limita. Con la distancia de escritorio
  (que deja lugar para el pie 3D alrededor) en un teléfono apaisado el logo quedaba en el 13 % del ancho.
- `LuzDelLogo.tsx`: el mapa de la sombra del logo a la mitad de resolución en el teléfono (128 en vez de 256).
- El rebobinado con el dedo es el de A1 + P2: el gesto que empieza hacia arriba (el dedo que baja) se retiene
  (`gestosDelScroll.ts`, `touchmove` no pasivo) y rebobina sin mover la página; abajo de 1024 no hay Lenis.

**Medido** (`pulido-1/p22/`):
- La cinemática corre en el escenario a 390 × 844, 375 × 667, 768 × 1024, 844 × 390 y 667 × 375 (capturas a fin 0,02, 0,35,
  0,7 y 1). Al final el logo y el hueco quedan enteros y centrados: ocupan el 49–50 % del ancho en vertical y el 49–50 %
  del alto en apaisado (antes de recalcular: 12–14 % del ancho en apaisado). `hoja-encuadre.png`.
- El dedo (eventos táctiles por CDP: el dedo baja 200 px): en los cinco tamaños rebobina hasta parada sin mover la página
  (el scroll queda fijo en el fondo).
- Movimiento reducido, a 390: al fondo, `fin` = 1 de una vez y quieto; el dedo sube la página normal.
- `encastre=desvanece`, a 390: sin escenario; el pie pasa a 0,7 al empezar y a 0 enseguida; el dedo rebobina.
- El costo, a 375 (el Chrome del banco tomó la AMD integrada): GPU por cuadro 3,81 ms con el pie en reposo, 3,40 a mitad de
  la cinemática y 3,87 con el final entero: la cinemática no suma (dentro del ruido). Lo que más cuesta con el final entero:
  el piso vivo, 0,97 ms; el polvo, 0,38. Ese piso de ~3,8 ms en el teléfono es de antes de P22 (el pie en reposo ya lo
  marca) y pasa los 3 ms del presupuesto de §4: anotado abajo, no lo toqué.

Las aserciones viejas que cambiaron por P22 (todas fijaban «el final sólo desde 1024»):

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s49-cierre-final` · el cableado | el final montado con `calidad === 'plena' && !reducedMotion` | montado con movimiento, o abajo de 1024 en modo quieto | La posición en el cuadro (después del rig, antes del entorno) y el resto del cableado siguen igual; el control ahora caza el final montado con movimiento reducido EN ESCRITORIO |
| `s50-encastre` · el golpe | `if (s.antes < aterriza …) s.tocoEn = t` | lo mismo con la guarda del modo quieto, y además la línea del golpe | Más estricta: fija también que el golpe no sale en el modo quieto |
| `s50-encastre` · las piezas de frente | `camaraDelFinal(CAMARA_SIN_EL_MOUSE, …, null)` | la viva y la sin el mouse con la MISMA distancia | Más estricta: fija las dos cámaras |
| `s51-retoque-encastre` · el cableado | `useEffect(() => retenerLosGestos(…), [])` | en escritorio al montarse (`if (!angosto) return retener()`), abajo de 1024 con el escenario a la vista | En escritorio, lo mismo; el resto del cableado igual |

`s52-pulido-1` P22: el escenario (fuera de las secciones, sólo abajo de 1024, sin él con la otra lectura), el montaje, el
encuadre en los cinco tamaños (también girando), el modo quieto y la otra lectura. Controles: un escenario que es una
sección, uno también en escritorio, el final sólo desde 1024, la distancia de escritorio en un apaisado y un reloj quieto
que anima.

### P1 · El brillo del piso: sectores blancos que nacen y mueren

**Dónde vivía el efecto del punto 1 del nocturno** (buscado en el log y en el código, no asumido): es el «piso volcán» de
NOCTURNO FINAL B2, en `escena/final/enElPiso.ts` (`LAVA_EN_EL_PISO`, `lavaEn`, `conLaLava`): un foco por celda de 7 u en
un lugar al azar, encendido el 38 % de su período, con núcleo casi blanco y halo naranja gaussianos por las juntas: los
«círculos rojos al azar». Y el «atardecer» del final (`ATARDECER_DEL_FINAL`: la sala −45 % y a 3600 K, en `OrbitRig`).

**Qué cambió** (la lava y el atardecer se borraron, código y constantes):
- `BRILLO_EN_EL_PISO` + `zonaDelBrillo` / `conElBrillo`, en el MISMO sombreador del piso (ni un piso nuevo ni una malla por
  bloque): una o dos ZONAS, cada una con su reloj (período de 10,8 a 12,4 s, desfasadas). Cada zona nace desde su centro
  (1,5 a 3 s), vive (3 a 5 s) respirando (±8 % del radio) y desplazándose apenas (0,16 u/s), muere achicándose (1,5 a 2,5 s)
  y la siguiente aparece en otro lugar (el ángulo avanza 0,382 de vuelta por ciclo más un desvío: dos seguidas quedan al menos
  a 47°). Simulado con la misma cuenta del sombreador: nunca más de dos a la vez; la mitad del tiempo una, la otra mitad dos;
  el hueco más largo sin ninguna, 2,7 s.
- Cuantizado al bloque: la zona se mide en el CENTRO del bloque (`vPiso.xz − (vEnElBloque − 0,5) · uLado`): cada bloque se
  prende entero. Orgánica: la distancia al centro deformada por un ruido de valor (nada de círculos, de damero ni de grilla
  regular). La tapa del bloque va a blanco y el costado a 0,9 (sigue leyéndose como bloque); un halo suave en el borde.
- Dónde nacen: adentro de lo que la cámara ve del piso (`uAlcanceDelBrillo`: el medio ancho y el medio fondo del cuadro,
  girado con la cámara del quieto) y fuera del mar calmo del logo.
- Semilla fija (`semilla`, y los ángulos y tamaños salen de un hash del número de ciclo): el mismo brillo en cada carga.
- Con movimiento reducido (el final quieto del teléfono, P22): el brillo queda quieto en un instante con una zona viva.
- **El oscurecimiento**: lo primero que probé fue bajar la luz de la sala un 12 % (el rig): con el tono de ACES el piso
  seguía en 0,95–0,96 de luminancia (medido en la captura) y el blanco de las zonas no tenía contra qué leerse (1,04:1).
  Lo que se oscurece ahora es el PISO ENTERO en el color que se ve (`uOscuroDelBrillo`, parejo, neutro), 10 / 12 / 15 % según
  `?brillo=suave|medio|fuerte`, con la transición de 1,4 s desde que el logo queda al ras y sólo mientras corre el brillo
  (al rebobinar vuelve). Medido: el piso a 0,85 y las zonas a 1,0. El rig ya no oscurece (oscurecía también el logo y las
  piezas del pie).
- `?brillo=suave|fuerte` (el producto, `medio`): cuánto blanco (0,7 / 0,9 / 1), cuánto halo (0 / 0,22 / 0,38) y cuánto se
  oscurece el piso.

**Medido** (`pulido-1/p1/`): una captura cada 1,2–1,5 s durante ~20 s a 1440 y 390: ningún píxel rojo en ninguna; las zonas
nacen, crecen, se achican y aparecen en otro lugar (`hoja-movil2.png`). El costo (el piso con el brillo y sin él, alternando
en la misma carga con un gancho del banco, `__brilloDelBanco`; la AMD integrada): a 1440 con el dpr del banco (1,5), +0,74 ms
(≈0,33 con dpr 1, dentro de los 0,5 de §4) después de una salida temprana por distancia (sin ella, +0,99); a 375, +0,17 ms
(dentro de los 0,2).

**Las aserciones viejas que cambiaron** (fijaban la lava y el atardecer, que P1 reemplaza por pedido):

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s52-nocturno-final` B2 · el brillo | la lava: focos que pulsan (simulados: nunca todos a la vez), núcleo y halo gaussianos, colores de lava; espera al encastre; sin brillo bajo el mouse | espera al encastre y nace fuera del mar calmo (el brillo de P1); sin brillo bajo el mouse | Lo de la lava se fue por pedido y su detalle lo fija ahora `s52-pulido-1` P1 con cuatro afirmaciones y cinco controles; lo que seguía valiendo, igual y con los mismos dos controles |
| `s52-nocturno-final` B2 · el atardecer | el rig baja el nivel 45 % y entibia a 3600 K | el piso entero se oscurece parejo (`uOscuroDelBrillo`), sin tinte | La misma regla («la sala pareja, nunca un sector, función de `fin`»), contra el código nuevo, con su control |
| `s52-nocturno-final` A4 · la altura del sol en un viaje | iba después del nivel con la interfaz y del atardecer | va después del ÚLTIMO ajuste del nivel (el atardecer ya no toca el nivel) | Más general: ningún ajuste del nivel puede quedar después de la altura |
| `s50-encastre` · sin tinta | `return conLaLava(…)` | `return conElBrillo( color, energia )` | Lo mismo (el poder energiza el piso, sin tinta ni la banda de CIERRE) |
| `s51-retoque-encastre` 1F · espera al encastre | la lava con la energía | el brillo con la energía | Lo mismo |

`s52-pulido-1` P1: blanco sin rojo (control: la lava), cuantizado al bloque (control: medido punto a punto), orgánico
(control: una zona circular), el ciclo de vida con a lo sumo dos zonas en otro lugar (controles: tres a la vez, una que no
muere), el oscurecimiento del piso (control: el atardecer de antes) y las intensidades y el quieto.

**Gate**: lint limpio en lo tocado; `tsc --noEmit` 0 errores; s47–s52 verdes (s50 61, s51 44, s52-nocturno-final 104,
s52-pulido-1 60, todas sin fallas); `verificar`: los mismos 8 grupos rojos de la base (las mismas 14 invariantes); reposo a
1440 y 390 capturado con el banco.

### P5 · El viaje del menú con la cinemática avanzada: en paralelo

**Dónde vivía** (leído, no asumido): NOCTURNO FINAL A2. El efecto del viaje (`_componentes/useDeslizamientoDelCta.ts`) no
movía el scroll hasta que el final del pie estaba en reposo (`FINAL_EN_REPOSO`, a lo sumo `ESPERA_MAXIMA_DEL_FINAL_MS`), y la
escena lo deshacía con tope (`velocidadDeSalida`: 2,2 s desde el final entero). Desde el pie, cualquier viaje tardaba eso de
más.

**Qué cambió**:
- El viaje ya no espera: sale como cualquiera (el preludio y el recorrido de siempre, por la misma secuencia: sin
  `router.push`, TransitionContext sin tocar) y le dice a la escena cuánto dura (`ViajeEnCurso.duracionMs` = preludio +
  recorrido; `planDelViaje` devuelve el `PlanDelViaje` y el efecto le agrega la duración). `enReposo.ts` y
  `ESPERA_MAXIMA_DEL_FINAL_MS` se borraron (nadie más los leía); el reloj de seguridad vuelve a sus tres términos.
- La escena (`pasoDelReloj`, fase nueva `viaje`): en un viaje, el final vuelve a cero EN PARALELO con el recorrido, desde
  donde esté (corriendo, rebobinando o saliendo), con la curva del rebobinado de P2; mientras, la cámara pasa de la del final
  a la del recorrido (que ya sigue al scroll). El giro y el alejamiento del quieto vuelven con el mismo reloj (si el viaje
  corta un rebobinado, se toman de nuevo desde donde quedaron). Al terminar el viaje el reloj vuelve a `espera` (al fondo con
  el pie entero, corre de nuevo, como al llegar por scroll).
- El tiempo de la vuelta no se reparte por `fin` sino por lo que se VE cambiar (`VIAJE_DEL_FINAL`): `fin`, la subida de la
  cámara (×3), la bajada del logo (×3: de que empieza a caer a que queda al ras) y el piso (×1: el oscurecimiento y la
  energía del brillo). Con `fin` solo el brillo se apagaba de un cuadro al otro; con la cámara sola, el logo salía del hueco
  en cuatro cuadros (4 u por cuadro, visto en la grabación).
- **La lectura del «~30 %»** (era un ejemplo; el requisito era «sin saltos de cámara»): con la vuelta en el 35 % del viaje
  más corto (1,0 s) la cámara giraba hasta 5,2°/cuadro en la página, más rápido que el rebobinado que se pidió en P2
  (4,4°/cuadro, medido igual). El producto vuelve a la velocidad de P2 (1,6 s desde el final entero, proporcional a lo que
  haya), con techo en el 56 % del viaje: en el más corto (2,9 s) termina a los 1,6 s; en uno de 4,6 s o más, en el primer
  35 %. La lectura literal queda atrás de **`?vuelta=corta`** (el 35 % del viaje: ≈ 1 s).
- **«El estado del encastre se resetea en un momento en que no se ve»** (la otra mitad del ejemplo): no hay ese momento.
  Durante el viaje el `<main>` está transparente y la cámara del recorrido mira siempre al logo (es el centro de la órbita),
  así que un reseteo de golpe se vería como un salto del logo. Por eso el encastre se deshace a la vista, pero en paralelo y
  sin ir más rápido que el rebobinado de P2: la cámara, el logo y el piso vuelven juntos y coherentes en cada cuadro.

**Medido** (`pulido-1/p5/`, banco a 1440 y 390, la AMD integrada; del click a que el `<main>` vuelve):

| Viaje desde el pie | Antes, final entero | Después, final entero | En reposo (la vara) |
|---|---|---|---|
| 1440 → Por qué develOP | llega 4,87 s · el scroll arranca a 2,38 s | llega 2,93 s · arranca a 0,46 s · el final en cero a 1,60 s | 2,94 s · 0,45 s |
| 1440 → Servicios | llega 6,99 s · arranca a 2,36 s | llega 5,00 s · arranca a 0,43 s · en cero a 1,60 s | 5,04 s · 0,43 s |
| 390 → Por qué develOP | — | llega 2,94 s · arranca a 0,47 s · en cero a 1,60 s | 2,93 s · 0,47 s |
| 1440, `?vuelta=corta` | — | llega 2,93 s · en cero a 1,02 s | — |

La cámara durante la vuelta, lo más que gira en un cuadro (a 60 cuadros): 3,4°/cuadro a 1440 (3,1 a 390); el rebobinado de
P2 medido igual en la página, 4,4°; el propio viaje a Servicios, sin final, 3,9°; con `vuelta=corta`, 5,2°. Grabado por
screencast (no congela la página): sin cambios de luz bruscos después del fundido del velo (el mayor salto de luminancia
media entre cuadros, 4 de 255, en el fundido del texto); el brillo se apaga en varios cuadros; la cámara baja del cenit pareja.

**Las aserciones viejas que cambiaron** (P5 invierte por pedido la espera de A2; el resto son literales):

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s52-nocturno-final` A2 · la salida con tope | un viaje del menú deshacía el final con tope (cámara ≤ 1,2 s de punta a punta, `fin` ≤ 1,2 s, < 3 s) | lo mismo, saliendo del fondo (la página sube) | Es el mismo código y el mismo tope, con el mismo control; el viaje ya no pasa por ahí y lo fija `s52-pulido-1` P5 con más que eso |
| `s52-nocturno-final` A2 · la espera | el viaje no mueve el scroll hasta el final en reposo (a lo sumo 3,5 s) | el viaje NO espera (sin `FINAL_EN_REPOSO`), el reloj suma preludio + recorrido + margen y la escena recibe la duración | P5 lo pide al revés; el control nuevo detecta la espera de A2 |
| `s18-deslizamiento` §4 · el reloj de seguridad | cuatro términos (con la espera del final) | tres términos (preludio, recorrido, margen) | Es la suma que vuelve a ser el total; sigue exigiendo cada término |
| `s39-navbar` R3 · derecho al nudo | `empezarElViaje(planDelViaje(seccion.id, destinoEnPx))` | la misma llamada con `duracionMs: PRELUDIO_MS + duracionMs` | Más estricta: además fija que la duración es la de todos |
| `s27-viajes` §4 · la noche en el viaje | los viajes de prueba sin duración | con `duracionMs: 2900` (el tipo la pide; la luz no la mira) | Literal |
| `s49`, `s51`, `s52-nocturno-final`, `s52-pulido-1` · la entrada del reloj | `enViaje: boolean` | `viajeS: number` (0: sin viaje) | Literal; `s51` 1D sigue exigiendo que un viaje lo lleve a cero en menos de 3 s, y su cableado, el texto nuevo |

`s52-pulido-1` P5: la vuelta en un viaje (2,9 / 4,75 / 7,3 s, desde el final entero y desde la mitad) termina adentro del
viaje (≤ 56 % y ≤ 1,6 s), siempre hacia atrás, y ni la cámara, ni el logo, ni el oscurecimiento del piso cambian por cuadro
más que en el rebobinado de P2; el brillo, en varios cuadros (controles: la vuelta de A2, el reparto por `fin` solo, el
reparto sin el logo); `?vuelta=corta`; la salida de la fase del viaje (control: un reloj que se queda en `viaje`) y un viaje
a mitad de un rebobinado sin saltos; el cableado del quieto (control: sin tomarlo de nuevo).

**Visto y no tocado** (fuera de P5; son función de `fin` y pasan igual en el rebobinado de P2 y en el encastre hacia
adelante): (1) la sombra del logo aparece de un cuadro al otro cuando el logo sale del hueco (en la grabación, entre 913 y
930 ms); (2) en el rebobinado de P2, el brillo de P1 se apaga de un cuadro al otro (su energía cae entera en un cuadro al
pasar por el golpe). La vuelta del viaje ya no tiene el (2).

**Gate**: lint limpio en lo tocado; `tsc --noEmit` 0 errores; s31–s52 verdes (más s18, s27 y s39, que tocaba); `verificar`:
los mismos 8 grupos rojos de la base (las mismas 14 invariantes); reposo a 1440 y 390 capturado con el banco, sin errores en
la consola.
