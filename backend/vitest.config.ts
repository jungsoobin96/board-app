import { defineConfig } from 'vitest/config';

// 단위 테스트 전용 설정 — 통합 테스트(vitest.integration.config.ts)와 명확 분리.
// tests/unit/**만 include, tests/integration/**는 exclude.
export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'tests/integration/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts'],
    },
  },
});
