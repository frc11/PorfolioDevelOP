# L7a · resultado — las tres páginas de servicio

Carril A, rama `l7/a`, dev :3002. Commits `72ac5e3b..` (ver `git log b9e91797..l7/a`).

## Por ítem

1. **Traer el V1 — hecho.** `git checkout paginas/servicios -- [servicio]/ _servicios/ public/servicios/ docs/servicios/ scripts-servicios/` (94 archivos, commit `72ac5e3b`, sin adaptar) y la línea `web` del registro a mano. Adaptado a la base actual: la página es `IntroDeLaPagina` → cuerpo en papel (en `CompuertaDelHome`) → `CierreDeLaPagina` con su FAQ. Salieron, porque hoy los pone el home: `Encabezado` (la navbar es del layout), `<Contacto />` en la ruta (`ChromeDelHome`), `RaizDeLaPagina` + `salidaDeLaPagina` (`EnlaceDeRuta` pide la salida de la variante), `bloques/Cierre` y `bloques/Faq` (el cierre común) y el `Llamado` del final (el CTA del cierre común). El `FAQPage` del JSON-LD de servicios salió (lo publica `FaqDelPie`: uno solo por página). Las tres rutas responden 200; `/v3/no-existe-servicio` da 404.
2. **Una página, tres colores — hecho.** Las tres usan la variante `web` (`VARIANTE_DE_LAS_PAGINAS`), que tiñe la luz con el `acento` que la ranura lee del token del preset: celeste, violeta, verde; ningún hex, ninguna variante nueva. La variante arranca encendida en el avance 0 (T0: `ARRANQUE`, el acento entero y el piso a media luz) y se resuelve con `resolucion` en el cierre (B13: vuelve a la composición). Noche en las tres. Foto: `C:\nocturno\cola3-fotos\L7\servicios-intros-1440.png` (las tres intros lado a lado).
3. **Contenido expandido — hecho.** Por servicio: Qué hacemos (con el detalle de 05-TEXTOS), Para qué te sirve (ejemplos para un negocio chico), Qué incluye (+ va aparte), Precio (el «desde» de `PRECIOS_DESDE`), el CTA del precio, Mantenimiento (web), Trabajos con el video (web) o **Lo que podemos construir** (software e IA), Cómo trabajamos (cada paso con qué pasa en él y el plazo), Qué recibís al final, Después de la entrega; y 6 preguntas por página en el FAQ del cierre. Hechos sólo del SPEC del V1, 05-TEXTOS y el home; cada respuesta del FAQ lleva su fuente en un comentario (`datos.invariant` lo exige). El bot de WhatsApp no se ofrece (el SPEC dice que está en desarrollo).
4. **Renombre «Integraciones con IA» — hecho.** Página, `h1`, `<title>`, metadata, JSON-LD, desplegable de la navbar, `SERVICIOS` de `acento.ts`, el «Ver la página de…» del recomendador (`SERVICIO_EN_LA_FRASE`) y la lista de títulos 3D (`TITULOS_CON_LETRAS` y `TEXTOS_DE_PAGINA` del generador; las letras ya estaban: no hubo que regenerar). La sección del home conserva «Integraciones con / *inteligencia artificial*». El slug sigue `ia-y-automatizaciones`. El pie todavía no lista las páginas (L7d).
5. **El viaje y los enlaces — hecho.** `DESTINO_DEL_SERVICIO` = `HREF_DEL_SERVICIO` y `PRESET_DEL_DESTINO` = `PRESETS_DE_LAS_PAGINAS` (el MISMO objeto que declara cada página, de un módulo sin JSX). `viaje.ts` (ahora con `SERVICIO=`) verde en los tres a 1440 y 390: cubre la escena, 0 cuadros en blanco, el logo en su hueco; control `CONTROL=velo` en rojo. El desplegable abre cada página a 1440 y 1024 (`l7a-paginas.ts DESPLEGABLE=1`).
6. **Defaults de Servicios — hecho.** `?aro-color` → `tercios`, `?titulo-cursiva` → `3` (`banderas.ts`); s81-servicios a la spec. `NanobotsQuietos` (la rama sin coreografía) también toma el color del aro de la bandera. `?titulo-servicio`/`?fuente-servicio` ya no existían (L3). Foto: `C:\nocturno\cola3-fotos\L7\home-servicios-1440.png`.
7. **Nanobots, primer slide — no hecho, a propósito.** `C:\nocturno\l7-assets\` no existe: no llegó la captura.

**Verificación** (`scripts-carga/l7a-paginas.ts`, Chrome del sistema contra el dev :3002): las tres páginas a 1440, 1024, 768 y 390 — 18 de 18: consola limpia, un `h1` con el nombre, desborde 0 px, orden intro → cuerpo → cierre bajando y al revés subiendo, el FAQ abre. Fotos en `C:\nocturno\cola3-fotos\L7\<página>\<ancho>-{1-intro,2-cuerpo,3-cierre}.png`. Humo del home (`humo-l6.ts`) a 1440 y 390: BIEN.

**Tests:** `tsc` 0 errores; lint limpio en lo tocado (un aviso viejo en `viaje.ts`). Invariantes del V1 (no están en `package.json`, se corren a mano): datos 56/0, escena 64/0, seo 53/0, precios 22/0, slots 44/0, medios 26/0, diagonales 47/0, historias 37/0, pagina 244/0. Del home: s78-b12a 162/0, s78-b12b 36/0, s78-c2-51 67/0, s81-servicios 80/0, s78-b10 55/0, s78-b13 42/0, s90-l8b 27/0. s6-servicios 25/1: «ningún literal con unidad» en `escenario/TituloQueSePintaAlLlegar.tsx` (el `rootMargin`), archivo que L7a no tocó: de la base.

**`npm run verificar`** (con el dev parado): 95 pasos, 11 grupos con falla: s2, s3, s4, s5, s7, s8 y s17 (la base de siempre), s10 (`s10-mobile`, la misma de la base que anotó INT) y s6, s76 y s77, que vienen de L9a/L9b y no de L7a: s6-tokens y s6-servicios señalan `_secciones/cierre/Cierre.tsx` (`pt-[7rem]`) y `servicios/escenario/TituloQueSePintaAlLlegar.tsx` (el `rootMargin`), los dos de `df5e5369` (L9a); s76 (la huella del modal de contacto) y s77 (la huella de Tu panel) comparan marcado que no importa nada de lo que tocó L7a (grep: ni `acento.ts`, ni el recomendador, ni `contenido.ts`). s1 pasa. Ninguna de las suites que L7a cambió falla.

**Revisión independiente** (Sonnet, sólo el diff): 7 hallazgos.
- 1 (media) la description de Desarrollo web prometía el panel para todas las webs: arreglada (el panel queda dicho sólo para Mediana y Premium; el párrafo de 05-TEXTOS queda literal porque es texto de Valentino).
- 2 (media) frases sin fuente: arregladas en web (la propuesta, el avance, la tienda, el dominio) y en software (por partes, los tiempos, las planillas). Descartada la de IA («te avisa quién está listo para comprar»): es el texto del SPEC (`queHacemos.texto` del V1).
- 3 (baja) la línea de disparo aflojada de más en `pagina.invariant`: clavada en 6, como s42.
- 4 (baja) restos: `RotuloDeServicio` conserva la rama del nombre corto (componente viejo de la sección, fuera de scope, no se monta); `TITULOS_CON_LETRAS` conserva «IA y automatizaciones» (lo usa s78-b12a); `enDesarrollo` queda para los tests. Sin cambios.
- 5 (baja) dos columnas a 768: ahora desde 1024 (la tablet como el teléfono).
- 6 (baja) faltaban el resultado y la marca: este archivo.
- 7 (baja) «Ver el portfolio» con `EnlaceDeRuta` hacia `/v3#portfolio-el-garage`: probado en el navegador (`scripts-carga/l7a-enlace-al-portfolio.ts`): llega al home con el ancla del caso en el cuadro.

