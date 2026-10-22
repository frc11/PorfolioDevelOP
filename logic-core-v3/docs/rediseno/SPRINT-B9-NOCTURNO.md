# SPRINT B9 · NOCTURNO 2026-10-22 · El cristal que se agrieta

Tarea: `docs/cola/2026-10-22/31-B9-grietas.md`. Worktree `C:\nocturno\2026-10-22\b9`, rama `nocturno/2026-10-22-b9`, nacida de B8
(`c6ef6348`). Lo que decidió Valentino: la firma del sitio. Las grietas nacen en varios puntos del cristal y se forman a la vista (~1,5 s),
quedan oscuras (~1 s) y se iluminan con una luz fina (neutra en el home, con el acento en las páginas); al pasar el punto hacia arriba, se
cierran en reversa. `?grietas=1|2|3` (telaraña, fractura larga, por las juntas). En el teléfono, compactas; con movimiento reducido, de
una. En el material del cristal, sin partir la geometría. Sonido sólo con un CC0 bueno.

## Plan

**Dónde va.** El cristal es UN muro (`cristal/muro.ts`): un cilindro de radio 37 y 44 de alto alrededor de la sala, partido en celdas de
Voronoi, con un solo material (`cristal/vidrio.ts`) que refracta el fondo. Las grietas van en ese fragmento: cada píxel del muro se lleva
al muro DESENROLLADO (el ángulo por el radio y la altura desde el piso), alrededor del centro de las grietas, y mide su distancia a los
tramos de grieta. La geometría no cambia (los mismos atributos).

**Cómo se trazan** (`cristal/trazado.ts`: el muro desenrollado, la ventana y la rejilla; `cristal/formas.ts`: las tres formas; puros). Cuando se piden, el cristal mira dónde la cámara ve el muro (los rayos de una grilla del
cuadro: la ventana) y traza ahí la variante, siempre igual para la misma ventana (la semilla). Cada tramo lleva cuándo le llega el frente a
cada punta (0 a 1 de la formación): se forman desde los impactos hacia las puntas y se cierran al revés.
- `1` telaraña: 3 a 5 impactos (2 o 3 compacta) separados; de cada uno, 7 a 10 rayos (5 a 7) en estrella, quebrados apenas, con ramas y
  los anillos de la telaraña; los impactos nacen escalonados.
- `2` fractura larga: 2 o 3 líneas (1 o 2) que entran por un borde y cruzan hasta el de enfrente, con 2 a 4 bifurcaciones (1 o 2).
- `3` por las juntas: el árbol más corto por los bordes compartidos de las celdas (Dijkstra con el largo un poco al azar, así se
  ramifica) desde 2 o 3 semillas (1 o 2), hasta un alcance; alguna junta más cierra una celda.

**Cómo las lee el sombreador** (`cristal/grietasDelVidrio.ts`). Una rejilla de 48 × 32 celdas sobre la caja de las grietas: cada celda con
la lista de los tramos que pasan a menos del margen (0,5 u), en dos texturas flotantes (la lista y la tabla de tramos). El fragmento
busca su celda y mide sólo contra esa lista (a lo sumo 48). Todo detrás de una uniforme (`uGrietas.z`): sin grietas, una comparación.
- la banda oscura (2,5 px): de día oscurece el vidrio a la mitad; de noche, un gris tenue (0,13): una grieta oscura sobre el negro no se ve;
- la luz fina: un núcleo de ~1 px (1,35) y un halo corto (2,4 px, 0,22) en el color de las grietas; corre del impacto a las puntas al
  encenderse y vuelve al apagarse.

**El reloj** (`cristal/grietas.ts`, puro, sin three): avance = formarse 1,5 s, oscuras 1 s, encenderse 0,7 s; reversa = apagarse 0,5 s y
cerrarse 1,5 s (la formación al revés). La formación que se ve, rápida al quebrarse y lenta en las puntas.

**El disparador** (`grietas.ts`): `dispararLasGrietas(sentido, página)` escribe una señal (`GRIETAS_EN_VIVO`) que el cristal lee en su
cuadro (`cristal/grietasEnVivo.ts`, llamado desde `CristalDeLaEscena.tsx`). Un pedido de otra página se ignora; si la página cambia, las
de la otra se borran en el acto (pasa tapado: el velo o el viaje).
- **Páginas:** `TituloDePagina.tsx` pide `avance` cuando el título terminó de entrar (abierta la entrada, armado, más su llegada: el
  mismo reloj que suelta el scroll). Sin volumen (abajo de 1024), con el `h1` a la vista y el mismo reloj. Se quedan.
- **Home:** `grietasAlVolverseElCta(sentido)` con la firma del enganche de B3 (`'ida' | 'vuelta'`): la línea va en `enganches.ts` al
  integrar (abajo).

