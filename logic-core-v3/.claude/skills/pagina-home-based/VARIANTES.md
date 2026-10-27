# VARIANTES: cómo se piensa y se construye la variante de escena de una página

La variante es el cambio mínimo que hace que la escena sea "de esa página" sin dejar de ser la del home.

## Cómo se piensa

1. **Una idea, no tres.** Un solo gesto que se entiende en un segundo. Si hay que explicarlo, sobra.
2. **Nace de lo que ya existe.** Primero se transforma una pieza del home: el piso, el logo, el domo, la red o el plasma. Lo nuevo, si hace falta, usa los materiales y la luz del home.
3. **Cuenta el servicio sin decirlo:**
   - **web:** superficie, pulido, presencia;
   - **software:** estructura, lo que hay adentro del producto;
   - **IA:** algo que trabaja solo.

   Nada literal: ni íconos ni pantallas de mentira.
4. **Ideas de partida de Valentino:**
   - **web:** el piso brilloso;
   - **software:** el logo con grietas y luz que sale de adentro (no confundir con las grietas del cristal del home, por celda, que son del muro y no de una variante: `CONTRATO.md`);
   - **IA:** un laboratorio liviano.

   Se cranean con él antes de construir.
5. **El acento es luz:** brillos, filos, juntas y haces. Nunca pinta superficies.
6. **Atada al scroll de la intro.** Arranca casi quieta y se completa con el avance (de 0 a 1). Al subir, vuelve.
7. **Calma.** Nada gira sin razón, nada parpadea y nada compite con el título 3D. La cámara la pone el home: la variante no la mueve.
8. **Compatible con el velo y con el viaje.** En el avance 0 tiene que verse bien, porque ahí se aplica el velo (la composición inicial) y ahí llega el viaje del CTA del home, que espera a que la variante esté dibujada antes de navegar.
9. **Vuelve a su reposo en el cierre (B13).** Cuando la señal `resolucion` llega a 1, lo que movió vuelve a su reposo y su luz a la composición (el piso liso y calmo): el pie va debajo. Una variante que no la lee sigue andando, pero se ve encendida debajo del pie. La firma, en `docs/rediseno/B12a-API.md` §4 y §8.

## Cómo se construye

- **Dónde va:** en `src/app/v3/_servicios/escena/<servicio>.tsx`, enchufada a la ranura (ver `CONTRATO.md`). Nunca toca `src/app/v3/_lib/**`. Si necesita algo del motor, se pide como P-H.
- **Costo:**
  - entra en el presupuesto por cuadro que fija B12, y se mide con el bench antes y después;
  - por debajo de 1024, una versión compacta o nada;
  - con movimiento reducido, el estado final quieto.
- **Al desmontarse,** libera geometrías, materiales y texturas (`dispose`). La máquina pierde memoria de GPU fácil.
- **Calibración:** como mucho tres versiones detrás de una bandera, a una URL por versión. Valentino elige y la bandera se va.
- **En el FRENO va:**
  - el costo medido;
  - capturas en avance 0, 0,5 y 1;
  - la URL de cada versión.
