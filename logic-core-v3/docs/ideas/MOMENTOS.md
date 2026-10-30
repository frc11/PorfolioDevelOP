# Momentos: lo que haría memorable a cada página nueva

L7e · lane C · 2026-10-30. Para cada página que arman L7a–L7d, dos o tres **momentos de firma**: la cosa que la vuelve suya en vez de ser
«el home con otro texto». Todos salen de una mecánica del home (`VOZ-DEL-SITIO.md`, los § entre paréntesis); cuando uno se aparta a
propósito, lo digo. Los marcados con **▶ prototipo** se pueden ver andando en `/v3/laboratorio/<ruta>`.

**Costo:** S = una tarde, con piezas que ya existen; M = un sprint corto, alguna pieza nueva; L = toca la escena o el home (pedido P-H).

---

## Desarrollo web (de noche, celeste)

**W1 · La pantalla que se dibuja.** ▶ prototipo `/v3/laboratorio/pantalla-que-se-dibuja`
- **Qué ve:** a la par del texto de «cómo pensamos cada pantalla», el alambre de una página web (barra, titular, botón, tres bloques) se
  dibuja trazo por trazo con el scroll, en el celeste oscuro sobre papel; al terminar, la pantalla real (el póster de un trabajo) se
  destapa adentro del alambre desde el centro.
- **Por qué es de esta página:** lo que vende Desarrollo web es la pantalla pensada antes que hecha. Es el único servicio cuyo producto
  *es* una pantalla.
- **De dónde sale:** el globo de alambre del panel de Servicios (§5) + el `Trazo` atado al scroll (§3) + el destape de la segunda toma de
  `MarcoDeDosTomas` (§5, `clip-path` desde el centro).
- **Costo:** S–M (SVG + un `Bloque` + `MarcoDeMedio`). **Riesgo:** que parezca un wireframe de plantilla; el alambre tiene que ser del
  mismo trazo fino que el globo, no un esquema gris.

**W2 · El mismo sitio en el celular.** ▶ prototipo `/v3/laboratorio/mismo-sitio-en-el-celular` (hecho después de cerrar el lote)
- **Qué ve:** el video móvil de un trabajo real en un teléfono, y al lado el de escritorio; al scrollear, el de escritorio se angosta
  hasta volverse el teléfono (el ancho baja con el scroll, el contenido se reacomoda porque es otro video).
- **Por qué:** «se vea bien en el celular, que es donde te van a encontrar» es una promesa de la página; esto la muestra.
- **De dónde sale:** los videos de escritorio y móvil que `PROYECTOS` ya tiene por trabajo (`mediosDe`), el acordeón del Portfolio que
  cambia de ancho (§5).
- **Costo:** M. **Riesgo:** sólo hay videos de tres trabajos y el de Servicios es provisorio; con un solo video se nota.

**W3 · Tu panel, en vivo, para web.** Las demos `proyecto` y `servicios` del panel vivo (hoy sin usar) en la página de web: «cambiás
precios, fotos y textos sin depender de nadie» con el panel moviéndose al lado. Sale de `DemoEnSuLugar` (§5). Costo S. Riesgo: repetir el
Panel del home; va una sola, chica, al lado del párrafo que la nombra. *Sin prototipo: es la misma pieza que I1.*

## Software a medida (de noche, violeta)

**S1 · Lo de siempre, tachado.** ▶ prototipo `/v3/laboratorio/lo-de-siempre-tachado`
- **Qué ve:** la lista de cómo se trabaja hoy («la planilla de stock», «el cuaderno de turnos», «los pedidos por WhatsApp», «el
  presupuesto en Word») en tinta; al scrollear, cada renglón se **tacha** con el trazo del home y a su lado se escribe lo que lo
  reemplaza («stock que se descuenta solo»…). Al subir, se destacha.
- **Por qué:** la página de Software vende dejar las planillas; es literalmente «no lo mismo de siempre».
- **De dónde sale:** el titular de Quiénes somos («algo distinto, no ~~lo mismo de siempre~~», §3), con su `Trazo` tipo tachado.
- **Costo:** S. **Riesgo:** con mucho texto, el tachado cansa; cuatro o cinco renglones, no más.

**S2 · El sistema que se ordena.** ▶ prototipo `/v3/laboratorio/el-sistema-que-se-ordena`. Fichas sueltas desordenadas (pedidos, turnos, clientes) que, con el scroll, vuelan a sus columnas de
un tablero. Sale de la `LlegadaEnCurva` de las fotos del equipo (§5). Costo M. Riesgo: «lo que entra en diagonal sin motivo» (GUSTO.md);
el motivo tiene que ser legible: de desorden a orden. Si S1 gusta, S2 es su segunda parte.

