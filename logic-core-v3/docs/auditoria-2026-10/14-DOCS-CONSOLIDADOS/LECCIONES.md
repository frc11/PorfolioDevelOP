> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# Lecciones

> **Borrador E11** · base `57c421bc` · destino propuesto `logic-core-v3/docs/LECCIONES.md`.
> Solo las vigentes, cada una con la regla que deja y su fuente. Las reglas del agente siguen en raíz:CLAUDE.md (no negociables y «Lessons learned») y no se repiten salvo cita. Al final, las que quedaron afuera por vigencia dudosa.
> Fuentes: rutas relativas a `logic-core-v3/`; `LL` = `docs/metodo/LECCIONES-LEADOS.md`; `drive:` = `docs/_insumos/drive/`; `CE` y `CP` = contexto estable y profundo del Drive.

## 1. Verificar

1. **Verde no es verificado.** Build y tsc verdes no prueban comportamiento; cada chequeo se reporta con qué prueba y qué no (LL:165-182; docs/bitacora-beta-3.md:1796-1800; drive:Franco/Bloques a Ejecutar/DASHBOARD/ROADMAP-CHATBOT-bloques-C.md:93). Es la base de raíz:CLAUDE.md:21 (docs/sprints/alpha-RESUMEN-FINAL.md:61).
2. **`migrate status` no ve el drift estructural.** Dio verde con 7 columnas de drift; lo caza `prisma migrate diff --from-schema-datasource` (docs/bitacora-beta.md:1746; docs/admin-changelog/Operaciones rdc.md:66; docs/smoke-report.md:181).
3. **El exit code de un chequeo pipeado es el del pipe.** Leerlo sin `| tail` o con `${PIPESTATUS[0]}` (LL:94-107; docs/bitacora-roadmap.md:17106-17121).
4. **El invariante ejecutable es la verificación que no se evapora.** Toda garantía que hoy se verifica mirando va a un `*.invariant.ts` sin DB ni red; el proyecto pasó de 10 a 55 (LL:265-291; docs/bitacora-beta-3.md:10945).
5. **Un invariante crítico se acepta recién después de verlo fallar** ante un sabotaje controlado del guard (CE:58). Ya hubo falsos verdes: el gate del self-check unía por texto visible y no por id (docs/auditorias/C0-RED-DE-VERIFICACION-2026-08.md:36-52).
6. **Antes de tocar un guard sin cobertura, un test de caracterización** (LL:213-236).
7. **La suite verde mide lo que cubre, no lo que importa:** censar la cobertura antes de tocar una zona (LL:243-259).
8. **El autorreporte de un agente no es estado verificado:** es una hipótesis con evidencia a revisar (LL:139-157). Caso extremo: los reportes de OSLead VII sin un solo símbolo en git (LEADOS.md §6).
9. **Los guardrails son estructurales** (invariantes, tests, deny rules); una regla pegada en el prompt se puede fingir (drive:Franco/Work Flow/Iniciar Nuevo Chat/config-ejecucion-claude-desktop.md:86).
10. **Medir antes de afirmar.** Varios «graves» de un análisis superficial resultaron falsos al medirlos (docs/auditoria-total-pre-deploy.md:84, 88, 104); el instrumento casi nunca mintió, las inferencias sobre él sí (drive:Franco/Work Flow/04-MAPA (1).md:166-171).
11. **Si la verificación fuerte no está, se declara el proxy** y qué no prueba (LL:187-205).
12. **La verificación adversarial baja falsos positivos** (docs/auditoria-consistencia-setter.md:9-14; docs/baselines/2026-07-auditoria-seguridad.md:33-35).
13. **Con `ignoreBuildErrors`, un build verde no prueba nada**; además los invariantes corrían con type-stripping (docs/baselines/2026-07-auditoria-seguridad.md:89; docs/probe-poda-terreno.md:1149, 1160).
14. **Lint no es baseline:** distinguir errores nuevos de aceptados (docs/admin-changelog/Operaciones rdc.md:68). Los reportes de lint y tsc trackeados se regeneran, no se citan (docs/microaudit-frozen-frontera-CO.md:285-305).
15. **Separar los asserts deterministas del juez LLM:** el juez nunca decide lo que un assert puede verificar (docs/sprints/q1-2-scoring.md:12-14).

## 2. No creerle a los docs

