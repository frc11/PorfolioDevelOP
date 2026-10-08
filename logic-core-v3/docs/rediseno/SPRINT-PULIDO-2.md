# SPRINT PULIDO 2 — feedback del humano sobre PULIDO 1

Rama `rediseno/home`, worktree `C:\rediseno-home\logic-core-v3`, ruta `/v3`. Fuente de verdad del sprint: este archivo
(el plan arriba, el log abajo). Un commit por punto, con push después de cada uno. Invariante nuevo:
`npm run test:s53-pulido-2` (una sección por punto, con su control positivo). Entregables:
`docs/rediseno/entregas/pulido-2/` (`mirar.txt`, `LEEME.txt`, las hojas de 3, 4 y 5 y la matriz de viajes de 2).

Aprobados de PULIDO 1 (no se tocan; sus aserciones siguen verdes): P2 (el rebobinado), P6 (el logo «ángel»), P18 (el
formulario de vidrio) y P17-A (la cámara del CTA). Rechazados (se BORRA su código y su bandera, no quedan muertos):
`?encastre=desvanece`, `?vuelta=corta`, `?cta=a|b|c|d` (Losa, Haz, Bloques, Portal) y `?brillo=`.

## 0 · Dónde vive cada punto (leído antes de proponer)

| Punto | Qué | Dónde vive hoy |
|---|---|---|
| 1 | El encastre DETRÁS del pie abajo de 1024 | El escenario de P22: un `div` de `100svh` después del pie en `_secciones/Home.tsx` (`--escenario-del-encastre` en `_estilos/pie.css`); el disparo del final en `escena/final/cuadroDelFinal.ts` (`s.fondo` = `scrollHeight − innerHeight`, `alFondo`); los gestos retenidos con el escenario a la vista en `final/FinalDelPie.tsx`; el encuadre angosto en `recorridoDelFinal.ts` (`distanciaDelFinalAngosto`); la otra lectura `encastre=desvanece` en `cuadroDelFinal.ts` (`desvanecerElPie`), `FinalDelPie.tsx`, `pie.css` y `entorno.ts` |
| 2 | Los viajes del menú, más rápidos | La duración en `_componentes/deslizamiento.ts` (`duracionDelViaje`: `VIAJE_CON_TOPE` de NOCTURNO FINAL A2, 4,5 pantallas/s, entre 2,6 y 7 s) y el efecto en `useDeslizamientoDelCta.ts` (Lenis `scrollTo` o `viajeSinLenis.ts`); el plan de la luz en `escena/planDelViaje.ts` y `escena/viaje.ts`; la vuelta del final en un viaje en `recorridoDelFinal.ts` (`VIAJE_DEL_FINAL`, `vueltaEnElViaje`, `?vuelta=corta`); el túnel estirado en `escena/tramoEstirado.ts`; el ≠ de Quiénes somos en `_secciones/quienes-somos/` |
| 3 | El velo de P12 sin rectángulo | `_estilos/banda.css` (§4, abajo de 1024: `--velo-sobre-la-escena` y `--sombra-del-velo`, un fondo con sombra de caja detrás de la bajada de Trabajos) |
| 4 | El brillo del piso, de abajo y por las juntas | `escena/final/enElPiso.ts` (`BRILLO_EN_EL_PISO`, zonas blancas sobre las TAPAS, `?brillo=`), su reloj en `cuadroDelFinal.ts` y el oscurecimiento en `OrbitRig.tsx`; los bloques instanciados en `escena/piso/` (`PisoVivo.tsx`, `bloques.ts`) |
| 5 | El CTA final: transformación desde «Seis razones» | La frase en `_secciones/por-que-develop/` (`FRASE` en `contenido.ts`, el escenario en `PorQueDevelop.tsx`); el CTA de hoy (`data-pieza="cta-del-final"`); las variantes rechazadas en `escena/ctaDelFinal/*`, `_componentes/ctaDelFinal/CtaDelFinal.tsx` y sus costuras (`ProbeStage.tsx`, `PisoVivo.tsx`, `MoireScreen.tsx`, `apertura.ts`, `placa.ts`, `PlacaDelContacto.tsx`, `banda.css`); la fuente del titular del hero en `_secciones/hero/contenido.ts` (registro 1: Archivo condensado 700; registro 2: Chivo Light itálica); los títulos 3D en `escena/titulos3d/` |
| 6 | Pendientes de PULIDO 1 | La sombra del logo en `escena/sombra/delLogo.ts` y `LuzDelLogo.tsx`; el rótulo «CONTACTO» a 768 en `_secciones/cierre/` |

## 1 · El plan (en el orden pedido)

1. **El encastre detrás del pie** — sacar el escenario y `encastre=desvanece`; el final corre al fondo (como en
   escritorio) detrás de los elementos del pie, con un encuadre angosto que deja leer el logo y el hueco entre ellos y a
   través del vidrio; con el foco en un campo, el final no arranca ni rebobina y el cambio de viewport del teclado no lo
   dispara; AA de los textos del pie medido con la cinemática en movimiento; el scroll máximo igual al de antes de
   `857af5c7` (medido en el código de ese commit).
2. **Los viajes** — medir la matriz (NVIDIA), encontrar la causa en la historia (sólo lectura), duración = f(distancia)
   con saturación (vecinas ~1,2 s, el más largo ≤ 2,5 s, desde el encastre el mismo presupuesto), el rebobinado de P2
   comprimido en el primer ~1 s con la cámara en el mismo reloj, sin perder calidad; el ≠ de Quiénes somos con los demás.
3. **El velo** — default: un pseudo-elemento con `radial-gradient` (`closest-side`) que se desvanece muy por fuera del
   texto; `?velo=escena`: el sombreador del logo baja su luminancia en una elipse de pantalla. Medir las dos, AA.
4. **El brillo de abajo** — la luz sale por las juntas desde debajo del piso, en el sombreador instanciado: sectores que
   nacen, se propagan, respiran y se retiran; los bloques se separan y quedan a alturas distintas; caras con degradé
   desde la base; la sala se oscurece gradual (también en el rebobinado); sin bloom; `?chispas=si` apagado.
5. **El CTA** — la fuente del titular, extruida por el pipeline 3D; variantes `?cta=capas|relevo|giro|cruce|tipo`, cada
   una pura del scroll; sin bandera, el CTA de hoy; movimiento reducido = el estado final sin tapar el logo.
6. **Pendientes** — la sombra del logo entra con fundido; «CONTACTO» a 768 en AA.

## 2 · Gate por punto

Lint limpio en lo tocado; `tsc --noEmit` sin errores nuevos; s47–s53 verdes; `verificar` con los mismos 8 grupos rojos
heredados; capturas de reposo a 1440 y 390 (y 768 en 1, 3 y 5). Las animaciones las aprueba el humano.

## 3 · Log

**El banco y la placa** (antes de medir nada, pedido del sprint): el Chrome del banco es
`C:\Program Files\Google\Chrome\Application\chrome.exe` (`scripts-b4/cdp.ts`, `CHROME`) y la página lee
`ANGLE (NVIDIA, NVIDIA GeForce RTX 5050 (0x00002D83) Direct3D11 vs_5_0 ps_5_0, D3D11)`, con y sin `BANCO_GPU=alta`. Es la
NVIDIA: se puede medir. Las sondas y las hojas, en `~/.cache/b4-medicion/pulido-2/`.

