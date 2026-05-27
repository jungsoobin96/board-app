/**
 * Toast RTL —
 *   (a) success variant 렌더 + role="alert" + secondary 배경
 *   (b) error variant + 닫기 클릭 → onDismiss
 *   (c) auto-dismiss 3000ms 경과 → onDismiss (vi fake timer)
 *   (d) durationMs={null} → 자동 dismiss 미발생
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { Toast } from '../../../src/components/Toast';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Toast', () => {
  it('success variant — role="alert" + bg-secondary-500 + message 노출', () => {
    render(<Toast variant="success" message="저장되었습니다" onDismiss={vi.fn()} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('저장되었습니다');
    expect(alert.className).toContain('bg-secondary-500');
  });

  it('error variant — bg-danger-500 + 닫기 클릭 시 onDismiss 1회', () => {
    const onDismiss = vi.fn();
    render(<Toast variant="error" message="서버 오류" onDismiss={onDismiss} durationMs={null} />);

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-danger-500');

    fireEvent.click(screen.getByRole('button', { name: '알림 닫기' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismiss 3000ms 경과 → onDismiss 1회 자동 호출 (fake timer)', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast variant="success" message="..." onDismiss={onDismiss} durationMs={3000} />);

    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('durationMs={null} → 자동 dismiss 미발생 (타이머 등록 X)', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast variant="success" message="..." onDismiss={onDismiss} durationMs={null} />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
