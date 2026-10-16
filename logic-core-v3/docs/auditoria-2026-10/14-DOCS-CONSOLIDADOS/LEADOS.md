> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# LeadOS — el Panel del Setter

> **Borrador E11** · base `57c421bc` · destino propuesto `logic-core-v3/docs/LEADOS.md`.
> **Zona de Franco.** Esta página dice lo que el código y los docs establecen hoy; las decisiones de producto son de Franco y las que se contradicen están marcadas **[A DECIDIR]**. La ley escrita sigue siendo docs/BRIEF-VISION-FLUJO-SETTER-v3.md (abajo `BRIEF`), que se mantiene.
> Fuentes: rutas relativas a `logic-core-v3/`; `MAPA` = `docs/metodo/MAPA-LEADOS.md` (escrito sobre 6a88cbe; las líneas de código de abajo están actualizadas a la base); `OSL` = `docs/_insumos/drive/Franco/Bloques a Ejecutar/OSLEAD/Documento sin título.md`.

## 1. Para qué existe

- Un manual que se ejecuta, para que un setter sin experiencia técnica ni con IA produzca demos de nivel en serie. No es CRM ni panel de métricas: saca a Franco del camino crítico sin sacarle el criterio (BRIEF:15-27).
- Usuarios: Toba (setter online) y Peter (presencial, no construye demos) (BRIEF:31-38, 165).
- Recorrido: ficha → Evaluador → opener → demo con brief → construcción → borrador en Netlify → chequeo → revisión de Franco → link → reunión por Cal.com; Franco revisa cada demo y marca los calientes (docs/auditorias/AUDITORIA-CIERRE-2026-07.md:13).
- Números de realidad (hipótesis): 20–30 minutos por demo, 1 cierre cada 5–7 demos, un negocio a la vez, unos 20 minutos de revisión de Franco (BRIEF:173-180).

## 2. Qué hace el código hoy

- Pasos: 15 `PANTALLA_IDS` sobre 6 rutas, 11 en `ORDEN_MANUAL` (docs/verificacion-arranque-oslead-vii.md:48-50; docs/auditorias/A3-VIABILIDAD-DECISIONES-2026-08.md:1180-1186).
- Home: cola de trabajo de 5 (src/lib/leados/cola.ts); foco sticky por cookie (src/lib/leados/foco-cookie.ts:22); el pin ordena; los postergados vencidos vuelven (DECISIONES D-56 a D-60).
- Orden del contacto en el código: el opener va **sin link y sin precio**; el link sale solo con la demo aprobada por Franco y el negocio enganchado (docs/manual-usuario/00-INDICE.md:43-51; src/lib/leados/flow.ts:92). **[A DECIDIR]** el BRIEF pide demo-first: llegar con la demo hecha y que el primer contacto ya lleve el link (BRIEF:11, 80-88).
- Aislamiento por `OsLead.assignedToId` (src/lib/leados/ownership.ts; docs/leados-alta-setter.md:3-6).

## 3. El motor y sus líneas rojas

| Gate | Dónde en `57c421bc` | Regla |
|---|---|---|
| Brief | src/lib/leados/flow.ts:81 `gateBriefAbierto` | el lead respondió o Franco lo marcó caliente |
| Envío a revisión | src/lib/leados/flow.ts:204 `selfCheckAprobado` y `draftUrl` | los hard checks vigentes en verde; el server valida contra la DB, no contra el blob |
| Envío del link (la línea inviolable) | src/lib/leados/flow.ts:92 `gateEnvioDemo` | APROBADA, con `finalUrl` y `gateBriefAbierto` |
| Agenda | src/app/(protected)/setter/_actions/agenda.actions.ts:84 `gateAgenda` | RESPONDIO y sin reunión |

Fuente de la tabla: MAPA:112-129.

- Una sola copia por regla: `gateEnvioDemo` compone `gateBriefAbierto` y un invariante fija esa composición (`gate-envio-demo.invariant.ts`) (MAPA:121-124).
- `transitionDossier` es la única puerta del stage (src/lib/leados/dossier.ts:116).
- Líneas rojas: la línea de envío, `transitionDossier`, los `where` de ownership (`src/lib/leados/isolation.ts`), los claims atómicos, `ESCALADO_RESET`, el flag `caliente` (de Franco), el cierre a PERDIDO (nunca automático) y `migrate reset` (MAPA:349-361).
- Trampas ya pagadas: `ESCALADO_RESET` corre en cada transición; el autorreporte no puede volverse gate; retirar una superficie deja su vocabulario vivo (MAPA:363-375).
- Reglas inviolables del BRIEF: DECISIONES D-64 (BRIEF:98-104).