**`visual-qa`:** como en PULIDO 1, en este entorno no captura; las capturas de reposo y las hojas son del banco del repo
(`scripts-3d-sonido/banco.ts`, un Chrome propio por CDP), con la placa leída en la página.

### 1 · El encastre DETRÁS del pie (teléfono y tablet)

**Antes:** P22 corría la cinemática en un escenario de una pantalla después del pie (`Home.tsx`, `pie.css`): la página
scrolleaba 844 px de más a 390 (el documento, 23111 px en lugar de 22267). La otra lectura, `encastre=desvanece`, se
rechazó con él.

**Qué cambió:**
- **Sin escenario.** Se borraron el `div` de `Home.tsx`, su hoja (`pie.css`), su token (`--escenario-del-encastre`), la
  bandera (`entorno.ts`) y la otra lectura (`desvanecerElPie` en `cuadroDelFinal.ts`, el efecto en `FinalDelPie.tsx`). El
  final corre al fondo, como en escritorio (el mismo disparo: `scrollY` al fondo con el pie entero), DETRÁS de los
  elementos del pie, que quedan donde estaban.
- **El encuadre entre los elementos** (`escena/final/encuadreDelPie.ts`, nuevo): con las cajas del pie tal como quedan al
  fondo (el titular, los contactos, los enlaces, los campos, los íconos, la caja de vidrio, más el botón del menú y los
  controles de las esquinas), se busca el rectángulo libre más grande con la forma de la huella del logo (la misma del
  hueco), centrado en el eje cuando entra (cede hasta un 15 % de tamaño para quedar centrado). Si ningún hueco da un logo
  legible (30 % de la dimensión que lo limita), se busca entre lo pesado (el titular, el vidrio y lo fijo): el logo queda
  detrás del texto chico, que se lee encima. Si tampoco, detrás del vidrio, que lo deja ver desenfocado. La cámara de arriba
  se corre en su propio plano, sin girar, hasta poner el logo en ese punto (`camaraDelFinal`, parámetro `corrimiento`), a la
  distancia que le da ese ancho (`distanciaParaElAncho`); así queda ahí también cuando el quieto se aleja. Se mide al
  montarse, al asomarse el pie (el pie lejos todavía no tiene su layout final), con cualquier cambio de tamaño adentro del
  pie y con las fuentes; nunca por cuadro y nunca con el teclado abierto.
- **El teclado** (`escena/final/teclado.ts`, nuevo; sólo abajo de 1024): con el foco en un campo que abre teclado, el reloj
  del final y el quieto quedan donde están y un gesto no rebobina ni se retiene (la página se mueve normal). Lo que el
  teclado le hace a la página (la vista que se achica, el scroll con que el navegador acomoda el campo, la vista que vuelve)
  no cambia el fondo que vale: al salir del campo la página sigue «al fondo» o «no al fondo» como estaba al entrar, hasta que
  el visitante la mueva (un gesto desde que entró al campo, o un scroll con la vista quieta 0,6 s) o la vista diga lo mismo.
- **Los toques**: la escena está detrás (el lienzo no recibe toques); el escucha que retiene el dedo es el de siempre
  (`touchstart` pasivo, `touchmove` sólo cancela un arrastre), y sólo está puesto con el pie a la vista.
- **El AA del pie sobre la cinemática** (`banda.css` §7, token `--halo-del-pie`): la mezcla del pie (`difference`) da gris
  sobre los grises que la cinemática atraviesa. Al fondo y mientras el final corre, el pie lleva `data-final-del-pie` (lo pone
  la escena, `marcarElPie`) y sale sin mezcla: la tinta con un halo denso del papel (la receta de D2), también en las
  etiquetas del vidrio y la fila de abajo.
- Para el banco: `__finalFijoDelBanco(fin)` clava el reloj (el contraste en un cuadro quieto) y `__finalDelBanco()` informa
  el encuadre y el estado del teclado.

**El scroll máximo (REGLA DE ALTURAS):** a 390 × 844, 21423 px, el mismo que se midió en el código de antes de 857af5c7
(PULIDO 1, `pulido-1/p22/alturas/`: documento 22267 − 844); con el escenario era 22267. A 768 × 1024, 26881 (con el
escenario, 27905). El pie mide una pantalla y la página termina en él (`pulido-2/p1/pie/`).

**Medido** (`pulido-2/p1/`, NVIDIA):
- El encuadre al fondo (`final/hueco-*`): 390 × 844, en el hueco entre los contactos y los enlaces, en el eje (162 px de
  ancho); 375 × 667, entre lo pesado, detrás de los enlaces (232 px); 768 × 1024, en el hueco de abajo (476 px, su tope);
  844 × 390, a la izquierda del formulario (313 px); 667 × 375, detrás del vidrio (no hay hueco: el formulario ocupa todo).
- El teclado (`teclado-390x844.json`; el teclado de hoy se emula achicando sólo la vista visual): al fondo con el final a
  0,48, el foco y el scroll del navegador (−150 px) lo dejan en 0,476; al salir sigue (0,76 a los 1,8 s). Arrastrando la
  página mientras se escribe, al salir vale el fondo medido (sale: 0,97 → 0,11). Fuera del fondo (final en 0), el teclado y
  el navegador lo dejan al fondo y el final queda en 0, también al irse el teclado; con el primer gesto, arranca (0,24). Con
  el teclado viejo (el que achica el documento) también queda quieto mientras se escribe.
- Los toques durante la cinemática: un toque en «Trabajos» viaja (`data-v3-deslizando`, fase `viaje`); un toque en un campo
  lo enfoca.
