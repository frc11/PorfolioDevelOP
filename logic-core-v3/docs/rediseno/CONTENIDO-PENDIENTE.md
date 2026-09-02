# Contenido pendiente — el home de `/v3`

Esto es **todo lo que falta** para que el home nuevo deje de tener relleno. Está
agrupado por sección, en el orden en que se ven al scrollear.

Cada fila dice tres cosas: **qué dato es**, **en qué archivo se edita** y **qué
formato espera**. No hace falta abrir código para nada más que pegar el valor en
el archivo que la fila nombra.

> ⚠️ Este documento **lo produce un instrumento** (`npm run test:s7-pedido`) a
> partir de lo que cada sección declara al lado de su contenido. No se edita a
> mano: si alguien cambia un pedido en el código y no regenera esto, el gate de
> calidad falla. Es lo que impide que la lista se quede vieja mientras parece
> completa.

## Cómo leerlo

- **Marcador** es lo que se ve hoy en la pantalla ocupando ese lugar —`[CIFRA]`,
  `[FOTO DEL EQUIPO]`—. Donde dice *(prosa)*, lo provisional **no se ve como un
  agujero**: es un texto con la longitud y el tono correctos, y hay que
  reemplazarlo igual.
- **Dónde** es la clave dentro del archivo de contenido de esa sección.
- **Quién lo trae** es a quién hay que pedírselo. Está también repartido más
  abajo, en tres listas, para poder mandar cada una por separado.
- **Una fila que se llena desaparece de acá.** No hay tilde de "hecho": el
  documento sale del pedido que declara el código, y una casilla que ya tiene su
  dato deja de estar pedida. Lo que se ve en esta lista es, exactamente, lo que
  todavía falta.
- **La regla dura del proyecto:** ninguna cifra se inventa, ni de ejemplo. Si un
  dato no existe o no se puede medir, la respuesta correcta es **sacar la
  casilla**, no redondear. develOP ya tiene cuatro landings publicadas con
  cifras fabricadas y esto existe para no sumar una quinta.
- **Los precios no están cerrados** y no entran ni como ejemplo.


## Resumen

**46 cosas pendientes** en las ocho secciones, de las cuales **33** se ven hoy en la pantalla como un marcador y 13 son prosa de relleno que no se ve como agujero.


| sección | pendientes |
|---|---:|
| 01 · Hero | 2 |
| 02 · Quiénes somos | 9 |
| 03 · Números | 7 |
| 04 · Trabajos | 6 |
| 05 · Servicios | 9 |
| 06 · Tu panel | 4 |
| 07 · Por qué develOP | 4 |
| 08 · Cierre | 5 |


## Quién trae qué

Las mismas cosas de arriba, repartidas. Cada lista se puede mandar sola: nadie tiene que leer las otras dos para saber qué le toca.

| quién | cuántas |
|---|---:|
| Franco (o un cliente) | 17 |
| Valentino | 25 |
| Una decisión, antes que un dato | 4 |

### Franco (o un cliente) — 17

- **02 · Quiénes somos** · `personas[0].enUnProyecto` — Qué hace Franco, concretamente, adentro de un proyecto.
- **03 · Números** · `cifras[0].valor` — Cuántos proyectos se entregaron y se cerraron, contados de una lista real. Si el rótulo no nombra un dato que exista, cambiá el rótulo o sacá la casilla entera.
- **03 · Números** · `cifras[1].valor` — Cuántos clientes están activos hoy, con el corte de "activo" que uses vos.
- **03 · Números** · `cifras[3].valor` — Cuánto se tarda en contestar el primer mensaje, medido sobre los mensajes que entraron de verdad y no sobre la intención de contestar rápido.
- **03 · Números** · `cifras[4].valor` — Cuántos procesos automatizados están corriendo hoy en clientes.
- **04 · Trabajos** · `proyectos[0].metrica` — Qué cambió en Esquina, con el número que lo dice y de dónde sale.
- **04 · Trabajos** · `proyectos[1].metrica` — Qué cambió en El Garage, con el número que lo dice y de dónde sale.
- **04 · Trabajos** · `proyectos[2].metrica` — Qué cambió en Banú, con el número que lo dice y de dónde sale.
- **05 · Servicios** · `CONTENIDO.web.parrafo` — La conversión de un sitio entregado, medida sobre datos del cliente.
- **05 · Servicios** · `CONTENIDO.ia-automatizacion.parrafo` — Cuántas horas por semana deja de dedicarle el equipo del cliente a lo que el asistente resuelve.
- **05 · Servicios** · `CONTENIDO.software.parrafo` — Cuántos procesos se migraron, contados de una lista real.
- **05 · Servicios** · `CONTENIDO.software.parrafo` — Cuántos errores dejó de tener la operación desde que el sistema entró, contados contra lo de antes.
- **05 · Servicios** · `CASO_DE_REFERENCIA` — El caso de referencia de cada frente, con el cliente que corresponda y qué cambió.
- **07 · Por qué develOP** · `DIFERENCIALES[2].cuerpo` — Cuántos negocios trabajan así hoy. Contados, no estimados.
- **07 · Por qué develOP** · `DIFERENCIALES[3].cuerpo` — Cuánto más rápido es el camino de develOP, medido sobre entregas reales.
- **07 · Por qué develOP** · `TESTIMONIO.marcador` — Lo que dijo un cliente, con sus palabras: qué hace ahora y qué dejó de hacer. Sin cifras adentro — la cifra va aparte.
- **07 · Por qué develOP** · `TESTIMONIO.firma` — Quién lo dijo: nombre y cargo, con el permiso pedido.

