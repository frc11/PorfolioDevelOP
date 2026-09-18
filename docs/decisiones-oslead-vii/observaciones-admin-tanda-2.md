# OBSERVACIONES VISUALES — ADMIN
### Tanda 2 · 16 capturas · configuración, equipo, clientes, dashboard, chatbots

> Continúa la tanda 1. Misma clasificación: **DEFECTO** · **PROPUESTA** · **DECISIÓN** · **CONFIRMA** · **RESUELTO**.

---

## 1 · El hallazgo que resuelve un pedido abierto — el patrón de pasos ya existe

`22-clients-new` es **un asistente de cinco pasos**: `1. Empresa · 2. Bot · 3. KB · 4. Apariencia · 5. Review`, con barra de progreso arriba, **preview en vivo a la derecha**, y al pie *"Borrador guardado automáticamente"*.

**Es exactamente lo que pediste para el setter**, y está construido, funcionando, en el producto.

Consecuencia práctica: **el sistema de interacción no hay que inventarlo, hay que extenderlo.** El componente de pasos, la barra de progreso y el autoguardado ya viven en el repo. `m1` por fuentes, `m6` en cuatro fases y `mc2` en cinco prompts pueden usar el mismo patrón.

**Y una diferencia con lo que propuse:** este asistente sí avanza por clic ("Continuar →"), y funciona porque cada paso es una decisión que se toma una vez. Mi propuesta de avance por completitud sigue siendo mejor para el setter, donde el paso se completa llenando campos. **Se puede tener el mismo componente con los dos comportamientos.**

---

## 2 · Tres piezas de infraestructura que existen y LeadOS no usa

### El sistema de alertas no vigila nada del pipeline de demos — **DEFECTO**

`16-settings-alerts` documenta **nueve tipos de alerta**, con su condición de disparo y su acción. Corre **cada 15 minutos**, notifica **por email (severidad alta) y por Telegram**.

**Las nueve son del chatbot:** errores del proveedor de LLM, cuota agotada, bot inactivo con tráfico, latencia degradada, cron de insights caído, pico de errores, cliente sin actividad, pico de dominios no autorizados, fallas de captura de lead.

**Ninguna es de LeadOS.** No hay alerta de *setter trabado hace N días*, ni de *demo esperando revisión hace N días*, ni de *lead sin movimiento*.

**El setter que escaló hace 30 días y sigue esperando** habría sido una alerta el primer día. La maquinaria está construida y corriendo; **falta agregar los tipos**.

*(Y la ruta está huérfana: no se linkea desde el menú.)*

### El audit log no audita LeadOS — **DEFECTO**

`26-audit-log` tiene **397 registros**. Todos del chatbot: `BOT_CONFIG_UPDATED`, `BOT_ACTIVATED`, `BOT_DEACTIVATED`, `LEADS_EXPORTED`.

**Aprobar una demo, rechazarla, asignar un setter y marcar un lead como caliente son decisiones comerciales y ninguna queda registrada.**

Y el propio panel de cliente presume de esta trazabilidad: el cambio de plan dice *"motivo (opcional, queda en audit log)"*. LeadOS no tiene ese respaldo.

*(Bug visible de paso: **"ÚLTIMOS 7 DÍAS 0"** y **"TIPOS DE ACCIÓN 0"** con 397 registros y al menos cuatro tipos listados abajo.)*

### El reporte semanal automático existe, y es solo para clientes

`17-settings-reports`: *"Los reportes se envían automáticamente **cada lunes a las 9am (Argentina)**. Incluyen conversaciones, leads capturados y comparación vs semana anterior."*

Once bots activos lo reciben. **El setter no recibe nada, y Franco tampoco.** El hueco G6 —que el setter no ve su propia calidad— tiene acá su mecanismo de entrega ya construido.

---

## 3 · La configuración no configura lo que hace falta — **CONFIRMA**

`15-settings` es "el" centro de control operativo. Contiene: datos de contacto del portal, cinco alertas, **precios de ocho módulos premium**, objetivo semanal de demos, intervalos de follow-up, miembros del equipo, y credenciales de Telegram.

**No hay campo para las cuatro URLs de herramientas. No hay campo para Cal.com.** Confirma la auditoría, y confirma que **esta es la pantalla donde deberían estar**.

**Y hay un patrón que conviene mirar antes de decidir dónde ponerlas:**

| Valor | Qué dice la pantalla |
|---|---|
| Intervalos de follow-up (Día 2 · 4 · 7) | *"Referencia informativa. La lógica vive en `lib/follow-up.ts`"* |
| Hora del cron (9:00 AM Argentina) | *"Referencia informativa para el equipo. La programación del cron no se edita desde esta pantalla."* |

**La pantalla muestra valores que no puede editar y que pueden desincronizarse del código.** Es honesto —lo declara— pero significa que hoy hay tres cosas conviviendo: lo editable, lo informativo, y lo que directamente no aparece (las URLs).

**PROPUESTA:** las cuatro URLs y Cal.com entran como **editables**, en una sección propia de LeadOS. Y los valores informativos se marcan visualmente distinto de los editables, que hoy se ven iguales.

**Dos datos útiles que aparecieron acá:**
- **"Objetivo semanal de demos: 8"** — es configurable y el dashboard mide contra él. **El brief nunca tuvo ese número y existe.**
- **"Miembros del equipo: 3"**, todos `SUPER_ADMIN`. Los setters no figuran.

---

## 4 · "Equipo" no incluye a quien hace el trabajo comercial — **DEFECTO**

