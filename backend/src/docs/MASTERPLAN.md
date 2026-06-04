# ProbaEstado — Masterplan (Hackathon Web3)

Última actualización: 2026-06-04

---

## 1. Resumen Ejecutivo

ProbaEstado es una plataforma de transparencia ciudadana que permite a la ciudadanía reportar incidencias y hechos relevantes (infraestructura, seguridad, medio ambiente, etc.) y registrar evidencia inmutable en blockchain. Combina un frontend moderno (React + Vite), un backend robusto (Node.js + Express), persistencia con MongoDB, integraciones con Discord para entrada ciudadana, motores de IA para análisis y resumen, y registro en Syscoin Tanenbaum Testnet usando Ethers.js.

El sistema incluye además un subsistema de auditoría para trazabilidad y un orquestador multi-agente (MasterAgent) que coordina agentes especializados: ReportAgent, VerificationAgent, AIAgent y DiscordProxyAgent.

---

## 2. Objetivos Generales

- Facilitar la recepción, verificación y registro confiable de reportes ciudadanos.
- Garantizar trazabilidad e integridad de la información mediante blockchain y auditoría.
- Automatizar análisis y priorización mediante IA y agentes especializados.
- Proveer una integración segura y escalable con Discord para acceso ciudadano.

---

## 3. Objetivos Específicos

- Diseñar e implementar una API RESTful en Express con endpoints de reportes, verificación y auditoría.
- Generar hashes SHA256 de reportes y registrarlos en Syscoin Tanenbaum Testnet.
- Implementar agentes que automaticen clasificación, verificación y generación de resúmenes.
- Asegurar que cada acción importante quede registrada en la colección de auditoría.
- Exponer un canal de integración con Discord que funcione como proxy, sin llamadas directas a OpenAI desde el bot.

---

## 4. Alcance del Proyecto

Incluye:

- Frontend React + Vite: formularios de reporte, vista de historial, panel administrativo.
- Backend: Express API, lógica de agentes, integración con OpenAI, Ethers.js y audit logs en MongoDB.
- Integración con Discord para recepción de reportes vía bot.
- Registro en Syscoin Tanenbaum Testnet y generación de enlaces a explorador público.

No incluye (fuera de alcance para el hackathon inicial):

- Integraciones legales y procesos de escalamiento con autoridades.
- UI/UX completo para todos los dispositivos (MVP responsive).
- Infraestructura de alta disponibilidad (opcional post-hackathon).

---

## 5. Arquitectura General

Frontend React (Vite)
→ Backend Express (API + Agents)
→ MongoDB (reports, users, audits)
→ Blockchain (Syscoin Tanenbaum via Ethers.js)
→ Servicios externos: OpenAI, Discord

Mermaid (diagrama de alto nivel):

```mermaid
flowchart LR
  A[Frontend React] --> B[API Express]
  B --> C[MongoDB]
  B --> D[MasterAgent]
  D --> E[ReportAgent]
  D --> F[VerificationAgent]
  D --> G[AIAgent]
  H[Discord Bot] --> I[DiscordProxyAgent] --> D
  D --> J[Syscoin (Tanenbaum) via Ethers.js]
  G --> K[OpenAI]
  B --> L[Audit Store]
```

---

## 6. Roadmap por Fases

Fase 0 (Pre-hackathon)
- Repositorio, .env ejemplos, claves y accesos a testnet.
- Esqueleto del backend, conexión a MongoDB.

Fase 1 (MVP, día 1–2)
- Endpoints básicos: crear reporte, listar, obtener por id.
- Generación de hash SHA256 y persistencia.
- Registro simple en testnet (transacción) y almacenar txHash.
- Implementación mínima de `blockchainService`.

Fase 2 (Agents + IA, día 2–3)
- Implementar `MasterAgent`, `ReportAgent`, `AIAgent`, `VerificationAgent`, `DiscordProxyAgent`.
- Integrar con OpenAI para análisis y resúmenes.
- Agregar auditoría para eventos clave.

Fase 3 (UX y Discord, día 3–4)
- Integrar bot de Discord como proxy, probar flujo `!reportar`.
- Mejorar el frontend para mostrar estado blockchain y enlace al explorador.

Fase 4 (Hardening y Demo, día 4–5)
- Manejo de errores, validaciones, roles admin.
- Tests básicos de integración y documentación para demo.

---

## 7. Integración Blockchain

- Red objetivo: Syscoin Tanenbaum Testnet.
- Biblioteca: `ethers.js` v6.
- Flujo:
  - Generar hash SHA256 en backend (`src/utils/hashGenerator.js`).
  - Llamar `reportContract.registerReportHash(hash)` y esperar confirmación de bloque.
  - Guardar `txHash`, `blockNumber`, `registeredAt` y `blockchainHash` en MongoDB.
  - Construir `getTransactionUrl(txHash)` usando `BLOCK_EXPLORER` de `.env`.
- Seguridad: jamás exponer `PRIVATE_KEY` en frontend; usar env y .gitignore.

---

## 8. Integración Discord

