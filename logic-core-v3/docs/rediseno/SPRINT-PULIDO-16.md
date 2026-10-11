# SPRINT PULIDO 16 — Nosotros siempre a la vista + el plasma llevado a calidad profesional

Rama `rediseno/home`. Invariante nuevo: `npm run test:s67-pulido-16` (`src/app/v3/_lib/__tests__/s67-pulido-16.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base) y `~/.cache/b4-medicion/pulido-16/_scripts/` (los de este sprint).
Recibos: `docs/rediseno/entregas/pulido-16/`.

Aprobados (no se tocan): Quiénes somos (M1 de PULIDO 15, con su halo y la deuda de AA de noche aceptada). El plasma, como concepto
(«me encantan plasma y plasma-y-polvo»): las dos banderas siguen (`?energia=plasma` y `?energia=plasma-y-polvo`) y el default sigue
siendo el polvo hasta que el humano diga. `lente.ts` (sólo fin de línea) fuera de los commits.

El humano puede no estar: ante una ambigüedad, la lectura más razonable, anotada acá, con la alternativa atrás de una bandera.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### Arranque
- `.next-probe` (el build de medición de PULIDO 15, 5,3 GB) borrado. Disco: 82,0 GB libres; 6,9 GB de memoria disponibles. El dev
  server, apagado. Al terminar no queda ningún build de medición.

### N1 · Nosotros: que siempre se vea todo
- HECHO · VISTO sí (banco `pulido-16/_scripts/n1-cajas.ts`, con el mouse real en las cuatro esquinas; hojas
  `~/.cache/b4-medicion/pulido-16/n1/hoja-n1-1920.png`, `hoja-n1-1366.png` y `hoja-n1-fijo-1920.png`; el antes, `diag.png`;
  recibo `entregas/pulido-16/n1-nosotros.json`).
- LA CAUSA (medida, no supuesta): las personas van en el plano de «El equipo» (y la foto en el de «Nosotros»: el anclaje de A1),
  a la profundidad del logo y de frente a la cámara. En Quiénes somos el mouse orbita la cámara hasta 22° (y la cámara mira 12°
  para arriba): el plano gira y lo de la derecha de la calle, lejos del eje de la órbita, se agranda y se tuerce por la
  perspectiva. A 1920, con el mouse en una esquina de la derecha, la foto de Franco, «Valentino» y su bio, «El equipo» y la foto
  del equipo se iban hasta 175–321 px de la pantalla (y la foto de Franco, 158 px por arriba).
- LO QUE SE HIZO: el plano entero (el título y su texto 2D, colocados con la misma cuenta: el anclaje de A1 sigue) va 0,8 veces más
  chico hacia el centro del cuadro, a la misma profundidad (`colocar`, `alejamiento`), y sigue el 70 % de la órbita del mouse (una
  cámara con esa parte del mouse, `camaraConParteDelMouse`; con el 30 % que queda se sigue viendo en perspectiva). Lo que entra y
  sale del cuadro se mide donde se ve (el plano alejado entra y sale antes que su caja del DOM: sin saltos). La altura de la
  sección no cambia (el DOM no se tocó: REGLA DE ALTURAS).
- LECTURA ANOTADA («alejalo un poco para atrás»). Medido con el modelo (las funciones de la escena sobre las cajas del DOM del
  banco): empujar el plano más atrás de verdad lo hace barrer MÁS con el mouse (a 1,3 y 1,7 veces la profundidad, peor; la del
  logo es la que menos se mueve); sólo achicándolo, fijo en el mundo, hacía falta 0,57 (la bio de 15 px se vería de 8,6 px). Por
  eso, achicar un poco y que el plano siga parte de la órbita. La otra lectura, atrás de `?nosotros=fijo`: fijo en el mundo
  (como antes) y 0,57 más chico.
- EL CRITERIO de «siempre se ve todo» (s67): donde la página tiene la pieza entera en el cuadro (su caja del DOM adentro), la que
  se ve queda adentro con 24 px por los cuatro lados; y en todo el recorrido, por los costados (por ahí no se entra con el
  scroll). Con el mouse en las cuatro esquinas y en los cuatro costados.
- Medido (el peor margen de foto, nombre y bio de cada uno, los dos títulos y la foto del equipo):

  | Ancho | Modelo (peor caso) | Medido (mouse real en las esquinas) | `?nosotros=fijo` (modelo) |
  |---|---|---|---|
  | 1024 × 768 | 40 px | 41 px | 64 px |
  | 1280 × 800 | 36 px | 37 px | 54 px |
  | 1366 × 768 | 39 px | 41 px | 74 px |
  | 1440 × 900 | 53 px | 55 px | 107 px |
  | 1920 × 1080 | 57 px | 59 px | 107 px (medido: 111) |
  | 2560 × 1440 | 74 px | 75 px | 117 px |

  Antes, a 1920: −319 px. El modelo y lo medido difieren a lo sumo 3 px caja por caja.
- Invariante: s67 (el modelo con las funciones de la escena y el recibo; la identidad sin alejar y el alejamiento con el mouse
  quieto; el peor caso en los seis anchos, con los controles positivos de antes y de sólo alejar; lo medido; el cableado en el
  código; la bandera). s36, s41 y s52 (NOCTURNO FINAL) clavaban el texto de dos llamadas que ahora llevan un argumento más (el
  alejamiento, el plano de Nosotros): aceptan el nuevo, con lo demás igual; s52 (PULIDO 1) pide la bandera nueva.

### N2 · El plasma: más profesional, con magia
- EN CURSO.

### Final · verificar
- PENDIENTE.

## Disco y memoria por tanda

| Tanda | Disco libre | Memoria disponible | No paginado | Nota |
|---|---|---|---|---|
| N1 diagnóstico (dev server) | 82,0 GB | 3332 MB (bajó a 1391) | 923 MB | el dev server llegó a 4 GB: se apagó y se pasó al build de medición |
| N1 geometría (seis anchos) | — | 6414 → 5886 MB | 872 → 910 MB | build de medición (`.next-probe`) |
| N1 con el mouse (seis anchos y la bandera) | 78,1 GB | 5993 → 5125 MB | 919 → 921 MB | |

## Lo que no quedó bien

(se completa al final)
