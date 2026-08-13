// CARRERAS commit 3 — runLLMSmokeTest/SmokeTestResult eliminados junto con el
// endpoint /smoke (GET público que quemaba una llamada real a Vertex por hit,
// sin auth ni rate limit, y cuyo resultado nadie medía). Si algún día se
// quiere alerting automático del camino LLM, se construye autenticado y con
// provider-close desde el día uno — no se "reactiva" esto. Ver bitácora.
export { checkChatbotHealth } from './checkHealth'
export { buildHealthVerdict } from './buildHealthVerdict'
export type { HealthCheckResult } from './checkHealth'
export type { HealthVerdict, VerdictLevel, VerdictReason } from './buildHealthVerdict'
