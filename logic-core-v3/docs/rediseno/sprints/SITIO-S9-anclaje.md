# SITIO-S9 — El mapeo por anclaje

Y la visibilidad de la escena, Sentry, y la deuda de instrumentos.

## Cómo correr esta instrucción

- **`/clear` antes de empezar.**
- **Modelo:** Opus 5. **Esfuerzo:** `ultracode`. **Modo rápido: OFF.** **`auto mode` APAGADO.**
- **Worktree:** `C:\rediseno-home`, rama **`rediseno/home`**. Sesión en `C:\rediseno-home\logic-core-v3`.
- **UNA PARADA 🛑**, al cerrar. Sprint largo y autónomo.
- **NO corras el dev server, NO tomes capturas, NO abras navegador.**

⚠️ **El build:**

```powershell
$env:CIRCLE_NODE_TOTAL=2
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

**Los 34 procesos `node.exe` colgados del 28/08 se mataron.** Ésa era la causa real de los `0xC0000142` — Windows sin memoria comprometida para crear el worker, no el heap. **Probá con 4096 primero.** Si muere, 6144. Y **antes de cada build, verificá que no haya `node.exe` viejos**: es el chequeo de cinco segundos que §6.1 ahora documenta.

---

# El problema, y su solución

`DIRECCION-ESCENA.md` §7.2 quedó **decidido en forma pero sin construir**: el mapeo va **por anclaje**, no por estiramiento lineal.

Hoy corre un provisional —`scrollY / (alto − ventana)`— que estira la coreografía ×1,750 porque **fue diseñada para ocho pantallas y el home tiene catorce.** Con eso, Números cae adentro del tramo de Quiénes somos, y tu-panel, por-qué y cierre caen los tres adentro del tramo de cierre.

## La tabla, y por qué encaja

Los seis keyframes llevan el nombre de la sección para la que se eligieron. **Anclados, la cuenta cierra sola:**

| # | sección | keyframe | progreso | escena |
|---|---|---|---|---|
| 1 | Hero | `hero` | 0,000 | **visible** |
| 2 | Quiénes somos | `quiénes somos` | 0,375 | **visible** |
| 3 | Números | `números` | 0,500 | **visible** |
| 4 | Trabajos | `trabajos` | 0,625 | **visible** |
| 5 | Servicios | — | *(avanza oculto)* | oculta |
| 6 | Tu panel | — | *(avanza oculto)* | oculta |
| 7 | Por qué develOP | **`demos`** | **0,750** | **vuelve** |
| 8 | Cierre | `cierre` | 1,000 | **visible** |

**Las dos secciones sin keyframe son exactamente las dos donde la escena no se ve.** Y el keyframe sin sección —`demos`— es exactamente el que le falta al diferencial.

## ⚠️ Y esto resuelve el problema de la tinta

S8 midió que el contraste cae de forma **monótona** de 9,73:1 en p=0 a 2,34:1 en p=1, cruzando AA en **p=0,878**.

Con el provisional, `por-que-develop` llenaba el cuadro en **p=0,923** → 3,10:1, abajo de AA. **Anclado al keyframe `demos`, cae en p=0,750, muy por encima del cruce.**

Es la opción (a) de §7.29 y no hay que tocar la escena, ni una opacidad, ni una superficie.

**Verificalo con la medición, no lo des por hecho.** Si aun anclado no pasa AA, **frená y reportá**: la reserva es §7.4 y esa es decisión del humano.

## El progreso sigue siendo monótono

Ojo con esto, porque cambia el trabajo: **la escena no retrocede.** El progreso avanza 0 → 1 de corrido; lo único que pasa entre Trabajos (0,625) y Por qué develOP (0,750) es que **avanza sin que nadie lo vea**, detrás de dos paneles opacos.

Cuando la escena reaparece, la cámara está en otro lado. **Eso es un efecto, no un problema** — es el mismo mecanismo que la referencia usa: *el entorno debajo se reemplaza entero mientras el DOM encima queda quieto.*

---

# FASE 0 — El contrato (el agente principal, sin subagentes)

**Nada se despacha hasta que esté cerrado.**

## 0.1 Leer

`DIRECCION-ESCENA.md` entero, con foco en §2.2, §2.4, §7.2, §7.4, §7.14, §7.29 y §7.30. `_lib/escena/`, `_lib/secciones.ts`, y los invariantes `s8-escena` y `s8-tinta`.

## 0.2 Escribir el contrato del anclaje

**La tabla de arriba, como dato**, en un módulo propio: qué keyframe ancla cada sección y en qué ventana la escena se ve.

- **Se deriva de `secciones.ts` y de la coreografía**, no se duplica. Si alguien agrega una sección o mueve un keyframe, esto tiene que seguirlo o fallar.
- **Cómo se interpola** entre dos anclas es la decisión de diseño de esta fase. Escribila con su razón.
- ⚠️ **El progreso tiene que seguir siendo monótono y exactamente reversible.** Es la propiedad que todo el sistema de motion asume, y romperla rompe los nueve patrones.

## 0.3 Los enchufes

| enchufe | lo llena |
|---|---|
| el mapeo | subagente A |
| la visibilidad de la escena | subagente B |
| — | C trabaja en `instrumentation-client.ts`, D en instrumentos |

## 0.4 Reglas para todo subagente

1. **Escribís SOLO en tu carpeta.** Si necesitás algo de afuera, **reportalo.**
2. **No modificás ningún enchufe, ni el contrato, ni `secciones.ts`, ni `package.json`, ni `theme-develop.css`.**
3. **Consumís lo que existe. No reimplementás nada.**
4. **Cero valores fuera de los tokens. Tu invariante propio con controles positivos.**
5. **Reportás en formato fijo**: qué construiste, qué mediste, qué te faltó, qué te hizo frenar.

---

# FASE 1 — Los cuatro frentes

## Subagente A · El anclaje

Implementá el mapeo del contrato, reemplazando el provisional.

- **Cada sección llena el cuadro en el progreso de su ancla.** Verificalo sección por sección, con las ocho.
- **Monótono y exactamente reversible**, con control positivo.
- **Las tres desalineaciones que §7.2 mide tienen que desaparecer.** Reportá la tabla nueva contra la vieja.
- **Abajo de 1025 no hay escena**: el mapeo no se monta y no cuesta nada. Verificalo.
- ⚠️ **El keyframe `demos` se reasigna a `por-que-develop`.** Es la decisión de este sprint: `demos` era una sección del plan viejo que el sitio ya no tiene, y su pose —la más íntima del recorrido, con el sol en contraluz— es la que el diferencial necesita. **Escribí la reasignación con esa razón**, para que nadie la lea como un accidente.

## Subagente B · La visibilidad

§2.4 pide que la escena *"se apague y vuelva"*. **Medí antes de construir, porque puede ser más barato de lo que ese texto imagina.**

- **En cinco de las ocho secciones el panel es opaco**, así que la escena **ya está tapada**. Lo que falta no es un efecto visual: es **dejar de renderizar cuando no se la ve.**
- **Verificá esa premisa primero.** Si en alguna sección opaca la escena igual asoma —un borde, una transición entre paneles— **entonces sí hay un efecto que componer, y ahí frená y reportá**: cómo entra y sale es §7.4 y es decisión del humano.
- Si la premisa se sostiene: **suspendé el render** mientras ningún panel transparente esté en cuadro, y reanudalo sin salto. Reportá **cuántos cuadros se ahorran** en un recorrido completo.
- ⚠️ **Suspender no es desmontar.** Volver tiene que ser instantáneo: remontar la escena cuesta lo que costó montarla.

## Subagente C · Sentry fuera de la carga inicial

§7.30: el SDK de navegador de Sentry son **142,1 KiB gzip, el 47,4% del techo**, y entra por `src/instrumentation-client.ts`. **Sin ese chunk `/v3` mediría 235,3 y estaría abajo de los 300 originales.**

⚠️ **Esto toca el sitio vivo y toca la observabilidad de producción. Leé esto dos veces.**

- **El objetivo es DIFERIR, no sacar.** Sentry tiene que seguir capturando errores.
- ⚠️ **El riesgo real: si se difiere, los errores del primer pintado dejan de capturarse.** Es exactamente cuando más pasan. **Medí qué ventana queda descubierta.**
- **Si no hay forma de diferirlo sin perder captura temprana, NO lo difieras: reportalo con el número.** Un sitio 142 KiB más liviano que no reporta sus propios errores es peor negocio.
- Evaluá también **si el SDK se puede achicar** — desactivar integraciones que no se usan pesa menos que diferir y no cuesta cobertura.
- **Reportá el peso antes y después**, y **qué se perdió**.

## Subagente D · La deuda de instrumentos

Cuatro cosas que S8 dejó anotadas:

1. **Los controles positivos están subcontados.** El lane de la escena los marca de formas distintas y el contador ve **14 de 18**. Unificá el marcador en los 34 archivos. **Subcontar no es mentir, pero un número que no se puede comparar entre lanes no sirve.**
2. **`choreographyEditor` no se mudó**, y `pistaDelHome.ts` tira en tiempo de ejecución si alguien lo llama con una variante alternativa. Quedan tres `import type` hacia `/probe-escena` — cero bytes, pero es un acoplamiento hacia una ruta con fecha de baja. **Resolvelo o declaralo con su razón.**
3. **§7.13 describe seis archivos largos con la ruta vieja.** Se mudaron a `_lib/escena/`. **Actualizá las rutas. NO los partas** — llegaron así y partirlos es reescribirlos.
4. **`scroll-padding-top` del sitio viejo aplica a `/v3`**, y ahora el pie ofrece siete anclas. **Verificá si el desplazamiento cae donde tiene que caer** y reportalo. No lo arregles si toca CSS global.

---

# FASE 2 — Integración (el agente principal)

1. **Los cuatro montados y conviviendo.** `npm run verificar` en cero.
2. **🔴 Re-medí la tinta** en Hero y en Por qué develOP con el anclaje puesto. **Es el número que decide si §7.29 se cierra.**
3. **Re-medí todo lo que dependía del mapeo provisional**: el ritmo, las ventanas de cada sección, y cualquier cifra publicada que lo asumiera.
4. **El peso**, con y sin lo que haya hecho el frente de Sentry.
5. **Actualizá `DIRECCION-ESCENA.md`**: §7.2 pasa de "decidido sin construir" a construido, §7.29 se cierra o no con el número, §7.30 según lo que salga.
6. **La lista de todo lo que frenó.** Es lo más importante del reporte.

---

## Reglas absolutas

1. **Rama `rediseno/home`.** No toques `main` ni otros worktrees. **PROHIBIDO:** `merge`, `reset`, `rebase`, `push --force`, `checkout`/`switch`/`restore` que descarte. **Nunca `git add .`**
2. **Frozen — se leen, jamás se editan:** `3d/HeroArtifact.tsx`, `context/TransitionContext.tsx`, `context/PreloaderContext.tsx`, `prisma/schema.prisma`, `auth.ts`, `lib/prisma.ts`.
3. **`src/instrumentation-client.ts` es del subagente C y de nadie más.**
4. **No cambies ni un valor de la escena, ni del preloader, ni de las secciones.** Este sprint cambia **cómo se mapea el progreso**, no qué hay en cada pose.
5. **No toques el home actual ni `/probe-escena`** salvo lo que el frente D resuelva.
6. **Zonas del otro socio:** `OsLead*`, `ActivityChannel`, `/setter`, `/leados/`.
7. **No sumar dependencias.** **Cero `any`.** **Nada de base de datos.** **Cero valores fuera de los tokens.**
8. **Ninguna afirmación se afloja para que pase.**
9. **Ninguna comprobación verde por vacío.** Control positivo obligatorio.
10. **Regla 11:** toda cifra con su instrumento. **12:** frontera declara ventana. **13:** se afirma lo propio, se publica lo heredado. **14:** los agregados se derivan.
11. **PowerShell:** no hay `&&`, no hay heredoc.
12. **No corras el dev server. No auto-confirmás que se ve bien.**
13. Archivos de más de 300 líneas se parten. Los seis heredados de la mudanza, no.

## Parada

🛑 **PARADA ÚNICA** — al cerrar:

- (a) `npm run verificar` y `npm run build`.
- (b) Los cuatro informes.
- (c) **🔴 El contraste de la tinta con el anclaje puesto**, en las dos secciones transparentes. Con el veredicto sobre §7.29.
- (d) **La tabla del mapeo nuevo** contra la vieja, y que las tres desalineaciones desaparecieron.
- (e) **Cuántos cuadros se ahorran** con la escena suspendida.
- (f) **Sentry**: peso antes y después, y **qué ventana de captura se perdió**, si alguna.
- (g) **El ritmo** recalculado con el anclaje.
- (h) **TODO LO QUE FRENÓ**, con su número.
- (i) Archivos y `git status`.
- (j) Qué queda abierto.

Esperá el OK.

Con el OK: staging archivo por archivo → `git commit -m "SITIO-S9: mapeo por anclaje, visibilidad, Sentry y deuda"` → `git push origin rediseno/home`.

---

## GATILLO — pegar esto en Claude Code

```
Ejecutá la instrucción completa en docs/rediseno/sprints/SITIO-S9-anclaje.md.
Leela ENTERA antes de empezar y tratala como si te la hubiera escrito
directamente: sus reglas absolutas y su parada son obligatorias.

