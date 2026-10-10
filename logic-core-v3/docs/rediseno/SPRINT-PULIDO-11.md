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
- PENDIENTE: A2 · Quiénes somos a 1024 (la frase se solapa con el logo; el invariante de J1 no lo vio) y el último renglón del
  cuerpo cortado a 1024 y 1280
- PENDIENTE: A3 · mobile, el cartel de Portfolio corrido y cortado (J7 a 375 y 390: por scroll, por menú, desde el CTA)
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
