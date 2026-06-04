import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { discordProxyAgent } from '../agents/agentRegistry.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('clientReady', () => {
  console.log(`🚀 Proxy Completo Activo: IA + Blockchain. Bot: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    return message.reply('pong');
  }

  // Comando integrado: !reportar Título | Descripción
  if (message.content.startsWith('!reportar ')) {
    console.log('[DISCORD] Mensaje original:', message.content);

    const args = message.content.slice(10).trim();
    const parts = args.split('|');
    const title = parts[0]?.trim();
    const description = parts[1]?.trim();

    const parserPayload = { title, description };
    console.log('[PARSER] Objeto generado:', parserPayload);

    if (!title || !description) {
      return message.reply('❌ Formato incorrecto. Usa: \`!reportar Título | Descripción detallada\`');
    }

    // 1. Efecto de carga en Discord
    await message.channel.sendTyping();

    try {
      // 2. Ejecutar análisis del reporte con el Agente de IA (descargar adjunto y convertir a Base64)
      const attachment = message.attachments && message.attachments.size > 0 ? message.attachments.first() : null;
      if (!attachment) {
        await message.reply('❌ Debes adjuntar una imagen válida al mensaje para que la IA pueda verificarla. Por favor, vuelve a enviar el comando con la imagen.');
        return;
      }

      let imageBase64 = null;
      try {
        const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
        imageBase64 = Buffer.from(response.data).toString('base64');
      } catch (dlErr) {
        console.error('Error descargando attachment desde Discord:', dlErr?.message || dlErr);
        await message.reply('⚠️ No se pudo descargar o procesar la imagen adjunta. Intenta de nuevo o contacta al administrador.');
        return;
      }

      const agentResponse = await discordProxyAgent.receiveDiscordMessage({
        message: 'reporte',
        user: {
          id: message.author.id,
          username: message.author.username,
          tag: message.author.tag
        },
        channel: {
          id: message.channel.id,
          name: message.channel?.name || null
        },
        payload: {
          title,
          description,
          imageBase64
        }
      });

      const replyText = agentResponse?.text || 'No se pudo procesar el reporte en este momento. Intenta de nuevo más tarde.';
      await message.reply(replyText);

    } catch (error) {
      console.error('Error en el flujo del bot:', error);
      await message.reply(`⚠️ Hubo un fallo en el procesamiento de tu reporte: \`${error.message}\``);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