- El contraste de los textos del pie con el reloj clavado en 0,05 … 1 (núcleo de las letras, percentil 10;
  `contraste/halo2-*`). Antes del arreglo, a 390: «Quiénes somos» 1,07:1 y «Servicios» 1,14:1 a fin 0,2 (el logo
  inclinado, gris, detrás); las etiquetas del vidrio hasta 2,7. Después, el peor de la cinemática por tamaño: 390 —
  «Servicios» 4,56 (fin 0,05); 375 — «Servicios» 4,52 (0,3); 768 — «Mensaje» 5,7; 844 — «©» 6,38; 667 — «Por qué develOP»
  5,67. Al fondo con el final en cero (parado después de un rebobinado), a 375: 5,46 o más. «Enviar» (un botón opaco) da 3,4
  a 390 y 4,6–4,9 en los demás, igual con y sin final: es el borde de sus letras, la escena no lo toca.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s52-pulido-1` · las banderas | entre las pedidas, `encastre=desvanece` | sin ella | La bandera se borró por pedido; las demás siguen con el mismo control |
| `s52-pulido-1` · P22, el escenario | hay un escenario de una pantalla después del pie (dos controles) | la página termina en el pie: nada después de las secciones, ni la hoja del escenario (un control) | PULIDO 2 pide sacarlo; la aserción sigue fijando la estructura (cualquier cosa después de las secciones la pone roja) y `s53-pulido-2` fija lo nuevo |
| `s52-pulido-1` · P22, el montaje | (el texto) «con el escenario a la vista» | «con el pie a la vista» | La misma expresión regular; sólo el texto |
| `s52-pulido-1` · P22, el encuadre | la distancia angosta en la línea `const distancia = s.angosto && … ? distanciaDelFinalAngosto(` | la misma función, en su línea nueva (`: encuadre === null ? distanciaDelFinalAngosto(…) :`) | La misma prueba en los cinco tamaños; es el encuadre hasta que se mide el pie; el medido lo fija `s53-pulido-2` |
| `s52-pulido-1` · P22, la otra lectura | existe `encastre=desvanece` | no existe (ni el pie que se desvanece ni su marca), con control | Borrada por pedido |
| `s50-encastre` · las piezas de frente | `camaraDelFinal(…, distancia)` en la viva y en la sin el mouse | lo mismo con `, corrimiento` | Más estricta: fija también el corrimiento, el mismo en las dos |
| `s51-retoque-encastre` · el cableado | el reloj con `alFondo: window.scrollY >= s.fondo - AL_FONDO_PX` | la misma medida (`alFondoMedido`), que en escritorio va derecho (`sinTeclado`) y abajo de 1024 pasa por el teclado | Más estricta: la medida sigue siendo la misma y además fija el camino del teclado |

`s53-pulido-2` §1: la página termina en el pie (y nada del escenario en ningún archivo); el encuadre con las cajas medidas en
los cinco tamaños (el lugar esperado, sin tocar lo que corresponde, entero y dentro del tope; a 390, en el eje); la cámara
pone el logo en el punto y el ancho pedidos; el teclado en cuatro escenas (A, A2, B y B2); el cableado; el AA del pie.
Controles: el escenario, el encuadre de P22, la cámara sin corrimiento, dos teclados que le creen al fondo medido, un reloj
que avanza escribiendo y el pie con la mezcla.

**Gate:** lint limpio en lo tocado; `tsc --noEmit` 0 errores; s47–s53 verdes; `verificar`: los 8 grupos rojos de la base (s1,
s2, s3, s4, s5, s7, s8, s17) con las mismas 14 invariantes; reposo capturado a 1440, 390 y 768 (`pulido-2/reposo/p1-*`), sin
errores en la consola (sólo el aviso de movimiento reducido del banco). Escritorio: el final igual que antes.

### 2 · Los viajes del menú: más rápidos sin perder calidad

**a) La matriz, antes** (`entregas/pulido-2/p2-matriz-de-viajes.txt`; NVIDIA, del click a la llegada): a 1440, las vecinas en
2,9–3,0 s y los largos hasta 7,7 s («Inicio → Por qué develOP» 7.657 ms; «Inicio» desde el pie 7.437 ms); desde el encastre
avanzado, lo mismo que desde el pie en reposo (eso ya lo había dejado P5). A 390, de 2,9 a 6,0 s.

**b) Por qué se ralentizó** (leído en la historia, sin checkout: `git log -p` de `deslizamiento.ts` y `git show <tag>:…` en
`navbar-v3`, `retoque-encastre`, `nocturno-parcial`, `nocturno-final` y `pulido-1`):
- Hasta `retoque-encastre` todo viaje duraba 2,6 s de recorrido (`DURACION_DEL_VIAJE_MS`), fuera de una pantalla o de 35.
- **La causa: NOCTURNO FINAL A2** (`fa0a9ca5`, desde `nocturno-parcial`): la duración pasó a ser una VELOCIDAD CON TOPE (a lo
  sumo 4,5 pantallas por segundo, entre 2,6 y 7 s). «Inicio → Por qué develOP» son 31 pantallas: ~7 s.
- **El túnel estirado lo agrandaba** (sospecha confirmada): la distancia se contaba en px crudos, con los del túnel de
  escritorio estirado (k = 1,8): ~3.500 px más en cada viaje que lo cruza, ~0,9 s más con esa velocidad.
- **El tope por cuadro sin devolución** (sospecha confirmada en parte): A2 hizo que ningún cuadro avanzara el viaje más de
  34 ms y lo que se perdía no se devolvía: cada cuadro largo alargaba el viaje (en la NVIDIA, 0 a 3 por viaje: poco; en un
  teléfono, más). Y el final del pie se deshacía con OTRO reloj (el `delta` de su cuadro), así que con cuadros largos la
  cámara del recorrido y la vuelta del final iban a ritmos distintos.
- **La espera a `FINAL_EN_REPOSO`** (descartada): la sacó PULIDO 1 P5.
- **El tope de velocidad del amanecer** (descartado como causa de la lentitud; sí era un defecto): no alarga el viaje, pero
  en un viaje que cambia de luz el amanecer quedaba quieto y saltaba al terminar (ver e).

**c) La duración nueva** (`deslizamiento.ts`): del click a la llegada, `1,2 s + 1,3 s · (1 − e^(−(d − 1)/20))`, con `d` las
pantallas que recorre la ESCENA (sin el túnel estirado: `pantallasDelViaje`): una pantalla o menos, 1,2 s; ocho, 1,6 s;
la más larga del sitio (34,5), 2,26 s; nunca más de 2,5 s. Se fue `VIAJE_CON_TOPE`. Desde el encastre avanzado, la misma (la
duración no mira el final).

**d) Desde el encastre**: la vuelta del final ES el rebobinado de P2, comprimido (`duracionDeLaVuelta`): la misma curva y el
mismo reparto (todo es función de `fin`), con la duración de P2 escalada para que desde el final entero termine en 1 s (P2:
1,6 s; desde la mitad, 0,5 s). Se fueron el reparto del tiempo por pesos (cámara, logo, piso), el techo en el 56 % del viaje y
`vuelta=corta`. Y corre con **el reloj del viaje** (`relojDelCuadro`/`segundosDelViaje` en `escena/viaje.ts`), el mismo que
mueven Lenis y el motor sin Lenis: la cámara del recorrido no se adelanta a la vuelta. Ese reloj es el de pared con el tope de
A2 por cuadro, pero lo retenido se devuelve en los cuadros siguientes (a lo sumo el tope por cuadro): un viaje dura lo que pidió
aunque haya tirones. El brillo del piso ya no se apaga de un cuadro al otro en la vuelta (ni en el rebobinado de P2): el poder
del piso baja con inercia (`poderSuave`, 0,3 s).

**e) Sin perder calidad:**
- **El reparto por lo que se ve cambiar** (`escena/repartoDelViaje.ts`, nuevo): con 1,2–2,5 s, la curva del viaje pareja en el
  scroll dejaba los tramos donde la cámara gira (el hero, la entrada al túnel, Servicios → Tu panel) en pocos cuadros. Ahora la
  curva del viaje se aplica al COSTO de cada tramo: lo que recorre la escena más lo que gira la cámara de la coreografía (con su
  encuadre; 30° cuestan como una pantalla). Donde gira, más tiempo; donde la sala apenas cambia, menos. Mismo destino, misma
  duración, puntas quietas.
- **La cámara al salir de una sección opaca** (`OrbitRig.tsx`): con la escena suspendida (Tu panel), la cámara quedaba a mitad
  de su asiento y, al arrancar el viaje, lo alcanzaba de a un tope por cuadro (hasta 30° en un cuadro). Ahora, al volver de la
  suspensión, va derecho a su pose (nada se vio mientras tanto): un solo cambio de 8° detrás del velo, a los 40 ms del click.
- **El amanecer se completa adentro del viaje** (`amanecer/Amanecer.tsx`, `linea.ts`): en un viaje que cambia de luz y llega al
  amanecer (de la noche de Portfolio a «Por qué develOP») quedaba quieto y, al terminar el viaje, saltaba de golpe a lo que
  pedía el scroll (a 390, de 0 a 0,85 en un cuadro, medido). Ahora va de cero al día entero con el reloj del viaje (después del
  preludio, con la curva simétrica) y queda entero al llegar, como el de día a día. Medido a 390: 0 → 1 en el viaje.
- Las secciones se siguen viendo pasar (el scroll es continuo, el túnel comprimido) y durante el viaje no se puede scrollear
  (sin cambios: `retenerLosGestos`).

**f) El ≠ de Quiénes somos** (`QuienesSomos.tsx`, `titular3d.tsx`, `titulos3d/TitulosDeVolumen.tsx`): no tenía llegada y se
dibujaba con cualquier raya empezada; desde el menú aparecía en el viaje, ~0,5 s antes que el titular (screencast:
`pulido-2/p2/signo-antes-1440.png`). Ahora llega con la misma función que el titular (su entrada: P1 con el rango de la
máscara, pura del scroll): en un viaje se desarma como los demás y sus rayas crecen con la llegada (`signo-despues-1440.png`:
aparece con «Queremos hacer algo distinto»).

**Medido después** (la matriz entera en el entregable): a 1440, de 1,23 a 2,37 s; a 390, de 1,22 a 2,21 s; desde el encastre
avanzado lo mismo que desde el pie en reposo (± 50 ms). La vuelta del final desde el entero: 1,02 s. Lo más que gira la cámara
en un cuadro: ver «Lo que no quedó bien».

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s52-nocturno-final` A2 · la velocidad | la velocidad con tope (cortos 2,6 s; largos a lo sumo 4,5 pantallas/s, hasta 7 s), con control de la duración fija | la duración por la distancia con saturación (1 pantalla: 1,2 s; cóncava; nunca más de 2,5 s; la más larga entre 2,2 y 2,5 s), con dos controles (A2 y la fija) | Lo pide PULIDO 2; fija la función con más condiciones que antes |
| `s52-nocturno-final` A2 · Lenis con tope | el literal del reloj de Lenis con el tope | Lenis con `relojDelCuadro`, y el tope en `viaje.ts` | La misma garantía (un tirón avanza a lo sumo el tope; el tirón simulado sigue verde) y además fija que es el reloj compartido |
| `s52-pulido-1` P5 · la vuelta | a la velocidad de P2, ≤ 56 % del viaje y ≤ 1,6 s; nada cambia por cuadro más que en P2; el brillo en varios cuadros; tres controles | el rebobinado de P2 comprimido a 1 s: cuadro a cuadro la MISMA curva que P2 a 1,6×, adentro del viaje, monótona; nada cambia por cuadro más que P2 × 1,6; el brillo en varios cuadros (ahora con la inercia del poder, en P2 y en el viaje); tres controles | Lo pide PULIDO 2 (comprimido en ~1 s); la curva queda fijada exacta, y el brillo con el mismo umbral que antes |
| `s52-pulido-1` P5 · `?vuelta=corta` | existe y vale el 35 % | no existe | Borrada por pedido |
| `s52-pulido-1` P5 · el cableado | `viajeS: … / 1000 }, dt)` | lo mismo con `enElViajeS: enElViaje()` | Más estricta: fija el reloj del viaje |
| `s52-pulido-1` · las banderas | con `vuelta=corta` | sin ella | Borrada por pedido |
| `s51-retoque-encastre` · el cableado | el literal del reloj | con `enElViajeS: enElViaje()` | Más estricta |
| `s18-deslizamiento` §4d | `duracionDelViaje(destinoEnPx - window.scrollY, window.innerHeight)` y `easing: CURVA_DEL_VIAJE` | `duracionDelViaje(pantallasDelViaje(destinoEnPx))` y la curva repartida con `CURVA_DEL_VIAJE` de base | El efecto sigue consumiendo la duración del módulo y pasando una curva explícita |
| `s46-retoque-panel` · el ≠ en volumen | `<SignoDeVolumen progreso={progresoDelSigno} />` | con `entrada={entradaDelSigno}` | Más estricta: fija también la llegada |
| `s34-calidad1` · los viajes que cambian de luz | `const activo = !cambiaDeLuz && …`: quieto todo el viaje | lo mismo, salvo el que llega al amanecer, que se completa con el reloj del viaje (`completoDelViaje(segundosDelViaje(), …)`) | Lo pide PULIDO 2 («el amanecer se completa dentro del viaje»); sigue fijando que no corre a la velocidad del vuelo |
| `s36-escena10` · el amanecer en el viaje | el literal de `activo` (quieto) | el literal nuevo, con `llegaAlAmanecer` medido en el destino | Ídem; el control (el amanecer que corre en el viaje) sigue cazando |
| `s36-escena10` · las reglas de §4 | `a.sinLetras ? conRaya : …` | `a.sinLetras ? conRaya && llegada > 0 && salida < 1 : …` | Más estricta: el sin letras también se dibuja sólo con su llegada |

`s53-pulido-2` §2: la duración por la distancia de la escena (control: los px crudos); el reloj con lo retenido devuelto y la
pausa que no es deuda (control: el reloj de A2); los tres que lo leen (control: el final con su `delta`); el reparto (control:
sin repartir); el amanecer adentro del viaje (control: quieto y salto); el ≠ con la llegada del titular (control: sin llegada).

**Gate:** lint limpio en lo tocado (en `QuienesSomos.tsx` quedan dos avisos de imports sin usar que ya estaban: no los toqué); `tsc --noEmit` 0 errores; s47–s53 verdes (más s18, s27, s34, s36 y s46, que tocaba); `verificar`: los 8 grupos rojos de la base con sus 14 invariantes, más s34 y s36, que fijaban el amanecer quieto en los viajes que cambian de luz y la regla vieja del ≠: ajustados (tabla) y corridos de nuevo, verdes; reposo a 1440 y 390 (`pulido-2/reposo/p2-*`) sin errores en la consola.

### 3 · El velo de P12 sin rectángulo

**Antes:** el velo de P12 era el fondo del párrafo (76 % del color de la noche) con una sombra de caja ancha: sobre el logo
se leía como una caja, con bordes rectos arriba y a la izquierda (la captura del humano, `p12-rectangulo`).

**Qué cambió:**
- **Por defecto, una elipse** (`banda.css` §4, tokens `--alcance-del-velo` y `--degrade-del-velo`): el velo pasa a un
  pseudo-elemento `::before` detrás de la bajada del cartel y del texto de las demos, con un `radial-gradient(closest-side, …)`
  entero hasta el 55 % de su radio y desvanecido hasta el borde de su caja, que es 1,9 veces el ancho del texto y 2,8 veces su
  alto (`inset: -90% -45%`): se desvanece muy por fuera del bloque. Sin fondo ni sombra de caja en el texto (se fueron
  `--sombra-del-velo` y el `background-color`). El párrafo sólo pasa a `position: relative` (para la caja del pseudo-elemento;
  medido: era `static`, no cambia el layout, y la página no gana scroll horizontal); sin `isolation`, el velo queda detrás de
  todo el cartel, también del título (con aislamiento lo tapaba: «Portfolio» se veía gris en la primera captura).
- **`?velo=escena`, sin capa del DOM** (`escena/veloDelTexto.ts` y `VeloEnElLogo.tsx`, montado desde `LuzDelLogo.tsx` sólo con la
  bandera): el sombreador del logo baja su luminancia (hasta el 80 %) en una elipse de pantalla del mismo tamaño detrás de cada
  texto (dos a la vez), que el DOM mide en cada cuadro con la opacidad con que se ve el texto. El velo va al FINAL del sombreador
  (después del color de noche del logo, que si no lo pisaba). Con la bandera, la raíz lleva `data-velo="escena"` y la hoja saca
  la elipse del DOM.

**Medido** (`pulido-2/p3/contraste/`; el método de P12: la máscara de las letras, lo de atrás sin el texto ni el velo, lo que
se ve; mediana del contraste de las letras sobre el logo y sobre la noche, en los pasos con el texto quieto):

| | 390 × 844 | 375 × 667 | 768 × 1024 |
|---|---|---|---|
| Antes (P12, emulado) · la bajada | logo 12,1 / noche 12,8 | 12,2 / 12,6 | 12,0–12,1 / 13,2–13,6 |
| Elipse (por defecto) · la bajada | 12,1 / 12,8 | 12,4 / 12,6 | 12,1 / 13,3–13,6 |
| `?velo=escena` · la bajada | 12,3–12,4 / 12,6 | 12,5–12,7 / 12,2–12,3 | 12,3 / 13,1–13,2 |
| Elipse · el texto de las demos | 7,0–10,5 / 9,1–11,2 | 9,6–11,6 / 10,9–11,5 | 5,4–12,3 / 8,3–12,9 |
| `?velo=escena` · el de las demos | 7,4–10,5 / 8,2–10,4 | 7,7–10,7 / 9,7–10,6 | 5,4–12,7 / 8,2–12,4 |

Las dos variantes mantienen el AA de P12 (la bajada sobre el logo ≈ sobre la noche). En la captura no queda ningún borde
recto ni silueta de caja en ninguna (hoja: `entregas/pulido-2/p3-velo-antes-elipse-escena.png`, los tres anchos). **El
default es la elipse del DOM**: el mismo contraste, sin trabajo por cuadro; `?velo=escena` da un logo apenas más limpio
alrededor del texto (sólo se oscurece el logo) a cambio de medir el DOM en cada cuadro. Los valores bajos de las demos son
pasos en que el texto todavía aparece (pasa igual antes y en las dos variantes).

**Gate:** lint limpio en lo tocado; `tsc --noEmit` 0 errores; s47–s53 verdes (más s3-tokens, por los dos tokens nuevos); `verificar`: los 8 grupos rojos de la base con sus 14 invariantes; reposo a 1440, 390 y 768 (`pulido-2/reposo/p3-*`) sin errores en la consola.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s52-pulido-1` P12 · el velo | el párrafo con `background-color` y `box-shadow` del velo (≥ 70 %) | el pseudo-elemento con el degradé radial del velo (≥ 70 %) y ningún fondo ni sombra de caja del velo | Lo pide PULIDO 2 (sin rectángulo); el mismo umbral de color y los mismos dos controles; la forma la fija `s53` |
| `s52-pulido-1` P12 · desde 1024 nada cambia | el velo y su sombra sólo en la banda | el velo y su forma (los dos tokens nuevos) sólo en la banda | Más estricta: cubre los tokens nuevos |
| `s52-pulido-1` · las banderas | sin `velo` | con `velo=escena` | Suma la prueba nueva al mismo control |

`s53-pulido-2` §3: la elipse (alcance de al menos 80 % y 40 %, entera hasta ≤ 60 %, sin caja; control: el rectángulo de P12) y
`?velo=escena` (la prueba, el montaje, la hoja que saca la elipse, el velo al final del sombreador con la misma elipse;
control: el velo puesto antes del color de noche).

### 4 · La luz de abajo, por las juntas (P1 rehecho)

**Antes (PULIDO 1, P1):** una o dos zonas de bloques con la TAPA a blanco (`BRILLO_EN_EL_PISO`, `?brillo=suave|fuerte`) y
el piso entero 10–15 % más oscuro todo el final. El humano: «no entendiste mi concepto»; las tres referencias son bloques
grises con luz blanca que se escapa por las rendijas, desde abajo.

**Qué cambió** (`escena/final/luzDeAbajo.ts`, `planoDeLaLuz.ts`, `chispasDeLaLuz.ts`; el piso en `enElPiso.ts`; el reloj en
`cuadroDelFinal.ts`):
- **Las zonas las calcula una función por cuadro** (`zonasDeLaLuz`: dónde, de qué tamaño, cuánto vive cada una) y van al
  sombreador como uniformes; el sombreador sólo dibuja la forma (`sectorDeLaLuz`, medida en el centro de cada bloque). Así
  la escena sabe cuánto está prendido (para oscurecer la sala) y los invariantes leen la misma función, no una copia.
- **El sector nace en un punto y se propaga bloque a bloque:** su borde es la vida de la zona (con la vida crece desde el
  centro); orgánico (la distancia deformada por un ruido), mayormente contiguo; respira (el radio late ±8 %) y se retira; la
  próxima aparece en otro lugar de lo que se ve. Dos a la vez como máximo, con huecos cortos.
- **En el sector, los bloques se separan un poco** (en el vértice se achican sobre su centro, cada uno distinto: rendijas de
  ancho variable) **y quedan a alturas distintas** (en la simulación, un azar por bloque entre −0,12 y +0,42 u).
- **Por las rendijas se ve un plano que brilla** (`planoDeLaLuz.ts`): un disco blanco al pie de los bloques (apenas sobre el
  fondo del zócalo: más hondo que el valle más hondo), que sólo existe en el sector y su resplandor; fuera, descartado. Es el
  resplandor falso y local que pedía el punto: **sin bloom**.
- **Los costados reciben la luz desde su base** (desde la altura del vecino, donde se abre la rendija, y se apaga hacia
  arriba en ~0,3 u) y **los cantos de la tapa la atrapan** (en ~0,04 u: en el medio de la tapa, nada). **La tapa no se
  blanquea**: en el sector queda apenas más en sombra (12 %). La luz de cada junta varía (no todas brillan igual) y se corre
  despacio con el reloj.
- **La sala se oscurece gradual** con lo prendido del sector (hasta 38 % con el sector entero; nunca de un cuadro al otro:
  lo más que cambia en un cuadro a 60 por segundo es < 1 %) y se recupera entre zona y zona; con la energía del poder (con su
  inercia de §2: en el rebobinado se va en varios cuadros).
- **Nunca en el mar calmo del logo:** el sector se apaga con el mismo anillo que usaba el brillo de P1 (desde la mitad del
  borde del mar calmo hasta su borde más el margen), ahora dentro del propio sector, así que vale para todo lo que lo usa: el
  dibujo, las alturas, la separación y el plano. (Al cerrar el punto encontré que una zona grande podía entrar al mar calmo:
  subía y separaba bloques junto al hueco del logo. Con la calma en el sector, las capturas quedan iguales y eso ya no puede
  pasar.)
- **`?chispas=si`** (apagadas en el producto): 56 chispas blancas, chicas y sumadas que nacen en el sector vivo y se apagan
  subiendo; con movimiento reducido no se crean. `?brillo=` se borró.
- **Quieto (movimiento reducido):** el sector queda en un instante con una zona prendida (`quietoEn`).

**De día y de noche:** el final corre siempre de día (la noche es la de Trabajos y vuelve a ser de día antes del pie), así que
no hay una noche del final para mirar: la luz quedó vista y ajustada sólo de día.

**Costo** (NVIDIA RTX 5050, `__gpuDelBanco.medir`, el piso más el plano, con la luz prendida y apagada en el mismo cuadro,
tres pares alternados): a 1440 × 900, 0,702 contra 0,711 ms (la diferencia queda en el ruido); a 375 × 667, 0,333 contra
0,284 ms (+0,05 ms). Medido antes de la calma en el sector (un `smoothstep` más por fragmento).

**Hoja** (`entregas/pulido-2/p4-luz-de-abajo-refs-y-capturas.png`): las tres referencias arriba; a 1440 los tres momentos del
ciclo de una zona (naciendo, plena, retirándose) y el sector de cerca; a 390, los tres momentos.

**Gate:** lint limpio en lo tocado; `tsc --noEmit` 0 errores; s47–s53 verdes (más s50, s51 y s52-nocturno-final, que leían el brillo de P1: ajustados, tabla); `verificar`: los 8 grupos rojos de la base con sus 14 invariantes; reposo a 1440 y 390 (`pulido-2/reposo/p4-*`) sin errores en la consola.

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s52-pulido-1` P1 · blanca | la tapa a blanco (`mix( color, vec3( mix( 0.9, 1.0, vTapa ) ), k )`), sin rojo; control: la lava | la luz se SUMA en las juntas (`color + vec3( luz * s )`), sin rojo y sin ningún `mix` hacia el blanco; control: las tapas blancas de P1 | Lo pide PULIDO 2 (las tapas no se blanquean); el mismo «sin rojo» |
| `s52-pulido-1` P1 · por bloque | la zona medida en el centro del bloque (`b`) | el sector medido en el centro del bloque (`vCentroDelBloque`, que viene del vértice) | La misma condición y el mismo control |
| `s52-pulido-1` P1 · orgánica | el ruido de `zonaDelBrillo` | el ruido de `sectorDeLaLuz` (≥ 0,3, sin damero ni `mod`) | La misma condición y el mismo control |
| `s52-pulido-1` P1 · el ciclo | una COPIA en TS de la cuenta del sombreador; tres controles | la función de la escena (`zonasDeLaLuz`, la que manda los uniformes); las mismas condiciones (nace en 1,5–3 s, ≤ 2 a la vez, a veces una y a veces dos, huecos < 4 s, otro lugar cada ciclo); un control | Más estricta: prueba el código que corre y no una copia |
| `s52-pulido-1` P1 · la sala | 10–15 % fijo todo el final, según `?brillo=` | hasta 40 % (0,38) con el sector entero, gradual con lo prendido y con el final; el rig sin el tinte cálido; control: el atardecer de antes | **El tope sube** (15 → 40 %) porque ahora el oscurecimiento sólo existe mientras el sector está prendido y crece con él (antes era fijo todo el final); 0,38 es el valor elegido mirando las capturas contra las referencias (piso oscuro alrededor de la luz). Lo gradual lo fija `s53` §4 |
| `s52-pulido-1` P1 · intensidades | tres crecientes (`?brillo=suave|medio|fuerte`) | `?brillo=` no existe | Borrada por pedido (P1 rechazado) |
| `s52-pulido-1` · las banderas y la URL | con `brillo=suave|fuerte` y `brillo=medio` es el producto | con `chispas=si` | Suma la prueba nueva al mismo control |
| `s50-encastre` 2E · sin tinta | el literal de la energía en `conLasJuntas` | la luz sumada (`return color + vec3( luz * s );`), sin tinta ni la banda de CIERRE | La energía y la calma pasaron al sector: las fija `s51` 1F |
| `s51-retoque-encastre` 1A · sin partículas | ningún `Points` en `final/`; al grupo sólo el pozo | ningún `Points` salvo `chispasDeLaLuz.ts`, que sólo se crea con `?chispas=si` (una sola llamada, con la bandera y sin movimiento reducido); al grupo, el pozo y el plano | Lo pide PULIDO 2 (las chispas detrás de una bandera); control nuevo: las chispas en el producto |
| `s51-retoque-encastre` 1F · espera al encastre y fuera de la calma | `min( 1.0, uPoder ) * fueraDeLaCalma( xz )` en `conLasJuntas` | la energía (el poder con su inercia) y la calma (el mismo anillo) dentro de `sectorDeLaLuz` | Más estricta: alcanza también a las alturas, la separación y el plano; dos controles (no espera; entra al mar calmo) |
| `s52-nocturno-final` B2 · el brillo | el mismo literal que 1F | el sector con la energía del poder | El mismo control (no espera al encastre) más el del mouse |
| `s52-nocturno-final` B2 · la sala | `OSCURECE * oscuroDelFinal(fin)` | `LUZ_DE_ABAJO.oscurece * oscuroDelFinal(fin) * prendidoDeLaLuz(s.zonas)` | Sigue parejo (un número para el piso entero) y función de `fin` |
| `s52-nocturno-final` B3 · el brillo empieza afuera | la línea de `fueraDeLaCalma` en el dibujo (borrada) | la calma dentro de `sectorDeLaLuz` | La misma condición, ahora para todo lo que usa el sector |

`s53-pulido-2` §4: las tapas (control: las tapas blancas de P1; un canto que ocupa la tapa; un costado parejo); la separación
y las alturas (control: bloques pegados; todos a la misma altura); el plano al pie, sólo en el sector y sin bloom (control:
el bloom; un plano a ras del piso); nace en un punto, se propaga, contiguo y orgánico, con la fórmula leída del sombreador
(control: un sector de tamaño fijo; un círculo); respira y la sala gradual (control: radio fijo; de golpe); las chispas
(control: una nube; en el producto).

### 5 · El CTA del final desde «Seis razones» (P17-B, de cero)

**La fuente.** «tu sitio vendiendo las 24hs» es el titular del hero, «TU NEGOCIO VENDIENDO / LAS 24 HS», y tiene dos caras:
el registro 1 en **Archivo** (`_fuentes/archivo-display-latin.woff2`, declarada en `layout.tsx` como `--font-v3-archivo`,
la clase `font-display` de `TIPOGRAFIA_DEL_TITULAR` en `_secciones/hero/geometria.ts`; en volumen, `archivo-700-titulos.json`)
y el registro 2 en Chivo Light itálica. El CTA va en **Archivo, en mayúsculas**: es la cara que distingue al titular (la
Chivo es la de todo el resto). Sólo la fuente, no su llegada.

**Qué es el CTA.** «HABLANOS» (la acción: el botón de hoy) en volumen, por las piezas del pipeline de los títulos (el
volumen y el bisel de `titulos3d/geometria.ts`; el material de `armado.ts`: el negro satinado, el costado de día, el filo del
dibujo de noche y el amanecer, `ctaDelFinal/material.ts`). El texto que lo acompaña («Este sitio empezó con una charla. El
tuyo también.») sigue en el DOM y llega al final, con el CTA ya en su lugar.

**Cómo está hecho** (`_lib/escena/ctaDelFinal/`; el DOM, en `_componentes/ctaDelFinal/` y `por-que-develop/CtaTransformado.tsx`):
- **Cada variante es una función pura del progreso** (`variantes.ts`), y el progreso es función del scroll: en el escenario,
  la ventana del pin del fin de los valores a la llegada del CTA (la misma pantalla que hoy ocupan la levantada y el CTA); en
  la lista, el recorrido del bloque del CTA. Reversible, igual a cualquier velocidad y en cualquier dirección.
- **Letra por letra** (`letras.ts`, `armadoDelCta.ts`): cada letra en el em de su renglón (el filo de noche sigue leyendo el
  contorno del renglón) y girando sobre su centro.
- **En un plano frente a la cámara** (px de la pantalla): entre los valores y el CTA la cámara gira de un contrapicado a
  mirar desde arriba (P17-A, sin tocar); con las letras fijas en el mundo esa vuelta las deformaba. El plano arranca fijo en
  el mundo donde el título de volumen deja la frase (la misma cuenta que el título: el arranque no salta) y en el primer tramo
  se pega a la pantalla, con la cámara viva, para llegar exacto al lugar del CTA en el DOM (medido: 0 px de diferencia), un
  poco más cerca de la cámara que el logo (lo que vuela pasa por delante del logo y no lo atraviesa).
- **La frase de volumen queda relevada** mientras la transformación la dibuja (`RELEVO_DE_LOS_TITULOS` en el registro de los
  títulos); en `capas` se va como hoy.

**Las variantes** (las hojas: `entregas/pulido-2/p5-<variante>.png`, cinco cuadros —0, 25, 50, 75 y 100 % de la
transformación— a 1440 y a 390; el humano pidió recortarlas a eso: las variantes se juzgan en vivo):
- `?cta=capas` — los seis valores se pliegan en el DOM hasta quedar de canto y de cada pliegue sale, de canto y del ancho del
  valor, una capa del CTA que se abre mientras vuela; se apilan (con aire que se cierra), la pila gira un poco para mostrar
  que su espesor son las seis capas, y baja al lugar del CTA. La pila se arma arriba (a la altura de la frase): en la mitad de
  la ventana el logo todavía está en el centro y las letras negras sobre el logo negro no se leían.
- `?cta=relevo` — cada letra gira 180° sobre X en cascada de izquierda a derecha; en su cara de atrás está la del CTA (las
  ocho más cercanas al CTA: las últimas de «razones» y las primeras de «para»), que vuelan a su lugar; las que sobran se
  acuestan hacia atrás sobre su base y se van.
- `?cta=giro` — las dos mitades se juntan arriba en un cartel de dos renglones del ancho del CTA; el cartel gira sobre Y (en
  la mitad sólo se ve el canto: una línea, con el espesor del cartel) y del otro lado está el CTA, que baja a su lugar.
- `?cta=cruce` — la frase se extruye hacia la cámara (su espesor crece hasta seis veces, con un tope en la pantalla) y se
  agranda alrededor de la contraforma de la «o» hasta que la cubre entera: el CTA se ve por la «o» y queda del otro lado.
- `?cta=tipo` — **la fuente es variable** (Archivo y Chivo, `wght` de 100 a 900): los dos pesos de cada glifo tienen los
  mismos contornos (verificado en los JSON), así que cada letra lleva su peso 100 como objetivo de deformación con la misma
  triangulación. Cada letra se afina hasta el hilo mientras viaja, se cambia por la del CTA con las dos en el hilo y la del
  CTA engorda hasta su peso. (`scripts-retoque/fuentes-3d.py` genera `archivo-100-cta.json` y `chivo-100-cta.json`, y suma
  «HABLANOS» a `archivo-700-titulos.json`.)
- No sumé una sexta: las cinco cubren los gestos pedidos y ninguna idea mía mejoraba a la más sobria de ellas (`giro`).

**El clic, el hover, el teléfono, el movimiento reducido:**
- El CTA es un enlace con `data-abre-contacto="panel"`: abre Contacto con la transición de siempre. Se puede tocar recién
  cuando llegó (desde 0,97); el hover (sólo con el mouse) lo levanta apenas hacia la cámara; con el dedo no hay hover.
- **En el teléfono y la tablet** (la lista) el bloque del CTA mide dos pantallas y su contenido queda clavado mientras
  corre la transformación: centrado, con la copia de «Seis razones» que la escena transforma (para el lector no existe: la
  frase está arriba de la lista). Medido a 390 × 844: al principio del recorrido la cámara todavía muestra el logo grande en
  el centro (baja entre el 30 y el 45 %), así que la copia aparece recién con el logo abajo y la transformación corre en la
  segunda mitad. Ese texto va en tinta, sin la mezcla: la mezcla (texto blanco con `difference`) se corta adentro de lo
  clavado y el texto no se vería; acá no pasa sobre el logo.
- **Con movimiento reducido**, el estado final directo (el progreso es 1, sin recorrido). En escritorio la sección sigue
  midiendo su escenario entero y la lista quedaba arriba, con la cámara en la frase y el logo en el centro: el CTA quedaba
  encima del logo (el pendiente de PULIDO 1). Con la variante, el CTA va en la última pantalla de la sección, donde la cámara
  ya está en la pose del CTA: con el logo abajo, no lo pisa. (Sin bandera el CTA de hoy no cambió: ver «Lo que no quedó bien».)
- **Sin bandera, el CTA de hoy** (su botón va al pie, como antes) y la escena no monta nada: el módulo del CTA es perezoso y
  sólo se descarga con `?cta=`.

**P17-B, borrado entero:** `escena/ctaDelFinal/{PiezaDelCta.tsx, enElPiso.ts, estado.ts, portal.ts}`, el `CtaDelFinal.tsx`
de entonces (reescrito desde cero), el bloque de la losa en `banda.css` y las costuras en `ProbeStage.tsx`, `PisoVivo.tsx`,
`MoireScreen.tsx`, `apertura.ts`, `placa.ts`, `PlacaDelContacto.tsx` y `PorQueDevelop.tsx` (los compartidos quedaron
idénticos a antes de su commit, `4b588ec0~1`).

**Dos tropiezos del banco:** el servidor de desarrollo dejó de ver la carpeta `ctaDelFinal/` cuando la borré y la volví a
crear (siguió sirviendo la primera versión hasta reiniciarlo: tres corridas iguales que parecían «el arreglo no anda»); y el
sistema lo cortó por memoria al final de las capturas (ver «Lo que no quedó bien»).

**Gate:** lint limpio en lo tocado; `tsc --noEmit` 0 errores; s36, s40–s44 y s47–s53 verdes (`s53`: 79 afirmaciones, 0 fallas);
`verificar`: los mismos 8 grupos rojos de la base (las mismas 14 invariantes); reposo a 1440 y 390 con el banco (la NVIDIA,
RTX 5050), la consola sin errores (sólo el aviso de motion de siempre). El humano recortó el cierre: hojas de cinco cuadros
a 1440 y 390 y el reposo sin 768 (las variantes las juzga en vivo).

**Las aserciones viejas que cambiaron:**

| Dónde | Antes | Ahora | Por qué no es más laxa |
|---|---|---|---|
| `s52-pulido-1` P17-B/C | ocho aserciones sobre las cuatro variantes de PULIDO 1 (la losa, el haz, el escalón, el portal, el cableado) con sus controles | se borraron con el código | Las variantes se rechazaron y se borraron (sin código muerto); la que fijaba «sin bandera, el CTA de hoy» pasó a `s53` §5, más estricta (las dos ramas, el botón al pie y el montaje de la escena) |
| `s52-pulido-1` · las banderas y la URL | `cta=a\|b\|c\|d`, `?cta=a` | `cta=capas\|relevo\|giro\|cruce\|tipo`, `?cta=relevo` | El mismo control; `s53` §5 suma que `?cta=a` ya es el producto |
| `s40-3d-sonido` · el módulo perezoso | `if (… \|\| !escritorio) return null` | `if (… \|\| (!escritorio && !conElCta)) return null` y los títulos montados sólo `escritorio &&` | Más estricta: además fija que los títulos siguen sólo desde 1024 y que el CTA se monta sólo con su bandera |
| `s44-pie` · el pie plano abajo de 1025 | el mismo `return null` y `{conElPie && (` | el `return null` nuevo y `{escritorio && conElPie && (` | La misma condición (el pie 3D sólo desde 1024) |
| `s41-retoque-3d` · la frase sube con la levantada | `llegada: frase, salida: levantada, corrida` ×2 | `salida: relevada ? null : levantada, corrida: relevada ? null : corrida` ×2 y `relevada` falsa sin bandera | Sin bandera, lo mismo; con `?cta=` la transformación toma la frase |
| `s41-retoque-3d` · el valor con su tramo | `<ValorEnVolumen …><PiezaDeValor` | la pieza adentro de su llegada, con el pliegue sólo en `capas` | Sin bandera, la pieza tal cual |
| `s42-cierre-retoque` y `s43-ronda2` · la frase se va con la levantada | `salida: levantada` ×2 | `salida: relevada ? null : levantada` ×2 | Ídem |
| `s36-escena10` T3 · el módulo perezoso y la frase | el `return null` de antes; la frase con `salida: levantada, corrida` | el `return null` nuevo con los títulos montados sólo desde 1024; la frase con `relevada` | Las mismas dos condiciones (como `s40` y `s41`) |

`s53-pulido-2` §5: puras y reversibles (control: con memoria); los extremos (control: el CTA corrido); sin saltos (control:
un salto a la mitad); el texto con el CTA en su lugar (control: todavía vuela); relevo (control: las dos caras a la vez);
giro (control: se funde); cruce (control: el CTA antes de la «o»); tipo y la fuente variable (control: el cambio en el peso
grueso); capas y la pila (control: capas antes del pliegue); la fuente y el material (control: la Chivo); el clic y el hover
(control: hover con el dedo); el CTA de hoy sin bandera (control: la escena montada siempre); el teléfono y el movimiento
reducido (control: el estado final animado); sin P17-B (control: un archivo que quedó).

### 6 · Los pendientes de PULIDO 1

**La sombra del logo al salir del hueco.** Medido cuadro a cuadro (`pulido-2/p6/antes-1440.json`, la sonda
`_scripts/p6-sombra.ts`): la fuerza de la sombra nunca saltaba (0,4 de punta a punta); lo que salta es la geometría. Al
rebobinar, el logo pasa de apoyado (`fin` 0,43) a su lugar en el aire (0,35) en cinco cuadros (67 ms, 4 u de subida) y su
sombra salía de debajo de él de golpe (en la grabación de PULIDO 1, entre 913 y 930 ms: es este mismo tramo). Hacia
adelante la caída dura medio segundo y la sombra se mete abajo del logo a la vista.

Ahora (`recorridoDelFinal.ts`, `cuadroDelFinal.ts`, `LuzDelLogo.tsx`, `sombra/delLogo.ts`): la pose pide la sombra entera en
el aire y ninguna apoyada o en el hueco (se va en el último 1,5 u de la caída: `sombraDeLaPose`); la que se ve baja con la
pose y SUBE con un fundido (0,3 s de constante: `sombraConFundido`). El final la lleva en cada cuadro, también después de
soltarse (así el fundido termina), y al irse el final queda entera; quieto (movimiento reducido), sin fundido. Medido
después: al rebobinar entra de 0 a 0,31 (de 0,4) en 0,45 s, mientras el logo se vuelve a parar; hacia adelante se va en los
110 ms antes de apoyarse, cuando ya estaba casi toda abajo del logo.

**«CONTACTO» a 768.** Con la sonda de P18 (copiada en `_scripts/p6-contacto.ts`: el vidrio oscuro forzado sobre la sala de
día, el peor caso de PULIDO 1): 3,8:1 hoy (PULIDO 1 lo anotó en 4,2:1). El rótulo va arriba de la caja, donde el especular
del vidrio oscuro (la tinta al 28 % que baja desde el borde) le aclara el fondo. Probé dos salidas inyectando la regla: el
especular al 10 % (4,98:1) y el tinte al 76 % (4,96:1, con la caja más opaca). Quedó la primera, sólo en el formulario:
`--vidrio-reflejo-del-formulario` (10 %) en su bloque de `vidrio.css`, registrado en `s3-registro-de-tokens.ts`; el
especular oscuro lo lee con el respaldo de `--vidrio-reflejo`, así el del menú sigue en 28 %. Medido después: «CONTACTO»
4,98:1; los rótulos de los campos, de 5,1 a 5,6; el resto igual.

**Gate** (el corto que pidió el humano): lint limpio en lo tocado; `tsc --noEmit` 0 errores; `s53` verde (87 afirmaciones,
0 fallas). Además, porque leen los archivos tocados: s3-tokens, s35, s36, s39 y s47–s52 verdes (s3-tokens se puso rojo con
la primera versión, que redefinía `--vidrio-reflejo` con otro valor: de ahí el token propio). Sin `verificar` completo.

**Las aserciones viejas que cambiaron:** ninguna.

`s53-pulido-2` §6: la pose (control: una sombra que no se va al apoyarse); el fundido (control: la sombra de un cuadro al
otro); el cableado (control: el fundido que se corta al soltar el final); «CONTACTO» (control: el especular de siempre en
el formulario).

## 4 · Lo que no quedó bien (o no pude resolver)

- **Nada se probó en un teléfono real** (1, 3 y 5): todo es del banco (Chrome emulando 390 × 844 y 768 × 1024, la NVIDIA).
  El tacto, el teclado de verdad y Safari quedan para vos (`mirar.txt`).
- **2 · los viajes:** el giro más grande de la cámara en un cuadro subió (a 390, de 5,6° a 10,2°; a 1440, de 9,1° a 9,6°).
  A 1440, Panel → Inicio dio una vez 30° en el primer cuadro (la escena volviendo de estar suspendida; aislado: 8,4°, 8,4° y
  17°, este después de un tirón en frío).
- **4 · la luz de abajo:** el final corre siempre de día, así que la luz se vio y se ajustó sólo de día. Su costo (+0,05 ms a
  375 en la NVIDIA) se midió antes de sumar la calma al sector (un `smoothstep` más por fragmento).
- **5 · el CTA:**
  - `capas` en el teléfono: en el primer ~30 % del recorrido no se ve nada (la copia aparece recién con el logo abajo) y las
    capas entran desde arriba. En escritorio, a la mitad, hay muchas copias de «HABLANOS» volando a la vez: se lee como
    repetición más que como una pila.
  - En escritorio, en algunos cuadros las letras pasan por delante del logo negro (`capas` y `relevo` a mitad de camino:
    negro sobre negro).
  - En el teléfono «Seis razones para elegirnos» queda dos veces en la página: la de la sección y la copia que se
    transforma (oculta para el lector de pantalla).
  - `tipo`: la letra fina (el peso 100) se extruye sin bisel (la deformación pide la misma triangulación en los dos pesos).
  - Sin bandera, con movimiento reducido en escritorio, el CTA de hoy sigue encima del logo: lo resolví para las variantes,
    pero el de hoy no lo toqué (el pedido era «sin bandera, el CTA de hoy»).
  - El banco: el servidor de desarrollo dejó de ver la carpeta `ctaDelFinal/` recreada (hubo que reiniciarlo) y el sistema lo
    cortó una vez por memoria. Además una tanda de cuadros de `cruce` a 1440 salió desfasada (el progreso leído era el de un
    scroll anterior) y la rehíce.
- **6 · los pendientes:** lo que entra con fundido es la intensidad de la sombra, no su forma: sigue saliendo de debajo del
  logo en cinco cuadros, pero tenue (en el primer cuadro afuera, ~3 % de la sombra). «CONTACTO» quedó en 4,98:1, con poco
  margen sobre AA, y medido sólo en el caso oscuro forzado a 768 (en el producto el vidrio toma el tono de la zona).
