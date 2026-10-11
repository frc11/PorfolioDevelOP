# BUILD DE PRODUCCIÓN — diagnóstico (PULIDO 14 · L4)

Fecha: 11 de octubre de 2026, rama `rediseno/home` en `e1538e12` (después de L3). Sólo diagnóstico: no se tocó nada compartido
(`layout.tsx`, `src/lib/`, `_chrome/`) ni ninguna configuración (`next.config.ts`, `netlify.toml`, `package.json`, `.env*`).

## 1. Cómo se corrió

- Con el dev server apagado y el banco cerrado (7,2 GB disponibles, 933 MB de no paginado, 79,6 GB de disco).
- La receta conocida: `CIRCLE_NODE_TOTAL=2 NODE_OPTIONS=--max-old-space-size=6144 npm run build` (nunca 8192). Una sola corrida.
- Resultado: **salida 0 en 190 s**. El `prebuild` (`scripts/llave-contenido-inventado.mjs`) pasa: la llave del contenido inventado
  (`src/app/v3/_secciones/_contrato/llave.ts`) está en `false`. Webpack compila en 112 s; TypeScript (sin
  `ignoreBuildErrors`), 42 s sin errores; 44 páginas estáticas en 3,8 s (con 1 worker). Ni un aviso en el log.
- El build leyó `.env.local` (las variables de esta máquina).

## 2. Los errores, por archivo y por origen

**Ninguno.** El build de producción no tiene errores ni avisos: ni de /v3, ni del sitio compartido, ni del código de Franco (el
setter, los paneles: compilan y se generan igual). No hay nada que arreglar para que buildee.

Lo que sí aparece son los **invariantes que leen el build** (los rojos de `verificar`, sección 4): no rompen el build ni un deploy;
son presupuestos de peso y de carga del lane de /v3.

## 3. Qué bloquea un deploy

Del build, nada. Para un **deploy preview en Netlify** (`netlify.toml`: `npx prisma generate && npm run build`, publica `.next`, con
`@netlify/plugin-nextjs`):

1. **Las variables de entorno** (en el panel de Netlify; sus nombres, de `scripts/check-env.js`; los valores, nunca acá):
   - Críticas: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `IMPERSONATION_SECRET`, `CHATBOT_GCP_PROJECT_ID`,
     `DEVELOP_ALERTS_EMAIL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`.
   - Opcionales (el feature se degrada sin ellas): el chatbot (`CHATBOT_LLM_PROVIDER`, credenciales de Vertex o
     `ANTHROPIC_API_KEY`), el mail (`RESEND_*`, `BREVO_*`), Google, Tiendanube, n8n, Telegram, Sentry (`NEXT_PUBLIC_SENTRY_DSN`,
     `SENTRY_AUTH_TOKEN`/`SENTRY_ORG`/`SENTRY_PROJECT` para subir los mapas de fuente).
   - Las `NEXT_PUBLIC_*` se hornean en el build: tienen que estar ANTES de buildear (si no, el preview sale sin ellas).
   - Riesgo no medido: el build local tuvo `.env.local`; sin variables, alguna página puede fallar al generarse. El preview lo dice.
2. **La memoria del build**: `netlify.toml` fija `NODE_OPTIONS=--max-old-space-size=4096` (la receta local usa 6144). Con 4096 y
   un worker, el build de medición de este sprint pasó cinco veces (103–131 s); con 2 workers no está medido con 4096.
3. **El límite de 10 s de las funciones de Netlify** (las síncronas; las programadas, 30 s). /v3 es estática (`○`): no usa
   funciones. Sí las usan las rutas dinámicas (`ƒ`: `/admin`, `/dashboard`, `/setter`, las API). `maxDuration` es de Vercel y en
   Netlify no alarga nada: el chat del chatbot y sus pruebas declaran 30 s (`api/chatbot/[slug]/chat`, `api/admin/chatbot/*`), el
   webhook del motor 15 s y dos crons 300 s (`api/cron/regenerate-briefs`, `api/cron/send-executive-reports`). Con el límite de
   10 s se cortan si tardan más. Para el preview de /v3 no importa; para producción, sí. (Además `netlify.toml` y `vercel.json`
   registran crons distintos.)
4. **El tamaño**: lo que se sube es `.next/static` (11 MB) y `.next/server` (125 MB, la función de Next con lo trazado). `.next/cache`
   (2,9 GB) y `.next/dev` (1,2 GB) son locales y no se suben. El límite de una función (250 MB sin comprimir) no se mide hasta el
   primer deploy (el plugin arma el paquete).
5. **El formulario de /v3**: `/api/contacto` valida y limita por IP (con Prisma: necesita `DATABASE_URL`) y contesta `ok`, pero
   **no envía el mensaje a ningún lado** («la conexión al servicio real es de la etapa siguiente»). En un preview está bien; en
   producción, quien escriba recibe «Recibido» y nadie lo lee. Eso SÍ bloquea producción.

