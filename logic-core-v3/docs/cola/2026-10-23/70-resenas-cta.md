# 70 · Seis razones → las reseñas → el CTA

Modelo: **opus**. Cambia altos y toca la escena: cola de alturas. Usa `Reluciente` de la 20.

A Valentino el aro de reseñas le encantó ("ese trabajo está hecho espectacular, falta solidificar"). Son ajustes.

## 1. La transición de Seis razones al aro (ítem 16, capturas `lote2/02`, `07`, `08`, `09`)
- **Mientras el título «Seis razones para elegirnos» se voltea**, sus dos mitades **se juntan en el medio**, y el cartel «Lo que dicen nuestros clientes» **queda centrado**.
- **Al mismo tiempo que voltea, se desvanecen las razones** (hoy primero voltea y después se desvanecen: tiene que ser simultáneo).
- **También mientras voltea, aparece el carrusel** de reseñas.
- **Gatillo en la entrada y en la salida** de las reseñas: **`?resenas=gatillo` es el valor por defecto**. **`?resenas=scroll` se conserva** como alternativa (Valentino lo quiere por las dudas).

## 2. El aro
- **El arrastre funciona, por defecto** (se borra la bandera `?resenas-arrastre`). Al pasar el mouse por el aro, **sale un cartel desde el mouse**, que lo sigue: **«Mantené para arrastrar»**.
- **Las tarjetas son sólidas:** hoy se transparentan (las de atrás se ven a través, y algunas salen vacías). **Siempre opacas y siempre visibles**, también las de atrás, con su contenido.
- **La de adelante se destaca:** cuando una tarjeta llega al frente, se nota cuál es y de quién es (más nítida, un poco más grande, su nombre y su foto bien visibles).
- **La entrada del carrusel:** hoy entra a una velocidad y frena de golpe para seguir más lento. La desaceleración tiene que estar contemplada: una curva continua hasta la velocidad de crucero, sin cortes.
- **La salida:** cuando se guarda el carrusel, hoy queda muy abajo de cuadro. **La cámara acompaña un poco el guardado** (lo enfoca mientras baja) y **recién después pasa al CTA**, tranquila. Con el gatillo, todo orquestado.
- **Las fotos de las reseñas:** se reemplazan las siluetas (`public/v3/resenas/retrato-a..d.svg`) por **10 retratos generados** (personas que no existen). Bajalos con `curl` de estas URLs a `public/v3/resenas/`, recortalos al cuadro del avatar y pasalos a `webp` optimizado. **Mirá cada imagen y asignala a la reseña que corresponda** por el nombre (género y edad aproximada). Valentino no tiene que descargar nada.

| # | Persona | URL |
|---|---|---|
| 0 | hombre, fines de 40 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_015615_82bd7e84-5e61-4dc7-a455-3d550c221f06.png |
| 1 | mujer, fines de 30 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_015702_c8fa5704-8c72-441f-a839-7992a66b77f8.png |
| 2 | hombre, mitad de 50 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_015733_c62f041a-c251-4ace-8c3f-4a09198a0d05.png |
| 3 | mujer, fines de 20 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_015804_12007fe9-b521-41c2-9fb9-dc6f4010191a.png |
| 4 | hombre, principios de 30 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_015833_3c697b32-7bfa-41e5-9d81-27894bc5df8d.png |
| 5 | mujer, principios de 60 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_015902_926d2b12-befb-4434-a55b-c1b287768fa5.png |
| 6 | hombre, principios de 40 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_015515_a08c15d4-adb7-4e32-8506-7fb5f113b403.png |
| 7 | mujer, mitad de 40 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_015933_660ab029-2c6a-4616-9059-713c6537b951.png |
| 8 | hombre, mitad de 60 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_020003_5a94acb9-4415-4351-98b2-21ec13e8e09f.png |
| 9 | mujer, principios de 30 | https://d8j0ntlcm91z4.cloudfront.net/user_3DgYcrQs9B13TPOpaQSUQTfsX9C/hf_20261023_020035_99337b4d-afd1-4bf6-8a5c-400b614f1a0d.png |

  Si los nombres de las 10 reseñas no cuadran con 5 y 5, cambiá **el nombre** de la reseña (no la foto), con nombres argentinos comunes. Las reseñas siguen siendo ficticias **sin la llave** (decisión de Valentino; D8 las reemplaza antes de producción).

## 3. El CTA (ítem 17, captura `lote2/10`)
- **«HABLANOS» con `Reluciente`**, para que se entienda que se puede tocar.

## 4. Teléfono y tablet (capturas `lote3/12`, `13`, `14`)
- **Seis razones:** hoy la letra **cambia de golpe** de un estado a otro. Que el cambio sea **una animación o progresivo**.
- **El carrusel de reseñas:** **sin flechas, continuo** (se mueve solo, despacio), se puede **deslizar con el dedo**, con un aviso **«Deslizá para ver más»** (creá el aviso, con el estilo de `AvisoDeScroll`). Las tarjetas sólidas, con su foto.
- **«Ver trabajo»**, un botón mejor (el estilo de botón del sitio, con flecha). Lleva al proyecto en el Portfolio si la reseña tiene uno; si no tiene, no se muestra.

## Criterios
- `aro-legibilidad` y `aro-costo` en verde; un control nuevo que falle si alguna tarjeta tiene opacidad < 1.
- Una secuencia de cuadros de la transición (el volteo, la unión al centro, las razones desvaneciéndose y el carrusel apareciendo, todo a la vez).
- La curva de velocidad del carrusel en la entrada, sin escalón (graficá o tabulá la velocidad por cuadro).
- El cartel «Mantené para arrastrar» siguiendo al mouse; el arrastre girando el aro.
- Las 10 fotos en su lugar (foto del aro a 1440 y del carrusel a 390).
- Teléfono: la letra de Seis razones sin salto; el carrusel continuo y deslizable.
