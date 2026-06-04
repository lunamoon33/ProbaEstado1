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

const startServer = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve(server);
    });

    server.on('error', (error) => {
      reject(error);
    });
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
          console.warn(`⚠️ Puerto ${currentPort} en uso. Probando puerto ${currentPort + 1}...`);
          currentPort += 1;
          continue;
        }
        throw error;
      }
    }

    console.log(`🚀 Servidor escuchando en http://localhost:${currentPort}`);

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