**visual-qa:** no verificado por ese subagente (no tuvo herramientas de preview en este entorno). La verificación visual la hizo el banco con Chrome y las fotos de arriba, que miré.

**Tests cambiados por la spec (no aflojados), con su control:** s78-b12a (la intro de 1,8 pantallas), s81-servicios (los defaults nuevos; el CTA a su página), s78-b12b (cada servicio viaja a SU página con SU preset; control: el destino viejo), s78-c2-51 (el renombre), `angosto-invariante` (sin nombre corto), y del V1: escena (T0, resolución nueva §11, presets compartidos, salida por `EnlaceDeRuta` §10), seo (un solo `FAQPage`), datos (6 preguntas, fuente `// L7a:` nombrada, descripción propia), pagina (renderiza lo que arma la página —intro y cuerpo—; el cierre lo prueban s78-b13/b10; bloques nuevos; sin encabezado).

## Decisiones tomadas solo
- **L7a-1** La intro de ~1 pantalla es de la base: `PANTALLAS_DE_LA_INTRO` 2,5 → 1,8 y `TRAMO_DEL_TITULO` 1,6 → 1,4 (el tramo tiene que pasar de 1,2 o el título cae sin scroll). Vale para todas las páginas; anotado en `ESTADO-a.md` para el carril B.
- **L7a-2** La página de web se llama «Desarrollo web» (h1, title, desplegable), el nombre del servicio en el home y en `SERVICIOS`; el V1 decía «Páginas web». Slug igual.
- **L7a-3** La variante compartida conserva el id `web` (no es una variante nueva: es la de web, teñida por el preset).
- **L7a-4** Sin marcadores en ningún modo: `PaginaDeServicio` usa `EN_DESARROLLO = false` (un dato `[a definir]` no se monta, tampoco en desarrollo).
- **L7a-5** «de qué se trata» de la intro = `queHacemos.texto`; el cuerpo arranca con el detalle (05-TEXTOS).
- **L7a-6** Las direcciones salieron a `_servicios/direcciones.ts` (puro), para que el home las importe sin arrastrar los datos de las páginas ni el Portfolio.
- **L7a-7** Las preguntas del FAQ con texto dictado por Valentino (M0 §8) quedan literales, también la pregunta «¿El bot reemplaza a mi equipo?».
- **L7a-8** `?aro-color` y `?titulo-cursiva` siguen como banderas con sus otros valores (el ítem 6 en inglés lo pide; el de 2026-10-30 dice borrar las de L3 «que no se usen»: las dos se usan, `?titulo-servicio`/`?fuente-servicio` ya no existían).

