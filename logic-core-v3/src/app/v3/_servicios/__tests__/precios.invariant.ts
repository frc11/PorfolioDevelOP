/**
 * INVARIANTE — SERVICIOS S1a · LOS PRECIOS «DESDE» Y SU FORMATO.
 *
 *     npx tsx src/app/v3/_servicios/__tests__/precios.invariant.ts
 *
 * Que `PRECIOS_DESDE` se DERIVE de los datos y salga completo; que `precios.ts` se pueda importar sin arrastrar el
 * template (ni `.tsx`, ni react, ni next, ni `proyectos.ts`); y que `formato.ts` no deje pasar un número inventado
 * donde falta un dato. Cada comprobación lleva su control positivo.
 *
 * Todavía no lo cablea ningún script de `package.json` (P-H7): se corre a mano.
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../_lib/__tests__/afirmar'
import { IA_Y_AUTOMATIZACIONES } from '../datos/ia-y-automatizaciones'
import { MARCADOR_A_DEFINIR, textoOMarcador, usd, usdOMarcador } from '../formato'
import { PRECIOS_DESDE, precioDesde, precioDesdeDe } from '../precios'
import type { PrecioDesde } from '../precios'
import { SLUGS_DE_SERVICIO } from '../tipos'
import type { Plan, Precio } from '../tipos'

const RAIZ = process.cwd()

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · PRECIOS_DESDE: 200 único · 1.000 único · 49 mensual')

const ESPERADO = {
  'paginas-web': { usd: 200, periodo: 'unico' },
  'software-a-medida': { usd: 1000, periodo: 'unico' },
  'ia-y-automatizaciones': { usd: 49, periodo: 'mensual' },
}
afirmarIgual(PRECIOS_DESDE, ESPERADO, 'los tres «desde» son los del SPEC')

const esUnPrecio = (p: PrecioDesde | null): boolean =>
  p !== null && Number.isFinite(p.usd) && p.usd > 0 && (p.periodo === 'unico' || p.periodo === 'mensual')
afirmar(SLUGS_DE_SERVICIO.every((slug) => esUnPrecio(precioDesde(slug))), 'precioDesde(slug) devuelve un precio (usd finito y mayor que 0) para cada servicio, nunca null')
const EN_CERO: PrecioDesde = { usd: 0, periodo: 'unico' }
const INFINITO: PrecioDesde = { usd: Infinity, periodo: 'mensual' }
controlPositivo('el detector VE un null', null, esUnPrecio)
controlPositivo('  y un cero', EN_CERO, esUnPrecio)
controlPositivo('  y un infinito', INFINITO, esUnPrecio)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · se deriva de los datos: no se escribe a mano')

const PLAN_MAS_BARATO: Plan = { nombre: 'Prueba', mensual: 19, conversaciones: 100, soporte: 'Estándar', cambiosWeb: 'Solo ediciones chicas', funcionalidades: null }
const IA_PRECIO: Precio = IA_Y_AUTOMATIZACIONES.precio
const IA_CON_UN_PLAN_MAS_BARATO: Precio = IA_PRECIO.tipo === 'planes' ? { ...IA_PRECIO, planes: [PLAN_MAS_BARATO, ...IA_PRECIO.planes] } : IA_PRECIO
const elMinimoEs49 = (p: Precio): boolean => precioDesdeDe(p).usd === 49

afirmar(elMinimoEs49(IA_PRECIO), 'con los planes del SPEC, el mínimo es 49')
afirmarIgual(precioDesdeDe(IA_CON_UN_PLAN_MAS_BARATO), { usd: 19, periodo: 'mensual' }, '  con un plan más barato, el mínimo es ese')
controlPositivo('el detector VE que un plan más barato cambia el mínimo', IA_CON_UN_PLAN_MAS_BARATO, elMinimoEs49)
afirmarIgual(
  precioDesdeDe({ tipo: 'calibres', calibres: [{ nombre: 'b', desde: 600, descripcion: '', incluye: [], autogestionable: true }, { nombre: 'a', desde: 200, descripcion: '', incluye: [], autogestionable: null }], destacada: null }),
  { usd: 200, periodo: 'unico' },
  'los calibres: el menor, aunque no vaya primero',
)
afirmarIgual(precioDesdeDe({ tipo: 'proyecto', desde: 1000, nota: '' }), { usd: 1000, periodo: 'unico' }, 'el proyecto: su «desde»')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · precios.ts se importa sin arrastrar el template')

interface Grafo {
  readonly archivos: readonly string[]
  readonly externos: readonly string[]
}

/** Sin comentarios: los docblocks hablan de imports y no los hacen. */
const sinComentarios = (fuente: string): string => fuente.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1')

/** Los módulos que un archivo carga en runtime: `import type` y `export type` se borran al compilar y no cuentan. */
function especificadoresDeValor(fuente: string): string[] {
  const limpio = sinComentarios(fuente)
  return [
    ...[...limpio.matchAll(/^[ \t]*(?:import|export)\s+(?!type\b)[\w\s{},*$]*?\bfrom\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]),
    ...[...limpio.matchAll(/^[ \t]*import\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]),
    ...[...limpio.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]),
  ]
}

/** El archivo que resuelve un especificador relativo, o null si no existe. `leer` devuelve null si no hay archivo. */
function resolver(desde: string, especificador: string, leer: (archivo: string) => string | null): string | null {
  const base = especificador.startsWith('@/') ? `src/${especificador.slice(2)}` : path.posix.join(path.posix.dirname(desde), especificador)
  return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find((c) => /\.tsx?$/.test(c) && leer(c) !== null) ?? null
}

