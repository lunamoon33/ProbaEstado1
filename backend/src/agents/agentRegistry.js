import MasterAgent from './masterAgent.js';
import ReportAgent from './reportAgent.js';
import VerificationAgent from './verificationAgent.js';
import AIAgent from './aiAgent.js';
import DiscordProxyAgent from './discordProxyAgent.js';

const reportAgent = new ReportAgent();
const verificationAgent = new VerificationAgent();
const aiAgent = new AIAgent();
const masterAgent = new MasterAgent({ reportAgent, verificationAgent, aiAgent });
const discordProxyAgent = new DiscordProxyAgent(masterAgent);

export {
  reportAgent,
  verificationAgent,
  aiAgent,
  masterAgent,
  discordProxyAgent
};

export default {
  reportAgent,
  verificationAgent,
  aiAgent,
  masterAgent,
  discordProxyAgent
};