### Valentino — 25

- **01 · Hero** · `bajada` — Los dos renglones abajo del titular: qué hacemos y qué te queda a vos. Sin plazos ni porcentajes.
- **01 · Hero** · `cta.rotulo` — Cómo se invita a mirar los trabajos. Tres palabras: es lo que entra en la ventana del rollover.
- **02 · Quiénes somos** · `titular` — La frase que abre la sección. Una idea, dos líneas, dicha como la decís vos.
- **02 · Quiénes somos** · `bajada` — Qué es develOP, en tres o cuatro renglones. Sin plazos ni porcentajes.
- **02 · Quiénes somos** · `comoTrabajamos` — Cómo trabajan: desde dónde, con quién y con qué forma. Mismo largo.
- **02 · Quiénes somos** · `equipo.marcador` — La foto de los dos, en el lugar donde trabajan. Es la única foto de persona del sitio.
- **02 · Quiénes somos** · `equipo.alt` — Qué se ve en la foto del equipo, para quien no la puede ver.
- **02 · Quiénes somos** · `equipo.pie` — El epígrafe de la foto. Un renglón.
- **02 · Quiénes somos** · `rotuloDelPedido` — Cómo se titula la línea que describe a cada uno dentro de un proyecto.
- **02 · Quiénes somos** · `personas[1].enUnProyecto` — Qué hace Valentino, concretamente, adentro de un proyecto.
- **03 · Números** · `titulo` — El título de la sección, dos o tres palabras. El que está puesto es relleno.
- **03 · Números** · `entrada` — La bajada, una o dos líneas: qué mira develOP y por qué son pocos números.
- **04 · Trabajos** · `titular` — La frase que abre la sección. Una idea, una línea, dicha como la decís vos.
- **04 · Trabajos** · `bajada` — Qué se muestra acá y qué se promete, en dos o tres renglones. Sin plazos ni porcentajes.
- **04 · Trabajos** · `rotuloDeLaMetrica` — Cómo se titula el dato que va al lado de cada nombre. Dos o tres palabras.
- **05 · Servicios** · `CONTENIDO.web.parrafo` — Qué se mide en un sitio entregado —velocidad— y contra qué se compara.
- **05 · Servicios** · `CONTENIDO.ia-automatizacion.parrafo` — Cuántas consultas resuelve el bot sin intervención, sobre conversaciones reales.
- **05 · Servicios** · `CONTENIDO.<servicio>.medio` — El video del frente: qué se ve, en veinte segundos y sin audio necesario.
- **05 · Servicios** · `CONTENIDO.<servicio>.medio` — El primer cuadro del video, para que no arranque negro.
- **06 · Tu panel** · `BLOQUES[1].texto` — Qué muestra el panel al día: el dato que se mira todos los días.
- **06 · Tu panel** · `BLOQUES[1].texto` — El dato acumulado que el panel muestra al lado del diario.
- **06 · Tu panel** · `CAPACIDADES[10]` — Qué se compara semana contra semana en el panel.
- **06 · Tu panel** · `CAPTURA` — La pantalla principal del panel de un cliente, con el estado de las entregas y el resumen de la semana. Con datos de muestra: ningún dato real de un cliente.
- **08 · Cierre** · `PEDIDOS_DE_CONTACTO[1]` — Las redes, una por red, con el perfil real.
- **08 · Cierre** · `LINEA_DE_CIERRE.piezas` — El año del pie de página.

