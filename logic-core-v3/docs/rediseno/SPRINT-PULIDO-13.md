# SPRINT PULIDO 13 — el feedback del humano sobre PULIDO 11 y 12

Rama `rediseno/home`. Invariante nuevo: `npm run test:s64-pulido-13` (`src/app/v3/_lib/__tests__/s64-pulido-13.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (y los nuevos de este sprint). Recibos: `docs/rediseno/entregas/pulido-13/`.

Aprobados (no se tocan): Portfolio, los viajes del menú, el pie simétrico (C1), la órbita del mouse, la cabecera mobile, el CTA
abajo de 1024, Quiénes somos en mobile, la caída del logo por defecto (salvo K4·a), el modal en mobile, la tarjeta al rotar.
Se borran con su código: `?volteo=columpio`, `?carga=trazo`, `?caida=angulo`. `lente.ts` (sólo fin de línea) fuera de los commits.

Imágenes del humano (en `imagenes que me dijo claude.ai que te agregue/`, por hora): `Captura … 154118` = eje-palito (rojo: el eje
de hoy, el borde izquierdo del palito; verde: el centro del palito); `154312` = loader-filo; `154527` = loader-capas; `160444` =
autocompletado; `161803` = controles-320; `bf1b3930`, `b5188bff`, `c8b1a8e9`, `7f764334`, `0b953955` = hilos-ref-1..5 (cintas de luz
con chispas; núcleo con halo; hebras que se enroscan; estelas; un haz de fibras); `160944`, la búsqueda de referencia.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### 0 · Lo que se borra (columpio, trazo, ángulo)
- HECHO (commit del bloque K2/K3/K4b: comparten archivos). `volteo.ts` sin variantes (el centrado); `Carga.tsx` sin el trazo (con
  movimiento reducido, el logo quieto); `caidaAlHueco.ts`/`recorridoDelFinal.ts` sin el parámetro de la variante; `entorno.ts`
  sin `caida` en las pruebas. Los invariantes que las nombraban (s49–s53, s60–s62), adaptados a una sola variante.

### K1 · Quiénes somos: el cuerpo nunca atraviesa el logo
- PENDIENTE.

### K2 · El modal de Contacto (apertura, loader, éxito, error)
- **a · la apertura** — HECHO · VISTO sí (banco). La causa, medida cuadro a cuadro (`pulido-13/_scripts/k2-modal.ts`): la placa quedaba
  300 ms a la vista como un punto de 19 px (el retardo del viaje) y después saltaba de 19 a 98 px en 4 cuadros: Motion interpolaba
  `z` en recta entre 16 cuadros clave y el tamaño aparente (d / (d − z)) casi no crecía dentro de un tramo y después se disparaba.
  Ahora se anima la fracción en recta y `z` sale de la escala en cada cuadro (`escalaDelViaje`, `zDeLaEscala`); el escenario se ve
  recién cuando arranca. Medido: ~16 px por cuadro, decreciendo, sin ceros ni saltos (recibo `k2-apertura.json`).
- **b · la carga** — HECHO · VISTO sí. El eje: la geometría del palito (532 a 658 u en `LOGO_PATH_D`, centro 595) ya estaba bien;
  lo corrido era que giraba sobre la cara de adelante con las capas detrás (el cuerpo daba vueltas de costado). Ahora: sin
  perspectiva (de frente, la cara de atrás queda exactamente detrás: sin el contorno corrido de `loader-filo`), el eje en el medio
  del espesor, capas a ≤ 0,7 px (6/21/34 según el tamaño) y, como exactamente de canto cada capa es una línea sin ancho (las rayas
  de `loader-capas`), nueve SECCIONES de adentro (planos perpendiculares con el perfil del logo en su x): de canto, una banda sólida.
- **c · el éxito** — HECHO · VISTO sí. Sin la onda que se abría, la elipse y el borde que se encendía. La pieza cae APAGADA (el pozo
  encima al 50 %), encaja y se ENCIENDE hasta el claro, y se asienta al 10 %: todo adentro de su forma.
- **d · e · la primera vez** — HECHO en el panel · VISTO sí (banco en frío: `en-frio.sh` borra la caché de sombreadores del perfil).
  La causa (traza): el GPU compila los sombreadores del raster del encastre (`Program::MainLinkLoadEvent::wait`, 87–127 ms cada
  uno). El panel precalienta las dos tarjetas (`PrecalentarElResultado`: casi transparentes, del tamaño de la de verdad) con la placa
  quieta (llegada y con el paralaje entrado). Medido en frío: error 67/40/213/107 ms → ninguno; éxito 67 → ninguno; lo que cuesta
  precalentar (~120 ms) cae a los 2,5 s de abrir, con la placa quieta (`k2-frio.json`). En el pie NO: ver «Lo que no quedó bien».

### K3 · Sonidos de éxito y error
- HECHO · oído no (el banco no tiene audio: lo escucha el humano en `/v3?sonidos=1`). `exito`: dos notas claras que suben una quinta
  (Si 5 → Fa♯ 6, a 95 ms), campana chica propia con un poco de sala. `error`: dos notas graves que bajan una tercera menor (Re 4 → Si 3),
  con un pasabajos a 1,4 kHz. Volumen 0,3 los dos: −24,1 y −24,7 LUFS efectivos contra el pulso (−16,8) y el golpe (−13,4)
  (`k3-sonoridad.json`). Suenan en el contacto de la pieza (el mismo instante del encaje y del choque), con el parlante prendido.

### K4 · El pie (la cámara de la caída, el form)
- **a · la cámara de la caída** — HECHO · VISTO sí (banco: `pulido-13/_scripts/k4-caida.ts`, en vivo y con el reloj clavado).
  `subida` ya no es un reloj propio: es el ÁNGULO del logo. La cámara sube en elevación desde la de la pose E (e0 = 7,1°: la
  cámara del recorrido en (0, 5, 40)) y la subida es la que deja su elevación en el ángulo `a` del logo (la normal de la cara es
  (0, sen a, cos a)): hasta que el logo se inclina a la altura de la cámara no se mueve nada (tampoco su blanco); desde ahí, de
  frente; tocado el hueco, arriba (los rebotes no la sacuden). Además, mientras el logo se inclina hasta esa altura, la cámara
  viva deja el paralaje del mouse del recorrido (torcía ~5° con el mouse a un costado) y la órbita del mouse del final se apaga en
  la cinemática (era 0,2: hasta 4,4°); vuelve entera en el quieto, como antes. Al rebobinar, el giro del quieto y la órbita se
  van antes de que el logo se levante (`quedaDelQuieto`, `orbitaDelFinal`): la cámara se deshace con el mismo vínculo. La salida
  del fondo frena con secantes en vez de puntos sueltos (la subida nueva es empinada y angosta al final de la caída).
  Medido con el mouse a un costado: en reposo 9,8° (la pose del recorrido, quieta); desde los 7,5° de vuelco hasta el golpe,
  0,0°; al tocar, 0,8° (la cámara para en 89,2°); al rebobinar, a lo sumo 3,2° (era 19,3°). Recibo `k4-caida.json`.
- **b · el formulario** — HECHO · VISTO sí (banco). El éxito, el de K2 c (es el mismo componente). El mail sin «nombre@dominio». El
  autocompletado: la causa era `foco.css` (la regla del foco de los campos, sin capa, le ganaba a la demora del autocompletado, que
  es una utilidad en su capa): el celeste y el texto del navegador entraban en media duración rápida y, con la placa del pie todavía
  sin armar al volver, los campos quedaban a la vista sueltos. Ahora la demora va en `foco.css` con más especificidad (medido: fondo
  transparente). Y al irse del pie, los campos que siguen autocompletados se vacían y se vuelven a montar (lo escrito a mano se
  queda): al volver, vacíos y sin el estado (`k4-autocompletado.json`, `pulido-13/_scripts/k4-autocompletado.ts`).

### K5 · Mobile: los controles fijos no tapan contenido
- PENDIENTE.

### K6 · Los hilos con volumen (`?hilos=si`)
- PENDIENTE.

### Final · la matriz y verificar
- PENDIENTE.

## Memoria (antes de cada tanda: disponible y no paginado)

| Cuándo | Disponible | No paginado | Nota |
|---|---|---|---|
| Al empezar (con el servidor de desarrollo del humano andando) | 4201 MB | 856 MB | |
| Lote 1 (K2/K4b), con el servidor de desarrollo del humano parado (3,9 GB) para el build del banco | 6713 MB | 841 MB | se vuelve a levantar al final |
| Lotes en frío (K2 d e), Chrome relanzado en cada uno | 6676–6716 MB | 842–844 MB | |

## VERIFICAR TRAS REINICIO

(vacío por ahora)

## Lo que no quedó bien

- **K2 d e en el pie**: el precalentado (adentro de su placa o suelto en la raíz) dejaba la tarjeta limpia pero el primer hover de
  Enviar pasaba a trabar ~430 ms (A/B medido en frío, con 3 y 8 s de tipeo: lo sigue al hover, no al tiempo). Sin precalentar, en
  frío la tarjeta del pie tiene 40–133 ms la primera vez (una vez por navegador: la caché de sombreadores persiste). Queda sin
  precalentar; la causa del hover no la encontré (la traza la esconde).
