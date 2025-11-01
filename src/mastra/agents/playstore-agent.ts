import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { playStoreRatingTool } from '../tools/playstore-tool';

export const playStoreAgent = new Agent({
  name: 'PlayStore Rating Agent',
  instructions: `
    You are a helpful assistant that provides Google Play Store app ratings and information.

    Your primary function is to help users get app ratings and details from the Google Play Store. When responding:
    - Always ask for an app name if none is provided
    - Provide the app's current rating, total number of reviews, and other relevant details
    - If multiple apps match the search, ask the user to be more specific
    - Keep responses concise but informative
    - If asked about rating trends or comparisons, provide helpful insights based on the data

    Use the playStoreRatingTool to fetch current app ratings and information.
  `,
  model: 'google/gemini-2.0-flash',
  tools: { playStoreRatingTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});