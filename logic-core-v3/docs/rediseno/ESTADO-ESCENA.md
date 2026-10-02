# Estado de la escena — después de CALIDAD 1, ESCENA 9 y ESCENA 10

> Qué está encendido, qué banderas hay y qué hace cada una, los presupuestos, las **reglas de rendimiento que todo
> efecto nuevo tiene que cumplir (§4)** y las fallas conocidas. La escena vive en `src/app/v3/_lib/escena/`; las
> banderas, en `entorno.ts`. Las entregas medidas de cada sprint están en `~/.cache/b4-medicion/escena<N>/` y
> `~/.cache/b4-medicion/calidad1/` (con un `mirar.txt` por carpeta). CALIDAD 1: rama `rediseno/home`, un commit por
> punto; el informe es `docs/rediseno/CALIDAD-1.md`. ESCENA 9 (premium): un commit por ticket, las entregas en
> `~/.cache/b4-medicion/escena9/`. ESCENA 10 (el cierre de ESCENA 9, el video de Servicios y los títulos de volumen):
> un commit por ticket, las entregas en `~/.cache/b4-medicion/escena10/`; desde ahí todo banco mide con la NVIDIA
> (`BANCO_GPU=alta`). **Cierre de ESCENA 10:** la luz y las sombras (T1) y el video de Servicios (T2), aprobados por
> Valentino; los títulos de volumen (T3), aprobados para la etapa de 3D (pendiente, §7); el destello de un cuadro de
> día/noche al salir de Tu panel, arreglado en el orden del cuadro (§6), con su invariante con scroll real (§5).
> **Cierre de INTERFAZ 2:** la escena que responde a la interfaz (el pulso que pide un CTA, la onda de los valores, la
> sala detrás del menú del teléfono) y la vista previa del destino están en el producto, sin bandera (§1); de día se
> sacó la mancha de contacto (queda la sombra real del logo). El costo, contra b26c8c45: el mismo ritmo a 75 Hz y el
> mismo tiempo de GPU (`~/.cache/b4-medicion/interfaz2/cierre/costo/`).
>
> **3D Y SONIDO:** los títulos de volumen de ESCENA 10 están en el producto (T1 `92d345e8`, el negro satinado; el blanco con
> `?pruebas=titulos=blanco`), con la llegada aislada del navbar (§1, §7). La prueba que queda es el sonido (T2 `708aa941`,
> `sonido=si`: `ESTADO-INTERFAZ.md` §7). Las entregas, en `~/.cache/b4-medicion/3d-sonido/` (un `mirar.txt` por ticket
> y un `LEEME.txt`).

---

## 1 · Qué está encendido en el producto

