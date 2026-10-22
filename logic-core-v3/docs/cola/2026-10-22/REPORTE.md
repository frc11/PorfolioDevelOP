# REPORTE · noche del 2026-10-22 (cerrada al día siguiente, ~15:30, después de tres cortes por la cuota de uso)

## Resumen
1. **Las 14 unidades de la cola están integradas en `nocturno/2026-10-22`**, cada una verificada en el navegador (dev :3000) con su banco y su control, más el humo del home. Son: T0, B7, B1.2e, B4, B12c, B12b, B5, B2, B3, B6, B11, B8, B13, B9 y B10.
2. **`verificar` final:** 8 grupos con falla, la base histórica (s1, s2, s3, s4, s5, s7, s8 y s17). Comparado afirmación por afirmación contra el de T0: **0 fallas nuevas**. `tsc` da 0.
   - La base al empezar la noche tenía 13 grupos: las 5 de la navbar (s10, s26, s27, s39 y s41) las resolvió T0.
3. **El `next build` NO terminó:** Claude Code lo cortó por falta de memoria y no lo relancé, por indicación del sistema. Por eso no hay números del build:
   - la vía del velo hacia el home;
   - los 404 del barrido;
   - el fundido de B7 a 390;
   - los tiempos de las grietas en el home.
4. **Dos tareas se revirtieron y volvieron arregladas:**
   - **B2:** las tarjetas del aro salían vacías.
   - **B6:** el candado de la rueda, y su banco medía mal.
5. **Regresión abierta:** `velo.ts`, «el home → la página». La píldora va a 11,7–14,3 px/ms con la hora del banco, pero a 3,44 con la hora del cuadro (el tope es 3,96). Pasaba después de B13 y empezó a fallar después de B9 y B10. Hay que mirarla en un build.
6. **Ojo, archivo compartido con el sitio vivo:** B11 suma una prop opcional, `overrides`, a `src/modules/chatbot/components/LogicCompanion.tsx` para el chat sin 3D. Es aditiva y `/` sigue cargando, pero hay que revisarla antes de mergear.
7. **Controles de banco ciegos**, o sea comprobaciones que solo valen en verde:
   - `preloader.ts` `CONTROL=en-recargas`;
   - `viaje.ts` `CONTROL=sin-tapar`;
   - `aro-legibilidad.ts`, el control al 30 % con la medida del núcleo.
8. **Lo primero que tiene que mirar Valentino:** `/v3?preloader=si` (la entrada del día), `/v3` entero de arriba abajo a 1440 (Servicios, el Panel, las reseñas, el CTA, el FAQ al fondo) y `/v3/pagina-base` (el color desde el arranque, el cierre y las grietas).
9. **Antes de mergear a `rediseno/home`:** borrar o mover `logic-core-v3/docs/cola/2026-10-22/` del checkout principal. Está sin trackear y choca con esta rama.

## Por tarea: el estado, los commits y lo medido (todo en el dev, placa NVIDIA)