/** Todo lo que carga `entrada` en runtime, siguiendo los imports relativos. Los que no son relativos son externos. */
function recorrerGrafo(entrada: string, leer: (archivo: string) => string | null): Grafo {
  const archivos = new Set<string>()
  const externos = new Set<string>()
  const pendientes = [entrada]
  while (pendientes.length > 0) {
    const archivo = pendientes.pop()
    if (archivo === undefined || archivos.has(archivo)) continue
    archivos.add(archivo)
    for (const especificador of especificadoresDeValor(leer(archivo) ?? '')) {
      if (!especificador.startsWith('.') && !especificador.startsWith('@/')) externos.add(especificador)
      else {
        const hijo = resolver(archivo, especificador, leer)
        if (hijo === null) externos.add(`sin resolver: ${especificador}`)
        else pendientes.push(hijo)
      }
    }
  }
  return { archivos: [...archivos].sort(), externos: [...externos].sort() }
}

const grafoLimpio = (g: Grafo): boolean =>
  !g.archivos.some((a) => a.endsWith('.tsx') || a.endsWith('/proyectos.ts')) &&
  !g.externos.some((e) => e.startsWith('sin resolver') || /^(react|react-dom|next)(\/|$)/.test(e))

const leerDelDisco = (rel: string): string | null => {
  const completo = path.join(RAIZ, rel)
  return existsSync(completo) && statSync(completo).isFile() ? readFileSync(completo, 'utf8') : null
}
const GRAFO = recorrerGrafo('src/app/v3/_servicios/precios.ts', leerDelDisco)
const DE = (rel: string): boolean => GRAFO.archivos.includes(`src/app/v3/_servicios/${rel}`)

afirmar(grafoLimpio(GRAFO), 'el grafo de imports de precios.ts no tiene .tsx, ni react, ni next, ni proyectos.ts', `${GRAFO.archivos.length} archivos`)
afirmar(['tipos.ts', 'formato.ts', 'datos/servicios.ts', 'datos/paginas-web.ts', 'datos/software-a-medida.ts', 'datos/ia-y-automatizaciones.ts'].every(DE) && GRAFO.archivos.some((a) => a.endsWith('marca/sistema.ts')), '  y el recorrido llega hasta los datos y la marca: el barrido mira algo')
afirmar(!DE('datos/fuenteDeProyectos.ts'), '  la fuente de proyectos solo entra por tipo: no está en el runtime de precios')

// Un sistema de archivos de mentira: el recorrido y el predicado ven un .tsx, un react y un next cuando los hay.
const MENTIRA: Readonly<Partial<Record<string, string>>> = {
  'a/precios.ts': "import { PRECIOS } from './datos'\nexport const X = PRECIOS",
  'a/datos.ts': "import { Tarjeta } from './Tarjeta'\nexport const PRECIOS = Tarjeta",
  'a/Tarjeta.tsx': "import { useState } from 'react'\nexport const Tarjeta = useState",
  'b/precios.ts': "export * from './proyectos'",
  'b/proyectos.ts': 'export const P = 1',
  'c/precios.ts': "import Image from 'next/image'\nexport const I = Image",
  'd/precios.ts': "import type { A } from './Tarjeta'\n// import { useState } from 'react'\nexport type B = A",
  'd/Tarjeta.tsx': 'export type A = 1',
}
const delSistemaDeMentira = (rel: string): string | null => MENTIRA[rel] ?? null
const grafoDe = (entrada: string): Grafo => recorrerGrafo(entrada, delSistemaDeMentira)
controlPositivo('el detector VE un .tsx en el grafo (y un react que llega por él)', grafoDe('a/precios.ts'), grafoLimpio)
controlPositivo('  y proyectos.ts, que llega por un `export *`', grafoDe('b/precios.ts'), grafoLimpio)
controlPositivo('  y un import de next', grafoDe('c/precios.ts'), grafoLimpio)
afirmar(grafoLimpio(grafoDe('d/precios.ts')), '  y NO cuenta un `import type` ni un import comentado: no se cargan en runtime')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · formato: un dato que falta no se completa con un número')

afirmarIgual([usd(200), usd(600), usd(1000), usd(5000)], ['USD 200', 'USD 600', 'USD 1.000', 'USD 5.000'], 'usd() escribe «USD 1.000», con punto de miles también en cuatro cifras')
afirmarIgual([usdOMarcador(null, true), usdOMarcador(null, false), usdOMarcador(49, true), usdOMarcador(49, false)], [MARCADOR_A_DEFINIR, null, 'USD 49', 'USD 49'], 'usdOMarcador: el marcador en desarrollo, nada en producción, el precio siempre que hay')
afirmarIgual([textoOMarcador(null, true), textoOMarcador(null, false), textoOMarcador('hola', true), textoOMarcador('hola', false)], [MARCADOR_A_DEFINIR, null, 'hola', 'hola'], 'textoOMarcador: lo mismo, para texto')
const enProduccionNoHayNumero = (n: number | null): boolean => !/\d/.test(usdOMarcador(n, false) ?? '')
afirmar(enProduccionNoHayNumero(null), 'sin dato y en producción, no sale ningún número')
controlPositivo('el detector VE un número donde hay un precio', 49, enProduccionNoHayNumero)

cerrar('servicios-precios')
