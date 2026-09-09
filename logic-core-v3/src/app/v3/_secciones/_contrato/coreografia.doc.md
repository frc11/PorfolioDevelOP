# EL SEAM DE LA COREOGRAFÍA — el árbol quieto vive acá, y el animado se enchufa

> Es el docblock de cabecera de `coreografia.tsx`, mudado acá en **B10** cuando
> ese archivo llegó a 305 líneas al resolverse a mano el merge de las cuatro
> ramas y cruzó el límite de 300 del repo. **Ni una línea de código cambió: lo
> único que se movió es dónde vive la prosa.** Los docblocks que explican una
> decisión de un campo —`lente`, `rango`, `AnclajeDelBloque`, `RangoDelBloque`—
> se quedaron al lado de su campo, que es donde se leen.

## EL PROBLEMA QUE RESUELVE, QUE ES EL HALLAZGO GRANDE DE LOS DOS LANES

Los dos lanes de secciones reportaron lo mismo por separado: **la coreografía
viajaba en la carga inicial en TODOS los anchos.** Abajo de 1025 el
comportamiento estaba gateado —no se montaba el motor, no se partía el texto,
no se escribía una transformada— pero el código bajaba igual, porque una
sección era UN árbol que importaba el sistema de motion de forma estática y
decidía en tiempo de ejecución.

Eso contradice una decisión cerrada del proyecto, la que S1 escribió para el
escenario: *"el bundle no se importa abajo del umbral. No es una clase de CSS
que esconde."*

### Por qué no se arregla sección por sección

Porque hacerlo ocho veces son ocho implementaciones que divergen, y el modo
de falla de eso es el peor posible: que la persona de mobile lea un contenido
distinto del de escritorio. Los dos lanes lo dijeron con esas palabras y
tenían razón.

### La forma que toma acá: UNA compuerta arriba, DOS juegos de primitivas

Este módulo declara las primitivas con las que las ocho secciones se
escriben —el `Bloque` acá, los canales en `canales.tsx`— y las implementa
**quietas**: DOM plano, sin un solo import de valor del sistema de motion.
Ése es el árbol que se sirve y el que baja siempre.

El árbol animado no es otro árbol de contenido: es el MISMO, con las
primitivas reemplazadas. Las implementaciones animadas viven en
`coreografia-animada.tsx`, que importa el sistema entero, y llegan por
contexto desde un módulo que se pide con `import()` perezoso —el mecanismo de
S1— sólo arriba del umbral.

**La consecuencia que importa: el contenido está escrito UNA vez.** No hay
dos árboles que puedan decir cosas distintas, porque hay uno solo; lo único
que cambia es quién envuelve cada pieza. Igual se comprueba —`s7-arboles`
compara el texto renderizado de las dos ramas y exige que sea el mismo— por
la misma razón por la que se comprueba todo acá: que algo sea verdad por
construcción no es lo mismo que que esté verificado.

### Lo único que este archivo NO puede tener

Un import de valor de `_lib/motion/` o de `motion/_componentes/`. Si lo
tuviera, el sistema de motion volvería a la carga inicial y toda esta
arquitectura sería decorativa. Los tipos sí se importan: `import type` se
borra al compilar y no deja una línea en el bundle. `s7-compuerta` lo afirma
sobre la salida del build, con marca y control positivo, y `s7-contrato` lo
afirma además sobre el fuente, que es donde se puede decir CUÁL import sobra.