| Pieza | Qué hace | Dónde |
|---|---|---|
| E1 · óculo y haz (nivel `sutil`) | Columna de luz sobre el logo y polvo del haz; el charco lo pinta el piso vivo. **[ESCENA 10] T1: sólo de noche** (de día casi no se veía: su nivel de día es cero), con la noche en el logo | `entorno/Haz.tsx`, `entorno/polvoVivo.ts` |
| E4 · el pulso | El principal y el hover; con el piso vivo el anillo es una ONDA del piso | `entorno/maquinaDelPulso.ts`, `piso/` |
| E6 · estela del polvo · E7 · el cursor | Como en ESCENA 6 | `entorno/polvoVivo.ts` |
| Sombra con física | La mancha de contacto la pinta el piso vivo. **[ESCENA 10] T1:** de día la blanda; de noche sólo la dura del haz (la blanda va a cero); con el haz apagado en su encendido, ninguna. **[Cierre de INTERFAZ 2]** de día tampoco la blanda (`dia.opacidad` 0): la sombra de día es sólo la real del logo | `ContactOcclusion.tsx`, `entorno/sombra.ts`, `sombra/sombraDelHaz.ts` |
| Moiré vivo (M1a + M2 + M3 + M4) | Como en ESCENA 6 | `moire/` |
| Polvo parejo, 5c, 5d | Como en ESCENA 6. 5a (el obstáculo) se borró en ESCENA 9 (T1) | `polvo/` |
| La formación («la fábrica gigante») | 6.839 copias negras en 59 filas, piso plano, niebla atrás (ESCENA 7, T2) | `formacion/` |
| El cielo de noche | 90.000 estrellas y la vía láctea, detrás de la trama y de la formación (ESCENA 7, T3) | `estrellas/` |
| La estrella fugaz | **[ESCENA 8] Encendida.** De noche, fuera del túnel, cada 5–10 s: una cinta con ancho en píxeles, del lado del cielo que el logo deja libre, detrás de la trama | `estrellas/Fugaz.tsx` |
| El polvo que se posa | Física por mota en la GPU (ESCENA 7, T4) | `polvo/Fisica.tsx`, `polvo/simulacion.ts` |
| El piso vivo | Un mar de bloques, con el techo del ojo (ESCENA 7, T5) | `piso/` |
| La inercia del aire (6a) | Tal cual (ESCENA 7, T6) | `polvo/Aire.tsx` |
| El obstáculo | **[ESCENA 9] T1: borrado.** El polvo en vuelo atraviesa al logo (el logo lo tapa), como antes de 5a: sin rodeo (ni su campo del flujo), sin contacto con la cara, sin deslizar, sin la holgura del bokeh ni la de tras el cursor, y sin bandera. Queda lo aprobado: con la página quieta, la mota que CAE y entra por una cara de arriba se posa ahí (contra el campo de la malla real, horneado una vez al cargar); con el despertar o el movimiento se levanta. La forma del logo en tres piezas (la leen el piso vivo y la fugaz) quedó en `formaDelLogo.ts` | `polvo/simulacion.ts`, `polvo/campoDelLogo.ts`, `polvo/formaDelLogo.ts` |
| La niebla de afuera | 6c + 6d (ESCENA 7, T8) | `niebla/rasante.ts`, `formacion/Formacion.tsx` |
| El haz se enciende | **[ESCENA 8] T1:** cuatro intentos que fallan (de siete: uno sí y uno no) en 1,94 s, el golpe y la luz firme | `entorno/encendido.ts` |
| El polvo nítido | Motas de 1,4 a 3,2 px con borde de un píxel (ESCENA 7, T10) | `polvo/nitidez.ts` |
| La luz que rebota | De noche el charco aclara la cara de abajo del logo (ESCENA 7, T12). Las sombras de las motas, borradas en ESCENA 8 | `entorno/Rebote.tsx` |
| **[ESCENA 8] T2 · la trama anclada** | Las dos capas bajan a pleno hasta 1 u debajo del piso (sin fundido): el piso las corta. La pared (capa gruesa) lleva un zócalo fino (0,1 u, opacidad 0,62) y el piso vivo un contacto al pie de cada capa | `moire/limite.ts`, `MoireScreen.tsx`, `piso/bloques.ts` |
| **[ESCENA 8] T3 · el amanecer** | Encendido (era la prueba T11 de ESCENA 7) y atado al scroll: el scroll pide el avance (borde de Tu panel del 85 % al escenario del final clavado) y el que se muestra lo persigue con tope (entero en 2,5 s como mínimo), en las dos direcciones. Sin evento al cargar adentro, en un viaje, con el bloque tapando; con menos movimiento, de una vez. El texto del escenario de Por qué develOP espera al día; el pie (compartido) fuerza el avance a 0,9 si se ve antes. **[ESCENA 10] Cierre:** decide su estado (la noche sostenida, el barrido, el frente) ANTES que el rig, con prioridad −1 (`ANTES_QUE_EL_RIG`); los haces, en un paso después del rig. En un viaje del menú que cambia de luz no corre (la sala la mueve el reloj del viaje) y al llegar va derecho al pedido | `amanecer/`, `_secciones/por-que-develop/PorQueDevelop.tsx` |
| **[CALIDAD 1] A2 · el cielo de día** | Encendido: el **pintado celeste** (T4 de ESCENA 8, elegido por Valentino), un ciclorama con nubes pintadas y paneles, en la franja del cielo de la noche, detrás de la formación y de la trama; se va con la noche antes de las estrellas y el amanecer lo destapa desde el horizonte. Sólo con la formación (no en el teléfono). **Rompe la regla monocroma: excepción aprobada** (abajo) | `cieloDeDia/` |
| Preloader de /v3 | Apagado (`CON_PRELOADER = false`) | `_intro/` |
| **[CALIDAD 1] B1 · el precompilado** | Todos los programas se compilan al arrancar (también lo invisible y las escenas aparte, como los rayos) y se calientan con un dibujo de un píxel: ninguno se compila en el recorrido | `gpu/Precompilar.tsx` |
| **[CALIDAD 1] B3 · la física en segundos** | Los modos que mueven motas integran con Euler exponencial: la misma trayectoria a 60, 75, 120 y 144 Hz | `polvo/simulacion.ts` |
| **[CALIDAD 1] B4 · sin saltos** | El peso de la mota suelta (en el modo) mezcla el corte del volumen del aire: nada aparece en el piso ni se va en el aire de golpe; el remolino no lanza las motas de abajo del piso; ninguna mota se pierde en NaN; la levantada que no puede volver al aire (cerca de las caras) se posa con la quietud | `polvo/simulacion.ts`, `polvo/volumen.ts` |
| **[CALIDAD 1] B5 · los rayos a media resolución** | En su propio búfer, la mitad del lienzo por lado; un cuadrado los suma | `amanecer/haces.ts` |
| **[CALIDAD 1] B6 · el polvo** | Ninguna mota bajo un píxel encendida entera; alfa premultiplicado | `polvo/nitidez.ts` |
| **[CALIDAD 1] B7 · antialiasing** | Los costados del logo con normales suaves hasta un pliegue de 40° (sin facetas); la sombra de la trama en el piso, prefiltrada | `cantosDelLogo.ts`, `estrellas/cielo.ts` |
| **[CALIDAD 1] B8 · dithering de ruido azul** | En todo lo que pinta degradados (una textura de 16×16) | `ruidoAzul.ts` |
| **[CALIDAD 1] B10 · el apoyo de las copias** | Una mancha de contacto instanciada en la base de cada copia de la formación | `formacion/armado.ts` |
| **[CALIDAD 1] B11 · la calidad adaptativa** | Si los cuadros no entran baja de a un escalón (motas con fundido, después dpr de a 10 %), con histéresis. El dpr cambia sólo con el scroll quieto: redimensionar el lienzo congela el hilo 30–60 ms | `gpu/adaptativa.ts`, `gpu/CalidadAdaptativa.tsx` |
| **[CALIDAD 1] B12 · lo que no se ve** | Las estrellas no se dibujan cuando ninguna puede verse | `estrellas/Estrellas.tsx` |
| **[ESCENA 9] T4 · los bloques de adelante hacia atrás** | Los bloques del piso vivo se dibujan de adelante hacia atrás desde la cámara (ocho órdenes por sector, armados al cargar; se cambia sólo al cambiar de sector): la GPU descarta lo tapado antes de pintarlo. La misma imagen salvo aristas compartidas (empates de profundidad) | `piso/ordenDeLosBloques.ts` |
| **[ESCENA 9] T4 · las cúpulas que no suman** | La de la vía láctea no se dibuja de día (ni en el túnel) y la del cielo de día no se dibuja de noche: las mismas condiciones que anulan su fragmento | `estrellas/Estrellas.tsx`, `cieloDeDia/CieloDeDia.tsx` |
| **[ESCENA 9] T4 · el aire, en segundos** | Decide si hay scroll con una retención de 50 ms (el scroll se mueve de a píxeles enteros): la misma deriva a 60, 75, 120 y 144 Hz | `polvo/Aire.tsx` |
| **[ESCENA 10] T1 · el logo de noche** | La variante «claro, borde blanco» de ESCENA 9 (T2): de noche los costados negros y las tapas con su gris y un filo casi blanco (10 unidades del SVG, 0,88 en pantalla); el amanecer guarda la noche con el mismo dibujo; de día no cambia | `logoDeNoche.ts` |
| **[ESCENA 10] T1 · el negro satinado** | La tinta con los reflejos de un estudio generado al cargar (PMREM) y rugosidad 0,3, en el `MeshStandardMaterial` de siempre (sin laca el físico daba el mismo reflejo); los reflejos siguen a la luz principal: de noche se apagan | `estudio.ts`, `LuzDelLogo.tsx` |
| **[ESCENA 10] T1 · la sombra del logo** | De día, la sombra de la principal sobre el piso vivo (mapa de varianza del logo solo, una lectura por píxel), sola desde el cierre de INTERFAZ 2 (antes, junto con la mancha de contacto); cuánto: la principal por el día en el logo (sin el corte al 3 % de la prueba) | `sombra/delLogo.ts`, `LuzDelLogo.tsx` |
| **[ESCENA 10] T1 · la noche en el logo** | `VIVO.uNocheDelLogo`: la noche de la sala, salvo en el amanecer, donde sigue de noche hasta que el frente del día alcanza al logo (la sala pasa a día de un cuadro al otro al empezar el barrido). La siguen el haz, su encendido, las manchas, la sombra del logo, el rebote y las motas del haz: el paso acompaña al día y al amanecer sin saltos (el mayor cambio entre dos cuadros del amanecer, 2,1 %) | `entorno/nocheDelLogo.ts`, `entorno/Entorno.tsx` |
| **[INTERFAZ 2] · la escena responde** | Un CTA con el puntero encima (o el foco) pide el pulso PRINCIPAL a la máquina de E4 (`EntradasDelPulso.pedido`, con la vigencia de 250 ms del canal; no a menos de 1,6 s de otro). Un valor de Por qué develOP hace ondear el piso vivo desde el logo hacia el piso que se ve debajo del valor (un término inyectado en la simulación y una banda en el dibujo). Con el menú del teléfono abierto la luz de la sala baja un 22 % (después de la noche disparada) | `interfaz/{pedidos,respuesta}.ts`, `entorno/maquinaDelPulso.ts`, `piso/ondaDirigida.ts`, `_chrome/escena/RespuestaDeLaEscena.tsx` |
| **[INTERFAZ 2] · la vista previa del destino** | El puntero o el foco sobre un ítem de la barra corre la luz hacia la del destino ADENTRO de su clase (`RIM_NIGHT_LEVEL` como frontera, el encendido del haz como juez) y gira la cámara 7° junto al del mouse; el viaje la descuenta con su avance (sin salto) | `interfaz/anticipacion.ts`, `OrbitRig.tsx`, `_chrome/escena/AnticipacionDelMenu.tsx` |
| **[ESCENA 10] T1 · el tono ACES compensado** | El color de ACES con la curva de brillo de Neutral (en un gris, Neutral exacto): el tono `Custom` de three, para todo el lienzo. Neutral como opción y AgX se borraron | `tono.ts`, `configuracionDelCanvas.ts` |
| **[ESCENA 10] T1 · el scroll de nk** | Lenis en modo `lerp` 0,1 sobre la instancia de /v3 (la construcción sigue con las opciones del sitio); el sedoso se borró | `_componentes/lenisDeNk.ts` |
| **[3D Y SONIDO] T1 · los títulos de volumen** | Los de ESCENA 10 (T3), en el producto: Portfolio y la frase de Por qué develOP, la Chivo extruida con el negro satinado del logo (el blanco, con `titulos=blanco`). En un viaje del menú ninguno llega (lo pedido es 0); al terminar, la llegada repetida del destino (el retoque 3 del navbar) trae las letras desde la profundidad con la cámara quieta; con el scroll, la de siempre. El DOM esconde su texto recién con el título armado y compilado (sin WebGL se lee el texto) y sólo desde 1024: abajo, ni se descarga el módulo | `titulos3d/`, `_lib/titulos3d/registro.ts`, `_componentes/titulos3d/TituloDeVolumen.tsx`, `PruebasDeLaEscena.tsx` |

