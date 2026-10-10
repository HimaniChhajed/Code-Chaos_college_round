import { z } from 'zod/v4';

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().optional().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional().default('local'),
  INNGEST_SIGNING_KEY: z.string().optional().default('local'),
  MOCK_AI: z.enum(['true', 'false']).optional().default('true'),
  TRACKING_SIGNING_SECRET: z.string().optional().default('local-tracking-secret'),
  ALLOW_DEV_LOGIN: z.enum(['true', 'false']).optional().default('false'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(z.treeifyError(parsed.error), null, 2));
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
