#!/usr/bin/env node
/**
 * ⚠️ LA COMPROBACIÓN DE LANZAMIENTO — el build de produccion FALLA si la llave
 * del contenido inventado esta prendida.
 *
 *     node scripts/llave-contenido-inventado.mjs [ruta-del-modulo-de-la-llave]
 *
 * Corre solo: esta enganchado como `prebuild` en `package.json`, asi que
 * `npm run build` lo ejecuta antes de que webpack arranque, y el deploy tambien
 * —el comando declarado en `netlify.toml` termina en `npm run build`—.
 *
 * ── Por que node pelado y no `tsx` ────────────────────────────────────────
 *
 * Porque tiene que correr en el entorno del deploy, donde no hay garantia de
 * que las dependencias de desarrollo esten instaladas. `scripts/check-env.js`
 * ya sienta el precedente: la comprobacion que corre antes del build no puede
 * depender de nada que el build instale.
 *
 * ── ⚠️ Por que lee el FUENTE y por que eso no es una segunda copia ────────
 *
 * No puede importar el modulo: es TypeScript. Asi que lee el archivo y busca la
 * constante. Eso seria una copia peligrosa si el modo de falla fuera "no la
 * encuentro y sigo": la regla es la contraria — **si no encuentra la constante,
 * FALLA**. Un renombre, un borrado o un archivo movido dan rojo, no verde. La
 * unica forma de que este script pase es que alguien haya escrito `false`.
 *
 * `s21-llave` lo corre contra tres fuentes fabricadas —prendida, apagada y sin
 * la constante— y contra el archivo real, y compara el codigo de salida con el
 * valor que el propio TypeScript importa. Los dos lados tienen que coincidir.
 *
 * ── ⚠️ La salida de emergencia, y por que no la puede usar un deploy ──────
 *
 * `MEDIR_CON_LA_LLAVE_PRENDIDA=1` deja pasar el build con la llave prendida.
 * Existe por una razon concreta y acotada: **el presupuesto de peso del lane se
 * mide sobre el build**, y sin un build con la llave prendida no hay forma de
 * decir cuanto pesa la llave. Con ella puesta el script escribe un cartel de
 * cuatro renglones en la salida del build.
 *
 * Y **no funciona en un entorno de deploy**: con `NETLIFY`, `VERCEL` o `CI` en
 * el ambiente, la llave prendida falla y no hay variable que lo evite. Para
 * publicar esto habria que editar `netlify.toml`, que es un archivo commiteado
 * y revisado. Eso es un mecanismo; acordarse no lo es.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const RUTA_POR_DEFECTO = 'src/app/v3/_secciones/_contrato/llave.ts'
const NOMBRE = 'CONTENIDO_INVENTADO'
const SALIDA = 'MEDIR_CON_LA_LLAVE_PRENDIDA'
const ENTORNOS_DE_DEPLOY = ['NETLIFY', 'VERCEL', 'CI']

/**
 * La declaracion, sin comentarios: un `//` o un docblock no la puede simular.
 *
 * La expresion es un LITERAL y no se arma con `NOMBRE` adentro: una expresion
 * armada con cadenas se rompe callada si alguien toca un escape. El nombre se
 * usa igual en los mensajes, y las dos puntas se atan abajo — si dejaran de
 * hablar del mismo simbolo, el script muere antes de mirar nada.
 */
const RE_DECLARACION = /export\s+const\s+CONTENIDO_INVENTADO\s*(?::\s*boolean\s*)?=\s*(true|false)\b/g

if (!RE_DECLARACION.source.includes(NOMBRE)) {
  console.error(`la expresion de este script no busca \`${NOMBRE}\`: una de las dos puntas se renombro`)
  process.exit(1)
}

function valorDeLaLlave(fuente) {
  const sinComentarios = fuente.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')
  const declaraciones = [...sinComentarios.matchAll(RE_DECLARACION)]
  if (declaraciones.length !== 1) return { valor: null, cuantas: declaraciones.length }
  return { valor: declaraciones[0][1] === 'true', cuantas: 1 }
}

function morir(lineas) {
  console.error('')
  console.error('  ' + '='.repeat(74))
  for (const linea of lineas) console.error('  ' + linea)
  console.error('  ' + '='.repeat(74))
  console.error('')
  process.exit(1)
}

const relativa = process.argv[2] ?? RUTA_POR_DEFECTO
const ruta = path.isAbsolute(relativa) ? relativa : path.join(RAIZ, relativa)

let fuente
try {
  fuente = readFileSync(ruta, 'utf8')
} catch {
  morir([
    'LA LLAVE DEL CONTENIDO INVENTADO NO SE PUDO LEER.',
    '',
    `No existe o no se puede abrir: ${relativa}`,
    'Esta comprobacion falla cuando no encuentra la llave, y es a proposito: un',
    'build que no puede saber si el contenido es falso no es un build que se pueda',
    'publicar.',
  ])
}

const { valor, cuantas } = valorDeLaLlave(fuente)

if (valor === null) {
  morir([
    `NO SE ENCONTRO \`${NOMBRE}\` EN ${relativa}` + (cuantas > 1 ? ` (hay ${cuantas})` : ''),
    '',
    'Se esperaba exactamente una linea de la forma:',
    `    export const ${NOMBRE}: boolean = true|false`,
    '',
    'Si la constante se renombro o se movio, hay que actualizar este script Y',
    '`s21-llave`, que compara los dos lados. Mientras tanto, esto FALLA: no hay',
    'forma de saber si el sitio lleva cifras inventadas adentro.',
  ])
}

if (valor === false) process.exit(0)

const deploy = ENTORNOS_DE_DEPLOY.filter((v) => process.env[v] !== undefined && process.env[v] !== '')

if (deploy.length === 0 && process.env[SALIDA] === '1') {
  console.log('')
  console.log('  ' + '#'.repeat(74))
  console.log(`  #  BUILD CON LA LLAVE PRENDIDA — ${SALIDA}=1`)
  console.log('  #  Este build lleva cifras, metricas y un testimonio INVENTADOS adentro.')
  console.log('  #  Sirve para medir el peso de la llave. NO SE PUBLICA.')
  console.log('  ' + '#'.repeat(74))
  console.log('')
  process.exit(0)
}

morir([
  'BUILD DE PRODUCCION CON CONTENIDO INVENTADO ADENTRO. NO SE PUBLICA.',
  '',
  `\`${NOMBRE}\` esta en \`true\` (${relativa}).`,
  'Con la llave prendida el sitio muestra cifras, metricas y un testimonio que',
  'NADIE MIDIO: son inventos de B12 §4 para poder ver la pagina poblada.',
  '',
  'develOP ya tiene deuda publicada por cifras fabricadas. Este build no la suma.',
  '',
  'Para publicar:',
  `    poner \`export const ${NOMBRE}: boolean = false\``,
  '    Vuelven los marcadores ([CIFRA], [METRICA], [TESTIMONIO]) y no se pierde nada:',
  '    lo inventado queda escrito en `_contrato/inventado.ts`, casilla por casilla.',
  '',
  'Para medir el peso de la llave, fuera de un deploy:',
  `    ${SALIDA}=1 npm run build`,
  deploy.length > 0
    ? `    (no disponible aca: el ambiente declara ${deploy.join(', ')} — un deploy no tiene salida)`
    : '    (sirve solo en una maquina de desarrollo, y lo dice en la salida del build)',
])
