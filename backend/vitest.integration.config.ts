/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

// 통합 테스트 전용 설정 — 단위 테스트(vitest.config.ts)와 명확 분리.
// SQLite 단일 writer 한계(08 §7 RISK-02)로 인해 singleThread + fileParallelism: false 강제.
// dev.db에 접근하므로 dotenv-cli wrapping이 필수 — package.json scripts.test:integration 참조.

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/integration/**/*.integration.test.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    fileParallelism: false,
    testTimeout: 15000,
  },
});
