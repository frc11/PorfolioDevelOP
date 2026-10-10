# GIROSCOPIO — la cámara que se inclina con el teléfono

PULIDO 11 · F. Exploración: el documento y un prototipo detrás de `?giroscopio=si` (apagado por defecto). Nada de esto cambia el
sitio sin la bandera.

## Qué es

En escritorio el mouse corre la cámara alrededor del logo (`OrbitRig` → `modulacionDeLaPose.ts`: el puntero, suavizado, mueve
el azimut y la altura de la cámara, con la magnitud de cada tramo del recorrido). En el teléfono no hay mouse: la idea es que
inclinar el teléfono haga lo mismo. No es una cámara nueva ni un camino aparte: la inclinación entra por el mismo caño que el
puntero, así hereda su suavizado, sus topes y su apagado con movimiento reducido.

## La API

- `DeviceOrientationEvent` (evento `deviceorientation` en `window`): tres ángulos en grados. `alpha` (0–360, la brújula),
  `beta` (−180–180, el cabeceo: 0 acostado, ~90 parado mirando a la persona) y `gamma` (−90–90, el giro a los costados). Para
  esto alcanza con `beta` y `gamma`; `alpha` no sirve (deriva, y depende del norte).
- **iOS 13 o más nuevo (Safari y todo navegador de iOS, que es Safari por dentro):** el evento no llega hasta que la página pide
  permiso con `DeviceOrientationEvent.requestPermission()`, que devuelve una promesa con `'granted'` o `'denied'`. **Sólo se
  puede llamar desde un gesto del usuario** (un `click` o un `touchend` que el usuario hizo); llamado al cargar, se rechaza. El
  sistema muestra un cartel propio («… quiere acceder al movimiento y la orientación»).
- **Android (Chrome, Samsung Internet, Firefox):** no hay permiso por página: el evento llega apenas se escucha.
- **HTTPS en los dos:** los sensores son una API de contexto seguro. Por `http://` (salvo `localhost` en el mismo aparato) el
  evento no llega nunca y en iOS `requestPermission` ni existe o se rechaza.
- **Si se niega:** la promesa resuelve `'denied'` y Safari recuerda la decisión para el sitio (se vuelve a pedir recién si la
  persona borra los datos del sitio o reinicia los permisos en Ajustes). El sitio no puede insistir: lo correcto es seguir igual,
  sin cartel ni reintento. Si no hay sensor (una tablet sin giroscopio, un escritorio), el evento no llega o llega con `null`:
  igual, nada cambia.

## Cómo probarlo (y cuál recomiendo)

La red de casa por IP (`http://192.168.x.x:3000`) **no sirve en iOS**: no es contexto seguro, así que no hay evento ni permiso
(en Android Chrome tampoco llega por la misma razón). Hay tres caminos con HTTPS:

1. **Un deploy preview de Netlify** (la rama empujada a un preview, con su URL `https://…netlify.app`). HTTPS de verdad, nada que
   instalar en el teléfono, es el mismo build que producción y se puede mandar el link a cualquiera para que lo pruebe en su
   aparato. Lo lento: cada cambio es un push y un build (unos minutos).
2. **Un túnel** (`cloudflared tunnel --url http://localhost:3000` o `ngrok http 3000`) al servidor local: HTTPS al toque, con el
   código vivo. Pide instalar el binario del túnel (no es una dependencia del proyecto: es una herramienta de la máquina) y que
   la máquina y el túnel estén prendidos; el dev server por el túnel puede necesitar el host en `allowedDevOrigins` (lo mismo
   que pasó con la IP: sin eso, la página no hidrata).
3. **`next dev --experimental-https`**: Next genera un certificado con mkcert y sirve `https://192.168.x.x:3000` en la red de
   casa. Para que el iPhone lo acepte hay que instalarle el certificado raíz de mkcert (un perfil) y darle confianza total en
   Ajustes → General → Información → Confianza de certificados; además `allowedDevOrigins` con la IP. Funciona, pero es un
   trámite por teléfono.

**Recomiendo el 1 (deploy preview) para decidir si va**: es lo más parecido a lo que va a vivir la gente, no toca el teléfono y
se comparte. Para iterar el ajuste fino (los grados, el suavizado), el 2 (túnel) es el más rápido.

## La experiencia

