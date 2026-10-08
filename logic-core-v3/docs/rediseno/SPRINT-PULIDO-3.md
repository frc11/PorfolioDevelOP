# SPRINT PULIDO 3A — la energía bajo el piso + el contacto a 768

Rama `rediseno/home`, worktree `C:\rediseno-home\logic-core-v3`, ruta `/v3`. Plan arriba, log abajo, breves. Un commit y
push por punto. Invariante nuevo: `npm run test:s54-pulido-3` (con control positivo). Sin `verificar` completo (va al final
del 3B). Entregables: `docs/rediseno/entregas/pulido-3/`.

Aprobados (no se tocan): el encastre detrás del pie, los viajes del menú, el velo sin rectángulo, la sombra con fundido y
«CONTACTO» a AA. Se BORRA `?velo=escena` (quedó el velo del DOM) y `?chispas=si` como bandera suelta (las chispas pasan a
`?energia=inestable`).

## 1 · El plan

**A1 · La energía bajo el piso, en toda la escena** (`escena/final/luzDeAbajo.ts`, `enElPiso.ts`, `planoDeLaLuz.ts`,
`chispasDeLaLuz.ts`, `cuadroDelFinal.ts`; la simulación del piso en `piso/`):

- La mancha negra: encontrar la causa y sacarla.
- La energía deja de ser un sector de zonas (nacer, vivir, morir): un CAMPO de ruido con domain warping que fluye en el
  tiempo, calculado una vez por bloque en la simulación del piso (el canal libre de su textura) y leído por el dibujo, el
  vértice (las rendijas) y el plano de abajo. ~70–85 % de las juntas con algo de luz, intensidad variable, nunca se apaga.
- Arranca con el golpe: se expande desde el hueco en ~1,5 s (función de `fin`: al rebobinar se retira con la curva de P2,
  sin cortes); la sala se oscurece con la expansión; cada onda del logo pasa como un frente que sube la energía y abre las
  juntas.
- `?energia=red`: además, corrientes por las juntas (trazos que doblan en ángulo recto y se bifurcan) y un anillo por
  las juntas con cada onda. `?energia=inestable`: además, temblor donde está más alta, picos que levantan un racimo, las
  chispas (absorbe `?chispas=si`) y un rim light desde abajo en el canto del logo.
- Costo: ms/cuadro una vez a 1440 y a 390 en la NVIDIA.

**A2 · El contacto del pie a 768** (`_secciones/cierre/`, `_estilos/vidrio.css`): vidrio como a 390 (averiguar por qué a
768 cae opaca), en columna (Nombre, Mail, Mensaje más alto, Enviar abajo) llenando el hueco hasta las redes; AA en rótulos
e inputs; 390 y escritorio sin cambios.

## 2 · Log

### A1 · La energía bajo el piso, en toda la escena

**La mancha negra.** La súper onda del golpe dibuja valles de hasta ~1,4 u (su tope crece 1 u mientras dura), más hondos que el
pie de los bloques (0,6 u) y que el plano de la luz (0,58 u): sobre esas tapas el plano quedaba arriba y se veía de frente,
oscuro en su borde (la luz cae a cero sin descartarse) y blanco en el medio: la forma ondulada de `p4-mancha`. Ahora, con
energía, las tapas tienen un piso blando (`fondoDeLaLuz`: igual arriba de −0,45 u, nunca bajo −0,53 u), por encima del plano.

**La energía.** Ya no hay zonas: un campo de ruido con domain warping que fluye (`campoDeLaLuz`), calculado una vez por bloque en
la simulación del piso (va al canal libre de su textura) y leído por el vértice (las rendijas), el dibujo (costados y cantos)
y el plano. Cobertura medida con la misma cuenta: 79 % de media en lo que se ve a 1440 y a 390 (mínimo 64 % y 50 %); en la
escena, con el banco, 79–94 % de los bloques entre 10 y 30 u del logo. La expansión es función de `fin` (sale del hueco en el
golpe y llega a 36 u en 1,5 s; al rebobinar se retira con la curva de P2) y la sala se oscurece con ella. Ondas: durante el
final el logo no larga los anillos del pulso (NOCTURNO FINAL B3), así que larga los suyos sólo en la energía (uno cada 3,2 s
a 12 u/s), más el golpe. `red`: corrientes por las juntas (distancia L1 desde fuentes, sólo por los tramos que conducen) y el
anillo de cada onda. `inestable`: temblor, picos que levantan un racimo, las chispas (sólo donde la energía es alta) y un rim
light en el canto del logo. Borradas: `?velo=escena` (con sus dos archivos y su regla) y `?chispas=si`.

