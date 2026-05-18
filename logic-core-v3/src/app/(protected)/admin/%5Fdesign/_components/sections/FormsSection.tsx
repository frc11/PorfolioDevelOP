'use client'

import { useState } from 'react'
import { Example, SectionWrapper } from '../Example'
import { Button, Field, Input, Select, Toggle } from '@/components/ui'

export function FormsSection() {
  const [toggled, setToggled] = useState(false)

  return (
    <SectionWrapper title="Forms" description="Inputs, fields, toggles y selects.">
      <Example
        title="Field con Input"
        code={`<Field label="Email" hint="Tu email principal" required>
  <Input placeholder="hola@ejemplo.com" type="email" />
</Field>`}
      >
        <div className="w-full max-w-sm">
          <Field label="Email" hint="Tu email principal" required>
            <Input placeholder="hola@ejemplo.com" type="email" />
          </Field>
        </div>
      </Example>

      <Example
        title="Field con error"
        code={`<Field label="Slug" error="Ya existe un cliente con este slug">
  <Input invalid defaultValue="duplicate-slug" />
</Field>`}
      >
        <div className="w-full max-w-sm">
          <Field label="Slug" error="Ya existe un cliente con este slug">
            <Input invalid defaultValue="duplicate-slug" />
          </Field>
        </div>
      </Example>

      <Example
        title="Select"
        code={`<Field label="Industria">
  <Select
    options={[
      { value: 'legal', label: 'Legal' },
      { value: 'medical', label: 'Medico' },
      { value: 'dental', label: 'Dental' },
    ]}
  />
</Field>`}
      >
        <div className="w-full max-w-sm">
          <Field label="Industria">
            <Select
              options={[
                { value: 'legal', label: 'Legal' },
                { value: 'medical', label: 'Medico' },
                { value: 'dental', label: 'Dental' },
              ]}
            />
          </Field>
        </div>
      </Example>

      <Example
        title="Toggle"
        code={`const [on, setOn] = useState(false)

<Toggle checked={on} onChange={setOn} label="Bot activo" />`}
      >
        <div className="flex items-center gap-3">
          <Toggle checked={toggled} onChange={setToggled} label="Bot activo" />
          <span className="text-sm text-zinc-300">{toggled ? 'Activo' : 'Pausado'}</span>
        </div>
      </Example>

      <Example
        title="Form completo"
        code={`<form className="space-y-4">
  <Field label="Nombre" required>
    <Input />
  </Field>
  <Field label="Email" required>
    <Input type="email" />
  </Field>
  <Button type="submit">Guardar</Button>
</form>`}
      >
        <form className="w-full max-w-md space-y-4" onSubmit={(event) => event.preventDefault()}>
          <Field label="Nombre" required>
            <Input placeholder="Tu nombre" />
          </Field>
          <Field label="Email" required>
            <Input type="email" placeholder="tu@email.com" />
          </Field>
          <Button type="submit">Guardar</Button>
        </form>
      </Example>
    </SectionWrapper>
  )
}
