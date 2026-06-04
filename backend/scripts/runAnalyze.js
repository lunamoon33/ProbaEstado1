import axios from 'axios';
import dotenv from 'dotenv';
import { analyzeReportWithImage } from '../src/services/aiService.js';

dotenv.config();

async function main() {
  try {
    // Imagen pública con contexto latinoamericano (Plaza de Mayo, Buenos Aires)
    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Plaza_de_Mayo_-_Buenos_Aires.jpg';
    const title = 'Plaza en riesgo por grieta';
    const description = 'Reporto una grieta amplia cerca de la plaza principal, parece peligrosa para peatones.';

    console.log('Descargando imagen...');
    const resp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBase64 = Buffer.from(resp.data).toString('base64');

    console.log('Llamando a analyzeReportWithImage...');
    const result = await analyzeReportWithImage(title, description, imageBase64);

    console.log('Resultado de Groq:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error en runAnalyze:', err?.message || err);
    process.exit(1);
  }
}

main();
