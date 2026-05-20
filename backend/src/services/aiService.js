import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY no está definido en el archivo .env');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const fallbackResult = {
  category: 'other',
  priority: 'low',
  summary: 'No se pudo obtener la clasificación de OpenAI. Se usó un valor de respaldo.'
};

export const analyzeReport = async (title, description) => {
  try {
    const promptSystem = `Eres un Agente Clasificador Municipal Autónomo. Analiza el siguiente reporte ciudadano y responde únicamente en JSON plano con el esquema exacto { "category": "...", "priority": "...", "summary": "..." }. Las categorías válidas son: 'infrastructure', 'security', 'environmental', 'other'. Las prioridades válidas son: 'low', 'medium', 'high'. No incluyas explicaciones adicionales ni formato markdown.`;

    const promptUser = `Title: ${title || ''}\nDescription: ${description || ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: promptSystem },
        { role: 'user', content: promptUser }
      ],
      temperature: 0.2,
      max_tokens: 250
    });

    const rawText = response?.choices?.[0]?.message?.content || '';
    const normalizedText = Array.isArray(rawText) ? rawText.join(' ') : String(rawText);
    const jsonText = normalizedText.trim();

    const parsed = JSON.parse(jsonText);

    const validCategories = ['infrastructure', 'security', 'environmental', 'other'];
    const validPriorities = ['low', 'medium', 'high'];

    const category = validCategories.includes(parsed.category) ? parsed.category : 'other';
    const priority = validPriorities.includes(parsed.priority) ? parsed.priority : 'low';
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : fallbackResult.summary;

    return { category, priority, summary };
  } catch (error) {
    console.error('Error en analyzeReport:', error?.message || error);
    return fallbackResult;
  }
};
