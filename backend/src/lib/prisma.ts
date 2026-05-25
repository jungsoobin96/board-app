// PrismaClient 싱글톤 모듈 (08 §M11 lifecycle).
// dev hot-reload(tsx watch) 시 모듈 재실행으로 인한 중복 인스턴스 → SQLite lock 회피를 위해
// globalThis hoisting 패턴 채택 (Prisma 공식 권장).
// 운영(prod)에서는 모듈이 1회만 로드되므로 global hoisting 영향 없음.

import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// LOG_LEVEL=debug면 query 로그까지, 그 외에는 error/warn만 출력 (R-N-02 stack 미노출 정합)
const logLevels: Array<'query' | 'error' | 'warn' | 'info'> =
  process.env.LOG_LEVEL === 'debug' ? ['query', 'error', 'warn'] : ['error', 'warn'];

export const prisma: PrismaClient =
  globalThis.__prisma ??
  new PrismaClient({
    log: logLevels,
  });

if (process.env.NODE_ENV === 'dev') {
  globalThis.__prisma = prisma;
}
