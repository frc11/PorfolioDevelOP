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

**19 cosas pendientes** en las ocho secciones, de las cuales **9** se ven hoy en la pantalla como un marcador y 10 son prosa de relleno que no se ve como agujero.


| sección | pendientes |
|---|---:|
| 01 · Hero | 2 |
| 02 · Quiénes somos | 6 |
| 03 · Números | 0 |
| 04 · Trabajos | 10 |
| 05 · Servicios | 1 |
| 06 · Tu panel | 0 |
| 07 · Por qué develOP | 0 |
| 08 · Cierre | 0 |


## Quién trae qué

Las mismas cosas de arriba, repartidas. Cada lista se puede mandar sola: nadie tiene que leer las otras dos para saber qué le toca.

| quién | cuántas |
|---|---:|
| Franco (o un cliente) | 1 |
| Valentino | 18 |
| Una decisión, antes que un dato | 0 |

### Franco (o un cliente) — 1

- **02 · Quiénes somos** · `personas[0].descripcion` — Cómo es Franco y de qué se ocupa. Se lee sobre la foto, así que corto.

### Valentino — 18

- **01 · Hero** · `bajada` — El renglón abajo del titular: qué se vende. Sin plazos ni porcentajes. Es UNA frase y se pinta en UN renglón en los ocho anchos — COMPO-2 revocó el quiebre en dos filas que COMPO-1 había declarado, así que ya no hay que escribirla pensando dónde corta.
- **01 · Hero** · `cta.rotulo` — Cómo se invita a mirar los trabajos. Tres palabras: es lo que entra en la ventana del rollover.
- **02 · Quiénes somos** · `titular` — La frase que abre la sección. Una idea, dos líneas, dicha como la decís vos.
- **02 · Quiénes somos** · `bajada` — Qué es develOP, en tres o cuatro renglones. Sin plazos ni porcentajes.
- **02 · Quiénes somos** · `tituloDelEquipo` — Cómo se titula el bloque del equipo. Va en tipografía gigante, así que dos palabras cortas.
- **02 · Quiénes somos** · `personas[1].descripcion` — Cómo es Valentino y de qué se ocupa. Se lee sobre la foto, así que corto.
- **02 · Quiénes somos** · `equipo.descripcion` — Cómo empezó el equipo. Se lee sobre la foto, así que corto.
- **04 · Trabajos** · `bajada` — La descripción del Portfolio, arriba del lado del texto (la reescribe C2)
- **04 · Trabajos** · `laTuya.bajada` — El texto de «la próxima es la tuya», debajo de la frase (lo reescribe C2)
- **04 · Trabajos** · `proyectos[1].problemaResuelto` — Qué le resolvió la página a Esquina Estudio
- **04 · Trabajos** · `proyectos[2].problemaResuelto` — Qué le resolvió la página a Banú Scents
- **04 · Trabajos** · `proyectos[0].resena.texto` — La reseña de El Garage (la pide Valentino)
- **04 · Trabajos** · `proyectos[0].resena.autor` — Quién firma la reseña de El Garage
- **04 · Trabajos** · `proyectos[1].resena.texto` — La reseña de Esquina Estudio (la pide Valentino)
- **04 · Trabajos** · `proyectos[1].resena.autor` — Quién firma la reseña de Esquina Estudio
- **04 · Trabajos** · `proyectos[2].resena.texto` — La reseña de Banú Scents (la pide Valentino)
- **04 · Trabajos** · `proyectos[2].resena.autor` — Quién firma la reseña de Banú Scents
- **05 · Servicios** · `PREGUNTAS_DEL_RECOMENDADOR` — Las tres preguntas del recomendador sobre los problemas del cliente, y sus tres respuestas (una por servicio).

### Una decisión, antes que un dato — 0

Ninguna hoy.

## Lo que conviene pedir primero

**Estas 6, y no porque sean más trabajo.** Son las únicas que no dependen de develOP: el dato vive en el negocio de un cliente y hay que ir a buscarlo afuera —el número que dice qué cambió en cada uno, y lo que dijo alguien con el permiso para publicarlo y con su nombre—. Una captura lleva diez minutos y se hace cuando haya un rato; esto puede tardar semanas y nadie de acá lo puede apurar. Por eso van primero, aunque en la pantalla se vean últimas.

- **04 · Trabajos** · `proyectos[0].resena.texto` — La reseña de El Garage (la pide Valentino)
- **04 · Trabajos** · `proyectos[0].resena.autor` — Quién firma la reseña de El Garage
- **04 · Trabajos** · `proyectos[1].resena.texto` — La reseña de Esquina Estudio (la pide Valentino)
- **04 · Trabajos** · `proyectos[1].resena.autor` — Quién firma la reseña de Esquina Estudio
- **04 · Trabajos** · `proyectos[2].resena.texto` — La reseña de Banú Scents (la pide Valentino)
- **04 · Trabajos** · `proyectos[2].resena.autor` — Quién firma la reseña de Banú Scents


## 01 · Hero

