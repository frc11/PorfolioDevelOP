/**
 * LA ESCALA TIPOGRÁFICA RESUELTA, EN LOS CUATRO PERFILES DE ABAJO DEL UMBRAL.
 *
 *     npx tsx scripts-b4/b-tipografia-piso.ts
 *
 * ── ⚠️ POR QUÉ NO MIDE SOBRE `/v3/tipografia/muestra`, QUE ERA EL PLAN ────
 *
 * Porque **esa ruta desborda a 375 y no se puede medir ahí**. Medido con la
 * receta del banco, mismo Chrome, mismo override:
 *
 *     /v3                      innerWidth 375 · docWidth 375   ✅
 *     /v3/tipografia/muestra   innerWidth 638 · docWidth 638   ❌
 *     /v3/tipografia           innerWidth 375 · docWidth 375   ✅
 *
 * Con `visualViewport.width` en 375 y `outerWidth` en 375 en las tres: la
 * ventana **es** de 375, y lo que se ensancha es el viewport de LAYOUT, porque
 * el contenido de la muestra no entra. Es la firma exacta de un desborde
 * horizontal bajo emulación móvil.
 *
 * Y eso rompe la medición de raíz, no la molesta: los seis niveles fluidos usan
 * `clamp()` con `vw`, así que **resolverlos contra 638 devuelve el tamaño de
 * otro ancho**. El paso 4 de la receta lo frenó en vez de dejar pasar un número
 * plausible — que es para lo que está.
 *
 * Queda anotado como defecto y **no se arregla acá**: `muestra` es una ruta de
 * instrumento con fecha de baja, y este lane no toca código de producto.
 *
 * ── Lo que hace en cambio, y por qué es legítimo ──────────────────────────
 *
 * Monta **en la página real de `/v3`** un párrafo por nivel con las clases
 * exactas de `_lib/tipografia.ts`, lee el `font-size` computado, y los saca. Los
 * `clamp()` resuelven contra el viewport de verdad, que es lo único que se
 * necesitaba de la muestra. No cambia el sitio: cambia el DOM vivo de la
 * pestaña de medición, que es de lo que está hecha toda medición del navegador.
 *
 * El control positivo es el que hace honesta a la lectura: una clase INVENTADA
 * tiene que resolver al tamaño heredado y **no** a uno propio. Sin él, el
 * instrumento devolvería una tabla igual de linda aunque Tailwind no hubiera
 * emitido una sola de las reglas.
 */

import { conLaPagina, dos, guardarJson, procedencia } from './b-comun'
import { medir } from './navegador'
import { PERFILES_DEBAJO_DEL_UMBRAL, perfilPorId } from './perfiles'

/** Los ocho, con la clase que cada uno emite. Copiado de `_lib/tipografia.ts`. */
const CLASES: readonly { readonly nivel: string; readonly clase: string; readonly fluido: boolean }[] = [
  { nivel: 'micro', clase: 'text-fluido-micro', fluido: true },
  { nivel: 'caption', clase: 'text-fluido-caption', fluido: true },
  { nivel: 'cuerpo', clase: 'text-cuerpo', fluido: false },
  { nivel: 'base', clase: 'text-base', fluido: false },
  { nivel: 'titulo-s', clase: 'text-fluido-titulo-s', fluido: true },
  { nivel: 'titulo-m', clase: 'text-fluido-titulo-m', fluido: true },
  { nivel: 'titulo-l', clase: 'text-fluido-titulo-l', fluido: true },
  { nivel: 'titulo-xl', clase: 'text-fluido-titulo-xl', fluido: true },
]

const LECTOR = `(clases) => {
  const caja = document.createElement('div')
  caja.setAttribute('data-b4-sonda', '1')
  caja.style.position = 'absolute'
  caja.style.left = '-99999px'
  caja.style.top = '0'
  document.body.appendChild(caja)
  const salida = []
  for (const c of clases) {
    const p = document.createElement('p')
    p.className = c
    p.textContent = 'Hg'
    caja.appendChild(p)
    salida.push({ clase: c, fontSizePx: Number.parseFloat(getComputedStyle(p).fontSize) })
  }
  const heredado = Number.parseFloat(getComputedStyle(caja).fontSize)
  caja.remove()
  return { salida, heredado }
}`

interface Lectura {
  readonly salida: readonly { readonly clase: string; readonly fontSizePx: number }[]
  readonly heredado: number
}

async function principal(): Promise<void> {
  const aMedir = [...PERFILES_DEBAJO_DEL_UMBRAL, perfilPorId('1920')]
  const filas: Record<string, unknown>[] = []
  const controles: Record<string, unknown>[] = []

  for (const perfil of aMedir) {
    const lectura = await conLaPagina(perfil, '/v3', async ({ pagina }) =>
      medir<Lectura>(
        pagina,
        `(${LECTOR})(${JSON.stringify([...CLASES.map((c) => c.clase), 'text-fluido-inventado-b4'])})`,
      ),
    )
    const inventada = lectura.salida[lectura.salida.length - 1]
    controles.push({
      perfil: perfil.id,
      nombre: 'una clase INVENTADA resuelve al tamaño heredado, no a uno propio',
      heredadoPx: dos(lectura.heredado),
      inventadaPx: dos(inventada.fontSizePx),
      pasa: Math.abs(inventada.fontSizePx - lectura.heredado) < 0.01,
    })
    const niveles = CLASES.map((c, i) => ({
      nivel: c.nivel,
      clase: c.clase,
      fluido: c.fluido,
      fontSizePx: dos(lectura.salida[i].fontSizePx),
    }))
    const orden = [...niveles].sort((a, b) => a.fontSizePx - b.fontSizePx)
    const saltos = orden.slice(1).map((n, i) => ({
      de: orden[i].nivel,
      a: n.nivel,
      saltoPx: dos(n.fontSizePx - orden[i].fontSizePx),
      razon: dos(n.fontSizePx / orden[i].fontSizePx),
      colapsado: Math.abs(n.fontSizePx - orden[i].fontSizePx) < 0.01,
    }))
    filas.push({ perfil: perfil.id, ancho: perfil.ancho, debajoDelUmbral: perfil.debajoDelUmbral, niveles, saltos })
    console.log(
      `\n── ${perfil.id} (${perfil.ancho} px) ──\n  ` +
        niveles.map((n) => `${n.nivel} ${n.fontSizePx}`).join(' · '),
    )
    const col = saltos.filter((s) => s.colapsado)
    console.log(`  saltos colapsados: ${col.length === 0 ? 'ninguno' : col.map((s) => `${s.de}=${s.a}`).join(', ')}`)
  }

  const ruta = guardarJson('tipografia', {
    procedencia: procedencia(
      'scripts-b4/b-tipografia-piso.ts',
      'sondas montadas en el DOM vivo de /v3 con las clases de `_lib/tipografia.ts`; `clamp()` resuelto contra el viewport real. NO se midió sobre `/v3/tipografia/muestra` porque esa ruta desborda a 375 (ver docblock). Sin estrangular. Emulado.',
    ),
    porQueNoLaMuestra: {
      medido: { '/v3': 375, '/v3/tipografia/muestra': 638, '/v3/tipografia': 375 },
      campo: 'window.innerWidth con el override en 375, `visualViewport.width` 375 en las tres',
      consecuencia:
        'los seis niveles fluidos usan clamp() con vw: resolverlos contra 638 devuelve el tamaño de otro ancho. Es un defecto de esa ruta, no del instrumento.',
    },
    controlesPositivos: controles,
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