**S3 · «Primero entendemos, después presupuestamos».** Un proceso de tres pasos donde el presupuesto aparece *recién* en el tercero,
tapado hasta entonces. Sale del proceso de Nosotros (N3): se comparte la pieza. Costo S (si N3 existe).

## Integraciones con IA (de noche, verde)

**I1 · La conversación que pasa sola.** ▶ prototipo `/v3/laboratorio/conversacion-en-vivo`
- **Qué ve:** la demo viva del chatbot del panel (`conversaciones`, ya construida y sin usar en el home) contestando sola, al lado de «Un
  chatbot con IA atiende por vos». Debajo, la demo `informacion` (lo que el chatbot sabe de tu negocio): las dos caras del mismo
  producto.
- **Por qué:** es el único servicio que se puede *ver trabajar*; describirlo es peor que mostrarlo.
- **De dónde sale:** `DemoEnSuLugar` del Panel (§5) con su escenario de «sólo la más visible corre».
- **Costo:** S. **Riesgo:** que la demo hable de otro negocio que el del visitante; la de `conversaciones` es genérica, conviene.

**I2 · Mientras dormís.** La intro de la página de IA con la escena: el reloj de la sala avanza (la luz pasa de la noche a la madrugada
con el scroll) y en la bajada van apareciendo las consultas que el chatbot contestó a esa hora («02:14 · ¿Tienen turno el sábado?»).
- **De dónde sale:** el arco de luz del home (§2) usado como hora del día + el `Gatillo`.
- **Costo:** L (la página de servicio es de noche por contrato y la luz la maneja la escena: pedido P-H para que la variante pueda bajar
  y subir el nivel). **Riesgo:** que se lea como «IA que trabaja de noche» y no como «atiende a cualquier hora». *Sin prototipo: necesita
  la escena.*

**I3 · Lo que antes hacías a mano.** ▶ prototipo `/v3/laboratorio/pasa-solo`. La lista de tareas repetitivas que se tilda sola (un tic de sonido por cada una) a medida que
scrolleás. Es S1 con otro verbo: se comparte la pieza. Costo S.

## Nosotros (de día)

**N1 · Dos tomas, dos personas.** ▶ prototipo `/v3/laboratorio/dos-tomas`
- **Qué ve:** el párrafo largo de Franco con su foto al costado y el de Valentino con la suya, enfrentados; la foto es la de dos tomas
  del home: la seria, y con el mouse (o, en el teléfono, **al cruzar el centro de la pantalla**) se abre la suelta desde el centro.
- **Por qué:** ESTRUCTURA-PAGINAS lo pide («las fotos llevan el efecto de hover del home»); el aporte es la versión de teléfono, donde no
  hay hover: el scroll la abre.
- **De dónde sale:** `MarcoDeDosTomas` (§5) tal cual, importado; el disparo al cruzar una línea es el del `Gatillo` (§4).
- **Costo:** S. **Riesgo:** en el teléfono, que se abra sola sin que el usuario entienda por qué; se cierra al volver a subir, como todo.

**N2 · La historia que se pinta.** ▶ prototipo `/v3/laboratorio/historia-que-se-pinta`
- **Qué ve:** la historia de Valentino (ESTRUCTURA-PAGINAS, «Somos 2 amigos…») en letra grande, a lo ancho, palabra por palabra, que se
  pinta con el scroll como el título del Panel: lo que ya leíste queda en tinta, lo que viene, al 18 %. Las frases que importan («No
  tenemos límites.») en la itálica del segundo registro.
- **Por qué:** al home le falta un lugar donde se lea una historia entera (VOZ §10); Nosotros es ese lugar, y el pintado obliga a leer al
  ritmo del scroll.
- **De dónde sale:** `_componentes/pintado/pintado.ts` (§3), el mismo cálculo, en un texto largo.
- **Costo:** S. **Riesgo:** el pintado ya se repite en el home (VOZ §10); acá tiene que ser *el* efecto de la página y no otro más.

**N3 · Cómo trabajamos, con un trazo.** ▶ prototipo `/v3/laboratorio/como-trabajamos`
- **Qué ve:** los pasos del proceso en una columna; una línea vertical se dibuja con el scroll y une los pasos; el paso en el que estás
  se subraya, los anteriores quedan en tinta y los que vienen, tenues.
- **Por qué:** el proceso es lo que el home no dice (VOZ §10).
- **De dónde sale:** el `Trazo` (subrayado) y el ≠ que se dibuja (§3), y el «un gesto, un paso» de los escenarios (§9.12) pero sin
  clavar el scroll.
- **Costo:** S. **Riesgo:** que sea la línea de tiempo de plantilla; la diferencia está en que la línea es el mismo trazo del titular de
  Quiénes somos, no una barra gris.

