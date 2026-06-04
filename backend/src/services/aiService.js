import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import auditService from './auditService.js';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GROP_API_KEY;
if (!GROQ_API_KEY) console.error('⚠️ GROQ API key not found in GROQ_API_KEY or GROP_API_KEY');

const groq = new Groq({ apiKey: GROQ_API_KEY });

function _safeExtractTextFromResponse(res) {
  if (!res) return null;
  if (typeof res === 'string') return res;
  if (res.output_text) return Array.isArray(res.output_text) ? res.output_text.join('\n') : res.output_text;
  if (res.output && Array.isArray(res.output) && res.output[0]?.content) {
    try {
      const parts = res.output[0].content.map(c => c?.text || (c?.type === 'output_text' && c?.text)).filter(Boolean);
      if (parts.length) return parts.join('\n');
    } catch (e) {}
  }
  if (res?.choices?.[0]?.message?.content) return res.choices[0].message.content;
  return null;
}

function _safeParseJson(text) {
  if (!text || typeof text !== 'string') return null;
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1) return null;
  const candidate = text.slice(first, last + 1);
  try {
    return JSON.parse(candidate);
  } catch (e) {
    return null;
  }
}

const fallback = (title, description) => {
  const simulate = process.env.SIMULATE_AI_ON_FAIL === 'true';
  const summary = (description && description.length) ? description.slice(0, 240) : (title || 'No summary available');
  if (simulate) {
    console.warn('SIMULATION: Groq unavailable — returning simulated positive analysis (isReal: true). Set SIMULATE_AI_ON_FAIL=false to disable.');
    return {
      isReal: true,
      fraudCheckReason: 'Simulated positive result due to AI unavailability. Requiere verificación manual posterior.',
      category: 'other',
      priority: 'low',
      summary
    };
  }

  return {
    isReal: false,
    fraudCheckReason: 'Análisis no disponible: la verificación automática no pudo completarse. Requiere revisión humana.',
    category: 'other',
    priority: 'low',
    summary
  };
};

export async function analyzeReportWithImage(title, description, imageBase64) {
  const systemPrompt = `Eres un Inspector Municipal de Coincidencia Visual. Tu única tarea es COMPARAR la imagen proporcionada con el título y la descripción y decidir si la imagen ilustra de forma fiel y observable lo que se describe. NO uses conocimiento externo ni eventos históricos: juzga únicamente por los elementos visibles en la imagen (objetos, daños, escenas, personas, señales, texto en carteles).\n\nSi la imagen muestra claramente los elementos mencionados en el título/descripción, devuelve isReal: true. Si la imagen NO muestra lo que se describe, está fuera de contexto o hay evidencia visual que contradice la descripción, devuelve isReal: false.\n\nRESPONDE ESTRICTAMENTE EN JSON PLANO con este esquema EXACTO y SIN texto adicional:\n{\n  "isReal": true o false,\n  "fraudCheckReason": "Explicación de los cues visuales que fundamentan la decisión",\n  "category": "infrastructure", "security", "environmental" u "other",\n  "priority": "low", "medium" o "high",\n  "summary": "Resumen automatizado de la denuncia"\n}`;

  const userText = `TÍTULO: ${title || ''}\nDESCRIPCIÓN: ${description || ''}`;

  try {
    if (imageBase64) {
      const dataUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
      const visionModels = [
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant'
      ];
      let lastError = null;

      const logAnalysis = async (prompt, response, tokens, status = 'success') => {
        try {
          await auditService.logEvent({
            userId: null,
            action: 'AI_ANALYSIS',
            description: 'AI analysis completed',
            ip: null,
            metadata: {
              prompt,
              response,
              tokens
            },
            status
          });
        } catch (auditError) {
          console.error('[AUDIT] AI_ANALYSIS log failed:', auditError?.message || auditError);
        }
      };

      for (const model of visionModels) {
        try {
          const res = await groq.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: [
                  { type: 'text', text: userText },
                  {
                    type: 'image_url',
                    image_url: {
                      url: dataUrl
                    }
                  }
                ]
              }
            ],
            temperature: 0.0,
            max_tokens: 1024
          });

          const raw = _safeExtractTextFromResponse(res) || JSON.stringify(res);
          const parsed = _safeParseJson(raw);
          const tokens = res?.usage?.total_tokens ?? null;
          if (parsed) {
            await logAnalysis(userText, parsed, tokens, 'success');
            return parsed;
          }
          lastError = new Error(`Modelo ${model} devolvió respuesta no JSON`);
        } catch (err) {
          lastError = err;
          const msg = err?.message?.toString().toLowerCase() || '';
          if (msg.includes('model_decommissioned') || msg.includes('model_not_found') || msg.includes('unrecognized model') || msg.includes('model_unknown')) {
            continue;
          }
          break;
        }
      }

      console.warn('Vision models unavailable or returned invalid JSON, falling back to text-only analysis:', lastError?.message || lastError);
      const fallbackSystem = `${systemPrompt}\nNOTA: Los modelos de visión no estuvieron disponibles. Evalúa la descripción y señala que la verificación visual no pudo completarse. Responde en JSON con el esquema requerido.`;
      const resTxt = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: fallbackSystem },
          { role: 'user', content: `${userText}\nIMAGEN: [imagen adjunta pero visión no disponible]` }
        ],
        temperature: 0.0,
        max_tokens: 1024
      });

      const rawTxt = _safeExtractTextFromResponse(resTxt) || JSON.stringify(resTxt);
      const parsedTxt = _safeParseJson(rawTxt);
      if (parsedTxt) {
        parsedTxt.fraudCheckReason = parsedTxt.fraudCheckReason
          ? `(VERIFICACIÓN VISUAL NO DISPONIBLE) ${parsedTxt.fraudCheckReason}`
          : '(VERIFICACIÓN VISUAL NO DISPONIBLE) No se pudo efectuar análisis visual.';
        await logAnalysis(userText, parsedTxt, resTxt?.usage?.total_tokens ?? null, 'success');
        return parsedTxt;
      }

      throw new Error('Groq fallback text no devolvió JSON válido');
    }

    const textSystem = `${systemPrompt}\nNO hay imagen disponible. Evalúa la consistencia del título y la descripción y responde en JSON. Si no puedes verificar visualmente, indica claramente esa limitación en fraudCheckReason.`;
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: textSystem },
        { role: 'user', content: userText }
      ],
      temperature: 0.0,
      max_tokens: 1024
    });

    const raw = _safeExtractTextFromResponse(res) || JSON.stringify(res);
    const parsed = _safeParseJson(raw);
    if (parsed) {
      await auditService.logEvent({
        userId: null,
        action: 'AI_ANALYSIS',
        description: 'AI analysis completed without image',
        ip: null,
        metadata: {
          prompt: userText,
          response: parsed,
          tokens: res?.usage?.total_tokens ?? null
        },
        status: 'success'
      });
      return parsed;
    }
    throw new Error('Groq text-only no devolvió JSON válido');
  } catch (err) {
    console.error('analyzeReportWithImage error:', err?.message || err);
    return fallback(title, description);
  }
}

export default { analyzeReportWithImage };