## 4. Los 8 rojos de `verificar`, con el build

La base de `verificar` (sin build de producción en `.next`) tiene 8 agregados en rojo: s1, s2, s3, s4, s5, s7, s8, s17. Con este
build, corridos uno por uno:

| Agregado | Sin build | Con el build | Qué queda |
|---|---|---|---|
| s1 | s1-bundle, 12 fallas | **verde** | — |
| s2 | s2-bundle 16, s2-css 2 | s2-bundle 3 (s2-css verde) | tres curvas de animación en la carga inicial de /v3 (`salida-fuerte`, `simetrica-suave`, `bottom-=240px`) |
| s3 | s3-peso 13 | s3-peso 1 | las reglas del CSS servido de /v3 que nombran `data-pieza`, `data-parte` o `data-forzado` suman 37,7 KiB crudo contra la guardia de 24 KiB (una guardia de regresión, no un presupuesto) |
| s4 | s4-cobertura 1, s4-heredado 4 | s4-cobertura 1 (s4-heredado verde) | **no es del build**: 15 suites (s23–s36, s39) sin su `test:<suite>` en `package.json` |
| s5 | s5-compacto 1, s5-peso 8 | s5-compacto 1, s5-peso 4 | s5-peso: lo propio de /v3 son 693,8 KiB contra un techo de 81 KiB, y las mismas tres curvas; s5-compacto **no es del build** (cuatro cadenas de Quiénes somos, «encuadre: medio», sin coreografía) |
| s7 | s7-compuerta 18 | s7-compuerta 5 | la marca del árbol animado y las tres curvas en la carga inicial |
| s8 | montaje 2, tres 11, chrome 2, peso 14 | montaje 2, tres 3, peso 1 (chrome verde) | three.js en un archivo de la carga inicial de /v3 (`THREE.Object3D`); lo que /v3 pide por encima del piso, 324,5 KiB gzip contra 300; s8-montaje **no es del build** (invariantes de más de 300 líneas) |
| s17 | s17-revelado 1 | s17-revelado 1 | **no es del build**: la regla del revelado «gateado» |

O sea: con el build sólo **s1** se pone verde entero (y, adentro de sus agregados, s2-css, s4-heredado y s8-chrome). Los otros
siete siguen rojos: cuatro por cosas que no son del build (s4-cobertura, s5-compacto, s8-montaje, s17-revelado) y los demás por el
peso y la carga inicial de /v3.

Todo lo que queda rojo es de /v3 (el lane del rediseño); nada es del sitio compartido ni del código de Franco.

## 5. El plan de arreglo, por pasos

1. **Preview de /v3 (sin tocar código).** Cargar las variables críticas en Netlify (con `NEXT_PUBLIC_*` antes de buildear) y
   lanzar un deploy preview de la rama. Riesgo: alguna página que necesite una variable para generarse (se ve en el log del
   preview); la memoria del build con 4096 y 2 workers (si se corta, `CIRCLE_NODE_TOTAL=1` en las variables del sitio).
2. **El formulario.** Conectar `/api/contacto` a su destino (el CRM o el mail; hay Brevo y Resend configurados) antes de producción.
   Riesgo: bajo; es la etapa siguiente que el código ya anuncia.
3. **three.js fuera de la carga inicial de /v3** (s8-tres): encontrar qué import estático lo trae al archivo inicial y llevarlo
   detrás del montaje diferido de la escena. Riesgo: medio (el orden de carga de la escena y el preloader; correr s8, s16, s17).
4. **Las curvas fuera de la carga inicial** (s2, s5, s7): lo mismo con el vocabulario de animación que entra antes de tiempo.
   Riesgo: medio-bajo.
5. **El peso** (s3, s5-peso, s8-peso): decidir con el humano si los techos (81 KiB propios, 300 KiB gzip) siguen o se recalibran
   con lo que /v3 es hoy (la escena, los títulos 3D, el pie de volumen). Riesgo: es una decisión, no un arreglo; recalibrar sin
   decidir es debilitar el invariante.
6. **Los rojos que no son del build** (independientes): las 15 entradas `test:<suite>` (s4-cobertura), las cuatro cadenas de
   Quiénes somos (s5-compacto), partir los invariantes largos (s8-montaje) y revisar el revelado (s17). Riesgo: bajo.
7. **Producción**: los tiempos de las funciones (paso 3 de la sección 3: los crons de 300 s y el chat de 30 s no entran en 10 s;
   funciones de fondo o programadas en Netlify) y los crons duplicados entre `netlify.toml` y `vercel.json`. Riesgo: alto si se
   deploya sin revisarlo (el chatbot y los reportes se cortarían).
