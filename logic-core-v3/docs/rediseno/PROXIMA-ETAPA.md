# Próxima etapa — lo pendiente

Base cerrada en `base-terminada` (rama `rediseno/home`). Una línea por ítem.

- Pie · el rollover de dos copias (INTERFAZ 1) en los links del pie: el de la barra se hizo en NAVBAR V3 y su retoque lo cambió por un hover tranquilo; el pie es compartido (`chrome/PiePiezas.tsx`: una prop `rotulo?` y el home pasa `DosCopias`; ver `ESTADO-INTERFAZ.md` §4).
- Navbar · mirar el vidrio del menú en un iPhone real (Safari): el WebKit de Playwright en Windows no pinta `backdrop-filter`, y ahí el texto del Genie se ve cortado entre tiras al pasar por el cuello (`navbar/t3-menu/mirar.txt`, `navbar/retoque/1-transparencia/mirar.txt`).
- Navbar · el contacto en un iPhone SE con las barras de Safari (375 × ~548) no entra: faltan 103 px. Lo que habría que sacar: la bajada con el mail y WhatsApp (~60 px), la pregunta 2 como renglón aparte (~26 px) y unos 20 px más (la empresa o un título más chico). Decidido en el retoque: queda como está (`navbar/t4-contacto/mirar.txt`).
- Hallazgo · `s8-montaje` en rojo por cuatro archivos de la escena que pasan las 300 líneas sin declarar (`s32-escena7.invariant.ts`, `s34-calidad1.invariant.ts`, `piso/bloques.ts`, `polvo/Fisica.tsx`): anterior al retoque del navbar, no se tocó.
- Contacto: definir la página o el destino de `#contacto` (hoy «Hablanos» y la columna Contacto del pie apuntan ahí y no existe).
- Newsletter: no tiene backend; la propuesta es una lista de Brevo (el formulario en Tu panel está deshabilitado).
- Preloader: no levanta en Safari real.
- Testimonios reales: van en «Por qué develOP», sin cifras inventadas.
- Redes del pie: reemplazar las URLs provisorias de Instagram, LinkedIn, TikTok y Facebook (`_secciones/cierre/contacto.ts`, con TODO).
- Tu panel: capturas reales del panel en lugar de los recuadros de muestra.
- Tu panel · sprint propio (idea del cierre de INTERFAZ 2): que la sección simule el producto con los componentes REALES del panel del cliente (código real, no una maqueta), con datos de ejemplo, para mostrar lo que el texto promete. Hoy hay una tarjeta con la barra de actividad sola (`_componentes/vida/PanelEnVivo.tsx`).
- Saltos de teclado: con la escena a la vista, el primer cuadro del salto puede mostrar el canvas anterior (compositor contra hilo principal).
- Alejamiento D: «Hablanos» cruza el anillo del logo durante el alejamiento.
- Desborde: los 4 px de desborde a 1440.
- Partículas sobre el texto: en el CTA final a 1440 una partícula de la escena se pinta encima de «El tuyo también.».
- Suites que necesitan build: `s7-compuerta`, `s8-intro`, `s8-tres` y dos afirmaciones de `s8-chrome`.
- Pasada técnica · el corrimiento de 0,067 al cargar por el cambio de la fuente de respaldo a la Chivo (`layout.tsx`, compartido): medirlo con un build de producción; si sigue, `display: 'optional'` o un respaldo con métricas ajustadas (INTERFAZ 1).
