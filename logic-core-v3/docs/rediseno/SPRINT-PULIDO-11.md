# SPRINT PULIDO 11 — la verificación pendiente, los forms definitivos, la caída del logo, el pie simétrico, mobile, hilos y giroscopio

Rama `rediseno/home`. Invariante nuevo: `npm run test:s62-pulido-11` (`src/app/v3/_lib/__tests__/s62-pulido-11.invariant.tsx`).
Bancos: `~/.cache/b4-medicion/pulido-11/_scripts/` (fuera del repo: Tailwind 4 escanea todo lo que `.gitignore` no excluye).
Entregas (hojas): `docs/rediseno/entregas/pulido-11/`.

Aprobados (no se tocan): J1 (1024), J3 (el loader en el botón), J8 (el pie 25/50/25 como idea), Demos (llega bien), la carga
con GIRO. El túnel no se toca (k = 1,8). `src/app/v3/_lib/motion/lente.ts` figura modificado sin cambios de contenido (sólo
el fin de línea): no entra en ningún commit.

## Estado (fuente de verdad: si la sesión se corta, se retoma desde acá)

Leyenda: PENDIENTE · EN CURSO · HECHO (commit) · VISTO sí/no.

### Fase A · lo que quedó sin ver de PULIDO 10, más bugs nuevos
- HECHO: A1 · J2, el cuadrado negro de Contacto, con `Page.startScreencast` — VISTO sí. Causa medida (no hipótesis): con las
  cinco caras pintadas de colores puros, a 1440 desde el hero y desde Portfolio, en los cuadros del compositor de ~378 a
  ~406 ms la cara de ATRÁS asomaba como un rectángulo chico en el medio (la hoja todavía sin rasterizar y la placa lejos, en su
  viaje). Era el cuadrado negro (la cara era de tinta hasta PULIDO 10; con el papel quedaba un rectángulo claro). Arreglo: las
  caras están desde el montaje (el espesor de s49) pero ocultas hasta que el viaje terminó (`llego`). Después: 0 cuadros con
  una cara a la vista en el viaje (antes, 2 y 1); con el mouse a un costado el espesor se ve. A 390 la placa está apagada (sin
  caras). `s62` A1
- HECHO: A2 · Quiénes somos: el titular sobre el logo y el último renglón del cuerpo — VISTO sí.
  - Por qué J1 no lo vio: su instrumento medía sólo el REPOSO (el destino del viaje de la barra). Barriendo la ENTRADA
    (`a2-quienes.ts`, cada 48–60 px, el mismo detector) el titular 3D cruzaba el logo entre ~330 y ~90 px antes del reposo, a
    1024 × 768, 1280 × 800, 1366 × 768, 1440 × 900 y 1920 × 1080 (no sólo a 1024): sube desde abajo del cuadro hasta arriba del
    logo, que en la entrada ya está en el medio. El tramo libre (arriba del logo) es corto: 30–90 px antes del reposo.
  - Arreglo (`esquivaDelLogo.ts`): mientras la sección entra, un título con `esquivaElLogo` pide 0 si su caja cruza la del logo
    proyectado (muestras de sus vértices); libre, llega con un mínimo de 0,9 s (la llegada se ve entera aunque el tramo sea
    corto). Las cuatro partes del titular esquivan con la caja del bloque (con la de cada una, «Queremos hacer» y «no» llegaban
    solos: visto en el banco y corregido). En el reposo no esquiva nada (lo que la composición deja ahí es lo que se ve).
  - El cuerpo: su bloque usa la ventana visible, que termina cuando su pie sube 240 px sobre el borde; en el reposo su pie queda
    a ~36 px y llegaba con el 48 % de la ventana: el último renglón a media máscara (a 1024 y 1280, y en todos los anchos de
    escritorio). Lo que llega al canal termina cuando el pie toca el borde (`llegadaHastaElPie`); la ventana no se tocó (el viaje
    del menú la lee para su reposo).
  - Recibos: `docs/rediseno/entregas/pulido-11/solapes-entrada-*.json` (cinco cuadros, NVIDIA): cero solapes de que la sección
    asoma al reposo. `s62` A2.
  - Fuera de alcance, anotado: en la SALIDA (camino a «El equipo», de +38 a +422 px a 1024) el logo de canto cruza el cuerpo.
- HECHO: A3 · mobile, el cartel de Portfolio corrido y cortado — VISTO sí. J7 se verificó a 375 y 390 llegando por scroll, por
  el menú y desde el CTA del hero (`a3-portfolio.ts`, cuadros del compositor): el cartel llega entero, sin recorte, y la página
  no se puede correr de costado (`a3b-desborde.ts`: scrollWidth = ancho en 13 alturas). Lo «corrido a la izquierda y cortado»
  era la HUIDA hacia el túnel (pasado el reposo): el cartel va de margen a margen y su `translateZ` lo agranda desde el centro;
  a ~1,2× («ortfolio», «ada uno de estos…») la opacidad todavía era ~0,7. Abajo de 1024 se desvanece al ritmo de su
  agrandamiento (0 justo cuando tocaría el borde); la pose del túnel no cambió (el túnel no se toca). Después, a 390: con el
  borde en [−1, 391] la opacidad ya es 0. `s62` A3
- PENDIENTE: A4 · J9 b (el velo de noche en Quiénes somos, medido), g (WhatsApp a 375), e (el CTA abajo de 1024 en 3D,
  función del scroll) y «Seis razones» punteado en mobile
- PENDIENTE: A5 · J10, el polvo con un toque, en el banco

### Fase B · los forms definitivos (pie y modal): volteo, éxito y error
- PENDIENTE: B1 · el salto del volteo (`?volteo=centrado|columpio`), geometría al montar, cuadros < 20 ms
- PENDIENTE: B2 · éxito: ENCAJA (`?exito=`)
- PENDIENTE: B3 · error: NO ENCAJA, el rojo como token con AA, Reintentar con todo intacto, el logo de carga en el error
- PENDIENTE: B4 · los rótulos del botón se suceden (invariante)
- PENDIENTE: B5 · el loader gira sobre el palito de la P; sin cuadrado negro ni parpadeo
- PENDIENTE: B6 · autocompletado (simulado) y el form limpio al terminar el éxito

### Fase C · el pie simétrico y la cabecera mobile
- PENDIENTE: C1 · columnas del mismo ancho, distancias iguales al logo, «El recorrido» en una grilla, «Por qué develOP» a 1024
- PENDIENTE: C2 · la cabecera mobile: sonido izquierda, menú centro, progreso derecha, mismo tamaño y eje

### Fase D · el logo se cae y encastra
- PENDIENTE: D · `?caida=lenta|angulo`, física de cuerpo rígido, hueco sincronizado, impacto = golpe, rebobinado, reinicio

### Fase E · hilos de energía (`?hilos=si`)
- PENDIENTE

### Fase F · giroscopio (`docs/rediseno/GIROSCOPIO.md` + `?giroscopio=si`)
- PENDIENTE

### Fase G · verificación exhaustiva
- PENDIENTE

## Memoria (antes de cada fase: disponible y no paginado)

| Cuándo | Disponible | No paginado | Nota |
|---|---|---|---|
| Al empezar (PC recién reiniciada, sin dev server) | 4437 MB | 653 MB | Commit 10,5 / 27,0 GB |

## VERIFICAR TRAS REINICIO

(vacío)

## Lo que no quedó bien

(se completa al cierre)
