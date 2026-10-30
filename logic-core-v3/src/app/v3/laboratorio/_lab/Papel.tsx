import { Leyenda } from './Leyenda'

/**
 * [L7e] La hoja de un prototipo: papel opaco por encima de la escena (que, sin preset, pinta un cuadro y duerme), como las rutas de
 * instrumento (`/v3/piezas`, `/v3/tipografia`), y la leyenda. Sin `data-panel`: con uno, la escena tomaría la ruta por el home.
 */
export function Papel({ slug, children }: { readonly slug: string; readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <main className="relative z-10 min-h-svh bg-fondo text-tinta">
      {children}
      <Leyenda slug={slug} />
    </main>
  )
}
