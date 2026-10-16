> BORRADOR de la auditoría 2026-10 (E11, DEC-44). No reemplaza todavía a ningún doc: borrar y reemplazar es un sprint posterior (ver `10-PODA.md` §docs). Cada afirmación lleva su fuente.

# Visión

> **Borrador E11** · auditoría 2026-10 · base `57c421bc` · destino propuesto `logic-core-v3/docs/VISION.md`.
> Fuentes: rutas relativas a `logic-core-v3/`; `raíz:` = raíz del repo; `atlas:` = `docs/auditoria-2026-10/06-ATLAS/`; `INV` = `docs/auditoria-2026-10/01-INVENTARIO.md`; `CE` = `docs/_insumos/drive/Franco/Work Flow/Proyecto DevelOP/Contexto/develOP-contexto-estable-v1.0.md`; `CP` = `develOP-contexto-profundo-v1.0.md` (misma carpeta); `HP` = `docs/_insumos/drive/Franco/Work Flow/handoff-producto-develop.md`. Los del Drive son copias locales sin trackear; el original es de Franco.
> **[A DECIDIR]** marca lo que las fuentes contradicen. No se resuelve acá: está en la lista `a_decidir` de E11.

## 1. Qué es develOP

- Agencia de desarrollo web, IA y automatización de **dos personas**, en Tucumán, que vende a PyMEs de Argentina y LATAM (CE:8; raíz:PRODUCT.md:27).
- Franco es co-fundador y lead técnico-comercial: planifica, decide arquitectura y cierra personalmente todas las primeras ventas. Valentino es socio técnico-ejecutor y en esta etapa no cierra tratos (CE:9-10).
- Ser dos es parte del posicionamiento: el prospecto habla con quien construye (raíz:PRODUCT.md:35).
- **[A DECIDIR]** En mayo el sistema se definía como «un chatbot multi-tenant para PyMEs LATAM» (STATUS.md:16); el contexto de julio lo define como agencia cuyo chatbot es la dirección estratégica (CE:8, 13-14).

## 2. Cómo gana plata

- Hoy los ingresos entran por **sitios web premium por proyecto**, de pago único (CE:13).
- La dirección estratégica es el **producto productizado**: chatbot multi-tenant con IA más mantenimiento web, por suscripción. Está construido y, según el contexto de julio, sin cliente pago en producción (CE:14). **[A DECIDIR]** otras fuentes nombran clientes reales (ver §8).
- La web es el gancho; la ganancia de fondo está en los servicios (chatbot, automatizaciones, mantenimiento) y en el panel (CE:15).
- Posicionamiento: LLM real + servicio gestionado + precio LATAM flat, en el hueco entre el autoservicio (Cliengo, Landbot) y el enterprise de precio oculto (CE:16).
- La calidad no sale del modelo sino del andamiaje: prompt, tools, KB, scoring y evaluación. Eso es lo que develOP vende (CE:46).
- Programa Fundadores: sitios premium sin costo a negocios locales seleccionados, a cambio de prueba social y presentaciones. El regalo existe solo dentro del programa (CE:15, 17; CP:122-138).
- El cierre lo hace siempre Franco; el setter es el paso 6, después de 2 o 3 cierres propios y un guion probado (CP:12-13). **[A DECIDIR]** el brief del setter hace arrancar a Toba apenas la herramienta esté lista (docs/BRIEF-VISION-FLUJO-SETTER-v3.md:33).

## 3. A quién le vende

- Dueño de PyME no técnico que decide solo, sin intermediarios (CE:23; raíz:PRODUCT.md:17-19).
- Calificación: el dolor de perder leads tiene que importarle; un dueño indiferente a su presencia digital es mal candidato (CE:26). El prospecto real puede invertir unos USD 800 (HP:139).
- Secuencia de verticales del chatbot: concesionarias y usados, después salud privada (con gate de compliance por la Ley 25.326) y después inmobiliarias (CE:24-25). En el código existen los packs `base`, `agencia` y `usados` (`src/modules/chatbot/server/verticals/packs/`).
- Rubros que declara el home: clínicas, concesionarias, comercios, inmobiliarias, gimnasios, restaurantes, distribuidoras, constructoras y mayoristas (docs/probe-monolito-censo.md:355-371).

## 4. Qué vende hoy