**N4 · La foto de la facultad que se abre.** ▶ prototipo (dentro de `/v3/laboratorio/dos-tomas`)
- **Qué ve:** la foto (genérica por ahora) a todo el ancho, cerrada a una rendija en el centro, que se abre con el scroll hasta llenar
  el cuadro; arriba, «Donde nos conocimos» se levanta.
- **De dónde sale:** el `clip-path` desde el centro de la segunda toma (§5), atado al scroll en vez de al hover.
- **Costo:** S.

## Portfolio (de día)

**P1 · Cada caso, una ficha abierta con su video clavado.** ▶ prototipo `/v3/laboratorio/fichas-abiertas`
- **Qué ve:** los tres trabajos, uno por pantalla y media: el video del trabajo clavado a la izquierda mientras la ficha (problema, qué
  hicimos, qué resolvimos, fecha, «Visitar sitio») entra fila por fila a la derecha; una franja fina del color de la marca del cliente
  marca de quién es cada uno.
- **Por qué:** ESTRUCTURA-PAGINAS pide la ficha completa ya desplegada; esto es la tira activa del acordeón del home, abierta para
  siempre y en papel.
- **De dónde sale:** `Ficha` y `PROYECTOS` (§5), importados; la secuencia de la ficha y el video de `mediosDe`.
- **Costo:** S. **Riesgo:** los `[TESTIMONIO]` y `[TEXTO]` se van a ver (con la llave apagada); es correcto, son huecos marcados.

**P2 · Las demos como un estante.** ▶ prototipo `/v3/laboratorio/demos-en-conjunto`. Las cinco plantillas en una fila de lomos (como los lomos del acordeón) que se abren de a una con el
hover y muestran qué es y para qué rubro. Sale de la `Biblioteca` y los lomos del Portfolio (§5). Costo M. La biblioteca
del home ya lo hace; el aporte es la composición (en conjunto, como pide ESTRUCTURA) y los tres pasos de qué son.

**P3 · Las reseñas, planas y a la deriva.** `PistaDeLasResenas` (la cinta que deriva del home abajo de 1024) a todo el ancho en el
cuerpo. Costo S. Riesgo: las reseñas son **ficticias** (`resenas/contenido.ts:4-7`); no se puede publicar así. *Sin prototipo.*

## Blog (de día)

**B1 · El carrusel de las destacadas, con barras.** ▶ prototipo `/v3/laboratorio/carrusel-del-blog`
- **Qué ve:** las tres notas destacadas a todo el ancho, una por vez, con la barra de progreso de las historias arriba (10 s cada una),
  flechas para pasarlas y el titular de cada nota que se levanta al entrar.
- **Por qué:** ESTRUCTURA-PAGINAS lo pide; las barras dicen sin leer cuánto falta y cuántas hay (GUSTO: «lo que se entiende sin leer»).
- **De dónde sale:** `CarruselDeTarjetas` (su máquina, sus 10 s, su pausa al mantener) y `TitularQueSeLevanta` (§5, §3).
- **Costo:** S. **Riesgo:** un carrusel automático es lo más «de plantilla» que hay; lo salva el titular que se levanta y no entra
  deslizando.

**B2 · Las notas en lugares irregulares, que caen en su lugar.** ▶ prototipo `/v3/laboratorio/notas-irregulares`
- **Qué ve:** las seis notas como tarjetas de distintos anchos en posiciones corridas (no una grilla), que entran con el gatillo desde
  abajo, cada una con un leve giro que se endereza al asentarse; el título de cada tarjeta hace el rollover de dos copias.
- **De dónde sale:** el pedido de «como el panel viejo» (ESTRUCTURA-PAGINAS), el `Gatillo` (§4) y `DosCopias` (§6).
- **Costo:** S. **Riesgo:** irregular puede leerse desordenado; las posiciones son un patrón fijo de seis, no aleatorio.

## La nota (de día)

**L1 · La lectura con su hilo.** ▶ prototipo `/v3/laboratorio/nota`
- **Qué ve:** una columna angosta de lectura; arriba, un hilo fino que se dibuja de izquierda a derecha a medida que leés (el trazo del
  subrayado); los subtítulos se levantan; una frase destacada se pinta palabra por palabra; al final, las notas relacionadas y el CTA.
- **De dónde sale:** el `Trazo`, `TitularQueSeLevanta` y el pintado (§3).
- **Costo:** S. **Riesgo:** la barra de progreso de lectura es un cliché; acá es el mismo trazo que subraya los títulos, no una barra
  de color.

**L2 · El tiempo de lectura que se cumple.** «4 min de lectura» al principio, y al terminar la nota la cifra se tacha y queda «leída». Del
tachado (§3). Costo S. *Dentro del prototipo L1.*

## Privacidad y Términos (sin escena)

**G1 · El índice con el subrayado que viaja.** ▶ prototipo `/v3/laboratorio/indice-legal`
- **Qué ve:** el texto legal en papel con un índice lateral clavado; el título de la sección que estás leyendo se subraya en el índice y
  el subrayado **viaja** de un ítem al siguiente (no salta).