### Una decisión, antes que un dato — 4

- **03 · Números** · `cifras[2].valor` — Hace cuánto existe develOP. Si te parece poco para mostrarlo, sacá la casilla: es mejor que redondear para arriba.
- **08 · Cierre** · `PEDIDOS_DE_CONTACTO[0]` — La dirección de contacto: mail, WhatsApp o el destino que corresponda.
- **08 · Cierre** · `LINEA_DE_CIERRE.piezas` — La razón social, si va a figurar.
- **08 · Cierre** · `LINEA_DE_CIERRE.piezas` — Los legales del pie: a dónde llevan y si van a existir.

## Lo que conviene pedir primero

**Estas 6, y no porque sean más trabajo.** Son las únicas que no dependen de develOP: el dato vive en el negocio de un cliente y hay que ir a buscarlo afuera —el número que dice qué cambió en cada uno, y lo que dijo alguien con el permiso para publicarlo y con su nombre—. Una captura lleva diez minutos y se hace cuando haya un rato; esto puede tardar semanas y nadie de acá lo puede apurar. Por eso van primero, aunque en la pantalla se vean últimas.

- **04 · Trabajos** · `proyectos[0].metrica` — Qué cambió en Esquina, con el número que lo dice y de dónde sale.
- **04 · Trabajos** · `proyectos[1].metrica` — Qué cambió en El Garage, con el número que lo dice y de dónde sale.
- **04 · Trabajos** · `proyectos[2].metrica` — Qué cambió en Banú, con el número que lo dice y de dónde sale.
- **05 · Servicios** · `CASO_DE_REFERENCIA` — El caso de referencia de cada frente, con el cliente que corresponda y qué cambió.
- **07 · Por qué develOP** · `TESTIMONIO.marcador` — Lo que dijo un cliente, con sus palabras: qué hace ahora y qué dejó de hacer. Sin cifras adentro — la cifra va aparte.
- **07 · Por qué develOP** · `TESTIMONIO.firma` — Quién lo dijo: nombre y cargo, con el permiso pedido.


## 01 · Hero

Se edita en `src/app/v3/_secciones/hero/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| *(prosa)* | `bajada` | Valentino | Los dos renglones abajo del titular: qué hacemos y qué te queda a vos. Sin plazos ni porcentajes. | Dos renglones, ~180 caracteres. Texto plano. |
| *(prosa)* | `cta.rotulo` | Valentino | Cómo se invita a mirar los trabajos. Tres palabras: es lo que entra en la ventana del rollover. | Tres palabras como máximo. Texto plano. |


## 02 · Quiénes somos

Se edita en `src/app/v3/_secciones/quienes-somos/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| *(prosa)* | `titular` | Valentino | La frase que abre la sección. Una idea, dos líneas, dicha como la decís vos. | Dos líneas, ~110 caracteres. Texto plano. |
| *(prosa)* | `bajada` | Valentino | Qué es develOP, en tres o cuatro renglones. Sin plazos ni porcentajes. | Tres o cuatro renglones, ~280 caracteres. Texto plano. |
| *(prosa)* | `comoTrabajamos` | Valentino | Cómo trabajan: desde dónde, con quién y con qué forma. Mismo largo. | Tres o cuatro renglones, ~280 caracteres. Texto plano. |
| `[FOTO DEL EQUIPO]` | `equipo.marcador` | Valentino | La foto de los dos, en el lugar donde trabajan. Es la única foto de persona del sitio. | JPG o WEBP, 1600 × 1000 px (8:5), horizontal. Se reemplaza poniendo la ruta en `equipo.fuente`. |
| *(prosa)* | `equipo.alt` | Valentino | Qué se ve en la foto del equipo, para quien no la puede ver. | Un renglón, ~90 caracteres. Texto plano. |
| *(prosa)* | `equipo.pie` | Valentino | El epígrafe de la foto. Un renglón. | Un renglón, ~90 caracteres. Texto plano. |
| *(prosa)* | `rotuloDelPedido` | Valentino | Cómo se titula la línea que describe a cada uno dentro de un proyecto. | Tres o cuatro palabras. Texto plano. |
| `[TEXTO]` | `personas[0].enUnProyecto` | Franco (o un cliente) | Qué hace Franco, concretamente, adentro de un proyecto. | Una frase corta, ~60 caracteres. Texto plano. |
| `[TEXTO]` | `personas[1].enUnProyecto` | Valentino | Qué hace Valentino, concretamente, adentro de un proyecto. | Una frase corta, ~60 caracteres. Texto plano. |


