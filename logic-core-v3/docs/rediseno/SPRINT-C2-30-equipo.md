# SPRINT C2-30f · Quiénes somos: las fotos del equipo

Cola 2 (2026-10-23), tarea 30, la parte de las fotos (ítem 4 de la revisión; capturas `lote1/03` y `04`). El «≠» 3D es de 30s: no se tocó.

## Plan

1. **Etiquetas.** Adentro de cada retrato, siempre, el nombre en un rectángulo del papel con la tinta encima: Franco arriba a la
   izquierda, Valentino arriba a la derecha (`marco.tsx`, prop `etiqueta`). Abajo, en el revelado (hover, foco o toque), sólo el rol:
   el renglón del nombre se fue del revelado en todos los anchos.
2. **Sin el nombre grande de afuera.** Queda su `h4` oculto a la vista (el árbol de encabezados y el lector: nombre, descripción,
   foto). La descripción pasa a ser más grande (`GEOMETRIA.descripcionDeLaPersona`).
3. **Las fotos quietas en la escena.** El plano de las personas (el acompañante del título «El equipo») dejaba de mirar a la cámara
   sólo con el mouse en CIERRE RETOQUE 3D D1 (`camaraSinElMouse`), y desde PULIDO 16 (`d4746499`, `parteDelMouse` 0,7) casi ni eso:
   se colocaba en cada cuadro con la cámara del recorrido, o sea un cartel. Ahora tiene orientación propia: la de la cámara del
   recorrido en su lectura (progreso 0,21: el bloque de las dos personas en el medio del cuadro, del recibo de PULIDO 16), fija en el
   mundo, girada sobre el punto que se ve en el medio del cuadro; el ángulo con la cámara viva, acotado a 18° (`orientacionPropia.ts`).
4. **Pruebas.** `s78-c30f` sin navegador; el banco `scripts-carga/equipo.ts`.

## Log

- Historia (`git log -S`): `d4746499` (PULIDO 16 N1) puso los dos planos de Quiénes somos a seguir el 70 % de la órbita del mouse;
  con la colocación `pantalla` el plano copia la orientación de la cámara del recorrido en cada cuadro. Eso es lo que «se salió».
- El tope sale del modelo de s67 (el recibo `n1-nosotros.json`, seis anchos, el mouse en las nueve posiciones): sin tope el ángulo
  llega a 47° entrando (la cámara gira de 0° a 130° de azimut en la sección); con 15/18/20/25° la foto más torcida queda a
  0,90/0,87/0,85/0,80 de su proporción y el peor margen a 1024 en 42/36/33/24 px. Se eligió **18°** (0,87 sobre el piso 0,85; 36 px).
- Entre el medio y la salida la cámara gira 20,8° (lo menos de los seis anchos) y el plano 0,00°: quieto en el mundo. Entrando, la
  cámara viene de muy lejos y el plano queda en el tope (gira lo justo con ella).
- El título 3D «El equipo» sigue como estaba (colocado con su cámara): la orientación propia es sólo de las personas (sus textos y
  sus fotos). La foto de «Nosotros» tampoco cambió (otra pantalla; con su `useAcompananteDelTitulo('nosotros')` de siempre).
- La descripción: antes `cuerpo` (15 px en todos los anchos). Ahora 17 px abajo de 1024 (el cuerpo de la bajada) y, desde 1024,
  16 px hasta 1120 y de ahí a 20 px en 1440 (quieta arriba). La recta sale de la columna: la palabra más larga, «perfeccionista.»,
  mide 7,04 em (avances de la Chivo 400 de los títulos 3D, menos el interletrado) y la columna es 120 px hasta 1120; así la columna
  y la foto no cambian. Antes → después: 390 15 → 17 · 768 15 → 17 · 1024 15 → 16 · 1280 15 → 18 · 1440 15 → 20 · 1920 15 → 20.
- Tests que cambiaron con la spec (cada uno con su control): `quienes-somos.invariant` (6 → 4 textos por el canal; 36 → 30
  hovers), `s7-mezcla` (el `h4` ya no mezcla: va en la etiqueta), `s37` (equipo.tsx 3 → 2 canales), `s40` (cero renglones de nombre
  en el revelado, la etiqueta existe), `s46` (el acompañante acepta el segundo argumento), `s61` J9 a (el nombre nunca en el
  revelado), `s5-compacto` (los encuadres `arriba`/`medio` no son texto de pantalla: se «encontraban» por casualidad en la clase de
  peso del nombre que se fue), `s5-archivos` (el padrón suma `tramoDelEquipo.ts`).
- Fallas de antes, no mías: `s61` J7 (el titular de Portfolio) y `s4-cobertura` (s23–s39 sin su `test:`).

## REGLA DE ALTURAS

Desde 1024 la sección **no cambia**: la fila de cada persona la manda la foto (4:3), más alta que la columna de texto de antes y de
ahora (a 1024: foto 258 px, texto 209 → 179; a 1440: 384, texto 167 → 224; s78-c30f lo afirma de 1024 a 2560). Abajo de 1024 el
texto va sobre la foto y la pantalla del equipo se acorta (modelo, el alto de la pantalla del equipo; el resto de la sección igual):

| ancho     | viejo   | nuevo   | k       |
|-----------|---------|---------|---------|
| 1440×900  | igual   | igual   | 1       |
| 1024×768  | igual   | igual   | 1       |
| 768×1024  | 1484 px | 1398 px | 0,9420  |
| 390×844   | 941 px  | 932 px  | 0,9897  |

La `k` no es una constante: `tramoDelEquipo.ts` la mide en el navegador abajo de 1024 (y de nuevo con cada cambio de tamaño). Un
fantasma de la columna de texto de antes (el nombre en su escalón, la juntura y el cuerpo de 15 px), del mismo ancho e invisible,
da lo que cada fila se acortó; el alto viejo es `max(min-h-svh, contenido + acortado)` y la `k` nuevo / viejo, anotada con
`anotarTramo` sobre la pantalla del equipo (`secciones.ts` sin tocar). La deriva la mide el orquestador.

## Qué mirar

- Banco: `BASE=http://localhost:3000 npx tsx scripts-carga/equipo.ts` (1440, 1024, 768, 390) y su control
  `CONTROL=mira-camara ANCHOS=1440x900,1024x768 npx tsx scripts-carga/equipo.ts` (tiene que fallar ORIENTACIÓN PROPIA). Fotos en
  `~/.cache/b4-medicion/equipo/`.
- A ojo, `http://localhost:3000/v3` a 1440 y 1024: bajar con la rueda hasta «El equipo» y seguir hasta Nosotros. Las dos fotos
  se ven en perspectiva y no giran con la cámara en el medio del tramo (al entrar acompañan lo justo); con el mouse en los costados
  se ven de costado, legibles. La etiqueta blanca con el nombre arriba (Franco a la izquierda, Valentino a la derecha); al pasar el
  mouse, abajo sólo el rol. Al lado, la descripción más grande y sin el nombre grande.
- A 768 y 390: la etiqueta en la foto, el toque abre sólo el rol abajo; el texto sobre la foto sin el nombre.
