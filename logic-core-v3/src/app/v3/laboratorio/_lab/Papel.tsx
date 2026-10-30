import { Leyenda } from './Leyenda'

/**
 * [L7e] La hoja de un prototipo: papel opaco por encima de la escena (que, sin preset, pinta un cuadro y duerme), como las rutas de
 * instrumento (`/v3/piezas`, `/v3/tipografia`), y la leyenda. Con `fondo="escena"` la hoja es transparente (como el `<main>` del home)
 * y cada sección pone su papel. Sin `data-panel`: con uno, la escena tomaría la ruta por el home.
 */
export function Papel({ slug, fondo = 'papel', children }: { readonly slug: string; readonly fondo?: 'papel' | 'escena'; readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <main className={fondo === 'papel' ? 'relative z-10 min-h-svh bg-fondo text-tinta' : 'relative z-10 min-h-svh text-tinta'}>
      {children}
      <Leyenda slug={slug} />
    </main>
  )
}
