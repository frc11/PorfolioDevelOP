# 03 — Editar la Knowledge Base de un cliente

**Tiempo estimado:** 20-40 minutos (depende del scope)
**Responsable:** Franco (primary) — requiere context sobre el negocio
**Prerequisito:** Cliente activo

## Cuándo aplicar

- Cliente pidió agregar info nueva al bot
- Cliente cambió precios o servicios
- Bot está dando respuestas incorrectas (revisar KB)
- Detectaste por las conversaciones que falta info

## Paso 1: Backup mental

⚠ Tomá nota mental (o screenshot) del estado actual de la KB. Si el cambio sale mal, podés revertir mirando el audit log.

## Paso 2: Ir al KB editor

1. `/admin/clients/[clientId]` → Tab "Chatbot"
2. Click "Knowledge Base" en quick actions
3. Te lleva a `/admin/clients/[orgSlug]/chatbot/knowledge`

## Paso 3: Identificar la sección correcta

Las 7 secciones son:

1. **Sobre el negocio** — descripción general
2. **Productos / Servicios** — qué venden
3. **Precios** — cuánto cuestan
4. **Diferenciadores** — qué los hace únicos
5. **Cliente ideal** — a quién venden
6. **Manejo de objeciones** — respuestas a quejas comunes
7. **Cosas que NO decir** — info sensible

**Buscar antes de editar**: usar el search bar arriba a la derecha. Si la info ya existe pero está mal ubicada, mover; no duplicar.

## Paso 4: Editar la sección

El editor es markdown con preview lado a lado.

Tips:
- Usar **bold** para info crítica
- Usar listas para enumerar productos/servicios
- Mantener cada sección bajo ~500 palabras (más es ineficiente con tokens)
- Si la sección crece mucho, considerá si pertenece a otra

## Paso 5: Validar

Después de editar:

1. Mirar el panel "Validación" a la derecha
2. Resolver warnings importantes (contradicciones, secciones muy cortas)
3. Si todo verde o solo info: continuar

## Paso 6: Probar con sandbox

⚠ **NO guardar todavía**. Abrir el sandbox:

1. Click "Probar prompt"
2. Mandar consultas que toquen lo que cambiaste:
   - Si cambiaste precios: "Cuánto cuesta X?"
   - Si agregaste servicio: "Hacen X?"
   - Si modificaste diferenciadores: "Por qué elegirlos a ustedes?"
3. Verificar que las respuestas usan la info nueva

## Paso 7: Confirmar con diff

Click "Guardar cambios" — se abre modal de diff:

- **Rojo** = lo que se elimina
- **Verde** = lo que se agrega
- Sin color = sin cambios

Revisar TODO antes de confirmar. Si algo no debería cambiar pero aparece en el diff, hubo error.

Confirmar.

## Paso 8: Avisar al cliente (opcional)

Si el cambio fue significativo:

```
Listo [nombre]! Acabamos de actualizar la info que pasaste.

El chatbot ya responde con esos cambios. Te paso ejemplo:
[ejemplo concreto]

Cualquier duda, avisame.

Franco
```

## Common pitfalls

❌ **Editar sin sandbox**: cambios que parecen menores pueden cambiar respuestas drásticamente
❌ **No revisar el diff antes de guardar**: confirma que solo cambió lo que querías
❌ **Olvidar la sección "Cosas que NO decir"**: si el cliente pidió "no menciones a la competencia X", debe estar ahí
❌ **Markdown roto**: el preview te muestra si renderiza bien
❌ **Pegar texto desde Word/Google Docs sin limpiar**: rompe el markdown — pegar como texto plano

## Si algo sale mal

1. Volver al KB editor
2. Click en "Audit log" → buscar el cambio reciente
3. Copiar el "before" del diff
4. Pegarlo de vuelta como nuevo cambio
5. Confirmar (revierte al estado anterior)

## Siguiente paso

Si el cambio fue por feedback de conversaciones, ver [04-responder-alerta.md](./04-responder-alerta.md) por si hay alertas relacionadas.
