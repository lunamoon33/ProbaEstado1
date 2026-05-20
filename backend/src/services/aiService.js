import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const fallbackResult = {
  category: 'other',
  priority: 'low',
  summary: 'No se pudo clasificar el reporte.'
};

export const analyzeReport = async (title, description) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Eres un Agente Clasificador Municipal. Analiza el reporte ciudadano y responde SOLO en JSON con este esquema exacto: { "category": "...", "priority": "...", "summary": "..." }. Categorías válidas: infrastructure, security, environmental, other. Prioridades válidas: low, medium, high.`
        },
        {
          role: 'user',
          content: `Title: ${title}\nDescription: ${description}`
        }
      ],
      temperature: 0.2,
      max_tokens: 250
    });

    const raw = completion.choices[0]?.message?.content || '';
    const parsed = JSON.parse(raw.trim());

    const validCategories = ['infrastructure', 'security', 'environmental', 'other'];
    const validPriorities = ['low', 'medium', 'high'];

    return {
      category: validCategories.includes(parsed.category) ? parsed.category : 'other',
      priority: validPriorities.includes(parsed.priority) ? parsed.priority : 'low',
      summary: typeof parsed.summary === 'string' ? parsed.summary : fallbackResult.summary
    };
  } catch (error) {
    console.error('Error en analyzeReport:', error?.message || error);
    return fallbackResult;
  }
};