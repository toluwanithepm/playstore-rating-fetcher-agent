import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import gplay from 'google-play-scraper';

export type PlayStoreRatingToolOutput = {
  appId: string;
  title: string;
  rating: number;
  ratingsCount: number;
  reviews: number;
  installs: string;
  price: string | number;
  developer: string;
  lastUpdated: string;
  version: string;
  url: string;
};

export const playStoreRatingTool = createTool({
  id: 'get-playstore-rating',
  description: 'Get current ratings and information for an app from Google Play Store',
  inputSchema: z.object({
    appName: z.string().describe('Name of the app to search for'),
  }),
  outputSchema: z.object({
    appId: z.string(),
    title: z.string(),
    rating: z.number(),
    ratingsCount: z.number(),
    reviews: z.number(),
    installs: z.string(),
    price: z.union([z.string(), z.number()]),
    developer: z.string(),
    lastUpdated: z.string(),
    version: z.string(),
    url: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      // Search for the app
      const searchResults = await gplay.search({
        term: context.appName,
        num: 1,
      });

      if (!searchResults || searchResults.length === 0) {
        throw new Error(`No app found with name: ${context.appName}`);
      }

      const appId = searchResults[0].appId;

      // Get detailed app information
      const appDetails = await gplay.app({ appId });

      return {
        appId: appDetails.appId,
        title: appDetails.title,
        rating: appDetails.score || 0,
        ratingsCount: appDetails.ratings || 0,
        reviews: appDetails.reviews || 0,
        installs: appDetails.installs || 'Unknown',
        price: appDetails.free ? 'Free' : appDetails.price || 'Unknown',
        developer: appDetails.developer || 'Unknown',
        lastUpdated: appDetails.updated
          ? new Date(appDetails.updated).toISOString()
          : 'Unknown',
        version: appDetails.version || 'Unknown',
        url: appDetails.url || `https://play.google.com/store/apps/details?id=${appDetails.appId}`,
      };
    } catch (error) {
      throw new Error(`Failed to fetch app details: ${(error as Error).message}`);
    }
  },
});