# 03 — Mejoras

> Seguridad · bugs latentes · tecnología vieja · rendimiento · deuda · calidad · observabilidad · accesibilidad, más una sección final ZONA-FRANCO. Formato de hallazgo: PROMPT §5.1 + la línea `Nodo(s)` (ENMIENDA-01 E7). IDs `PREFIJO-NNN` globales por prefijo, nunca reutilizados (DEC-24). Severidad y confianza con la rúbrica DEC-23; no hay clientes reales, así que el impacto se redacta como «bloqueante para el primer cliente real». `REQUIERE-VERIFICACIÓN-HUMANA` es una marca aparte con su `VH-NNN` de `08`. Ningún valor de secret aparece en este documento. Rutas relativas a `logic-core-v3/`.

## Seguridad

### [SEC-001] Clave de Google AI con el valor completo en dos documentos y en el historial
- Dominio: D7  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `docs/audits/2026-05-bfg-leak-cleanup.md:94` y `docs/bitacora-roadmap.md:36` — valor completo de una `GOOGLE_GENERATIVE_AI_API_KEY` (omitido); historial: `logic-core-v3/enviroment.env` agregado en `3953558312` (2026-02-12) y alcanzable desde 116 refs (`_crudo/secrets-historial.json`); `docs/audits/2026-05-bfg-leak-cleanup.md:193-197` — «### 8.2 Lo que NO se hizo … ❌ `git push --force` al remote»; `:204` — «La key `…` sigue deshabilitada en Google Cloud (Franco ya rotó — confirmado)».
- Impacto: bloqueante para el primer cliente real solo si la clave siguiera viva: cualquiera con un clon (el repo pasó a privado, pero estuvo público según `docs/baselines/2026-07-auditoria-seguridad.md:3360`) podría consumir la cuota de Google AI a nombre de develOP. Valentino confirma que las credenciales del repo son de prueba (ENMIENDA-01 P1).
- Propuesta: borrar el valor de los dos documentos (dejar solo un prefijo), confirmar en Google Cloud que la clave está revocada y decidir si se purga el historial (`git-filter-repo` + force-push coordinado) o se acepta como clave muerta.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-002], [SEC-003], [SEC-004]
- Nodo(s): int.google-ai, doc.audits-2026-05-bfg-leak-cleanup, doc.bitacora-roadmap
- REQUIERE-VERIFICACIÓN-HUMANA: VH-001

### [SEC-002] Email y contraseña de las cuentas del seed (SUPER_ADMIN y cliente) escritos en el repo
- Dominio: D1  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `README.md:29-30`, `STATUS.md:258-259`, `docs/demo-guion.md:15-16`, `docs/bitacora-beta.md:15`, `docs/bitacora-roadmap.md:6375-6377` (tabla de MS-8: super-admin, client-a y client-b) y `:10534`, `tests/helpers/auth.ts:21` y `:25` — patrón «email / contraseña» (valores omitidos); el seed actual ya no los usa: `prisma/seed.ts:76-79` — `bcrypt.hash(requireSeedPassword('SEED_ADMIN_PASSWORD'), 12)`.
- Impacto: bloqueante para el primer cliente real: si la base de producción se siembra —o se sembró antes del cambio— con esas contraseñas, queda un SUPER_ADMIN con contraseña conocida por cualquiera que lea el repo.
- Propuesta: sacar los literales de docs y del helper de tests (que lea de entorno, como el seed), sembrar producción limpia y confirmar que ninguna base expuesta conserva esas contraseñas.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-001], [SEC-003]
- Nodo(s): lib.auth, lib.prisma.seeds, lib.tests
- REQUIERE-VERIFICACIÓN-HUMANA: VH-002

### [SEC-003] Contraseña de la cuenta QA de setter en docs y como literal en dos scripts
- Dominio: D4  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `docs/leados-alta-setter.md:25` (cuenta QA de setter + contraseña) y `:40` (`bcrypt.hash` de un literal); `docs/bitacora-roadmap.md:7837` (la misma cuenta y contraseña); `scripts/b1-verify-setter-ownership.ts:44` y `scripts/b2-verify-dossier.ts:66` — `const setterPassword = await bcrypt.hash('…', 12)` (valores omitidos).
- Impacto: bloqueante para el primer cliente real si alguna de esas cuentas existe en producción con esa contraseña (un setter ve leads y opera sobre ellos).
- Propuesta: sacar la contraseña de los docs; los dos scripts son one-off (ver [POD-161], [POD-162]): borrarlos o hacer que lean la contraseña de entorno.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-002], [POD-161], [POD-162]
- Nodo(s): h5.set-dia, lib.scripts, doc.leados-alta-setter
- REQUIERE-VERIFICACIÓN-HUMANA: VH-002

### [SEC-004] Contraseña del admin de Matsu (base de dev) literal en un script commiteado
- Dominio: D9  ·  Severidad: BAJA  ·  Tipo: seguridad
- Confianza: VERIFICADO-POR-LECTURA
- Evidencia: `scripts/set-matsu-password.ts:17` — `const PASSWORD = '…'` (omitido); `:15` — host de la Neon de dev en `EXPECTED_DEV_HOST` (no es una credencial, pero ubica la base); `docs/bitacora-roadmap.md:3001` repite la contraseña del usuario dev de Matsu en texto plano (omitida; hallado en F1.12).
- Impacto: bloqueante para el primer cliente real solo si esa contraseña se reutiliza fuera de dev o si la base de dev queda accesible con datos reales del piloto.
- Propuesta: borrar el script (one-off, [POD-155], confianza de poda ALTA) o que lea la contraseña de entorno; no reutilizarla en otros entornos.
- Esfuerzo: S  ·  Zona: libre
- Relacionado: [SEC-002], [POD-155]
- Nodo(s): lib.scripts
- REQUIERE-VERIFICACIÓN-HUMANA: VH-002

## Bugs latentes

## Tecnología vieja

## Rendimiento

## Deuda

## Calidad

## Observabilidad

## Accesibilidad

## ZONA-FRANCO

> Hallazgos sobre `src/lib/leados/`, `setter/`, `admin/leados/`, `admin/leads/_actions/`, `admin/fg2-lab/`, `src/auth.ts`, `src/lib/auth-cookies.ts`, `api/qa/login` y los modelos `OsLead*`/`ActivityChannel`. Se repiten en `09-PARA-FRANCO.md`.
