/**
 * ConfirmModal RTL — open 시 confirm focus / ESC cancel / confirm 동작 / error alert.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmModal } from '../../../src/components/ConfirmModal';
import { NormalizedError } from '@app/shared';

afterEach(() => cleanup());

describe('ConfirmModal', () => {
  it('open=true → confirm 버튼 자동 focus + role="dialog" 노출', async () => {
    render(
      <ConfirmModal
        open={true}
        title="삭제 확인"
        message="이 글을 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /삭제/ })).toHaveFocus();
    });
  });

  it('ESC → onCancel 호출 + pending 중에는 무시', () => {
    const onCancel = vi.fn();

    const { rerender } = render(
      <ConfirmModal
        open={true}
        title="삭제 확인"
        message="..."
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);

    rerender(
      <ConfirmModal
        open={true}
        title="삭제 확인"
        message="..."
        isPending={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('confirm 클릭 → onConfirm 호출. pending이면 disabled + 라벨 변경', () => {
    const onConfirm = vi.fn();

    const { rerender } = render(
      <ConfirmModal
        open={true}
        title="삭제 확인"
        message="..."
        confirmLabel="삭제"
        pendingLabel="삭제 중…"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^삭제$/ }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    rerender(
      <ConfirmModal
        open={true}
        title="삭제 확인"
        message="..."
        confirmLabel="삭제"
        pendingLabel="삭제 중…"
        isPending={true}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    const confirmBtn = screen.getByRole('button', { name: /삭제 중/ });
    expect(confirmBtn).toBeDisabled();
    expect(confirmBtn).toHaveAttribute('aria-busy', 'true');
  });

  it('error prop 있으면 role="alert" 노출 + 모달 유지', () => {
    render(
      <ConfirmModal
        open={true}
        title="삭제 확인"
        message="..."
        error={new NormalizedError(500, '서버 오류가 발생했습니다')}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('서버 오류가 발생했습니다');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
