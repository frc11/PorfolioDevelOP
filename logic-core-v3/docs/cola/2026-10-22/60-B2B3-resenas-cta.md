# B2 + B3 · El aro de reseñas y el CTA del home

Tarea de la cola del 2026-10-22. Es autocontenida: todo lo decidido por Valentino está acá.

## Lo que decidió Valentino (copiado de CIERRE-HOME-V3)

- [c] B2 + B3 · **Las reseñas en aro 3D y el CTA** (craneado el 2026-10-21; una sola secuencia):
  - **Seis razones → reseñas:** el título se transforma en «Lo que dicen nuestros clientes», con la misma letra de Seis razones y el efecto que hoy usa al convertirse en el CTA. Los 6 ítems se desvanecen en el aire (efecto a criterio de CC, sin partículas porque es de día).
  - **La entrada del aro, atada al scroll:** un tramo entra por la izquierda adelante y otro por la derecha al fondo, y las cadenas se unen alrededor del logo. Al scrollear para atrás, va en reversa.
  - **El aro:**
    - es un carrusel real centrado en el logo, cada tarjeta mirando hacia afuera, a la altura del piso;
    - gira continuo y muy lento (velocidad de lectura), sin depender del scroll;
    - se leen las 3 de adelante; las de atrás pierden primero el texto y después se meten en la niebla de la sala;
    - unas 10 tarjetas físicas: en la parte de atrás, donde no se ve, cada una cambia a la reseña siguiente.
  - **La interacción:**
    - **hover:** el aro frena, la tarjeta se levanta un poco, suena el hover de la navbar y aparece "Ver trabajo →" (estilo de la de Demos);
    - **clic** en cualquiera de las 3 visibles: el sonido de clic y va a su proyecto en el Portfolio (deep link de B1);
    - **arrastrar con el mouse:** gira el aro con inercia, con bandera.
  - **La tarjeta:** una placa 3D como la del contacto, más chica y redondeada, clara con tinta (de día). Lleva la cita, el nombre y el negocio, y la foto de una persona.
  - **Las reseñas:** ficticias pero con aspecto final, decisión de Valentino. Van sin la llave visible ni invisible. Las fotos son de personas generadas (que no existen). Se reemplazan antes de D8 (está anotado en D).
  - **Reseñas → CTA:** el título se da vuelta y se vuelve el CTA, y AL MISMO TIEMPO se abre en el piso un anillo bajo el aro y las reseñas bajan por ahí. Después sube la cámara, como antes. Al subir, todo vuelve.
  - **Variantes para comparar:** `?resenas=scroll` (todo atado al scroll) y `?resenas=gatillo` (gatillo de Seis razones a reseñas y de reseñas al CTA).
  - **En el teléfono:** el aro más cerrado, con 1 tarjeta legible de frente. Si no se lee, el carrusel plano de B1.2e. Con movimiento reducido, las 3 quietas con flechas.
  - **El largo:** ~4 pantallas de scroll (~0,5 el título, ~0,5 los ítems, ~1 la entrada, ~1,5 para leer y ~0,5 el CTA), con la REGLA DE ALTURAS.

## Entregas
Son dos, y cada una se puede integrar por separado:
1. **B2:** Seis razones → reseñas (la transformación del título, la disolución de los ítems, la entrada del aro, el giro, la interacción y las dos variantes de la entrada);
2. **B3:** reseñas → CTA (el título que se da vuelta, el hueco anular y la bajada, la cámara y las dos variantes).

## Las fotos de las reseñas
Si existe `public/v3/resenas/` con retratos, usalos: los deja Valentino. Si no, usá un retrato neutro e ilustrado (una silueta, no una foto de stock de una persona real) como placeholder, con la ruta en los datos para reemplazarla, y anotalo.

## B9 (las grietas)
El momento en que el título se vuelve el CTA es donde se agrieta el cristal en el home. Si B9 ya está integrado, enganchá su disparador ahí. Si no, dejá el punto de enganche marcado y anotalo.

## Archivos (a confirmar)
- Seis razones, el CTA y su transformación de título (`_secciones/**`); el aro 3D en la escena (`_lib/escena/**`): las placas como la del contacto, más chicas.
- Las reseñas y fotos ficticias: decisión de Valentino, SIN llave. Las fotos, de personas generadas (no fotos de stock de personas reales). Nombres y negocios ficticios.
- **REGLA DE ALTURAS:** esta tarea cambia el alto de un tramo del home. Compensá con `TRAMO_ESTIRADO` (una k por ancho, `secciones.ts` sin tocar) y medí la deriva antes y después. El orquestador integra estas tareas de a una y vuelve a medir después de cada merge.

## Criterios
- El aro: legibles las 3 de adelante (AA en el texto de las placas); las de atrás pierden el texto antes que la forma; el cambio de reseña nunca se ve.
- El hover frena, levanta la placa y suena; el clic suena y va al deep link del Portfolio; el arrastre gira con inercia (con bandera).
- El hueco anular en el piso, bajo el aro, a la par del título que se vuelve CTA.
- `?resenas=scroll|gatillo` con las dos variantes completas.
- El costo por cuadro del aro (banco), y el teléfono con 1 legible o el carrusel plano.

## Reglas para el subagente
- Leé la skill `pagina-home-based` y el código existente antes de crear. Importá las piezas del home, no las copies.
- **El turno pesado:** `tsc`, ESLint de muchos archivos y las suites de tests se corren dentro del turno: tomarlo con `mkdir C:\nocturno\2026-10-22\.turno` (si falla, esperá 20 s y reintentá), con un `dueno.txt` adentro, y borrarlo al terminar. Antes, ≥ 3 GB libres.
- Tu worktree está en `C:\nocturno\2026-10-22\<id>`, con `node_modules` enlazado al del principal. No corras `npm install`.
- Trabajá solo en tu worktree y tu rama. Commiteá por nombre. No levantes dev ni Chrome: la verificación en el navegador la hace el orquestador.
- Gate antes de entregar: lint de lo tocado, `tsc --noEmit` sin errores nuevos y tus pruebas (con su control positivo).
- Si tenés que tocar un archivo fuera de los declarados, anotalo en el reporte con el porqué.
- Reporte final: qué hiciste, los archivos, las banderas y qué tiene que verificar el orquestador en el navegador (URL, ancho, acción y qué debería verse).
