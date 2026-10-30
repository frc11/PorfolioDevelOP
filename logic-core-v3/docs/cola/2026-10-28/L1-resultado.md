# L1 · resultado

Commits: 2da961f0 (barra + contacto), e1a9288c (≠, placa, loma), f50cb206 (grietas), más dos ajustes (pastilla centrada a 769; pie del hero, banco, test de esquinas). El plan se escribió con el lote ya en marcha (L1-plan.md).

## Por ítem
1. **Barra desde 769: hecho.** Medido con Playwright (fotos `C:\nocturno\cola3-fotos\L1\navtop-i-769.png`, `nav-f-*.png`): a 769, 840, 1023, 1024, 1279 y 1280 `data-modo="barra"`, sin solape y sin scroll horizontal; a 768, 390 y 320 hamburguesa. De 769 a 1279 la pastilla y la esquina se compactan (12 px, menos aire). Parlante, botón del movimiento y pie del hero siguen el corte. Sin verificar: tablet real con tacto.
2. **Contacto en el teléfono: hecho.** A 320, 360, 375, 390 y 768 ningún elemento del diálogo pasa del panel (`contacto-g-*.png`, 0 desbordes medidos). El desenfoque y la entrada ya eran de C2-22; no se tocaron.
3. **≠ de una pieza: hecho, con poca evidencia.** Las dos mitades se pasan 1,5 grosores del centro en el 3D. Lo vi en un cuadro a 1440, no con zoom ni desde varios ángulos.
4. **Loma del piso: hecho (código y test), no visto con el mouse.** Vuelve por defecto. Grietas: sacadas (disparadores, `?grietas=`, shader, muro, tests, banco). Home y Portfolio cargan sin errores (1440 con Chrome real, 390 sin errores de consola).
5. **Esquinas de la placa del contacto: hecho.** Eran los costados de CSS 3D, corridos `--radius-medio` de cada punta. Cuatro caras en diagonal las cierran (`placa-d-*.png`, seis posiciones del mouse). Test nuevo con control en s25.

## Gate
- `tsc --noEmit`: 0 errores. ESLint sin errores en lo tocado (1 warning viejo en velo.ts).
- `npm run verificar`: 14 pasos con falla; los míos se arreglaron (s3-tokens, s10-acceso, s62, s73, s76, s77, s78-c2-81, s87) y vuelven a verde. Quedan sin tocar los que piden `next build` (s1, s2, s3-peso, s4-heredado, s5-peso, s7-compuerta, s8-tres, s8-peso, s8-chrome por chunks) y s4-cobertura, s17-revelado, s17-marca, s8-montaje: no los toca este lote, **no verificado contra la base** (no corrí la base antes de cambiar).
- Humo del home en 1440 y 390: ida a Portfolio/Servicios y vuelta sin errores; el pasaje con rueda a Demos no verificado (swiftshader se colgó en la captura).
- Revisión independiente (Sonnet): 3 hallazgos, los tres arreglados (pie del hero en `max-medio`, banco con el nombre viejo del defecto, falta de test de esquinas). El de pastilla/parlante: medido, a 769 el parlante termina en 64 y la pastilla empieza en 162.

## Decisiones
- L1-1: usé la variante existente `hasta-tablet` (769, de `--breakpoint-hasta-tablet`) como corte mínimo; el nombre confunde pero no agrega token.
- L1-2: `barra.css` entra a la lista de CSS con media declarada (s3-tokens), con su motivo.
- L1-3: la loma vuelve sin tocar el sombreado. Las rayas oscuras que C2-31m atribuyó a esa loma pueden volver junto al cursor; no lo medí. Si vuelven, bajar la altura de la loma, no sacarla.
- L1-4: el botón del movimiento se esconde desde 769 (choca con Contacto/Login).
- L1-5: placeholders acortados: «Un rango», «ana@tuempresa.com», «Ana Pérez», «Tu Empresa», «Que la gente nos encuentre»; huellas de s76-b y s77-ph retomadas a propósito.
- L1-6: los borrados de las grietas entraron en el commit 1/3 (`git rm` indexado se cuela); el árbol compila desde el 3/3.
- L1-7: `ENGANCHE_DE_LAS_GRIETAS` queda vacío (lo usa s83).

## Supuestos y descartes
- Supuse que «placa del contacto» es la de CSS 3D del formulario principal (no hay captura; `lote2/13` es otra cosa).
- Descarté anclar la pastilla a la izquierda: centrada entra a 769.
- No toqué Portfolio (L2).

## Qué tiene que mirar Valentino
1. `/v3` a 769, 1024 y 1280: barra de escritorio completa, sin hamburguesa; a 768 hamburguesa.
2. «Contacto» abierto a 320 y 390: todo entra en el panel.
3. «Contacto» a 1440 moviendo el mouse por los bordes: las esquinas de la placa sin huecos (el tono de las esquinas es un poco más claro que el costado).
4. Mouse sobre el piso: la loma sube; si aparecen rayas oscuras horizontales, avisar.
Flags: ninguna nueva. `__defectosDeLaIntro='sin-loma'` solo del banco.