Regla madre: todo cae en VENDIBLE, MENCIONABLE o NO EXISTE, y solo lo primero se vende como listo. Nace del caso Matsu (HP:15-25).

| Categoría | Qué | Fuente |
|---|---|---|
| Vendible | Página web premium a medida, entrega en 2–3 semanas | HP:32 |
| Vendible | Chatbot con IA integrado a la web, con planes mensuales | HP:33 |
| Mencionable | Software a medida (sin precio ni producto estándar) | HP:36 |
| Mencionable | Automatizaciones | HP:37 |
| Mencionable | Panel del cliente avanzado (el básico viene con el chatbot) | HP:39 |
| No se promete | Integración WhatsApp | HP:38 |
| En desarrollo | Memoria del visitante, catálogo visual, reserva de turnos, consultas sin responder, reporte a medida | HP:41-42 |

Los 4 servicios del sitio, cada uno con su landing: desarrollo web (`/web-development`), IA (`/ai-implementations`), automatización (`/process-automation`) y software a medida (`/software-development`) (raíz:PRODUCT.md:50-54). Acentos: raíz:CLAUDE.md:99-103 y raíz:DESIGN.md:120-125. **[A DECIDIR]** raíz:PRODUCT.md:54 y AGENTS.md:56-58 asignan otros colores.

### 4.1 Página web

- Lista USD 1.000, piso USD 800; por debajo de 800 no se toca (HP:49, 155).
- **[A DECIDIR]** El home publica precios «desde»: sitios $800, IA $300, automatización $200, software $1.500 (src/components/sections/home/OurServices.tsx:70, 88, 106, 124), mientras raíz:PRODUCT.md:41 dice que no hay pricing público.

### 4.2 Chatbot: planes que siembra el código

| Plan | USD/mes | Piso de setup (`setupFloorPrice`) | Conversaciones/mes | Dominios | Reportes | Insights | CRM | Soporte |
|---|---|---|---|---|---|---|---|---|
| Starter | 49 | 700 | 500 | 1 | no | no | no | STANDARD |
| Pro | 90 | 900 | 3.000 | 3 | sí | sí | no | PRIORITY |
| Business | 150 | 1.000 | 5.000 | sin tope | sí | sí | sí | PRIORITY_24H |

Fuente: prisma/seeds/sync-plans.ts:66-114; decisión en docs/bitacora-roadmap.md:1977-2030. Los tres planes usan `gemini-2.5-flash` (sync-plans.ts:73, 89, 105).

- **[A DECIDIR]** El handoff de producto pone el setup en «~USD 300–400, a confirmar» (HP:58, 166), lejos de los pisos sembrados.

### 4.3 Módulos premium

Los planes no incluyen módulos: son add-ons que se piden con `requestUpsellAction` y no se autoactivan (docs/bitacora-roadmap.md:2495-2501). Catálogo en `src/lib/data/premium-modules.ts`:

| Módulo | USD/mes | Estado en código | Línea |
|---|---|---|---|
| Motor de Reseñas Automático | 60 | ACTIVE | :24-34 |
| Email Marketing Pro | 80 | ACTIVE | :38-48 |
| Agenda Inteligente 24/7 | 80 | ACTIVE | :52-63 |
| Tienda Online Conectada | 150 | ACTIVE | :67-78 |
| WhatsApp Autopilot | 150 | COMING_SOON | :84-94 |
| Facturación AFIP Automática | 120 | COMING_SOON | :98-108 |
| Cobranzas Automatizadas | 90 | COMING_SOON | :113-123 |
| Reactivación de Clientes | 90 | COMING_SOON | :127-137 |

- **[A DECIDIR]** Precio del Motor de Reseñas: la pantalla de venta deja `[FALTA:precio]` (docs/sprints/p3-a-2-venta.md:84-86) y la vitrina muestra 60.
- **[A DECIDIR]** Módulos ACTIVE con la integración caída: la Agenda depende de Cal.com v1, apagada (INV:109). El Atlas propone los 4 módulos activos para «después» (atlas:atlas.curado.json:124, 131, 138, 145).

### 4.4 Mantenimiento web y descuentos

- Ediciones chicas gratis desde el panel; cambio mediano desde USD 50; grande desde USD 100; correctivos siempre incluidos (HP:61-66). **[A DECIDIR]** «ediciones ilimitadas desde el panel» figura también como promesa que el producto no cumple (CP:13).
- Referido 15 %, fundador 15 % el primer año; la oferta tipo Matsu es palanca de Franco, no precio de lista (HP:68-72). En el panel, el programa de referidos ofrece un mes bonificado (docs/bitacora-roadmap.md:11777).

