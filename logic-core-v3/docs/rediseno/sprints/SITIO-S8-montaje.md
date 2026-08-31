# SITIO-S8 — La escena, el preloader, el chrome y el peso

El sitio deja de ser un esqueleto poblado y pasa a ser el sitio.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Sprint largo: puede durar horas. **Construí todo y frená al final.**
- **NO corras el dev server, NO tomes capturas, NO abras navegador.**

⚠️ **El build necesita LAS DOS variables, y con estos valores:**

```powershell
$env:CIRCLE_NODE_TOTAL=2
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

**Bajaron a propósito.** La máquina tiene 16 GB y con tres procesos autorizados a 8 GB cada uno se congelaba entera por paginación. Si con 4096 muere, subí a 6144 — **no vuelvas a 8192**. Y **no corras nada al lado del build.**

---

## Por qué `ultracode`

Cuatro frentes que no se tocan entre sí: la escena, el preloader, el chrome y el peso del layout raíz. Cada uno tiene su archivo, su medición y su comprobación.

**Pero solo funciona con la Fase 0.** Los cuatro necesitan lugares donde montarse, y esos lugares los escribe el agente principal **antes** de despachar. Si cuatro subagentes editan el layout, se pisan.

---

# FASE 0 — Los enchufes (el agente principal, sin subagentes)

**Nada se despacha hasta que esta fase esté cerrada.**

## 0.1 Leer

- `docs/rediseno/outputs/SITIO-S7-*.md` — la composición y lo que dejó abierto en §7.22–27.
- `docs/rediseno/DIRECCION-ESCENA.md` — **entero**. Son catorce sprints de escena.
- `src/app/probe-escena/` — la escena. `src/components/layout/home-intro/` — el preloader.
- `src/app/v3/` — el home compuesto.
- `src/app/layout.tsx` y `src/components/layout/PublicOnlyComponents.tsx` — el chrome viejo.

## 0.2 Los cuatro enchufes

Escribilos vos, en el layout y en la composición, **antes de despachar**:

| enchufe | quién lo llena |
|---|---|
| **El escenario** | subagente 1 — hoy hay un marcador de posición de S1 |
| **El intro** | subagente 2 |
| **El chrome** | subagente 3 — navegación, pie, cursor |
| — | subagente 4 no toca `/v3`: trabaja en el layout raíz |

**Cada enchufe es un punto de montaje con su contrato.** Un subagente escribe lo que va adentro, nunca el punto.

## 0.3 Reglas para todo subagente

1. **Escribís SOLO en tu carpeta.** Si necesitás algo de afuera, **reportalo**, no lo escribas.
2. **No modificás ningún enchufe, ni el contrato, ni `package.json`, ni `secciones.ts`, ni `theme-develop.css`.**
3. **Consumís lo que existe. No reimplementás nada.**
4. **Cero valores fuera de los tokens.**
5. **Tu invariante propio, con controles positivos.**
6. **Reportás en formato fijo**: qué montaste, qué mediste, qué te faltó, qué frenó.

---

# FASE 1 — Los cuatro frentes

---

## Subagente 1 · La escena 3D

**Catorce sprints construyeron esta escena y nunca se montó en una página.** La arquitectura entera se diseñó para este momento: *"la capa 3D se enchufa y se desenchufa sin tocar el resto."*

### La mudanza

La escena vive en `/probe-escena`, que es **una ruta de demostración con fecha de baja**. El home no puede depender de algo que se va a borrar.

- **Mudá a `_lib/escena/`** lo que el home necesita: la coreografía, el muestreador, la celosía, el sol, las partículas, el rig.
- **`/probe-escena` sigue funcionando** consumiendo desde ahí. Es la herramienta de calibración y se usa.
- ⚠️ **Mudar no es reescribir.** Los archivos se mueven y se ajustan imports. **Ni un valor cambia.** Los invariantes de escena que existan tienen que seguir pasando — si no existen fuera de `probe-escena`, decilo.

### El montaje

- **Entra por la compuerta de 1025**, con el mecanismo que ya existe. **Reusalo, no construyas otro.**
- **La escena pesa unos 244 KiB** y `three` no viaja hoy en la carga inicial de `/v3`. **Tiene que seguir sin viajar.** Verificalo sobre la salida del build, con marca y control positivo.
- **El progreso del recorrido se ata al scroll de la página**, no a un control. Los seis keyframes cubren las ocho secciones: mapeá el recorrido contra las pantallas reales del home y **reportá el mapeo**.

### ⚠️ La medición que puede frenar todo

Los contrastes de los paneles transparentes **se midieron contra el marcador de posición**, que es plano y pinta dos tokens: 13,62:1 en el peor caso.

**La sala real es un gradiente con bandas de celosía, moiré y partículas. No hereda ese número.**

- **Medí el contraste de la tinta contra la escena real** en las dos secciones transparentes: **Hero** y **Por qué develOP**, en sus poses del recorrido.
- **Si no pasa AA, FRENÁ Y REPORTÁ.** No inventes un velo, no bajes una opacidad, no cambies una superficie. **Es una decisión de dirección visual y la toma el humano.**

---

## Subagente 2 · El preloader

El preloader está terminado: 7,35 s, trazo, letras, transformación de color, relevo 2D→3D escondido en la inversión de la tinta, partículas que caen, y el logo acomodándose en la escena.

**Nunca se montó en el home nuevo.**

- **Solo primera visita de sesión. Nunca bloquea el scroll. No espera a que cargue nada. Sin sonido.**
- **Honra `prefers-reduced-motion`**: ahí no se monta.
- **El logo nunca cambia de tamaño**: nace con el tamaño del destino.

⚠️ **`PreloaderContext.tsx` y `TransitionContext.tsx` son archivos congelados.** Se leen, se consumen, **jamás se editan.** Si el montaje los necesita distintos, **frená y reportá.**

### El escalón de exposición — el requisito que arrastra

`DIRECCION-ESCENA.md` §7.11: el intro termina con el ambiente en `HEMI_INTENSITY` exacto y la escena arranca en `HEMI_INTENSITY × 0,6743`. **−32,6% de ambiente en un corte.**

Está medido que en el intro vale **0,39 puntos** —su única superficie iluminada es una tinta que el tone map aplasta— así que es chico. **Pero ahora el intro entrega a la escena de verdad, no a un marcador.**

- **Medilo con la escena real detrás.**
- **La ventana en que se disuelve el fondo es la tapadera natural** si hay que resolverlo.
- **Si el escalón se ve, reportá el número.** No lo tapes con un fundido inventado.

### El relevo de las partículas

Las del intro **caen antes** de que se vaya lo blanco, y las de la escena ya están ahí. **Margen medido: 112,4 ms.**

⚠️ **Ese margen se midió contra el marcador de posición.** Con la escena real las partículas son otras: **volvé a medirlo** y confirmá que las dos poblaciones no se ven juntas. **Si se solapan, frená y reportá.**

---

## Subagente 3 · El chrome del home

S7 compuso las ocho secciones **y no montó el chrome**. Está construido entero desde S3 y no lo usa nadie.

- **La pastilla de navegación.** Nace cerca del pie de la primera pantalla y viaja al tope. Su umbral se compone desde tokens y **depende de la geometría del Hero**: verificá que el número siga valiendo con el Hero real.
- **El pie.** Ya existe entero. ⚠️ **Enlaza cuatro secciones y existen ocho** — S7 lo dejó anotado. Completá el recorrido.
- **El cursor propio.** ⚠️ **Que el home nuevo tenga cursor propio es una decisión que nadie tomó.** Montalo detrás de una constante declarada, apagada por defecto, y **reportalo como decisión pendiente** con lo que costaría prenderla. No la prendas.

**Nada del chrome se monta abajo de 1025** salvo lo que ya está gateado por su cuenta. El cursor tiene su propia compuerta desde S3: reusala.

⚠️ **`peso="medio"` sigue esquivado en Servicios** — era un rodeo de `cn()`, ya arreglado. **Restauralo y reportá qué cambia en pantalla.**

---

## Subagente 4 · El peso del layout raíz

**El presupuesto no se cumple y hace seis sprints que lo arrastramos.** 440,7 KiB gzip abajo de 1025 contra un techo de 300, y **el 99,7% viene del layout raíz.**

La causa está diagnosticada:

> El layout raíz importa estáticamente Navbar, Shutter, Preloader, Lenis, sonner y el widget de chat. `PublicOnlyComponents` los apaga en `/v3` devolviendo `null`, **pero el import estático ya metió los chunks en la carga inicial de TODA ruta.** Apagar un componente no lo saca del bundle.

Es **la compuerta al revés, una capa más arriba.**

### ⚠️ Esto toca el sitio vivo. Leé esto dos veces.

`src/app/layout.tsx` lo comparte el home actual, el panel y las landings de clientes en producción. **Matsu y Sonrisa Norte usan esto.**

- **NO cambies qué renderiza. Cambiá CÓMO se importa.** Import dinámico donde el componente no se necesita en el primer render.
- **Cada componente tiene que renderizar idéntico**, con comprobación que lo verifique y su control positivo.
- **Ningún cambio de comportamiento.** Si un componente necesita cambiar para poder diferirse, **NO lo difieras: reportalo.**
- **Cuidado con la hidratación**: `ssr: false` en algo que hoy se renderiza en servidor cambia el HTML servido. Si un componente lo necesita, decilo en vez de hacerlo.
- **Cuidado con el salto de layout**: un componente que ocupa espacio y aparece tarde mueve la página.

**Reportá el peso antes y después**, y **cuánto falta para los 300 KiB**.

Si el techo no se alcanza sin cambiar comportamiento, **decilo con el número**. Es un resultado legítimo.

---

# FASE 2 — Integración (el agente principal)

1. **Montar los cuatro** y verificar que conviven.
2. **`npm run verificar` completo**, en cero.
3. **El peso final** de `/v3` arriba y abajo de 1025, con el reparto, contra los 440,7 gzip de hoy.
4. **Que `three` no viaje** en la carga inicial, con control.
5. **El ritmo** de las ocho con la escena montada, contra los 12,0 momentos de S7.
6. **La lista de lo que frenó**, subagente por subagente. **Es lo más importante del reporte**: cuatro frentes con orden de frenar producen decisiones, y esas decisiones son mías.

---

## Reglas absolutas

1. **Rama `rediseno/home`.** No toques `main` ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **`src/app/layout.tsx` es del subagente 4 y de nadie más.**
4. **No cambies el comportamiento de ninguna sección, ni de la escena, ni del preloader.** Este sprint **monta** lo que ya existe. Mudar no es reescribir.
5. **No toques el home actual ni `/probe-escena`** salvo los imports que la mudanza obligue.
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja para que pase.** Si una es incorrecta, se reemplaza y se explica.
9. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
10. **Regla 11:** toda cifra con su instrumento. **12:** frontera declara ventana. **13:** se afirma lo propio, se publica lo heredado. **14:** los agregados se derivan.
11. **PowerShell:** no hay `&&`, no hay heredoc.
12. **No corras el dev server. No auto-confirmás que se ve bien.**
13. Archivos de más de 300 líneas se parten.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` y `npm run build`.
- (b) **Los cuatro informes.**
- (c) **El contraste de la tinta contra la escena REAL** en Hero y Por qué develOP.
- (d) **El escalón de exposición** con la escena real, y el margen de las partículas recalculado.
- (e) **El peso** de `/v3` arriba y abajo, con reparto, contra 440,7 gzip. Y **cuánto falta para 300**.
- (f) **Que `three` no viaja** en la carga inicial, con control.
- (g) **El mapeo** de los seis keyframes contra las ocho secciones.
- (h) **TODO LO QUE FRENÓ**, con su número. Son las decisiones que tengo que tomar yo.
- (i) Archivos y `git status`.
- (j) Qué queda abierto.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S8: escena, preloader, chrome y peso"` → `git push origin rediseno/home`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S8-montaje.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home. Sprint LARGO y AUTÓNOMO
  en TRES FASES: la fase 0 la hacés vos solo y nada se despacha hasta que
  los cuatro enchufes estén escritos; la fase 1 son cuatro subagentes; la
  fase 2 la integrás vos.