## 4. Decisiones vigentes

DECISIONES.md §G (D-56 a D-65) y, para las de vigencia dudosa, «Vigencia sin confirmar».

## 5. Qué traba hoy al setter

- **Herramientas sin link:** 4 de 5 tienen `url: null` (Evaluador, Gem de diseño, Claude Design, Gem de outreach); solo Netlify Drop tiene link y no hay pantalla para cargarlas (src/lib/leados/herramientas.ts:63, 78, 90, 105, 117; docs/diagnostico-visual-admin-2026-08/REPORTE.md:180-200). Es el único bloqueo real del recorrido, repetido en julio y en agosto (docs/auditoria-recorrido-completo-novato.md:13, 44-50; docs/corrida-recorrido-2026-08-31/REPORTE.md:72-96).
- **Cal.com:** `calComUsername` en NULL en las 16 orgs y nadie escribe esos campos (docs/verificacion-arranque-oslead-vii.md:71-77); con más de una org conectada, la agenda aborta (src/lib/leados/agenda.ts:70-81).
- **Baches del recorrido del 31 de agosto:** B1 a B9 (herramientas sin link, error para programador, tildes que no guardan, pantalla que no acompaña al dato, entre otros) y latencias de 3 a 6 s por acción (docs/corrida-recorrido-2026-08-31/REPORTE.md:51-260).
- **Cola de revisión de Franco:** mide 8.662 px de alto y se ven 756 (docs/diagnostico-visual-admin-2026-08/REPORTE.md:384-391).
- La poda mató pantallas, pero los defectos migraron con los controles (docs/verificacion-arranque-oslead-vii.md:67).

## 6. Trabajo reportado y no integrado (OSLead VII)

- Los reportes de agente dicen implementados P43 (mc2 «Refinar» con 5 prompts), M14 (15 checks), la calibración del self-check, M1 (calidad de ficha), G2 (ángulo wow) y F1–F4 (OSL:1-4, 322-365, 427-455, 477-491, 580-641, 643-680).
- Ningún símbolo está en `57c421bc` ni en commit alguno: `git log --all -S` de `obtenerAnguloWow`, `ESTADO_ITEM_CHEQUEO` y `registrarCorteFicha` da vacío; solo aparece un WIP (506e0059) en `origin/p25/rafaga-tildes`. **[A DECIDIR]** recuperarlo o darlo por perdido.
- La auditoría adversarial de ese compilado (H-01 a H-09) sigue aplicando a la base en varios puntos: ROADMAP.md §5.3.

## 7. Los docs de LeadOS que quedan

- docs/BRIEF-VISION-FLUJO-SETTER-v3.md: la ley; se mantiene. **[A DECIDIR]** qué brief rige: el v3 tiene 11 secciones, otros docs citan §12 a §23 y hay un v4 sin commitear.
- docs/manual-usuario/: el manual del setter. Está desfasado por P11 y hay que regenerarlo (docs/verificacion-arranque-oslead-vii.md:52-56); la galería se genera con `scripts/dev/m0-galeria-indice.ts`.
- docs/experimentos/fg2-brief-experimento.md: hasta que se decida FG-2.
- Munición de prompts: los textos de docs/MUNICION-PROMPTS-Y-SKILL.md pasan a un anexo de esta página o al código (`src/lib/leados/prompts-disenio.ts` tiene 3). La regla: la herramienta guarda el texto del prompt y recibe el link, nada más (docs/MUNICION-PROMPTS-Y-SKILL.md:10).

## 8. Si vas a tocar LeadOS

1. Leer §3 y los comentarios de decisión del código como fuente (docs/metodo/LECCIONES-LEADOS.md:466-491).
2. Test de caracterización antes de tocar un guard sin cobertura (LECCIONES-LEADOS.md:213-236).
3. Premortem antes de tocar el motor (BRIEF:104).
4. Sacar un valor de un enum (por ejemplo EVALUADA) es irreversible sin recrear el tipo (docs/auditorias/A3-VIABILIDAD-DECISIONES-2026-08.md:100-108).
5. Las decisiones de OSLead VII no se presupuestan sin contrastarlas con el código: 10 no se pueden construir como están escritas, implican 14 cambios de schema (7 destructivos), y el mecanismo propio no alcanza para S2, S3 y S4 (A3-VIABILIDAD-DECISIONES-2026-08.md:55-108; docs/auditorias/A3-VIABILIDAD-BIS-2026-08.md:92-140).
