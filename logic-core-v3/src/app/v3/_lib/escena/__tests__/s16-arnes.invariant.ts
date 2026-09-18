/**
 * INVARIANTE — EL ARNÉS NO ESCRIBE LA LENTE A MANO.
 *
 *     npx tsx src/app/v3/_lib/escena/__tests__/s16-arnes.invariant.ts
 *     npm run test:s16-arnes
 *
 * ── El defecto que cierra ──────────────────────────────────────────────────
 *
 * `probe-escena/__tests__/harness.ts` copiaba `CAMERA_FOV = 35`,
 * `FRAME_TRAVEL_SAFETY = 0,88`, la caja de 7,168 y el `FLOOR_Y` entero
 * (`-(0.007 * 1024) / 2 - 0.72`) **a mano y sin guardián**. De esa copia cuelgan
 * dieciséis instrumentos —`s10-logo` y `s16-encuadre` incluidos, o sea los que
 * juzgan el encuadre del Hero—, así que un fov movido en `probeScene.ts` y no
 * en el arnés dejaba a esa familia entera **verde midiendo la lente vieja**.
 *
 * La razón escrita de la copia —*«se repite acá para no arrastrar three»*— era
 * falsa: `probeScene.ts` no importa `three`; su única importación es
 * `@/lib/logo-footprint`, que no importa nada. Lo que arrastra `three` es
 * `cameraFraming.ts`, que es otro archivo. **La copia se borró** y este
 * invariante existe para que no vuelva.
 *
 * ── El patrón es el de `lente.ts` + `s19-lente.invariant.ts` ───────────────
 *
 * Con una diferencia que hay que decir: en `lente.ts` el espejo TIENE que
 * existir —ese módulo viaja en el chunk inicial de /v3 y paga el techo de
 * `s5-peso`—, así que su guardián afirma que los dos valores coinciden. Acá la
 * copia no tenía razón de existir, así que se fue, y **una afirmación
 * `FOV === CAMERA_FOV` sería una identidad por construcción**: lo que se afirma
 * es otra cosa, en dos frentes que sí discriminan —el fov RECUPERADO de la
 * proyección del sitio (§1) y el FUENTE del arnés (§2)—.
 *
 * ── Lo que NO mide, y es a propósito ──────────────────────────────────────
 *
 * **La FÓRMULA del recorrido de encuadre tiene su propio censo.** ENCUADRE-1
 * cerró la copia del arnés —`cameraAt` le pide el recorrido a `encuadre.ts`— y
 * queda una sola, la de `scene-camera.ts`, que es el preloader del sitio vivo.
 * Eso lo censa `lib/scene-encuadre-deuda.ts` §8, con sus cuatro roles. Acá se
 * miden VALORES, no fórmulas, para no escribir el mismo censo dos veces.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { lineasDeCodigo } from '../../__tests__/s8-largos'
import { CHOREO_KEYFRAMES } from '../choreography'
import { CAMERA_FOV, ORBIT_TARGET_Y } from '../probeScene'
import { projectScenePoint, sceneCameraAt } from '@/lib/scene-camera'
import { FOV, TAN_HALF_V } from '@/app/probe-escena/__tests__/harness'

const RAIZ = process.cwd()
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')
const codigoDe = (rel: string): string => lineasDeCodigo(leer(rel)).join('\n')

const ARNES = 'src/app/probe-escena/__tests__/harness.ts'
const VENTANA = { ancho: 1440, alto: 810 } as const

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · EL FOV, RECUPERADO DE LA PROYECCIÓN DEL SITIO — no de una igualdad')

/**
 * `projectScenePoint` publica `pxPerWorld = alto / (2 · tan(fov/2) · profundidad)`,
 * así que de una proyección real del sitio se puede DESPEJAR el tangente que la
 * cámara de producción está usando, sin que ese número esté exportado en ningún
 * lado. Compararlo con el `TAN_HALF_V` del arnés ata las dos lentes por dos
 * caminos independientes: uno lo deriva, el otro lo proyecta.
 */
const POSE_DE_ENTRADA = CHOREO_KEYFRAMES[0].pose
const camaraDelSitio = sceneCameraAt(POSE_DE_ENTRADA, VENTANA.ancho, VENTANA.alto)
afirmar(camaraDelSitio !== null, 'hay cámara del sitio en la pose de entrada')

const proyectado =
  camaraDelSitio === null
    ? null
    : projectScenePoint(camaraDelSitio, [0, ORBIT_TARGET_Y, 0], VENTANA.ancho, VENTANA.alto)
afirmar(proyectado !== null, '  y el origen de la escena cae adelante de esa cámara')

const tanDelSitio =
  proyectado === null ? Number.NaN : VENTANA.alto / (2 * proyectado.pxPerWorld * proyectado.depth)