### Excepciones aprobadas a DIRECCION-ESCENA (no «corregir»)

- **El celeste del cielo de día** ([CALIDAD 1] A2). La dirección de arte es monocroma (DIRECCION-ESCENA §4, la
  paleta); el cielo de día pintado lleva un celeste desaturado (`#C8D5DF` arriba, nubes blancas, sombra `#E1E6EA`,
  `cieloDeDia/nubes.ts`). **Es una decisión explícita de Valentino, no un error**: excepción aprobada. Medido en
  ESCENA 8: ningún texto baja de AA (mínimo 10,25:1); el texto sobre el cielo pierde hasta 17,5 % de contraste
  (Por qué develOP).

## 2 · Las banderas

`entorno.ts` resuelve UNA vez por carga: `ENTORNO` (el producto), o lo que el banco pida antes de
cargar con `window.__entornoDeLaEscena`. Con `producto` en la lista se parte del producto y se suman
las pruebas nombradas; sin él, sólo lo que la lista nombra; `base` es la escena de
`escena-base-limpia`.

### Del producto (se pueden apagar desde el banco para comparar)

| Token | Efecto |
|---|---|
| `moire=hoy` · `polvo=antes` | el moiré y el polvo de la base |
| `sombra=blanda` · `motas=no` · `sombra=quieta` · `haz=medio` | como en ESCENA 6 ([ESCENA 9] T1: `obstaculo=no` ya no existe) |
| `formacion=no` · `cielo=no` · `posarse=no` · `piso=no` · `inercia=no` · `niebla=no` · `encendido=no` · `nitidez=no` · `rebote=no` | sin cada pieza de ESCENA 7 |
| `fugaz=no` | [ESCENA 8] sin la estrella fugaz |
| `limite=no` | [ESCENA 8] T2 · la trama como en ESCENA 7 (flotando) |
| `amanecer=no` | [ESCENA 8] T3 · sin el amanecer (el día vuelve escondido, como antes de ESCENA 7) |
| `cielo-dia=no` | [CALIDAD 1] A2 · sin el cielo de día (queda el fondo de la bruma, como antes) |
| `orden-piso=no` | [ESCENA 9] T4 · los bloques del piso vivo en el orden de la grilla (el de antes) |
| `logo-noche=no` · `material=no` · `sombra-logo=no` | [ESCENA 10] T1 · sin el logo de noche claro, sin el satinado (el mate de antes) y sin la sombra del logo |
| `titulos=no` · `titulos=blanco` | [3D Y SONIDO] T1 · sin los títulos de volumen (el texto de antes) · con el material blanco, para comparar (también en la URL: `/v3?pruebas=titulos=blanco`) |

### Las pruebas (apagadas en el producto)

[CALIDAD 1] A2: el cielo de día pasó al producto en su variante pintado-celeste; las otras cinco (el pintado mono, y los
bloques y las partículas en los dos tonos) se borraron, código y banderas (`cielo-dia=<variante>-<tono>` ya no existe).

