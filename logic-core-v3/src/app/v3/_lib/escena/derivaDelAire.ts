import * as THREE from 'three'

/**
 * LA DERIVA DEL AIRE — la rotación diferencial por conchas de un campo de
 * partículas.
 *
 * ⚠️ **NO ES CÓDIGO NUEVO. SALIÓ DE `OrbitRig.tsx` EN B5, VERBATIM.** Ni un
 * valor, ni un signo, ni un orden de operaciones cambió: es la misma función,
 * con su docblock, en un archivo propio. El porqué de la mudanza es aritmético
 * y está declarado — `OrbitRig.tsx` vive bajo la vigilancia de largos de
 * `s8-largos.ts` con línea de base **651**, B5 le sumó siete líneas al mudar el
 * offset de mouse a `modulacionDeLaPose.ts`, y la regla es que un heredado **no
 * engorda**. Sacar de ahí lo que no es del loop lo deja más corto que como
 * estaba, que es el lado bueno de esa misma regla.
 *
 * Por qué ESTA función y no otra: es la única del archivo que no lee ni escribe
 * el estado del cuadro. Recibe un grupo y un reloj, y ordena hijos. El resto de
 * `OrbitRig` es el `useFrame`.
 *
 * ── Lo que la función hace, y por qué así (el docblock original) ───────────
 *
 * La deriva diferencial de un campo de partículas: cada CONCHA gira y cabecea
 * con su propio período, la interior más rápido.
 *
 * Recorre los hijos del grupo en vez de recibir un ref por concha, y eso no es
 * pereza: mantiene el contrato del rig en dos refs —uno por campo— aunque el
 * componente cambie de cuántas capas tiene, y no asigna nada por frame. Si el
 * grupo trae más hijos que constantes, las de más se ignoran; se verifica que
 * las cantidades coincidan en `s10-escena.invariant.ts`.
 *
 * ── ⚠️ Y es UNA de las tres cosas que ya se movían solas ──────────────────
 *
 * B5 midió que la escena **no está quieta** con la página quieta: esto, el
 * moiré de la envolvente y la vira del logo dan 29,8 % de los píxeles cambiando
 * más de 3 de luminancia en 5 s, contra 36,8 % de la referencia. Es la razón
 * por la que B5 **no construyó una deriva autónoma de cámara**: la que faltaba
 * no era ésta.
 */

/** Vuelta completa en radianes. Local a propósito: el módulo se lee solo. */
const TWO_PI = Math.PI * 2

export function driftShells(
  group: THREE.Group,
  elapsed: number,
  spin: readonly number[],
  amplitude: readonly number[],
  period: readonly number[],
  reducedMotion: boolean
): void {
  const shells = group.children
  for (let i = 0; i < shells.length; i += 1) {
    const shell = shells[i]
    if (reducedMotion) {
      if (shell.rotation.y !== 0) shell.rotation.y = 0
      if (shell.position.y !== 0) shell.position.y = 0
      continue
    }
    const index = i < spin.length ? i : spin.length - 1
    shell.rotation.y = elapsed * spin[index]
    shell.position.y =
      Math.sin((elapsed / period[index]) * TWO_PI) * amplitude[index]
  }
}
