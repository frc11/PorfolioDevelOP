# Próxima etapa — lo pendiente

Base cerrada en `base-terminada` (rama `rediseno/home`). Una línea por ítem.

- Navbar: la pastilla del menú del home nuevo, pendiente de rediseño y de sus destinos definitivos.
- Navbar · el rollover de dos copias (INTERFAZ 1) en los links del menú y del pie: se hace en el sprint del navbar de v3 (`chrome/Navegacion.tsx` y `chrome/PiePiezas.tsx`, compartidos: una prop `rotulo?` y el home pasa `DosCopias`; ver `ESTADO-INTERFAZ.md` §4).
- Contacto: definir la página o el destino de `#contacto` (hoy «Hablanos» y la columna Contacto del pie apuntan ahí y no existe).
- Newsletter: no tiene backend; la propuesta es una lista de Brevo (el formulario en Tu panel está deshabilitado).
- Preloader: no levanta en Safari real.
- Testimonios reales: van en «Por qué develOP», sin cifras inventadas.
- Redes del pie: reemplazar las URLs provisorias de Instagram, LinkedIn, TikTok y Facebook (`_secciones/cierre/contacto.ts`, con TODO).
- Tu panel: capturas reales del panel en lugar de los recuadros de muestra.
- Saltos de teclado: con la escena a la vista, el primer cuadro del salto puede mostrar el canvas anterior (compositor contra hilo principal).
- Alejamiento D: «Hablanos» cruza el anillo del logo durante el alejamiento.
- Desborde: los 4 px de desborde a 1440.
- Partículas sobre el texto: en el CTA final a 1440 una partícula de la escena se pinta encima de «El tuyo también.».
- Suites que necesitan build: `s7-compuerta`, `s8-intro`, `s8-tres` y dos afirmaciones de `s8-chrome`.
- Pasada técnica · el corrimiento de 0,067 al cargar por el cambio de la fuente de respaldo a la Chivo (`layout.tsx`, compartido): medirlo con un build de producción; si sigue, `display: 'optional'` o un respaldo con métricas ajustadas (INTERFAZ 1).
