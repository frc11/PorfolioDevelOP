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
