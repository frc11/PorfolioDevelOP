'use client'

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import type { PropsDeLaVariante } from '../../_lib/escena/ruta/variante'
import { cuadroDeLaVariante, type SalidaDeLaVariante } from './estructura'
import { WEB_ENCENDIDA } from './luzDeWeb'

const BLANCO = new THREE.Color(1, 1, 1)

/**
 * [SERVICIOS V1] LA VARIANTE DE PÁGINAS WEB — la que la ranura del home monta en la intro de `/v3/paginas-web` (registro: `web`,
 * `_variantes/registro.ts`; B12a-API §4). Hace lo que una variante puede hacer, y nada más:
 *   · en su `useFrame` (sin prioridad: el render sigue siendo de la escena) lee el avance, `saliendo` y el reloj, y pide la luz del cuadro a
 *     `cuadroDeLaVariante` (`estructura.ts`, puro);
 *   · enciende la luz de abajo prestada y la tiñe del celeste de web (`luzDeAbajo`, P-H29a y b), y tiñe la energía (`energia`, P-H29c):
 *     el color va SOLO en la luz, así que no agrega ningún objeto a la escena (no hay nada que liberar al desmontarse);
 *   · al salir (P-H29d) vuelve a la composición en `SALIDA_DE_LA_VARIANTE_MS`; con movimiento reducido, quieta y de una.
 * No mueve la cámara, ni la luz de la sala, ni el avance, ni escribe los almacenes del home: sólo las dos funciones que le presta la ranura.
 * La calidad no cambia nada propio: la compacta del home ya baja el costo de la escena.
 */
export default function VarianteDeWeb({ avance, acento, reducido, luzDeAbajo, energia, saliendo }: PropsDeLaVariante): null {
  const salida = useRef<SalidaDeLaVariante | null>(null)
  const colorDelPiso = useRef(new THREE.Color(1, 1, 1))
  const colorDeLaEnergia = useRef(new THREE.Color(1, 1, 1))

  useFrame(() => {
    const cuadro = cuadroDeLaVariante(WEB_ENCENDIDA, { avance: avance.current, reducido, saliendo: saliendo.current, ahora: performance.now() }, salida.current)
    salida.current = cuadro.salida
    luzDeAbajo(cuadro.parametros.brilloDelPiso, colorDelPiso.current.copy(BLANCO).lerp(acento, cuadro.parametros.tinteDelPiso))
    energia(colorDeLaEnergia.current.copy(BLANCO).lerp(acento, cuadro.parametros.tinteDeLaEnergia))
  })

  return null
}
