/**
 * ErrorBoundary RTL —
 *   (a) 정상 자식 그대로 통과
 *   (b) throwing 자식 → role="alert" + 고정 한국어 fallback
 *   (c) 스택·Error.message 미노출 (R-N-02)
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ErrorBoundary } from '../../../src/components/ErrorBoundary';

const Throwing = ({ message }: { message: string }): JSX.Element => {
  throw new Error(message);
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  // React가 throw 시 자체 console.error를 호출하므로 CI 노이즈 흡수 (F-RISK-02)
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ErrorBoundary', () => {
  it('정상 자식은 그대로 노출 (fallback X)', () => {
    render(
      <ErrorBoundary>
        <div>정상 콘텐츠</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('정상 콘텐츠')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('자식 throw → role="alert" + "오류가 발생했습니다" fallback', () => {
    render(
      <ErrorBoundary>
        <Throwing message="boom" />
      </ErrorBoundary>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '오류가 발생했습니다' })).toBeInTheDocument();
    expect(alert).toHaveTextContent('새로고침해 주세요');
  });

  it('스택·Error.message 미노출 — R-N-02 (내부 SQL 에러 문자열이 DOM에 노출되지 않음)', () => {
    render(
      <ErrorBoundary>
        <Throwing message="내부 SQL 에러: SELECT * FROM users WHERE id=42" />
      </ErrorBoundary>,
    );

    expect(screen.queryByText(/내부 SQL 에러/)).toBeNull();
    expect(screen.queryByText(/SELECT/)).toBeNull();
    expect(screen.queryByText(/at Throwing/)).toBeNull(); // stack trace 부분 미노출
  });
});
