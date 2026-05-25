/**
 * validateEnv 단위 테스트.
 * 필수 키 누락 시 한국어 메시지 throw (R-N-02 + R-N-04).
 */
import { describe, it, expect } from 'vitest';
import { validateEnv } from '../../src/env.js';

const validSource = {
  PORT: '3000',
  NODE_ENV: 'dev',
  LOG_LEVEL: 'debug',
  DATABASE_URL: 'file:./test.db',
};

describe('validateEnv', () => {
  it('필수 키 모두 채움 → typed Env 반환', () => {
    const env = validateEnv(validSource as NodeJS.ProcessEnv);
    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe('dev');
    expect(env.LOG_LEVEL).toBe('debug');
    expect(env.DATABASE_URL).toBe('file:./test.db');
  });

  it('PORT 누락 → 한국어 메시지 throw', () => {
    const { PORT: _PORT, ...rest } = validSource;
    expect(() => validateEnv(rest as NodeJS.ProcessEnv)).toThrow(/환경 변수 검증 실패.*PORT/);
  });

  it('NODE_ENV 잘못된 값 → 한국어 메시지 throw', () => {
    const bad = { ...validSource, NODE_ENV: 'production' };
    expect(() => validateEnv(bad as NodeJS.ProcessEnv)).toThrow(/환경 변수 검증 실패/);
  });

  it('PORT 범위 초과 → throw', () => {
    const bad = { ...validSource, PORT: '99999' };
    expect(() => validateEnv(bad as NodeJS.ProcessEnv)).toThrow(/환경 변수 검증 실패/);
  });
});
