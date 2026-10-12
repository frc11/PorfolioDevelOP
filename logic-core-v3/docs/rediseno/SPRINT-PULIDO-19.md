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
- PENDIENTE.

### Q1.a · Más densidad (+50 % de presencia), medido
- PENDIENTE.

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
- PENDIENTE.

### Final · la matriz de 12 anchos y verificar
- PENDIENTE.

## Disco y memoria por tanda

| Tanda | Disco libre | Memoria disponible (antes → después) | No paginado (antes → después) | Nota |
|---|---|---|---|---|
| Arranque | 79,6 GB | 2735 MB | 957 MB | sin banco del sitio (pide 3000 MB); el mini-banco sí |

## Invariantes que cambian de sentido (antes / ahora / por qué)

| Invariante | Antes | Ahora | Por qué |
|---|---|---|---|
| s52 · las pruebas sueltas | `plasma` vale `a` o `b` | `plasma` no es una prueba | B se borró (la decisión del humano); `?plasma=` se ignora |
| s68 · O3 (las direcciones) | `plasma=a|b` elige; B con su enjambre (≥ 10.000 motas); el escenario le pasa la dirección | sólo A; ni `b` ni `c`; sin la carpeta del enjambre; el escenario no elige | ídem (el cristal reemplaza a B) |
| s68 · O3 (el dibujo, el quieto, los módulos) | `CLARO_EN_REPOSO = { chispa: 0, mota: 0 }`; `cuadroQuieto(a, state.gl, …)`; 24 módulos con `enjambre/` | `{ chispa: 0 }`; `cuadroQuieto(a, …)`; 22 módulos | el estilo `mota` y el paso del enjambre eran de B |
| s69 · P1.0 | `?plasma=b` monta B; «queda B (su bandera)» y la simulación sin la superficie de C | `?plasma=` se ignora (el producto); ni B ni C; sin `enjambre/` | ídem |

## Crítica (lo que el banco mostró y qué se hizo)

(se completa con el banco)

## Lo que no quedó bien

(al final)
