# SPRINT PULIDO 11 — la verificación pendiente, los forms definitivos, la caída del logo, el pie simétrico, mobile, hilos y giroscopio

Rama `rediseno/home`. Invariante nuevo: `npm run test:s62-pulido-11` (`src/app/v3/_lib/__tests__/s62-pulido-11.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (fuera del repo: Tailwind 4 escanea todo lo que `.gitignore` no excluye).
Entregas (hojas): `docs/rediseno/entregas/pulido-11/`.

Aprobados (no se tocan): J1 (1024), J3 (el loader en el botón), J8 (el pie 25/50/25 como idea), Demos (llega bien), la carga
con GIRO. El túnel no se toca (k = 1,8). `src/app/v3/_lib/motion/lente.ts` figura modificado sin cambios de contenido (sólo
el fin de línea): no entra en ningún commit.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### Fase A · lo que quedó sin ver de PULIDO 10, más bugs nuevos
- HECHO: A1 · J2, el cuadrado negro de Contacto, con `Page.startScreencast` — VISTO sí. Causa medida (no hipótesis): con las
  cinco caras pintadas de colores puros, a 1440 desde el hero y desde Portfolio, en los cuadros del compositor de ~378 a
  ~406 ms la cara de ATRÁS asomaba como un rectángulo chico en el medio (la hoja todavía sin rasterizar y la placa lejos, en su
  viaje). Era el cuadrado negro (la cara era de tinta hasta PULIDO 10; con el papel quedaba un rectángulo claro). Arreglo: las
  caras están desde el montaje (el espesor de s49) pero ocultas hasta que el viaje terminó (`llego`). Después: 0 cuadros con
  una cara a la vista en el viaje (antes, 2 y 1); con el mouse a un costado el espesor se ve. A 390 la placa está apagada (sin
  caras). `s62` A1
- HECHO: A2 · Quiénes somos: el titular sobre el logo y el último renglón del cuerpo — VISTO sí.
  - Por qué J1 no lo vio: su instrumento medía sólo el REPOSO (el destino del viaje de la barra). Barriendo la ENTRADA
    (`a2-quienes.ts`, cada 48–60 px, el mismo detector) el titular 3D cruzaba el logo entre ~330 y ~90 px antes del reposo, a
    1024 × 768, 1280 × 800, 1366 × 768, 1440 × 900 y 1920 × 1080 (no sólo a 1024): sube desde abajo del cuadro hasta arriba del
    logo, que en la entrada ya está en el medio. El tramo libre (arriba del logo) es corto: 30–90 px antes del reposo.
  - Arreglo (`esquivaDelLogo.ts`): mientras la sección entra, un título con `esquivaElLogo` pide 0 si su caja cruza la del logo
    proyectado (muestras de sus vértices); libre, llega con un mínimo de 0,9 s (la llegada se ve entera aunque el tramo sea
    corto). Las cuatro partes del titular esquivan con la caja del bloque (con la de cada una, «Queremos hacer» y «no» llegaban
    solos: visto en el banco y corregido). En el reposo no esquiva nada (lo que la composición deja ahí es lo que se ve).
  - El cuerpo: su bloque usa la ventana visible, que termina cuando su pie sube 240 px sobre el borde; en el reposo su pie queda
    a ~36 px y llegaba con el 48 % de la ventana: el último renglón a media máscara (a 1024 y 1280, y en todos los anchos de
    escritorio). Lo que llega al canal termina cuando el pie toca el borde (`llegadaHastaElPie`); la ventana no se tocó (el viaje
    del menú la lee para su reposo).
  - Recibos: `docs/rediseno/entregas/pulido-11/solapes-entrada-*.json` (cinco cuadros, NVIDIA): cero solapes de que la sección
    asoma al reposo. `s62` A2.
  - Fuera de alcance, anotado: en la SALIDA (camino a «El equipo», de +38 a +422 px a 1024) el logo de canto cruza el cuerpo.
- HECHO: A3 · mobile, el cartel de Portfolio corrido y cortado — VISTO sí. J7 se verificó a 375 y 390 llegando por scroll, por
  el menú y desde el CTA del hero (`a3-portfolio.ts`, cuadros del compositor): el cartel llega entero, sin recorte, y la página
  no se puede correr de costado (`a3b-desborde.ts`: scrollWidth = ancho en 13 alturas). Lo «corrido a la izquierda y cortado»
  era la HUIDA hacia el túnel (pasado el reposo): el cartel va de margen a margen y su `translateZ` lo agranda desde el centro;
  a ~1,2× («ortfolio», «ada uno de estos…») la opacidad todavía era ~0,7. Abajo de 1024 se desvanece al ritmo de su
  agrandamiento (0 justo cuando tocaría el borde); la pose del túnel no cambió (el túnel no se toca). Después, a 390: con el
  borde en [−1, 391] la opacidad ya es 0. `s62` A3
- HECHO: A4 · b · el velo de noche en Quiénes somos (abajo de 1024) — VISTO sí. Reproducido: subiendo de Portfolio la noche
  se retira con su curva (~0,3 s con un salto) y «Franco», «Valentino», «Nosotros» y sus párrafos quedan sobre el logo de noche
  (gris): la mezcla da gris sobre gris (sin velo, 4,04 y 3,52:1). Medido en el banco y no a ciegas: el velo NO puede ir en el
  texto que mezcla (quedaría adentro del grupo que se mezcla); va en su caja (`data-velo-de-noche`, que no mezcla, no transforma
  ni se esfuma: la cadena de la mezcla sigue entera; s7-mezcla verde), detrás (z −1), con la tinta de la noche que se ve
  (`--noche-de-la-sala`, la escribe la sección mientras está a la vista). Con 80 % daba 4,91 y 4,82 (justo); con 92 %, 5,65,
  5,51 y 5,19:1 (`entregas/pulido-11/velo-de-noche.json`). `s62` A4b
- HECHO: A4 · e · el CTA abajo de 1024 — VISTO sí (390 y 768). Antes, en la lista, las copias de «Seis razones» y de los seis
  valores aparecían en el medio del bloque clavado y se volteaban en la frase («de la nada»). Ahora las copias no se ven (sólo
  le dan a la escena de dónde medir); las piezas en volumen están ya formadas y se deslizan, cada grupo en su plano anclado en la
  sala: la frase desde la izquierda y HABLANOS (con su subrayado) desde la derecha, con el mismo avance (terminan juntos), función
  del scroll y reversibles, sin volteo ni giro. El enlace del DOM va con HABLANOS y se puede tocar al 90 % del deslizamiento. El
  tramo arranca a 0,2 del bloque (era 0,5: una pantalla de scroll con el logo solo; medido: el logo ya está abajo a r ≈ 0,1) y
  termina a 0,6. Sin WebGL, el texto del DOM llega con el mismo tramo. En escritorio no cambió nada. `s62` A4e
- HECHO (sin cambio de código): A4 · g · WhatsApp a 375 — VISTO sí: no se corta. El mail y WhatsApp (su rótulo corto) entran en
  una fila con 5 px de aire (de 32 a 338 en una columna que termina en 343), a DPR 1 y 3; si no entraran, la fila ya está con
  `flex-wrap` y WhatsApp pasa a su renglón (lo dejó así NOCTURNO FINAL C4 y lo fija s52). No se reprodujo el corte del humano.
- A4 · «Seis razones» punteado en mobile — NO REPRODUCIDO. A 390 (DPR 1 y 3) mientras amanece la lista va con el halo denso
  (NOCTURNO FINAL D2) y los ítems que llegan se ven tenues; no hay un tramado en el DOM abajo de 1024. Lo más parecido a
  «punteado» son las motas del polvo delante del texto. Queda para la matriz (G) y para que el humano diga dónde lo vio.
- HECHO: A5 · J10, el polvo con un toque, en el banco — VISTO sí (1440 × 900, NVIDIA, `a5-polvo.ts`): posado del todo, UNA
  muesca de la rueda (100 px, de verdad) y los modos cada 250 ms: todas en el aire a los 9,3 s (ninguna cae antes), la primera
  cae a los 15,7 s (6,4 s en el aire) y a los ~22 s están posadas otra vez. Cumple J10 (el modelo de s61 decía 7,0 y 15,6: la
  subida real es un poco más lenta). Recibo `entregas/pulido-11/polvo-con-un-toque.json`; `s62` A5

### Fase B · los forms definitivos (pie y modal): volteo, éxito y error
- CÓDIGO HECHO · BANCO PENDIENTE (memoria: ver «VERIFICAR TRAS REINICIO»). Los seis van en un commit: tocan los mismos archivos
  (los dos formularios, la placa 3D del pie y la tarjeta nueva). Gate: lint de los tocados, tsc, s53–s62 y las suites de los tests
  que cambiaron (s1-tokens, s3-tokens, s6-tokens, s39, s44, s49, s50): verdes. s62: 50 afirmaciones (23 de B).

**El diagnóstico (medido antes, con el build viejo, `b-formulario.ts` a 1440):** en el pie, el éxito no tenía cuadros de más de
20 ms (el más largo, 13,9); el error, dos de 200 y 213 ms: la placa 3D se rearmaba dos veces, por el texto del error en relieve y
por el rótulo nuevo de la tecla («Reintentar»). La tarjeta de gracias era más chica que el formulario y su columna se recentraba:
la nueva aparecía corrida al cambiar de canto (el salto), y su título no entraba («mensa e»). Y la tecla 3D tiene el rótulo en
RELIEVE en la geometría: mientras viajaba, la carga del DOM convivía con el relieve hasta el rearme (B4).

- B1 · el volteo (`_lib/formularios/volteo.ts`, las mismas curvas en el DOM y en la placa 3D): la tarjeta del resultado guarda la
  caja del formulario (`alto`, medido al enviar), así que las dos comparten el eje. `?volteo=centrado` (el de siempre: 180° en un
  movimiento sobre el eje del medio, 0,9 s) y `?volteo=columpio` (bisagra en el borde de arriba: la que estaba cae 90° hacia
  adentro en 0,42 s, acelerando —cúbica de entrada—; de canto se cambian y la nueva vuelve 90° saliendo y se asienta con un
  resorte subamortiguado, ζ 0,62 y ω 11 rad/s: un rebote de 7,5° y el segundo de 0,6°, 0,95 s). El hundido y `?gracias=` se
  borraron. En 3D el DOM se apaga mientras voltea (en las dos direcciones) y la escena avisa al terminar (`VOLTEO_TERMINADO`).
  La tarjeta no se extruye (`data-sin-volumen`): la placa del resultado es lisa (sin texto en relieve que armar) — ésa es la
  geometría «al montar» de J4·a. Los cuadros de más de 20 ms: PENDIENTE de banco.
- B2 · el éxito ENCAJA (`_componentes/formularios/EncajeDelLogo.tsx`, SVG con Motion, sin lienzo propio): una ranura con la forma
  del logo (un pozo con la sombra de su borde adentro) y la pieza que baja desde más cerca (arranca quieta y acelera), entra al
  ras con un rebote mínimo, suena el pestillo en el contacto, la onda de luz clara sale de la ranura (el contorno que se abre y
  un resplandor) y el borde se enciende; después, el texto: «Recibido. Te contestamos pronto.» (el copy pedido, tal cual). La
  alternativa `?exito=` no se hizo: el encaje cubre lo pedido y una segunda versión no la pidió nadie todavía.
- B3 · el error NO ENCAJA: la pieza cae torcida, choca arriba de la ranura (no entra), el borde se enciende en ROJO con un
  resplandor, rebota y queda afuera, corrida y apoyada; suena el pulso (el golpe grave del logo: no se agregó un sonido nuevo al
  sprite). El rojo, primer color fuera del monocromo, es token del tema: `--color-error: #E5484D` (el borde: 4,82:1 sobre la
  tarjeta clara #111111 y 4,93:1 sobre la invertida #0E0E0E) y `--color-error-texto: #FF9592` (el título: 8,96:1 y 9,16:1).
  La tarjeta lleva el error del envío y «Reintentar», que vuelve al formulario con TODO lo escrito (ni el error ni Reintentar
  vacían o remontan los campos) y deja el foco en Enviar. El rechazo de J5 (el resorte de la placa y Reintentar girando en la
  tecla) se fue con `rechazo.ts`. «El logo de carga en el camino del error»: lo medido fue el relieve del rótulo conviviendo con
  la carga hasta el rearme (B4: ahora se apaga en el mismo cuadro); que no quede otra causa, PENDIENTE de banco.
- B4 · los rótulos se suceden: en el DOM del pie, la carga sólo con el botón ocupado y el rótulo invisible y mudo (guarda el
  ancho); «Reintentar» vive en la tarjeta del error, otra rama de la presencia (`mode="wait"`). En 3D las letras del rótulo llevan
  w = −1 (`geometria.ts`) y el sombreador las descarta con el botón ocupado (`uSinRotuloDelPie`, leído de `aria-busy` cada
  cuadro): el mismo cuadro, sin rearmar (el rótulo se sigue midiendo aunque esté mudo: `data-rotulo-de-la-tecla`). En el panel,
  la carga y la tarjeta son estados distintos de la misma presencia. Invariante: s62 B4.
- B5 · la carga: el giro es la de siempre (el trazo, de respaldo: `?carga=trazo`, sin WebGL, o con movimiento reducido, quieto) y
  gira sobre el eje del PALITO de la P (x 532–658 del trazado, sacado del `d` en s62), con el palito en el medio del área (el
  logo se corre lo que falta). «Sin cuadrado negro ni parpadeo»: PENDIENTE de banco.
- B6 · con el éxito los valores se vacían y al volver los campos son NUEVOS (la clave del grupo cambia: React los monta de cero,
  sin el estado del autocompletado, que no se borra cambiando el valor). El panel vacía sus datos y se cierra solo. El estilo y la
  posición del autocompletado (J6) y su simulación: PENDIENTE de banco (`b6-autocompletado.ts`, con `Autofill.trigger`).

**La revisión adversaria antes del commit** (un agente aparte, sólo lectura, sobre el diff entero). Encontró y se arregló:
1. un rearme de la placa 3D por otra cosa (la ventana cambió de tamaño, el zoom) en medio del volteo lo cortaba sin avisar: la
   tarjeta esperaba para siempre su encastre (sin texto ni botones). Ahora el corte avisa (`avisarQueTermino`);
2. un aviso viejo (el volteo de vuelta, después de Reintentar) podía arrancar el encastre de la tarjeta nueva escondido: el aviso
   lleva el estado que quedó a la vista y el formulario ignora el que no es el suyo;
3. la tarjeta podía ser más alta que el formulario (en el teléfono ~400 contra ~300 px; en 3D, hasta ~45 px): ahora mide
   EXACTAMENTE su alto; el lugar del encastre toma lo que sobra del texto y el logo se achica para entrar;
4. «Reintentar» tomaba el foco aunque la persona se hubiera ido a otra parte: ahora sólo si sigue en la tarjeta;
5. en los ~80 ms entre el cambio de estado y el rearme, lo nuevo del DOM (la ranura) se veía sobre la placa vieja: se apaga en el
   mismo cuadro (con un respaldo que lo prende si el aviso no llega);
6. menores: el borde de la ranura ya no anima un color hecho con `color-mix` (Motion no lo interpola: saltaba) — se enciende
   otro trazo encima, sólo con opacidad; el sonido del encastre, uno solo aunque React corra el efecto dos veces.
Revisado y descartado por el agente (con su motivo): la salida de la presencia, el orden del oyente, el cambio de `enVolumen` a
mitad, la pestaña oculta, el movimiento reducido, las claves, el cierre del panel, los relojes, el cableado del sombreador y la
fusión de geometrías, la firma de `medida.ts`, las referencias al rechazo, el eje de la carga y los tokens. Queda (no se tocó):
el `alto` medido al enviar no se vuelve a medir si el teléfono gira con la tarjeta a la vista; la tecla 3D saliente se ve sin
rótulo durante la primera mitad del volteo (el relieve apagado por «ocupado»): se ve como una tecla lisa que se va.

### Fase C · el pie simétrico y la cabecera mobile
- PENDIENTE: C1 · columnas del mismo ancho, distancias iguales al logo, «El recorrido» en una grilla, «Por qué develOP» a 1024
- CÓDIGO HECHO · BANCO PENDIENTE: C2 · la cabecera mobile: sonido izquierda, menú centro, progreso derecha, mismo tamaño y eje.
  Abajo de 1024 (salvo `?progreso=abajo`) los tres son discos de 48 px (el tamaño del botón del menú: su fondo, su borde y su
  sombra) arriba, en `max(16 px, env(safe-area-inset-*))`: el parlante a la izquierda (su lugar es fijo; lo sigue montando el
  infinito, así en escritorio queda encima de él como siempre), el menú al centro y el progreso a la derecha (el infinito al 70 %
  del disco, con su porcentaje debajo). El cartel del parlante, en la cabecera, va debajo y apoyado a su izquierda (encima se
  salía del cuadro: con J9 ya pasaba). Invariante: s62 C2. Sin banco: falta mirar 320, 375, 390, 414, 768 y 820, día y noche, que
  no tape nada (el titular del hero a 320, sobre todo) y la franja 860–1023 (ahí la barra puede estar en modo pastilla: el
  progreso arriba a la derecha podría chocar con su esquina de Contacto y Login — J9 ya lo ponía ahí; a medir).

### Fase D · el logo se cae y encastra
- CÓDIGO HECHO · BANCO PENDIENTE: D · `?caida=lenta|angulo`, física de cuerpo rígido, hueco sincronizado, impacto = golpe,
  rebobinado, reinicio (`_lib/escena/final/caidaAlHueco.ts`; invariante s62 D, 12 afirmaciones con sus controles).

**El sistema.** El logo vuelca sobre su canto de abajo y de atrás con la ecuación del vuelco de un cuerpo rígido, θ'' = κ·sen(θ − α)
(α = atan(espesor/alto) = 6,7°: parado, el centro de masa queda adelante del canto; κ = g·d/(k² + d²) = 8,1 s⁻² con la gravedad de
la escena, 26 u/s², la de la caída de antes), integrada con Runge-Kutta 4 en pasos de 0,5 ms y guardada en una tabla (función del
tiempo: el reloj del final la lee con `fin`, así el rebobinado la recorre al revés y el reinicio la vuelve a correr). Una placa
parada sobre su base no vuelca sola: primero se inclina hasta pasar 1,2° su equilibrio (0,5 s, trayecto de mínimo tirón: termina
quieta, la física arranca del reposo sin salto) y ahí la gravedad se la lleva: duda y después se va. Al tocar, rebota con
restitución 0,26 (la velocidad angular, dada vuelta) y la gravedad lo vuelve a bajar: un rebote de 3,5° y el segundo ya no
levanta (debajo de 0,35 rad/s queda asentado: 0,25 s después del golpe). El canto queda en el borde del hueco y, en los últimos 6°
(con el hueco ya abierto), baja por la pared del pozo: termina al ras y centrado; nada atraviesa el piso (medido cada 0,5 ms: 0 u).
- `?caida=lenta` (sin pedir, la del producto): baja PARADO hasta el piso delante del hueco (1,2 s), se inclina y cae como una
  ficha de dominó (1,75 s desde que la física arranca).
- `?caida=angulo`: desde donde está, se inclina en el aire y cae girando mientras su canto baja en arco hasta el borde del hueco
  (llega a los 60° de la caída; 1,33 s).
- El contacto es el golpe: la caída arranca lo que dura antes de `golpeS` (3,5 s del reloj; era el ras de la presión, 4,7), así
  toca exactamente en el cuadro en que suena el golpe, nace la súper onda y se enciende el filo (el código del golpe no cambió:
  cruza `fin` hacia adelante, una vez, nunca rebobinando). Lo de después dura lo mismo (1,7 s): la secuencia, 5,2 s (era 6,4).
  Al volver a tocar después del primer rebote, el golpecito de la cámara (era al tocar el piso, antes de la presión).
- El hueco se abre con el ÁNGULO de la caída (de 28° a 84°): cerrado hasta que cae, a medio abrir a los 45° y entero 0,03 s antes
  del contacto. El mar se calma antes de que empiece a caer (0,8–1,8 s). La cámara: el 80 % de su subida con el logo todavía de pie
  (hasta 2,6 s) y el resto mientras cae y se asienta (hasta 0,4 s después del golpe); su blanco baja al piso con el logo.
- Se fueron: el acostarse en su lugar, la caída derecha, la presión con su temblor y sus sacudones, `HUECO.abre`.

**Dos defectos que encontré antes del banco** (los dos, cerrados y con invariante): (1) la física arrancaba inclinada (7,9°: una
placa sobre su base tiene que pasar su equilibrio para volcar) y el logo saltaba de 0° a 7,9° en un cuadro — ahora se inclina antes
(s62 D5, con ese salto como control positivo); (2) la primera versión de `angulo` giraba sobre un eje fijo a media altura (el único
que lleva al logo parado a su lugar con un giro puro) y atravesaba el piso hasta 0,56 u durante 180 ms detrás del hueco — ahora
vuelca sobre su canto mientras el canto baja en arco (0 u).

**La revisión adversaria antes del commit** (un agente aparte, sólo lectura, con barridos en `tsx` contra los módulos). Encontró y
se arregló:
1. con la calma el piso deja de esquivar al logo (su techo se apaga de golpe con `calma > 0`); la calma arrancaba a los 0,8 s, con
   el pie de la lenta ya a 0,4 u del piso: los bloques de abajo saltaban ~0,29 u en un cuadro (y al revés en cada rebobinado), y
   el mar todavía se movía cuando el logo se apoyaba. Ahora la calma va de 0 a 0,7 s: arranca con el logo a 1,9 u y termina antes
   de que el pie llegue a 0,7 u (s62 D7, con la calma de antes como control);
2. el canto bajaba el espesor entero en los últimos 6° (28 ms: 0,47 u en un cuadro, un salto): ahora el hueco está entero a los
   62° y el canto baja por la pared en 0,15 s (ningún cuadro baja más de 0,3 u: s62 D5, con los 84° como control);
3. el golpe era fijo (3,5 s) y el arranque se acotaba: con un logo más alto el contacto llegaba después del golpe. Ahora el arranque
   es siempre `golpeS − la caída` y lo que se adapta es la bajada de la lenta (o la espera en el aire): contacto = golpe para logos
   de 4 a 6,5 u (s62 D2);
4. reservas por cuadro en un camino que corre en todo el sitio (claves de texto, arreglos, un objeto nuevo por llamada): ahora el
   último pedido se recuerda, el estado del reloj es un objeto reusado y sin final la sombra no hace cuentas;
5. parado en el piso el logo no tenía sombra (se apagaba al apoyarse) y la mancha de contacto quedaba en el centro, detrás de él:
   ahora la sombra va con el giro de la caída (parado la tiene al pie; se va mientras cae) y la mancha se va cuando el logo deja
   su lugar (s62 D7).
Queda a confirmar en el banco (no se tocó): la lenta trae al logo hasta 1,6 u por delante del plano donde se ponen las piezas 3D
del pie (antes, 0,6) a los ~0,8 s: si alguna se superpone en pantalla con el logo en ese momento, se cruzarían.

### Fase E · hilos de energía (`?hilos=si`)
- PENDIENTE

### Fase F · giroscopio (`docs/rediseno/GIROSCOPIO.md` + `?giroscopio=si`)
- PENDIENTE

### Fase G · verificación exhaustiva
- PENDIENTE

## Las aserciones viejas que cambiaron

| Punto | Dónde | Antes | Ahora | Por qué |
|---|---|---|---|---|
| A4e | `s54` B1 · el CTA es el producto | `<CtaTransformadoEnLaLista caja={cajaDelCta} progreso={transformacion} entrada={entrada} />` | sin `entrada` | Las copias de «Seis razones» ya no aparecen: el componente no la usa. Lo afirmado (montado en la lista, sin bandera) no cambió |
| B | `s1-tokens` · las líneas que entraron al tema | 51 líneas previstas | 53: + `--color-error` y `--color-error-texto` | El rojo del error es token del tema (B3), con su motivo en `padron-de-tokens.AGREGADOS` |
| B | `s55` · la fuente de la frase | la frase + «Gracias por tu mensaje.» | sólo la frase (y el script sin el título de gracias) | La tarjeta del resultado va en el DOM: ya no hay un título de gracias en relieve en Archivo |
| B | `s60` H2 2 · el volteo | `p('volteo', …)` y la duración de `TRANSFORMACION_DEL_PIE` | `p('centrado', …)` y `VOLTEO.centrado.s` | La misma cuenta con el nombre nuevo; el columpio se afirma en s62 B1 |
| B | `s60` H2 · el hundido | la afirmación del hundido y su control | borradas | El humano eligió el volteo para los dos formularios: el hundido se borró |
| B | `s60` H2 3 · los estados | `data-gracias`, `TarjetaDeGracias`, `ANUNCIO_DE_GRACIAS`, el error en el formulario | `data-volteo`, `TarjetaDeResultado` con `alReintentar` y `alOtro`, `ANUNCIO_DE_EXITO`, el error en su tarjeta | Lo afirmado (anunciado, con el foco; con error lo escrito queda) no cambió: cambió dónde se ve el error |
| B | `s60` H2 · la tarjeta enfocable | `ref={foco}` | `ref={lasDos(foco, raiz)}` | La tarjeta necesita su propia ref (Reintentar toma el foco sólo si sigue en ella); lo afirmado (enfocable, `tabIndex={-1}`) no cambió |
| B | `s60` H3 · el panel | `TarjetaDeGracias`, la cuenta del cierre desde que llega | `TarjetaDeResultado`, la cuenta desde que su texto está | El texto aparece después del encastre: el cierre cuenta desde ahí |
| B | `s61` J3 A/D · la variante de la carga | sin pedir: el trazo | sin pedir: el giro; `?carga=trazo`, el trazo; reducido: el trazo quieto | Lo pidió el humano (B5: «el giro, default») |
| B | `s61` J3 C · el rótulo del pie | tres rótulos (Enviar, Enviando…, Reintentar) | uno (Enviar) con `data-rotulo-de-la-tecla` | B4: Reintentar vive en la tarjeta del error |
| B | `s61` J4 · J5 | las transformaciones de gracias (volteo y hundido) y el rechazo | una sección «reemplazados en PULIDO 11 (B)» con cinco afirmaciones y sus controles: los dos voltean, la tarjeta lisa, el foco, la placa en su lugar, el rechazo se fue | Lo de antes no quedó colgado; lo nuevo, en s62 B |
| B | `s39` · el rótulo del envío | `enviando ? ROTULO_ENVIANDO : avisoALaVista ? REINTENTAR : ROTULO_DEL_ENVIO` | `enviando ? ROTULO_ENVIANDO : ROTULO_DEL_ENVIO` | B3: Reintentar vive en la tarjeta del error |
| B | `s44` · ninguna pieza gira | ninguna, salvo la tecla con Reintentar | ninguna (otra vez) | El giro de la tecla se fue con el rechazo |
| B | `s49` · la placa del panel | `<PlacaDelContacto activa={placa} rechazo={hundidoDelRechazo}>` | `<PlacaDelContacto activa={placa}>` | El resorte del rechazo se fue |
| B | `s50` · el paralaje de la placa | `z: rechazo` | sin `z` | ídem |
| C2 | `s61` J9 d · el progreso del teléfono | `top-[var(--spacing-4)]` … `flex-row` (el parlante en fila a su izquierda) | `top-[max(var(--spacing-4),env(safe-area-inset-top))]`, `right-[max(…)]`, sin `flex-row` | El humano pidió el parlante arriba a la izquierda y la zona segura; lo de J9 (arriba, `?progreso=abajo` el de antes) sigue |
| C2 | `s47` C1 · el cartel del parlante | la clase literal `absolute bottom-full …` | la misma base, con la rama de `abajo` (`cn(…)`): en la cabecera, debajo | Encima se salía del cuadro con el parlante arriba |
| C2 | `s47` D10 · el botón del menú (16 + 48) | `top-[var(--spacing-4)]` | `top-[max(var(--spacing-4),env(safe-area-inset-top))]` | La zona segura; sin recorte (o sin `viewport-fit=cover`, que el sitio no pide) vale 16 |
| D | `s50` 2A · la duración | `RELOJ_DEL_FINAL.duracionS === 6.4` | `=== CAIDA_AL_HUECO.golpeS + 1.7` (5,2) | El golpe es el contacto de la caída (3,5 s); lo de después, igual |
| D | `s50` 2B · se acuesta en su lugar | la pose de CIERRE como control; el centro quieto mientras se acuesta; cae derecho | termina acostado al ras, centrado y sobre el eje (las dos caídas); la cámara sube en paralelo y mira al eje | Cambió por pedido: la física, en s62 D |
| D | `s50` 2D · la presión | hundimiento en tramos que resisten y ceden (+ 2 controles) | borrado; queda: al ras al final y el hueco entero antes del contacto | Cambió por pedido: entra al ras con la caída y rebota (s62 D3) |
| D | `s50` 2E · el golpe | `FINAL_DEL_PIE.presion.hastaS` | `golpeDelFinal()` (= `CAIDA_AL_HUECO.golpeS`) | El golpe es el contacto |
| D | `s49` · el logo con `fin` | `acostado` monótono | `subida` (la cámara) monótona; el logo rebota (no es monótono) | La caída rebota por diseño |
| D | `s52-nocturno` B2 · `s52-pulido-1` P1 · `s54` · `s57` | `FINAL_DEL_PIE.presion.hastaS` | `golpeDelFinal()` | Ídem |
| D | `s52-pulido-1` P5 · el oscurecimiento por cuadro en un viaje | `≤ P2 × 1,6` exacto | `≤ P2 × 1,6 × 1,02` (la misma tolerancia de muestreo que ya tenía la cámara) | Con el golpe a 3,5 s el quiebre de la expansión cae entre cuadros distintos en P2 y en el viaje: 0,0905 contra 0,0903 |
| D | `s52-pulido-1` · las banderas sueltas | `rebobinado`, `angel` | + `caida: ['angulo']` | La bandera nueva |
| D | `s53` 6 · la sombra en la pose | entera a `fin` 0,3, nada a 0,45 | entera a 0,05, casi entera a 0,3 (parado), nada a 0,68 (el golpe); y en arco, monótona | La sombra va con el giro de la caída: parado en el piso la tiene al pie |
| D | `s51` 1C · al ras | `poseDelLogo(1, TAM, alRas)` | `poseDelLogo(1, TAM, 'lenta', alRas)` | La firma lleva la variante |
| A4e | `s59` 1 · tocable apenas se lee | `ctaTocable(p)` en `pointerEvents` y en Enter | `tocable(p)`, con `tocable = enLaLista ? tocableEnLaLista : ctaTocable` | En el escenario sigue siendo `ctaTocable` (lo de siempre); en la lista no hay giro: tocable al 90 % del deslizamiento |

## Memoria (antes de cada fase: disponible y no paginado)

| Cuándo | Disponible | No paginado | Nota |
|---|---|---|---|
| Al empezar (PC recién reiniciada, sin dev server) | 4437 MB | 653 MB | Commit 10,5 / 27,0 GB |
| Fase A · el banco contra un build de PRODUCCIÓN (`next start`, ~0,3 GB) en vez del dev server (~2,5–3,7 GB) | 7401 MB | 683 MB | El build de medición va a `.next-probe` (ignorado) con un worker y 4 GB de heap (~2,3 min); el `prebuild` se deja pasar con `MEDIR_CON_LA_LLAVE_PRENDIDA=1` (la salida de emergencia documentada, sólo para medir). Todo pedido a `/api/` lo intercepta el banco (`Fetch`) y nunca llega a la ruta |
| Fase A · un Chrome por tanda (lanzado una vez, cada script se pega a su página) | 6054–7900 MB | 683–774 MB | Cuatro tandas (cerrado durante cada build): el no paginado no pasó de 0,8 GB |
| Fase B · antes de compilar para el banco (Chrome del banco y `next start` cerrados) | 2896 MB | 824 MB | < 3 GB: el banco NO se abre |
| Fase B · al volver a mirar | 755 MB | 871 MB | Abiertos en la PC: Discord, Spotify, una app de Java, Acrobat, Epic, Chrome. No se cierra nada del usuario: B queda en «VERIFICAR TRAS REINICIO» |

## VERIFICAR TRAS REINICIO

Con ≥ 3 GB disponibles (`npx tsx banco11.ts memoria`). Los scripts, en `~/.cache/b4-medicion/pulido-11/_scripts/`; el scratchpad de
la sesión tiene `compilar.sh` y `servir.sh` (si se perdió: `CIRCLE_NODE_TOTAL=1 NODE_OPTIONS=--max-old-space-size=4096
MEDIR_CON_LA_LLAVE_PRENDIDA=1 E2E_DIST_DIR=.next-probe npx next build` y `E2E_DIST_DIR=.next-probe npx next start -p 3000`).

**Fase B (los formularios).** Compilar, servir y `npx tsx banco11.ts lanzar`; después, en orden (cada uno escribe su carpeta en
`pulido-11/b/` con la hoja de 8 cuadros del recorrido y un `.json` con el cuadro más largo y los de más de 20 ms):

```
npx tsx b-formulario.ts 1440 900 pie lento b1 ; npx tsx b-formulario.ts 1440 900 pie error b1
OTRO=1 npx tsx b-formulario.ts 1440 900 pie lento b6 ; REINTENTAR=1 npx tsx b-formulario.ts 1440 900 pie error b3
npx tsx b-formulario.ts 1440 900 pie lento col "volteo=columpio" ; REINTENTAR=1 npx tsx b-formulario.ts 1440 900 pie error col "volteo=columpio"
npx tsx b-formulario.ts 1024 768 pie lento b1 ; REINTENTAR=1 npx tsx b-formulario.ts 1024 768 pie error b3
npx tsx b-formulario.ts 768 1024 pie lento b1 ; REINTENTAR=1 npx tsx b-formulario.ts 768 1024 pie error b3
npx tsx b-formulario.ts 390 844 pie lento b1 ; REINTENTAR=1 npx tsx b-formulario.ts 390 844 pie error b3
npx tsx b-formulario.ts 1440 900 modal lento b1 ; REINTENTAR=1 npx tsx b-formulario.ts 1440 900 modal error b3
npx tsx b-formulario.ts 1024 768 modal lento b1 ; npx tsx b-formulario.ts 768 1024 modal lento b1 ; REINTENTAR=1 npx tsx b-formulario.ts 390 844 modal error b3
npx tsx b-formulario.ts 1440 900 modal lento col "volteo=columpio" ; npx tsx b-formulario.ts 390 844 modal error col "volteo=columpio"
npx tsx b6-autocompletado.ts 1440 900 ; npx tsx b6-autocompletado.ts 390 844
npx tsx banco11.ts cerrar
```

Qué mirar: en cada hoja, el volteo sin salto (la tarjeta del tamaño del formulario, en su lugar), el encastre (éxito: la pieza al
ras y la onda; error: el choque, el borde rojo y la pieza afuera), el texto entero (sin «mensa e»), la carga girando sobre el
palito sin cuadrado negro ni parpadeo, y nunca la carga con un rótulo encima; en el `.json`: `mayoresDe20EnTodo` vacío (si el
retorno al formulario rearma caro, cachear la geometría de la forma en `armadas.ts`), `trasReintentar` con los tres valores,
`focoTrasReintentar` = Enviar, `trasOtro` vacío; en el de autocompletado, `autocompletado: true` en el nombre y el mail (si
`simulado` dice NO, el CDP de este Chrome no lo soporta: anotarlo y mirarlo a mano), la captura con el campo sobre su pozo, y
después de «Enviar otro», `autocompletado: false` y los valores vacíos. Después, el recibo a `docs/rediseno/entregas/pulido-11/`
y su afirmación en s62 B1 (los cuadros).

**Fase C (el pie y la cabecera).** `npx tsx c1-pie.ts 1024 768 ; npx tsx c1-pie.ts 1280 800 ; npx tsx c1-pie.ts 1440 900 ; npx tsx
c1-pie.ts 1920 1080` (las distancias columna–logo y logo–formulario, el centro del logo, las filas de «El recorrido», «Por qué
develOP» contra su columna; C1 se diseña con esos números). Para C2, `a4-movil.ts` no alcanza: capturas arriba de la página a 320,
375, 390, 414, 768 y 820, día y noche (con `?progreso=abajo` también), y a 900 y 1000 (la barra en modo pastilla: ¿choca su esquina
con el progreso?).

**Fase D (la caída).** `npx tsx d-caida.ts 1440 900 lenta ; npx tsx d-caida.ts 1440 900 angulo ; npx tsx d-caida.ts 390 844 lenta ;
npx tsx d-caida.ts 390 844 angulo` — la corrida en vivo (hoja de 12 cuadros, `golpe` con la pose del logo justo antes y en el golpe,
`mayoresDe20`), el rebobinado y el reinicio (hoja de 12) y la hoja con el reloj clavado en los 12 momentos. Mirar: que llega parado
y vuelca sin salto, el hueco abriéndose con la caída, el golpe en el contacto, el rebote chico, nada atraviesa el piso, el
rebobinado al revés y el reinicio entero.


## Lo que no quedó bien

(se completa al cierre)
