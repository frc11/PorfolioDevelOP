/**
 * LOS CINCO PATRONES DE PIEZAS — P4, P5, P7, P8 y P9.
 *
 * Once instancias entre los cinco: son pocos usos, y son parte del sistema
 * igual. P7 además es el mecanismo con el que van a entrar los proyectos en la
 * sección de Trabajos, así que su valor no se mide por cuántas veces aparece en
 * la referencia.
 *
 * Los tipos y el registro están en `patrones.ts`; acá están los datos.
 */

import { ANCLAS } from './anclas'
import type { Patron } from './patrones'

/**
 * P4 — LA LISTA QUE ENTRA DESDE ABAJO. 4 instancias, todas en services.
 *
 * Once `li` que suben 100 px REALES —no un porcentaje de sí mismos— y aparecen
 * desde opacidad 0, en `power4.out`: la quíntica, la curva más frenada de todo el
 * sitio. Arranca disparada y se posa. Es el único uso de `power4` del corpus.
 *
 * ⚠ La instrucción no declara escalonado para este patrón; SCROLL.md mide 0,2.
 */
export const P4: Patron = {
  id: 'P4',
  nombre: 'lista frenada',
  instancias: 4,
  anclas: ANCLAS.P4,
  scrub: true,
  curva: 'salida-fuerte',
  duracionDeclarada: 2,
  escalonado: 0.2,
  claves: [
    { clave: 'y', desde: 100, hasta: 0 },
    { clave: 'opacity', desde: 0, hasta: 1 },
  ],
  piezas: { min: 11, max: 11, nota: 'once li' },
  elementos: 'li',
  efecto: 'los ítems entran desde 100 px abajo, muy frenados al final',
  discrepancia: 'la instrucción no declara escalonado; SCROLL.md §9.7 mide 0,2',
}

/**
 * P5 — LA APARICIÓN CON CRECIMIENTO. 3 instancias, una por página.
 *
 * El único patrón LINEAL del sitio: sus tweens declaran `ease: "none"`
 * explícitamente. A velocidad constante y atado al scroll, que es lo que hace que
 * se sienta como un control de volumen y no como una animación.
 *
 * ⚠ Su ancla es la única que puede dar un rango NEGATIVO: `top top+=20%` →
 * `bottom bottom-=40%` mide `alto − 0,4·viewport`. Necesita un elemento más alto
 * que el 40 % del viewport. Ver `anclas.ts`.
 * ⚠ La instrucción no declara duración; SCROLL.md mide 1 s en los hijos.
 */
export const P5: Patron = {
  id: 'P5',
  nombre: 'crecimiento lineal',
  instancias: 3,
  anclas: ANCLAS.P5,
  scrub: true,
  curva: 'lineal',
  duracionDeclarada: 1,
  escalonado: 0,
  claves: [
    { clave: 'scale', desde: 0.8, hasta: 1 },
    { clave: 'opacity', desde: 0, hasta: 1 },
  ],
  piezas: { min: 1, max: 1, nota: 'un div' },
  elementos: 'div',
  efecto: 'el bloque crece desde el 80 % y aparece, a velocidad constante',
  discrepancia: 'la instrucción no declara duración; SCROLL.md §9.7 mide 1 s (en los hijos)',
}

/**
 * P7 — LA SECUENCIA 3D. 2 instancias, 36 tweens autorales.
 *
 * El único lugar donde el sitio usa timelines, y **el mecanismo con el que van a
 * entrar los proyectos** en la sección de Trabajos. Planos que entran desde
 * `translateZ: −3000` y salen hacia `+1000`, con `autoAlpha` 0→1→0, `scale`
 * 0,6→1 y `pointerEvents` conmutando para que lo que está lejos no sea
 * clickeable. Dos curvas conviviendo: `power1.out` para las entradas y
 * `power1.in` para las salidas.
 *
 * Es todo CSS 3D sobre el DOM: la constancia B4.5 de SCROLL.md resolvió las 12
 * rutas contra el DOM vivo y las 12 son `Element`, ninguna es `Object3D`, todas
 * con `matrix3d(...)` y `perspective: 1000px` en un ancestro.
 *
 * ⚠ DECIDIDO, no medido: el reparto de la ventana entre llegada y salida. Lo
 * medido es la banda de duraciones (0,5 a 3 s), las dos curvas, el escalonado
 * (0,4) y los extremos. Que la llegada ocupe 3 s y la salida 0,5 —los dos
 * extremos de la banda— es una lectura de que la entrada es el gesto y la salida
 * el descarte. Queda como hueco.
 */
