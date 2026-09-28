import * as THREE from 'three'

/**
 * [ESCENA 7] LO QUE EL PISO VIVO COMPARTE — la textura de alturas de este cuadro y su grilla, para que el
 * polvo posado se apoye en los bloques y suba y baje con el mar (`polvo/simulacion.ts`). Lo escribe
 * `PisoVivo.tsx`; sin piso vivo, `hay` queda en 0 y el polvo usa el piso plano.
 */
export const PISO_EN_VIVO = {
  uPisoVivo: { value: null as THREE.Texture | null },
  /** (celdas por lado, lado de la celda en u, hay piso vivo 0/1, sin uso). */
  uGrillaDelPiso: { value: new THREE.Vector4(1, 1, 0, 0) },
}