[ESCENA 9] Las de ese sprint, para que decidiera Valentino; con banco, en el pedido; **sin banco, en la URL**
(`/v3?pruebas=<token>`): sólo cambian las pruebas, el resto es el producto y no aparece ningún gancho del banco.
**[ESCENA 10] T1:** decididas. Pasaron al producto el logo de noche claro, el negro satinado, la sombra del logo, ACES
compensado y el scroll de nk (arriba); se borraron, código y banderas, `logo-noche=fino|grueso`, `material=brillante`,
`bloom` (y su capa y su cadena de niveles), `tono=agx` (y Neutral como opción), `lenis=sedoso` y `titulos=dom|webgl`
(con `_fuentes/chivo-400-latin.ttf`: los reemplaza T3 de ESCENA 10). Y el antialiasing de prueba (`aa=taa|msaa8`):
queda el del lienzo de CALIDAD 1, que ya estaba en el producto (Valentino); con él se borró el posproceso entero
(`gpu/posproceso.ts`: el búfer de la escena, el TAA y su gancho `__posprocesoDelBanco`).

[ESCENA 10] La de este sprint (con banco, en el pedido; sin banco, en la URL). **Cierre: le encantaron, pero van en
una etapa posterior (la de 3D).** Quedan con su bandera, apagados en el producto y sin borrar, las dos variantes
(`negro` y `blanco`): pendiente aprobado (§7). **[3D Y SONIDO] T1: al producto** (el negro; `titulos` dejó de ser una
prueba y es una bandera del producto, arriba). La prueba que queda es `sonido=si` (T2: el parlante y lo que suena;
`ESTADO-INTERFAZ.md` §7).

| Token | Efecto |
|---|---|
| ~~`titulos=negro` · `=blanco`~~ (al producto en 3D Y SONIDO) | T3 · los títulos de Portfolio y de la frase de Por qué develOP como objetos de la escena: la Chivo (OFL, la WOFF2 del sitio en 400, `_fuentes/chivo-400-titulos.json`) extruida, una malla por título, quieta en el mundo donde la cámara del momento de la lectura (medido: `LECTURA` en `_lib/titulos3d/registro.ts`) la ve en el lugar del DOM; las letras llegan desde atrás girando y se van igual, persiguiendo al progreso de la pieza con un mínimo de 1,4 s. De noche, el dibujo del logo (su emisión, costados negros, tapas claras con filo); el blanco de día, con un filo oscuro. El DOM conserva el texto (sr-only) y su lugar (invisible, sin anunciar). Un módulo aparte que sólo se descarga con la bandera (`escena/titulos3d/`, `PruebasDeLaEscena.tsx`) |

[INTERFAZ 2] Las de ese sprint (`responde`, `anticipa`, `vida`, `recorrido`) se borraron en el cierre: lo aprobado está
en el producto (§1) y `Pruebas` vuelve a ser sólo `titulos`. El detalle, en `ESTADO-INTERFAZ.md` §5.

Borrado en ESCENA 8 (código y banderas): el enfoque que busca, las fibras, el grano y la pasada de las
sombras de las motas (`polvo/sombras.ts`). La carpeta `pruebas/` no existe más.

### Ganchos del banco (sólo existen con `__entornoDeLaEscena`)

`__escenaViva`, `__relojDelBanco`, `__polvoDelBanco`, `__formacionDelBanco`, `__estrellasDelBanco`,
`__pisoDelBanco`, `__fisicaDelBanco` (modos, cámara lenta, `medir` GPU; [ESCENA 8] `campo()`; [CALIDAD 1] `estado()` y
`aire()` para el instrumento de los saltos; `flujo()` se borró en ESCENA 9 con el campo del flujo), `__aireDelBanco`, `__amanecerDelBanco` (`estado` con
`avance`, `pedido` y el día para el texto; `congelar(s)`; [CALIDAD 1] `haces()` y `tramaFiltrada(v)`; [ESCENA 10] cierre:
`destello()`, el control positivo del invariante del destello: el próximo cuadro, la noche sostenida al revés),
`__fugazDelBanco`, [ESCENA 8] `__cieloDeDiaDelBanco` ([CALIDAD 1] `dia`, `mostrar`), [ESCENA 9] `__sombraDelLogoDelBanco`
(`poner(prendida)`, `mapa()`; [ESCENA 10] `fuerza()`); T4: `__pisoDelBanco.orden(prendido, estricta)` (los bloques en el orden nuevo o en el de
la grilla). [ESCENA 10] T1: `__escenaViva` publica también `nocheDelLogo`; T3: `__titulosDelBanco` (`titulos()`: la
llegada, la salida, lo mostrado y la caja de cada título en el cuadro contra la del DOM; `camara()`: la viva contra la que
calcula la colocación; `progreso()`); `__logoDeNocheDelBanco`,
`__materialDelLogoDelBanco` y `__lenisDelBanco` se borraron con sus variantes. [INTERFAZ 2] `__respuestaDelBanco()` (lo que la
interfaz le suma a la sala: el menú y la anticipación) y `__pisoDelBanco.estado().onda` (la onda dirigida: cuándo nació,
su dirección y su fuerza). [CALIDAD 1]
`__gpuDelBanco` (el tiempo de GPU por objeto con nombre, la grabación por cuadro, los programas, `tres()`),
`__precompiladoDelBanco` (cuánto tardó el precompilado) y `__calidadDelBanco` (el escalón de la adaptativa;
arranca apagada con banco, `activa(true)`).

## 3 · Presupuestos (1440 × 900, medidos)

El producto entero (con todo lo de ESCENA 8 encendido): **19–20 llamadas, 108.946–108.947 triángulos, 171.231
puntos** en el último cuadro (ESCENA 7: 21–22 llamadas, 108.755 triángulos, 182.432 puntos: T0 borró la pasada de
las sombras de las motas); el cuadro, 13,34 ms (topado por el monitor de 75 Hz de la máquina de medición). Pasadas
que no son la escena, en la GPU: la física del polvo, ahora con el campo de la malla real (T5), 0,075–0,087 ms
(ESCENA 7: 0,063) y la simulación del piso vivo 0,013 ms. El campo del logo se arma UNA vez al cargar, fuera del
cuadro: 93 ms, 158 × 116 × 32 celdas de media precisión (1,1 MB de textura).

Cada ticket, como diferencia contra el producto en el momento donde se ve (lo encendido: producto menos
producto con `X=no`; la prueba: producto con la prueba menos producto):

