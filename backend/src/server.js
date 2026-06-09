import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import cron from 'node-cron';
import app from './app.js';
import './services/discordBotService.js';

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Error: MONGO_URI debe estar definido en el archivo .env');
  process.exit(1);
}

const LIMA_PALABRAS = ['lima','callao','miraflores','surco','ate','comas','chorrillos','san isidro','barranco','lince'];
const KEYWORDS = ['accidente','choque','incendio','robo','asalt','crimen','tráfico','bloqueo','herido','muerto'];

const noticiasEnviadas = new Set();

async function enviarNoticiasDiscord() {
  try {
    const response = await fetch('https://elcomercio.pe/arcio/rss/');
    const text = await response.text();

    const titleMatches = [...text.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)];
    const descMatches = [...text.matchAll(/<description><!\[CDATA\[(.*?)\]\]><\/description>/g)];
    const linkMatches = [...text.matchAll(/<link>(https?:\/\/elcomercio\.pe[^<]+)<\/link>/g)];

    for (let i = 0; i < titleMatches.length; i++) {
      const titulo = titleMatches[i][1].trim();
      const desc = (descMatches[i]?.[1] || '').trim();
      const link = (linkMatches[i]?.[1] || '').trim();

      if (!link || noticiasEnviadas.has(link)) continue;

      const full = (titulo + ' ' + desc).toLowerCase();
      const esLima = LIMA_PALABRAS.some(p => full.includes(p));
      const esIncidente = KEYWORDS.some(p => full.includes(p));

      if (esLima && esIncidente) {
        noticiasEnviadas.add(link);
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: `📰 ${titulo.slice(0, 100)}`,
              description: desc.slice(0, 200) + (desc.length > 200 ? '...' : ''),
              url: link,
              color: 0xFFB800,
              footer: { text: '¿Tienes evidencia? Repórtalo en ProbaEstado' }
            }]
          })
        });
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    console.log('✅ Noticias Lima revisadas');
  } catch (err) {
    console.error('Error enviando noticias a Discord:', err.message);
  }
}

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.on('error', reject);
  });
};

const start = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Conexión a MongoDB establecida con éxito.');

    let currentPort = Number(PORT) || 4000;
    let server = null;

    while (!server) {
      try {
        server = await startServer(currentPort);
      } catch (error) {
        if (error.code === 'EADDRINUSE') {
          currentPort += 1;
          continue;
        }
        throw error;
      }
    }

    console.log(`🚀 Servidor escuchando en http://localhost:${currentPort}`);

    cron.schedule('0 * * * *', enviarNoticiasDiscord);
    console.log('⏰ Cron job noticias Lima activado');

    // Ejecutar inmediatamente al arrancar
    enviarNoticiasDiscord();
// Keep-alive para Render (evita que se duerma)
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://probaestado1.onrender.com';
setInterval(() => {
  fetch(`${RENDER_URL}/`)
    .then(() => console.log('🟢 Keep-alive ping sent'))
    .catch(err => console.error('Keep-alive failed:', err.message));
}, 14 * 60 * 1000);
    const shutdown = async () => {
      console.log('\nCerrando servidor y conexión a MongoDB...');
      await mongoose.disconnect();
      server.close(() => process.exit(0));
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

start();