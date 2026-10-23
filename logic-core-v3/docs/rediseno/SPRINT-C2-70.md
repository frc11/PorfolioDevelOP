# SPRINT C2-70 · Seis razones → las reseñas → el CTA (corrida acotada)

## Plan (alcance de esta corrida, en orden)
1. Tarjetas sólidas: opacas y visibles con su contenido, también las de atrás; la de adelante destacada. Control nuevo en s83.
2. Las 10 fotos: curl, recorte al avatar, webp con sharp; asignadas por nombre (cinco y cinco).
3. HABLANOS con `Reluciente`.
4. Banderas: `?resenas=gatillo` por defecto (`?resenas=scroll` se conserva); el arrastre por defecto, sin `?resenas-arrastre`, con el cartel «Mantené para arrastrar» que sigue al mouse.
5. (Si sobraba tiempo) la transición simultánea del volteo: NO entró.

Fuera de esta corrida (pendiente): la curva de entrada del carrusel, la salida con la cámara, todo lo del teléfono y la tablet (Seis razones progresivo, carrusel continuo deslizable con «Deslizá para ver más», «Ver trabajo» con flecha), la transición simultánea del volteo.

## Log
- (1) `placas.ts`: materiales sin transparencia; la niebla sólo tiñe (`NIEBLA_SOLIDA` 0,35), opacidad 1 y profundidad siempre; `EscenaDeLasResenas`: ninguna placa se esconde por la niebla. `tarjetas.ts`: opacidad de la tarjeta siempre 1 (`OPACIDAD_DE_LA_TARJETA`), se esconde sólo con `visibility`; el texto va en la cara que mira a la cámara (de espaldas, en la nuca con la derecha invertida), salvo si la nuca cae sobre la caja del logo (`cajaDelLogo`; el DOM no puede quedar detrás del logo) o en el fondo del aro (donde cambia de reseña); `zIndex` por profundidad. La de adelante: escala 1,08 de placa y tarjeta (`destaqueDeLaPlaca`) y `data-al-frente` (sombra flotante, aro de tinta en la foto). s83 §14 con sus controles; `aro-legibilidad` pide opacidad 1 en todas las visibles.
- (2) Diez webp de 192 px (30 KB las diez) en `public/v3/resenas/<clave>.webp`. Las reseñas pasan de 12 a 10 (salen «huellas» y «aroma») para que cada persona tenga una sola foto. Las siluetas se borran. s83 §9: retrato propio por reseña.
- (3) `CtaDelFinal`: el enlace (que la escena lleva sobre HABLANOS) con `Reluciente` como caja. s59 lee la clase nueva.
- (4) `tramo.ts`: gatillo por defecto; `arrastreDeLaBandera` borrada; `CapaDelAro` sin prop, arrastre siempre, el cartel (pastilla en tinta, sale con escala y opacidad desde el puntero). s83 con sus controles.

## Qué mirar
- `/v3` a 1440: el aro con todas las placas opacas, las de los costados con su texto, alguna de atrás con su texto en la nuca (nunca encima del logo), la de adelante más grande con sombra y aro en la foto.
- El mouse sobre el aro: el cartel «Mantené para arrastrar» siguiendo al puntero; arrastrar gira el aro (sin bandera).
- `/v3?resenas=scroll`: la entrada atada al scroll, como antes.
- HABLANOS: un reflejo cada 3,5 s y, con el mouse, en el acto.

## Sesión 2 (2026-10-23, orquestador, directo en la integración)
- **La curva de entrada (sin escalón).** La causa: con el gatillo la entrada era lineal en el tiempo (las placas viajaban a velocidad fija), se clavaban al armarse y el giro arrancaba de 0 (subía a la de lectura en 0,35 s). Ahora `curvaDeLaEntrada` (aro.ts, un Hermite): arranca al doble de la media, frena parejo y llega con la pendiente del giro de lectura (`finDeLaEntrada`, con las medidas del cuadro y `DURACION_DE_LA_ENTRADA_S`); `pasoDelGiro` sin armar queda en la velocidad de lectura (sin girar), así al armarse sigue. La escena aplica la curva a la entrada (también con `?resenas=scroll`).
- **A la vez (ítem 16, en parte).** `GATILLO`: el volteo 0 → 0,35, los valores 0 → 0,35 (con el volteo, ya no después) y el aro desde 0,1 (entra mientras voltea), 2,52 s con su curva.
- s83 §15 (nueva, con dos controles): la velocidad de la placa por cuadro a 60 fps, tabulada (22,77 · 18,87 · 15,05 · 11,30 · 7,64 · 4,06 · 0,56 → 0,489 el giro), ningún cuadro cambia más del 3 % de la máxima, y la pendiente final igual a la del giro (0,4887 contra 0,4887); a mitad del volteo, los valores yéndose y el aro entrando. Controles: la entrada de antes (lineal, el giro desde 0) y el gatillo de antes.
- Medido (dev :3002): aro-legibilidad 1440 ok (control 4,23:1 en rojo), interacción ok (cartel, 10 placas, el clic a #portfolio-el-garage), aro-costo ok, humo 7/7; s83 104/0, s59 15/0, tsc 0, eslint limpio.
- **Queda de la 70:** las dos mitades del título que se juntan en el medio mientras voltea (los títulos de volumen de la escena); la secuencia de cuadros del volteo en el sitio (la simultaneidad se afirmó en s83, no se grabó en pantalla); la salida con la cámara; todo el teléfono (Seis razones progresivo, carrusel continuo con «Deslizá para ver más», «Ver trabajo»).