| Ticket | Qué | Llamadas | Triángulos | Puntos | Cuadro medio (ms) |
|---|---|---|---|---|---|
| T0 | la fugaz, cruzando (noche con cielo) | +1 | +78 | 0 | 0 |
| T2 | la trama anclada: zócalo y contacto (hero) | +1 | +192 | 0 | 0 |
| T3 | el amanecer, clavado en los rayos (la mirada) | +1 | +960 | 0 | **+4,89** (p95 26,7) |
| T3 | el amanecer ya terminado (Por qué develOP, de día) | 0 | 0 | 0 | 0 |
| T4 | cielo de día pintado-celeste (Quiénes somos) | +2 | +9.025 | 0 | 0 |
| T4 | cielo de día pintado-mono (Quiénes somos) | +2 | +9.025 | 0 | 0 |
| T4 | cielo de día bloques-celeste (Quiénes somos) | +2 | +19.980 | 0 | 0 |
| T4 | cielo de día bloques-mono (Quiénes somos) | +2 | +19.980 | 0 | 0 |
| T4 | cielo de día partículas-celeste (Quiénes somos) | +2 | +9.024 | +143.000 | 0 |
| T4 | cielo de día partículas-mono (Quiénes somos) | +3 | +9.025 | +143.000 | 0 |

Cómo leerla: son los valores medidos, sin retocar. Entre dos cargas del mismo pedido el último cuadro varía
±1 llamada y ±1 triángulo: una diferencia de 1 no es una señal. T1 no tiene geometría (cambia el guion). T5 no
dibuja nada: su costo es la pasada de la física (arriba). El cuadro topado sólo se mueve con los rayos del
amanecer, que ahora es del producto: 18,23 ms de media y 26,7 de p95, las mismas cifras que en ESCENA 7 (el
monitor cuantiza el cuadro a 13,34 o 26,68 ms y el 37 % de los cuadros tardó dos refrescos las dos veces); fuera
de los rayos el amanecer no cuesta nada que se vea. Detalle y notas: `escena8/costo.txt`.

Reglas que siguen valiendo: sin EffectComposer en la escena (el posproceso propio de ESCENA 9 se borró en ESCENA 10); `dpr` a lo sumo 1,5; lo transparente
DoubleSide dibuja dos pasadas salvo `forceSinglePass`. El lienzo COMPONE el alfa que escriben los
materiales: un material opaco escribe alfa 1 (si no, bordes blancos contra el papel).

**[CALIDAD 1]** El costo de GPU por objeto se mide con `scripts-calidad/motor.ts pasadas` (sin vsync, por nombre de
objeto). Después de CALIDAD 1, a 1440 con dpr 1, el pico del amanecer cuesta ~11 ms de objetos (los rayos, 2,3 ms
con su composición; antes 7,9); a 375, el cuadro va de 0,98 a 2,28 ms. Las tablas base contra final están en el
informe.

**[ESCENA 9] T3 · el costo de las pruebas** (la AMD integrada, 1440, dpr 1: la GPU de todo lo que se dibuja por cuadro,
2 s por momento, `scripts-escena9/t3-costo.ts`; el producto: 8,7–8,9 ms de día, 6,4 de noche, 11,1 en los rayos; entre
dos cargas del producto, hasta 0,22 ms):

| Prueba | ms de GPU por cuadro |
|---|---|
| `material=satinado` | +0,0 a +0,2 |
| `material=brillante` | +0,1 a +0,5 (Quiénes somos, el logo de costado) |
| `sombra-logo` | +0,3 a +0,6 de día; 0 de noche |
| `bloom` | +1,4 a +1,6 de día (el búfer propio); +3,5 de noche |
| `aa=taa` · `aa=msaa8` | +3,5 a +4,6 · +3,7 a +4,5 |
| `tono=agx` · `tono=aces` | +0,5 a +1,0 · +0,2 a +0,6 |
| `logo-noche=grueso` | 0 |

**[ESCENA 9] T4 · la placa.** El Chrome del banco usa la AMD INTEGRADA por defecto (CALIDAD 1 y T3 se midieron ahí);
`BANCO_GPU=alta` pide la NVIDIA (`--force_high_performance_gpu`). [ESCENA 10] Después de un reinicio de la máquina, Chrome
usa la NVIDIA también por defecto (y ni `--force_low_power_gpu` lo lleva a la integrada: manda la preferencia de gráficos
de Windows): antes de rotular una medición con la placa, `scripts-escena9/t4-gpu.ts`. Después de T4, GPU por cuadro (p50, el recorrido
entero, `escena9/t4-fluidez/motor/`):

| | AMD integrada | NVIDIA RTX 5050 |
|---|---|---|
| 1440 | 6,04 ms (CALIDAD 1: 7,08) | 0,81 ms |
| 375 | 0,95 | 0,31 |
| 1440 con dpr 1,5 | 11,04 (antes 14,45) | 1,35 (antes 1,63) |

Cuadros perdidos con vsync a 1440 con dpr 1,5: AMD 356 → 139 (90 de Servicios); NVIDIA 80, todos de Servicios (el video
de muestra de la sección, ver §6; [ESCENA 10] T2: 0).

**[ESCENA 10] T1 · el producto después del cierre** (1440, NVIDIA, el último cuadro de cada momento): de día **23–24
llamadas y 138.532 triángulos** (antes 19–20 y 127.680: el mapa de la sombra del logo, las copias del logo y las dos
pasadas de su desenfoque); de noche 20–21 y 122.624 (la sombra no se dibuja). Lo que costaban en la integrada, en ESCENA 9
(arriba): el satinado +0,0 a +0,2 ms, la sombra +0,3 a +0,6 de día, ACES compensado +0,2 a +0,6.

**[ESCENA 10] T3 · los títulos de volumen (la prueba)**, en el medio de su lectura, contra el producto (NVIDIA, 1440,
`escena10/t3-titulos/costo-nvidia-1440.json`): Portfolio +6.524 triángulos, +1 a +2 llamadas, +0,04 a +0,20 ms de GPU
por cuadro; la frase (las dos mitades) +29.688 triángulos, +1 a +2 llamadas, +0,27 a +0,34 ms. Fuera de su lectura no
se dibujan.

**[3D Y SONIDO] T1 · los títulos en el producto** (NVIDIA, 1440, en el medio de cada lectura, contra `titulos=no`;
`3d-sonido/t1-titulos/costo-NVIDIA-1440.json`): Portfolio +6.524 triángulos y +1 llamada, los títulos 0,03 ms de GPU por
cuadro; la frase +29.687 y +1, 0,18 ms (el blanco, 0,23). Dentro del presupuesto de §4.

## 4 · Reglas de rendimiento: lo que todo efecto nuevo tiene que cumplir ([CALIDAD 1] B13)