- El bot de Discord actúa solo como proxy y no realiza llamadas directas a OpenAI ni a la blockchain.
- Flujo:
  - Usuario en Discord -> Bot recibe comando `!reportar` -> descarga adjunto -> envía payload al `DiscordProxyAgent`.
  - `DiscordProxyAgent` envía la petición al `MasterAgent` (interno) y espera la respuesta.
  - Auditoría registra `DISCORD_MESSAGE`.
- Seguridad: validar attachments, limitar tamaño y tipos MIME.

---

## 9. Sistema de Auditoría

Colección MongoDB `audits` con campos claves:
- `userId`, `action`, `description`, `ip`, `metadata`, `status`, `createdAt`.

Eventos auditados (ejemplos):
- `REGISTER`, `LOGIN`, `LOGOUT`
- `REPORT_CREATED`, `REPORT_UPDATED`, `REPORT_DELETED`
- `BLOCKCHAIN_REGISTERED`, `BLOCKCHAIN_FAILED`
- `VERIFY_HASH`, `BLOCKCHAIN_VERIFICATION`
- `DISCORD_MESSAGE`, `AI_ANALYSIS`, `AI_RESPONSE`
- `MASTER_ROUTING`, `AGENT_EXECUTION`, `SYSTEM_ERROR`

La auditoría debe ser incondicional y tolerante a fallos: si fallan logs remotos, persistir localmente y continuar el flujo.

---

## 10. Arquitectura Multi-Agente

Roles principales:

- `MasterAgent`
  - Orquestador que no responde directamente a usuarios.
  - Recibe solicitudes (message + payload) y decide cuál agente ejecutar.
  - Registra `MASTER_ROUTING` y `AGENT_EXECUTION` en auditoría.

- `ReportAgent`
  - Clasifica categoría y detecta prioridad.
  - Implementa reglas automáticas (ver `src/docs/instinct.md`).

- `VerificationAgent`
  - Consulta `blockchainService` para verificar existencia e integridad de hashes.
  - Devuelve evidencia y estado.

- `AIAgent`
  - Interactúa con OpenAI (vía `OPENAI_API_KEY`) para análisis, resúmenes y generación de texto.
  - Nunca es llamado directamente por el bot; siempre via `MasterAgent`.

- `DiscordProxyAgent`
  - Entrada desde Discord; transforma mensajes y los envía al `MasterAgent`.

Reglas maestras (routing):
- Si el mensaje contiene "reporte" → `ReportAgent`.
- Si contiene "verificar" → `VerificationAgent`.
- Si contiene "resumen" → `AIAgent`.
- Si no coincide → `AIAgent` por defecto.

---

## 11. Resultados Esperados

- MVP funcional: recepción de reportes desde frontend y Discord, hash en blockchain, auditoría y resumen IA.
- Panel administrativo donde los administradores puedan ver auditoría, estado blockchain y enlaces al explorador.
- Sistema orquestado con agentes que permita añadir nuevos agentes y reglas sin cambiar el flujo principal.

KPIs iniciales:
- Tiempo medio desde envío hasta registro en blockchain (target < 30s en testnet, variable según testnet).
- Porcentaje de reportes con verificación automática: >60% (después de entrenamientos y reglas).
- Número de eventos auditados por día en la plataforma.

---

## 12. Riesgos y Mitigaciones

- Dependencia de servicios externos (OpenAI, Syscoin testnet, Discord).
  - Mitigación: circuit breakers, timeouts y flujos de degradado (registro local y reintentos).

- Costos y límites de API (OpenAI).
  - Mitigación: pool de requests, prompts eficientes, cadencia y cuotas por usuario.

- Exposición de claves privadas o API keys.
  - Mitigación: almacenar en variables de entorno, rotación periódica y no exponer en frontend.

- Falsos positivos/negativos en análisis IA.
  - Mitigación: marcar reportes que requieran revisión humana, heurísticas combinadas (IA + reglas), auditoría exhaustiva.

- Privacidad y datos sensibles.
  - Mitigación: anonimizar metadatos donde sea necesario, políticas de retención y consentimiento.

---

## Anexos y Siguientes Pasos rápidos para demo

1. Preparar `.env.example` con variables: `RPC_URL`, `PRIVATE_KEY`, `CONTRACT_ADDRESS`, `BLOCK_EXPLORER`, `OPENAI_API_KEY`, `JWT_SECRET`, `MONGODB_URI`, `DISCORD_TOKEN`.
2. Arrancar MongoDB local o usar un servicio free-tier.
3. Ejecutar backend con nodemon y los servicios:

```bash
npm install
npm run dev
```

4. Probar endpoint admin para agentes (ejemplo `POST /api/agents/process`) con payload de ejemplo:

```json
{
  "message": "reporte",
  "payload": { "title": "Bache en calle X", "description": "Gran bache frente al 123" }
}
```

5. Preparar demo: flujo Discord `!reportar`, mostrar auditoría y transacción en explorador.

---

Contacto técnico: Equipo ProbaEstado — Backend Lead

Powered for Hackathon Web3 — listo para iterar y desplegar.