**Costo** (una vez, RTX 5050, `p4-costo` de PULIDO 2, la energía prendida contra apagada en el mismo cuadro): dentro del
ruido. Piso 0,56–0,82 ms contra 0,68–0,82 a 1440 (total 1,6–2,1 contra 1,9–2,5 ms) y 0,18–0,31 contra 0,18–0,34 a 390.

**Gate:** lint limpio en lo tocado; `tsc` 0 errores; `s53` 81/0 y `s54` 19/0. Además, porque leen lo tocado: s3-tokens, s38,
s40, s44, s47–s52 verdes. El invariante nuevo encontró un error mío (el signo del piso blando: los valles se iban para arriba);
las capturas son las de después del arreglo.

**Las aserciones viejas que cambiaron** (por pedido: de un sector a toda la escena):
- s53 §3, «`?velo=escena`: el logo se oscurece en una elipse» → «`?velo=escena` ya no existe». Se borró la bandera.
- s53 §4, tapas, separación y plano: las mismas condiciones, con los nombres nuevos (`vEnergiaDelBloque`, `junta`,
  `energiaEnElPiso`); el plano ya no tiene resplandor de sector.
- s53 §4, «el sector nace en un punto y se propaga» y «respira (el radio late)» → borradas. No hay zonas; lo nuevo va en s54.
- s53 §4 y s51, las chispas: «`?chispas=si`, ≤ 64» → «`?energia=inestable`, ≤ 160 puntos que sólo se prenden donde la
  energía pasa de 0,85». La cantidad que se ve la pone la energía.
- s52-pulido-1 P1, «cada zona nace, vive y se retira; nunca más de dos» → borrada (el pedido la invierte); «orgánica: la
  distancia deformada por un ruido» → «un campo torcido (domain warping)»; «por bloque: el sector en su centro» → «la
  energía de su celda»; «quieto: una zona prendida» → «quieto: el campo clavado con más del 60 % prendido».
- s52-pulido-1 P1 / s52-nocturno-final B2, el oscurecimiento: «con `oscuroDelFinal` y lo prendido» → «con `expansionDeLaLuz`».
  Sigue igual de parejo y gradual. P5 mide el salto por cuadro con la misma función.
- s51 1F, s52-nocturno-final B2/B3, s50, s49, s38: las mismas condiciones (la energía espera al poder, la calma con el mismo
  anillo, la luz se suma), leídas donde viven ahora (la simulación, `luz * junta`, los argumentos nuevos).

`s54-pulido-3` A1: la mancha (control: las tapas que bajan; el piso blando sin aplicar), la cobertura (control: un campo que se
apaga), que fluye (control: quieto), sin ciclos (control: las zonas), la expansión (controles: de golpe; por el reloj), las
ondas (control: sin ondas), la sala (control: de golpe) y las variantes (controles: corrientes rectas; el canto del logo en el
producto).

### A2 · El contacto del pie a 768

**Por qué caía opaca.** No era el respaldo sin `backdrop-filter` ni otro corte de ancho: a 390 y a 768 el material es el mismo
(medido en el banco: tinte del papel al 66 %, `blur(12px) saturate(1.8)`, campos al 72 %). A 390 la caja pisa el logo negro,
que se transparenta; a 768 detrás sólo queda el piso claro y parejo, que a través de ese tinte se lee como una tarjeta.

**Ahora** (sólo en la franja de 768 a 1023: `tablet:max-escritorio:` en las clases, y una media query en `vidrio.css`): el
vidrio claro lleva un tinte del 46 % y campos al 56 % (`--vidrio-tinte-de-la-tablet`, `--campo-del-vidrio-en-la-tablet`,
registrados). El oscuro, sobre la noche, queda como estaba. El formulario va en columna: Nombre, Mail, Mensaje con el alto que
sobra y Enviar abajo. La primera fila del pie toma lo que sobra, así la caja llega hasta las redes. El logo del encastre se
acomoda solo en el hueco que queda a la izquierda.

