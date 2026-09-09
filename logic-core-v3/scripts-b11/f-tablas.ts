/**
 * F · LAS TABLAS DE LA PARADA — lo que los JSON de B11 dicen, en el formato
 * en que se reportan. No abre el navegador: lee `outputs/b11/`.
 *
 *     npx tsx scripts-b11/f-tablas.ts [--etiqueta=antes] [--perfil=1440,1920,2560]
 *
 * Tres tablas por ancho:
 *
 *   1. **La zona libre por sección y pantalla**, de `logo-<perfil>.json`: desde
 *      cada borde, cuántos píxeles quedan sin que la tinta de la sección baje de
 *      AA en NINGUNA parada (estructura, sin motas), y la retícula de doce
 *      columnas sobre la caja de contenido, media pantalla por fila, con la
 *      fracción de cada celda que alguna parada vio bajo AA.
 *   2. **Las seis deudas por bloque**, de `bloques-<etiqueta>-<perfil>.json`:
 *      cuántos bloques fallan y el peor, contra la cifra que cada deuda declaró.
 *   3. **La densidad de motas**, que es el piso que ninguna posición baja.
 */

import { existsSync, readFileSync } from 'node:fs'

import { LAS_SEIS, PERFILES_DE_B11, RAIZ_DE_SALIDAS, argumento } from './b11-comun'
import { pct } from './mapa'

interface Pantalla {
  readonly pantalla: number
  readonly logo: { readonly libreIzquierdaPx: number; readonly libreDerechaPx: number; readonly algunaVez: number; readonly delTiempo: number }
  readonly aaDeSuTinta: { readonly tinta: string; readonly libreIzquierdaPx: number; readonly libreDerechaPx: number; readonly algunaVez: number; readonly delTiempo: number }
  readonly brilloAlgunaVez: number
  readonly oscuroAlgunaVez: number
}

interface SeccionDeLogo {
  readonly tipo: string
  readonly tinta: string
  readonly contenido: { readonly x: number; readonly ancho: number }
  readonly barrido: { readonly paradas: number; readonly conLogo: number; readonly vacias: number; readonly aOscuras: number }
  readonly motasDeAAMedia: number
  readonly motasDeAAMaxima: number
  readonly porPantalla: readonly Pantalla[]
  readonly reticulaContenido: { readonly columnas: number; readonly filas: number; readonly aaDeSuTintaAlgunaVez: readonly (readonly number[])[]; readonly logoAlgunaVez: readonly (readonly number[])[] }
}

interface Bloque {
  readonly texto: string
  readonly peorContraste: number
  readonly pasaAA: boolean
  readonly bajoAA: number
  readonly pixelesDeGlifo: number
  readonly sobreElLogo: number
  readonly opacidad: number
  readonly grande: boolean
  readonly scrollY: number
}

