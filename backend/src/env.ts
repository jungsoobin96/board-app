/**
 * 환경 변수 검증 — 부팅 즉시 fail-fast.
 * R-N-04 부팅 정합: 필수 env 누락 시 process.exit(1) + stderr 한국어 메시지.
 * 11 §2 코드 PREFIX: ENV_*.
 */
import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  NODE_ENV: z.enum(['dev', 'stg', 'prod']),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL 형식이 비어 있습니다'),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * process.env를 검증하고 typed Env 반환.
 * 실패 시 한국어 stderr + Error throw (server.ts에서 catch → exit).
 */
export function validateEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `${i.path.join('.')} (${i.message})`)
      .join(', ');
    throw new Error(`[ENV] 환경 변수 검증 실패: ${missing}`);
  }
  return result.data;
}