**AA** (sonda de P18, `p6-contacto`): de día, rótulos 16,8–17,3:1, «CONTACTO» 16,2, escrito 17,4, ejemplo 7,4, error 11,1.
Con el oscuro forzado (el peor caso de PULIDO 2): «CONTACTO» 4,83:1 (antes 4,98: la caja es más alta), rótulos 5,2–6,2.
Con el tinte liviano también en el oscuro, los rótulos caían a ~3:1: de ahí que la regla sea sólo para el claro.

**Gate:** lint limpio en lo tocado; `tsc` 0 errores; `s53` 81/0 y `s54` 24/0. Además, porque leen lo tocado: s3-tokens, s7,
s8-cierre, s27, s37, s39, s41–s45 y s47 verdes. `s8-chrome` da 2 rojos que piden el build de producción («0 chunks»): no
dependen de este cambio.

**Las aserciones viejas que cambiaron:** `s3-tokens`, «los breakpoints entran por las variantes»: `vidrio.css` se suma a las
hojas con media escrita, con motivo. El tinte pisa una regla de atributos (0-2-0) que una clase no alcanza. Sus literales los
ata `s54` A2 a `--breakpoint-tablet` y `--breakpoint-escritorio` (control: una franja corrida a 1025).

`s54-pulido-3` A2: el vidrio y la columna sólo en la tablet (controles: el tinte liviano también en el oscuro; la columna
también en escritorio) y la franja atada al tema.


# SPRINT PULIDO 3B — la energía final, el CTA «cruce», la cámara del pie con el mouse

Aprobado: A2 (no se toca). Orden: B0, B1, B2, B3; un commit y push por punto; al final, un `verificar` completo con el
Chrome del banco cerrado (los mismos 8 rojos) y `s8-chrome`.

- **B0 · La energía, una versión final** (`escena/final/luzDeAbajo.ts`, `enElPiso.ts`, `planoDeLaLuz.ts`, `rimDeLaLuz.ts`,
  `cuadroDelFinal.ts`): las tres variantes en una; más movimiento y brillo; corrientes por las juntas sin patrón; pistones sin
  vibración; el logo que brilla (fuera del oscurecimiento, su filo y un pulso por onda); el frente visible desde el golpe;
  cobertura ≥ 65 %. Se borran `red`, `inestable`, el temblor y las chispas; queda `?energia=intensa`.
- **B1 · El CTA: gana «cruce»** (`escena/ctaDelFinal/`, `_componentes/ctaDelFinal/`, `por-que-develop/`): producto sin
  bandera; todo en Archivo y en 3D; la metamorfosis de las seis razones en la primera frase; ~2,5–3× más recorrido; alturas,
  viajes, teléfono y movimiento reducido.
- **B2 · El pie: el mouse orbita la cámara** (`escena/final/`): ±15–20° y ±6°, sin el domo, amortiguado, atenuado en la
  cinemática; sólo con puntero fino.
- **B3 · El salto de cámara Panel → Inicio** (20 min como máximo).

## Log del 3B

### B0 · La energía, versión final

**Una sola versión.** Lo de `red` y de `inestable` que se pidió quedó en el producto y el resto se borró: los defines y su
código, el temblor, las chispas (archivo incluido) y las dos banderas. Queda `?energia=intensa` (brillo ×1,4, reloj ×1,6).

**Más movimiento y más brillo.** El campo corre ~3 veces más rápido (deriva 1,6 u/s, la torsión 0,3/s, escala 0,17) y una capa
fina por encima (un ruido chico que corre a ~1,6 u/s) cambia todo el tiempo. Medido con la cuenta del sombreador: entre dos
cuadros la correlación es 1,000; a medio segundo, 0,82 (con el ritmo del 3A, 0,97). La luz: plano 2,2 (antes 1,6), costados
1,5 (1,15) y cantos 0,75 (0,32).

**Las corrientes.** Corren por las juntas. Hay 3 por línea de la grilla, cada una en su propio ciclo, y el reloj de cada una
se tuerce con un ruido lento, así que los ciclos no duran siempre lo mismo. En cada ciclo nace en un punto al azar de la línea,
va hacia un lado al azar (4–13 bloques/s), mide entre 1,5 y 6 bloques y se apaga. Algunos ciclos descansa. No hay fuentes fijas
ni anillos. Lo que se ve en una junta, corrido de 2 a 8 s, no pasa de 0,4 de correlación; una corriente que se repite cada 2 s
da 1,0.

