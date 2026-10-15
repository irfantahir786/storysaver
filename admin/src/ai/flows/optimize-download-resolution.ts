'use server';

/**
 * @fileOverview Adjusts download resolution based on network speed.
 *
 * - optimizeDownloadResolution - Adjusts resolution to network conditions.
 * - OptimizeDownloadResolutionInput - Input schema.
 * - OptimizeDownloadResolutionOutput - Output schema.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeDownloadResolutionInputSchema = z.object({
  networkSpeed: z
    .enum(['slow', 'moderate', 'fast'])
    .describe('The current network speed of the user.'),
  mediaUrl: z.string().describe('The URL of the media to be downloaded.'),
  mediaType: z.enum(['photo', 'video']).describe('The type of media to download.'),
});
export type OptimizeDownloadResolutionInput =
  z.infer<typeof OptimizeDownloadResolutionInputSchema>;

const OptimizeDownloadResolutionOutputSchema = z.object({
  adjustedUrl: z.string().describe('The adjusted URL for the optimal resolution.'),
  suggestedQuality: z
    .string()
    .describe('Suggested quality setting based on network speed.'),
});
export type OptimizeDownloadResolutionOutput =
  z.infer<typeof OptimizeDownloadResolutionOutputSchema>;

export async function optimizeDownloadResolution(
  input: OptimizeDownloadResolutionInput
): Promise<OptimizeDownloadResolutionOutput> {
  return optimizeDownloadResolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeDownloadResolutionPrompt',
  input: {schema: OptimizeDownloadResolutionInputSchema},
  output: {schema: OptimizeDownloadResolutionOutputSchema},
  prompt: `You are an expert in optimizing media downloads based on network conditions.

  Given the user's network speed as {{{networkSpeed}}} and the media URL as {{{mediaUrl}}} and media type as {{{mediaType}}},
  determine the optimal resolution and provide an adjusted URL and quality setting.

  Optimize the download for speed on slow connections, and for quality on fast connections.
  Return the adjusted URL, and a suggestion as to the quality setting to use.
  `,
});

const optimizeDownloadResolutionFlow = ai.defineFlow(
  {
    name: 'optimizeDownloadResolutionFlow',
    inputSchema: OptimizeDownloadResolutionInputSchema,
    outputSchema: OptimizeDownloadResolutionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
