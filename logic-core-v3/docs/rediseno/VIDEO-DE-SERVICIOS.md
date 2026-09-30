# El video de Servicios — cómo codificarlo

> [ESCENA 10] T2. Hoy la sección muestra un video de MUESTRA (`public/recursos/servicios/placeholder.mp4`), el mismo en
> los tres servicios. Esto dice cómo se codificó y cómo codificar el de verdad cuando llegue, para que no le vuelva a
> costar cuadros a la página.

## Por qué importa

En ESCENA 9 (T4) Servicios perdía ~80 cuadros por pasada con cualquier placa (74–80 con la NVIDIA, a 1440, con dpr 1 y
1,5): cada cuadro nuevo del video en medio del scroll. Con el video escondido, 0. Dos arreglos, los dos de ESCENA 10:

1. **El video se pausa mientras el scroll se mueve** y vuelve a andar desde el mismo cuadro cuando el scroll lleva
   180 ms quieto (`_secciones/servicios/VideoDeServicio.tsx`, `QUIETO_PARA_VOLVER_MS`). Vale para cualquier video: no
   depende del archivo.
2. **25 cuadros por segundo.** El monitor de la placa de medición va a 75 Hz: 25 lo divide (cada cuadro del video dura
   tres refrescos, parejo); 30 no (se alternan dos y tres refrescos: el video tironea aunque la página no pierda nada).

## La receta

El medio es 16:9 (`aspect-video`, recortado con `object-cover`) y, medido con `scripts-escena10/t2-tamano.ts`, se ve
de 912 × 513 px a 1440, de 1232 × 693 a 1920 y como mucho de 1275 × 717 (el tope del contenedor, a 2560). La menor
resolución que se ve igual a 1440 es la de ~960 px de ancho: con la muestra, SSIM 0,991 contra la original a ese tamaño;
768 px ya ablanda la letra chica (0,989). Si el video de verdad no tiene letra chica, se puede probar 768.

```sh
# El video de verdad, 16:9, sin audio: 960 × 540, 25 cuadros por segundo, H.264 High, un cuadro clave cada 2 s.
ffmpeg -i original.mov -an -vf "fps=25,scale=960:540:flags=lanczos" \
  -c:v libx264 -preset slow -crf 25 -profile:v high -pix_fmt yuv420p -g 50 -movflags +faststart \
  public/recursos/servicios/<nombre>.mp4

# El póster: el primer cuadro, en WebP.
ffmpeg -i public/recursos/servicios/<nombre>.mp4 -frames:v 1 -vf scale=960:-2 -q:v 80 public/recursos/servicios/<nombre>-poster.webp
```

- **`-crf 25`**: con la muestra da el mismo peso que el archivo de antes (887 KB por 10 s) y SSIM ≥ 0,99; si el de
  verdad pesa mucho más de ~90 KB por segundo, subir a 26 o 27 y volver a medir.
- **Sin audio** (`-an`): el video va mudo (`muted`), y una pista de audio igual se descarga.
- **`+faststart`**: el índice va al principio; el video arranca sin bajar el archivo entero.
- La muestra era 16:10 (1152 × 720) y quedó en 960 × 600 para no deformarla; el de verdad, si es 16:9, en 960 × 540.

## Cómo medirlo

1. El tamaño en pantalla: `BANCO_GPU=alta npx tsx scripts-escena10/t2-tamano.ts`.
2. La calidad contra el original al tamaño de 1440 (912 px de ancho, recortado a 16:9 como lo recorta la página):

   ```sh
   ffmpeg -i nuevo.mp4 -i original.mp4 -lavfi "[0:v]scale=912:-2:flags=bicubic,crop=912:513[a];[1:v]fps=25,scale=912:-2:flags=bicubic,crop=912:513[b];[a][b]ssim" -f null -
   ```

3. Los cuadros perdidos por pasada: `BANCO_GPU=alta npx tsx scripts-escena10/t2-servicios.ts <rótulo> 1` (y con dpr
   1,5), contra el servidor de desarrollo.

Después, cambiar `VIDEO_DE_MUESTRA` en `_secciones/servicios/contenido.ts` (o un video por servicio).