Se edita en `src/app/v3/_secciones/hero/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| *(prosa)* | `bajada` | Valentino | El renglón abajo del titular: qué se vende. Sin plazos ni porcentajes. Es UNA frase y se pinta en UN renglón en los ocho anchos — COMPO-2 revocó el quiebre en dos filas que COMPO-1 había declarado, así que ya no hay que escribirla pensando dónde corta. | UN renglón, 36 caracteres COMO MÁXIMO. El techo lo pone el ancho MÁS ANGOSTO y no el más ancho: la caja de la bajada mide 256 px a 320, contra los 498,80 de media medida a 1920. Medido en el navegador sobre la cadena real al tamaño de la bajada (16 px): 243,34 px de renglón, o sea 6,952 px por carácter, y 36 × 6,952 = 250,3 entra en 256 mientras 37 se pasa. ⚠ El avance por carácter es propiedad de CADA frase y no de la fuente: una con más mayúsculas no entra en 36, y el instrumento vuelve a medir la que llegue. Texto plano. |
| *(prosa)* | `cta.rotulo` | Valentino | Cómo se invita a mirar los trabajos. Tres palabras: es lo que entra en la ventana del rollover. | Tres palabras como máximo. Texto plano. |


## 02 · Quiénes somos

Se edita en `src/app/v3/_secciones/quienes-somos/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| *(prosa)* | `titular` | Valentino | La frase que abre la sección. Una idea, dos líneas, dicha como la decís vos. | Dos líneas, ~110 caracteres. Texto plano. |
| *(prosa)* | `bajada` | Valentino | Qué es develOP, en tres o cuatro renglones. Sin plazos ni porcentajes. | Tres o cuatro renglones, ~280 caracteres. Texto plano. |
| *(prosa)* | `tituloDelEquipo` | Valentino | Cómo se titula el bloque del equipo. Va en tipografía gigante, así que dos palabras cortas. | Dos palabras. Texto plano. |
| *(prosa)* | `personas[0].descripcion` | Franco (o un cliente) | Cómo es Franco y de qué se ocupa. Se lee sobre la foto, así que corto. | Una o dos frases, ~90 caracteres. Texto plano. |
| *(prosa)* | `personas[1].descripcion` | Valentino | Cómo es Valentino y de qué se ocupa. Se lee sobre la foto, así que corto. | Una o dos frases, ~90 caracteres. Texto plano. |
| *(prosa)* | `equipo.descripcion` | Valentino | Cómo empezó el equipo. Se lee sobre la foto, así que corto. | Dos o tres frases, ~150 caracteres. Texto plano. |


## 03 · Números

Se edita en `src/app/v3/_secciones/numeros/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|


## 04 · Trabajos

Se edita en `src/app/v3/_secciones/trabajos/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| *(prosa)* | `bajada` | Valentino | La descripción del Portfolio, arriba del lado del texto (la reescribe C2) | Una o dos frases, unas veinticinco palabras |
| *(prosa)* | `laTuya.bajada` | Valentino | El texto de «la próxima es la tuya», debajo de la frase (lo reescribe C2) | Una frase, unas quince palabras |
| `[TEXTO]` | `proyectos[1].problemaResuelto` | Valentino | Qué le resolvió la página a Esquina Estudio | Una frase |
| `[TEXTO]` | `proyectos[2].problemaResuelto` | Valentino | Qué le resolvió la página a Banú Scents | Una frase |
| `[TESTIMONIO]` | `proyectos[0].resena.texto` | Valentino | La reseña de El Garage (la pide Valentino) | Dos o tres renglones, con las palabras del cliente |
| `[NOMBRE]` | `proyectos[0].resena.autor` | Valentino | Quién firma la reseña de El Garage | Nombre y, si quiere, el cargo |
| `[TESTIMONIO]` | `proyectos[1].resena.texto` | Valentino | La reseña de Esquina Estudio (la pide Valentino) | Dos o tres renglones, con las palabras del cliente |
| `[NOMBRE]` | `proyectos[1].resena.autor` | Valentino | Quién firma la reseña de Esquina Estudio | Nombre y, si quiere, el cargo |
| `[TESTIMONIO]` | `proyectos[2].resena.texto` | Valentino | La reseña de Banú Scents (la pide Valentino) | Dos o tres renglones, con las palabras del cliente |
| `[NOMBRE]` | `proyectos[2].resena.autor` | Valentino | Quién firma la reseña de Banú Scents | Nombre y, si quiere, el cargo |


## 05 · Servicios

Se edita en `src/app/v3/_secciones/servicios/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
| `[TEXTO]` | `PREGUNTAS_DEL_RECOMENDADOR` | Valentino | Las tres preguntas del recomendador sobre los problemas del cliente, y sus tres respuestas (una por servicio). | Una pregunta corta y tres respuestas de una línea cada una, en voseo. Texto plano. |


## 06 · Tu panel

Se edita en `src/app/v3/_secciones/tu-panel/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|


## 07 · Por qué develOP

Se edita en `src/app/v3/_secciones/por-que-develop/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|


## 08 · Cierre

Se edita en `src/app/v3/_secciones/cierre/contenido.ts`.

| marcador | dónde | quién lo trae | qué dato es | formato |
|---|---|---|---|---|
