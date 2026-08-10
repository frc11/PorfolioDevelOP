'use client'

import dynamic from 'next/dynamic'
import type { CSSProperties, ReactNode } from 'react'
import type { AvatarComponentProps } from './types'
import styles from './HeavyAvatarsLazy.module.css'

/**
 * Carga diferida de los dos avatares 3D del registry.
 *
 * `registry.ts` los importaba de forma estática, así que `three` +
 * `@react-three/fiber` (230,7 kB gz) viajaban en el árbol del widget de chat en
 * TODA ruta pública — aunque la config actual del bot (`avatarStyle: 'image'`)
 * no puede montarlos nunca: `AvatarRenderer` resuelve la escotilla `image` y
 * devuelve la imagen del data-URI antes de tocar el registry. Ver
 * `docs/probe-bundle-inicial.md` §B.2 para la cadena completa, eslabón por eslabón.
 *
 * Acá se cambia CÓMO se cargan, no SI existen: el registry sigue exponiendo las
 * cinco entradas, el picker del admin sigue mostrando las cinco, y al
 * seleccionar un avatar 3D su chunk baja on-demand y monta igual.
 *
 * `ssr: false` porque ambos montan un `<Canvas>` de R3F (WebGL, sin equivalente
 * en el servidor) — el mismo patrón que ya usan `HeroCanvas`, `DotMatrix` y
 * `BrandedIntroCanvas`.
 */

const NeuroAvatarImpl = dynamic(() => import('./NeuroAvatar').then((m) => m.NeuroAvatar), {
  ssr: false,
  loading: HeavyAvatarPlaceholder,
})

const LegacyNeuroAvatarImpl = dynamic(
  () => import('./LegacyNeuroAvatarAdapter').then((m) => m.LegacyNeuroAvatarAdapter),
  { ssr: false, loading: HeavyAvatarPlaceholder }
)

/** Orbe Neural (`neuro`) diferido. Contrato idéntico a `NeuroAvatar`. */
export function NeuroAvatarLazy(props: AvatarComponentProps) {
  return (
    <HeavyAvatarFrame size={props.size} accentColor={props.accentColor}>
      <NeuroAvatarImpl {...props} />
    </HeavyAvatarFrame>
  )
}

/** Rostro Neural (`legacy_neuro`) diferido. Contrato idéntico al adapter. */
export function LegacyNeuroAvatarLazy(props: AvatarComponentProps) {
  return (
    <HeavyAvatarFrame size={props.size} accentColor={props.accentColor}>
      <LegacyNeuroAvatarImpl {...props} />
    </HeavyAvatarFrame>
  )
}

/**
 * Caja del tamaño final del avatar. Existe para que el placeholder ocupe
 * exactamente el mismo espacio que el canvas que va a reemplazarlo — el layout
 * no salta cuando llega el chunk (CLS 0). También publica el accent como
 * custom property: `loading` de `next/dynamic` no recibe las props del
 * componente, así que el placeholder lo lee por CSS.
 */
function HeavyAvatarFrame({
  size = 56,
  accentColor,
  children,
}: {
  size?: number
  accentColor: string
  children: ReactNode
}) {
  return (
    <div
      style={
        {
          width: size,
          height: size,
          '--heavy-avatar-accent': accentColor,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

/** Disco plano de marca mientras baja el chunk del avatar 3D. */
function HeavyAvatarPlaceholder() {
  return <div className={styles.placeholder} aria-hidden />
}
