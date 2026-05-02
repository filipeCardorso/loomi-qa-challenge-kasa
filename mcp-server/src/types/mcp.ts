import { z } from 'zod';

export const RunTestCaseInputSchema = z.object({
  name: z.string().describe('Nome do teste ou tag (ex: @smoke, "favoritar")'),
  browser: z.enum(['chromium', 'firefox', 'webkit']).optional(),
  headed: z.boolean().optional(),
});
export type RunTestCaseInput = z.infer<typeof RunTestCaseInputSchema>;

export const RunTestCaseOutputSchema = z.object({
  status: z.enum(['passed', 'failed', 'timedOut', 'skipped']),
  duration_ms: z.number(),
  errors: z.array(z.object({ message: z.string(), stack: z.string().optional(), location: z.string().optional() })),
  artifacts: z.object({ screenshot: z.string().optional(), video: z.string().optional(), trace: z.string().optional() }),
  testId: z.string(),
});
export type RunTestCaseOutput = z.infer<typeof RunTestCaseOutputSchema>;
