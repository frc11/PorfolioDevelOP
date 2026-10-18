# SPRINT P-H — los pedidos de servicios al home

Rama `rediseno/home`, sobre B1.2d A (`36881065`). Cola desatendida del 18 de octubre de 2026, TAREA 1. Los pedidos P-H vienen del carril de servicios (`docs/servicios/SPRINT-M1.md` §pedidos y la verificación del merge de B1.2c). Un commit por punto, o agrupados cuando tienen sentido juntos, y los archivos van por nombre.

## 1. Qué se hizo, punto por punto

| Punto | Commit | Qué |
|---|---|---|
| P-H24 (1/2) | `91413a5b` | `CONTRATO.md` de la skill `pagina-home-based` es el que copió Valentino (sha256 `F90110149AC349BA…`). El de `875e9d53` era otro archivo. |
| P-H24 (2/2) | `8bf0bfdc` | Las rutas y los símbolos de los cinco archivos de la skill, verificados contra el código, sin cambiar el criterio. La línea de O-10 entra al gate. |
| P-H10 + P-H12 | `54766fc1` | El modal de contacto: el foco vuelve al control real que lo abrió, y las caras de la placa no tapan la X. |
| Finales de línea | `f1cd4b4e` | s38, s44 y s74 normalizan CRLF a LF antes de buscar. |
| P-H21 | `eb4a3bbc` | `BotonPausa`, la pausa común de un video en bucle. Es sólo el componente, sin integrar. |
| P-H23 | `97e5c667` | La llave gana un punto de registro (`registrarInventos`) para los textos genéricos de otras carpetas. |
| P-H18 + P-H25 | `6fbf7cd6` | El gatillo común sube a `_secciones/_contrato/`, con la guarda en reposo. El remate de Tu panel la trae y su marcado queda idéntico. |
| s77 | `6fbf7cd6` | La suite del sprint: 35 afirmaciones, 14 controles positivos. |

### 1.1 P-H24, la skill

- **El sha.** El commit `91413a5b` deja `CONTRATO.md` exactamente como lo copió Valentino (`F90110149AC349BA…`). Después, `8bf0bfdc` le corrige siete citas contra el código, así que el archivo de hoy tiene otro sha (`01C992127457075F…`). La copia exacta queda en `91413a5b`, y el diff de `8bf0bfdc` es sólo de rutas y nombres.
- **Lo corregido:**
  - en los congelados, la ruta completa de `auth.ts` (`src/auth.ts`, no los otros dos `auth.ts` del repo);
  - las rutas de `lente.ts`, de `TRAMO_ESTIRADO` y de `secciones.ts`;
  - `Textos` es el módulo `Textos.tsx` (exporta `Cuerpo`, `Caption` y `Micro`);
  - el modal abre con `data-abre-contacto="panel"` (sin valor, lleva al formulario del pie);
  - la calidad es «plena o compacta» (`NivelDeCalidad`);
  - las rutas de `theme-develop.css` y de `acento.ts`, y los tokens claros por nombre;
  - `data-signo-de-la-tuya` se fue (se sacó en B1.2b);
  - `chrome/`, que no existe, pasa a `src/components/layout/` (el chrome del sitio vivo).
- **El gate de la skill** suma «No corras `next build` salvo que el prompt lo pida (O-10)».
- **`git check-ignore`:** la skill no está ignorada. `.claude/settings.local.json` sí lo está, por el ignore global.

### 1.2 P-H10 + P-H12, el modal de contacto

- **P-H10, el foco.** Los CTA de Servicios ponen `data-abre-contacto` en un `div`, que no recibe el foco, así que al cerrar el foco quedaba en `body`. Ahora la delegación guarda el control tocado adentro del disparador (`origenDelClic`). Al cerrar, el foco vuelve a ese control (`focoDelOrigen`). Si el origen es un envoltorio, va a su primer focalizable, y si el control ya no está en el documento, no va a ninguno.
- **P-H12, la X.** Las caras de la placa 3D iban después de la hoja y tapaban la X cuando se pedía el elemento del punto. Ahora no reciben el puntero.
- **Probado en el sitio con el teclado** (foco, Enter, Esc; sonda `scratchpad/b12d/ph-contacto.ts`, a 1440):
  - la barra, el CTA del hero y el CTA de un servicio: el foco vuelve a su control;
  - la X: el elemento de su punto es la X y el clic la cierra;
  - «la tuya» no abre el modal (su formulario es propio, en la tira): 0 disparadores.