`18-team` se llama **"Workload por miembro"** y lista tres personas: Admin, Franco y Valentino. **Ningún setter.**

Y las tres muestran **0.0 h esta semana y 0.0 h este mes**. El dashboard confirma: *"0h · Sin horas registradas en la semana actual"*, *"Valor hora promedio USD 0"*, y el gráfico de horas por miembro dice *"Todavía no hay horas suficientes"*.

**Toda la superficie de horas existe y nadie la usa.** Es una decisión: o se usa, o se saca del dashboard, donde hoy ocupa tres tarjetas y un gráfico entero mostrando ceros. **DECISIÓN de Franco.**

---

## 5 · El dashboard mezcla tres dominios y no dice qué hacer hoy — **PROPUESTA**

`23-dashboard` unifica comercial (LeadOS), operativo (portal SaaS) y financiero. Tiene doce tarjetas y cuatro gráficos.

**Lo que funciona:** *"Demos enviadas esta semana 0/8"* contra el objetivo configurado; *"Tasa de cierre 13% · 4 cerrados de 32 respondidos"*; y las dos tarjetas que dicen **"Requiere atención"** en ámbar, que son las únicas accionables.

**Tres problemas:**

**El trabajo del día vive en dos lugares con números distintos.** El dashboard dice *"Leads pendientes de follow-up hoy: **15**"*. El panel del setter dice *"1 de 47 para trabajar"*. Miden cosas distintas y ninguna lo aclara.

**Tres números de plata que no se explican entre sí:** MRR USD 1.060 · Ingresos del mes USD 0 · Ingresos mensuales acumulados llegando a USD 16.000.

**Y no contesta "qué hago hoy".** Es un tablero de estado, no de acción. Las dos únicas cosas accionables —15 follow-ups y 18 tickets abiertos— están mezcladas entre KPIs históricos.

---

## 6 · Lo mejor de esta tanda

**La ficha de cliente** (`20-client-detalle`) es la pantalla mejor escrita del admin. El copy explica reglas de negocio con precisión quirúrgica:

> *"Reglas: upgrade aplica inmediato y resetea la cuota del mes. Downgrade se difiere al primer día del próximo mes. El bot ve el cambio en ≤60s."*

> *"Precio facturable independiente del plan. **El gating del bot NUNCA lo lee** — es solo para facturación / cortesías / descuentos comerciales."*

**Esa separación entre facturación y permisos, dicha en una línea, es el tipo de claridad que le falta al resto del producto.** Y el botón de impersonar está diferenciado en ámbar, como corresponde a una acción de consecuencia.

**Novedades** tiene el mejor copy de producto del admin: *"Cada feature que entregás se anuncia acá. Los clientes la ven en su panel con un badge; el badge se apaga cuando la leen. Las novedades con fecha caducan solas."* Explica el mecanismo entero en tres oraciones.

**Los estados vacíos** de leads inbound, alertas y evaluaciones dicen qué falta y qué va a aparecer.

---

## 7 · Lo que hay que arreglar y es de datos, no de diseño

**Hay novedades de prueba publicadas a clientes reales.** `25-announcements` muestra:

- **"JAJA / JEJOX"** → publicada a **El Garage**, no caduca, **1 lectura**.
- **"Ben yedder POTM / Salio ben yedder POTM"** → publicada a **todos los clientes**, vencida, **3 lecturas**.

**Cuatro personas de clientes reales abrieron su panel y leyeron eso.** No es un bug del producto: es contenido de prueba que quedó publicado. Se borra hoy.

**Otros:**
- **"Tasa de conversión 117%"** en el detalle del bot Aki — 21 leads sobre 18 conversaciones. El cálculo no tiene tope ni validación.
- **"Dominios autorizados: 0 · Sin dominios"** en un bot activo de un cliente real. El widget se puede embeber desde cualquier lado. Existe una alerta que vigila bloqueos de origen, pero **sin dominios configurados no hay nada que bloquear**.
- **Ocho de los dieciséis clientes y ocho de los once bots son fixtures de QA**, mezclados con los reales en las mismas listas.
- **Ortografía sin acentos** en toda la pantalla de configuración: *"Configuracion"*, *"catalogo"*, *"parametros"*, *"Operacion"*, *"logica"*. El resto del producto sí acentúa. Y el módulo de ojo de diseño llama a esto un delator de QA.
- **Doble estado vacío en alertas:** tres columnas que dicen *"Todo OK"* / *"Vacío"* / *"Vacío"*, y debajo otro bloque grande que dice *"Sin alertas"*.

---

## 8 · Lo que esta tanda cambia en lo ya decidido

| Qué | Cambio |
|---|---|
| **El sistema de interacción** | **El patrón de pasos ya existe** en el alta de cliente. Se extiende, no se inventa |
| **Las cuatro URLs y Cal.com** | Su lugar es la pantalla de configuración, en una sección propia de LeadOS. Y hay que distinguir lo editable de lo informativo |
| **G6 · el setter no ve su calidad** | Ya existe el mecanismo de entrega: el reporte semanal automático de los lunes |
| **El setter trabado** | Ya existe el sistema de alertas que lo cazaría. Falta agregar los tipos de LeadOS |
| **Trazabilidad de decisiones** | El audit log existe y no registra ninguna acción de LeadOS. Aprobar y rechazar deberían quedar |
| **Los "20-30 minutos" del brief** | Hay un objetivo semanal configurado (**8 demos**) y una tasa de cierre medida (**13%**). Son los primeros números reales del proyecto |
