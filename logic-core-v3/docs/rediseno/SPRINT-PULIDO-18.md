# SPRINT PULIDO 18 — El plasma A como producto + la dimensión espejo

Rama `rediseno/home`. Invariante nuevo: `npm run test:s69-pulido-18` (`src/app/v3/_lib/__tests__/s69-pulido-18.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base), `~/.cache/b4-medicion/pulido-17/_scripts/` y
`~/.cache/b4-medicion/pulido-18/_scripts/` (los de este sprint). Recibos: `docs/rediseno/entregas/pulido-18/`.
El modelo del plasma: `docs/rediseno/PLASMA.md`. La dimensión espejo: `docs/rediseno/DIMENSION-ESPEJO.md`.

Decisiones del humano (no se discuten):
- El plasma A gana: pasa a ser el DEFAULT del sitio. El polvo viejo queda en `?energia=polvo`; `?energia=plasma-y-polvo` sigue.
- C se borra con su código. B se queda en su bandera hasta que exista el efecto de cristal de P2 (de ahí sale).
- P1 (A como producto, todo obligatorio): a) el piso es un límite real y las partículas son blandas (el halo se desvanece por
  profundidad contra cualquier geometría, con el búfer de profundidad); el reflejo tenue en el piso si entra. b) Viven en el
  MUNDO: nunca hijas del logo ni de un volumen que lo siga; el logo es fuente de fuerza y de arcos. c) De día se tienen que ver, y
  bien (energía oscura, distorsión de calor, contraste local: se elige con el banco). d) Más partícula, menos nube (núcleos chicos y
  nítidos, halo corto, tamaños por ley de potencia, intensidades variadas, una cruz MUY chica en las más calientes). e) Física
  mejor (convección, pinch de los arcos, estela del puntero, viento del scroll; estable, contenido, sin figuras).
- P2 («dimensión espejo»): efectos de CRISTAL en el FONDO (cielo, domo, moiré), nunca sobre textos ni deformando el logo o los
  títulos. Investigar y escribir `DIMENSION-ESPEJO.md`; al menos cuatro efectos atrás de `?espejo=` (cristalizar, pliegue,
  caleidoscopio, ecos y uno propio); tres disparos (ambiente, scroll, interactivo); monocromo (los bordes prismáticos sólo con
  `?espejo-prisma=si`); un solo pase compartido si hace falta el color de la escena; sin bloom; precalentado; con movimiento
  reducido, sin efectos.
- `lente.ts` fuera de los commits.

El humano puede no estar: ante una ambigüedad, la lectura más razonable, anotada acá, con la alternativa atrás de una bandera.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### Arranque
- Árbol limpio (sólo `lente.ts` y los sin seguimiento de siempre). Disco: 81 GB libres. Memoria disponible: **1089 MB** (el
  Chrome propio del humano ocupa varios GB; no se toca) → sin banco hasta que haya 3 GB; se avanza con lo que no lo necesita.
  No paginado 934 MB. Sin dev server, sin servidor de medición, sin Chrome del banco.

### P1.0 · El default: el plasma A; `?energia=polvo`; C se borra
- HECHO · VISTO no (memoria disponible 1,2–1,5 GB: sin banco; VERIFICAR con el banco en cuanto haya 3 GB o TRAS REINICIO).
- `entorno.ts`: `energia` pasa a ser `'polvo' | 'plasma-y-polvo' | 'no'` (sin la bandera, el producto: el plasma; `energia=plasma`, la
  de antes, se lee igual); `plasma` pasa a `'a' | 'b' | 'no'` (`plasma=c` se lee como sin bandera). Sigue siendo una prueba suelta
  (`?energia=polvo` en la URL). La base limpia también monta el plasma: no es una idea del entorno (como el final del pie o los
  títulos, va en las dos; s30 afirma que la base no trae pruebas).
- `ProbeStage.tsx`: `conPolvo = energia !== 'no'` (el polvo y el bokeh, sólo pedidos) y `conPlasma = energia !== 'polvo'`.
- C, borrada con su código: la dirección (`direcciones.ts`), su estilo `estela` (`dibujo/particulas.ts`; la estela por la velocidad
  sigue en `uMovida.x`), la superficie del logo en la simulación del enjambre (`uSuperficie`, nacer en el logo, la banda) y la
  uniforme `uLogo` que sólo usaba ella. B queda igual, en su bandera.
- La física del polvo (`polvo/Fisica.tsx`) sigue montada aunque el polvo no se dibuje: hornea el campo del logo que usa B (y la
  medición de PULIDO 17 con `?energia=plasma` ya la incluía). Anotado: si no la necesita nadie más, apagarla sin polvo ahorra GPU.
- Invariantes: s66, s68 y s52 (abajo, antes/ahora/por qué); s69 · P1.0 (el producto, el polvo pedido, los dos, la bandera vieja
  leída como el producto, B, C que no vuelve; con sus controles positivos).
- Compuerta: tsc en verde; lint de los tocados sin errores; las 50 suites que leen lo tocado, en verde (s8-montaje con sus 2 de la
  base: los seis archivos largos de siempre).

### P1.b · Independientes del logo (viven en el mundo)
- HECHO · VISTO no (sin banco por la memoria: VERIFICAR la secuencia «logo bajando» con el banco).
- Todo en el MUNDO: las brasas, el enjambre de B, los arcos, sus luces, los efectos, el puntero y el piso (`FLOOR_Y`, no relativo al
  logo). Los sombreadores ya no le suman el centro del logo a ninguna posición.
- La cáscara (radio 13) es del mundo, quieta alrededor del origen (el lugar de reposo del logo). El logo sólo influye: su HUECO
  (4,2) es un obstáculo donde esté (si baja, las aparta al pasar; no se las lleva), sus ONDAS (el pulso) y su golpe salen de donde
  está, sus ARCOS nacen en su borde y la FUENTE (el brillo cae lejos del logo) y la cara libre se miden desde él. Al cargar, el logo
  cae desde 14 u: la nube lo espera abajo, tenue (lejos de la fuente), y se enciende cuando el logo llega.
- `brasas.ts` pasaba las 300 líneas: se partió (`paso.ts`, el paso y la integración; `afuera.ts`, el puntero, las ondas, la
  agitación, la cáscara y el hueco). s68 mira los dos en su lugar nuevo (módulos y funciones de cada cuadro).
- s69 · P1.b: el logo baja 3 u y el centro de la nube se mueve 0,02 u (el control, la nube que baja con el logo); donde queda el
  logo, ninguna brasa adentro de su hueco; la onda del logo calienta a 2 u del LOGO y su hueco empuja desde donde está (el control,
  medido desde el origen); los sombreadores y el cuadro en el mundo (el control, el de antes). s68: el golpe del pie, una onda desde
  el logo en el mundo (antes, desde el origen de sus coordenadas).
- Compuerta: tsc y lint en verde; las 50 suites, en verde (s8-montaje con sus 2 de la base).

### El mini-banco (mientras no hay memoria para el banco del sitio)
- Sin 3 GB libres no hay build de medición ni banco. Para no avanzar a ciegas: un MINI-BANCO fuera del repo
  (`scratchpad/p18/sombreadores/`): el plasma real (su armado, su cuadro, su física, sus sombreadores y el pase) empaquetado con
  esbuild en una escena chica (un piso de papel con juntas, un logo de reemplazo, la luz del estudio, el tono ACES compensado) y
  dibujado en un Chrome sin ventana con su propio perfil (~250 MB). Saca la captura y junta los errores del compilador. Vistas:
  ancho (26 u), cerca (9 u), piso; noche y día; calor forzado; un arco forzado. NO es el sitio (sin la trama, el cielo, el piso
  vivo, los títulos): lo de la escena real queda para el banco.

### P1.a · El piso (límite real), partículas blandas (profundidad) y el reflejo en el piso
- HECHO · VISTO en el mini-banco (el sitio, pendiente).
- EL PISO, UN LÍMITE REAL (`BRASAS.piso`): ninguna baja de 0,85 u sobre el piso (por encima de la cresta más alta del mar y del
  bloque que levanta el cursor); en la banda de 1,6 u sobre ese mínimo un colchón las levanta (2,4 u/s², creciente hacia abajo), lo
  que bajan se frena (5/s) y lo de costado roza (0,9/s): se deslizan y casi no se acercan. Nacen arriba. El enjambre de B, igual.
  Medido (s69): 8 s con el campo y un pulso desde arriba cada 2 s, ninguna debajo del mínimo y ninguna pegada a la banda.
- PARTÍCULAS BLANDAS con el búfer de profundidad: EL PASE COMPARTIDO (`escena/pase/`): una pasada a media resolución de lo opaco
  (las capas: lo que escribe profundidad, más las luces), con la cámara del cuadro, montada ÚLTIMA en el escenario (su cuadro corre
  después de todos y antes de que r3f dibuje). El destino se declara «como la pantalla» (`isXRRenderTarget`: el mismo tono y espacio
  de color) y lleva las mismas luces: ningún programa nuevo. Primero la probé anidada (en el `onBeforeRender` de una malla): el estado
  de las luces de la pasada anidada es otro y three rearmaba los parámetros de cada material en cada cuadro; fuera del cuadro no. La
  partícula se desvanece contra lo opaco en su propio ancho del mundo (`vSuave`); los arcos, en 0,15 u.
- EL REFLEJO TENUE (`dibujo/reflejos.ts`): de noche, las chispas a menos de 2,6 u del piso se ven espejadas debajo, más anchas y
  tenues (el papel es mate), titilando con su chispa; sólo donde lo que se ve es el piso (la profundidad: el logo o el pie delante lo
  tapan) y no sobre un texto. Un dibujo más con los mismos atributos, sin física.

### P1.d · Más partícula, menos nube
- HECHO · VISTO en el mini-banco (el sitio, pendiente).
- EL NÚCLEO, CHICO Y NÍTIDO: su radio tiene un tope (1,3 px, `uNucleo`); el tamaño de la chispa lo lleva el halo, corto (2 núcleos,
  0,14). Casi sin desenfoque (0,06 px por u, hasta 1,5: era el bokeh de 0,3 y 6) y un tope de 3,2 px.
- LOS TAMAÑOS, por una LEY DE POTENCIA (una Pareto truncada entre 0,012 y 0,08 u, exponente 2,3): la mediana, 1,35 veces la más
  chica; más de 3 veces, el 7 % (antes un tercio). Las intensidades varían (de 0,35 a 1, muchas tenues y pocas fuertes).
- LA CRUZ MUY CHICA (7 px, dos rayos finos en la pantalla) sólo en las más calientes y al destellar fuerte.
- LOS ARCOS: en el mini-banco se vio que la cinta del halo se plegaba en los quiebres del camino (de cerca, esquirlas blancas) y que
  la luz que corre dibujaba rayas de través en el halo (una espina de pescado). El halo pasó a PUNTOS suaves a lo largo del camino
  (el patrón del repo para el brillo: sprites aditivos), con su peso por lo que avanza hasta el siguiente punto; la luz que corre,
  sólo en el núcleo (la cinta fina, que no se pliega). A distancia normal: un rayo de verdad (núcleo nítido, halo, rama, el toque).

### P1.c · De día
- HECHO · VISTO en el mini-banco (el sitio, pendiente; la elección final entre las tres opciones, con el banco).
- LAS TRES OPCIONES, juntas y en uniformes (cada una se apaga sola para comparar): un CUERPO OSCURO nítido (el núcleo, 0,6) con un
  VELO tenue alrededor (0,22) y un ESPECULAR mínimo corrido hacia la luz principal (arriba a la izquierda), sólo en los cuerpos que se
  ven grandes; el CALOR de las calientes: refracta lo de atrás (la copia del cuadro, 2,2 px, un temblor) y le sube el contraste
  OSCURECIENDO los medios (el papel blanco queda blanco).
- En el mini-banco: con el punto blanco al centro (el de PULIDO 17) las calientes se leían como ojos o burbujas y el contraste
  simétrico aclaraba el papel (aros claros): se fueron los dos. Ahora, puntos de grafito nítidos con un velo y algún brillo mínimo.
- EL COLOR DE LA ESCENA, en el pase compartido: un disparador (un triángulo que no pinta) dibujado después de la trama copia el
  cuadro a una textura (`copyFramebufferToTexture`), sólo si alguien lo pidió en ese cuadro (el plasma, de día). La energía se dibuja
  después (orden −10 en adelante) y antes del haz y del amanecer (1 a 3): lo que se dibuja después queda encima del calor.
- s32 (ESCENA 7) prohíbe volver al «aire caliente» que se borró allá (un componente con su pasada); el calor de ahora es el pedido
  del humano, en la partícula y con el pase compartido; los nombres que s32 vigila no se usan.

### P1.e · Física mejor
- HECHO · VISTO no (la física se ve en movimiento: con el banco del sitio).
- `movimiento.ts`: la CONVECCIÓN (las calientes suben por su energía sobre la de reposo, 0,7 u/s² por unidad; las frías bajan, 0,05),
  el PINCH (un arco que golpea tira hacia su canal a las que tiene a menos de 1,3 u, 3,2 u/s², y las calienta: al apagarse las suelta
  encendidas y la convección se las lleva), la ESTELA del puntero (al moverse arrastra a las que tiene a menos de 2,6 u de su rayo
  hacia su velocidad, 1,8/s; quieto, nada). El VIENTO del scroll (`cuadro.ts`): en contra de la cámara que pasa, 0,35 u/s por
  pantalla por segundo, ×(1 + 1,5 T), con tope 1,6 y asentándose en 0,35 s; lo lleva el campo.
- La cáscara, más que lineal con lo que se pasan: con todo a la vez (la mitad caliente, dos arcos, el puntero, el viento al tope
  sostenido 20 s) alguna se escapaba; ahora ninguna (s69), ningún NaN, la rapidez con su tope.

### P1 · Secuencias (noche, día, piso de cerca, logo bajando, puntero, clic, mantener-soltar; 1440 y 390)
- PENDIENTE.

### P2.1 · Investigar (`DIMENSION-ESPEJO.md`)
- PENDIENTE.

### P2.2 · Los efectos (`?espejo=`), los disparos y el color
- PENDIENTE.

### P2 · Secuencias y recomendación
- PENDIENTE.

### Medido (sin vsync: el plasma A y cada efecto, a 1440 y 390)
- PENDIENTE.

### Final · verificar
- PENDIENTE.

## Disco y memoria por tanda

| Tanda | Disco libre | Memoria disponible (antes → después) | No paginado (antes → después) | Nota |
|---|---|---|---|---|
| Arranque | 81 GB | 1089 MB | 934 MB | el Chrome del humano abierto; sin banco |

## Invariantes que fijaban el polvo como default (antes / ahora / por qué)

| Invariante | Antes | Ahora | Por qué |
|---|---|---|---|
| s66 · M2 (las banderas) | sin bandera, el polvo; `energia=plasma`, el plasma en su lugar; el escenario con `sinPolvo` | sin bandera, el plasma (y `energia=plasma` se lee igual); `energia=polvo`, el polvo de antes; `plasma-y-polvo`, los dos; el escenario con `conPolvo` y `conPlasma` | la decisión del humano (A gana); lo demás (los destellos borrados, sin el color) igual |
| s68 · O3 (las direcciones) | `plasma=a`, `b` o `c` sobre `energia=plasma`; pedida sola, montaba el plasma; C pegada al logo | `plasma=a` o `b`; sin bandera, A (el producto); `plasma=c` se lee como sin bandera; C no existe (ni su superficie); el control ve el escenario de PULIDO 17 y a C de vuelta | la decisión del humano (A gana; C se borra) |
| s68 · O3 (el dibujo) | `CLARO_EN_REPOSO = { chispa: 0, mota: 0, estela: 0 }` | `{ chispa: 0, mota: 0 }` (el control, el destello en reposo de vuelta) | el estilo de C se borró |
| s52 · las pruebas sueltas | `energia` vale `plasma` o `plasma-y-polvo`; `plasma`, `a`, `b` o `c` | `energia` vale `polvo` o `plasma-y-polvo`; `plasma`, `a` o `b` | el nuevo sentido de la bandera |

Lo medido de C en PULIDO 17 queda en su recibo (`entregas/pulido-17/o5-medido.json`) y s68 lo sigue leyendo como historia.

## Crítica (lo que el banco mostró y qué se hizo)

(se completa con el banco)

## Recomendación

(al final)

## Lo que no quedó bien

(al final)