- **Una corrida que no se repitió.** Una corrida anterior de la sonda dejó el foco en `body` con el CTA de un servicio. La causa no quedó establecida: esa corrida eligió un botón escondido (otra tira). La sonda se corrigió para elegir un botón a la vista y arriba de todo en su punto, y con eso pasa. Está en la lista del FRENO.
- **s25** suma las afirmaciones con su control (35).

### 1.3 Finales de línea

- **El defecto.** En el worktree de servicios, que está en CRLF, s38, s44 y s74 buscaban textos de varias líneas y no encontraban nada, y dos controles positivos no reemplazaban.
- **El arreglo.** Ahora leen normalizado a LF.
- **Los controles.** Cada uno suma dos: el archivo pasado a CRLF y leído normalizado pasa, y su defecto real escrito en CRLF sigue fallando.
- **Resultado:** s38 57, s44 45 y s74 34 afirmaciones.

### 1.4 P-H21, la pausa

- **Qué es.** `_componentes/medios/BotonPausa.tsx` es un `<button>` con nombre accesible fijo («Pausar …») y el estado en `aria-pressed` (apretado = en pausa). El lector anuncia el mismo control en los dos estados.
- **Cómo se ve.** Es el disco de vidrio del botón de sonido del home, con los íconos de lucide (`Play` y `Pause`, trazo 1,5). El anillo de foco es el de la casa.
- **Dónde iría** (anotado en su docblock y no integrado):
  - el video de la tira activa del Portfolio (`trabajos/portfolio/MedioDeLaTira.tsx`, en la tira del escritorio y en la historia del teléfono);
  - el video de cada servicio (`servicios/VideoDeServicio.tsx`).
  - Las demos de Tu panel ya tienen la suya.
- **Padrones.** Entra a `s3-archivos` y a `s3-piezas`: s3-foco lo cuenta como pieza interactiva.

### 1.5 P-H23, el punto de registro de la llave

- **Cómo se usa.** `registrarInventos(origen, casillas)`, en `_contrato/inventado.ts`, deja que otra carpeta (las páginas de servicios) declare sus textos genéricos sin editar `inventado.ts` ni `llave.ts`. `llave.ts` sigue siendo una sola constante, la que lee el guardián del build.
- **Las reglas de cada casilla registrada:**
  - cumple lo mismo que las del home: su pedido lleva su marcador y la mentira no está vacía; si no, el registro tira;
  - pasa por la misma puerta (`conLlave`): con la llave apagada se lee el marcador;
  - la restauración del escáner la conoce: `sinLoInventado` y sus dos variantes usan `todosLosInventos()` por defecto.
- **Lo que no cambia.** `INVENTOS` y `LISTA_DE_INVENTOS` siguen siendo sólo los del home (s21 los cuenta contra las secciones, 83/0).
- **El escáner de producción sigue bloqueando:**
  - los detectores no le dan excepción a lo registrado: la mentira, escrita suelta, los dispara;
  - el escáner del contenido real sólo resta los literales exactos registrados: una cifra escrita a mano llega entera y lo pone en rojo (control positivo en s77).

### 1.6 P-H18 + P-H25, el gatillo común

En `_secciones/_contrato/`:

- `disparo.ts` es la máquina pura de cuatro estados (`quieto`, `espera`, `puesto`, `ido`), con las reglas del remate. Trae además:
  - la guarda en reposo (`siguienteEstado` con el evento `reposo`);
  - `aLaVistaEn`, que con alto 0 (la pestaña oculta) no ve nada;
  - la línea (`LINEA_DEL_DISPARO`, 6 %) y `margenDelDisparo`.
  - Es la de servicios (`_servicios/movimiento/disparo.ts`), que desde acá se reemplaza por el import.
- `reposo.ts` (`vigilarElReposo`) es la guarda en el tiempo. Funciona así:
  - usa el escucha compartido del scroll (`_lib/scrollEnMovimiento.ts`) y el quieto del asiento (`ASIENTO.quietoMs`);
  - el primer reposo llega aunque la página no se mueva;
  - quien la usa la arranca con el primer aviso de su observador.
- `Gatillo.tsx` es el componente común: el de servicios, con la guarda adentro.

En Tu panel, la sección del home que lo usa:

