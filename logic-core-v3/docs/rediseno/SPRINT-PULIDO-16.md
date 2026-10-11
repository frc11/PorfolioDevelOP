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
- HECHO · VISTO sí (banco `pulido-16/_scripts/n2-plasma.ts`; hojas `~/.cache/b4-medicion/pulido-16/n2/hoja-n2-1440.png` (los nueve
  estados: calma de día, caliente, el arco del logo que ioniza, una recombinación con su eco, la carga, la descarga al soltar, el
  pulso del clic, de noche y un arco de noche), `hoja-n2-390.png` (la resumida: calma, caliente, el toque, la carga, la descarga,
  de noche), `hoja-n2-experimentos.png` (en color y con las líneas de campo), `hoja-n2-recortes.png` y `final/hoja.png` (el final
  del pie); recibo `entregas/pulido-16/n2-plasma.json`). El modelo entero, con sus constantes, en `docs/rediseno/PLASMA.md`.
- EN MÓDULOS (`_lib/escena/energia/`): `especies.ts`; `fisica/` (las fuerzas, la integración, las reacciones, la temperatura);
  `arcos/` (el camino, el modelo, el programador, el búfer); `interaccion/` (el gesto, los oyentes, las líneas de campo); `render/`
  (lo común, las partículas, los arcos y los efectos, el armado); `cuadro.ts`, `banco.ts`, `PlasmaYCargas.tsx`. Ninguno de más de 300
  líneas de código. Los de PULIDO 15 (`cargas.ts`, el `arcos.ts` de 394 líneas, `sombreadores.ts`, `armado.ts`) se borraron.
- PARTÍCULAS: átomos (un núcleo y, de cerca, uno o dos electrones en micro-órbita), iones + (el halo más caliente, sin órbita) y
  electrones (chicos, rápidos, con su estela). 324 en escritorio (260 átomos y 64 lugares de electrón), 176 en el teléfono. LOD por
  tamaño en pantalla con fundido; al nacer y morir, fundido (lo más rápido, 4 cuadros).
- FÍSICA: Coulomb suavizado con corte suave, la polarización de los neutros, una repulsión de corto alcance (no colapsan); moléculas
  (dos átomos) y pares ligados (ion y electrón) con un resorte rígido que VIBRA (su largo late: ~0,07 u) y se rompe con la temperatura
  local (Arrhenius; la agitación de costado, no su propia vibración); el par ligado recombina en calma. Integración semi-implícita a
  paso fijo de 1/120 s con subpasos; la grilla.
- TEMPERATURA: sube con el scroll, los anillos y el pulso principal del logo, el golpe del pie, el clic, la descarga y los arcos; baja
  sola; se satura (nunca pasa de 1). En calma ~0,2 (con los anillos del logo); con scroll rápido ~0,6–0,7.
- ARCOS: el camino es un líder escalonado que sigue al campo (medido contra el campo de verdad: 0,75 de alineación, contra 0,63 de uno
  guiado al azar); las ramas buscan una carga; 2–3 golpes en ~150 ms por el mismo canal con su resplandor residual (~140 ms); ionizan
  lo que tocan (el electrón sale disparado con su estela); iluminan las partículas cercanas, el piso (de noche) y donde tocan el
  logo. El logo es el generador (los más limpios y potentes; más seguido después de su pulso; en el golpe del pie, descarga).
- INTERACCIÓN: el puntero es una carga; el clic es un pulso radial que ioniza y tira arcos; mantener carga (el halo crece) y soltar
  dispara la descarga al grupo más denso o al logo; en el teléfono, tocar y mantener quieto (el dedo que se mueve hace scroll y
  cancela). Nunca sobre un texto.
- DIBUJO: de día objetos (el grafito con su borde especular fino y claro, y un anillo del papel que lo separa del logo negro); los
  arcos de día en tinta con un núcleo blanco (dos pasadas: si no, la tinta de un tramo tapaba el núcleo del anterior y quedaba
  punteado); de noche, luz. Estelas por la velocidad, profundidad de campo barata, todo por el tono ACES compensado de la escena,
  detrás de los textos. Movimiento reducido: quietas, sin arcos ni pulsos.
- EXPERIMENTOS (apagados): `?plasma-campo=si` (las líneas de campo con el botón apretado) y `?plasma-sonido=si` (la chispa, fabricada
  en el sprite como los demás sonidos —`scripts-retoque/sonidos.ts`, al final: los cortes de los demás no se movieron—, volumen 0,05,
  cada 110 ms como mucho; sólo con el sonido prendido).
