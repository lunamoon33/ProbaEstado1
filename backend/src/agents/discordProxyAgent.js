import auditService from '../services/auditService.js';

export default class DiscordProxyAgent {
  constructor(masterAgent) {
    this.masterAgent = masterAgent;
  }

  async receiveDiscordMessage({ message, user, channel, payload }) {
    await auditService.logEvent({
      discordUserId: user?.id ?? null,
      action: 'DISCORD_REQUEST',
      description: 'DiscordProxyAgent received a Discord message',
      ip: null,
      metadata: {
        message,
        user,
        channel,
        payload
      },
      status: 'success'
    });

    const request = {
      message,
      user,
      source: 'discord',
      channel,
      payload
    };

    const response = await this.masterAgent.processRequest(request);

    return response;
  }
}