- El build va con CIRCLE_NODE_TOTAL=2 y
  NODE_OPTIONS=--max-old-space-size=4096. Bajaron a propósito: con 8192 la
  máquina se congela por paginación. Si muere, subí a 6144, NUNCA a 8192.
  Y no corras nada al lado del build.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
- Este sprint MONTA lo que ya existe. Mudar no es reescribir: ni un valor
  de la escena, del preloader ni de las secciones cambia. Si algo necesita
  cambiar para poder montarse, FRENÁ Y REPORTÁ.
- Los archivos congelados se leen y jamás se editan: HeroArtifact.tsx,
  TransitionContext.tsx, PreloaderContext.tsx, schema.prisma, auth.ts,
  lib/prisma.ts.
- src/app/layout.tsx lo toca SOLO el subagente 4, y ese layout lo comparte
  el SITIO VIVO con clientes reales. Se cambia CÓMO se importa, nunca QUÉ
  renderiza. Si un componente necesita cambiar para poder diferirse, NO lo
  difieras: reportalo.
- Los contrastes de los paneles transparentes se midieron contra un
  marcador plano. La sala real es un gradiente con celosía y moiré y NO
  hereda ese número. Si la tinta no pasa AA sobre la escena real, FRENÁ Y
  REPORTÁ: no inventes un velo ni bajes una opacidad.
- El margen de 112,4 ms de las partículas del preloader también se midió
  contra el marcador. Volvé a medirlo con la escena real.
- El cursor propio en el home es una decisión que nadie tomó: montalo
  apagado por defecto y reportalo, no lo prendas.
- three NO puede viajar en la carga inicial de /v3. Verificalo sobre la
  salida del build con control positivo.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío.
  Toda cifra con su instrumento.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.
- LO MÁS IMPORTANTE DEL REPORTE es la lista de todo lo que te hizo frenar,
  con su número. Cuatro frentes con orden de frenar producen decisiones, y
  esas decisiones son mías, no tuyas.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
