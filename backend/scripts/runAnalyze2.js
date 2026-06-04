import axios from 'axios';
import dotenv from 'dotenv';
import { analyzeReportWithImage } from '../src/services/aiService.js';

dotenv.config();

async function main() {
  try {
    // Imagen pública genérica (picsum)
    const imageUrl = 'https://picsum.photos/800/600';
    const title = 'Daño en vía pública cerca de la plaza';
    const description = 'Hay un socavón en la calle principal, necesita atención urgente.';

    console.log('Descargando imagen...');
    const resp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBase64 = Buffer.from(resp.data).toString('base64');

    console.log('Llamando a analyzeReportWithImage...');
    const result = await analyzeReportWithImage(title, description, imageBase64);

    console.log('Resultado de Groq:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error en runAnalyze2:', err?.response?.data || err?.message || err);
    process.exit(1);
  }
}

main();
