/**
 * LAS DEUDAS DECLARADAS DE B11 — el piso que mover el texto NO baja, con su
 * número por sección; la que B11 re-escribe como problema de luz; y el
 * instrumento por triplicado.
 *
 * B11 movió el texto de donde pasa el logo —Números entero a la mitad que el
 * logo deja libre (c7–c12), «Cómo trabajamos» y la primera persona de Quiénes
 * somos a c7–c10 con la foto en c3–c5, y el renglón del nombre de Trabajos
 * arriba de la captura— y volvió a medir las seis deudas de B8 con el
 * instrumento que las declaró, a 1440, 1920 y 2560 y a lo largo de TODO el
 * tramo de cada sección.
 *
 * ── Qué cierra y qué no, con la vara de la PARADA 1 ─────────────────────────
 *
 * **Una deuda del logo cierra cuando la estructura de la sala —el logo, su
 * sombra, la pared— pasa por detrás del texto el 0 % del tramo, en los tres
 * anchos.** Cuatro cierran así: D-B8.1 por el logo, D-B8.2, D-B8.5 y D-B8.6.
 * Ninguna cierra por AA, y no es que falte mover algo: abajo de la estructura
 * hay un PISO —las motas, las partículas que flotan por toda la sala— que
 * ninguna columna baja. Entre el 0,42 % y el 0,57 % del cuadro está bajo AA por
 * motas en cualquier instante (`motasDeAAMedia`, `outputs/b11/logo-*.json`), y
 * un bloque puede caer en 0 píxeles bajo AA en una captura y en 60 en la
 * siguiente sin que nadie mueva nada. Perseguir 0 px reales es tocar la escena
 * —la cantidad, el tamaño o la tinta de las partículas—, y eso lo decide el
 * humano, no este bloque. Por eso cada sección lleva su piso acá, con su
 * número, y las filas de `s10-acceso-escena.ts` que siguen abajo de AA por ese
 * piso corren como `deudaDeclarada` contra estas entradas, con la condición
 * intacta: el día que la escena lo baje, pasan a verde solas.
 *
 * ── Los dos instrumentos, y por qué son la misma vara que B8 ────────────────
 *
 *   · **Dónde está el logo a lo largo del tramo:** `scripts-b11/a-logo.ts`, la
 *     silueta cada 1/16 de pantalla, volcada al documento y partida en
 *     estructura (componentes de más de 400 px) y motas (400 px o menos),
 *     cruzada con la caja aterrizada de cada bloque (`e-cruce.ts`,
 *     `outputs/b11/cruce-{antes,despues}.json`).
 *   · **El peor píxel bajo el glifo:** `scripts-b11/b-bloques.ts`, que es
 *     `scripts-b8/c-las-ocho.ts` —máscara de glifo, lectores, ocultamiento y
 *     evaluación importados tal cual— en las mismas posiciones, en tres anchos,
 *     y con UN arreglo del instrumento: la pastilla de navegación se recorta de
 *     las cajas. B8 leía el texto de la pastilla como si fuera glifo del bloque
 *     que tenía debajo (los 540 px «bajo AA» a 1,00:1 de «Lo que se puede
 *     contar» en y=4050 eran la pastilla). Las cifras sin el recorte quedan en
 *     `outputs/b11/sin-recorte/` para que la comparación sea revisable.
 *
 * Las cifras completas: `docs/rediseno/outputs/B11-ACOMODAMIENTO.md`.
 */

import { DEUDAS_DE_B8, type DeudaDeclarada } from './deudas-b8'

