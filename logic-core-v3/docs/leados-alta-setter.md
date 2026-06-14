# LeadOS — Alta de un setter (B1)

Procedimiento para crear un usuario con rol `SETTER`. El setter es un usuario
interno **sin org membership**: su aislamiento de datos es por
`OsLead.assignedToId` (ver `src/lib/leados/ownership.ts`), no por
`organizationId`.

## Reglas duras

- **Solo por credentials.** El alta por Google está **prohibida**: el
  `profile()` de Google en `src/auth.ts` hardcodea `role: 'ORG_MEMBER'` — un
  setter dado de alta por OAuth nacería con el rol equivocado.
- **`passwordResetRequired: true` siempre.** El middleware fuerza
  `/cambiar-password` en el primer login; la password provisoria muere ahí.
- **`emailVerified` seteado.** El `authorize()` de credentials rechaza usuarios
  sin `emailVerified` (`EMAIL_NOT_VERIFIED`).
- **Sin `OrgMember`.** No crear membership: el setter no pertenece a ninguna
  org y el callback `signIn` lo permite explícitamente por rol.

## Alta en dev (seed)

`prisma/seed.ts` ya incluye el caso:

```
setter-qa@develop.test / Setter1234!  (rol SETTER, fuerza cambio de password)
```

Correr `npx prisma db seed` contra la branch dev. Re-correrlo restaura la
password provisoria y vuelve a activar `passwordResetRequired`.

## Alta manual (prod o ad-hoc)

Desde una consola con `DATABASE_URL` apuntando al entorno correcto:

```ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const password = await bcrypt.hash('<password-provisoria>', 12)

await prisma.user.create({
  data: {
    name: '<Nombre del setter>',
    email: '<email>',          // se normaliza a lowercase en el login
    password,
    role: 'SETTER',
    emailVerified: new Date(),
    passwordResetRequired: true,
    // SIN orgMemberships — a propósito
  },
})
```

Entregar la password provisoria por un canal seguro. El primer login lo lleva a
`/cambiar-password` y después aterriza en `/setter`.

## Notas

- **Magic link (Resend):** un setter ya creado *puede* loguearse por magic link
  (el email existe en DB y el callback `signIn` permite SETTER). Es equivalente
  en confianza a un reset por email. Lo que está prohibido es el **alta** por
  Google, no el login del usuario ya existente.
- **Asignación de leads:** en B1 la asignación de `OsLead.assignedToId` se hace
  manualmente (DB o pipeline admin). El setter solo ve leads con
  `assignedToId = su userId`.
