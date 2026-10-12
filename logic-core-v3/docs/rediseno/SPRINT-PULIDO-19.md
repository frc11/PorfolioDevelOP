# SPRINT PULIDO 19 — Terminación de la escena

Rama `rediseno/home`. Invariante nuevo: `npm run test:s70-pulido-19` (`src/app/v3/_lib/__tests__/s70-pulido-19.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (la base), `~/.cache/b4-medicion/pulido-18/_scripts/` (el sitio) y `_mini/` (el
mini-banco), `~/.cache/b4-medicion/pulido-19/` (los de este sprint). Recibos: `docs/rediseno/entregas/pulido-19/`. Los modelos:
`docs/rediseno/PLASMA.md` (el plasma), `docs/rediseno/DIMENSION-ESPEJO.md` (el cristal).

El humano: «usá todo tu potencial» y «dejala terminada». Corrida larga, sin humano: pensar, investigar, construir, mirar, criticar
e iterar. Si cambia el modelo a mitad, se retoma desde el ESTADO de abajo (EN CURSO / HECHO por subpaso).

Decisiones del humano (no se discuten):
- Se queda el plasma A como default y `?energia=plasma-y-polvo` («para mostrarle a mi amigo»).
- Se BORRA el plasma B (`?plasma=b`) con su código: el cristal ya lo reemplaza.
- Está bien que el plasma se apague en la animación del pie: no se toca.
- Los efectos del espejo distintos del cristal (pliegue, caleidoscopio, ecos, espiral) quedan en sus banderas, sin default.

Lo pedido:
- Q1 · PLASMA: a) más densidad (el humano mide: plasma solo 50, plasma y polvo 100; quiere el plasma solo en 75: +50 % de presencia
  visual sin volverse nube; medir el costo y ajustar). b) En toda la escena: en los planos lejanos se ve igual que hay plasma en
  toda la escena; las partículas siguen en el MUNDO pero el dominio cubre lo visible en cualquier encuadre (sugerido: un dominio
  periódico relativo a la cámara con fundido al reaparecer, o un volumen que abarque la escena entera). c) Nada desaparece de la
  nada: toda aparición y desaparición tiene causa y animación (nace de una chispa del logo, de un arco o por fundido; muere
  absorbida, por fundido en el borde del dominio o con un último destello); invariante: ninguna cambia su opacidad o tamaño más
  que un umbral por cuadro fuera de esos eventos, con control positivo. d) La RED EN REPOSO: quieto ~3–4 s, las partículas se
  frenan y se enlazan con rayos finos (2–3 enlaces por partícula, por distancia) hasta una red quieta y viva; con UN scroll o
  movimiento, la red se desconecta en cascada en ~0,3 s con un chasquido de luz. Rayos en lote (un búfer). De día y de noche. No en
  el final del pie, ni sobre textos, ni con movimiento reducido.
- Q2 · EL PIE: caen también los objetos 3D del pie (los botones del recorrido, el mail y WhatsApp, las redes, la placa del form, el
  titular) y quedan incrustados en el piso como el logo: cuerpos rígidos que vuelcan hacia atrás sobre su canto, con gravedad,
  impacto creíble y rebote chico; escalonados con un orden con sentido (el logo primero y después el resto como una onda); cada
  uno en su hueco o al ras, con el piso reaccionando a cada impacto (un pulso chico; el GOLPE grande y su sonido, sólo del logo).
  La cámara: sin el giro en espiral ni el alejamiento; termina en un límite muy cercano, desde arriba, con el pie entero en
  pantalla. Todo queda usable acostado (links, mail, WhatsApp, redes y el form), el DOM alineado con su homografía, el foco y el
  autocompletado bien. Con scroll hacia arriba se levanta todo (el rebobinado). ≥ 1024; en mobile y tablet el pie sigue como está.
  Invariantes: ninguna pieza se interpenetra; en reposo final, todo en pantalla con margen; cada link y cada input recibe el clic.
- Q3 · EL CRISTAL: una capa de cristal facetado SIEMPRE presente, solidaria al domo del moiré, que refracta lo de atrás (el cielo,
  la fábrica de logos); espesor y normales por faceta con biseles suaves, Fresnel, reflejo tenue del entorno, brillos especulares
  en los cantos que se mueven con la cámara y la luz, dispersión casi nula (el prisma en su bandera), facetas que crecen y se
  reacomodan muy lento, sin parpadeo; antialias en las aristas, estabilidad temporal; acompaña el día, la noche y el amanecer; el
  túnel aprobado no se toca (si el cristal estorba, se atenúa); sutil donde hay textos, nunca baja el AA de un texto. Investigar
  técnicas de refracción realista en tiempo real y anotarlas en `DIMENSION-ESPEJO.md`. Un solo pase de color compartido; medir.
- Q4 · CALIDAD GENERAL: 1) la auditoría (el sitio entero de día y de noche a 1440, 1920 y 390; ~20 mejoras por impacto/costo);
  2) implementar las de mayor impacto, una por commit, con antes/después; 3) sin cambiar coreografías, tiempos, composición ni
  copy. Los tirones en frío (0,5–1,2 s al primer scroll; 1,15 s a 390 con plasma) son un objetivo: precompilar, montar progresivo,
  precalentar. La física del polvo que corre sin dibujarse: apagarla.
- PERFORMANCE: ningún cuadro > 20 ms con la página caliente a 1440 y 390 en la NVIDIA, en calma, con la red en reposo, durante la
  caída del pie y con el cristal; medido sin vsync el costo de cada cosa nueva.
- VERIFICACIÓN: por punto, lint + tsc + todas las suites que lean lo tocado + banco; al final la matriz de 12 anchos (reposo y
  entradas) y `verificar` completo: los 8 rojos de la base y ni uno más.
- REGLAS: git prohibidos, frozen, cero `any`, nunca `router.push` directo, nunca debilitar un test, invariantes nuevos en
  `s70-pulido-19` con control positivo, `lente.ts` fuera de los commits, módulos de menos de 300 líneas; commit y push por paso.
- REPORTE: tabla (commit, estado, visto) por Q1–Q4, las URLs, la auditoría (hecho / pendiente), ms/cuadro, los tirones en frío
  antes y después, y «Lo que no quedó bien».

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no (mini-banco / sitio).

### Arranque
- Árbol limpio sobre `02558c0f` (sólo `lente.ts` y los sin seguimiento de siempre). Disco: 79,6 GB libres. Memoria disponible:
  **2735 MB** (el banco del sitio pide 3000: se mira de nuevo en cada bisagra; el mini-banco corre igual). No paginado 957 MB.
  Sin dev server, sin servidor de medición, sin Chrome del banco.

### Q0 · Borrar el plasma B y apagar la física del polvo que no se dibuja
- HECHO · VISTO en el mini-banco (el plasma A dibuja igual sin B).
- B se borró con su código: `energia/enjambre/` (la simulación en la GPU y su paso), su estilo de partícula (`mota`), la lectura de
  las partículas desde la textura (`sombreadoresDeParticulas` ya no tiene parámetros), sus uniformes en el banco (`enjambre`,
  `simulacion`, `gpu`), la dirección `b` y `?plasma=` (`Pruebas.plasma`, `PRUEBAS_SUELTAS`): no hay qué elegir. `armar(compacto, …)`.
  `Afuera` sin `gl` ni `logo` (eran del enjambre). `direcciones.ts` queda con A sola (la estructura con nombre, por si vuelve a haber
  otra). Lo medido de B en PULIDO 17 queda en su recibo como historia (s68 lo sigue leyendo).
- La física del polvo (`polvo/Fisica.tsx`: la simulación en la GPU y el horneado del campo del logo) sólo se monta con el polvo
  (`conPolvo`): en el producto corría igual sin dibujar nada. `Aire` sigue siempre (el piso vivo y la fugaz leen la forma y la pose
  del logo de ahí).
- Invariantes: s52 (las pruebas sueltas), s68 (O3: las direcciones, los módulos, el estilo, el quieto) y s69 (P1.0, sin B ni C) con su
  antes/ahora/por qué en la tabla. tsc y lint limpios; la compuerta (50 suites) en verde salvo s8-montaje con sus 2 de la base.

### Q1.b + Q1.c · El dominio que cubre lo visible y el ciclo de vida sin pops
- HECHO · VISTO en el mini-banco (hojas `hoja-d5.png`: el encuadre del sitio de noche y de día, el cierre de lejos, el teléfono):
  cobertura pareja en las cuatro vistas, partículas nítidas, sin banda rala ni discos borrosos cerca de la cámara.
- EL DOMINIO DE LA VISTA (`energia/dominio.ts`, nuevo): la pirámide de la vista con un margen del 20 % afuera del cuadro, entre 0,4 y
  1,8 veces el foco (la distancia cámara → logo, entre 8 y 60 u), PERIÓDICO (la que sale por una cara reaparece por la opuesta) y
  relativo a la cámara en tamaño, no en posición: las brasas siguen en el MUNDO (al mover la cámara pasan de largo). La SIEMBRA, en el
  primer cuadro con cámara: parejas en el cuadro, en profundidad con densidad ∝ w^1,7 (pocas cerca y grandes; muchas lejos y chicas),
  lo que cae bajo el piso se sortea de nuevo. El REPARTO (`repartir`): cuenta por celda del cuadro (8 × 5) contra lo que le toca a cada
  una por el aire que mira (`hastaElPiso` por rayo: una celda que mira el piso de cerca pide menos); las que sobran en una celda llena
  (1,2×) se apagan, se mudan a la más vacía (< 0,45×; si ahí no hay lugar, a cualquier lado: nunca quedan apagadas esperando) y se
  encienden. De a 8 candidatas por cuadro. La GRILLA de las fuerzas (`energia/grilla.ts`, nuevo; salió de `brasas.ts`) es relativa a
  la caja del dominio (32 celdas por eje como mucho, de al menos el alcance): antes era fija alrededor del origen y una caja grande
  caía entera en las celdas del borde. El puntero entra a la nube a la profundidad del foco (o a la esfera del logo si la toca).
- EL CICLO DE VIDA: cada brasa tiene `vida` (el alfa del dominio: 1 adentro del cuadro, 0 en el margen de los lados y en las bandas de
  profundidad, 0,3 y 0,45 del foco; 0 al reaparecer o al nacer en su celda nueva) perseguida con tope `dt / 0,25 s`, y `densidad` (el
  brillo por las vecinas) perseguida con inercia (0,8 s; antes saltaba de golpe cada cuatro cuadros). Lo que se dibuja es el producto.
  `eventos` marca el único salto permitido (la reaparición). La cáscara de radio 13 queda como siembra antes del primer cuadro y como
  límite sin dominio (las pruebas). La fuente del logo, apenas (0,2 en 9 u): antes apagaba lo lejano del logo.
- Lo que el banco mostró y se corrigió en el camino: (1) la siembra en la esfera quedaba concentrada en el centro en las vistas
  lejanas → siembra en todo el dominio + reparto; (2) las muestras bajo el piso subidas al mínimo se apilaban en el horizonte y el
  reparto las mudaba en un ciclo sin fin → profundidad hasta el piso por rayo y celdas con peso por el aire que miran; (3) las mudadas
  sin lugar quedaban apagadas para siempre → a cualquier lugar; (4) `llena` 1,6 nunca se cumplía con un desnivel suave → 1,2; (5) la
  densidad ∝ w amontonaba cerca de la cámara (discos borrosos de día) → exponente 1,7 y el frente a 0,4 del foco.
- Invariante s70 (nuevo, `s70-pulido-19`; `npm run test:s70`): la siembra + 1 s de reparto cubre las 40 celdas del cuadro (≥ 35 % de lo
  que le toca a cada una; las de objetivo < 2 no cuentan) en el hero, el cierre, el teléfono y Números (control: la esfera de antes en
  el cierre deja celdas vacías); en 10 s de órbita (0 → 170°) y viaje a 40 u con 900 brasas: ~7.400 eventos, todos fuera del cuadro o
  ya apagadas, y fuera de ellos ningún salto de brillo mayor que el tope (0,076 contra 0,115; controles: un pop de la más encendida, una
  reaparición adentro del cuadro, la densidad sin inercia); quieta 6 s, no recicla (264 eventos < 540); módulos ≤ 300 líneas y las
  funciones de cada cuadro sin reservas (control: una reserva en el envoltorio). s68 y s69 ajustados (tabla de invariantes).
- SIN BASURA POR CUADRO (la crítica del banco: 61 KB por cuadro, de 16 en PULIDO 18). El perfil del heap señalaba a `pasoDeLasBrasas`
  pero en Node asignaba 1 KB; con el estado vivo de la página en Chrome, 51 KB; con una entrada sintética en el mismo Chrome, 1 KB.
  La causa: un número no entero que cruza una función que TurboFan no inlineó se encaja en un HeapNumber (16 bytes) a la ida y a la
  vuelta, y qué se inlinea cambia con cada reoptimización (los deopts por «insufficient type feedback» de los caminos fríos). Ahora
  nada de cada brasa cruza una llamada como número: `en.dt`, `d.piso`, el rotor en lote con la hora en un arreglo del módulo, y
  `coordenadasDe`, `alfaDe`, `celdaDe`, `alRayoDesde` por brasa (arreglo + índice). La agitación térmica: un xorshift por brasa
  (`b.ruido`), inline (eran tres `azar()` por brasa). Medido en el mini-banco (1440, calma, noche): de 61,5 a 6,4 KB por cuadro,
  de 116 a 20 recolecciones en 6 s, el cuadro de 2,06 a 1,38 ms; a 390, de 33,5 a 5,2 KB y de 1,23 a 0,90 ms. Verificado con el
  estado vivo de la página: `cuadro(a, f)` 1,7 KB, el dibujo 2,6 KB, el paso 0,2 KB.
- Bancos del sprint (scratchpad `p19/`): `basura.ts` (Node, por función), `basura-cdp.ts` (el mismo en el Chrome del mini-banco con
  los objetos vivos y `gc()` antes de cada ventana), `tier-cdp.ts` (el nivel de V8 de cada función: en V8 15, bit 16 = Maglev y
  32 = TurboFan), el registro de deopts de V8 (`--js-flags=--log-deopt --logfile=…` con `--no-sandbox`: el stdout del renderer no
  llega al del navegador).

### Q1.a · Más densidad (+50 % de presencia), medido
- HECHO · VISTO en el mini-banco. 800 brasas en escritorio y 400 en el teléfono (eran 600 y 300) y todas a la vista (antes la cáscara
  dejaba muchas fuera del cuadro y la fuente las apagaba lejos del logo). La presencia en el encuadre del sitio (el exceso medio de
  luminancia sobre el fondo, contra la hoja de PULIDO 18): de noche 2,82 → 5,30 en el centro (×1,9) y 2,43 → 4,54 en la periferia; de
  día 5,97 → 7,18 (+20 %) y 6,27 → 7,38. Se lee como «más plasma», no como nube (hojas `hoja-d5.png`).
- El costo (mini-banco, la NVIDIA, sin vsync, sin el reloj de la GPU): 1440 calma-noche 1,38 ms por cuadro (p95 1,6; máx. 6,4),
  390 calma-noche 0,90 (p95 1,1). Ningún cuadro de más de 20 ms. Las otras vistas, en «Medido».

### Q1.d · La red en reposo
- PENDIENTE.

### Q2 · El pie: todo cae y queda incrustado
- PENDIENTE.

### Q3 · El cristal: capa fija de fondo, pegada al moiré
- PENDIENTE.

### Q4.1 · La auditoría
- PENDIENTE.

### Q4.2 · Las mejoras (una por commit)
- PENDIENTE.

### Medido (sin vsync; 1440 y 390; la NVIDIA)
- Q1 · el mini-banco (recibo `entregas/pulido-19/mini-medido.json`; s70 lo lee, con sus controles positivos): la placa ANGLE D3D11 sobre la
  RTX 5050; sin el reloj de la GPU; 6 s medidos tras 4 s de física. Ningún cuadro de más de 20 ms; ningún error.

| Medición (ms por cuadro: media / p95 / máx.) | Q1 final | basura KB/cuadro (recolecciones en 6 s) | antes del arreglo de la basura |
|---|---|---|---|
| 1440 · calma · noche | 1,38 / 1,6 / 6,4 | 6,4 (20) | 2,06 ms · 61,5 KB (116) |
| 1440 · calma · día | 1,97 / 2,5 / 4,8 | 6,8 (16) | 2,01 · 61,6 (119) |
| 1440 · máximo · noche | 2,07 / 2,7 / 5,8 | 7,7 (16) | 2,17 · 63,1 (114) |
| 1440 · lejos (el cierre) · noche | 1,44 / 1,8 / 4,4 | 6,0 (19) | 1,61 · 61,3 (149) |
| 1440 · la escena sola | 0,14 / 0,3 / 3,4 | 1,3 (43) | — |
| 390 · calma · noche | 0,90 / 1,1 / 3,8 | 5,2 (25) | 1,23 · 33,5 (106) |
| 390 · máximo · noche | 0,93 / 1,2 / 3,8 | 5,9 (25) | 1,24 · 35,2 (109) |

- Referencia de PULIDO 18 (600 brasas en la cáscara): ~1,0 ms en calma a 1440 y ~16 KB por cuadro. Lo que suma Q1 son los 200
  brasas más y el dominio (el reparto y el envoltorio: ~0,1 ms); la basura quedó por debajo de PULIDO 18.
- El banco del sitio (`p-tanda.sh`) sigue sin poder correr (memoria disponible < 3000 MB en cada bisagra): VERIFICAR TRAS REINICIO.

### Final · la matriz de 12 anchos y verificar
- PENDIENTE.

## Disco y memoria por tanda

| Tanda | Disco libre | Memoria disponible (antes → después) | No paginado (antes → después) | Nota |
|---|---|---|---|---|
| Arranque | 79,6 GB | 2735 MB | 957 MB | sin banco del sitio (pide 3000 MB); el mini-banco sí |
| Q1 (mini-banco) | 78,5 GB | 2012 → 2516 MB | 957 → 984 MB | sin banco del sitio; mini-banco a 1440 y 390 (un Chrome por medición); cuadros crudos borrados al armar cada hoja |

## Invariantes que cambian de sentido (antes / ahora / por qué)

| Invariante | Antes | Ahora | Por qué |
|---|---|---|---|
| s52 · las pruebas sueltas | `plasma` vale `a` o `b` | `plasma` no es una prueba | B se borró (la decisión del humano); `?plasma=` se ignora |
| s68 · O3 (las direcciones) | `plasma=a|b` elige; B con su enjambre (≥ 10.000 motas); el escenario le pasa la dirección | sólo A; ni `b` ni `c`; sin la carpeta del enjambre; el escenario no elige | ídem (el cristal reemplaza a B) |
| s68 · O3 (el dibujo, el quieto, los módulos) | `CLARO_EN_REPOSO = { chispa: 0, mota: 0 }`; `cuadroQuieto(a, state.gl, …)`; 24 módulos con `enjambre/` | `{ chispa: 0 }`; `cuadroQuieto(a, …)`; 22 módulos | el estilo `mota` y el paso del enjambre eran de B |
| s69 · P1.0 | `?plasma=b` monta B; «queda B (su bandera)» y la simulación sin la superficie de C | `?plasma=` se ignora (el producto); ni B ni C; sin `enjambre/` | ídem |
| s68 · POR_CUADRO, MODULOS | la grilla y las fuerzas entre ellas en `brasas.ts`; sin `dominio.ts` ni `grilla.ts` | `grilla.ts` (entreEllas, ajustarLaGrilla, celdaDe) y `dominio.ts` en las listas; `ruido.ts` con el rotor en lote; `brasas.ts` con `alRayoDesde` | Q1.b sacó la grilla de `brasas.ts` (pasaba las 300 líneas) y el dominio es nuevo; lo de cada cuadro sin reservas se sigue exigiendo |
| s69 · CALIENTES, firmas | `brilloPorDensidad(brasas)`; `deAfuera(b, i, en, dt, azar)`, `delMovimiento(b, i, en, dt)` | `brilloPorDensidad(brasas, dt)` (la inercia); `en.dt` antes de llamar (sin `dt` por parámetro) | Q1.c (la densidad con inercia) y la basura por cuadro (los números no cruzan llamadas por brasa) |
| s70 · el piso del dominio | `poblar(d, b, piso, …)`, `repartir(d, b, piso, …)`, `objetivosDelReparto(d, piso, …)`, `armarElDominio(d, fov, aspecto, foco)` | el piso vive en el dominio: `armarElDominio(…, foco, piso)` y las demás sin `piso` | ídem (la basura por cuadro) |

## Crítica (lo que el banco mostró y qué se hizo)

- Q1 · la siembra en la esfera, el piso en el horizonte, las mudadas apagadas, `llena` inalcanzable y los discos borrosos de día: en
  Q1.b (cada uno con su arreglo).
- Q1 · 61 KB de basura por cuadro (de 16): en Q1.b («sin basura por cuadro»). El perfil del heap atribuía todo a `pasoDeLasBrasas`
  y Node no lo reproducía: el discriminador fue correr la misma medición dentro del Chrome del banco con los objetos vivos.
- Q1 · el reparto no mudaba nada con el encuadre que cambia (la cuenta por celda nunca superaba 1,6× con un desnivel suave): 1,2×.

## Lo que no quedó bien

(al final)