## 03 · Números

Se edita en `src/app/v3/_secciones/numeros/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| *(prosa)* | `titulo` | Valentino | El título de la sección, dos o tres palabras. El que está puesto es relleno. | Dos o tres palabras. Texto plano. |
| *(prosa)* | `entrada` | Valentino | La bajada, una o dos líneas: qué mira develOP y por qué son pocos números. | Una o dos líneas, ~180 caracteres. Texto plano. |
| `[CIFRA]` | `cifras[0].valor` | Franco (o un cliente) | Cuántos proyectos se entregaron y se cerraron, contados de una lista real. Si el rótulo no nombra un dato que exista, cambiá el rótulo o sacá la casilla entera. | Un número entero, sin símbolo. Ej.: `14`. |
| `[CIFRA]` | `cifras[1].valor` | Franco (o un cliente) | Cuántos clientes están activos hoy, con el corte de "activo" que uses vos. | Un número entero, sin símbolo. |
| `[CIFRA]` | `cifras[2].valor` | Una decisión, antes que un dato | Hace cuánto existe develOP. Si te parece poco para mostrarlo, sacá la casilla: es mejor que redondear para arriba. | Un número entero de años, sin el signo `+`. |
| `[CIFRA]` | `cifras[3].valor` | Franco (o un cliente) | Cuánto se tarda en contestar el primer mensaje, medido sobre los mensajes que entraron de verdad y no sobre la intención de contestar rápido. | Número más unidad, ej. `4 h`. Es la única casilla con unidad. |
| `[CIFRA]` | `cifras[4].valor` | Franco (o un cliente) | Cuántos procesos automatizados están corriendo hoy en clientes. | Un número entero, sin símbolo. |


## 04 · Trabajos

Se edita en `src/app/v3/_secciones/trabajos/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| *(prosa)* | `titular` | Valentino | La frase que abre la sección. Una idea, una línea, dicha como la decís vos. | Una línea, ~90 caracteres. Texto plano. |
| *(prosa)* | `bajada` | Valentino | Qué se muestra acá y qué se promete, en dos o tres renglones. Sin plazos ni porcentajes. | Dos o tres renglones, ~220 caracteres. Texto plano. |
| *(prosa)* | `rotuloDeLaMetrica` | Valentino | Cómo se titula el dato que va al lado de cada nombre. Dos o tres palabras. | Dos o tres palabras. Texto plano. |
| `[MÉTRICA]` | `proyectos[0].metrica` | Franco (o un cliente) | Qué cambió en Esquina, con el número que lo dice y de dónde sale. | Frase corta con su número, ~30 caracteres. Ej.: `de 4 a 19 pedidos por día`. |
| `[MÉTRICA]` | `proyectos[1].metrica` | Franco (o un cliente) | Qué cambió en El Garage, con el número que lo dice y de dónde sale. | Frase corta con su número, ~30 caracteres. |
| `[MÉTRICA]` | `proyectos[2].metrica` | Franco (o un cliente) | Qué cambió en Banú, con el número que lo dice y de dónde sale. | Frase corta con su número, ~30 caracteres. |


## 05 · Servicios

