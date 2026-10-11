# SPRINT PULIDO 17 — El plasma, de nuevo y en serio

Rama `rediseno/home`. Invariante nuevo: `npm run test:s68-pulido-17` (`src/app/v3/_lib/__tests__/s68-pulido-17.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base) y `~/.cache/b4-medicion/pulido-17/_scripts/` (los de este sprint).
Recibos: `docs/rediseno/entregas/pulido-17/`. Referencias: `docs/rediseno/REFERENCIAS-PLASMA.md`. El modelo: `docs/rediseno/PLASMA.md`.

Decisiones del humano (no se discuten):
- Nosotros queda como está (el plano a 0,8 que sigue el 70 % del giro). Se BORRA `?nosotros=fijo` («está re alejado»).
- El plasma de PULIDO 16 (átomos con órbitas, iones, electrones con estela, moléculas con resorte) NO gustó («tiene una forma muy
  definida, tampoco para tanto»). Se borra con su código. Se borran también `?plasma-sonido`, `?plasma-color` («sin sonido ni
  color, descartado») y `?plasma-campo`, con su código (y la chispa del sprite de sonido).
- Lo que SÍ le encantó: el plasma de PULIDO 15 (cargas sueltas + arcos, `ca63ff21`) y `plasma-y-polvo`. Ese es el espíritu, llevado
  a otro nivel: «algo un poco menos nítido, menos formado; que no sean literalmente átomos, que sean partículas de energía que
  brillan, vibran, se mueven». Monocromo (el de la escena), sin sonido.
- El polvo sigue siendo el default del sitio hasta que el humano apruebe. `lente.ts` (sólo fin de línea) fuera de los commits.

El humano no está: ante una ambigüedad, la lectura más razonable, anotada acá, con la alternativa atrás de una bandera.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### Arranque
- Árbol limpio (sólo `lente.ts` y los sin seguimiento de siempre). Disco: 80,5 GB libres; 6,8 GB de memoria disponibles; no paginado
  936 MB. Sin dev server, sin servidor de medición, sin Chrome del banco, sin `.next-probe`.

### O1 · Borrar `?nosotros=fijo`
- HECHO (`5b651b56`) · VISTO sí: con la bandera borrada, `?nosotros=fijo` da el producto (el plano a 0,8 que sigue el 70 % del giro).
- `PLANO_DE_NOSOTROS` es un solo plano (`{ alejamiento: 0.8, parteDelMouse: 0.7 }`); los dos títulos de Quiénes somos lo piden sin
  elegir (`...PLANO_DE_NOSOTROS`; `planoDeNosotros()` y la lectura del entorno se fueron); `nosotros` salió de `Pruebas`, de
  `PRUEBAS_APAGADAS`, de `PRUEBAS_SUELTAS` y del traductor.
- Tests: s67 (N1) afirma lo mismo del plano que queda (el modelo, lo medido, el cableado), sin la otra lectura ni su bandera; s41 y
  s52 (NOCTURNO FINAL) clavaban el texto de las dos llamadas: aceptan el nuevo, con lo demás igual; s52 (PULIDO 1) ya no la pide.
  s68 · O1: la bandera no vuelve (ni suelta ni en el pedido) y la sección no elige, con sus controles positivos.
- Compuerta: tsc en verde; lint de los tocados sin errores (los 3 avisos de `equipo.tsx` son imports sin usar de antes); las 46
  suites que leen lo tocado, en verde.

### O2 · Investigar y proponer (REFERENCIAS-PLASMA.md, tres direcciones)
- HECHO · `docs/rediseno/REFERENCIAS-PLASMA.md`: 18 referencias (Bridson y el curl noise; el ruido con gradiente analítico de
  Gustavson y McEwan; The Spirit y Particle Love; Maxime Heckel y Codrops para las partículas en la GPU con R3F; partículas suaves;
  Quílez; la profundidad de campo por tamaño; el «stretched billboard»; Kim y Lin y «Lo-fi Lightning» para los arcos; Niagara; la
  bola de plasma; Igloo Inc, BlueYard y Dracarys; las mezclas sobre fondo claro), cada una con qué se toma y por qué, y cómo se leyó
  (entera o por el resumen del buscador: Codrops y Awwwards bloquean la lectura directa). Ningún código copiado.
- Las tres direcciones propuestas: A · Chispas (las cargas de PULIDO 15 hechas luz, en la CPU), B · Enjambre (un medio de miles de
  motas en la GPU alrededor de unos núcleos) y C · Corrientes (estelas). En el banco, C no levantó y se reemplazó (O4).

### O3 · Borrar el plasma de PULIDO 16 y construir las tres direcciones (`?plasma=a|b|c`)
- HECHO · VISTO sí (O4). El modelo entero, con sus constantes, en `docs/rediseno/PLASMA.md`.
- BORRADO: los átomos (`especies.ts`, `fisica/`, `render/`, el búfer de tramos, las líneas de campo) y sus experimentos con su
  código: `?plasma-color=`, `?plasma-campo=`, `?plasma-sonido=` y la chispa del sprite (el sonido volvió a ser el de PULIDO 13: los
  mismos archivos, recuperados con `git show`; `SONIDO.md` y s40 sin la chispa). s66 y s67 dejan una nota que apunta a s68 (como hizo
  s66 en PULIDO 16), con lo medido entonces; s52 pide la bandera nueva.
- LA BANDERA: `?plasma=a|b|c` (pedida sola, también monta el plasma en lugar del polvo); con `?energia=plasma-y-polvo`, además del
  polvo (visto con las tres). Sin `?plasma=`, la recomendada (A). El producto sigue con el polvo.
- LO QUE COMPARTEN (en módulos de menos de 300 líneas, sin reservas por cuadro): el campo (curl noise con el mismo hash en JS y en
  GLSL), las brasas (la física de PULIDO 15, sin cambios en sus constantes, más el campo, la energía de cada una, el temblor, el
  puntero que ordena, las ondas, el piso y el brillo por densidad), la temperatura (la de PULIDO 16), los arcos (el camino de PULIDO
  15 más suave, 2–3 golpes por el mismo canal, el resplandor, la cinta continua en dos pasadas), el gesto (el de PULIDO 16 sin las
  líneas de campo), los textos (pasan por detrás con un borde suave), el tono ACES compensado, el pie y el movimiento reducido.
- LA PARTÍCULA (un sombreador para las tres, el aspecto en uniformes que el banco ajusta en vivo): núcleo y halo gaussianos, titila,
  destella, respira por regiones, vibra con la energía, viene de la fuente, deja libre la cara del logo, profundidad de campo con el
  brillo conservado, tope de brillo. De día, energía oscura translúcida y un destello claro sólo en las calientes.
- LA SIMULACIÓN DE B Y C (el ping-pong de la escena, 32 bits): todas las fuerzas son campos (sin pares): el curl noise que rodea al
  logo por su campo de distancia, los núcleos, el puntero, las ondas, los arcos, el temblor; cada mota vive 6–14 s y renace. C se
  pega a la superficie del logo.
- PRECALENTADO: las partículas, la cinta de los arcos y los efectos se dibujan desde el primer cuadro (los lugares sin arco tienen
  ancho 0; sin efectos, uno nulo): el precompilado de la escena los arma al cargar.

### O4 · Mirar, criticar, iterar (el banco de secuencias)
- HECHO · VISTO sí. Bancos: `~/.cache/b4-medicion/pulido-17/_scripts/` (`o3-mirar.ts`, `o3-ajustar.ts`, `o3-cerca.ts`,
  `o4-secuencias.ts`, `o4-dedo.ts`). Las hojas finales, en `~/.cache/b4-medicion/pulido-17/o4/final-<a|b|c>-<1440|390>/`: a 1440
  `1-calma-noche`, `3-puntero`, `4-clic`, `5-mantener-soltar` (de noche, donde se lee la energía), `2-calma-dia`, `4b-clic-dia` y
  `6-pie`; a 390 la resumida con el dedo (sin el puntero). 8 cuadros del compositor cada ~0,15 s, elegidos por tiempo; recibo de
  los tiempos: `entregas/pulido-17/o4-secuencias.json`. Lo que se criticó y se cambió, abajo («Crítica»).

### O5 · Elegir, medir (en frío y en caliente), el modelo y el invariante
- HECHO · VISTO sí. RECOMENDADA: **A · Chispas** (`DIRECCION_RECOMENDADA`; el porqué, en «Recomendación»).
- MEDIDO en la NVIDIA (`o5-medir.ts`, `o5-tanda.sh`; recibo `entregas/pulido-17/o5-medido.json`; la tabla, en `PLASMA.md`): con
  vsync, al máximo y de noche, ningún cuadro de más de 20 ms en ninguna dirección ni ancho (máx. 14,1 ms). Sin vsync (el costo de
  verdad), lo que cada una suma al polvo por cuadro al máximo: A +2,04 ms a 1440 (las 600 brasas en la CPU) y +0,42 a 390; B +0,48
  y +0,14; C +0,46 y +0,16. La simulación en la GPU: 0,12 ms (B, 16.384 motas) y 0,11 ms (C) por paso a 1440.
- EN FRÍO (cachés borradas, el primer scroll rápido): tirones de 0,2 a 1,2 s CON Y SIN plasma (el polvo solo: 534, 747 y 547 ms a
  1440 en tres corridas, 814 a 390). Atribuido (`o5-campo.ts`): el cuadro largo cae con el campo del logo que se publica (lo hornea
  el polvo con física, montado siempre) y con las secciones que se montan al llegar. Un cuadro largo en la calma (334 ms en el
  polvo solo) es el mismo campo. Lo del plasma está armado desde el primer cuadro; el pico de 533 ms de una corrida de B se cerró
  dibujando siempre el efecto nulo.
- Invariante: s68 (O3: lo borrado no vuelve; la bandera; las tres; el campo sin divergencia y el mismo azar; la física de PULIDO 15;
  el puntero que ordena y energiza; la temperatura; los arcos, su tope, sus golpes, el largo mínimo del logo, el clic contenido,
  nunca sobre el texto; la cinta; el dibujo; el pie; el movimiento reducido; los módulos; sin reservas por cuadro. O4: las hojas.
  O5: lo medido, con la deuda declarada del frío del sitio). Cada cosa con su control positivo.

### Final · verificar
- PENDIENTE.

## Disco y memoria por tanda

| Tanda | Disco libre | Memoria disponible (antes → después) | No paginado (antes → después) | Nota |
|---|---|---|---|---|
| Arranque | 80,5 GB | 6753 MB | 936 MB | |
| O3–O4 (doce builds de medición, de 117 a 208 s cada uno; las miradas, los ajustes y las secuencias) | 80,5 → 77,8 GB | 5950–6778 MB al relanzar | 921–995 MB | caché del banco 1,1 → 1,2 GB; los cuadros crudos, borrados apenas se arma cada hoja |
| O5 (tres tandas: con vsync en frío y en caliente, sin vsync, y las repeticiones en frío) | 77,8 GB | 6156 → 5209 MB (con vsync), 5487 MB (sin vsync) | 943–947 MB | cada corrida con el Chrome relanzado y el perfil sin cachés |

## Crítica (lo que el banco mostró y qué se hizo)

1. Primera mirada (las tres de día y de noche): de noche, un cielo de estrellas parejo en toda la pantalla (no energía que sale del
   logo); en B y C los textos dejaban un RECTÁNGULO vacío; de día, motas grises que parecían suciedad. → La fuente (lejos del logo se
   apaga), la respiración por regiones, el borde suave de los textos (56 px) y el aspecto en uniformes para ajustar en vivo.
2. De cerca: los arcos de noche eran GUSANOS blancos (anchos y saturados) y el destello donde tocan el logo una mancha; de día, una
   grieta gris. → La cinta continua en inglete (los tramos superpuestos hacían cuentas brillantes en cada junta), un núcleo fino y un
   halo tenue, el camino más suave, un largo mínimo para los del logo y el toque del logo chico.
3. Las chispas de A con rayas: era la estela por velocidad. → Sin estela en A (orbes suaves); después, más chicas y con menos
   desenfoque (en orbes grandes parecía bokeh).
4. Arcos que bajaban bajo el piso (una grieta en el piso). → El piso como límite para las brasas y el enjambre.
5. C, «estelas sueltas», se leía como lluvia y, de día, como rayones. → REEMPLAZADA por las corrientes sobre el logo.
6. B y C de pronto invisibles: el sombreador del enjambre no compilaba (una variable `t` repetida) y three lo saltea sin cortar nada.
   → Renombrado; el banco ahora junta los errores y avisos de la consola (ningún error en las hojas finales).
7. De día, la energía oscura con un punto claro al centro se leía como OJOS; sobre el logo, como rayones. → El destello claro sólo en
   las calientes.
8. El puntero juntaba las chispas en un GRUMO blanco que duraba todo el gesto (y tapaba la descarga); en B, un remolino saturado al
   cargar. → El puntero ordena (gira alrededor de su rayo, menos atracción, más rechazo de cerca), el brillo por densidad y, en el
   medio, una carga que crece más despacio.
9. La luz de la carga era un disco blanco sobre el logo y la luz del piso un foco grande. → La primera se borró; la otra, chica.
10. El clic tiraba tres rayos enormes. → 1 o 2 arcos cortos y la onda; la descarga al soltar es la grande.
11. El pie: el arco del golpe competía con la descarga del filo. → El golpe es una onda; hacia el encastre la energía cerca del
    logo baja un 85 %.
12. A 390 la descarga con el dedo no salía en el banco (sí en una prueba aislada: el punto elegido y un movimiento de mouse que el
    banco mandaba antes). → Arreglado el banco; descarga en las tres.
13. Direct3D avisaba que borraba mi `isnan()` (con matemática rápida no protege): → comparaciones.
14. El invariante encontró que en 25 s simulados no había NINGÚN arco del logo (la más cercana de tres casi nunca pasaba el largo
    mínimo). → Entre seis candidatas, la más corta que lo pase.

## Recomendación

1. **A · Chispas**: es el espíritu de PULIDO 15 (las cargas sueltas y sus arcos) llevado arriba, y el más legible como «partículas de
   energía que brillan, vibran y se mueven»: chispas suaves que titilan, destellan y tiemblan al calentarse, sin ninguna figura.
2. De noche es la más elegante; de día no ensucia (un indicio translúcido y destellos sólo donde hay energía) y los arcos se leen.
3. Los gestos se sienten sin dibujar nada: el puntero las enciende y las hace girar, el clic da un pulso corto, la descarga un rayo.
4. B (la nebulosa) es la menos formada pero brilla como purpurina y de día no muestra nada; C (el logo electrificado) es la más
   distinta pero cambia la marca y de día la raya: quedan para comparar en sus banderas.
5. Costo: A suma ~2 ms por cuadro a 1440 en la CPU (B y C, ~0,5); ningún cuadro de más de 20 ms en caliente en ninguna.

URLs: `/v3?plasma=a` (o `?energia=plasma`), `/v3?plasma=b`, `/v3?plasma=c`; con el polvo: `?energia=plasma-y-polvo&plasma=a|b|c`.

## Lo que no quedó bien

(se completa al final)
