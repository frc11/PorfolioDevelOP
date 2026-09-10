/**
 * EL ARNÉS DE `s21-llave` — las entradas fabricadas y el corredor del guardián.
 *
 * Vive afuera del invariante por la razón de siempre: **este archivo contiene a
 * propósito lo que el lane tiene prohibido escribir** —casillas mal formadas,
 * una fuente de llave con la constante duplicada, cifras sin declarar— porque
 * son las entradas equivocadas contra las que se prueba cada regla. Es la misma
 * razón por la que `_invariantes/soporte.ts` está fuera del escaneo.
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import type { Invento } from '../../_secciones/_contrato/inventado'
import { RAIZ } from '../../_secciones/_invariantes/soporte'
import { MarcaDeLaLlave } from '../../_secciones/_contrato/MarcaDeLaLlave'
import { textoVisible } from '../../_secciones/_contrato/escaneo'
import { CONTENIDO_INVENTADO } from '../../_secciones/_contrato/llave'
import { marcar } from '../../_secciones/_invariantes/render'
import { leer } from '../../_secciones/_invariantes/soporte'

import { afirmar, afirmarIgual, titulo } from './afirmar'

const LAYOUT = 'src/app/v3/layout.tsx'

/** El guardián que corre como `prebuild`. Node pelado: no depende del build. */
export const GUARDIAN = 'scripts/llave-contenido-inventado.mjs'

/**
 * El ambiente mínimo, armado desde cero y no heredado. `NODE_ENV` va en
 * `production` porque es el ambiente que este guardián existe para custodiar.
 */
const AMBIENTE_MINIMO = {
  PATH: process.env.PATH ?? '',
  SystemRoot: process.env.SystemRoot ?? '',
  NODE_ENV: 'production',
} as const

export interface Corrida {
  readonly codigo: number
  readonly salida: string
}

/**
 * Corre el guardián contra una fuente de llave, con el ambiente que se le pase.
 *
 * ⚠ El ambiente se arma DESDE CERO con lo mínimo —`PATH`, y lo que el caso
 * agregue— y no heredando `process.env`: la máquina que corre esto puede tener
 * `CI` puesto por otra cosa, y entonces el caso "sin entorno de deploy" estaría
 * midiendo la máquina en vez del guardián.
 */
export function correrElGuardian(fuente: string | null, ambiente: Record<string, string> = {}): Corrida {
  const carpeta = mkdtempSync(path.join(tmpdir(), 's21-llave-'))
  try {
    const ruta = path.join(carpeta, 'llave.ts')
    if (fuente !== null) writeFileSync(ruta, fuente, 'utf8')
    const r = spawnSync(process.execPath, [path.join(RAIZ, GUARDIAN), ruta], {
      cwd: RAIZ,
      encoding: 'utf8',
      env: { ...AMBIENTE_MINIMO, ...ambiente },
    })
    return { codigo: r.status ?? -1, salida: `${r.stdout ?? ''}${r.stderr ?? ''}` }
  } finally {
    rmSync(carpeta, { recursive: true, force: true })
  }
}