1. **Todo en segundos, nunca en cuadros.** Lo que se mueve integra con el `dt` del cuadro, acotado contra los
   tirones (`Math.min(delta, 1 / 30)` o 0,1): los amortiguadores con `1 − exp(−dt/τ)`, la física con Euler
   exponencial (`relajar` en `polvo/simulacion.ts`), lo periódico con el reloj, los pasos fijos con su acumulador. Se
   prueba igual a 60, 75, 120 y 144 Hz (s34 B3 tiene el molde; [ESCENA 9] `scripts-escena9/t4-hz.ts` corre la página
   entera con un reloj virtual). Lo que se decide por «cambió el scroll en este cuadro» se sostiene en segundos: el
   scroll se mueve de a píxeles enteros y a 144 Hz la cola de Lenis no cambia de píxel en cada cuadro (el aire, T4).
2. **Precompilado.** Todo programa nuevo se compila al arrancar: si va en la escena, `Precompilar` lo compila y lo
   calienta aunque esté invisible; si se dibuja aparte (su propia escena o su búfer), se registra en `ESCENAS_APARTE`.
   Se verifica con `motor.ts programas`: `tarde` tiene que quedar vacío.
3. **Cero reservas por cuadro.** En `useFrame` y en los manejadores de scroll: nada de `new`, `clone`, arreglos,
   objetos, `map`/`filter`/`forEach` ni cierres. Lo que se usa por cuadro se arma una vez (marcado `// una vez`; lo de
   banco, `// banco`); las máquinas de estado devuelven EL MISMO objeto si nada cambió; React sólo cuando algo cambia
   (nada de `setState` por cuadro). El detector de s34 B2 revisa todos los `useFrame` de la escena.
4. **Presupuesto.** Medido con `motor.ts pasadas` en el momento donde se ve: a 1440 con dpr 1, **menos de 0,5 ms** de
   GPU; a 375, **menos de 0,2 ms**; y el cuadro de 375 no pasa de **3 ms** en esta placa en el momento más pesado. Lo que
   cubre la pantalla entera y hace una cuenta cara por píxel (rayos, volúmenes) va a menos resolución en su búfer
   (el molde es `amanecer/haces.ts`).
5. **Lo que no se ve, no se dibuja.** `visible = false`, no alfa 0 ni tamaño 0: el vértice corre igual (las estrellas
   de día costaban 0,34 ms sin pintar un píxel).
6. **Con nombre.** Todo lo que se dibuja lleva `name` (el perfil de la GPU agrupa por nombre; s34 B0 lo revisa).
7. **Sin saltos.** Lo que aparece o se va lo hace con un fundido (en el tiempo o en el espacio), nunca de un cuadro al
   otro; lo que queda más chico que un píxel se apaga con su área (B4, B6).
8. **Degradados con dithering.** Un material nuevo con degradados: `dithering: true` (los de three) o
   `conDithering(material)` (los propios). Nada de arreglos constantes grandes indexados en un shader: a Direct3D le
   cuestan más de un segundo por programa (B8 lo midió); si hace falta una tabla, una textura.
9. **Que aguante la calidad adaptativa.** El dpr puede bajar a 0,7 veces el tope y las motas al 65 % (B11): el efecto
   tiene que verse bien ahí. Y nada redimensiona el lienzo ni sus búferes en medio del scroll: cuesta 30–60 ms de hilo.
10. **Los colores canónicos no se mueven.** El piso, el papel y el cielo en reposo, ΔE < 2 contra lo aprobado; un cambio
    de color de salida se mide con `scripts-calidad/b9-tono.ts`. [ESCENA 10] T1: el tone mapping es ACES COMPENSADO (la
    elección de Valentino en ESCENA 9): en un gris da Neutral exacto, pero corre los blancos cálidos del papel y del piso
    ΔE 2,0–2,7 (medido en ESCENA 9, `t3-tono`): la excepción es de la elección, no un defecto a corregir.

## 5 · Los invariantes

`npm run test:s40-3d-sonido` ([3D Y SONIDO] una sección por ticket con sus controles: la máscara de las fotos desde
un punto, los títulos en el producto con el viaje y el DOM, el sonido),
`npm run test:s38-interfaz2` ([INTERFAZ 2] la escena que responde a la interfaz, en el producto desde el cierre: el pulso
pedido, la onda dirigida, la luz con el menú, la anticipación del destino; y lo del cierre: el cartel, el infinito, la
sombra de día; una sección por ticket con sus controles positivos),
`npm run test:s36-escena10` ([ESCENA 10] una sección por ticket, con sus controles positivos; la del cierre: el orden
del cuadro y el viaje que cambia de luz),
**`npm run test:escena-destello`** ([ESCENA 10] cierre · el destello de un cuadro, **con scroll real**: la rueda por CDP
y Lenis, Tu panel → Por qué develOP ida y vuelta a tres velocidades y tres viajes del menú que cruzan el final; ningún
salto de luminancia entre dos cuadros seguidos fuera del barrido y ningún destello —de 1 a 12 cuadros que se salen del
rango de sus vecinos— en lo que se ve; sin verde por no llegar; control positivo por el camino del defecto. **Pide el
servidor de desarrollo y una placa** (`BANCO_GPU=alta`): por eso no tiene la forma `test:sNN-…` y `verificar` no lo
corre. Unos tres minutos),
`npm run test:s35-escena9` ([ESCENA 9] una sección por ticket; ajustada a lo que ESCENA 10 decidió),
`npm run test:s34-calidad1` ([CALIDAD 1] una sección por punto, A1 a A3 y B0 a B12, con sus controles positivos; A1,
ajustada al cierre de ESCENA 10: los viajes que cambian de luz ya no siguen la regla de antes),
`npm run test:s33-escena8` (una sección por ticket, T1 a T5, con sus controles positivos),
`test:s32-escena7` (lo de ESCENA 7 que sigue; ajustado a lo que ESCENA 8 cambió), `test:s31-escena6`,
`test:s28-base`, `test:s29-pulso`, `test:s30-escena4`, y los de siempre (`s8-escena`, `s16-arnes`, `s18`,
`s20`, `s22`, `s23`, `s24-dia`, `s8-intro`, `s7-mezcla`, `s6-por-que-develop`, `s27-viajes`).

Los bancos de ESCENA 8 (`scripts-escena/`, contra el servidor de desarrollo, un Chrome propio por CDP y el
candado de Chrome): `banco8` (la carpeta), `rapido8` (los momentos), `amanecer8` (la sonda del avance, los
clips, los momentos congelados y el contraste del texto en un tirón reproducido congelado), `obstaculo8` (el
scroll fuerte y el conteo de pegadas), `cielo8` (las variantes del cielo, el texto y el logo con y sin cielo,
el amanecer con cada cielo), `clips8` (el haz con su curva de luz; los clips quietos del cielo), `costo8` y
`hojas8`.

