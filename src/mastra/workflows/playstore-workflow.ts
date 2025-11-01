import { createWorkflow, createStep, ExecuteFunctionParams } from '@mastra/core';
import { z } from 'zod';
import { playStoreRatingTool } from '../tools/playstore-tool';

// Workflow for scheduled rating checks
const ratingSchema = z.object({
  title: z.string(),
  rating: z.number(),
  ratingsCount: z.number(),
  reviews: z.number(),
  installs: z.string(),
  developer: z.string(),
  url: z.string(),
  appId: z.string(),
});

export const scheduledRatingCheckWorkflow = createWorkflow({
  id: 'scheduled-rating-check',
  inputSchema: z.object({
    appNames: z.array(z.string()),
  }),
  outputSchema: z.array(ratingSchema),
  steps: [
    createStep({
      id: 'fetch-ratings',
      inputSchema: z.object({ appNames: z.array(z.string()) }),
      outputSchema: z.object({
        ratings: z.array(z.object({
          success: z.boolean(),
          appName: z.string(),
          data: ratingSchema.optional(),
          error: z.string().optional(),
        })),
        timestamp: z.string(),
      }),
      execute: async ({ inputData, mastra }: ExecuteFunctionParams<any, { appNames: string[] }, any, any, any>) => {
        const { appNames } = inputData;
        const results = [];

        for (const appName of appNames) {
          try {
            const rating = await playStoreRatingTool.execute({
              context: { appName },
              runtimeContext: {
                registry: new Map(),
                set: () => {},
                get: (key: string) => null as any,
                has: () => false,
                delete: () => false,
                clear: () => {},
                forEach: () => {},
                entries: () => [][Symbol.iterator](),
                keys: () => [][Symbol.iterator](),
                values: () => [][Symbol.iterator](),
                size: () => 0,
                toJSON: () => ({}),
                [Symbol.toStringTag]: 'RuntimeContext',
              } as any,
            });
            results.push({
              success: true,
              appName,
              data: rating,
            });
          } catch (error: any) {
            results.push({
              success: false,
              appName,
              error: error.message,
            });
          }
        }

        return { ratings: results, timestamp: new Date().toISOString() };
      },
    }),
    createStep({
      id: 'format-results',
      inputSchema: z.object({
        ratings: z.array(z.object({
          success: z.boolean(),
          appName: z.string(),
          data: ratingSchema.optional(),
          error: z.string().optional(),
        })),
        timestamp: z.string(),
      }),
      outputSchema: z.object({
        report: z.string(),
        ratings: z.array(ratingSchema),
      }),
      execute: async (params: ExecuteFunctionParams<any, any, any, any, any>) => {
        const { ratings, timestamp } = params.getStepResult('fetch-ratings');
        
        const successfulRatings = ratings.filter((r: any) => r.success);
        const failedRatings = ratings.filter((r: any) => !r.success);

        let report = `📊 App Ratings Report - ${new Date(timestamp).toLocaleString()}\n\n`;

        if (successfulRatings.length > 0) {
          report += '✅ Successfully Retrieved:\n\n';
          successfulRatings.forEach(({ appName, data }: { appName: string, data: any }) => {
            report += `📱 ${data.title}\n`;
            report += `   ⭐ Rating: ${data.rating}/5.0 (${data.ratingsCount.toLocaleString()} ratings)\n`;
            report += `   💬 Reviews: ${data.reviews.toLocaleString()}\n`;
            report += `   📥 Installs: ${data.installs}\n`;
            report += `   👨‍💻 Developer: ${data.developer}\n`;
            report += `   🔗 ${data.url}\n\n`;
          });
        }

        if (failedRatings.length > 0) {
          report += '\n❌ Failed to Retrieve:\n\n';
          failedRatings.forEach(({ appName, error }: { appName: string, error: string }) => {
            report += `   • ${appName}: ${error}\n`;
          });
        }

        return { report, ratings: successfulRatings.map((r: any) => r.data) };
      },
    }),
    createStep({
      id: 'store-results',
      inputSchema: z.object({
        report: z.string(),
        ratings: z.array(ratingSchema),
      }),
      outputSchema: z.object({
        stored: z.number(),
        timestamp: z.string(),
      }),
      execute: async ({ getStepResult, mastra }: ExecuteFunctionParams<any, any, any, any, any>) => {
        const { ratings } = getStepResult('format-results');
        const timestamp = new Date().toISOString();

        const memory = mastra.getMemory();
        if (memory) {
          // Store in memory for tracking trends
          for (const rating of ratings) {
            const message = {
              role: 'assistant',
              content: JSON.stringify(rating),
              metadata: {
                key: `rating_history:${rating.appId}:${timestamp}`,
              },
            };
            await memory.saveMessages({
              messages: [message as any], // Cast to any to bypass strict type checking for now
            });
          }
        } else {
          console.warn('Mastra memory is not available. Skipping historical rating storage.');
        }

        return { stored: ratings.length, timestamp };
      },
    }),
  ],
});

scheduledRatingCheckWorkflow.commit();