import axios from 'axios';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export const sendDiscordNotification = async (reportData) => {
  const { title, description, category, priority, blockchainHash } = reportData || {};
  const txText = blockchainHash ? blockchainHash : 'No registrado aún';

  const payload = {
    embeds: [
      {
        title: '📢 Nuevo Reporte Ciudadano',
        color: 0x0099ff,
        fields: [
          { name: '📌 Título', value: title || 'Sin título', inline: false },
          { name: '📝 Descripción', value: description || 'Sin descripción', inline: false },
          { name: '🗂️ Categoría | ⚠️ Prioridad', value: `${category || 'other'} | ${priority || 'low'}`, inline: false },
          { name: '⛓️ Blockchain Tx', value: txText, inline: false }
        ],
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    if (!DISCORD_WEBHOOK_URL) {
      throw new Error('DISCORD_WEBHOOK_URL no está configurado en las variables de entorno');
    }

    await axios.post(DISCORD_WEBHOOK_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    return true;
  } catch (error) {
    console.log(`Simulación de Discord Webhook: ${error?.message || 'Webhook no disponible'}`);
    return true;
  }
};
