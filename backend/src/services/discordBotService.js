import { Client, GatewayIntentBits } from 'discord.js';
import { analyzeReport } from './aiService.js';
import { registerHashInBlockchain } from './blockchainService.js';
import Report from '../models/report.model.js'; // ajusta la ruta si es diferente
import crypto from 'crypto';
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

  if (message.content.startsWith('!reportar ')) {
    const args = message.content.slice(10).trim();
    const parts = args.split('|');
    const title = parts[0]?.trim();
    const description = parts[1]?.trim();

    if (!title || !description) {
      return message.reply('❌ Formato incorrecto. Usa: `!reportar Título | Descripción detallada`');
    }

    await message.channel.sendTyping();

    try {
      // 1. Análisis IA
      const analysis = await analyzeReport(title, description);

      // 2. Hash criptográfico
      const reportString = `${title}-${analysis.category}-${analysis.priority}`;
      const reportHash = crypto.createHash('md5').update(reportString).digest('hex');

      // 3. Registrar en blockchain
      const txHash = await registerHashInBlockchain(reportHash);

      // 4. Guardar en MongoDB para que aparezca en el mapa
      await Report.create({
        title,
        descripcion: description,
        pseudonimo: message.author.username,
        fuente: 'discord',
        ia_categoria: analysis.category,
        ia_prioridad: analysis.priority,
        ia_resumen: analysis.summary,
        ia_valido: true,
        hash: reportHash,
        blockchainHash: txHash,
        status: 'verified',
        created_at: new Date(),
      });

      // 5. Respuesta en Discord
      const responseMessage = [
        `📊 **REPORTE CIUDADANO PROCESADO CON ÉXITO**`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📌 **Título:** ${title}`,
        `🗂️ **Categoría:** \`${analysis.category.toUpperCase()}\``,
        `⚠️ **Prioridad:** \`${analysis.priority.toUpperCase()}\``,
        `📝 **Resumen de IA:** ${analysis.summary}`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `⛓️ **HASH DEL REPORTE (ID):** \`${reportHash}\``,
        `🚀 **BLOCKCHAIN TX HASH:** [\`${txHash}\`](https://tanenbaum.io)`,
        `✅ _Registrado de forma transparente e inmutable en zkSYS Testnet._`,
        `🗺️ _Ya visible en el mapa de ProbaEstado._`
      ].join('\n');

      await message.reply(responseMessage);

    } catch (error) {
      console.error('Error en el flujo del bot:', error);
      await message.reply(`⚠️ Hubo un fallo en el procesamiento de tu reporte: \`${error.message}\``);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);