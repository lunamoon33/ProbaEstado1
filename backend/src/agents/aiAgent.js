import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import auditService from '../services/auditService.js';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const FALLBACK_GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'groq/compound-mini',
  'groq/compound',
  'llama-3.3-70b-versatile'
];
let groqClient = null;
let simulationMode = false;

if (!GROQ_API_KEY) {
  simulationMode = true;
  console.warn('[AI_AGENT] GROQ_API_KEY no está definido. Activando Simulation Mode para aiAgent.');
} else {
  try {
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
    console.log('[AI_AGENT] Groq client initialized.');
  } catch (error) {
    simulationMode = true;
    console.error('[AI_AGENT] Error inicializando Groq client:', error?.message || error);
  }
}

export default class AIAgent {
  constructor() {
    this.simulationMode = simulationMode;
    this.groq = groqClient;
  }

  async generateResponse({ type, payload, analysis, user }) {
    const prompt = this._buildPrompt(type, payload, analysis, user);
    const response = await this.analyzeText(prompt);
    const auditUserFields = user?.discordUserId ? { discordUserId: user.discordUserId } : { userId: user?.id ?? null };

    await auditService.logEvent({
      ...auditUserFields,
      action: 'AI_RESPONSE',
      description: `AIAgent generated a ${type} response`,
      ip: null,
      metadata: {
        type,
        prompt,
        response
      },
      status: 'success'
    });

    let finalText = response;

    // Si es un reporte, construimos la estructura exacta estructurada en Markdown
    if (type === 'report') {
      const baseExplorer = process.env.BLOCK_EXPLORER || 'https://tanenbaum.io';
      const txHash = payload?.blockchainTxHash;
      
      // Creamos el hipervínculo dinámico en Markdown hacia el explorador de bloques
      const blockchainLink = txHash 
        ? `[\`${baseExplorer}/tx/${txHash}\`](${baseExplorer}/tx/${txHash})`
        : '`El registro en blockchain falló o está pendiente.`';

      finalText = `📊 REPORTE CIUDADANO PROCESADO CON ÉXITO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Título: ${payload.title || 'Reporte Sin Título'}
🗂️ Categoría: ${payload.category || analysis?.category || 'INFRASTRUCTURE'}
⚠️ Prioridad: ${payload.priority || analysis?.priority || 'HIGH'}
📝 Resumen de IA: ${response}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️ El reporte ha sido registrado en el sistema. Se procederá a informar y derivar el caso a las instituciones competentes, como la municipalidad del distrito, para su evaluación. Estaremos en contacto para mantenerlo informado del seguimiento.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 ID REPORTE (HASH): ${payload.blockchainHash || 'No disponible'}
🚀 BLOCKCHAIN TX HASH: ${blockchainLink}
✅ Registrado de forma transparente e inmutable en zkSYS Testnet.`;
    }

    return { text: finalText.trim(), type, payload, analysis };
  }

  async summarizeReport({ title, description, category, priority }) {
    const prompt = `Resume este reporte brevemente:\nTítulo: ${title}\nDescripción: ${description}\nCategoría: ${category}\nPrioridad: ${priority}`;
    const summary = await this.analyzeText(prompt);

    await auditService.logEvent({
      action: 'AI_RESPONSE',
      description: 'AIAgent generated a report summary',
      ip: null,
      metadata: {
        prompt,
        summary
      },
      status: 'success'
    });

    return { summary, title, category, priority };
  }

  async analyzeText(text) {
    if (this.simulationMode || !this.groq) {
      console.warn('[AI_AGENT] analyzeText en Simulation Mode porque el cliente Groq no está disponible.');
      return `SIMULATION MODE: ${String(text).trim().slice(0, 160)}...`;
    }

    const modelsToTry = [DEFAULT_GROQ_MODEL, ...FALLBACK_GROQ_MODELS.filter((model) => model !== DEFAULT_GROQ_MODEL)];
    let response = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        response = await this.groq.chat.completions.create({
          model,
          messages: [
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 256 // Reducido para forzar un resumen conciso y directo
        });

        if (response) {
          if (model !== modelsToTry[0]) {
            console.log(`[AI_AGENT] Modelo alternativo usado: ${model}`);
          }
          break;
        }
      } catch (error) {
        lastError = error;
        const errorMessage = error?.message || String(error);
        console.warn(`[AI_AGENT] Error usando modelo ${model}:`, errorMessage);
        const isModelNotFound = /model .* does not exist|model_not_found|invalid_request_error|unrecognized model/i.test(errorMessage);

        if (!isModelNotFound) {
          console.error('[AI_AGENT] Error no recuperable en analyzeText:', errorMessage);
          break;
        }
      }
    }

    if (!response) {
      console.warn('[AI_AGENT] No se pudo generar respuesta con Groq. Retornando modo simulación. Error:', lastError?.message || lastError);
      return `SIMULATION MODE: ${String(text).trim().slice(0, 160)}...`;
    }

    const content = response?.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      return content.trim();
    }

    const fallback = response?.choices?.[0]?.text || response?.choices?.[0]?.message || response?.choices?.[0] || response;
    return String(fallback ?? '').trim();
  }

  _buildPrompt(type, payload, analysis, user) {
    if (type === 'report') {
      // Forzamos a la IA a comportarse de forma puramente analítica. Quitamos promesas de arreglos.
      return `Eres un analizador de datos municipal frío, neutral y objetivo. No prometas reparaciones, no saludes amigablemente y no digas que el equipo irá al lugar. 
Genera única y estrictamente un resumen analítico muy breve (máximo 2 líneas) basado en la descripción del siguiente reporte:
Título del reporte: ${payload.title}
Descripción del reporte: ${payload.description}
Categoría analizada: ${analysis?.category || payload.category}
Prioridad asignada: ${analysis?.priority || payload.priority}`;
    }

    if (type === 'verification') {
      return `Verifica el hash del reporte en la blockchain y entrega una respuesta clara, estableciendo si el hash existe o no y proporcionando evidencia si está disponible.\nHash: ${payload.hash}\nResultado: ${JSON.stringify(payload.verification)}\nEvidencia: ${JSON.stringify(payload.evidence)}`;
    }

    return `Responde a la siguiente consulta de forma clara en español: ${payload?.message || ''}`;
  }
}