Se edita en `src/app/v3/_secciones/servicios/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| `[MÉTRICA]` | `CONTENIDO.web.parrafo` | Valentino | Qué se mide en un sitio entregado —velocidad— y contra qué se compara. | Frase con su número y su unidad, adentro del párrafo. Ej.: `1,2 s de carga`. |
| `[CIFRA]` | `CONTENIDO.web.parrafo` | Franco (o un cliente) | La conversión de un sitio entregado, medida sobre datos del cliente. | Un número con su unidad, adentro del párrafo. |
| `[MÉTRICA]` | `CONTENIDO.ia-automatizacion.parrafo` | Valentino | Cuántas consultas resuelve el bot sin intervención, sobre conversaciones reales. | Un número con su unidad, adentro del párrafo. |
| `[CIFRA]` | `CONTENIDO.ia-automatizacion.parrafo` | Franco (o un cliente) | Cuántas horas por semana deja de dedicarle el equipo del cliente a lo que el asistente resuelve. | Un número con su unidad, adentro del párrafo. |
| `[MÉTRICA]` | `CONTENIDO.software.parrafo` | Franco (o un cliente) | Cuántos procesos se migraron, contados de una lista real. | Un número entero, adentro del párrafo. |
| `[CIFRA]` | `CONTENIDO.software.parrafo` | Franco (o un cliente) | Cuántos errores dejó de tener la operación desde que el sistema entró, contados contra lo de antes. | Un número entero, adentro del párrafo. |
| `[TESTIMONIO]` | `CASO_DE_REFERENCIA` | Franco (o un cliente) | El caso de referencia de cada frente, con el cliente que corresponda y qué cambió. | Dos o tres renglones, con el nombre del cliente. Texto plano. |
| `[VIDEO]` | `CONTENIDO.<servicio>.medio` | Valentino | El video del frente: qué se ve, en veinte segundos y sin audio necesario. | MP4 (h264), 1920 × 1080 px (16:9), ≤ 20 s, ≤ 4 MB. Sin audio obligatorio. |
| `[PÓSTER]` | `CONTENIDO.<servicio>.medio` | Valentino | El primer cuadro del video, para que no arranque negro. | JPG o WEBP, 1920 × 1080 px (16:9). |


## 06 · Tu panel

Se edita en `src/app/v3/_secciones/tu-panel/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| `[MÉTRICA]` | `BLOQUES[1].texto` | Valentino | Qué muestra el panel al día: el dato que se mira todos los días. | Nombre del dato, sin número. Ej.: `consultas del día`. |
| `[CIFRA]` | `BLOQUES[1].texto` | Valentino | El dato acumulado que el panel muestra al lado del diario. | Nombre del dato acumulado, sin número. |
| `[MÉTRICA]` | `CAPACIDADES[10]` | Valentino | Qué se compara semana contra semana en el panel. | Nombre del dato comparado, sin número. |
| `[CAPTURA DEL PANEL]` | `CAPTURA` | Valentino | La pantalla principal del panel de un cliente, con el estado de las entregas y el resumen de la semana. Con datos de muestra: ningún dato real de un cliente. | PNG o WEBP, 1920 × 1080 px (16:9). Se pone la ruta en `CAPTURA.fuente`. |


## 07 · Por qué develOP

Se edita en `src/app/v3/_secciones/por-que-develop/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| `[CIFRA]` | `DIFERENCIALES[2].cuerpo` | Franco (o un cliente) | Cuántos negocios trabajan así hoy. Contados, no estimados. | Un número entero, sin símbolo. |
| `[MÉTRICA]` | `DIFERENCIALES[3].cuerpo` | Franco (o un cliente) | Cuánto más rápido es el camino de develOP, medido sobre entregas reales. | Un número con su unidad. Ej.: `3 semanas contra 9`. |
| `[TESTIMONIO]` | `TESTIMONIO.marcador` | Franco (o un cliente) | Lo que dijo un cliente, con sus palabras: qué hace ahora y qué dejó de hacer. Sin cifras adentro — la cifra va aparte. | Dos o tres renglones, ~220 caracteres. Texto plano, entre comillas. |
| `[NOMBRE]` | `TESTIMONIO.firma` | Franco (o un cliente) | Quién lo dijo: nombre y cargo, con el permiso pedido. | Nombre · cargo · empresa. Una línea. |


## 08 · Cierre

Se edita en `src/app/v3/_secciones/cierre/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| `[ENLACE]` | `PEDIDOS_DE_CONTACTO[0]` | Una decisión, antes que un dato | La dirección de contacto: mail, WhatsApp o el destino que corresponda. | Una URL o un `mailto:`. El rótulo visible va aparte. |
| `[ENLACE]` | `PEDIDOS_DE_CONTACTO[1]` | Valentino | Las redes, una por red, con el perfil real. | Una URL por red. |
| `[FECHA]` | `LINEA_DE_CIERRE.piezas` | Valentino | El año del pie de página. | Cuatro dígitos. Se puede derivar de la fecha del build. |
| `[NOMBRE]` | `LINEA_DE_CIERRE.piezas` | Una decisión, antes que un dato | La razón social, si va a figurar. | Nombre legal completo. Una línea. |
| `[ENLACE]` | `LINEA_DE_CIERRE.piezas` | Una decisión, antes que un dato | Los legales del pie: a dónde llevan y si van a existir. | Una URL por documento, o ninguno si se decide que no van. |