- **De dónde sale:** el subrayado de dos capas del CTA (§6) y el resaltado de la sección activa de la barra.
- **Costo:** S. **Riesgo:** ninguno grande; es la página donde menos hay que lucirse.

**G2 · La fecha de actualización como sello.** «Última actualización: 30 de octubre de 2026» con el encastre del logo al lado, chico. Del
`EncajeDelLogo` (§5). Costo S. *Sin prototipo: es decorar una fecha.*

## 404

**E1 · El logo que no encaja.** ▶ prototipo `/v3/laboratorio/no-encaja`
- **Qué ve:** el logo cae a su hueco **y no encaja**: rebota y queda torcido (la animación de error del formulario, con su sonido si el
  sonido está prendido); debajo, «Esta página no existe, pero tu proyecto sí puede.» y el botón al home. Con un clic en el logo, vuelve a
  intentar.
- **Por qué:** la 404 es literalmente algo que no encajó; el sitio ya tiene ese gesto, dibujado y con sonido.
- **De dónde sale:** `EncajeDelLogo` con `resultado="no-encaja"` (§5, el estado de error de `EstadoDeEnvio`).
- **Costo:** S. **Riesgo:** que se lea como un error del sitio y no como un chiste; el texto lo salva.

**E2 · La sala vacía.** La escena de día sin logo (el hueco en el piso), y el logo bajando a su lugar cuando tocás «Volver al home». L:
necesita la escena (pedido P-H para una variante que esconda el logo). *Sin prototipo.*

## Las de día (Nosotros, Portfolio, Blog)

**D1 · La intro corta de día.** ▶ prototipo `/v3/laboratorio/intro-de-dia`
- **Qué ve:** una sola pantalla de la sala de día en la pose del hero (el logo a la derecha, con el mouse), el título a la izquierda en
  los dos registros del sitio, que se levanta al llegar, su bajada y el aviso de scroll; después, el papel, y la escena se duerme debajo.
- **Por qué:** sus nombres (Nosotros, Portfolio, Blog) no están entre los títulos que el 3D sabe escribir; hasta regenerar las fuentes
  (P-H), la intro de estas páginas es de DOM. Y ESTRUCTURA pide «poca animación al principio y pasa rápido al fondo».
- **De dónde sale:** el hero del home (la composición 3, la pose, los dos registros) y `TitularQueSeLevanta`.
- **Costo:** S. **Riesgo:** que se lea como «el hero con otro texto»; lo que la distingue es que dura una pantalla y no se queda.

## Para todas

**T1 · El velo con el nombre del destino.** La banda del velo lleva, chico y en el centro, el nombre de la página a la que vas. Del velo
(§6). Costo M, pero **toca `_chrome/velo/`**: va como propuesta P-H, no se prototipa.

**T2 · El pie que recuerda dónde estuviste.** En «El recorrido» del pie, las páginas que ya visitaste en esta sesión llevan el subrayado.
Costo S, toca el pie: propuesta.

---

## Lo que construiría primero, y por qué

1. **E1 · el logo que no encaja (404).** El mejor ratio de todos: una pieza que ya existe, con sonido, que dice exactamente lo que la
   página es. Una tarde.
2. **N1 + N4 · dos tomas y la foto que se abre (Nosotros).** ESTRUCTURA-PAGINAS ya lo pide; lo que aporta el laboratorio es la versión
   de teléfono, que es la que no estaba pensada.
3. **P1 · fichas abiertas (Portfolio).** Es la página con más contenido real (tres trabajos, videos, fichas) y la pieza ya existe.
4. **I1 · la conversación en vivo (IA).** Cinco demos construidas no se usan; esta muestra el producto trabajando.
5. **S1 · lo de siempre, tachado (Software).** El gesto más «develOP» del home (el titular de Quiénes somos) puesto donde más sentido
   tiene.
6. **N2 · la historia que se pinta (Nosotros).** Fuerte, pero depende de que el pintado no se use en otra parte de la página.
7. **B1 + B2 · carrusel y notas irregulares (Blog).** Necesarias (las pide la estructura); el riesgo de plantilla es alto y por eso
   conviene verlas antes de construir.
8. **N3 · cómo trabajamos.** Sirve a Nosotros y a Software (S3).
9. **W1 · la pantalla que se dibuja (Web).** La idea más propia de Web, pero la más fácil de que salga genérica.
10. **L1 · la nota con su hilo** y **G1 · el índice legal.** Lo correcto, poco riesgo, poco brillo: van al final.

Lo que **no** construiría todavía: I2 y E2 (piden la escena y un pedido al home), T1 y T2 (tocan el chrome), P3 (reseñas ficticias).