afirmar(
  Math.abs(TAN_HALF_V - tanDelSitio) < 1e-12,
  'el `TAN_HALF_V` del arnés ES el tangente que la proyección del sitio usa',
  `${TAN_HALF_V.toFixed(12)} contra ${tanDelSitio.toFixed(12)} despejado de \`pxPerWorld\``,
)
controlPositivo(
  'el detector vería una lente de otro fov: no compara el tangente contra sí mismo',
  CAMERA_FOV + 1,
  (fov: number) => Math.abs(Math.tan(((fov / 2) * Math.PI) / 180) - tanDelSitio) < 1e-12,
)
afirmarIgual(FOV, CAMERA_FOV, '  y el `FOV` del arnés es `CAMERA_FOV` — hoy, por consumirlo')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL FUENTE DEL ARNÉS — ni un número de la lente escrito a mano')

const FUENTE_DEL_ARNES = codigoDe(ARNES)

/**
 * Las cuatro firmas de la copia que se borró, cada una con la forma EXACTA que
 * tenía en el archivo. No se busca el número suelto —`35` y `0.88` aparecen en
 * cualquier lado— sino la DECLARACIÓN: un nombre de la lente igualado a su
 * literal.
 *
 * ⚠ **Las firmas están atadas al VALOR de hoy, y eso las hace parciales a
 * propósito: §1 tapa la otra mitad.** Una copia que vuelva con el mismo número
 * la ve §2 (la firma matchea); una que vuelva con OTRO número se le escapa a §2
 * y la ve §1, porque ahí el tangente del arnés deja de ser el que proyecta el
 * sitio. Medido: con `export const FOV = 36` en el arnés, §2 sigue en verde y
 * §1 se pone en rojo con las dos cifras al lado. Entre las dos no queda hueco.
 */
interface FirmaDeCopia {
  readonly clave: string
  readonly patron: RegExp
  /** Una línea que la firma TIENE que reconocer: el control positivo. */
  readonly ejemplo: string
}

const FIRMAS: readonly FirmaDeCopia[] = [
  { clave: 'fov', patron: /\w*fov\w*\s*=\s*35\b/i, ejemplo: 'export const FOV = 35' },
  {
    clave: 'seguridad',
    patron: /FRAME_TRAVEL_SAFETY\s*=\s*0\.88/,
    ejemplo: 'export const FRAME_TRAVEL_SAFETY = 0.88',
  },
  {
    clave: 'piso',
    patron: /0\.007\s*\*\s*1024/,
    ejemplo: 'export const FLOOR_Y = -(0.007 * 1024) / 2 - 0.72',
  },
  { clave: 'caja', patron: /\b7\.168\b/, ejemplo: 'export const LOGO_W = 7.168' },
]

for (const firma of FIRMAS) {
  afirmar(
    !firma.patron.test(FUENTE_DEL_ARNES),
    `el arnés no escribe \`${firma.clave}\` a mano`,
    String(firma.patron),
  )
}
controlPositivo(
  'las cuatro firmas reconocen la línea que borraron: ninguna está ciega',
  FIRMAS.map((f) => f.ejemplo).join('\n'),
  (texto: string) => FIRMAS.every((f) => !f.patron.test(texto)),
)

afirmar(
  /from '@\/app\/v3\/_lib\/escena\/probeScene'/.test(FUENTE_DEL_ARNES),
  '  y los consume: importa de `probeScene.ts`',
)
afirmar(
  /from '@\/lib\/logo-footprint'/.test(FUENTE_DEL_ARNES),
  '  y la caja, de `logo-footprint.ts`',
)
afirmar(
  !/from 'three'|from "three"/.test(FUENTE_DEL_ARNES),
  '  sin arrastrar `three`, que era la razón escrita de la copia',
)
controlPositivo(
  'el detector de `three` no está ciego',
  "import * as THREE from 'three'",
  (texto: string) => !/from 'three'|from "three"/.test(texto),
)

/**
 * Y la razón de la copia era falsa, comprobado sobre el fuente: `probeScene.ts`
 * no importa `three`, y `logo-footprint.ts` no importa NADA. Ésta es la
 * afirmación que autoriza el borrado, y la que se pondría en rojo el día que
 * alguien meta `three` en la fuente —ahí la copia volvería a tener sentido—.
 */