function tablaDeZonaLibre(perfil: string): void {
  const ruta = `${RAIZ_DE_SALIDAS}/logo-${perfil}.json`
  if (!existsSync(ruta)) {
    console.log(`  (sin ${ruta})`)
    return
  }
  const j = JSON.parse(readFileSync(ruta, 'utf8')) as { readonly ancho: number; readonly ventana: number; readonly paso: number; readonly secciones: Readonly<Record<string, SeccionDeLogo>> }
  console.log(`\n  ZONA LIBRE — ${perfil}×${j.ventana}, paso ${j.paso.toFixed(2)} px. «libre» = ni una parada con la tinta de la sección bajo AA (estructura: logo, sombra, luz; sin motas)`)
  for (const id of LAS_SEIS) {
    const s = j.secciones[id]
    if (s === undefined) continue
    console.log(`  ── ${id} · tinta ${s.tinta} · ${s.tipo} · ${s.barrido.paradas} paradas (${s.barrido.aOscuras} a oscuras) · motas de AA ${(s.motasDeAAMedia * 100).toFixed(3)} % del cuadro (máx ${(s.motasDeAAMaxima * 100).toFixed(3)}) · contenido x ${s.contenido.x}–${s.contenido.x + s.contenido.ancho}`)
    for (const p of s.porPantalla) {
      console.log(`      pantalla ${p.pantalla}: AA libre izq ${String(p.aaDeSuTinta.libreIzquierdaPx).padStart(5)} px · der ${String(p.aaDeSuTinta.libreDerechaPx).padStart(5)} px · bajo AA alguna vez ${pct(p.aaDeSuTinta.algunaVez)} % del cuadro (del tiempo ${pct(p.aaDeSuTinta.delTiempo)} %) · logo: izq ${p.logo.libreIzquierdaPx} der ${p.logo.libreDerechaPx}, ${pct(p.logo.algunaVez)} % · oscuro ${pct(p.oscuroAlgunaVez)} % · brillo ${pct(p.brilloAlgunaVez)} %`)
    }
    const r = s.reticulaContenido
    console.log(`      retícula de contenido (${r.columnas} col × ${r.filas} medias pantallas), % bajo AA alguna vez, columna 1 a la izquierda:`)
    r.aaDeSuTintaAlgunaVez.forEach((fila, i) => console.log(`        ½p ${String(i + 1).padStart(2)} │ ${fila.map((c) => pct(c)).join(' ')}`))
  }
}

function tablaDeBloques(etiqueta: string, perfil: string): void {
  const ruta = `${RAIZ_DE_SALIDAS}/bloques-${etiqueta}-${perfil}.json`
  if (!existsSync(ruta)) {
    console.log(`  (sin ${ruta})`)
    return
  }
  const j = JSON.parse(readFileSync(ruta, 'utf8')) as { readonly secciones: readonly { readonly id: string; readonly posiciones: readonly unknown[]; readonly peorPorBloque: readonly Bloque[]; readonly veredicto: string }[] }
  console.log(`\n  LOS BLOQUES — «${etiqueta}» ${perfil}, el peor píxel del glifo, a lo largo del tramo (paso ¼ de pantalla)`)
  console.log('    sección            posiciones  bloques  fallan  peor    · fallan por el logo (>5 % del glifo)  · fallan sin logo (motas/luz)')
  for (const s of j.secciones) {
    const fallan = s.peorPorBloque.filter((b) => !b.pasaAA)
    const porLogo = fallan.filter((b) => b.sobreElLogo > 0.05)
    const peor = Math.min(...s.peorPorBloque.map((b) => b.peorContraste))
    console.log(`    ${s.id.padEnd(18)} ${String(s.posiciones.length).padStart(10)}  ${String(s.peorPorBloque.length).padStart(7)}  ${String(fallan.length).padStart(6)}  ${Number.isFinite(peor) ? peor.toFixed(2).padStart(5) : '  —  '}   · ${String(porLogo.length).padStart(2)}  · ${String(fallan.length - porLogo.length).padStart(2)}   ${s.veredicto}`)
    for (const b of fallan.slice().sort((a, c) => a.peorContraste - c.peorContraste)) {
      console.log(`        ${b.peorContraste.toFixed(2).padStart(5)} «${b.texto.slice(0, 44).padEnd(44)}» y=${String(b.scrollY).padStart(5)} · ${String(b.bajoAA).padStart(5)} de ${String(b.pixelesDeGlifo).padStart(6)} px bajo AA · sobre el logo ${pct(b.sobreElLogo)} %${b.opacidad < 0.98 ? ` · opacidad ${b.opacidad}` : ''}${b.grande ? ' · grande (3:1)' : ''}`)
    }
  }
}

function principal(): void {
  const etiqueta = argumento('etiqueta', 'antes')
  const perfiles = argumento('perfil', PERFILES_DE_B11.map((p) => p.id).join(',')).split(',')
  for (const p of perfiles) {
    console.log(`\n═══════════════ ${p} ═══════════════`)
    tablaDeZonaLibre(p)
    tablaDeBloques(etiqueta, p)
  }
}

principal()