- **Hoy el preloader está apagado** (`CON_PRELOADER = false` en `_intro/IntroDelHome.tsx`), así que no hay una pantalla de
  entrada: el sonido se prende con el parlante (en el teléfono, desde C2, el disco de arriba a la izquierda). Busqué el «Click
  para activar» del sonido en el código y en la historia: hoy no existe (el que hay es «Click para cerrar», del menú). La
  propuesta es que **el parlante sea «Activar experiencia»**: un solo toque prende el sonido Y el movimiento (y ese toque es el
  gesto que iOS necesita para el permiso). Si el preloader vuelve, su paso de activación dice lo mismo y hace lo mismo.
- **Si se niega o no hay sensor:** el sonido se prende igual, la cámara queda como hoy y no se vuelve a pedir.
- **Apagado** (otro toque en el parlante): se apagan los dos.

## El efecto

- **La cámara se inclina con el teléfono**: el costado (`gamma`) corre el azimut, el cabeceo (`beta`) la altura, igual que el
  mouse de izquierda a derecha y de arriba abajo. En apaisado los ejes se cambian (`screen.orientation.angle`).
- **Calibrado al cero inicial**: la primera lectura (como esté agarrado el teléfono al activarlo) es el reposo; nadie lo
  sostiene vertical. Al volver a la pestaña se recalibra.
- **Suavizado**: el del puntero (`perseguirAlPuntero`, la misma constante de tiempo que el mouse).
- **Topes**: la inclinación se lleva al rango del puntero, −1 a 1 (18° de costado y 14° de cabeceo desde el cero llegan al
  borde: `GIROSCOPIO.gradosDelBorde`), y de ahí sale la misma excursión que con el mouse en el borde de la ventana. Con el mouse
  en el borde de arriba el techo del domo no entra en ningún tramo; como el giroscopio no puede pasar ese borde, tampoco (a
  verificar en el banco a 390 con el puntero clavado en 1, ver abajo).
- **Pausa con la pestaña oculta**: se deja de escuchar el sensor (batería) y se recalibra al volver.
- **Movimiento reducido**: no se prende nunca (y el puntero ya no mueve la cámara con movimiento reducido).

## Riesgos

- **Mareo**: una cámara que se mueve sola con la mano es vestibular. Por eso la excursión es la del mouse (chica), con
  suavizado, nunca con movimiento reducido, y se apaga con el mismo toque que la prendió. Si en la prueba marea, bajar
  `gradosDelBorde` hacia arriba (más grados para el mismo movimiento) o achicar la magnitud sólo para el giroscopio.
- **Batería**: el sensor manda ~60 eventos por segundo; la escena ya se dibuja a esa frecuencia, así que lo extra es leer dos
  números. Con la pestaña oculta no se escucha.
- **Accesibilidad**: WCAG 2.3.3 (animación desde interacciones) pide poder apagarla: el toque del parlante la apaga, y con
  movimiento reducido no existe. El permiso de iOS es un cartel del sistema: no lo podemos redactar.
- **Orientación**: al girar el teléfono cambia el cero lógico; el prototipo cambia los ejes con la pantalla, pero no recalibra al
  girar (si molesta, recalibrar en `orientationchange`).

## El prototipo (`?giroscopio=si`)

- `src/app/v3/_lib/escena/giroscopio.ts`: el estado (`INCLINACION_DEL_TELEFONO`), el permiso desde el gesto, el cero, los ejes
  según la pantalla, la pausa con la pestaña oculta. Puro lo que se puede (`punteroDeLaInclinacion`).
- `OrbitRig.tsx`: con el giroscopio prendido, la inclinación es el puntero (una línea).
- `ControlDelSonido.tsx`: con la bandera, el toque del parlante prende (o apaga) el giroscopio además del sonido.
- Sin la bandera no se escucha nada ni se pide nada: el sitio es el de siempre.

**VERIFICAR EN UN TELÉFONO** (no se pudo en esta sesión: hace falta HTTPS y un aparato): en un iPhone y en un Android, por un
deploy preview: el cartel del permiso aparece al tocar el parlante; concedido, la cámara sigue la inclinación sin saltos y
vuelve al soltar; negado, nada cambia y no se vuelve a pedir; con la pestaña oculta y de vuelta, recalibra; en apaisado, los
ejes bien; con movimiento reducido, nada. En el banco: a 390 con el puntero clavado en (0, 1) y en (±1, 1) en cada sección, el
techo del domo no entra.