## 5. Qué promete y qué no

- «Nunca inventa» es el activo de confianza central y el escudo legal: la KB la gestiona develOP y nunca se autoactualiza (CE:34).
- Integridad: no se publican testimonios, logos, métricas ni casos inventados (raíz:PRODUCT.md:75, 83; CE:67). **[A DECIDIR]** el home pinta claims sin fuente en el repo, como +340 % de consultas, 94 % de respuesta automática, 23 h por semana o «CASO REAL / CLIENTES REALES» (docs/probe-monolito-censo.md:411-460).
- Frontera de promesa del setter presencial: vende y agenda página + chatbot; menciona software, automatizaciones y panel avanzado; nunca dice que algo en desarrollo está listo ni da precio de combo (HP:107-112).
- Privacidad: lo que se puede y no se puede afirmar a un cliente está en SEGURIDAD-Y-PRIVACIDAD.md §1.
- Superficies de cliente sin jerga técnica: todo lo técnico vive en `/admin` (CE:63).

## 6. Las superficies del sistema

| Superficie | Para quién | Qué hace | Fuente |
|---|---|---|---|
| Sitio público y 4 landings | Visitante | Vende la agencia; un solo CTA a WhatsApp | raíz:PRODUCT.md:29-31; CE:19 |
| Widget y API del chatbot | Visitante del sitio de un cliente | Conversa, capta leads, deriva a humano | atlas:arquitectura.md:68 |
| Portal del cliente `/dashboard` | Dueño (ORG_MEMBER) | Panel de resultados del negocio en idioma de dueño | docs/bitacora-roadmap.md:9760; CP:62-69 |
| Admin `/admin` | develOP (SUPER_ADMIN) | Opera todos los clientes | atlas:arquitectura.md:70 |
| LeadOS `/setter` | Setter interno | Prospección con demo hecha | docs/BRIEF-VISION-FLUJO-SETTER-v3.md:15-27 |
| Motor WhatsApp | — | Construido y latente | INV:112 |

Detalle técnico en ARQUITECTURA.md; LeadOS en LEADOS.md.

## 7. Lo que se decidió no hacer

Registro anti-reproposición: no se reabre sin razón nueva (CP:195-196).

- Producto y chatbot: fine-tuning por cliente, KB que aprende sola, doble chequeo LLM de cada respuesta, RAG con embeddings, multi-idioma, gamificación del widget, Instagram DM y WhatsApp directo como canal, más insights con IA, failover Vertex→Anthropic, digest por WhatsApp, follow-up automático de tibios (CP:198-209). El matiz de WhatsApp está en **[A DECIDIR]**.
- Panel: white-label tipo GoHighLevel, bandeja omnicanal, centro de recursos, métricas de vanidad, benchmarks contra el rubro, PWA y push, mini-CRM genérico (CP:211-218).
- Comercial: condicionar la página gratis a consumo, dos propuestas según tipo de cliente, referidos como obligación, limitar el regalo por cantidad de páginas (CP:220-224).
- Operación: mega-prompt de bloque sin checkpoints, modelo top por disponibilidad, adelantar features por ventana de herramienta, «ya que estoy» en un fix urgente, reescribir historia de una rama en uso ajeno (CP:232-238).

## 8. Clientes y prueba social

- **Matsu**: concesionaria, plan Business. En mayo estaba contratado con onboarding pendiente (STATUS.md:174-180); después quedó en Business con override de USD 0 hasta el 2026-08-22 (docs/bitacora-roadmap.md:2423-2426). Es el caso de aprendizaje, no de éxito (HP:147).
- **San Miguel**: citada como cliente piloto de USD 4.000 (docs/audits/2026-05-auditoria-profunda.md:16), como data mock en mayo (STATUS.md:182-184) y sin dato medible publicable (HP:148).
- **[A DECIDIR]** si hay cliente pago en producción y qué caso es publicable.

## 9. Riesgos que el negocio ya nombró

- Franco concentra planificación, arquitectura, verificación y curación: es el punto único de falla (CP:188).
- El «riesgo Matsu»: prometer comercialmente lo que el producto no hace (CP:13; HP:25).
