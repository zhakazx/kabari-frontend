import 'server-only'
import { z } from 'zod'

const schema = z.object({
  API_BASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(16),
  SESSION_COOKIE_NAME: z.string().default('kabari_session'),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().default(604800),
  NEXT_PUBLIC_APP_NAME: z.string().default('KABARI'),
  NEXT_PUBLIC_REALTIME_URL: z.string().url().optional(),
})

export const env = schema.parse(process.env)
