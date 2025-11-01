import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { playStoreAgent } from './agents/playstore-agent';
import { scheduledRatingCheckWorkflow } from './workflows/playstore-workflow';
import { playStoreScorer } from './scorers/playstore-scorer';
import { a2aAgentRoute } from './routes/a2a-agent-route';

export const mastra = new Mastra({
  agents: { playStoreAgent },
  workflows: { scheduledRatingCheckWorkflow },
  scorers: { playStoreScorer },
  storage: new LibSQLStore({ url: 'file:./mastra.db' }),
  logger: new PinoLogger({
    name: 'PlayStoreAgent',
    level: 'debug',
  }),
  observability: {
    default: { enabled: true },
  },
  server: {
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
    apiRoutes: [a2aAgentRoute],
  },
  bundler: {
    externals: ["google-play-scraper"],
  },
});