**Banderas:** `?grietas=1|2|3|no` (defecto `1`; `no` las apaga, la base del banco) y `?grietas-prueba=si` (verlas solas: un ciclo que las
forma, las deja encendidas 3 s, las cierra y vuelve a empezar, en cualquier página de /v3).

**Archivos.** Nuevos: `cristal/grietas.ts`, `cristal/trazado.ts`, `cristal/formas.ts`, `cristal/grietasDelVidrio.ts`, `cristal/grietasEnVivo.ts`,
`__tests__/s78-b9.invariant.ts`, `scripts-carga/grietas.ts`. Tocados: `cristal/vidrio.ts` (el trozo y sus uniformes),
`cristal/CristalDeLaEscena.tsx` (crearlas, soltarlas y su cuadro; compactas con la misma lectura que decide la calidad),
`ruta/RanuraDeLaVariante.tsx` (exporta `acentoDelToken`, sin cambiar lo que hace), `_componentes/titulos3d/TituloDePagina.tsx` (el
enganche de las páginas: archivo de B13 nombrado por la tarea), `package.json` (`test:s78-b9`).

## Log

**Lo que se encontró midiendo sin navegador.** Desde la composición de una página (y desde casi todo el recorrido del home) la cámara ve
sólo el PIE del muro: una franja de ~55 × 8 u a 1440 (17 × 8 u a 390), arriba del horizonte del piso. La primera versión medía las formas
por el lado corto de la ventana: grietas diminutas, `juntas` sin alcanzar ni un borde de celda y hasta 70 tramos por celda de la rejilla.
Ahora el tamaño es el alto o, en una franja baja, el 30 % del ancho; la rejilla tiene celdas casi cuadradas (hasta 1536, `nx × ny` según
la caja) y desde una semilla sus juntas se agrietan siempre. Con eso: a lo sumo 28 tramos por celda (el lazo, 64) y 2866 entradas
(caben 8192) en las 36 combinaciones medidas.

**Las decisiones que no estaban escritas** (una línea cada una):
- **El defecto es `1` (telaraña)**: la primera de la lista y la que más se lee como «vidrio que se rompe».
- **Con movimiento reducido no hay grietas**: el cristal no se monta con movimiento reducido (PULIDO 20, la regla de la dimensión espejo:
  «con movimiento reducido, ninguno»). El reloj ya las pone de una (probado); para verlas así hay que montar el cristal con movimiento
  reducido (`|| quieto` en `CristalDeLaEscena.tsx` y el control de s70): se decide con Valentino.
- **Nacen donde la cámara mira el muro** en el momento del pedido y después quedan fijas en el cristal (la cámara de la intro gira: se
  mueven con la pared).
- **En las páginas, el momento** es el mismo reloj que suelta el scroll: la entrada abierta, el título armado y su llegada (2,4 s). Abajo
  de 1024 (sin título en volumen), la entrada abierta más el mismo reloj. Se quedan: ni la caída ni la nueva llegada del título las piden.
- **Al cambiar de página se borran en el acto** (pasa tapado: el velo o el viaje); un pedido de otra página se ignora; un lienzo que se
  rehace (cruzar 1024) vuelve a formar las de la página.
- **De noche, «oscuras» es un gris tenue** (0,13): una grieta oscura sobre el negro no se vería.
- **La luz corre del impacto a las puntas** (y vuelve al apagarse), con un frente de 0,3 de la formación.
- **La reversa: primero se apaga (0,5 s) y después se cierra (1,5 s)**, sin la espera oscura; a medio formarse, se cierra desde ahí.
- **La variante se lee al agrietarse** (no al montar): `?grietas=` vale en la página donde se pide.
- **`?grietas=no`** queda para la base del banco; **`?grietas-prueba=si`** es la página de prueba (un ciclo en cualquier página de /v3).
- **El sonido, preparado sin archivo**: no hay un crujido de vidrio CC0 en el repo (el sprite es síntesis propia, `SONIDO.md`) y no se
  descargó nada. `SONIDO_DE_LAS_GRIETAS.pedido` (en `grietasEnVivo.ts`) suena por el bus (respeta el parlante apagado) al empezar a
  formarse; hace falta sumar el sonido al sprite (`scripts-retoque/sonidos.ts`, que ya sintetiza los demás como CC0).

**Medido sin navegador** (`s78-b9`, 47 afirmaciones, 22 controles):
- los tiempos: a 60 Hz, formadas a 1,500 s, oscuras 1,000 s, encendidas a 3,200 s; con cuadros desparejos (8 a 33 ms), lo mismo a un
  cuadro; la reversa, apagadas a 0,500 s y cerradas a 2,000 s; a medio camino (47 %), cerradas en 0,70 s sin encenderse; un cuadro
  largo avanza a lo sumo 0,1 s; con movimiento reducido, de una;
