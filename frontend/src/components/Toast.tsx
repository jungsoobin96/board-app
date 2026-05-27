/**
 * Toast — success/error variant + 자동 dismiss + 닫기 버튼.
 * R-N-02 강제: message: string 전용 (Error 객체·stack 노출 차단, 호출자가 NormalizedError.message 추출 책임).
 * portal·queue·stacking은 본 PR scope 밖 (Sprint 5+).
 */
import { useEffect, useRef } from 'react';

export type ToastVariant = 'success' | 'error';

interface ToastProps {
  variant: ToastVariant;
  message: string;
  onDismiss: () => void;
  durationMs?: number | null;
}

export const Toast = ({
  variant,
  message,
  onDismiss,
  durationMs = 3000,
}: ToastProps): JSX.Element => {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (durationMs === null) return;
    const id = window.setTimeout(() => {
      onDismissRef.current();
    }, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs]);

  // 10 §3 디자인 토큰: success 전용 색상 미정의 → secondary-500(green emerald #10b981) 재사용
  const bg = variant === 'success' ? 'bg-secondary-500' : 'bg-danger-500';

  return (
    <div
      role="alert"
      className={`fixed bottom-4 right-4 ${bg} text-neutral-0 px-4 py-3 rounded shadow-lg flex items-center gap-3 min-w-[16rem] max-w-md`}
    >
      <span className="flex-1 text-sm">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="알림 닫기"
        className="text-neutral-0 hover:opacity-80 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};