**Los pistones.** Racimos de 3 bloques (corridos por fila) que suben y bajan una vez por ciclo, de 1,4 a 4 s. En cada ciclo se
mueve el 32 % de los racimos, entre 0,25 y 0,75 u. Al subir suman energía, así que se abren sus rendijas y escapa más luz.

**El logo brilla.** El oscurecimiento sigue siendo sólo del piso, y la luz del logo se suma después. Su filo se enciende en
blanco con la energía. Desde arriba el bisel casi no se ve (no apareció en ninguna captura del 3A), así que el filo también se
dibuja en el piso: un hilo de luz justo afuera de la forma, con la máscara del hueco. Cada onda (una cada ~3,2 s, corrida al
azar en su intervalo, y el golpe) nace con un pulso de 0,32 s: el filo se enciende más y el logo entero, apenas. Los anillos
del pulso siguen apagados en el final (NOCTURNO FINAL B3).

**Lo anotado en el 3A.** El frente se ve desde el golpe: los cantos de las tapas (se ven desde arriba aunque la rendija sea
honda) y el frente de la expansión brillan más; en la secuencia, el anillo de luz se lee en el primer cuadro. La cobertura,
con la capa fina: media 87 %, nunca menos del 76 % a 1440 ni del 68 % a 390 (900 s medidos con la cuenta del sombreador).

**Costo** (una vez, RTX 5050, `p4-costo` de PULIDO 2, la energía prendida contra apagada): a 1440, el piso pasa de 0,75–0,83 a
1,18–1,22 ms (total 2,0–2,2 contra 2,4–2,5 ms); a 390, de 0,17–0,19 a 0,31–0,39 ms.

**Entregable:** `b0-energia-1440.png` y `b0-energia-390.png`, dos secuencias de 6 cuadros cada una: desde el golpe y en pleno.
A 390 los cuadros salen cada 0,25 s. A 1440, cada ~0,36 s: capturar la página entera tarda más que 0,25 s.

**Gate:** lint limpio en lo tocado; `tsc` 0 errores; `s53` 80/0 y `s54` 34/0. Además, porque leen lo tocado: s38, s40, s44,
s47–s52 verdes.

**Las aserciones viejas que cambiaron:**
- s54 A1, la cobertura: «media de 70 a 85 %, nunca menos del 40 %» pasa a «media de 75 a 95 %, nunca menos del 65 %» (más
  fuerte, por pedido). «Fluye» lee el campo dentro de `fondoDeLaEnergia`. El piso blando suma el pistón a la altura.
- s54 A1, las variantes `red`/`inestable` → borrada; lo nuevo es B0.
- s53 §4, las chispas «sólo con `?energia=inestable`» → «se borraron» (y s51, «salvo las chispas» → «ningún `Points`»).
- s53 §4 / s52-pulido-1 P1 / s50: la luz que se suma es `luz * junta * uBrilloDeLaLuz`, y la junta lleva las corrientes y
  el reloj de la luz. Las mismas condiciones. El alto de la luz en la simulación se lee en su `return`.
- s51 1F: el control «una luz que entra al mar calmo» sacaba el primer `( 1.0 - calma )`, que ahora es el del pistón: saca
  el del `return`. Sin eso, el control quedaba ciego.
- s52-pulido-1, banderas: `energia=red|inestable` → `energia=intensa`.
- s38 y s49: vuelven a la forma de antes del 3A (`conElFinalEnLaSimulacion(...)` y `conElFinalEnElPiso(material)` sin la
  variante).
- **De A2 (3A), que no vi en su gate:** s52-nocturno-final C4, «el formulario angosto: nombre y mail lado a lado», estaba
  rojo desde A2 (el gate de A2 no corrió ese archivo). Ahora dice que en el teléfono siguen lado a lado y en la tablet van en
  columna, con las clases de A2. La columna en la tablet la fija s54 A2.

`s54-pulido-3` B0: una versión (control: `red` de vuelta), viva (control: el ritmo del 3A), corrientes sin patrón (control:
una que se repite cada 2 s), pistones (control: el temblor), el logo (controles: el filo oscurecido con la sala; sin pulso),
el frente (control: los valores del 3A).