Marco no negociable:
- Worktree C:\rediseno-home, rama rediseno/home. Sprint LARGO y AUTÓNOMO en
  TRES FASES: la fase 0 la hacés vos solo y nada se despacha hasta que el
  contrato del anclaje esté escrito; la fase 1 son cuatro subagentes; la
  fase 2 la integrás vos.
- El build va con CIRCLE_NODE_TOTAL=2 y
  NODE_OPTIONS=--max-old-space-size=4096. Los 34 node.exe colgados que
  causaban los 0xC0000142 se mataron: probá 4096 primero. Y verificá que no
  haya node.exe viejos ANTES de cada build.
- NO corras el dev server, NO tomes capturas, NO abras navegador.
- Este sprint cambia CÓMO SE MAPEA EL PROGRESO, no qué hay en cada pose. Ni
  un valor de la escena, del preloader ni de las secciones cambia.
- El progreso tiene que seguir siendo MONÓTONO y exactamente reversible: es
  lo que los nueve patrones asumen. La escena no retrocede — entre Trabajos
  y Por qué develOP avanza sin que nadie la vea, y eso es un efecto.
- El keyframe `demos` se reasigna a por-que-develop, y esa reasignación es
  la que resuelve el problema de la tinta: el contraste cruza AA en p=0,878
  y `demos` está en 0,750. VERIFICALO con la medición. Si aun anclado no
  pasa AA, FRENÁ Y REPORTÁ: la reserva es §7.4 y la decide el humano.
