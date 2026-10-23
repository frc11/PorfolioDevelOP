# 31 · El cristal: las grietas nuevas y el moiré

Modelo: **opus**. Toca los shaders del muro de cristal.

## 1. Las grietas, de nuevo (ítem 19)
A Valentino no le gustó ninguna de las 3 variantes de B9 (captura `lote2/10`: grietas blancas generales que cruzan todo). Encontró lo que quiere (captura `lote2/06`: el vidrio aristado, una telaraña radial con anillos concéntricos):
- **Cada forma de cristal del muro (cada celda) se agrieta por dentro, por separado.** La grieta no es una general que cruza el muro: está adentro de cada bloque, con su propio centro.
- **El agrietado es progresivo**, en todas las celdas **al mismo tiempo**, y se ve **del principio al final** (que se note cómo se va formando).
- Dos sentidos, con bandera: **`?grietas=centro`** (de adentro hacia los bordes de cada celda, el valor por defecto) y **`?grietas=borde`** (de los bordes hacia el centro).
- **Sin brillo en el home.** El brillo (con el acento) queda solo para las páginas de servicio.
- **Se borran las variantes 1, 2 y 3** y su código muerto. El disparador, los tiempos, la oscuridad del principio y la vuelta atrás con el scroll quedan como los dejó B9 (el enganche del home en el CTA y el de las páginas cuando entra el título 3D).
- Costo: el del muro hoy es ≤ 0,06 ms por cuadro; que siga en ese orden (medilo).

## 2. El moiré (bandera de Valentino)
- **`?moire=mouse` pasa a ser el valor por defecto.** Las otras (`0`, `1`, `2`) se borran.
- **Bug:** con `mouse` aparecen **líneas negras horizontales** (captura `lote3/01`, en el piso, cerca del cursor). No tienen que estar: encontrá de dónde salen (¿la trama del moiré proyectada en el piso, un z-fighting, una muestra mal filtrada?) y arreglalo.
- Dejá la entrada del moiré preparada para recibir, además del mouse, **una posición que venga de la inclinación del teléfono** (la tarea 81 la conecta): una función o señal con el mismo rango que el mouse.

## Criterios
- Fotos de la grieta en 5 momentos (0, 25, 50, 75 y 100 %) con `centro` y con `borde`, a 1440, en el home (el CTA) y en `/v3/pagina-base`.
- El costo por cuadro del muro con las grietas y con el moiré.
- `?moire=mouse` sin líneas negras: foto antes y después, en la misma posición del mouse.
