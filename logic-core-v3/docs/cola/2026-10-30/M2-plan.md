# M2 · plan — el blog, la nota y la 404

Carril M2, `C:\nocturno\cola3c`, rama `m/2` (desde `3d89b628`, L7-INT), dev :3004. Sin `C:\nocturno\l7-assets\blog\` (sólo hay `facultad.png`): van placeholders neutros de foto.

## Ítems (qué, cuándo cuenta, cómo se verifica)
1. **Carrusel de destacadas** — el carrusel común (`CarruselDeTarjetas`, importado, no copiado) en su modo `asoma` (la tarjeta entera es un enlace y el dedo igual la arrastra; en el modo de a una, un `a[href]` no deja mantener ni deslizar). Reloj de 5,5 s (antes 10 s en el prototipo, 6,5 s en L7c). Foto con parallax doble: con el scroll (vertical) y con el carrusel (la foto se corre al revés de la tarjeta al cambiar). Tarjeta = enlace entero (foto + título). Mantener apretado no abre la nota (guarda de clic). Cuenta: avanza a ~5,5 s, pausa al mantener, flechas, deslice, reducido quieto; clic en la foto entra.
2. **Grilla de notas** — tarjeta del Panel viejo (`af4e53ca^:…/tu-panel/Tarjeta.tsx`): marco redondeado con la sombra física, la foto adentro con parallax y el título DEBAJO del marco (fecha · minutos como rótulo). Desde 1024: dos columnas escalonadas en una grilla de 12 (cada tarjeta ocupa dos filas, la impar arranca a mitad de la par) con anchos, columnas, corrimientos y proporciones distintos, y más aire. Abajo de 1024: una columna que alterna costados. Llegada: `Gatillo desde="abajo"` (el de siempre); el título se levanta al cruzar la línea (`TitularQueSeLevanta`). Cuenta: foto arriba / título abajo, sin giro, dispersión visible a 1440.
3. **La nota** — subtítulos que se levantan (h3) y frase destacada que se pinta (una por nota, frase LITERAL de su texto: no se escribe nada nuevo); «N min de lectura» sin tachado; el hilo visible: probar (a) la barra de arriba más gruesa y (b) un hilo vertical al costado de la columna con una aguja en la línea de lectura y marcas en cada subtítulo. Elegir uno y anotar por qué.
4. **404** — el encastre del error del formulario (`EncajeDelLogo` `no-encaja`, sus tiempos y su sonido) en la tarjeta oscura del resultado, sobre la escena; arranca recién con la entrada abierta (preloader ido), la pestaña visible y la tarjeta a la vista; clic = otra vez.
5. **Notas** — textos intactos; `portada` tipográfica → `foto` (una línea por nota) y `destacado`.

## Implicancias
- `PortadaDeNota.tsx` (tipográfica) se borra. Las relacionadas de la nota usan la tarjeta nueva.
- Un invariante nuevo `test:m2-blog` (puro, sin navegador): reloj del carrusel, el destacado literal y único en cada nota, cada nota con su foto en `public/v3/blog`, la cuenta del hilo y del parallax, la espera de la 404; con controles positivos.
- No toco el contenedor ni la intro (M1). No toco `_componentes/**` (el carrusel común se usa tal cual).

## Gate
`npx tsc --noEmit` (0 nuevos), ESLint sobre lo tocado, `npm run test:m2-blog` + s3-tokens/s3-imagen/s8-chrome/s78-b12a, `npm run build` (las 6 notas estáticas), navegador :3004 a 1440/1024/768/390 (captura por página por ancho en `C:\nocturno\cola3-fotos\M2\`), `/v3/no-existe` 404 con el encastre.

## Premortem
«Falló porque»: (a) el modo `asoma` necesita alto propio y la tarjeta queda aplastada o el texto se corta → alto de la vista explícito por ancho, mirado en 4 anchos; (b) mantener apretado con el mouse abre la nota → guarda de clic; (c) el parallax tironea → una sola suscripción de scroll que lee todo y después escribe, con `IntersectionObserver`; (d) el hilo sigue sin verse → la aguja vive en la línea de lectura (donde está el ojo), no en el borde de la pantalla; (e) la 404 anima debajo del preloader (mi hipótesis de por qué «no se ejecuta») → espera la entrada; (f) la grilla escalonada se superpone en 1024 → proporciones por clase y verificación a 1024.