16. **La doc de estado miente; el árbol dice los hechos.** STATUS.md afirmaba «0 failed» y un brief mock, y a agosto estaba tres meses atrasado (docs/audits/2026-06-revalidacion.md:7; docs/auditorias/A1-CENSO-SUPERFICIES-2026-08.md:264-265; docs/bitacora-rediseno.md:3680; CP:178).
17. **Las premisas de los briefs suelen ser falsas** (Playwright «bloqueado», googleapis «instalado», cron «agendado»): discovery antes de tocar, y frenar si no coincide (docs/bitacora-beta-2.md:52-58; docs/sprints/p3-a-1-gbp-connection.md:31-33; docs/bitacora-roadmap.md:13841).
18. **Los números de línea de una auditoría caducan:** se re-descubren (drive:Franco/Bloques a Ejecutar/CHATBOT/HANDOFF-cierre-sesion-evolucion.md:87).
19. **Los docs de decisiones sobreestiman lo reutilizable:** «el componente de pasos ya existe» eran 32 líneas (docs/auditorias/A3-VIABILIDAD-DECISIONES-2026-08.md:86-92).
20. **El comentario de decisión en el código es fuente** y sobrevive a los documentos; una decisión diferida se escribe donde va a mirar el siguiente (LL:466-491, 609).
21. **El pedido literal puede ser exactamente la regresión:** se ejecuta contra el terreno (LL:326-354).
22. **Escribir el manual con honestidad encuentra bugs** que auditorías y tests no vieron (docs/HANDOFF-LEADOS-CIERRE.md:142-144).
23. **Verificar completitud contra el registro, no contra la memoria** (HANDOFF-cierre-sesion-evolucion.md:88).

## 3. Git, worktrees y entorno

24. **Una sesión, un worktree**, con puerto y distDir propios; `git add` por pathspec y `git diff --cached` antes de commitear (LL:33-60; docs/bitacora-beta-3.md:1808-1818; docs/probe-poda-terreno.md:1114-1117).
25. **Un fix que vive solo en el working tree no es un fix**, y un arreglo en una rama sin mergear no protege lo desplegado (LL:67-88; docs/baselines/2026-07-auditoria-seguridad.md:80-89).
26. **Preparar una purga no es ejecutarla:** verificar en el remoto (docs/audits/2026-06-revalidacion.md:22, 40).
27. **GitHub Actions solo descubre workflows en `<raíz>/.github/workflows`:** el `e2e.yml` anidado nunca corrió (docs/microaudit-frozen-frontera-CO.md:240-250).
28. **Tailwind 4 escanea los `.md` de `docs/`:** una clase arbitraria con URL citada en una bitácora envenenó el build; todo distDir alternativo se ignora antes del primer build (docs/bitacora-beta-3.md:3647-3656, 10924-10935).
29. En Git Bash, `git show <ref>:<path>` da falsos negativos de ausencia: usar `ls-tree` (docs/bitacora-beta-3.md:10968-10971). `git grep` en vez de `grep -r`, porque `.claude/worktrees` devuelve líneas falsas (docs/probe-construccion-p6.md:620-631).
30. Después de borrar una ruta, rebuild antes de `tsc` (docs/bitacora-roadmap.md:17122-17124). `npx tsc` puede tomar un binario global: usar `node_modules/.bin/tsc`; «Model does not exist» con el modelo presente es un cliente Prisma viejo (docs/admin-changelog/Operaciones rdc.md:63-64).
31. Cada worktree necesita su `.env.local` y su `npm install`; los merges no se delegan; seeds y migraciones los corre un humano (docs/client-portal/changelog/general.md:90, 101, 104).
32. **Verificar el entorno antes que el código:** el «preloader roto» era el reduced-motion de Windows (docs/admin-changelog/Chatbot rdc.md:183).
33. Al enmascarar un `DATABASE_URL`, cortar antes del `@` imprime parte del password (docs/diagnostico-visual-2026-08/REPORTE.md:219-222).
34. Un test intermitente se mide, no se re-corre; los tests durables se auto-provisionan y limpian por id exacto (LL:414-457).

## 4. Datos y migraciones

35. **La Neon dev es compartida:** dos lanes con migraciones opuestas dropearon columnas en uso; las aditivas se avisan y nada se aplica sin commit y push (docs/bitacora-beta.md:1746-1747; drive:Olme/registro-cambios-2026-07-13-panel-PD1-PA-CO5.md:66-74).
36. Postgres no tiene `ALTER TYPE … DROP VALUE`: sacar un valor de un enum es irreversible sin recrear el tipo (docs/audits/2026-05-auditoria-db.md:43; docs/auditorias/A3-VIABILIDAD-DECISIONES-2026-08.md:100-108).
37. `pg_stat_user_indexes` de una base sin tráfico no sirve para decidir borrados (docs/roadmap-pendientes.md:99).
38. Operaciones destructivas: backup de las filas crudas, script que aborta fuera del host esperado y runbook aparte para prod (docs/audits/2026-05-cleanup-db-dev.md:31-33, 253-273).
39. Antes de borrar algo «sin consumidores en src», buscar fuera: un seed consume `premium-modules.ts` (docs/bitacora-rediseno.md:3380-3384).
40. Distinguir cambio de etiqueta visual de cambio de dato: la org develop la comparte el chatbot de producción (docs/admin-changelog/Proyectos rdc.md:83).
41. Un backup nunca restaurado es una esperanza; uno que falla y se normaliza es peor que no tenerlo (CP:101).
42. La parada obligatoria evitó un hard-delete irreversible construido sobre una premisa falsa (docs/admin-changelog/Clientes rdc.md:76).

## 5. Serverless y runtime

