'use client'

import { useState } from 'react'
import { Badge, Button, Modal } from '@/components/ui'
import { Example, SectionWrapper } from '../Example'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export function ModalsSection() {
  const [size, setSize] = useState<ModalSize | null>(null)
  const [footerOpen, setFooterOpen] = useState(false)

  return (
    <SectionWrapper title="Modals" description="Dialogos overlay para acciones focalizadas.">
      <Example
        title="Tamanos"
        code={`<Modal open={open} onClose={close} title="Modal" size="sm | md | lg | xl">
  Contenido
</Modal>`}
      >
        <div className="flex flex-wrap gap-3">
          {(['sm', 'md', 'lg', 'xl'] as const).map((modalSize) => (
            <Button key={modalSize} variant="secondary" onClick={() => setSize(modalSize)}>
              Abrir {modalSize}
            </Button>
          ))}
        </div>
      </Example>

      <Example
        title="Con footer"
        code={`<Modal
  open={open}
  onClose={close}
  title="Confirmar cambio"
  footer={<><Button variant="secondary">Cancelar</Button><Button>Confirmar</Button></>}
>
  Contenido
</Modal>`}
      >
        <Button onClick={() => setFooterOpen(true)}>Abrir modal con footer</Button>
      </Example>

      <Modal
        open={size !== null}
        onClose={() => setSize(null)}
        title={`Modal ${size ?? ''}`}
        description="Ejemplo de dialogo con contenido operativo."
        size={size ?? 'md'}
      >
        <div className="space-y-3">
          <Badge variant="brand">Preview</Badge>
          <p className="text-sm leading-relaxed text-zinc-300">
            Este modal valida el ancho, padding, header y comportamiento de backdrop.
          </p>
        </div>
      </Modal>

      <Modal
        open={footerOpen}
        onClose={() => setFooterOpen(false)}
        title="Confirmar cambio"
        description="Usar footer para acciones primarias y secundarias."
        footer={
          <>
            <Button variant="secondary" onClick={() => setFooterOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setFooterOpen(false)}>Confirmar</Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-zinc-300">
          El contenido principal queda separado de las acciones para que el cierre visual sea claro.
        </p>
      </Modal>
    </SectionWrapper>
  )
}