| Tarea | Estado | Commits (merge) | Medido |
|---|---|---|---|
| **T0** (pendientes de B12a.8) | integrada y verificada | `a13ac4ea`…`222656ff` (`4332fcb9`) + `20c226f5` | `velo.ts` 3/3 en las 4 vías, 0 cuadros en blanco; píldora 2,8–3,9 px/ms; `chrome-en-los-anchos` 0 fallas, sin «isReady» ni NaN; color desde el primer cuadro; cuerpo de la base ok; `verificar` vuelve a la base |
| **B7** (el login como demo) | integrada y verificada | `decd55a0` (`20a9430c`) | `ingreso.ts` 24/25 (547 ms del Genie, \|Δy\| = 0, flecha, Esc, escena dormida); control `scroll` rojo. Falla: a 390 entrando directo el fundido dura ~550 ms (objetivo 200) |
| **B1.2e** (el carrusel abajo de 1024) | integrada y verificada | `5b93773b`, `06b66881` (`53169678`) + `6ed4aa3f` | `carrusel.ts` 43/44 (la que falta era el banco); controles `trampa` y `sin-pausa-fuera` rojos. Arreglos del orquestador: `data-pieza` chocaba con el carrusel de Demos y la hora del reinicio en el banco |
| **B4** (Servicios) | integrada y verificada | `473d1016`, `cd787804`, `1cc74766` (`0958549f`) + `a897b02e` | `servicios-gatillos` 16/16 (control `sin-candado` rojo); `servicios-capa` 4/4, 0 px de nanobots sobre el título y el panel (control `capa-a-destiempo` rojo); alto viejo abajo de 1024 medido por el orquestador. Falla: a 390 con `?servicios-movil=gatillo` la rueda saltea la entrada |
| **B12c** (el preloader) | integrada y verificada | `aa734fd4`, `e0fe86ca`, `b4c59ce1` (`99c2f6af`) | `preloader.ts` ok a 1440 y 1024 (5,7 s, la punta a 24,0 px = el radio, el bloqueo, no aparece en recargas ni el mismo día); a 390 el banco falla por cómo lee la `y`, pero a mano rueda y dedo quedan bloqueados; control `sin-bloqueo` rojo, `en-recargas` ciego; con `LENTO=6` no se llega al freno ni al pulso; los bancos de siempre no lo ven |
| **B12b** (el viaje desde Servicios) | integrada y verificada | `6f355d92`, `7343ec6d` (`48ba9510`) + `23465d73` | `viaje.ts` 2/2 (1440 y 390): 0 cuadros en blanco, la cámara y la noche en 1, el logo en su hueco a 0,28 %, los sonidos sale → llega; controles `velo` y `sin-hueco` rojos, `sin-tapar` ciego |
| **B5** (Demos) | integrada y verificada | `01964739`, `f40a554c`, `0d0e90d3` (`219a693c`) | `demos-parada` 12/12; controles `sin-parada` y `parada-sin-llegada` rojos; foto del abanico 3D y del hover |
| **B2 + B3** (el aro de reseñas y el CTA) | revertidas, arregladas y reintegradas | `4ad48208`, `2047e714`, `ba7039d2`, `436404fa` (`cd04d271`) | `aro-legibilidad` 8,95 y 10,28:1 en las de adelante; `aro-costo` 0,1 ms de mediana y 0,2 p95, el p95 del cuadro igual (13,7 contra 13,6); fotos de las tarjetas con texto y de B3 (HABLANOS y el anillo en el piso) |
| **B6** (el Panel) | revertida, arreglada y reintegrada | `af4e53ca`, `fc916b7d`, `5ed4a1ab` (`728717d0`) + `a7840f71` | `panel-b6` todo en verde a 1440 y 1024 (eje 0,00 %, `?grupo=` exacto, el cartel, el candado abierto); alto viejo abajo de 1024 calibrado contra lo medido |
| **B11** (el chat) | integrada y verificada | `0fc98782` (`126c8a53`) | el chat llega a los 11 s, sin el velo y con la escena preparada; no pisa el chrome a 1440, 860 ni 390; control `chat-al-centro` rojo. En la consola sale «`<circle>` attribute r» del `PulseAvatar` del sitio vivo |
| **B8** (el moiré) | integrada y verificada | `c6ef6348` (`16e3781a`) | suites de la escena en verde; `moire-costo`: la trama gruesa ~0,05 ms y la fina ~0,06 ms por cuadro, control verde |
| **B13** (el cierre de cada página) | integrada y verificada | `06e365e9`…`491e5ab2` (`4d05835c`) + `cabd0ebd` | `cierre-de-pagina` 2/2 (1440 y 390); control `sin-resolucion` rojo; foto del pie calmo en la base |
| **B9** (las grietas) | integrada y verificada | `31ca1a77`, `732e31cc` (`3d3da6c3`) + `582e3593` (el enganche del home) + `1fe72690` | la página las dispara en las 3 variantes con el acento; se forman en 1,5 s y quedan 1,0 s oscuras; costo del muro ≤ 0,06 ms. En el home a 1440 la formación dura 1,85–1,97 s en el dev (el reloj frena los cuadros largos): a confirmar en un build |
| **B10** (el FAQ) | integrada y verificada | `3590a7d9`, `f5543e93`, `387536af` (`cfd56d41`) + `36a6b8b1` | `faq-del-pie` 4/4 (home y base, 1440 y 390); control `sin-hundimiento` rojo; 6 preguntas en el JSON-LD |