- Antes de componer un efecto de apagado, VERIFICÁ la premisa: en cinco de
  las ocho secciones el panel es opaco y la escena ya está tapada. Si la
  premisa se sostiene, lo que falta es dejar de RENDERIZAR, no un efecto.
  Suspender no es desmontar.
- src/instrumentation-client.ts lo toca SOLO el subagente C. El objetivo es
  DIFERIR Sentry, no sacarlo, y si diferirlo pierde la captura de errores
  del primer pintado, NO lo difieras: reportalo con el número. Un sitio 142
  KiB más liviano que no reporta sus propios errores es peor negocio.
- Los seis archivos largos heredados de la mudanza NO se parten: llegaron
  así y partirlos es reescribirlos. Se actualiza su ruta en §7.13.
- Ninguna afirmación se afloja. Ninguna comprobación verde por vacío. Toda
  cifra con su instrumento.
- NO toques el home actual, /probe-escena, home-intro/ ni los frozen.
- Git: commit y push en rediseno/home. PROHIBIDO merge, reset, rebase,
  push --force, checkout que descarte. Nunca git add .
- Cero any. Sin dependencias nuevas. Cero valores fuera de los tokens.
- PowerShell: no hay &&, no hay heredoc.
- La parada 🛑 es bloqueante: frenás y esperás mi confirmación.
- No auto-confirmás que algo se ve bien: eso lo juzgo yo por grabación.
- LO MÁS IMPORTANTE DEL REPORTE es la lista de todo lo que te hizo frenar,
  con su número.

Arrancá por la Fase 0. No me confirmes el entendimiento.
```