[CALIDAD 1] Los bancos del motor (`scripts-calidad/`, con su propio Chrome por CDP): `motor.ts` (el recorrido a
velocidad constante por partes: `gpu` y `pasadas` sin vsync, `ritmo` con vsync, `cpu`, `memoria`, `programas`, `traza`,
`reservas`; va a `calidad1/motor/<etiqueta>/`), `tabla.ts` (la tabla, con otra etiqueta al lado), `saltos.ts` (los
saltos del polvo con el estado real de la física), `fluidez.ts` (el recorrido grabado con el instante de cada cuadro y
sus cuadros por segundo encima, y los lado a lado), `momentos.ts` y `hojas.ts` (los cinco momentos y sus hojas), y uno
por punto (`b3-tabla` a `b11-tirones`).

[ESCENA 9] Los bancos del sprint (`scripts-escena9/`, los mismos instrumentos): `t1-obstaculo` (el scroll fuerte y el
despertar con el logo al doble, y cuántas motas hay contra la cara de la malla real cada 250 ms), `mismo-cuadro` (la
escena dibujada una vez por variante en una sola tarea, leída del lienzo), `t2-logo-noche` (las variantes del logo de
noche en el mismo cuadro, los clips y la prueba abierta por URL), `t3-tono` (el tono pedido crudo, con exposición y
compensado, en el mismo cuadro; el ΔE de los colores canónicos), `t3-mismo-cuadro` (material, sombra y bloom),
`t3-titileo` (el titileo de las aristas con 4 y 8 muestras y con TAA, con la cámara corriéndose de a poco), `t3-costo`
(la GPU por cuadro de cada prueba) y `t3-clips`; T4: `t4-gpu` (qué placa), `t4-orden` y `t4-orden-imagen` (el orden de
los bloques: la GPU y la imagen en el mismo cuadro), `t4-invisibles` (las cúpulas), `t4-hz` (el reloj virtual),
`t4-lenis` (las curvas y los clips contra nk.studio) y `t4-servicios` (la traza y los sospechosos); T5: `t5-clips` (la
llegada de cada variante en las dos secciones, con y sin movimiento reducido). `motor.ts` escribe
en otra carpeta con `RAIZ=`; `tabla.ts` lee de ahí (`RAIZ`, `ANCHOS`, `PLACA`); `fluidez.ts` graba otras comparaciones
(`RAIZ`, `PEDIDO`, `LADO`); cualquier banco mide con la NVIDIA con `BANCO_GPU=alta`.

[ESCENA 10] Los bancos del sprint (`scripts-escena10/`, los mismos instrumentos, con la NVIDIA): T1: `t1-momentos` (los
cinco momentos del producto que esté en el servidor, con un rótulo, y la hoja antes/después), `t1-pasos` (el anochecer y
el amanecer grabados, recortados al logo y al piso) y `t1-sonda` (la noche de la sala y la del logo, el encendido y la
fuerza de la sombra, cada segundo); T2: `t2-servicios` (los cuadros perdidos por pasada en Servicios y la frenada),
`t2-tamano` (de qué tamaño se ve el video), `t2-sonda` (el estado de cada video, quieto) y `t2-clip`; T3: `t3-fuente.py`
(la Chivo a geometría), `t3-lectura` (en qué progreso de la coreografía se lee cada título), `t3-sonda` (la caja del 3D
contra la del DOM; `PUNTERO=centro` saca el corrimiento del mouse), `t3-camara` (la cámara viva contra la calculada),
`t3-costo` y `t3-clips`. Cierre: `destello.ts` (el banco del destello: cada cuadro dibujado, con su instante, leído del
lienzo en la misma tarea en que se dibuja —luminancia en 30 × 8 celdas y una miniatura— y lo que la escena decidió en
ese cuadro; tramos `final-<velocidad>`, `noche-<velocidad>`, `viajes` y `control`), `destello-instrumento.ts` (el
instrumento y los dos detectores, los que usa el invariante) y `destello-clip.ts` (antes/después cuadro a cuadro).

## 6 · Fallas conocidas (no son de ESCENA 8 ni de CALIDAD 1)

- ~~**[ESCENA 10, lo vio Valentino] Un cuadro de día entre cuadros de noche saliendo de Tu panel**~~ → **arreglado en el
  cierre.** Era el orden del cuadro: la compuerta del día (85 %) se prende en el evento de scroll, el rig lee en su
  `useFrame` la noche que sostiene el amanecer, y el amanecer la escribía DESPUÉS (su `useFrame` iba más abajo en el
  árbol). En el cuadro en que se prendía la compuerta el rig leía la del cuadro anterior (apagada) y dibujaba la sala de
  día entera, con la sombra del logo de T1; lo mismo volviendo, al cruzar el cambio, y al empezar el barrido un cuadro de
  noche oscurecido. Medido con la rueda (NVIDIA, 1440): saltos de 0,83 y 0,76 de luminancia media a la vista (lo demás,
  0,010 a lo sumo); después, 0 en las tres velocidades. Ahora el amanecer decide antes que el rig (`Amanecer.tsx`, «El
  orden del cuadro»). Revisado también: la frontera de la noche (Quiénes somos → Trabajos) no lo tenía; los viajes del
  menú que cruzan el final y cambian de luz tenían otro de la misma familia (el amanecer corría a la velocidad del vuelo
  sobre una luz que mueve el reloj del viaje: Por qué develOP → Trabajos oscurecía la sala de día en 9 cuadros y volvía
  al día de golpe), también arreglado. Las entregas: `escena10/destello/mirar.txt`.
- **`s17-revelado`**: 1 falla, ya estaba antes de ESCENA 5. Busca una llamada que se mudó a
  `ataduraAlScroll.ts` en VIAJES.
- **`s5-trabajos`** (1 falla: la pastilla del cartel), **`s6-tokens`** (3: valores sueltos y arbitrarios en
  `PorQueDevelop.tsx` y `PiezasDeContacto.tsx`, del 24-09) y **`s7-compuerta`** (pide un build de producción): ya
  estaban antes de ESCENA 10. `s7-contrato` (`piezas.tsx` en 301 líneas de código por T3) se arregló en el cierre.
- **`s8-tres` y el bundle**: piden un build de producción (`.next`) y no se corre mientras el servidor
  de desarrollo usa esa carpeta.
- **`s10-raf` y `s11-frontera`**: 0 fallas, pero 2 afirmaciones de cada uno quedan «fuera de
  ventana» (dependen del entorno de medición).