/** El mismo guardián, contra el archivo de verdad del árbol. */
export function correrElGuardianSobreElArbol(ambiente: Record<string, string> = {}): Corrida {
  const r = spawnSync(process.execPath, [path.join(RAIZ, GUARDIAN)], {
    cwd: RAIZ,
    encoding: 'utf8',
    env: { ...AMBIENTE_MINIMO, ...ambiente },
  })
  return { codigo: r.status ?? -1, salida: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/** Las fuentes fabricadas: una por modo de falla que el guardián tiene que ver. */
export const FUENTES_DE_LLAVE = {
  prendida: 'export const CONTENIDO_INVENTADO: boolean = true\n',
  apagada: 'export const CONTENIDO_INVENTADO: boolean = false\n',
  sinLaConstante: 'export const OTRA_COSA: boolean = true\n',
  duplicada:
    'export const CONTENIDO_INVENTADO: boolean = true\nexport const CONTENIDO_INVENTADO: boolean = false\n',
  soloEnUnComentario: '/** export const CONTENIDO_INVENTADO: boolean = false */\nexport const X = 1\n',
} as const

/**
 * CASILLAS MAL FORMADAS — una por regla de `INVENTOS`, para probar que la regla
 * no está ciega. Ninguna existe en el producto y ninguna puede existir: son el
 * control positivo de cada afirmación de §3.
 */
export const CASILLAS_ROTAS = {
  sinMarcadorEnElPedido: { marcador: '[CIFRA]', pedido: 'el dato', mentira: 'veintitres' },
  lasDosCarasIguales: { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: '[CIFRA]' },
  mentiraVacia: { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: '   ' },
  mentiraConMarcadorAdentro: { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: 'casi [CIFRA]' },
} as const satisfies Record<string, Invento>

/** Dos casillas donde una mentira es subcadena de la otra: la restauración
 *  dejaría de ser una función del texto y pasaría a depender del orden. */
export const CASILLAS_QUE_SE_PISAN: readonly Invento[] = [
  { marcador: '[CIFRA]', pedido: '[CIFRA]', mentira: 'nueve' },
  { marcador: '[MÉTRICA]', pedido: '[MÉTRICA]', mentira: 'nueve de cada diez' },
]

/**
 * UNA CIFRA QUE NADIE DECLARÓ, adentro de una frase con la forma de las del
 * sitio. Es el control que prueba que la resta de `sinLoInventado` es una lista
 * cerrada de literales y no una amnistía a los números.
 */
export const CIFRA_SIN_DECLARAR = 'Entregamos 47 proyectos el año pasado.'

/**
 * ⚠️ LOS DOS MECANISMOS, AFIRMADOS — la marca en pantalla y el guardián del
 * build.
 *
 * Salieron del invariante cuando cruzó las 300 líneas. **Se mudó el bloque: no
 * se tocó una afirmación.** El corte es por tema: §1 a §6 miran la LISTA y la
 * restauración —datos y texto—; estos dos miran los dos MECANISMOS que la
 * instrucción pide, y ninguno de los dos se puede comprobar sin salir del
 * proceso (uno renderiza un componente, el otro lanza un `node`).
 */
export function afirmarLaMarcaYElGuardian(): void {
  // ═══════════════════════════════════════════════════════════════════════════
  titulo('7 · La marca visible: prendida se ve, apagada NO EXISTE')

  const conMarca = marcar(<MarcaDeLaLlave llave={true} />, { anima: false })
  afirmarIgual(
    marcar(<MarcaDeLaLlave llave={false} />, { anima: false }),
    '',
    '⚠️ con la llave APAGADA la marca no emite un solo elemento: no es un `hidden`, no existe',
  )
  afirmar(conMarca.includes('data-pieza="marca-de-la-llave"'), 'con la llave prendida emite su pieza')
  afirmar(
    /contenido inventado/i.test(textoVisible(conMarca)),
    '  y dice, con todas las letras, que las cifras son falsas',
    textoVisible(conMarca).slice(0, 64),
  )
  afirmar(
    conMarca.includes('fixed') && conMarca.includes('pointer-events-none'),
    '  `fixed` y sin eventos de puntero: no suma alto de documento ni tapa un clic — el progreso sale de `scrollHeight` y no se mueve un bit',
  )
  afirmarIgual([...conMarca.matchAll(/<h[1-6]\b/g)].length, 0, '  no es un encabezado: el árbol de encabezados de las ocho no cambia')
  afirmarIgual([...conMarca.matchAll(/\srole="/g)].length, 0, '  y no es un landmark: el censo de regiones tampoco')
  afirmarIgual(
    marcar(<MarcaDeLaLlave />, { anima: false }) === '',
    !CONTENIDO_INVENTADO,
    '  y sin argumento se comporta como diga la constante del árbol',
  )
  afirmar(
    leer(LAYOUT).includes('<MarcaDeLaLlave />'),
    'el layout de /v3 la monta — y va ahí y no en `page.tsx` porque `page.tsx` es un archivo PROHIBIDO por la frontera de S3',
  )

  // ═══════════════════════════════════════════════════════════════════════════
  titulo('8 · ⚠️ EL BUILD DE PRODUCCIÓN FALLA CON LA LLAVE PRENDIDA')

  const MEDIR = { MEDIR_CON_LA_LLAVE_PRENDIDA: '1' }
  const CASOS: readonly { que: string; corrida: () => Corrida; espera: 'pasa' | 'falla' }[] = [
    { que: 'la llave APAGADA deja construir', corrida: () => correrElGuardian(FUENTES_DE_LLAVE.apagada), espera: 'pasa' },
    { que: '⚠️ la llave PRENDIDA hace fallar el build', corrida: () => correrElGuardian(FUENTES_DE_LLAVE.prendida), espera: 'falla' },
    { que: 'sin la constante FALLA: un renombre no lo deja pasar en silencio', corrida: () => correrElGuardian(FUENTES_DE_LLAVE.sinLaConstante), espera: 'falla' },
    { que: 'con la constante DUPLICADA falla: no elige una', corrida: () => correrElGuardian(FUENTES_DE_LLAVE.duplicada), espera: 'falla' },
    { que: 'con la declaración sólo adentro de un comentario, falla', corrida: () => correrElGuardian(FUENTES_DE_LLAVE.soloEnUnComentario), espera: 'falla' },
    { que: 'y si el archivo no existe, falla', corrida: () => correrElGuardian(null), espera: 'falla' },
    { que: 'prendida + la salida de medición, en una máquina de desarrollo: pasa, con su cartel', corrida: () => correrElGuardian(FUENTES_DE_LLAVE.prendida, MEDIR), espera: 'pasa' },
    { que: '⚠️ prendida + la salida + NETLIFY: FALLA — un deploy no tiene salida', corrida: () => correrElGuardian(FUENTES_DE_LLAVE.prendida, { ...MEDIR, NETLIFY: 'true' }), espera: 'falla' },
    { que: '  lo mismo con VERCEL', corrida: () => correrElGuardian(FUENTES_DE_LLAVE.prendida, { ...MEDIR, VERCEL: '1' }), espera: 'falla' },
    { que: '  y con CI', corrida: () => correrElGuardian(FUENTES_DE_LLAVE.prendida, { ...MEDIR, CI: 'true' }), espera: 'falla' },
  ]
  for (const c of CASOS) {
    const r = c.corrida()
    afirmar(c.espera === 'pasa' ? r.codigo === 0 : r.codigo !== 0, c.que, `exit ${r.codigo}`)
  }

  const sobreElArbol = correrElGuardianSobreElArbol()
  afirmarIgual(
    sobreElArbol.codigo !== 0,
    CONTENIDO_INVENTADO,
    `⚠️ contra el ÁRBOL DE VERDAD el guardián y TypeScript dicen lo mismo: la llave está ${CONTENIDO_INVENTADO ? 'prendida y `npm run build` NO pasa' : 'apagada y el build pasa'}`,
  )
  afirmar(
    leer('package.json').includes(`"prebuild": "node ${GUARDIAN}"`),
    '  y está enganchado como `prebuild`: `npm run build` lo corre solo, acá y en el deploy',
  )
  afirmar(
    leer('netlify.toml').includes('npm run build'),
    '  el comando que `netlify.toml` declara termina en `npm run build`, así que el guardián corre allá también',
  )
  if (sobreElArbol.codigo !== 0) {
    console.log(
      sobreElArbol.salida
        .split('\n')
        .slice(1, 7)
        .map((l) => `  │${l}`)
        .join('\n'),
    )
  }

}
