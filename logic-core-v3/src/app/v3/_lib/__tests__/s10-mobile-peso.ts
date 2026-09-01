/**
 * §10 DEL INVARIANTE DE MOBILE — EL PESO QUE BAJA ABAJO DE 1025, sobre el build
 * que ya existe.
 *
 * Sale del invariante en SITIO-S11, cuando el archivo cruzó las 300 líneas. El
 * corte es por tema y por DEPENDENCIA: es la única sección que lee el disco de
 * `.next` en vez del marcado renderizado, y la única que puede quedar sin correr
 * porque el build no exista.
 */

import { existsSync, statSync } from 'node:fs'
import path from 'node:path'

import { pisoDelFramework } from '../../../../components/layout/carga-diferida/__tests__/soporte'

import { afirmar, afirmarIgual, noCorre, titulo } from './afirmar'
import { HUECOS } from './s10-banco'
import { DIST, conjuntoInicial, contiene, kib, pesar } from './s3-bundle'
import { leer } from './s5-archivos'

export function afirmarElPeso(): void {
  titulo('10 · El peso que baja abajo de 1025 — sobre el build que ya existe')

  const ID = path.join(DIST, 'BUILD_ID')
  if (!existsSync(ID)) {
    noCorre('el peso de la carga inicial de /v3', `no existe ${DIST}: este frente tiene PROHIBIDO correr un build`)
  } else {
    console.log(`  build leído: ${leer('.next/BUILD_ID').trim()} · manifiesto del ${statSync(path.join(DIST, 'build-manifest.json')).mtime.toISOString()}`)
    const inicial = conjuntoInicial('/v3')
    const piso = pisoDelFramework(DIST)
    const sobre = inicial.filter((f) => !piso.includes(f))
    const home = conjuntoInicial('/')
    const propios = sobre.filter((f) => !home.includes(f))
    afirmar(inicial.length > 0, `la carga inicial de /v3 son ${inicial.length} archivos y ${kib(pesar(inicial).gzip)} gzip`)
    afirmar(pesar(sobre).gzip / 1024 < 300, `SOBRE EL PISO —lo que este repo puede mover— ${kib(pesar(sobre).gzip)} gzip en ${sobre.length} archivos, abajo del techo de 300`)
    console.log(`  PISO del framework (se publica, no se afirma): ${kib(pesar(piso).gzip)} en ${piso.length} archivos, de los cuales ${kib(pesar(piso.filter((f) => contiene(f, 'browserTracingIntegration'))).gzip)} son el SDK de Sentry (§7.30: NO se difiere).`)
    console.log(`  de los ${sobre.length} de arriba del piso, ${sobre.length - propios.length} (${kib(pesar(sobre.filter((f) => home.includes(f))).gzip)}) también los pide \`/\`: son del layout RAÍZ. Propios de /v3: ${propios.length} archivos, ${kib(pesar(propios).gzip)}.`)
    for (const f of [...sobre].sort((x, y) => pesar([y]).gzip - pesar([x]).gzip)) {
      console.log(`    ${kib(pesar([f]).gzip).padStart(10)}  ${home.includes(f) ? 'heredado' : 'DE /v3  '}  ${f}`)
    }
    const three = sobre.filter((f) => contiene(f, 'THREE.') || contiene(f, 'react-three-fiber'))
    afirmarIgual(three, [], 'la ESCENA no viaja en la carga inicial: cero chunks con three o r3f — la compuerta de 1025 hace su trabajo')
    const coreografia = sobre.filter((f) => contiene(f, 'InstaladorDeCoreografia'))
    afirmarIgual(coreografia, [], '  y el instalador de coreografía tampoco: entra por `dynamic(..., { ssr: false })`')
    const lenis = sobre.filter((f) => contiene(f, 'lenis'))
    const motion = sobre.filter((f) => contiene(f, 'framer'))
    console.log(
      `  ⚠️ HALLAZGO DE PESO CON DUEÑO AJENO [gravedad baja · dueño: \`components/layout/SmoothScroll.tsx\` y el layout RAÍZ] — ${lenis.length} chunk(s) con Lenis, ` +
        `${kib(pesar(lenis).gzip)} gzip, viajan en la carga inicial de /v3 **en todos los anchos**, y \`SmoothScroll\` se sale de /v3 por \`pathname.startsWith("/v3")\`: ` +
        `es peso que ninguna rama de /v3 puede usar nunca. Y el candidato obvio NO lo es: los ${kib(pesar(motion).gzip)} gzip del sistema de motion ` +
        `(${motion.join(', ')}) los pide \`/\` también, o sea que entran por el layout raíz. Diferirlos abajo de 1025 desde este track NO baja un byte de esta ruta.`,
    )
  }
  for (const h of HUECOS.filter((x) => ['LCP', 'Lighthouse'].includes(x.nombre))) {
    noCorre(`${h.nombre} de /v3 abajo de 1025`, `${h.porQue}. Lo cerraría: ${h.queLoCerraria}`)
  }
}