- El banco: la pestaña puede quedar oculta (el banco reintenta `bringToFront`); el mouse real del
  usuario mueve el punto rojo y E7 si pasa por la ventana del banco.
- **[CALIDAD 1, hallado]** Cuando la escena se suspende (frameloop `never` detrás de Servicios) r3f corre un último
  cuadro con el timestamp del navegador (ms) como reloj en segundos, y al reanudar el reloj vuelve a 0: las conchas del
  polvo saltan (226 rad en ese cuadro). Pasa con la escena tapada (verificado con capturas), así que no se ve.
- **[CALIDAD 1, hallado]** La escena sigue dibujando unos cientos de píxeles de scroll adentro de Servicios, ya tapada
  por la sección opaca, antes de suspenderse.
- ~~**[ESCENA 9, hallado] Servicios pierde ~80 cuadros por pasada con cualquier placa y dpr**~~ → **[ESCENA 10] T2:
  0.** Era el video de muestra de la sección, andando en medio del scroll. Ahora se pausa mientras el scroll se mueve y
  vuelve a andar desde el mismo cuadro a los 180 ms de frenar (`_secciones/servicios/VideoDeServicio.tsx`, con el aviso
  compartido de `_lib/scrollEnMovimiento.ts`), y va recodificado a 25 cuadros por segundo (divide los 75 Hz) y a
  960 × 600 (la menor resolución que se ve igual a 1440; 887 KB). Medido con la NVIDIA, dpr 1 y 1,5: de 74–80 cuadros
  perdidos por pasada a 0 (`escena10/t2-video/`). La integrada no se pudo medir: después de un reinicio el Chrome del
  banco usa la NVIDIA aunque se le pida la de bajo consumo (la preferencia de gráficos de Windows manda). Cómo codificar
  el de verdad: `docs/rediseno/VIDEO-DE-SERVICIOS.md`. La tabla final del sprint: `escena10/tabla-final.txt`.
- **[CALIDAD 1, hallado]** La primera carga después de CUALQUIER cambio de shaders los compila en frío: ~1,25 s de
  calentar dentro del precompilado, al cargar (Direct3D arma el ejecutable en el primer dibujo). Desde la segunda carga
  (en la misma sesión del banco o en otra, con el mismo perfil) Chrome los encuentra en su caché: 16–19 ms de compilar y
  79–125 de calentar. Un banco que mide la carga tiene que decir si es la primera después de un cambio.

## 7 · Lo que quedó abierto (para decidir)

- **PENDIENTE · la compuerta del amanecer** ([CALIDAD 1] A4: anotado, no se hace). El amanecer arranca cuando el
  borde de abajo de Tu panel deja ver el 85 % del cuadro (`AMANECER.visible`), así que con un scroll lento lo primero
  del evento (se apagan las estrellas, nace el resplandor en el horizonte) pasa con Tu panel tapando el cielo. Verlo
  entero pide un tramo de sala sin texto entre Tu panel y Por qué develOP: **es un cambio de layout** (la tabla de
  secciones), no de la escena. Queda para un sprint de layout. El costo de los rayos es del producto mientras duran:
  CALIDAD 1 (B5) lo bajó de 7,9 a 2,3 ms de GPU a 1440 (de 17,8 a 5,1 con dpr 1,5).
- **[CALIDAD 1] Lo que no se hizo del sprint, con su porqué** (detalle en `CALIDAD-1.md`): el tamaño de las motas por
  perspectiva real (el real supera el tope en foco a toda distancia visible: agrandaría las motas), AgX o ACES (corren
  los colores canónicos más de ΔE 2), mapas de sombra en tiempo real (serían sombras proyectadas nuevas), el titileo
  de las aristas de geometría (es el límite del MSAA de 4 muestras: pide TAA o más muestras) y los recortes del
  teléfono (sin un teléfono para medir; el menú está en `calidad1/b12-telefono/`).
  → [ESCENA 9] T3 los probó con bandera (abajo).
- ~~**[ESCENA 9] T3, T4 y T5 · por decidir**~~ → [ESCENA 10] T1: decididas (§1 y §2), el antialiasing también: el del
  lienzo de CALIDAD 1 (TAA no).
- ~~**PENDIENTE APROBADO · la etapa de 3D: los títulos de volumen**~~ → **[3D Y SONIDO] T1: en el producto** (el
  negro; §1). Lo que sigue (propuesto, no construido; `3d-sonido/t1-titulos/propuesta/`, con capturas simuladas): el
  Cierre sí («Lo que sigue lo armamos con vos», con la escena a la vista), Quiénes somos quizás (su énfasis habría que
  rehacerlo en 3D), Tu panel y Servicios no (secciones opacas: la escena no se dibuja ahí). Lo que decía antes:
  **PENDIENTE APROBADO · la etapa de 3D: los títulos de volumen** ([ESCENA 10] T3). A Valentino le encantaron; van en
  una etapa posterior. Quedan como están: con su bandera (`titulos=negro`, `titulos=blanco`), apagados en el producto y
  SIN borrar (el módulo perezoso `escena/titulos3d/`, `_componentes/titulos3d/`, `_lib/titulos3d/registro.ts`, la
  fuente `_fuentes/chivo-400-titulos.json` y su lugar en Portfolio y en la frase de Por qué develOP). Lo que queda por
  decidir en esa etapa: la variante (negro o blanco); que no proyectan sombra en el piso; que abajo de 1025 no hay (las
  secciones no tienen escenario). Costo medido: §3. Qué mirar: `escena10/t3-titulos/mirar.txt`.
- **[ESCENA 10] Aprobados:** la luz y las sombras según el momento (T1) y el video de Servicios (T2).
- **El pie y el amanecer**: el pie es compartido y no espera al día; si se llega antes de tiempo (un tirón de
  más de cuatro pantallas, o Fin) el amanecer salta a 0,9 para que su tinta se lea.
- ~~**El cielo de día (T4)**: por elegir~~ → [CALIDAD 1] A2: el pintado celeste, encendido (excepción aprobada, §1).
- ~~**El pegado (T5)**~~ → [CALIDAD 1] A3: borrado (el modo 6); queda sólo el flujo, que pasa por los huecos del logo.
  → [ESCENA 9] T1: el flujo también, y todo el obstáculo; queda el polvo que se posa sobre el logo con la página quieta.
- La licencia de Book of Shapes (`LICENCIA-BOOKOFSHAPES.md`) cubre los SVG descargados, no el código.
