# CONTRATO: la frontera entre el home y las páginas

Es la parte estable de `claude/ESCENA-CONTRATO.md` (en el proyecto de claude.ai). El estado de los pedidos (P-H y P-S) vive allá. Lo marcado **[PLAN B12]** está decidido pero todavía no construido: antes de usarlo, verificá en el código qué existe.

## Estructura de una página

| Tramo | Qué es | De quién |
|---|---|---|
| **1. Intro con escena** | El logo en el centro, de noche, con el acento del servicio y la variante. La cámara se mueve con el scroll durante **1,5 pantallas**. Un **título 3D impreso** de calidad | **Del home:** la escena, la cámara y el título 3D. **De la página:** el texto del título y la bajada, y la variante |
| **2. Cuerpo en papel** | Secciones opacas, en papel, con los acentos oscuros. Tapan la escena | **De la página** |
| **3. Pie genérico** | Por qué develOP + CTA + pie, con la escena de nuevo | **Del home** (B13) |

**El `h1` [PLAN B12, P-H13]:**
- un solo texto con dos versiones: el `h1` del DOM y el título 3D dicen exactamente lo mismo;
- el `h1` queda siempre en el DOM;
- se oculta solo visualmente mientras el 3D está a la vista;
- es el visible cuando no hay 3D (sin WebGL, con movimiento reducido o en modo plano).
- En las páginas de servicio, el texto es **el nombre del servicio** (campo `nombre`); el problema va en la bajada.

**El título 3D de las páginas [PLAN B12, P-H14]:**
- es un preset de `TituloDeVolumen` que expone el home, el mismo en todas las páginas;
- la página elige el preset; no arma su propio título.

**La REGLA DE ALTURAS no aplica al cuerpo de las páginas:**
- la pista de la intro se ancla al bloque de la intro, y la del pie, a su propia sección;
- el alto del cuerpo en papel (y las secciones ancladas con su propio largo de scroll) no corre la escena.

## Navegación [PLAN B12]

**La composición inicial compartida.** Todas las páginas arrancan desde la misma composición de escena (o una muy parecida): la pose de llegada.

| Caso | Qué pasa |
|---|---|
| **Del CTA de Servicios del home a su página** | **El viaje:** el papel de la sección se levanta, aparece la escena, anochece y la cámara llega a la composición inicial de la página |
| **Cualquier otra navegación** (navbar, de página a página) | 1. La escena de la página actual vuelve a su composición inicial.<br>2. Pasa **el velo**, el mismo del día y la noche, que lleva el anochecer o el amanecer.<br>3. Del otro lado, la página nueva está en su composición inicial. **Una sola transición para todo.** |
| **Si la escena no se ve** (estás en el cuerpo en papel) | Se va directo al velo, sin la vuelta de la cámara |
| **Entrada directa** (link o recarga) | Un preloader corto. Se va a cranear como un elemento propio |
| **Flecha del navegador hacia el home** | Al lugar donde estabas, con la escena en su estado. Amanece |
| **"Home" en el menú** | Al principio del home. Amanece |

- **Navbar:** la misma píldora del home en todas las páginas, con un desplegable de servicios. En el celular, el desplegable es un acordeón dentro del menú.
- **Sonido:** uno suave al salir y otro al llegar; respeta el mute.
- **Técnica:**
  - `<Link>` y navegación cliente; nunca `router.push`, nunca `TransitionContext.tsx`;
  - el `<Canvas>` vive en el layout de `/v3`: `v3/layout.tsx` → `EscenarioCompuerta` → `EscenaDelHome`, y el lienzo en `_lib/escena/ProbeStage.tsx`;
  - B12 lo hace consciente de la ruta con un preset por página: la pista de cámara de la intro, la noche, el acento y la ranura.

## Ranura de variantes [PLAN B12]

- La variante es un componente de R3F que vive en `src/app/v3/_servicios/escena/` (o en la carpeta de la página dueña), se monta en la ranura que expone el home y recibe, como mínimo:
  - el avance de la intro (de 0 a 1);
  - el acento (el color claro);
  - la calidad (completa o compacta);
  - si el usuario pidió menos movimiento.
