/**
 * ConfirmModal — 재사용 가능한 controlled 확인 다이얼로그.
 *   role="dialog" + aria-modal="true" + aria-labelledby
 *   ESC → onCancel (pending 중 무시)
 *   Tab/Shift+Tab → confirm/cancel 두 버튼만 순환 (최소 focus trap)
 *   open=true 시 confirm 버튼 자동 focus
 *   error prop 있으면 role="alert" 노출 + 모달 유지
 *
 * 호출자 책임: open/isPending/error state + onConfirm/onCancel 핸들러.
 * 본 컴포넌트는 try/catch 안 함 (controlled — 호출자가 상태 관리).
 */
import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { NormalizedError } from '@app/shared';

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  isPending?: boolean;
  error?: NormalizedError | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 재사용 확인 다이얼로그 — controlled. role="dialog" + aria-modal + focus trap + ESC 닫기.
 * 호출자가 open·isPending·error 상태와 onConfirm/onCancel 핸들러 관리 (try/catch 미수행).
 */
export const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  pendingLabel = '처리 중…',
  isPending = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmModalProps): JSX.Element | null => {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  // onCancel을 ref로 안정화 — 호출자가 inline arrow 사용해도 useEffect listener 재등록 안 함.
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !isPending) {
        e.preventDefault();
        onCancelRef.current();
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [open, isPending]);

  if (!open) return null;

  const handleTabKey = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== 'Tab') return;
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === confirmRef.current) {
        e.preventDefault();
        cancelRef.current?.focus();
      }
    } else {
      if (active === cancelRef.current) {
        e.preventDefault();
        confirmRef.current?.focus();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={handleTabKey}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 px-4"
    >
      <div className="bg-neutral-0 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 id={titleId} className="text-lg font-bold text-neutral-900 mb-2">
          {title}
        </h2>
        <p className="text-sm text-neutral-700 mb-4">{message}</p>
        {error && (
          <div
            role="alert"
            className="border border-danger-500 rounded p-3 text-danger-500 text-sm mb-4"
          >
            삭제에 실패했습니다 ({error.message})
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded border border-neutral-300 text-sm font-semibold hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            aria-busy={isPending}
            className="px-4 py-2 rounded bg-danger-500 text-neutral-0 text-sm font-semibold hover:bg-danger-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