afirmar(
  !/from 'three'/.test(codigoDe('src/app/v3/_lib/escena/probeScene.ts')),
  '`probeScene.ts` no importa `three`: la razón escrita de la copia era falsa',
)
afirmarIgual(
  codigoDe('src/lib/logo-footprint.ts').match(/^import\b/gm) ?? [],
  [],
  '  y `logo-footprint.ts` no importa nada — la cadena entera es three-free',
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL CENSO — quién MÁS escribe un valor de la lente, en todo el lane')

/**
 * ⚠ Se enumeran las EXCLUSIONES con su motivo, no los archivos aplicados: un
 * censo que cuenta lo que cumple se rompe cuando el lane crece por una razón
 * legítima, y no dice cuáles. Un archivo nuevo que escriba la lente a mano y no
 * esté declarado acá pone esto en rojo solo.
 *
 * **`scripts-b<N>` queda afuera**: son bancos de sprint, no del lane, y los
 * cuatro que tocan la cámara importan el arnés, así que heredan el arreglo.
 */
const RAICES_DEL_BARRIDO: readonly string[] = [
  'src/app/probe-escena',
  'src/app/v3/_intro',
  'src/app/v3/_lib/escena',
  'src/app/v3/_lib/motion',
  'src/components/layout/home-intro',
  'src/lib',
]

interface DuenoDeclarado {
  readonly ruta: string
  readonly clave: string
  readonly motivo: string
}

/**
 * ⚠ **ESTE ARCHIVO SE ENCUENTRA A SÍ MISMO, Y SE DECLARA EN VEZ DE EXCLUIRSE.**
 * §7.25: un escáner que lee texto lee también el texto que lo describe — las
 * cuatro líneas de `FIRMAS.ejemplo` son literalmente las que el arnés borró. No
 * se lo saca del barrido: se lo declara con sus cuatro claves, y así la segunda
 * afirmación de abajo comprueba que los fixtures del control positivo SIGUEN
 * estando. Un detector cuyo fixture desapareció es un detector ciego.
 */
const FIXTURES = 'src/app/v3/_lib/escena/__tests__/s16-arnes.invariant.ts'

const DUENOS: readonly DuenoDeclarado[] = [
  ...FIRMAS.map((firma) => ({
    ruta: FIXTURES,
    clave: firma.clave,
    motivo: 'FIXTURE del control positivo de §2: la línea que el arnés borró, escrita acá para probar que la firma la reconoce',
  })),
  {
    ruta: 'src/app/v3/_lib/escena/probeScene.ts',
    clave: 'fov',
    motivo: 'ES la fuente: acá vive `CAMERA_FOV`',
  },
  {
    ruta: 'src/app/v3/_lib/escena/probeScene.ts',
    clave: 'seguridad',
    motivo: 'ES la fuente: acá vive `FRAME_TRAVEL_SAFETY`',
  },
  {
    ruta: 'src/lib/logo-footprint.ts',
    clave: 'caja',
    motivo:
      'ES la fuente de la caja, y NO puede derivarla de `PROBE_SVG_SCALE`: `probeScene.ts` la importa a ella, así que sería un ciclo. §5 comprueba que las dos cuentas cierran',
  },
  {
    ruta: 'src/app/v3/_lib/motion/lente.ts',
    clave: 'fov',
    motivo:
      'ESPEJO declarado — viaja en el chunk inicial de /v3 (techo de `s5-peso`) y su guardián es `s19-lente.invariant.ts` §1',
  },
]

function* archivosDe(dir: string): Generator<string> {
  for (const nombre of readdirSync(path.join(RAIZ, dir))) {
    const rel = `${dir}/${nombre}`
    if (statSync(path.join(RAIZ, rel)).isDirectory()) {
      yield* archivosDe(rel)
      continue
    }
    if (/\.tsx?$/.test(nombre)) yield rel
  }
}

const hallazgos: string[] = []
let archivosBarridos = 0
for (const raiz of RAICES_DEL_BARRIDO) {
  for (const rel of archivosDe(raiz)) {
    archivosBarridos += 1
    const codigo = lineasDeCodigo(leer(rel)).join('\n')
    for (const firma of FIRMAS) {
      if (firma.patron.test(codigo)) hallazgos.push(`${rel} · ${firma.clave}`)
    }
  }
}
const declarados = DUENOS.map((d) => `${d.ruta} · ${d.clave}`)
for (const dueno of DUENOS) console.log(`  declarado: ${dueno.ruta} · ${dueno.clave} — ${dueno.motivo}`)

afirmarIgual(
  hallazgos.filter((h) => !declarados.includes(h)).sort(),
  [],
  `ningún archivo del lane escribe un valor de la lente sin estar declarado — ${archivosBarridos} archivos barridos en ${RAICES_DEL_BARRIDO.length} raíces`,
)
afirmarIgual(
  declarados.filter((d) => !hallazgos.includes(d)).sort(),
  [],
  '  y los cuatro declarados siguen escribiéndolo: una exclusión que sobrevive a su razón es un agujero que parece una decisión',
)
controlPositivo(
  'el barrido no está ciego: con el arnés de vuelta en la lista, el sobrante aparece',
  `${ARNES} · fov`,
  (falso: string) => declarados.includes(falso),
)

cerrar('s16-arnes')
