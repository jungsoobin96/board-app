/**
 * Vitest 설정 — frontend 단위 테스트.
 * jsdom environment — component test 사전 준비. matchRoute 같은 순수 함수는 환경 무관.
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    setupFiles: ['./tests/setup/test-setup.ts'],
  },
});