43. El trabajo fire-and-forget corre carrera contra el freeze de la lambda: DB primero garantiza el dato, no la notificación (docs/bitacora-roadmap.md:17125-17147).
44. Con Next Runtime v5 en Netlify, nombrar una ruta en `netlify.toml` no la agenda (docs/bitacora-roadmap.md:13841-13850).
45. Un rate limit en memoria no sirve en serverless: un Map por lambda (docs/auditoria-seguridad-2026-05.md:144-160).
46. Una integración externa puede morir en silencio: Cal.com v1 se apagó y `getCalSummary` devuelve null sin avisar (docs/b7-probe-cal-com.md:14).
47. Un cast `as` tapó un casing GOOGLE/google y el bot dio 500 unos 12 días: normalizar en un helper y borrar los casts (docs/audits/2026-06-revalidacion-dashboard-chatbot.md:19-21, 221).
48. Las server actions no pasan por el middleware y un gate en layout es solo de render (docs/baselines/2026-07-auditoria-seguridad.md:45, 60-62).
49. Con `unstable_cache`, `Number()` y no `.toNumber()`, porque el cache serializa los Decimal (docs/client-portal/changelog/chatbot.md:123). Para form-state, `z.input` y no `z.infer` (docs/admin-changelog/Chatbot rdc.md:180).

## 6. UI

50. Un `backdrop-filter` en un ancestro atrapa los `position: fixed`: portal a `body` o blur en un hermano (docs/admin-changelog/Revision demos rdc.md:82; docs/client-portal/changelog/general.md:13-18).
51. Grep de montaje antes de editar: varios fixes cayeron en código muerto (docs/admin-changelog/Chatbot rdc.md:178).
52. Paridad config ↔ widget: todo campo de estilo se cablea en la preview y en el widget real (docs/admin-changelog/Chatbot rdc.md:179).
53. Una condición de negocio repetida en más de un lugar es una bomba: va a un helper (docs/admin-changelog/Proyectos rdc.md:82).
54. Retirar una superficie incluye retirar su vocabulario (LL:361-381). La poda mató pantallas, pero los defectos migraron con los controles (docs/verificacion-arranque-oslead-vii.md:67).

## 7. Producto y negocio

55. Nunca inventar datos ni cifras en copy o demos; lo que falta queda marcado y visible (docs/sprints/sprint-b05-sanidad-sitio.md:22-30; docs/bitacora-rediseno.md:533-537; docs/sprints/p3-a-2-venta.md:84-86).
56. Caso Matsu: el cierre siempre con Franco presente, y toda promesa comercial se audita contra el código antes de firmarla (CP:10-13; drive:Franco/Work Flow/handoff-producto-develop.md:25).
57. Un bug de autorización no se delega a autoaprobación: primero se define la regla de negocio (docs/admin-changelog/Equipo rdc.md:67).

## 8. Método

58. Un pendiente que aparece tres veces se vuelve sprint o decisión explícita; el ruido recurrente es una tarea de una línea (LL:390-407, 609).
59. Si un sprint de la cadena frena, se reporta el hueco y se sigue con el hueco a la vista (docs/bitacora-beta-3.md:1788-1794).
60. Lo fuera de scope se nombra con `archivo:línea`, qué hacer y criterio de éxito; todo informe declara lo que no pudo establecer (LL:520-564).
61. Nunca `/loop` en auditorías ni tareas diseñadas para consumir cuota: sin criterio de terminación no converge (CP:185-186; HANDOFF-cierre-sesion-evolucion.md:62, 86).
62. Arreglar una trampa puede fabricar otra: un fix al harness cambia el presupuesto de todo lo que lo usa (LL:300-319).

Dónde vive el método: WF + ECC en raíz:CLAUDE.md:115-151; Cimiento y Manual de Flujo en el Drive de Franco (drive:Franco/Work Flow/develOP-manual-flujo (1).md; drive:Franco/Work Flow/Iniciar Nuevo Chat/develOP-cimiento-chat (7) (1).md); docs/metodo/PROPUESTA-CIMIENTO.md propone 21 cambios (M-01 a M-21). **[A DECIDIR]** dónde vive el método.

## Quedaron afuera (revalidar antes de usarlas)

- Build local con `NODE_OPTIONS=--max-old-space-size=6144` (docs/bitacora-beta.md:1733).
- Sin preview en el subagente visual-qa, declarar el proxy (docs/roadmap-pendientes.md:165-169).
- Pre-flight y smoke entre sprints (docs/sprints/alpha-RESUMEN-FINAL.md:54-58).
- Health que valida la env legacy `CHATBOT_GOOGLE_API_KEY` (docs/audits/2026-06-revalidacion.md:20).
- Los seeds no revierten actividades (docs/diagnostico-visual-2026-08/REPORTE.md:201-218).
- El gate de 2500 ms del preloader sin el canvas 3D (docs/probe-b2-hero-nav.md:236-250).
- «El próximo paso de mayor valor es el dato del piloto» (docs/b8a-ii-auditoria.md:75-79).
