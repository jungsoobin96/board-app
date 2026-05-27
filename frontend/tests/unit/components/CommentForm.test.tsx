/**
 * CommentForm RTL — controlled / 빈 body 검증 / 정상 submit + body reset / NormalizedError alert.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { CommentForm } from '../../../src/components/CommentForm';
import { NormalizedError } from '@app/shared';

afterEach(() => cleanup());

describe('CommentForm', () => {
  it('controlled — body/author 입력 시 state 갱신', () => {
    render(<CommentForm onSubmit={vi.fn()} />);
    const body = screen.getByLabelText(/본문/) as HTMLTextAreaElement;
    const author = screen.getByLabelText(/작성자/) as HTMLInputElement;

    fireEvent.change(body, { target: { value: '좋은 글입니다' } });
    fireEvent.change(author, { target: { value: 'hana' } });

    expect(body.value).toBe('좋은 글입니다');
    expect(author.value).toBe('hana');
  });

  it('빈 body submit → 인라인 에러 + onSubmit 미호출', async () => {
    const onSubmit = vi.fn();
    render(<CommentForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/작성자/), { target: { value: 'hana' } });
    fireEvent.click(screen.getByRole('button', { name: /댓글 작성/ }));

    expect(await screen.findByText('본문은 필수입니다')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    // author 보존
    expect((screen.getByLabelText(/작성자/) as HTMLInputElement).value).toBe('hana');
  });

  it('정상 submit → onSubmit 호출 + body reset + author 유지', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CommentForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/본문/), { target: { value: '  좋은 글  ' } });
    fireEvent.change(screen.getByLabelText(/작성자/), { target: { value: ' hana ' } });

    fireEvent.click(screen.getByRole('button', { name: /댓글 작성/ }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ body: '좋은 글', author: 'hana' });
    });
    await waitFor(() => {
      expect((screen.getByLabelText(/본문/) as HTMLTextAreaElement).value).toBe('');
    });
    expect((screen.getByLabelText(/작성자/) as HTMLInputElement).value).toBe(' hana ');
  });

  it('submit 실패 (NormalizedError) → 상단 alert 노출 + 입력값 보존', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new NormalizedError(500, '서버 오류가 발생했습니다'));
    render(<CommentForm onSubmit={onSubmit} />);

    const body = screen.getByLabelText(/본문/) as HTMLTextAreaElement;
    fireEvent.change(body, { target: { value: '좋은 글' } });
    fireEvent.change(screen.getByLabelText(/작성자/), { target: { value: 'hana' } });

    fireEvent.click(screen.getByRole('button', { name: /댓글 작성/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('서버 오류가 발생했습니다');
    expect(body.value).toBe('좋은 글');
  });
});
