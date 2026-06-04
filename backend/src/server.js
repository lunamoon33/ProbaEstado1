import dns from 'dns';
import dotenv from 'dotenv';
// 1. Ejecutar dotenv inmediatamente antes de cargar cualquier otra cosa
dotenv.config();

// Forzar servidores DNS públicos para resolver registros SRV de MongoDB Atlas.
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import app from './app.js';
// 2. Importar el servicio del bot interactivo de Discord
import './services/discordBotService.js';

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI debe estar definido en el archivo .env');
  process.exit(1);
}

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Conexión a MongoDB establecida con éxito.');
    import cron from 'node-cron';

const LIMA_PALABRAS = ['lima','callao','miraflores','surco','ate','comas','chorrillos','san isidro','barranco','lince'];
const KEYWORDS = ['accidente','choque','incendio','robo','asalt','crimen','tráfico','bloqueo','herido','muerto','explosión'];

async function enviarNoticiasDiscord() {
  try {
    const response = await fetch('https://elcomercio.pe/arcio/rss/');
    const text = await response.text();
    const { DOMParser } = await import('@xmldom/xmldom');
    const xml = new DOMParser().parseFromString(text, 'text/xml');
    const items = Array.from(xml.getElementsByTagName('item')).slice(0, 20);

    for (const item of items) {
      const titulo = item.getElementsByTagName('title')[0]?.textContent || '';
      const desc = item.getElementsByTagName('description')[0]?.textContent || '';
      const link = item.getElementsByTagName('link')[0]?.textContent || '';
      const full = (titulo + ' ' + desc).toLowerCase();

      const esLima = LIMA_PALABRAS.some(p => full.includes(p));
      const esIncidente = KEYWORDS.some(p => full.includes(p));

      if (esLima && esIncidente) {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: `📰 ${titulo.slice(0, 100)}`,
              description: `${desc.slice(0, 150)}...`,
              url: link,
              color: 0xFFB800,
              footer: { text: '¿Tienes evidencia? Repórtalo en ProbaEstado' }
            }]
          })
        });
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  } catch (err) {
    console.error('Error enviando noticias a Discord:', err.message);
  }
}

cron.schedule('0 * * * *', enviarNoticiasDiscord);

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log('\nCerrando servidor y conexión a MongoDB...');
      await mongoose.disconnect();
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

start();
