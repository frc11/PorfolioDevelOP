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