export const DEUDAS_DE_B11 = {
  motasHero: {
    numero: 'D-B11.1',
    que: 'Hero — nada se movió y nada había que mover: el logo pasa por detrás de sus 6–7 bloques el 0 % del tramo en los tres anchos (17 paradas por ancho, cruce-*.json). Los 2–5 bloques bajo AA por captura son motas: peor 2,56–2,94:1 con 6–20 px de glifo bajo AA de 10.191. El piso: 0,42–0,45 % del cuadro bajo AA por motas en promedio, 0,56–0,58 % en la peor parada',
    cierre: 'no es de composición: baja sólo si la escena cambia sus partículas (cantidad, tamaño o tinta), y eso lo decide el humano con el número a la vista. Hasta entonces la fila del hero corre como deuda contra esta entrada',
  },
  motasQuienesSomos: {
    numero: 'D-B11.2',
    que: 'Quiénes somos — con «Cómo trabajamos» y la primera persona en c7–c10 y la foto en c3–c5, el logo pasa por detrás de los 17–18 bloques el 0 % del tramo en los tres anchos (65 paradas por ancho). Bajo AA queda el piso de motas: 0,54–0,57 % del cuadro en promedio, 0,66–0,74 % en la peor parada; el peor es «Trabajamos desde Tucumán…», 2,26:1 con 60 px de 7.015, y los 11–16 bloques bajo AA por ancho fallan por 5 a 60 píxeles cada uno. La palanca de la tinta (PARADA 2 de B11) se usó en las dos piezas que iban a opacity-casi: «Tucumán, Argentina» y el rótulo «Qué hace en un proyecto» al 0,6 daban 1,75–1,97:1 con TODO su glifo bajo AA (494 de 494 px, mediana 4,06–4,30: el 0,6 sobre el gris de la pared quedaba al borde entero); a plena dan 2,60 · 3,98 · 2,69 y 2,37 · 2,64 · 2,48 (1440 · 1920 · 2560) con mediana 7,4–13,2 y 5–21 px bajo AA de 534–647: lo que queda son motas, igual que en el resto. La celosía de la pared bajo la segunda persona sigue ahí (19–23 % de su caja alguna vez, 1 % del tiempo). Costo del movimiento: la foto vuelve al ancho que B1 descartó y reabre ~310 px de hueco (PARADA 1 de B11, decisión 3)',
    cierre: 'el piso, sólo con la escena (decide el humano): la palanca de la tinta ya se usó y lo que dejó son partículas, 5–21 px por bloque',
  },
  motasNumeros: {
    numero: 'D-B11.3',
    que: 'Números — con la composición entera en c7–c12 (rótulo, cabecera y las cinco cifras; cinco arranques de columna en cuatro valores, 7 · 9 · 8 · 10 · 7), el logo pasa por detrás de las 13 cajas el 0 % del tramo en los tres anchos (81 paradas por ancho). La única lectura con logo debajo, a 2560, es el «03» de sección que Seccion.tsx pinta en la costura (1 px arriba del borde, 12 px de alto): no es una celda, y sus 13 capturas pasan AA (peor 5,25). Bajo AA queda el piso —0,45–0,48 % del cuadro en promedio, 0,61–0,65 % en la peor parada; peor a tinta plena 2,06:1 ([CIFRA] a 2560, 5 px de 4.587) y en tinta media 1,01:1 («Proyectos entregados» a 1440, 65 px de 509)— y la última cifra bajo el atardecer, que es la mitad de D-B8.1 que sigue abierta por el modelo. Lo que se perdió: la amplitud, de 1.220 a 594 px a 1440',
    cierre: 'el piso, sólo con la escena (decide el humano). El atardecer sobre «Procesos automatizados» NO se sube a la fila 1: ahí su aterrizaje deja 1,47 pantallas hasta Trabajos contra el gate de 1,33 de B9 — el ritmo tiene gate y la cifra no (PARADA 1 de B11, decisión 2)',
  },
  motasTrabajos: {
    numero: 'D-B11.4',
    que: 'Trabajos — la noche: el logo no pasa nunca por detrás de sus 9 bloques (0 % en los tres anchos, 33 paradas a oscuras por ancho), y la franja de piso iluminado que a 1920 dejaba «Lo que cambió», «[MÉTRICA]», «El Garage» y «Banú» en 2,04–3,82:1 con el 85,7–100 % de su caja bajo AA ya no toca el renglón del nombre, que va arriba de la captura (3,62–4,75:1, 0 % bajo AA). Lo que queda son las partículas que brillan bajo la tinta clara: 0,45–0,53 % del cuadro en promedio, 0,48–0,58 % en la peor parada; peor 3,62:1 («El Garage» en tránsito, 7 px de 554) y 3,78:1 a plena',
    cierre: 'el piso, sólo con la escena (decide el humano): las partículas que brillan son de B8 (particleGlow.ts) y no se apagan desde una columna',
  },
  diferencialPared: {
    numero: 'D-B5.1',
    que: 'Por qué develOP — el cuerpo sobre la pared, RE-ESCRITO COMO PROBLEMA DE LUZ. B11 midió el tramo entero: el cuerpo y los cuatro bloques tienen el 92–100 % de su caja bajo AA alguna vez y el 18–49 % del tiempo, con el logo debajo el 0 %: la estructura que falla es la pared de la sala a nivel 0,643, no el logo. A 1440 el peor píxel es 1,03–1,11:1 y a plena da lo mismo. La palanca de la tinta no existe: los 14 bloques aterrizados ya están en #111111 a alfa 1. Moverlos de columna no cambia lo que hay detrás, porque detrás hay pared en las doce',
    cierre: 'con la luz —el nivel del amanecer en el ancla del diferencial (0,643) o la sala detrás de esa pantalla— y lo decide el humano; el nivel del titular no se toca (PARADA 1 de B11, decisión 4)',
  },
  instrumentoDuplicado: {
    numero: 'D-B11.5',
    que: 'El instrumento del contraste vive por triplicado: scripts-b6/, scripts-b8/ y ahora scripts-b11/ (b-bloques.ts reimplementa c-las-ocho.ts para agregar el 2560, el recorte de la pastilla y las cajas por posición, importando de scripts-b8/ la máscara, los lectores y la evaluación). b8-comun.ts declaraba que las copias de B8 se borraban al mergear las ramas, y no se borraron. El recorte de la pastilla —el defecto del instrumento de B8 que leía la pastilla como glifo— está arreglado SÓLO en la copia de B11',
    cierre: 'unificar las tres copias en un banco —una sola máscara de glifo, un solo evaluador, el recorte de la pastilla adentro—, fuera del scope de B11 por decisión de la PARADA 1: se declara con número y no se unifica acá',
  },
} as const satisfies Record<string, DeudaDeclarada>

/**
 * Las dos listas en UN registro: es lo que consumen las filas de
 * `s10-acceso-escena.ts`. B8 sigue siendo el dueño de sus seis números y B11 de
 * los suyos; ninguna clave se repite.
 */
export const DEUDAS_DECLARADAS = { ...DEUDAS_DE_B8, ...DEUDAS_DE_B11 } as const

export const LISTA_DE_DEUDAS_DE_B11: readonly DeudaDeclarada[] = Object.values(DEUDAS_DE_B11)