- **La línea y el margen.** `tu-panel/entrada.ts` toma los dos del contrato: `DISPARO_DEL_REMATE` es `LINEA_DEL_DISPARO`, y `margenDelDisparo` se reexporta. Queda una sola definición en las secciones.
- **La guarda.** `Remate.tsx` la arma con el primer aviso de su observador y la suelta al desmontarse. Con el scroll quieto, si la fila asoma y el remate no entró (o se fue), entra con su gesto. Su observador, su cronograma y sus animaciones no cambian.
- **Un arreglo que la guarda hace necesario.** `reproducir` ya no toca una animación que llegó al lado pedido. Antes, `play()` la rebobinaba y repetía el gesto. Pasaba al cruzar la línea bajando después de que la guarda la había puesto, y también en una vuelta repetida.
- **El marcado servido** de Tu panel (quieto y animado) y el del remate solo dan las mismas huellas sha256 que en `f1cd4b4e`, antes del cambio. s77 las fija.
- **Los invariantes que leen el remate** pasan sin tocarse: s6-tu-panel 167, s41 59, s42 49, s75 55 y s7-contrato 31.

## 2. La verificación

- lint de los 11 archivos tocados: limpio.
- `tsc --noEmit` (con 4 GB): 0 errores.
- `npm run verificar`: los 8 grupos rojos de la base y ninguna falla nueva (§2.1).
- s77: 35 afirmaciones, 14 controles positivos, 0 fallas.
- s74 34 (32 en la base: los dos controles de finales de línea de `f1cd4b4e`), s75 55 y s76 622, sin fallas, como en la base.
- No se corrió `next build` (O-10).

### 2.1 `verificar` contra la base

- **La corrida:** sobre el árbol que después quedó en los tres commits (`eb4a3bbc`, `97e5c667` y `6fbf7cd6`), con 4,9 GB libres. Dio 84 pasos y 8 con falla: s1, s2, s3, s4, s5, s7, s8 y s17. Son los de la base.
- **La comparación:** la lista de fallas (127 líneas) contra la de B1.2d A (`scratchpad/b12d/fallas-b12d.txt`, 127 líneas). Difieren sólo en dos cuentas de una misma línea del agregado s3:
  - de 254 a 256 afirmaciones: `BotonPausa` entra a s3-foco;
  - de «81 suites» a «82 suites»: s77 es nueva.
  - La falla de esa línea es la misma de la base: las 15 suites s23 a s39 sin corredor.
- **Los agregados que tocó el sprint**, en verde: s6 630, s21 111, s25 35, s38 57, s44 45, s74 34, s75 55, s76 622 y s77 35.

## 3. Lo que tiene que mirar Valentino (FRENO P-H)

1. **P-H25, la guarda del remate** (`/v3`, Tu panel, a 1440 y a 390). Bajá hasta que «Y más…» quede apenas asomado abajo, en la franja de debajo de la línea, y soltá la rueda. Tiene que entrar con su gesto unos 180 ms después. Subí hasta que se vaya y pará con la fila asomando abajo: tiene que volver a entrar. Bajá cruzando la línea: no se tiene que repetir el gesto.
2. **P-H10, el foco** (`/v3`, a 1440, con el teclado). Tabulá hasta Contacto en la barra, Enter, Esc: el anillo vuelve a Contacto. Lo mismo con el CTA del hero y con el CTA de un servicio. El caso a mirar es el del servicio: una corrida de la sonda lo dejó en `body`.
3. **P-H12, la X** (`/v3`, a 1440). Abrí el contacto desde la barra y cerrá con un clic en la X.
4. **P-H24.** `CONTRATO.md` ya no tiene el sha de tu copia: tiene siete citas corregidas (§1.1). Si preferís la copia exacta, está en `91413a5b`.

## 4. Commits

En orden: `91413a5b`, `8bf0bfdc`, `54766fc1`, `f1cd4b4e`, `eb4a3bbc`, `97e5c667` y `6fbf7cd6`. Después, este log. Todo por nombre de archivo y sin push: `lente.ts` y `.gitignore` quedan afuera.

## 5. Fuera de scope (anotado, no hecho)

- **Integrar `BotonPausa`** en `MedioDeLaTira.tsx` y `VideoDeServicio.tsx` va cuando se toquen esas piezas.
- **Servicios** reemplaza su `disparo.ts` y su `Gatillo.tsx` por el import del contrato en su carril. Sus pruebas los citan por la ruta de ellos.
- **El `Gatillo` común no suma CSS.** La duración y la curva de los tokens que usa ya están en el home (el Portfolio, Quiénes somos y los títulos 3D). No lo usa ninguna sección del home todavía: el remate sigue con sus animaciones propias.
- **Para liberar memoria** se bajó el servidor de desarrollo de :3000: el gate no lo necesita. El de servicios (:3001) no se tocó.