- La firma exacta y el presupuesto por cuadro los fija B12. Buscalos en el código antes de escribir una variante.
- La ranura la desmonta al salir de la página.

## Piezas compartidas (se importan; no se copian ni se modifican)

| Pieza | Dónde |
|---|---|
| Modal de contacto | `_chrome/contacto/Contacto.tsx`; abre con `[data-abre-contacto]`; preselección con `data-precarga="<IdDeServicio>"` |
| `data-servicio` | Solo el contexto del acento del tema (`theme-develop.css`, `acento.ts`) |
| Logotipo | `LOGOTIPO`, en `_componentes/marca/sistema.ts` |
| Casos | `PROYECTOS`, en `_secciones/trabajos/proyectos.ts`; los medios, en `public/portfolio/<slug>/`. **Hoy los tres son de desarrollo web:** una página de otro servicio no los muestra como propios |
| Enlace al Portfolio | Los deep links de B1 (formato en `docs/rediseno/SPRINT-B1-PORTFOLIO.md`), sin filtro por servicio por ahora |
| Precios | `PRECIOS_DESDE`, en `src/app/v3/_servicios/precios.ts` |
| Revelados | `_secciones/_contrato/` |
| Llave de contenido falso | `_secciones/_contrato/llave.ts` |
| Otras | `Cta`, `Titular`, `Textos`, `Envoltorio`, `Imagen`, `IdDeServicio` |

**Reservados del home**, que las páginas no usan:
- los ids de las secciones y `portfolio-*`;
- `data-panel`, `data-seccion-id`, `data-signo-de-la-tuya` y `data-servicio`;
- `data-seccion`, salvo `invertida` en la raíz.

## Colores de servicio

| Paleta | Web | Software | IA | Dónde |
|---|---|---|---|---|
| Oscuros | `#1D5B8F` | `#57429E` | `#1B6B4C` | Cuerpo en papel. Tokens `--color-acento-web`, `--color-acento-software`, `--color-acento-ia-automatizacion` |
| Claros | `#8FC0E8` | `#AFA0E8` | `#7FCBA4` | Sobre la escena: la intro, la luz y las variantes. Tokens del tema desde B1.2c |

- Se usan los tokens, nunca el hex escrito a mano.
- La paleta vieja de cian, verde, ámbar y violeta **no se usa**.
- Se mide cada combinación de texto contra AA.

## Fronteras

- **El home** (rama `rediseno/home`) es dueño de:
  - `src/app/v3/_lib/**`, `_secciones/**`, `_chrome/**`, `_componentes/**` y `_archivo/**`;
  - `src/app/v3/layout.tsx` y `src/app/v3/page.tsx`;
  - `src/app/layout.tsx`, `globals.css` y `theme-develop.css`;
  - `public/v3/**` y `public/portfolio/**`;
  - `docs/rediseno/**`, `scripts-carga/**` y `scripts-portfolio/**`;
  - `package.json` y el lockfile.
- **Servicios** (rama `paginas/servicios`) es dueño de:
  - `src/app/v3/[servicio]/` y `src/app/v3/_servicios/` (incluida `escena/`);
  - `docs/servicios/`;
  - `public/servicios/**`, sus assets (el video de montaje, por ejemplo);
  - `scripts-servicios/**`, sus scripts de producción.
- **`public/portfolio/` se puede leer** para producir assets propios (por ejemplo, con ffmpeg como binario del sistema, sin dependencia nueva). Nunca se escribe ahí.
- **Si te sirve un script del home**, copiá el enfoque en tu carpeta: no lo edites ni lo importes.
- **De nadie** (compartido con el sitio vivo): `src/lib/`, `chrome/`, `scene-camera.ts` y las zonas de Franco.
- Si necesitás algo del otro lado, no lo tocás: lo pedís en el reporte como un pedido nuevo (P-H para el home, P-S para servicios).