## Supuestos y descartes
- `docs/cola/2026-10-30/` estaba en `logic-core-v3/docs/`, no en la raíz del worktree.
- No corrí `npm run build` ni `prisma migrate status` (O-10 y nada de base de datos en el lote).
- El video de web del home sigue siendo el del Portfolio: el montaje del V1 ya está en `public/servicios/`, cambiarlo es otro pedido (fuera de scope).
- El blog («Del blog») sigue fuera de las páginas de servicio hasta que exista (L7c).
- Los bancos del V1 (`scripts-servicios/`) vinieron tal cual; no se corrieron.
- El costo de la variante con `ranura.ts` no se midió (necesita el build): la variante no agrega objetos, sólo tiñe la luz (el V1 midió Δ ≈ 0).

## Qué tiene que mirar Valentino
1. `/v3/paginas-web`, `/v3/software-a-medida`, `/v3/ia-y-automatizaciones` a 1440: la intro (¿~1 pantalla alcanza? ¿el acento de cada una?) y bajar hasta el FAQ.
2. `/v3` → Servicios → «Leer más…» de cada servicio, a 1440 y en el teléfono: el viaje (anochece, la cámara llega a la página).
3. El texto de las tres páginas (cuerpo y FAQ): es la base genérica, para ajustar página por página.
4. `/v3#servicios` a 1440: el aro en tercios y la cursiva Playfair por defecto. Banderas: `?aro-color=mezcla|tercios|ola` (tercios), `?titulo-cursiva=1|2|3` (3).