export const P7: Patron = {
  id: 'P7',
  nombre: 'planos en profundidad',
  instancias: 2,
  anclas: ANCLAS.P7,
  scrub: true,
  curva: 'principal',
  duracionDeclarada: 3.5,
  escalonado: 0.4,
  claves: [],
  tramos: [
    {
      nombre: 'llegada',
      desde: 0,
      hasta: 3 / 3.5,
      curva: 'principal',
      claves: [
        { clave: 'translateZ', desde: -3000, hasta: 0 },
        { clave: 'autoAlpha', desde: 0, hasta: 1 },
        { clave: 'scale', desde: 0.6, hasta: 1 },
      ],
      pointerEvents: { inicial: 'none', final: 'auto' },
    },
    {
      nombre: 'salida',
      desde: 3 / 3.5,
      hasta: 1,
      curva: 'entrada',
      claves: [
        { clave: 'translateZ', desde: 0, hasta: 1000 },
        { clave: 'autoAlpha', desde: 1, hasta: 0 },
        { clave: 'scale', desde: 1, hasta: 1 },
      ],
      pointerEvents: { inicial: 'auto', final: 'none' },
    },
  ],
  piezas: { min: 12, max: 12, nota: '12 rutas ancladas resueltas contra el DOM vivo' },
  elementos: 'div, h2, img, a — DOM, no objetos de three.js',
  efecto: 'los planos vienen desde muy atrás, llegan, y siguen de largo hacia adelante',
  perspectivaPx: 1000,
}

/**
 * P8 — EL VUELO DE 32 PIEZAS. 1 instancia, en studio. La más elaborada del sitio.
 *
 * 32 targets que arrancan en `translateZ(-3000px) scale(0.3)`, girados 60° en X,
 * 80° en Y y 45° en Z, opacidad 0, y aterrizan planos, a tamaño natural y
 * opacos. `scrub: 2` —dos segundos de inercia, el más alto del sitio— le da un
 * arrastre pesado. 2 s declarados que con el desparramo se vuelven 8,2 s.
 *
 * ⚠ La instrucción no declara curva; SCROLL.md mide `power1.out`.
 */
export const P8: Patron = {
  id: 'P8',
  nombre: 'vuelo de piezas',
  instancias: 1,
  anclas: ANCLAS.P8,
  scrub: 2,
  curva: 'principal',
  duracionDeclarada: 2,
  escalonado: 0.2,
  claves: [
    { clave: 'translateZ', desde: -3000, hasta: 0 },
    { clave: 'scale', desde: 0.3, hasta: 1 },
    { clave: 'rotationX', desde: 60, hasta: 0 },
    { clave: 'rotationY', desde: 80, hasta: 0 },
    { clave: 'rotationZ', desde: 45, hasta: 0 },
    { clave: 'opacity', desde: 0, hasta: 1 },
  ],
  piezas: { min: 32, max: 32, nota: '32 targets' },
  elementos: 'div',
  efecto: 'las piezas llegan volando desde el fondo, girando en los tres ejes',
  perspectivaPx: 1000,
  discrepancia: 'la instrucción no declara curva; SCROLL.md §9.7 mide power1.out',
}

/**
 * P9 — EL CRECIMIENTO DE LA GRILLA. 1 instancia, en studio.
 *
 * 18 piezas que pasan de escala 0,4 y opacidad 0 a su tamaño natural, con 0,1 s
 * entre una y otra, en `power2.inOut`: el único uso de esa curva en todo el
 * corpus. Sin desplazamiento ni rotación, solo escala.
 *
 * ⚠ La instrucción no declara curva ni duración; SCROLL.md mide `power2.inOut` y
 * 2 s.
 */
export const P9: Patron = {
  id: 'P9',
  nombre: 'grilla que crece',
  instancias: 1,
  anclas: ANCLAS.P9,
  scrub: 1,
  curva: 'simetrica-suave',
  duracionDeclarada: 2,
  escalonado: 0.1,
  claves: [
    { clave: 'scale', desde: 0.4, hasta: 1 },
    { clave: 'opacity', desde: 0, hasta: 1 },
  ],
  piezas: { min: 18, max: 18, nota: '18 piezas' },
  elementos: 'div',
  efecto: 'las piezas crecen desde el 40 % mientras aparecen',
  discrepancia:
    'la instrucción no declara curva ni duración; SCROLL.md §9.7 mide power2.inOut y 2 s',
}
