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
