# 🤖 MANUAL MAESTRO DE OPERACIONES: OPENCLAW FRAMEWORK
**Versión:** Edición Extendida "develOP"
**Objetivo del Documento:** Instruir a un Modelo de Lenguaje (LLM) sobre la arquitectura interna, CLI, gestión de Skills y flujos autónomos de OpenClaw para que genere prompts, configuraciones y diagnósticos perfectos.

---

## CAPÍTULO 1: ARQUITECTURA CORE Y TOPOLOGÍA DEL SISTEMA
OpenClaw es un framework de agentes autónomos (Agentic Framework) open-source que corre localmente. No es un chatbot; es un sistema operativo para agentes de IA que pueden interactuar con la computadora, la web y APIs externas.

### 1.1 El Gateway (El Corazón del Sistema)
* **Funcionamiento:** OpenClaw levanta un servidor local llamado "Gateway" (por defecto en `http://127.0.0.1:18789`). Este Gateway intercepta todas las peticiones, enruta los mensajes a los proveedores de LLM, maneja la memoria y mantiene vivos a los agentes en segundo plano (Daemon).
* **Control UI (Dashboard):** Interfaz gráfica accesible desde el navegador web apuntando al puerto del Gateway. Permite ver los logs de pensamiento del agente, gestionar crons y auditar variables de entorno.
* **Diagnóstico:** Si el agente no responde, el primer paso SIEMPRE es verificar la salud del Gateway usando el comando CLI `openclaw doctor` o `openclaw gateway status`.

### 1.2 Canales de Comunicación (Channels)
* Los agentes de OpenClaw no solo viven en la terminal. Pueden conectarse a canales externos.
* **Contexto develOP:** El agente ("Marcelo") opera principalmente a través de **Telegram** mediante un Bot Token. Esto permite asignarle tareas asíncronas desde cualquier lugar y recibir reportes automáticos.

---

## CAPÍTULO 2: SISTEMA DE HABILIDADES (SKILLS Y TOOLS)
OpenClaw es expansible. Los agentes aprenden a usar herramientas leyendo archivos de configuración de Skills. El LLM generador de prompts debe saber cómo estructurar estas habilidades.

### 2.1 Anatomía de un Skill (`SKILL.md`)
Cada habilidad es una carpeta que contiene obligatoriamente un archivo `SKILL.md`. Este archivo se divide en dos partes críticas:
1.  **Frontmatter (YAML):** Define metadatos como el nombre, versión, variables de entorno requeridas (ej. `SERPER_API_KEY`) y comandos de ejecución subyacentes.
2.  **Instrucciones (Markdown):** Texto en lenguaje natural que le explica al modelo *cómo* y *cuándo* usar la herramienta.

### 2.2 Rutas y Scope de los Skills
* **Skills Globales:** Se guardan en `~/.openclaw/skills/`. Disponibles para cualquier agente en la máquina.
* **Skills de Workspace:** Se guardan en `<workspace_del_agente>/skills/`.
* **Skills Activos en develOP:** `self-improving-agent`, `git`, `web-search-plus` (usa Serper.dev para scrapear prospectos), `market-research`, `moltguard`, `ontology`, `productivity`.

---

## CAPÍTULO 3: IDENTIDAD DEL AGENTE Y MEMORIA (SOUL)
Para que un agente actúe de manera consistente, requiere una configuración de "Alma" (SOUL).

### 3.1 El archivo `SOUL.md`
* Es el *System Prompt* persistente del agente.
* **Contexto de Marcelo (develOP):** Debe estar configurado con la personalidad de un "Socio Argentino, experto en ventas outbound y tecnología". Su objetivo es generar leads (concesionarias, restaurantes, clínicas) y escribir código HTML para demos.
* **Restricción para Prompting:** Nunca se le debe pedir a OpenClaw que "actúe como un pirata" o cambie su rol en un prompt normal, ya que su directiva base está fuertemente anclada en su `SOUL.md`.

### 3.2 El Espacio de Trabajo (Workspace)
* OpenClaw lee y escribe archivos de forma autónoma.
* **Ruta de develOP:** `C:\Users\franc\.openclaw\workspace\` (o en su carpeta de proyecto respectiva).
* **Regla de Prompting:** Cuando se le pida a OpenClaw que genere un reporte, el prompt DEBE especificar la ruta exacta de salida (Ej. *"Guarda el top 10 de prospectos en `workspace/ventas/prospectos_hot.md`"*).

---

## CAPÍTULO 4: ROUTING DE MODELOS (PROVIDERS) Y OPTIMIZACIÓN
OpenClaw puede conectarse a OpenAI, Anthropic, Ollama, etc. La elección del modelo determina el ROI (Retorno de Inversión) de las automatizaciones.

### 4.1 Estrategia de LLMs en develOP
El generador de prompts debe optimizar el consumo de tokens asignando el modelo correcto a la tarea correcta:
* **Claude 3 Haiku (El Obrero):** Modelo por defecto. Extremadamente rápido y barato. Se debe usar para: Prospección web masiva (`web-search-plus`), lectura de archivos, formateo de datos, filtrado de listas de leads y resúmenes de mercado.
* **Claude 3.5 Sonnet (El Arquitecto):** Modelo de alto costo y razonamiento profundo. Solo se invoca para: Redacción de scripts complejos, generación de plantillas HTML/CSS avanzadas para Demos, o resolución de bugs graves en la base de datos de OpenClaw.

---

## CAPÍTULO 5: REFERENCIA DE COMANDOS CLI (Command Line Interface)
Para administrar OpenClaw, el LLM generador debe conocer estos comandos y sugerirlos al humano cuando sea necesario:
* `openclaw onboard`: Ejecuta el setup inicial o reconfigura componentes core.
* `openclaw doctor`: Comando de oro. Revisa dependencias, APIs caídas y estado del Gateway.
* `openclaw configure`: Para actualizar tokens de API (Ej. cambiar la API key de Anthropic cuando se lo separa del Plan Pro).
* `openclaw skill add <url>`: Instala una nueva habilidad desde un repositorio.
* `openclaw start --daemon`: Inicia el agente en segundo plano.

---

## CAPÍTULO 6: PROTOCOLO PARA CRONS (AUTOMATIZACIÓN ASÍNCRONA)
OpenClaw ejecuta tareas automáticas (Crons). Los prompts para Crons son distintos a los prompts conversacionales porque el agente está "solo".

### Reglas para Prompts de Crons (Determinismo Puro)
1.  **Cero Ambigüedad:** Un prompt de cron no puede tener instrucciones vagas como "Busca clientes".
2.  **Input/Output Explícito:** Debe indicar qué archivo leer como entrada y en qué ruta guardar la salida.
3.  **Ejemplo Estándar develOP:** *"Son las 3 AM. Lee el archivo `workspace/prospectos/clinicas.md`. Extrae los 3 mejores perfiles. Usa el skill `web-search-plus` para buscar sus sitios webs actuales. Genera un reporte comparativo y guárdalo en `workspace/ventas/daily_hot_leads.md`. No pidas confirmación, ejecuta el guardado."*