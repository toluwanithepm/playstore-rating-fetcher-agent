import { createScorer } from '@mastra/core/scores';
import { z } from 'zod';

export const playStoreScorer = createScorer({
  name: 'playstore-rating-scorer',
  description: 'Score apps based on their Play Store ratings and metrics',
  type: {
    input: z.object({
      rating: z.number(),
      ratingsCount: z.number(),
      reviews: z.number(),
      installs: z.string(),
    }),
    output: z.object({
      score: z.number().min(0).max(100),
      category: z.enum(['excellent', 'good', 'average', 'poor']),
      insights: z.array(z.string()),
    }),
  },
})
  .generateScore(async ({ run }) => {
    if (!run.input) {
      return 0; // Or throw an error, depending on desired behavior for missing input
    }
    const { rating, ratingsCount, installs } = run.input;

    let score = 0;

    // Rating score (40 points max)
    if (rating >= 4.5) {
      score += 40;
    } else if (rating >= 4.0) {
      score += 30;
    } else if (rating >= 3.5) {
      score += 20;
    } else {
      score += 10;
    }

    // Ratings count score (30 points max)
    if (ratingsCount >= 100000) {
      score += 30;
    } else if (ratingsCount >= 10000) {
      score += 20;
    } else if (ratingsCount >= 1000) {
      score += 10;
    } else {
      score += 5;
    }

    // Install count score (30 points max)
    const installNumber = parseInstalls(installs || ''); // Provide a default empty string if installs is undefined
    if (installNumber >= 10000000) {
      score += 30;
    } else if (installNumber >= 1000000) {
      score += 20;
    } else if (installNumber >= 100000) {
      score += 10;
    } else {
      score += 5;
    }
    return score;
  })
  .generateReason(async ({ score, run }) => {
    const insights: string[] = [];
    if (!run.input) {
      return { category: 'poor', insights: ['Invalid input provided'] }; // Or throw an error
    }
    const { rating, ratingsCount, installs } = run.input;

    // Insights based on rating
    if (rating >= 4.5) {
      insights.push('Excellent user rating');
    } else if (rating >= 4.0) {
      insights.push('Good user rating');
    } else if (rating >= 3.5) {
      insights.push('Average user rating');
    } else {
      insights.push('Below average rating');
    }

    // Insights based on ratings count
    if (ratingsCount >= 100000) {
      insights.push('Large user base with extensive feedback');
    } else if (ratingsCount >= 10000) {
      insights.push('Good amount of user feedback');
    } else if (ratingsCount >= 1000) {
        insights.push('Moderate user feedback');
    } else {
        insights.push('Limited user feedback');
    }

    // Insights based on install count
    const installNumber = parseInstalls(installs || ''); // Provide a default empty string if installs is undefined
    if (installNumber >= 10000000) {
      insights.push('Widely installed app');
    } else if (installNumber >= 1000000) {
      insights.push('Popular app');
    } else if (installNumber >= 100000) {
      insights.push('Growing user base');
    } else {
      insights.push('Emerging app');
    }

    // Determine category
    let category: 'excellent' | 'good' | 'average' | 'poor';
    if (score >= 80) category = 'excellent';
    else if (score >= 60) category = 'good';
    else if (score >= 40) category = 'average';
    else category = 'poor';

    return { category, insights };
  });

function parseInstalls(installs: string): number {
  const match = installs.match(/[\d,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/,/g, ''));
}