- en las uniformes (el cuadro del cristal): la formación en el cuadro 90, la luz en 0 hasta el 148 y en 1 en el 192;
- la ventana en 12 cámaras (la página y el home, a 1440 y 390): sale del rayo del centro;
- las variantes: telaraña 4 impactos en estrella (3 en el teléfono), fractura 3 líneas que cruzan de borde a borde y se bifurcan (2),
  juntas 2 a 3 semillas por los bordes de las celdas (1); la compacta, menos tramos en la misma ventana (161 contra 331 en la telaraña);
- la rejilla: lo que lee el sombreador (su espejo en la CPU) es la distancia de verdad hasta el margen, en las 36 combinaciones;
- el acento claro de web en la página (`8fc0e8`) y neutro en el home (`ffffff`); se borran al cambiar de página;
- el sombreador: el trozo va en el vidrio detrás de una uniforme; el muro tiene los mismos atributos (sin partir la geometría).

**El costo por cuadro: no se midió** (sin navegador). Por construcción: sin grietas, una comparación de una uniforme por píxel del
cristal; con grietas, un `atan`, dos derivadas y una lectura de textura por píxel, y en las celdas con grietas hasta 28 tramos (dos
lecturas cada uno). El banco (`scripts-carga/grietas.ts`, `COSTO=1`) lo mide contra `?grietas=no` (criterio ≤ 0,5 ms a 1440).

**Las suites**: tsc 0; eslint de lo tocado limpio; s70, s71, s32, s34, s36, s44, s49 y s78 (con s78-b9) sin fallas; s8-montaje con las
seis de la base (ninguno de estos archivos: `formas.ts` se partió de `trazado.ts` para no pasar las 300 líneas).

**La línea para `enganches.ts`** (B3, al integrar): en `src/app/v3/_lib/escena/resenas/enganches.ts`, el import
`import { grietasAlVolverseElCta } from '../cristal/grietas'` y, en `ENGANCHE_DE_LAS_GRIETAS`, `alVolverseElCta: grietasAlVolverseElCta,`
en lugar de `alVolverseElCta: () => undefined,`. s83 sigue en verde (cuenta las llamadas; la función es pura y anda en Node).

**Fuera de esta tarea:** el enganche de B3 avisa sólo los cruces: volviendo al home con la flecha a un scroll pasado el CTA, no hay
cruce y no hay grietas. «Si la grieta iluminada puede reemplazar a la luz del piso como variante de las páginas» se decide cuando
Valentino las vea.

## Qué mirar

1. `http://localhost:3000/v3/pagina-base` a 1440×900: cuando el título termina de entrar (~2,4 s después de aparecer), en la franja del
   muro arriba del piso nacen grietas en 4 puntos y se forman en ~1,5 s; quedan ~1 s como líneas grises tenues (es de noche); después una
   luz fina celeste (el acento de web) corre de los impactos a las puntas. Bajá hasta el papel y volvé: siguen ahí.
2. Lo mismo con `?grietas=2` (pocas líneas largas de borde a borde, con bifurcaciones) y `?grietas=3` (por los bordes de las celdas del
   vitral, de celda en celda).
3. `http://localhost:3000/v3/pagina-base` a 390×844: la versión compacta (menos impactos, rayos más cortos).
4. `http://localhost:3000/v3?grietas-prueba=si` a 1440 (el home, en el hero): cada ~11 s se forman, quedan oscuras, se iluminan en BLANCO
   (neutras), esperan 3 s, se apagan y se cierran en reversa. Con `&grietas=2` y `&grietas=3`, las otras.
5. `http://localhost:3000/v3/pagina-base?grietas-prueba=si` a 1440: el mismo ciclo con el acento celeste.
6. Con B3 integrada y la línea de `enganches.ts`: `http://localhost:3000/v3` a 1440, bajá hasta las reseñas: cuando el título se da vuelta
   y se vuelve el CTA (al amanecer), el cristal se agrieta (neutro); subí de nuevo por ese punto: se cierran en reversa, a la vista.
7. Desde `/v3/pagina-base` con las grietas encendidas, «Home» en la navbar: bajo el velo desaparecen; el home no tiene grietas hasta el CTA.
8. Con movimiento reducido: sin cristal y sin grietas (lo esperado hoy; ver la decisión).

El banco, contra el dev (`BASE=http://localhost:3000`, el Chrome del sistema a la vista):
- `npx tsx scripts-carga/grietas.ts`: tiempos, acento, compacta y capturas en `~/.cache/b4-medicion/b9-grietas/` (1440 y 390, las tres);
- `COSTO=1 npx tsx scripts-carga/grietas.ts` (y `COSTO=1 ROTULO=antes` en la integración sin B9): el muro con las grietas encendidas
  contra `?grietas=no`, ≤ 0,5 ms por cuadro; si el perfil no ve el muro, «control rojo»;
- `CTA=1 npx tsx scripts-carga/grietas.ts`: el enganche del home (necesita B3 y la línea);
- el control: `CONTROL=sin-grietas npx tsx scripts-carga/grietas.ts` tiene que dar FALLA («sin-tramos»); `REDUCIDO=1`, sin cristal.