**Arreglos del orquestador al integrar:**
- la base de varios tramos (`492bd7d6`, `anotarTramo`);
- `armadas.ts` y `cuadroDelFinal.ts` sin engordar (s8);
- el control ciego de s47 (`3209d764`);
- los bancos `viaje.ts`, `panel-b6.ts`, `grietas.ts`, `faq-del-pie.ts` y `carrusel.ts`;
- los altos viejos de Tu panel y de Servicios, medidos en el navegador.

## Qué tiene que mirar Valentino (el dev de la integración: `cd C:\nocturno\2026-10-22\integracion\logic-core-v3`, `npm run dev`, `http://localhost:3000`)
1. **`/v3?preloader=si`, a 1440, 1024 y 390.**
   - La secuencia de 5–6 s: el negro, el blanco, la flecha punteada que termina en el botón del sonido.
   - Tocar «Recomendamos activar el sonido.» prende el sonido.
   - Banderas: `?preloader=si|no`.
2. **`/v3/pagina-base` a 1440, cargada directo.**
   - La noche y el acento desde el primer cuadro.
   - Las grietas, unos 2,4 s después del título.
   - Bajando: el cierre (Seis razones → HABLANOS → la resolución → el pie) y, al fondo, una rueda abre el FAQ.
   - Banderas: `?grietas=1|2|3|no`, `?grietas-prueba=si` y `?legibilidad=tamano`.
3. **`/v3` a 1440, de arriba abajo:**
   - **Portfolio:** sin cambios.
   - **Demos:** placas 3D, el hover y la parada.
   - **Servicios:** una muesca por servicio, el recomendador, `?diagonal=30|20|12`; el CTA hace el viaje a la página.
   - **El Panel:** el título se pinta, los módulos alternan, el candado de la rueda; `?grupo=final|union`.
   - **Las reseñas:** el aro; `?resenas=scroll|gatillo`, `?resenas-arrastre=si`.
   - **El CTA:** el cristal se agrieta.
   - **El pie y el FAQ.**
   - **El chat:** abajo a la derecha; `?chat=onda|monograma|geometrico`.
   - **El moiré:** quieto; `?moire=0|1|2|mouse`.
4. **«Login»:** el Genie y `?ingresar`.
5. **`/v3` a 390, 768 y 820×1180:**
   - el carrusel del Portfolio y el de Demos;
   - Servicios con `?servicios-movil=deslizar|gatillo`;
   - el Panel apilado, con `?palabra-movil=union|debajo`;
   - las reseñas en carrusel plano;
   - el FAQ en lista.
6. **Banderas de antes:** `?titulo=1…4`, `?composicion=1|2|3`, `?navbar=abajo`.

## Lo que no corrió y por qué
- **El `next build`:** lo cortó Claude Code por falta de memoria. Quedó un `.next-b12` a medias, ignorado por git; se puede borrar. Por eso no se midieron los números del build (la vía del velo, los 404, el fundido de B7, las grietas en el home).
- **La matriz entera de escritorio y la del teléfono:** solo corrió el humo después de cada merge (rueda, ráfaga, Demos y el carrusel a 390).
- **La regresión de la píldora hacia la página** (arriba) queda abierta.
- **Lo que queda para servicios (P-S):** cada página de servicio exporta su preset para el viaje, implementa `resolucion` en su variante, enciende la variante desde el avance 0 y pasa su FAQ a `<CierreDeLaPagina preguntas={…} />`.
- **La skill `pagina-home-based` quedó vieja.** `CONTRATO.md` todavía dice «el viaje todavía no construido» y «el pie provisorio». No la toqué.

## Comandos para la mañana
```
# 1) Antes del merge: sacar del checkout principal la copia sin trackear de la cola
#    (borrar o mover C:\rediseno-home\logic-core-v3\docs\cola\2026-10-22\)
cd C:\rediseno-home
git fetch origin
git switch rediseno/home
git merge --no-ff nocturno/2026-10-22
```
- Las ramas de tarea locales ya están borradas: estaban todas mergeadas.
- Queda solo el worktree de la integración, `C:\nocturno\2026-10-22\integracion`, para mirar. Para borrarlo:
  ```
  git -C C:\rediseno-home worktree remove C:\nocturno\2026-10-22\integracion
  ```
  Tiene su propio `node_modules`, así que no hay junction que cuidar.
- Las notas del orquestador y los diagnósticos están en `C:\nocturno\2026-10-22\` (`ESTADO.md`, `diag\`, los logs de `verificar`), fuera del repo.
