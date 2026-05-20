import { Client, GatewayIntentBits } from 'discord.js';
import { analyzeReport } from './aiService.js';
import { registerHashInBlockchain } from './blockchainService.js';
import crypto from 'crypto'; // Módulo nativo de Node.js para generar el hash
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`🚀 Proxy Completo Activo: IA + Blockchain. Bot: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    return message.reply('pong');
  }

  // Comando integrado: !reportar Título | Descripción
  if (message.content.startsWith('!reportar ')) {
    const args = message.content.slice(10).trim();
    const parts = args.split('|');
    const title = parts[0]?.trim();
    const description = parts[1]?.trim();

    if (!title || !description) {
      return message.reply('❌ Formato incorrecto. Usa: \`!reportar Título | Descripción detallada\`');
    }

    // 1. Efecto de carga en Discord
    await message.channel.sendTyping();

    try {
      // 2. Ejecutar análisis del reporte con el Agente de IA
      const analysis = await analyzeReport(title, description);

      // 3. Crear un Hash criptográfico único basado en el contenido del reporte
      const reportString = `${title}-${analysis.category}-${analysis.priority}`;
      const reportHash = crypto.createHash('md5').update(reportString).digest('hex');

      // 4. Registrar de forma inmutable en el Smart Contract (zkSYS Blockchain)
      const txHash = await registerHashInBlockchain(reportHash);

      // 5. Construir y enviar la respuesta final estructurada al usuario
      const responseMessage = [
        `📊 **REPORTE CIUDADANO PROCESADO CON ÉXITO**`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📌 **Título:** ${title}`,
        `🗂️ **Categoría:** \`${analysis.category.toUpperCase()}\``,
        `⚠️ **Prioridad:** \`${analysis.priority.toUpperCase()}\``,
        `📝 **Resumen de IA:** ${analysis.summary}`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `⛓️ **HASH DEL REPORTE (ID):** \`${reportHash}\``,
        `🚀 **BLOCKCHAIN TX HASH:** [\`${txHash}\`](https://tanenbaum.io)`, // Enlace al explorador de la red
        `✅ _Registrado de forma transparente e inmutable en zkSYS Testnet._`
      ].join('\n');

      await message.reply(responseMessage);

    } catch (error) {
      console.error('Error en el flujo del bot:', error);
      await message.reply(`⚠️ Hubo un fallo en el procesamiento de tu reporte: \`${error.message}\``);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