- Medido en la NVIDIA (RTX 5050; la pantalla del banco va a 75 Hz: 13,34 ms por cuadro), en caliente (una visita antes):

  | Corrida | Calma (media / máx.) | Temperatura máxima, con scroll, pulsos y carga (media / máx.) | Noche (media / máx.) | Cuadros de más de 20 ms |
  |---|---|---|---|---|
  | plasma, 1440 (el mouse) | 13,34 / 13,9 | 13,34 / 14,0 | 13,34 / 14,0 | 0 |
  | plasma, 390 (el dedo) | 13,34 / 14,0 | 13,34 / 14,0 | 13,34 / 14,0 | 0 |
  | en color, 1440 | 13,34 / 14,0 | 13,34 / 14,1 | 13,34 / 13,9 | 0 |
  | con las líneas de campo, 1440 | 13,34 / 14,0 | 13,34 / 14,0 | 13,34 / 14,0 | 0 |
  | el polvo (la base), 1440 | 13,34 / 13,9 | 13,34 / 14,2 | 13,34 / 13,9 | 0 |
  | el polvo (la base), 390 | 13,34 / 14,0 | 13,34 / 14,1 | 13,34 / 14,0 | 0 |

  En Node, la física y los arcos cuestan ~0,3 ms por cuadro. La primera corrida después de un build (en frío) tuvo un cuadro de 307
  ms en la tanda caliente (la página carga sus secciones con el primer scroll rápido); repetida dos veces en caliente, ninguno.
- LECTURAS ANOTADAS: (1) «una luz puntual barata o un término en el shader» para el piso y el logo: un término (un disco de luz en
  el piso, de noche, y un destello donde el arco toca el logo), no una luz de three (sumarla recompila todos los materiales de la
  escena: un tirón). (2) «Moléculas de un ion y un electrón (o dos átomos)»: las dos, con sus constantes; el par ligado es el que
  descarga arcos y el que recombina. (3) «El logo es el generador»: una carga positiva que late con su pulso; por eso junta
  electrones cerca, y su arco prefiere un átomo de sus candidatos (lo ioniza: alimenta el ciclo). (4) «Cerca del encastre y en el
  golpe del pie»: el plasma sigue hasta el golpe (antes se apagaba con la cámara que sube) y en el golpe el logo descarga.
- Errores míos que mostró el banco y se arreglaron antes de la tanda final: la temperatura en calma estaba en 0,88 (guardaba la hora
  de cada anillo en un `Float32Array` y la comparación con el número de la escena nunca daba igual: cada anillo calentaba en todos
  los cuadros); el pulso del clic sobre el logo no encontraba a quién tirarle (el punto del puntero caía en el hueco: ahora, donde
  el rayo entra a la nube; y en el teléfono, con unos intentos al azar no encontraba ninguna visible: ahora las mira todas); a 390
  casi no había arcos (las cajas de texto eran las de los bloques, y el menú cerrado del teléfono vedaba el medio de la pantalla:
  ahora, lo que ocupan las letras y sólo lo que se ve); el toque se perdía (al levantar el dedo el rayo ya no estaba); el núcleo
  blanco de día salía punteado (dos pasadas); el enlace casi no vibraba (resorte blando para su latido).
- Invariante: s67 (los módulos; las especies y su ciclo con la carga conservada; los fundidos sin pop; la física; la temperatura con
  su autolímite; el orden en calma y el desorden caliente; el ciclo contenido; la grilla; los arcos, su tope y ninguno sobre el
  texto; el camino que sigue al campo; los re-golpes; la ionización; el gesto; el logo generador y el golpe; el clic y la descarga;
  el dibujo; el movimiento reducido; sin reservas por cuadro; los experimentos; lo medido; cada uno con su control positivo). s66
  (PULIDO 15): lo que afirmaba del modelo borrado (la física, los arcos y los sombreadores de entonces) quedó en una nota que apunta
  a s67; quedan sus banderas y lo medido entonces, con sus cantidades. s52 pide las dos banderas nuevas.

### Final · verificar
- PENDIENTE.

## Disco y memoria por tanda

| Tanda | Disco libre | Memoria disponible | No paginado | Nota |
|---|---|---|---|---|
| N1 diagnóstico (dev server) | 82,0 GB | 3332 MB (bajó a 1391) | 923 MB | el dev server llegó a 4 GB: se apagó y se pasó al build de medición |
| N1 geometría (seis anchos) | — | 6414 → 5886 MB | 872 → 910 MB | build de medición (`.next-probe`) |
| N1 con el mouse (seis anchos y la bandera) | 78,1 GB | 5993 → 5125 MB | 919 → 921 MB | |
| N2 pruebas (cuatro builds de medición) | — | 6239 → 5664 MB | 909 → 918 MB | cada build, 111–136 s |
| N2 tanda final (primer intento) | — | 3802 → 2600 MB | 1110 → 983 MB | Windows creaba un punto de restauración (SrTasks): el portero frenó el banco; con el Chrome cerrado y SrTasks terminado, 4707 MB |
| N2 tanda final | 77,3 GB | 6663 → 5950 MB | 944 → 949 MB | el plasma (1440, 390, color, campo); el polvo, de la tanda anterior (no cambia) |

## Lo que no quedó bien

(se completa al final)
