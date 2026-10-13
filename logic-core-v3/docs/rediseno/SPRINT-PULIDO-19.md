# SPRINT PULIDO 19 — Terminación de la escena

Rama `rediseno/home`. Invariante nuevo: `npm run test:s70-pulido-19` (`src/app/v3/_lib/__tests__/s70-pulido-19.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base), `~/.cache/b4-medicion/pulido-18/_scripts/` (el sitio) y `_mini/` (el
mini-banco), `~/.cache/b4-medicion/pulido-19/` (los de este sprint). Recibos: `docs/rediseno/entregas/pulido-19/`. Los modelos:
`docs/rediseno/PLASMA.md` (el plasma), `docs/rediseno/DIMENSION-ESPEJO.md` (el cristal).

El humano: «usá todo tu potencial» y «dejala terminada». Corrida larga, sin humano: pensar, investigar, construir, mirar, criticar
e iterar. Si cambia el modelo a mitad, se retoma desde el ESTADO de abajo (EN CURSO / HECHO por subpaso).

Decisiones del humano (no se discuten):
- Se queda el plasma A como default y `?energia=plasma-y-polvo` («para mostrarle a mi amigo»).
- Se BORRA el plasma B (`?plasma=b`) con su código: el cristal ya lo reemplaza.
- Está bien que el plasma se apague en la animación del pie: no se toca.
- Los efectos del espejo distintos del cristal (pliegue, caleidoscopio, ecos, espiral) quedan en sus banderas, sin default.

Lo pedido:
- Q1 · PLASMA: a) más densidad (el humano mide: plasma solo 50, plasma y polvo 100; quiere el plasma solo en 75: +50 % de presencia
  visual sin volverse nube; medir el costo y ajustar). b) En toda la escena: en los planos lejanos se ve igual que hay plasma en
  toda la escena; las partículas siguen en el MUNDO pero el dominio cubre lo visible en cualquier encuadre (sugerido: un dominio
  periódico relativo a la cámara con fundido al reaparecer, o un volumen que abarque la escena entera). c) Nada desaparece de la
  nada: toda aparición y desaparición tiene causa y animación (nace de una chispa del logo, de un arco o por fundido; muere
  absorbida, por fundido en el borde del dominio o con un último destello); invariante: ninguna cambia su opacidad o tamaño más
  que un umbral por cuadro fuera de esos eventos, con control positivo. d) La RED EN REPOSO: quieto ~3–4 s, las partículas se
  frenan y se enlazan con rayos finos (2–3 enlaces por partícula, por distancia) hasta una red quieta y viva; con UN scroll o
  movimiento, la red se desconecta en cascada en ~0,3 s con un chasquido de luz. Rayos en lote (un búfer). De día y de noche. No en
  el final del pie, ni sobre textos, ni con movimiento reducido.
- Q2 · EL PIE: caen también los objetos 3D del pie (los botones del recorrido, el mail y WhatsApp, las redes, la placa del form, el
  titular) y quedan incrustados en el piso como el logo: cuerpos rígidos que vuelcan hacia atrás sobre su canto, con gravedad,
  impacto creíble y rebote chico; escalonados con un orden con sentido (el logo primero y después el resto como una onda); cada
  uno en su hueco o al ras, con el piso reaccionando a cada impacto (un pulso chico; el GOLPE grande y su sonido, sólo del logo).
  La cámara: sin el giro en espiral ni el alejamiento; termina en un límite muy cercano, desde arriba, con el pie entero en
  pantalla. Todo queda usable acostado (links, mail, WhatsApp, redes y el form), el DOM alineado con su homografía, el foco y el
  autocompletado bien. Con scroll hacia arriba se levanta todo (el rebobinado). ≥ 1024; en mobile y tablet el pie sigue como está.
  Invariantes: ninguna pieza se interpenetra; en reposo final, todo en pantalla con margen; cada link y cada input recibe el clic.
- Q3 · EL CRISTAL: una capa de cristal facetado SIEMPRE presente, solidaria al domo del moiré, que refracta lo de atrás (el cielo,
  la fábrica de logos); espesor y normales por faceta con biseles suaves, Fresnel, reflejo tenue del entorno, brillos especulares
  en los cantos que se mueven con la cámara y la luz, dispersión casi nula (el prisma en su bandera), facetas que crecen y se
  reacomodan muy lento, sin parpadeo; antialias en las aristas, estabilidad temporal; acompaña el día, la noche y el amanecer; el
  túnel aprobado no se toca (si el cristal estorba, se atenúa); sutil donde hay textos, nunca baja el AA de un texto. Investigar
  técnicas de refracción realista en tiempo real y anotarlas en `DIMENSION-ESPEJO.md`. Un solo pase de color compartido; medir.
- Q4 · CALIDAD GENERAL: 1) la auditoría (el sitio entero de día y de noche a 1440, 1920 y 390; ~20 mejoras por impacto/costo);
  2) implementar las de mayor impacto, una por commit, con antes/después; 3) sin cambiar coreografías, tiempos, composición ni
  copy. Los tirones en frío (0,5–1,2 s al primer scroll; 1,15 s a 390 con plasma) son un objetivo: precompilar, montar progresivo,
  precalentar. La física del polvo que corre sin dibujarse: apagarla.
- PERFORMANCE: ningún cuadro > 20 ms con la página caliente a 1440 y 390 en la NVIDIA, en calma, con la red en reposo, durante la
  caída del pie y con el cristal; medido sin vsync el costo de cada cosa nueva.
- VERIFICACIÓN: por punto, lint + tsc + todas las suites que lean lo tocado + banco; al final la matriz de 12 anchos (reposo y
  entradas) y `verificar` completo: los 8 rojos de la base y ni uno más.
- REGLAS: git prohibidos, frozen, cero `any`, nunca `router.push` directo, nunca debilitar un test, invariantes nuevos en
  `s70-pulido-19` con control positivo, `lente.ts` fuera de los commits, módulos de menos de 300 líneas; commit y push por paso.
- REPORTE: tabla (commit, estado, visto) por Q1–Q4, las URLs, la auditoría (hecho / pendiente), ms/cuadro, los tirones en frío
  antes y después, y «Lo que no quedó bien».

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no (mini-banco / sitio).

### Arranque
- Árbol limpio sobre `02558c0f` (sólo `lente.ts` y los sin seguimiento de siempre). Disco: 79,6 GB libres. Memoria disponible:
  **2735 MB** (el banco del sitio pide 3000: se mira de nuevo en cada bisagra; el mini-banco corre igual). No paginado 957 MB.
  Sin dev server, sin servidor de medición, sin Chrome del banco.

### Q0 · Borrar el plasma B y apagar la física del polvo que no se dibuja
- HECHO · VISTO en el mini-banco (el plasma A dibuja igual sin B).
- B se borró con su código: `energia/enjambre/` (la simulación en la GPU y su paso), su estilo de partícula (`mota`), la lectura de
  las partículas desde la textura (`sombreadoresDeParticulas` ya no tiene parámetros), sus uniformes en el banco (`enjambre`,
  `simulacion`, `gpu`), la dirección `b` y `?plasma=` (`Pruebas.plasma`, `PRUEBAS_SUELTAS`): no hay qué elegir. `armar(compacto, …)`.
  `Afuera` sin `gl` ni `logo` (eran del enjambre). `direcciones.ts` queda con A sola (la estructura con nombre, por si vuelve a haber
  otra). Lo medido de B en PULIDO 17 queda en su recibo como historia (s68 lo sigue leyendo).
- La física del polvo (`polvo/Fisica.tsx`: la simulación en la GPU y el horneado del campo del logo) sólo se monta con el polvo
  (`conPolvo`): en el producto corría igual sin dibujar nada. `Aire` sigue siempre (el piso vivo y la fugaz leen la forma y la pose
  del logo de ahí).
- Invariantes: s52 (las pruebas sueltas), s68 (O3: las direcciones, los módulos, el estilo, el quieto) y s69 (P1.0, sin B ni C) con su
  antes/ahora/por qué en la tabla. tsc y lint limpios; la compuerta (50 suites) en verde salvo s8-montaje con sus 2 de la base.

### Q1.b + Q1.c · El dominio que cubre lo visible y el ciclo de vida sin pops
- HECHO · VISTO en el mini-banco (hojas `hoja-d5.png`: el encuadre del sitio de noche y de día, el cierre de lejos, el teléfono):
  cobertura pareja en las cuatro vistas, partículas nítidas, sin banda rala ni discos borrosos cerca de la cámara.
- EL DOMINIO DE LA VISTA (`energia/dominio.ts`, nuevo): la pirámide de la vista con un margen del 20 % afuera del cuadro, entre 0,4 y
  1,8 veces el foco (la distancia cámara → logo, entre 8 y 60 u), PERIÓDICO (la que sale por una cara reaparece por la opuesta) y
  relativo a la cámara en tamaño, no en posición: las brasas siguen en el MUNDO (al mover la cámara pasan de largo). La SIEMBRA, en el
  primer cuadro con cámara: parejas en el cuadro, en profundidad con densidad ∝ w^1,7 (pocas cerca y grandes; muchas lejos y chicas),
  lo que cae bajo el piso se sortea de nuevo. El REPARTO (`repartir`): cuenta por celda del cuadro (8 × 5) contra lo que le toca a cada
  una por el aire que mira (`hastaElPiso` por rayo: una celda que mira el piso de cerca pide menos); las que sobran en una celda llena
  (1,2×) se apagan, se mudan a la más vacía (< 0,45×; si ahí no hay lugar, a cualquier lado: nunca quedan apagadas esperando) y se
  encienden. De a 8 candidatas por cuadro. La GRILLA de las fuerzas (`energia/grilla.ts`, nuevo; salió de `brasas.ts`) es relativa a
  la caja del dominio (32 celdas por eje como mucho, de al menos el alcance): antes era fija alrededor del origen y una caja grande
  caía entera en las celdas del borde. El puntero entra a la nube a la profundidad del foco (o a la esfera del logo si la toca).
- EL CICLO DE VIDA: cada brasa tiene `vida` (el alfa del dominio: 1 adentro del cuadro, 0 en el margen de los lados y en las bandas de
  profundidad, 0,3 y 0,45 del foco; 0 al reaparecer o al nacer en su celda nueva) perseguida con tope `dt / 0,25 s`, y `densidad` (el
  brillo por las vecinas) perseguida con inercia (0,8 s; antes saltaba de golpe cada cuatro cuadros). Lo que se dibuja es el producto.
  `eventos` marca el único salto permitido (la reaparición). La cáscara de radio 13 queda como siembra antes del primer cuadro y como
  límite sin dominio (las pruebas). La fuente del logo, apenas (0,2 en 9 u): antes apagaba lo lejano del logo.
- Lo que el banco mostró y se corrigió en el camino: (1) la siembra en la esfera quedaba concentrada en el centro en las vistas
  lejanas → siembra en todo el dominio + reparto; (2) las muestras bajo el piso subidas al mínimo se apilaban en el horizonte y el
  reparto las mudaba en un ciclo sin fin → profundidad hasta el piso por rayo y celdas con peso por el aire que miran; (3) las mudadas
  sin lugar quedaban apagadas para siempre → a cualquier lugar; (4) `llena` 1,6 nunca se cumplía con un desnivel suave → 1,2; (5) la
  densidad ∝ w amontonaba cerca de la cámara (discos borrosos de día) → exponente 1,7 y el frente a 0,4 del foco.
- Invariante s70 (nuevo, `s70-pulido-19`; `npm run test:s70`): la siembra + 1 s de reparto cubre las 40 celdas del cuadro (≥ 35 % de lo
  que le toca a cada una; las de objetivo < 2 no cuentan) en el hero, el cierre, el teléfono y Números (control: la esfera de antes en
  el cierre deja celdas vacías); en 10 s de órbita (0 → 170°) y viaje a 40 u con 900 brasas: ~7.400 eventos, todos fuera del cuadro o
  ya apagadas, y fuera de ellos ningún salto de brillo mayor que el tope (0,076 contra 0,115; controles: un pop de la más encendida, una
  reaparición adentro del cuadro, la densidad sin inercia); quieta 6 s, no recicla (264 eventos < 540); módulos ≤ 300 líneas y las
  funciones de cada cuadro sin reservas (control: una reserva en el envoltorio). s68 y s69 ajustados (tabla de invariantes).
- SIN BASURA POR CUADRO (la crítica del banco: 61 KB por cuadro, de 16 en PULIDO 18). El perfil del heap señalaba a `pasoDeLasBrasas`
  pero en Node asignaba 1 KB; con el estado vivo de la página en Chrome, 51 KB; con una entrada sintética en el mismo Chrome, 1 KB.
  La causa: un número no entero que cruza una función que TurboFan no inlineó se encaja en un HeapNumber (16 bytes) a la ida y a la
  vuelta, y qué se inlinea cambia con cada reoptimización (los deopts por «insufficient type feedback» de los caminos fríos). Ahora
  nada de cada brasa cruza una llamada como número: `en.dt`, `d.piso`, el rotor en lote con la hora en un arreglo del módulo, y
  `coordenadasDe`, `alfaDe`, `celdaDe`, `alRayoDesde` por brasa (arreglo + índice). La agitación térmica: un xorshift por brasa
  (`b.ruido`), inline (eran tres `azar()` por brasa). Medido en el mini-banco (1440, calma, noche): de 61,5 a 6,4 KB por cuadro,
  de 116 a 20 recolecciones en 6 s, el cuadro de 2,06 a 1,38 ms; a 390, de 33,5 a 5,2 KB y de 1,23 a 0,90 ms. Verificado con el
  estado vivo de la página: `cuadro(a, f)` 1,7 KB, el dibujo 2,6 KB, el paso 0,2 KB.
- Bancos del sprint (scratchpad `p19/`): `basura.ts` (Node, por función), `basura-cdp.ts` (el mismo en el Chrome del mini-banco con
  los objetos vivos y `gc()` antes de cada ventana), `tier-cdp.ts` (el nivel de V8 de cada función: en V8 15, bit 16 = Maglev y
  32 = TurboFan), el registro de deopts de V8 (`--js-flags=--log-deopt --logfile=…` con `--no-sandbox`: el stdout del renderer no
  llega al del navegador).

### Q1.a · Más densidad (+50 % de presencia), medido
- HECHO · VISTO en el mini-banco. 800 brasas en escritorio y 400 en el teléfono (eran 600 y 300) y todas a la vista (antes la cáscara
  dejaba muchas fuera del cuadro y la fuente las apagaba lejos del logo). La presencia en el encuadre del sitio (el exceso medio de
  luminancia sobre el fondo, contra la hoja de PULIDO 18): de noche 2,82 → 5,30 en el centro (×1,9) y 2,43 → 4,54 en la periferia; de
  día 5,97 → 7,18 (+20 %) y 6,27 → 7,38. Se lee como «más plasma», no como nube (hojas `hoja-d5.png`).
- El costo (mini-banco, la NVIDIA, sin vsync, sin el reloj de la GPU): 1440 calma-noche 1,38 ms por cuadro (p95 1,6; máx. 6,4),
  390 calma-noche 0,90 (p95 1,1). Ningún cuadro de más de 20 ms. Las otras vistas, en «Medido».

### Q1.d · La red en reposo
- HECHO · VISTO en el mini-banco (capturas `q1d5-red-noche/dia/tel` y `q1d5-corte-noche`: la red armada de noche y de día a 1440 y en
  el teléfono, y a 0,15 s del gesto: los enlaces cerca del puntero ya muertos con sus brasas encendidas por el chasquido).
- LA MÁQUINA (`energia/reposo.ts`, pura, 300 líneas): quieta la página 3,5 s (sin scroll, sin un mouse que se mueva más de ~3 px
  desde su última referencia —a cualquier cadencia de cuadros—, sin dedo) se FORMA: cada brasa a la vista (vida ≥ 0,6) se enlaza con
  sus hasta tres vecinas más cercanas con lugar, por la grilla del último paso, a menos de 2,2 u en el mundo y de 0,2 del cuadro (las
  cercanas a la cámara no cruzan media pantalla), cada par una vez, hasta 1,5 enlaces por brasa en total (el búfer). Sin ordenar: cada
  enlace nace con un retardo por su distancia al centro del cuadro (0,8) y un poco de azar (0,2) en `formaS` 1,8 s y se enciende en
  0,25 s: la red crece del centro hacia afuera. ARMADA, quieta y viva (el titileo, dos ritmos por enlace, en el sombreador). Las
  brasas se FRENAN desde un segundo antes de formarse (quietas primero, enlazadas después; `en.freno` se suma a la amortiguación:
  12/s) y mientras está armándose o armada no hay reparto. Con UN gesto (`leerElGesto`: el scroll, el puntero, el dedo, un pulso o
  descarga, o el final del pie, que cuenta como gesto) se CORTA en cascada desde el origen del gesto (el puntero si está; si no, el
  centro) en `corteS` 0,3 s: cada enlace muere con un destello (alfa 2,2 en 0,1 s) y un golpe de energía (0,4) a sus dos brasas (el
  chasquido: se encienden y tiemblan), y el freno se suelta en 0,6 s. Nunca con movimiento reducido (el cuadro quieto no la llama).
- EL DIBUJO (`dibujo/red.ts`): un solo búfer de cuadriláteros de pantalla (4 vértices y 2 triángulos por enlace) que el sombreador
  abre a los dos lados del segmento con el ancho en px del dispositivo (0,45 px de medio ancho y un píxel blando); por vértice los
  dos extremos (siguen a sus brasas), el lado y la punta, el alfa (por la vida de las dos brasas) y la semilla. De día tinta
  translúcida (0,42), de noche luz (0,34); la máscara de los textos por píxel (`gl_FragCoord`), el final del pie y `uApagado`.
  Siempre al menos un enlace nulo dibujado (el programa se arma al cargar con el precompilado). Después de las brasas en el orden.
- Lo que el banco mostró y se arregló: (1) rayos que cruzaban la pantalla entera: una brasa enlazada que reaparecía por una cara del
  dominio (o se mudaba por el reparto) dejaba su rayo estirado de lado a lado → `podar`: una brasa que salta pierde sus enlaces, y un
  enlace estirado más de 1,5 veces también; sin reparto con la red; (2) seguían apareciendo rayos de 3,6 u: la PAREJA (el enlace de
  la física de PULIDO 15) de una brasa que cruzó el dominio quedaba del otro lado y el resorte la arrastraba por toda la pantalla
  (un defecto de Q1.b que se veía como una brasa que cruza volando) → `desenlazar` al reaparecer y al mudarse; (3) las brasas
  seguían derivando los primeros 0,3 s de la red (el freno subía recién al formarse) → el freno un segundo antes; (4) un puntero que
  deriva despacio no cortaba (el umbral era por cuadro: a 500 cuadros por segundo no llegaba) → el umbral desde la última referencia.
- Invariantes (s70, 29 afirmaciones y 19 controles positivos): quieta, la red se arma entre 3,5 y 5,6 s con ≥ 40 % de enlaces por
  brasa, ≤ 3 por brasa, ninguno más largo que 1,5 veces el alcance (en el mundo y en el cuadro) y el freno entero; el gesto a los 7 s la
  corta (todos los enlaces mueren en ≤ `corteS`), con el chasquido (la energía media sube ≥ 0,1) y suelta el freno; en el final del
  pie, quieta 10 s, no se arma; el lector del gesto (scroll, puntero, dedo, final; quieto, nada); el dibujo con los dos extremos por
  vértice, el ancho en px, la máscara de los textos por píxel, el final y el titileo. Controles: una red antes de tiempo, cuatro
  enlaces por brasa, un enlace que cruza media pantalla, un corte que no termina, sin chasquido, un freno que no se suelta, una red
  sorda al gesto, una armada en el final, un lector ciego al scroll, un dibujo sin la máscara. s68: `reposo.ts` y `dibujo/red.ts` en
  los módulos (≤ 300 líneas) y en lo de cada cuadro sin reservas (tabla de invariantes).
- El costo (mini-banco, la NVIDIA, sin vsync; recibo `entregas/pulido-19/mini-medido.json`, sección `red`; s70 lo lee): 1440 calma de
  noche con la red armada (618 enlaces) 1,84 ms por cuadro, sin ella 1,36 (+0,48 ms: el relleno de ~2.500 vértices y su subida, y el
  dibujo); 390 (181 enlaces) 0,91 contra 0,95 (nada); de día 1,86; al máximo (el puntero que da vueltas: la red no se arma) 1,40 ms a
  1440 y 0,92 ms a 390. La basura por cuadro no cambia (6,7 KB). Ningún cuadro de más de 20 ms.

### Q2 · El pie: todo cae y queda incrustado
- HECHO · VISTO en el mini-banco del pie (`p18/sombreadores/pie.ts` + `pie.sh`: el piso, el logo de reemplazo que cae a su hueco con
  `poseDeLaCaida`, las doce piezas del pie de 1440 como cajas con las medidas del DOM, la cámara del final; capturas `pie-a.png` (3,4 s),
  `pie-4.3`, `pie-4.9`, `pie-5.6`, `pie-6.4` y `pie-8.0`): a los 4,9 s las piezas ya paradas en sus lugares del piso, a los 6,4 s el
  titular y el formulario volcando, a los 8 s todo acostado alrededor del logo, compacto y entero en el cuadro. NO VISTO en el sitio
  (sin banco: memoria < 3 GB): el DOM acostado, el foco y el autocompletado en el formulario acostado, los clics: VERIFICAR TRAS REINICIO.
- LA FÍSICA Y LOS LUGARES (`final/caidaDelPie.ts`, puro): después del golpe cada pieza arranca con una onda desde el logo (`ondaUs`
  18 u/s por la distancia de su lugar al centro), BAJA de su lugar en la pared del pie a su lugar en el piso enderezándose (el
  trayecto de mínimo tirón; `bajaS` al menos 0,45 s y a lo sumo 24 u/s de media: las que vienen de lejos tardan más) y ahí VUELCA
  hacia atrás sobre su canto de abajo y de atrás con la física del logo (`caidaAlHueco.ts`: la inclinación hasta pasar su equilibrio,
  θ'' = κ·sen(θ − α) con RK4, el rebote por restitución, asentada) con su κ (su alto y su espesor en u); las placas más altas que el
  logo caen con el tiempo comprimido por la raíz de la razón de altos (la gravedad por la razón: el formulario, de 11 u, tardaría 2,7 s
  en tocar). DÓNDE: dos pilas a los lados del logo (el lado por el canto de pie); cada pila apila sus FILAS hacia atrás en el orden en
  que estaban de pie (lo que estaba arriba queda más lejos; las que estaban a la misma altura, en la misma fila, una al lado de la otra),
  con `aire` 0,5 u entre filas, centrada en el logo a lo largo, y pegada a su lado del logo: la pieza que más se acercaba al logo de pie
  queda a `aire` de su huella y las demás con su mismo corrimiento (la alineación de la columna, como de pie). Vista desde arriba, la
  composición es la del pie, compacta: el pie de 1440 ocupa 28 × 12 u alrededor del logo. Queda al ras del piso con la cara arriba.
- EN LA ESCENA (`pie3d/caida.ts`): con el final en marcha la pared del pie se arma con la cámara de ANTES del final
  (`CAMARA_ANTES_DEL_FINAL`, la de sin el mouse como la deja el rig: `cuadroDelFinal` la copia al empezar su cuadro, antes de subirla),
  quieta donde estaba (`profundidadDelFinal` ya no lleva las piezas con la cámara que sube); cada cuadro arma las piezas como números
  (el canto en el mundo, las medidas en u), sus lugares y su reloj, y a cada grupo le aplica su pose (el canto que baja, la orientación
  que va de la de la cámara a la vertical de frente y el vuelco sobre su eje x). El DOM sigue a cada pieza por la homografía de siempre
  (`seguirLaPieza` lee la matriz del grupo, caída incluida): usable acostado. El piso se CALMA bajo el pie acostado (`uCalmaDelPie`:
  una caja en la base horizontal de la cámara de antes del final, con el borde suave de la calma del logo, desde el primer impacto) y
  PULSA en cada impacto (`pedirLaOnda` donde cae cada pieza, como lo ve la cámara viva; el golpe grande y su sonido siguen siendo del
  logo). LA CÁMARA: sin el giro en espiral ni el alejamiento del quieto (`giroGradosS` y `alejaHasta` en 0; la vuelta con tope queda) y,
  desde arriba, a la distancia que deja entero el pie acostado y el logo con margen (`distanciaParaElPie` de la huella, 0,86 del
  cuadro; el pie de 1440 pide 32 u: era 43 al golpe y 60 con el alejamiento). Todo es función de `fin`: el rebobinado levanta todo por
  el mismo camino y el reinicio lo vuelve a tirar. Nada abajo de 1024 (el pie plano no tiene piezas). Con movimiento reducido el estado
  final quieto (acostadas). EL RELOJ: `duracionS` = golpe + `hastaS` 4,5 s (era + 1,7): la última pieza del pie de 1440 se asienta a los
  6,8 s y el destello y la expansión de siempre corren después; con el reloj más largo la subida de la cámara es más empinada en `fin`,
  así que la SALIDA del fondo la deja bajar de punta a punta en 0,95 s (era 1,2) y mira 0,13 adelante (era 0,12): sale en 2,93 s sin
  pasar su tope (s52 A2).
- Lo que el banco sintético mostró y se arregló: (1) la pieza más cercana al logo se alineaba por el borde equivocado (el signo del
  lado) y el formulario y un enlace caían sobre el logo; (2) tres enlaces a la misma altura se apilaban uno detrás de otro → las filas;
  (3) con la bajada fija en 0,5 s las piezas de lejos cruzaban 1,4 u por cuadro → la bajada por lo que viaja; (4) el formulario (11 u)
  tardaba 2,7 s en tocar → el tiempo comprimido de las placas altas; (5) la salida del fondo pasaba los 3 s y después el tope de la
  cámara → `camaraS` 0,95 y `mira` 0,13.
- Invariantes (s70, 44 afirmaciones y 30 controles): el pie de 1440 acostado sin solapes entre piezas ni con el logo (a ≥ 0,5 u de él), la
  primera arranca después del golpe y la última se asienta antes de que el reloj termine menos `despuesS`, y desde arriba todas las
  esquinas y el logo adentro del cuadro con margen (controles: dos en el mismo lugar, una sobre el logo, una antes del golpe, un reloj
  corto, una esquina fuera); cada pieza baja sin saltos (el canto ≤ 1 u por cuadro, el ángulo ≤ 0,3 rad), vuelca y queda acostada en su
  lugar, en una onda desde el logo (controles: un salto, una que no llega, una onda al revés); el cableado (la cámara quieta se queda,
  la copia antes de subir, la calma del pie en el GLSL, el pulso del impacto, la caída aplicada; módulos ≤ 300 líneas y sin reservas).
  s44, s49, s50, s52 y s57 con el cableado y el reloj nuevos (tabla de invariantes).

### Q3 · El cristal: capa fija de fondo, pegada al moiré
- HECHO · VISTO en el mini-banco (capturas `q3b-cristal-dia`, `q3b-cristal-noche`, `q3b-cristal-tel`, `q3-cristal-lejos` y la referencia
  `q3-sin-dia`): de día el vidrio facetado sobre la trama, cada faceta con su corrimiento del fondo (las líneas de la trama saltan en
  cada borde), los biseles con un filo claro y su talla; de noche sólo los biseles que miran la luz toman el brillo (cortes de luz) y
  el resto apenas se adivina; de lejos las facetas más chicas, estables (viven en la cúpula). NO VISTO en el sitio (sin banco): el
  cristal detrás de los textos y de las secciones, el fundido en el túnel y en Tu panel, el amanecer: VERIFICAR TRAS REINICIO.
- QUÉ ES (`escena/cristal/`: `cristal.ts` lo puro, `vidrio.ts` el GLSL y la malla, `CristalDeLaEscena.tsx` el componente; en el
  producto siempre, `?cristal=no` lo apaga para medir por diferencia): una PASADA DE PANTALLA ENTERA (un cuadrado en clip, orden −16:
  después de la copia del cuadro y antes del espejo y la energía; sin profundidad) que en cada píxel que es FONDO (lo opaco más lejos
  que el vidrio, por la profundidad del pase) encuentra el punto del cilindro del cristal (radio 37,4 u, apenas adentro de la trama
  cercana, entre el piso y 34 u) que cruza el rayo de la vista; su FACETA: celdas de Voronoi en las coordenadas del cilindro (el arco
  alrededor y el alto; alrededor entran las que entran justas: 45 facetas de 5,22 u, sin costura; en alto crecen y se achican ±14 % en
  170 s) con la distancia exacta al borde por las bisectrices (5 × 5) y semillas que derivan muy lento (95 s, hasta un 16 % de la
  celda); su NORMAL: la del cilindro hacia adentro, inclinada por faceta (±0,09 rad) y girada hacia el borde en el BISEL (0,32 u, hasta
  0,4 rad, con un perfil suave antialiasado con `fwidth`); la REFRACCIÓN: Snell con índice 1,5, el rayo transmitido cae a 9 u detrás
  del vidrio y ahí se lee la copia del cuadro (la transmisión barata en pantalla; con tope de 56 px de corrimiento; nunca se lee un
  píxel de lo que no es fondo: donde cae el rayo también se mira la profundidad); el FRESNEL de Schlick (F0 0,04); el BRILLO especular
  (Blinn-Phong, dureza 56) con la luz principal de la sala (sigue el azimut de la cámara con su corrimiento) y la cámara, más fuerte
  en el bisel y con el Fresnel; el REFLEJO tenue del entorno (el cielo por la altura del reflejo: 0,07 de día, 0,2 de noche); de día
  la TALLA oscurece apenas el bisel (0,07; sin eso el vidrio no se lee sobre el papel) y de noche el bisel toma la luz (especular 1,3;
  de día 0,15). Con el prisma, una dispersión mínima por canal (0,012 del índice). DÓNDE: 1 en todo el recorrido salvo el túnel de
  Trabajos y Tu panel (0 con el medio de la pantalla adentro, un fundido de 0,35 pantallas), y se va con la cámara del final; sobre
  un texto, 0,25 del corrimiento y del brillo (el DOM no se toca: el antialias de los textos es del navegador). Con movimiento
  reducido no se monta. Pide la profundidad al montarse y el color por cuadro mientras se ve: UN solo pase compartido.
- Lo investigado, en `DIMENSION-ESPEJO.md` («El cristal de fondo»): la transmisión en espacio de pantalla de luma.gl (Snell proyectado,
  el espesor por el dorso, Schlick, la dispersión como `KHR_materials_dispersion`, Beer-Lambert), la refracción por dos caras de
  Codrops, `MeshTransmissionMaterial` (otra pasada de la escena por material: descartado) y el vidrio facetado armado a mano
  (Voronoi con la distancia exacta al borde, la normal por faceta y el bisel).
- Medido (mini-banco, la NVIDIA, sin vsync; recibo `entregas/pulido-19/mini-medido.json`, sección `cristal`; s70 lo lee): 1440 calma de
  día con el cristal 1,76 ms por cuadro (sin él, en la misma tanda, 1,64 ms; con el cristal, 1,49: la diferencia es ruido), de noche 1,96 (sin él 1,84 en Q1.d); 390 de noche
  1,01 (sin él 0,91); de lejos de día 1,26 ms. Ningún cuadro de más de 20 ms; la basura por cuadro no cambia (6,5–6,9 KB). El cuadro
  está mandado por la CPU (la física del plasma y la red): la pasada del cristal cabe en la GPU sin asomar.
- Invariantes (s70): las facetas justas alrededor (sin costura; control: una vuelta que no cierra); dónde (1 lejos de las apagadas, 0
  adentro, el fundido monótono, se va con el final; controles: uno que no se apaga en el túnel, uno que se queda en el final); el
  vidrio (el cilindro, Voronoi con la distancia exacta, el bisel con fwidth, Snell, la copia sólo en el fondo también al leer, Schlick,
  el brillo con la luz y la cámara, el tope, los textos; montado siempre con movimiento, `cristal=no`, los pedidos al pase, el orden;
  controles: uno que lee sin mirar la profundidad de donde lee, uno montado con movimiento reducido); el recibo (ningún cuadro de
  más de 20 ms con el cristal, costo ≤ 1,5 ms; control: uno que cuesta 3 ms).
- La clave de `Pruebas` es `'sin-cristal'` (por defecto `'no'`, como todas las pruebas; `?cristal=no` la pone en `'si'`). La primera
  versión tenía `cristal: 'si'` por defecto y s38 y s31 se pusieron rojas (afirman que sin URL ninguna prueba pide nada: la lección de
  PULIDO 7, «claves nuevas de `Pruebas` rompen tests de ausencia»); la salida fue nombrar la prueba por lo que pide (apagarlo), sin
  tocar ningún test. tsc y lint limpios; la compuerta (51 suites) en verde salvo s8-montaje con sus 2 de la base.

### Q4.1 · La auditoría
- HECHA con lo que había: SIN banco del sitio (la memoria no llegó a 3 GB en ninguna bisagra hasta acá: el Chrome del humano con
  muchas pestañas se queda con ella), el recorrido entero a 1440, 1920 y 390 de día y de noche NO se pudo mirar; la auditoría sale
  del código, del mini-banco (el plasma, la red, el cristal, el pie con cajas) y de lo medido en PULIDO 17 y 18 en el sitio. Cada
  ítem con su impacto (I) y su costo (C), de 1 a 3, y su estado. Lo que pide el sitio queda marcado VERIFICAR TRAS REINICIO.
  1. Sombras de contacto bajo las piezas del pie que CAEN (I3 C1): la maquinaria de P2 (`pie3d/sombras.ts`, el piso vivo la pinta)
     estaba apagada desde NOCTURNO FINAL A4 (de pie en la pared eran sombras raras); acostadas, la oclusión de contacto es lo que
     les falta para pesar. HECHO (Q4.2, 1).
  2. Filtrado anisotrópico de la trama del moiré y de las siluetas de la formación, 4 → el máximo de la placa (I2 C1): las líneas
     finas de la trama en ángulo rasante se emborronan a gris antes de lo necesario con 4. HECHO (Q4.2, 2).
  3. Oclusión bajo el logo en su hueco (I2 C2): el pozo ya se sombrea (`HUECO.sombra`), la mancha de contacto y la sombra proyectada
     existen; falta ver si el labio del pozo pide un oscurecimiento de contacto cuando el logo está al ras. PENDIENTE (sitio).
  4. Microrrugosidad del satinado del logo (I2 C2): un grano fino de rugosidad por `onBeforeCompile` en el material del logo (hoy
     lisa, el estudio se refleja limpio). PENDIENTE: sin verlo no se ajusta.
  5. El filo del encastre (I2 C2): las juntas saturadas piden derrame (lección de PULIDO 6); el filo al ras del logo puede escalonarse
     a 390. PENDIENTE (sitio).
  6. Perspectiva aérea (I2 C1): la niebla (42–110 u) ya cubre la cúpula; una niebla DE ALTURA (más densa abajo, el piso lejano que se
     pierde) daría más profundidad al piso. PENDIENTE (sitio: hay que ver el piso lejano).
  7. El moiré, aliasing (I2 C1): mipmaps ✓ y la anisotropía (2); el patrón de interferencia es a propósito (vivo). Con 2.
  8. El piso: el reflejo del logo (I2 C3): un reflejo planar es otra pasada de la escena. DESCARTADO por costo; el reflejo de las brasas
     ya existe (P1.a).
  9. Política de DPR (I2 C1): `[1, 1.5]` con la calidad adaptativa (escalones hasta 0,7 con las motas); coherente con el repo. OK.
  10. Coherencia del tonemapping (I2 C1): ACES compensado (`tono.ts`) en los materiales, la energía, el espejo y el cristal (el cristal
      escribe sobre la copia ya mapeada: su brillo se suma en espacio de salida; aceptable, anotado). OK.
  11. Tirones en frío (I3 C2): precompilar + calentar existen (CALIDAD 1 B1); lo nuevo de este sprint se compila con la escena y se dibuja
      desde el primer cuadro (la red: un enlace nulo; el cristal: en el hero; la caída del pie: los mismos programas). El primer scroll
      (0,5–1,2 s) y los 1,15 s a 390 son del sitio (el campo del logo que se publica, las secciones que se montan al llegar: PULIDO 17).
      PENDIENTE: medir en frío con `p-scroll` y montar progresivo (VERIFICAR TRAS REINICIO).
  12. Montar progresivo de las secciones (I3 C3): repartir el montaje de las secciones pesadas en cuadros sucesivos (hoy, al llegar).
      PENDIENTE (sitio).
  13. La física del polvo sin dibujarse (I2 C1): apagada. HECHO (Q0).
  14. La basura por cuadro del plasma (I3 C2): de 61 a 6 KB. HECHO (Q1).
  15. El pase de color cada cuadro también de noche (I1 C1): lo pide el cristal (+0,12 ms medidos); a media resolución bajaría, pero el
      cristal refracta líneas finas: se queda entero. OK.
  16. La luz del cristal (I2 C3): un mapa de entorno real (el estudio del pie) en vez del cielo por altura. PENDIENTE (caro de ver).
  17. El amanecer sobre el cristal (I1 C2): el brillo con el sol del amanecer. PENDIENTE.
  18. El AA del canvas (I2 C1): antialias en `plena` (los cantos del logo negro contra el papel), apagado en el hero; `compacta` lo decide
      `ajustes.ts` con su medición. OK.
  19. La red en reposo sobre textos (I2 C1): la máscara por píxel; en el sitio hay que ver que no roce los títulos 3D. PENDIENTE (sitio).
  20. Las piezas del pie acostadas y el mouse (I2 C2): la órbita del mouse (±22°) con el pie acostado: que ninguna esquina salga del cuadro
      en los extremos. PENDIENTE (sitio): el invariante cubre la vista cenital quieta.

### Q4.2 · Las mejoras (una por commit)
- **1 · Sombras de contacto bajo las piezas del pie que caen** — HECHO · VISTO en el mini-banco del pie (capturas `q4b-sombras-5.6`,
  `-6.0`, `-6.4`, `-8.0`, `q4-sombras-noche-8.0` y la referencia `q4-sin-sombras-8.0`; el piso del mini pinta con el GLSL real y la
  cuenta real, `sombras=0` las apaga): acostadas, un ribete blando alrededor de cada placa que la asienta (sin él flotan sobre la
  grilla); volcando, una sombra tenue y ancha que se condensa al apoyarse; de noche apenas se adivina. NO VISTO en el sitio (sin
  banco): el piso vivo con las 12 sombras en el final y su costo (12 rectángulos por píxel del piso durante 8 s; en la NVIDIA no
  debería asomar): VERIFICAR TRAS REINICIO.
- QUÉ ES: la maquinaria de P2 (`pie3d/sombras.ts`: el piso vivo pinta rectángulos blandos con `sombraDelPie`), apagada en NOCTURNO
  FINAL A4 (de pie en la pared eran sombras raras: ahí sigue apagada), prendida sólo con el final en marcha (`armadas.ts`:
  `enElFinal ? sombrasDeLaCaida(s.caida, segundos) : 0`). `final/sombraDeLaPieza.ts` (puro, nuevo): la huella de cada pieza según su
  pose — de pie en la pared, nada (entra con la bajada); bajando, el filo del canto; volcando, desde el canto hacia atrás
  `alto · sen a + espesor · cos a`; acostada, la placa entera más `sobra` (0,08 u) — con el alfa y la blandura de P2 por la ALTURA
  MEDIA de la placa sobre su huella (`h = canto + alto² · sen a · cos a / (2 · fondo)`: 0 de pie y acostada, lo más alta a mitad
  del vuelco: una placa levantada tapa poco, la sombra se aclara —0,34 → 0,06 para el formulario— y se ablanda —0,12 → 1,3 u— y se
  condensa al apoyarse; con el rebote respira). `pie3d/caida.ts` (`sombrasDeLaCaida`): escribe los rectángulos (hasta 24; las más
  tenues que 0,002, no) y la base del pie; el GLSL rota cada rectángulo a esa base (`uBaseDeLasSombrasDelPie`: `derecha` y `atras`
  de la cámara de antes del final, no los ejes del mundo). Todo función del reloj: el rebobinado las levanta.
- Invariantes (s70, Q4): con el pie de 1440 de Q2, ninguna sombra de pie en la pared, más tenues a mitad de la bajada, la huella entre
  el canto y la placa a mitad del vuelco, acostadas la placa entera con su sobra y el alfa del ras, ninguna sobre el logo (controles:
  una de pie, una acostada que no es la placa, una sobre el logo, una huella que no crece); el cableado (sólo en el final, la base,
  el tope, el piso las pinta, los módulos de menos de 300 líneas, sin reservas; controles: en los ejes del mundo, también de pie,
  una reserva). s47 y s52 cambian de sentido (la tabla). s44 sigue igual (la forma al ras, a media altura y lejos; la maquinaria en el
  piso). tsc y lint limpios.
- **2 · Anisotropía al máximo de la placa** — HECHO · NO VISTO (el mini-banco no tiene la trama del moiré ni las siluetas de la
  formación; el cambio es de filtrado en la GPU): VERIFICAR TRAS REINICIO en el sitio, a 1440 y 1920 de día, el horizonte de la cúpula
  y el pie del zócalo (las líneas rasantes siguen siendo líneas más lejos; antes se emborronaban a gris) y, con el banco, que el
  cuadro no cambie (lo paga la GPU en los texels rasantes nada más).
- QUÉ ES: `gpu/anisotropia.ts` (nuevo): `ANISOTROPIA_DE_LAS_TRAMAS = 16`, lo que piden la trama del moiré (`MoireScreen.tsx`, las dos
  capas y el zócalo) y las siluetas de las copias de la formación (`formacion/copia.ts`); eran 4 en los dos lugares (ESCENA 2). No hace
  falta leer la placa: three acota al subir la textura (`WebGLTextures.js`: `min( texture.anisotropy, capabilities.getMaxAnisotropy() )`),
  16 en casi todas.
- Invariantes (s70, Q4): la constante entre 8 y 16, usada en los dos lugares sin el 4 literal, y el three instalado acota a la placa
  (controles: el 4 de antes en la trama; un three que no acota). Ningún test fijaba el 4. tsc y lint limpios.

### Medido (sin vsync; 1440 y 390; la NVIDIA)
- Q1 · el mini-banco (recibo `entregas/pulido-19/mini-medido.json`; s70 lo lee, con sus controles positivos): la placa ANGLE D3D11 sobre la
  RTX 5050; sin el reloj de la GPU; 6 s medidos tras 4 s de física. Ningún cuadro de más de 20 ms; ningún error.

| Medición (ms por cuadro: media / p95 / máx.) | Q1 final | basura KB/cuadro (recolecciones en 6 s) | antes del arreglo de la basura |
|---|---|---|---|
| 1440 · calma · noche | 1,38 / 1,6 / 6,4 | 6,4 (20) | 2,06 ms · 61,5 KB (116) |
| 1440 · calma · día | 1,97 / 2,5 / 4,8 | 6,8 (16) | 2,01 · 61,6 (119) |
| 1440 · máximo · noche | 2,07 / 2,7 / 5,8 | 7,7 (16) | 2,17 · 63,1 (114) |
| 1440 · lejos (el cierre) · noche | 1,44 / 1,8 / 4,4 | 6,0 (19) | 1,61 · 61,3 (149) |
| 1440 · la escena sola | 0,14 / 0,3 / 3,4 | 1,3 (43) | — |
| 390 · calma · noche | 0,90 / 1,1 / 3,8 | 5,2 (25) | 1,23 · 33,5 (106) |
| 390 · máximo · noche | 0,93 / 1,2 / 3,8 | 5,9 (25) | 1,24 · 35,2 (109) |

- Referencia de PULIDO 18 (600 brasas en la cáscara): ~1,0 ms en calma a 1440 y ~16 KB por cuadro. Lo que suma Q1 son los 200
  brasas más y el dominio (el reparto y el envoltorio: ~0,1 ms); la basura quedó por debajo de PULIDO 18.
- Q1.d · la red armada (618 enlaces a 1440): +0,48 ms por cuadro (1,36 → 1,84); a 390 nada (recibo, sección `red`). Q3 · el cristal:
  1440 de día 1,49 ms con él contra 1,64 sin (la misma tanda: ruido, el cuadro lo manda la CPU), de noche 1,96 (1,84), 390 de noche
  1,01 (0,91), de lejos 1,26 (sección `cristal`). Q2 y Q4 · la caída del pie y sus sombras: SIN medición de cuadros (el mini-banco
  del pie es una captura por instante; el sitio no corrió): `p19-sitio.ts` los mide durante la caída (VERIFICAR TRAS REINICIO).
- El banco del sitio NO corrió en todo el sprint. En cada bisagra la memoria disponible estuvo por debajo de 3000 MB; al cierre, con
  3308–3585 MB libres, se lanzó `reconstruir.sh` (el build de medición en `.next-probe`): el `next build` (~2,5 GB) bajó la memoria a
  870 MB y el reaper de Claude Code cortó la tarea de fondo «por memoria crítica». Quedaron huérfanos `bash reconstruir.sh`, `bash
  compilar.sh` y `cmd next build --webpack` (la lección de ESCENA 10): matados por línea de comando con `taskkill /T /F`, la memoria
  volvió a 4615 MB y `.next-probe` parcial (113 MB) se borró. No se relanzó por cuenta propia (lo pide el aviso del reaper).
  Lo que hay que correr, en orden, con ≥ 3 GB libres y el Chrome del humano liviano (`~/.cache/b4-medicion/pulido-18/_scripts/`):
  `bash reconstruir.sh` → `SIN_VSYNC=1 bash p-tanda.sh p19 producto "1440 390"` (ms por cuadro en frío, calma, máxima y noche; comparar
  con `entregas/pulido-18/sitio-medido.json`, `medido.libre.producto-*`: 5,7 / 2,76 / 3,67 / 2,91 a 1440) → `npx tsx p-lanzar.ts` +
  `npx tsx p19-sitio.ts 1440 900`, `1920 1080` y `390 844` (NUEVO: el cristal por el recorrido con su estado, la red en reposo quieta
  5,5 s y su corte con un scroll, el golpe, los cuadros durante la caída del pie —ninguno de más de 20 ms—, las piezas acostadas con sus
  sombras, el DOM sobre cada pieza —cajas, pointer-events, opacidad—, escribir en el formulario acostado, el rebobinado y el reinicio;
  capturas e `informe.json` en `pulido-18/p19-<ancho>/`) → `python p19-recibo.py docs/rediseno/entregas/pulido-19` (NUEVO:
  `sitio-medido.json` y `sitio-verificado.json`) → la matriz (abajo). Después, mirar las capturas y anotar acá.

### Final · la matriz de 12 anchos y verificar
- `npm run verificar`: 77 pasos, 8 con falla: los agregados s1, s17, s2, s3, s4, s5, s7 y s8 de la base con sus 105 afirmaciones en falla (s1-bundle 12, s17-revelado 1, s2-bundle 16, s2-css 2, s3-peso 13, s4-cobertura 1, s4-heredado 4, s5-compacto 1, s5-peso 8, s7-compuerta 18, s8-montaje 2, s8-tres 11, s8-chrome 2, s8-peso 14), ni una más; s70 en verde con 66 afirmaciones y 45 controles positivos (log en el scratchpad, `verificar-final.log`).
- `npm run test:frontera`: en verde: 2 invariantes, 23 afirmaciones, 10 controles positivos, 12 fuera de ventana, 0 con falla.
- La matriz de 12 anchos (`pulido-11/_scripts/g-matriz.ts`, `for w in "320 568" "375 667" "390 844" "414 896" "768 1024" "820 1180"
  "1024 768" "1280 800" "1366 768" "1440 900" "1920 1080" "2560 1440"`): NO corrió (pide el banco del sitio): VERIFICAR TRAS REINICIO,
  después de `reconstruir.sh` y con `banco11.ts lanzar` (con vsync, como en PULIDO 11); cada ancho imprime los solapes, los desbordes y
  los cuadros largos de cada parada.
- `scripts/limpiar.ps1 -Profundo` al cierre. Los perfiles de Chrome del mini-banco en el scratchpad (224 MB), borrados; `.next-probe`
  parcial, borrado; el caché de bancos en 1,2 GB (tope 5).

## Disco y memoria por tanda

| Tanda | Disco libre | Memoria disponible (antes → después) | No paginado (antes → después) | Nota |
|---|---|---|---|---|
| Arranque | 79,6 GB | 2735 MB | 957 MB | sin banco del sitio (pide 3000 MB); el mini-banco sí |
| Q1 (mini-banco) | 78,5 GB | 2012 → 2516 MB | 957 → 984 MB | sin banco del sitio; mini-banco a 1440 y 390 (un Chrome por medición); cuadros crudos borrados al armar cada hoja |
| Q1.d (mini-banco) | 78,5 GB | 2516 → 2453 MB | 984 → 991 MB | ídem; la red con y sin (`red=no`) |
| Q2 (mini-banco del pie) | 70,9 GB | 2453 → 1402 MB | 991 → 992 MB | sin banco del sitio; `pie.sh` (Chrome por captura); el Chrome del humano con muchas pestañas se lleva la memoria |
| Q3 (mini-banco) | 74,1 GB | 1402 → 1561 MB | 992 → 1001 MB | sin banco del sitio; el cristal con y sin (`cristal=si`) |
| Q4.2 (1) (mini-banco del pie) | 74,4 GB | 1561 → 3308 MB | 1001 → 1003 MB | `pie.sh` con las sombras (`sombras=0` las apaga); al cerrar la tanda hay 3308 MB libres: el banco del sitio se intenta en la medición final |
| Q4.2 (2) + el intento del sitio | 74,4 GB | 3585 → 870 → 4615 MB | 1002 → 999 MB | `reconstruir.sh` cortado por el reaper en el `next build`; los huérfanos matados; sin banco del sitio |
| Final (verificar + frontera) | 74,6 GB | 4615 → 3739 MB | 999 → 1006 MB | sin banco del sitio; `limpiar.ps1 -Profundo` al cierre |

## Invariantes que cambian de sentido (antes / ahora / por qué)

| Invariante | Antes | Ahora | Por qué |
|---|---|---|---|
| s52 · las pruebas sueltas | `plasma` vale `a` o `b` | `plasma` no es una prueba | B se borró (la decisión del humano); `?plasma=` se ignora |
| s68 · O3 (las direcciones) | `plasma=a|b` elige; B con su enjambre (≥ 10.000 motas); el escenario le pasa la dirección | sólo A; ni `b` ni `c`; sin la carpeta del enjambre; el escenario no elige | ídem (el cristal reemplaza a B) |
| s68 · O3 (el dibujo, el quieto, los módulos) | `CLARO_EN_REPOSO = { chispa: 0, mota: 0 }`; `cuadroQuieto(a, state.gl, …)`; 24 módulos con `enjambre/` | `{ chispa: 0 }`; `cuadroQuieto(a, …)`; 22 módulos | el estilo `mota` y el paso del enjambre eran de B |
| s69 · P1.0 | `?plasma=b` monta B; «queda B (su bandera)» y la simulación sin la superficie de C | `?plasma=` se ignora (el producto); ni B ni C; sin `enjambre/` | ídem |
| s68 · POR_CUADRO, MODULOS | la grilla y las fuerzas entre ellas en `brasas.ts`; sin `dominio.ts` ni `grilla.ts` | `grilla.ts` (entreEllas, ajustarLaGrilla, celdaDe) y `dominio.ts` en las listas; `ruido.ts` con el rotor en lote; `brasas.ts` con `alRayoDesde` | Q1.b sacó la grilla de `brasas.ts` (pasaba las 300 líneas) y el dominio es nuevo; lo de cada cuadro sin reservas se sigue exigiendo |
| s69 · CALIENTES, firmas | `brilloPorDensidad(brasas)`; `deAfuera(b, i, en, dt, azar)`, `delMovimiento(b, i, en, dt)` | `brilloPorDensidad(brasas, dt)` (la inercia); `en.dt` antes de llamar (sin `dt` por parámetro) | Q1.c (la densidad con inercia) y la basura por cuadro (los números no cruzan llamadas por brasa) |
| s70 · el piso del dominio | `poblar(d, b, piso, …)`, `repartir(d, b, piso, …)`, `objetivosDelReparto(d, piso, …)`, `armarElDominio(d, fov, aspecto, foco)` | el piso vive en el dominio: `armarElDominio(…, foco, piso)` y las demás sin `piso` | ídem (la basura por cuadro) |
| s68 · MODULOS, POR_CUADRO | 24 módulos; sin `reposo.ts` ni `dibujo/red.ts` | 26 módulos; `reposo.ts` (pasoDeLaRed, leerElGesto, formar, cortar, enlazar, chasquear, soltar) y `dibujo/red.ts` (rellenarRed) sin reservas | Q1.d (la red en reposo) |
| s70 · control «una reaparición adentro del cuadro» | la brasa 3 a los 200 cuadros | la más encendida a los 200 cuadros | con `desenlazar` las trayectorias cambiaron y la brasa 3 ya no estaba adentro del cuadro en ese momento (el control era frágil: dependía de dónde cayera una brasa) |
| s70 · Q1.c (la corrida) | `repartir` en cada cuadro | `repartir` sólo con la red suelta (como el producto) | Q1.d |
| s49 · quieto en el pie | gira sin fin (4,5°/s) y se aleja hasta 17 u | se queda (`giroGradosS` y `alejaHasta` en 0); la vuelta con tope se prueba desde un giro y un alejamiento forzados | Q2 (el pedido: sin el giro en espiral ni el alejamiento; cerca, desde arriba, el pie entero) |
| s49 · el cableado del final | `d = Math.min(d, profundidadDelFinal(CAMARA_SIN_EL_MOUSE))` (las piezas van con la cámara que sube) | `const camara = enElFinal ? CAMARA_ANTES_DEL_FINAL : CAMARA_SIN_EL_MOUSE` y `aplicarLaCaida` | Q2 (las piezas caen desde la pared quieta) |
| s50 · la secuencia dura | `golpeS + 1.7` | `golpeS + CAIDA_DEL_PIE.hastaS` (4,5) | Q2 (las piezas caen después del logo) |
| s50 · de frente | `colocarLaPieza(a.grupo, CAMARA_SIN_EL_MOUSE,` | `colocarLaPieza(a.grupo, camara,` con la cámara de antes del final en el final | Q2 |
| s44 · fija en el mundo | `colocarLaPieza`/`profundidadDeLaPieza` con `CAMARA_SIN_EL_MOUSE` | con `camara` (la de sin el mouse, o la de antes del final) | Q2 |
| s52 · la vuelta del quieto | desde `alejaHasta` | desde 17 u (el alejamiento que tenía) | Q2 (`alejaHasta` es 0) |
| s52 · la calma del piso | `return uCalmaDelFinal * ( 1.0 - smoothstep( … distanciaAlLogo( xz ) ) );` (y su control) | `return max( delPie, … )`: también bajo el pie acostado | Q2 |
| s52 · la salida del fondo | la cámara de punta a punta en 1,2 s | en 0,95 s, mirando 0,13 adelante (el mensaje lee las constantes) | Q2 (el reloj más largo hace la subida más empinada en `fin`) |
| s57 · sin el círculo liso | `distanciaAlLogo( xz ) ) );` | `distanciaAlLogo( xz ) ) ) );` (la misma distancia, adentro del `max`) | Q2 |
| s62 · la secuencia (D) | `D_DUR` = golpe + 1,7 | `RELOJ_DEL_FINAL.duracionS` | Q2 |
| s47 · lo interactivo espera (A4) | `uCuantasSombrasDelPie.value = 0` («sombra del pie, ninguna») | `= enElFinal ? sombrasDeLaCaida(s.caida, segundos) : 0` | Q4.2 (1): de pie en la pared sigue sin sombra; las que caen en el final, con su sombra de contacto |
| s52 · sin sombras del pie (A4) | `uCuantasSombrasDelPie.value = 0`, sin `sombraDe(` ni `uSombrasDelPie.value[` en `armadas.ts` | la misma línea con `enElFinal ? … : 0`; dos controles (las sombras de antes; también de pie) | Q4.2 (1) |

## Crítica (lo que el banco mostró y qué se hizo)

- Q1 · la siembra en la esfera, el piso en el horizonte, las mudadas apagadas, `llena` inalcanzable y los discos borrosos de día: en
  Q1.b (cada uno con su arreglo).
- Q1 · 61 KB de basura por cuadro (de 16): en Q1.b («sin basura por cuadro»). El perfil del heap atribuía todo a `pasoDeLasBrasas`
  y Node no lo reproducía: el discriminador fue correr la misma medición dentro del Chrome del banco con los objetos vivos.
- Q1 · el reparto no mudaba nada con el encuadre que cambia (la cuenta por celda nunca superaba 1,6× con un desnivel suave): 1,2×.
- Q1.d · rayos de lado a lado (brasas que saltan con su enlace puesto; la pareja de la física del otro lado del dominio, un defecto
  de Q1.b que ya estaba), brasas que derivaban mientras se formaba, un puntero lento que no cortaba: en Q1.d, cada uno con su arreglo.
- Q2 · el borde equivocado (piezas sobre el logo), los enlaces apilados, la bajada de 1,4 u por cuadro, el formulario lento y la
  salida del fondo que pasaba los 3 s: en Q2, cada uno con su arreglo. Lo que NO se pudo ver: el sitio real (VERIFICAR TRAS REINICIO:
  `reconstruir.sh`, bajar al pie a 1440 y 1920, dejar correr 9 s, mirar el DOM acostado sobre cada pieza, escribir en el formulario
  acostado, clic en un enlace acostado, un scroll hacia arriba (el rebobinado levanta todo) y el reinicio).
- Q4.2 (1) · el rectángulo salía pleno apenas arrancaba el vuelco (una placa casi de pie con una sombra nítida de 4 u detrás, en
  `q4-sombras-5.6`): la altura media de la placa sobre su huella (`q4b-sombras-5.6`).
- Q3 · la clave `cristal: 'si'` por defecto puso rojas s38 y s31 (los tests de ausencia): la prueba se nombra por lo que pide
  (`sin-cristal`), sin tocar tests.
- Final · el build de medición con 3,5 GB libres disparó el reaper de Claude Code (870 MB) y dejó huérfanos: matados por línea de
  comando antes de seguir; el banco del sitio queda para después del reinicio.

## Lo que no quedó bien

1. **El sitio real no se vio en todo el sprint.** Todo lo nuevo se vio en el mini-banco (el plasma, la red, el cristal, el pie con
   cajas) y nada en `/v3`: la red en reposo sobre los títulos 3D y entre los textos, el DOM acostado sobre cada pieza del pie (el foco,
   el autocompletado, los clics, el rebobinado con un scroll, el reinicio), el cristal detrás de los textos y en el fundido del túnel y
   de Tu panel, el amanecer sobre el cristal, las 12 sombras en el piso vivo del final y su costo, la anisotropía en el horizonte de la
   cúpula. El procedimiento exacto está en «Medido» (reconstruir → p-tanda → p19-sitio → p19-recibo → la matriz).
2. **Sin medición del sitio:** ni los ms por cuadro en frío/calma/máxima/noche (PULIDO 18 dejó 5,7 / 2,76 / 3,67 / 2,91 a 1440 y
   `frio.mayoresDe20 = 10`), ni los tirones en frío antes/después (el ítem 11 de la auditoría quedó en PENDIENTE: no se tocó el primer
   scroll), ni los cuadros durante la caída del pie con las sombras. Lo medido es el mini-banco: ningún cuadro de más de 20 ms en calma,
   al máximo, de día, de lejos, en el teléfono, con la red armada y con el cristal.
3. **La matriz de 12 anchos no corrió** (pide el banco del sitio).
4. **De la auditoría (Q4.1), 2 de 20 hechas** (las sombras del pie acostado y la anisotropía) más 2 que ya traía el sprint (la física
   del polvo apagada, la basura del plasma); 4 OK sin tocar; 1 descartada (el reflejo planar); 11 PENDIENTES, casi todas porque piden
   ver el sitio (la oclusión del labio del hueco, el satinado del logo, el filo del encastre a 390, la niebla de altura, el montaje
   progresivo y los tirones en frío, el mapa de entorno del cristal, el amanecer sobre el cristal, la red sobre los títulos 3D, el pie
   acostado con la órbita del mouse).
5. **El cristal** refleja un cielo por altura (no un mapa de entorno real) y su brillo se suma sobre la copia ya mapeada a tono (en
   espacio de salida); la dispersión sólo con `?espejo-prisma=si`. Es lo que se pudo hacer sin verlo en el sitio.
6. **La sombra de una placa que vuelca** es un rectángulo con un alfa y una blandura (los de su altura media), no un degradé a lo largo
   de la placa: a mitad del vuelco es una mancha pareja y tenue. Se ve bien en el mini; en el sitio, a confirmar.
7. **Lo que sigue igual que la base:** s8-montaje con sus 2 rojos y los 8 rojos de `verificar` (s1, s17, s2, s3, s4, s5, s7, s8) con
   sus 105 afirmaciones en falla, ni una más.
