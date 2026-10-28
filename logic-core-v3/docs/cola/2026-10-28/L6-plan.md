# L6 · plan (carril b: rama `cola3b/2026-10-28`, dev :3003, fotos `C:\nocturno\cola3-fotos\b\L6\`)

## Hallazgos de lectura (antes de construir)
- El login nuevo es una hoja `?ingresar` sobre cualquier página de `/v3` (`_chrome/ingreso/`). El viejo es `/login` (`src/app/login`), compartido con el sitio vivo.
- Redirects: `signOutAction` (`src/actions/auth-actions.ts`) hace `signOut({ redirectTo: '/login' })`; `src/proxy.ts` manda a `/login` los accesos sin sesión; `auth.ts` (frozen) tiene `pages.signIn = '/login'` y el `signIn` callback devuelve `/login?error=unauthorized`; `forgot-password` y `reset-password` son páginas viejas de `src/app`.
- Los tres flags de la página base ya tienen su valor elegido como defecto (`titulo` 1, `composicion` 3, `legibilidad` peso): fijarlos no cambia lo que se ve.

## Ítems
| # | Hecho cuando | Esfuerzo | Verificación |
|---|---|---|---|
| 5 Destello del viaje | `paginaTapada.ts` apaga la `transition` del `main` nuevo (inline) y la devuelve en `mostrar` (al terminar la animación) y en `soltar` | S | `scripts-carga/viaje.ts`: la página que llega no se ve antes del destape (antes: 4 cuadros 1,00→0,98); `s78-b12b` verde |
| 4 Flags fijos | `?titulo=`, `?composicion=`, `?legibilidad=` no se leen; sin variantes ni caminos; `/v3/pagina-base` igual sin flags | M | `tsc`, `s78-b12a` actualizado (sin debilitar: los casos que clavaban las variantes pasan a clavar la fija), captura de `/v3/pagina-base` a 1440 y 390 |
| 1 Entrada del login | La animación de apertura se reproduce siempre (directo, desde la barra, tras cerrar/abrir, tras un intento fallido); causa raíz documentada | M | `scripts-carga/ingreso.ts` ampliado, con la cuenta de `.env.local` (nunca impresa) |
| 2 Rutas de auth al login nuevo | Lo que se pueda desde el lado v3 (el login nuevo pasa sus destinos; error del form queda en el form). Lo que exija `auth.ts`/`/login`/`signOutAction` se frena y se documenta con opciones | M | `ingreso.ts` + invariantes `s79` |
| 3 Preloader sin flechas | Sin flechas; el botón del sonido aparece en su lugar con una onda fina que cruza el fondo desde él; tras el umbral lento, latido «tu-tu … tu-tu»; en teléfono vibran los dos botones; el movimiento vuelve a prenderse al recargar (`requestPermission` sin gesto primero) | L | `scripts-carga/preloader.ts` (sin flecha; onda nace en el botón a 1440/1024/390; latido tras el umbral), `movimiento.ts` (recarga), `s78-preloader*` |

## Implicancias
- Quitar la flecha deja huérfanos `FlechaDelSonido.tsx`, `trazado.ts` (parte de la flecha) y partes de `animaciones.ts`/`linea.ts` (freno, pulso de la punta): se borran los caminos que nadie usa; los invariantes `s78-preloader*` que clavan la flecha se actualizan (y se dice en el resultado).
- La duración normal de la línea (5,7 s) no cambia: la onda ocupa el tramo que tenía la flecha.
- Reducido (`prefers-reduced-motion`): sin onda viajera; el botón aparece y late sin escalas largas (un fundido).
- Tablet = teléfono. Textos en voseo. Cero `any`, cero `router.push`.
- Fuera de alcance: las grietas, el movimiento completo del teléfono, el cuadro largo página→home, los benches de comparación de `scripts-carga` de los flags.
- Opcional: ninguno.

## Casos que los tests cubren (uno por valor)
- Preloader: 1440, 1024, 390 (la onda nace en el botón del sonido; en 390 también en el de movimiento); reducido; latido: dos pulsos cercanos y pausa, tras `pulsoDesdeMs`; ninguna `[data-parte="flecha"]`.
- Movimiento: prendido → recarga → `requestPermission` concedido: prende; rechazado: espera el toque; sin `requestPermission`: como hoy.
- Login: entrada directa `?ingresar`, desde la barra, abrir-cerrar-abrir, tras un intento fallido, con la animación medida (la hoja llega a su caja final).
- Flags: `?titulo=2`, `?composicion=1`, `?legibilidad=tamano` dan lo mismo que sin flag.
- Viaje: opacidad de la página que llega 0 hasta el destape; con `CONTROL=sin-tapar` sigue fallando.

## Gate
`npx eslint <tocados>`; `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit` (0 errores nuevos); `npm run test:s78-b12a`, los s78/s79 tocados, `tsx scripts-carga/{ingreso,preloader,movimiento,viaje}.ts`; cada test nuevo con control rojo (se rompe el código a propósito). Navegador en :3003 a 1440 y 390; humo del home (rueda y ráfaga a Portfolio, a Demos y de vuelta). Un criterio observable por ítem: arriba, columna «Hecho cuando».

## Premortem
«Dentro de una semana L6 falló porque…»: (a) la onda se pintó en el hilo principal y se trabó con la escena cargando → usar sólo `transform`/`opacity` en el compositor (como la capa actual); (b) se borró la flecha y un invariante de otra suite leía `FlechaDelSonido` como texto → grep de todo el repo antes de borrar y correr las suites que lo nombran; (c) la «entrada que a veces falla» tiene una causa de carrera que mi prueba, siempre rápida, no reproduce → probar con CPU limitada y con el módulo perezoso demorado, no sólo el camino feliz; (d) el arreglo de auth tocó `auth.ts` sin querer → se frena y se documenta; (e) la cuenta de prueba se filtró a un log o captura → el script lee `.env.local` y no imprime; capturas del login sin campos llenos; (f) quitar los flags cambió la pista de una página → comparación de captura con y sin flags antes de cerrar.
