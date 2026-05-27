/**
 * EditorForm RTL — controlled · validation · submit error 보존 · disabled during submit.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { EditorForm } from '../../../src/components/EditorForm';
import { NormalizedError } from '@app/shared';

afterEach(() => cleanup());

describe('EditorForm', () => {
  it('controlled — 4 필드 입력 시 state 갱신', () => {
    render(<EditorForm submitLabel="발행" onSubmit={vi.fn()} />);
    const title = screen.getByLabelText(/제목/) as HTMLInputElement;
    const author = screen.getByLabelText(/작성자/) as HTMLInputElement;
    const body = screen.getByLabelText(/본문/) as HTMLTextAreaElement;
    const tags = screen.getByLabelText(/태그/) as HTMLInputElement;

    fireEvent.change(title, { target: { value: 'Hello' } });
    fireEvent.change(author, { target: { value: 'hana' } });
    fireEvent.change(body, { target: { value: 'world' } });
    fireEvent.change(tags, { target: { value: 'JavaScript, intro' } });

    expect(title.value).toBe('Hello');
    expect(author.value).toBe('hana');
    expect(body.value).toBe('world');
    expect(tags.value).toBe('JavaScript, intro');
  });

  it('빈 title submit → 인라인 에러 + onSubmit 미호출 + 입력값 보존', async () => {
    const onSubmit = vi.fn();
    render(<EditorForm submitLabel="발행" onSubmit={onSubmit} />);

    const author = screen.getByLabelText(/작성자/) as HTMLInputElement;
    const body = screen.getByLabelText(/본문/) as HTMLTextAreaElement;
    fireEvent.change(author, { target: { value: 'hana' } });
    fireEvent.change(body, { target: { value: 'world' } });

    fireEvent.click(screen.getByRole('button', { name: /발행/ }));

    expect(await screen.findByText('제목은 필수입니다')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    // 입력값 보존
    expect(author.value).toBe('hana');
    expect(body.value).toBe('world');
  });

  it('정상 submit → onSubmit 호출 with trimmed payload + tagList 정규화', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EditorForm submitLabel="발행" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '  Hello  ' } });
    fireEvent.change(screen.getByLabelText(/작성자/), { target: { value: ' hana ' } });
    fireEvent.change(screen.getByLabelText(/본문/), { target: { value: ' world ' } });
    fireEvent.change(screen.getByLabelText(/태그/), {
      target: { value: ' JavaScript, intro,  JavaScript ,  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /발행/ }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Hello',
      author: 'hana',
      body: 'world',
      tagList: ['javascript', 'intro'],
    });
  });

  it('submit 진행 중 버튼 disabled + aria-busy', async () => {
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(<EditorForm submitLabel="발행" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: 't' } });
    fireEvent.change(screen.getByLabelText(/작성자/), { target: { value: 'a' } });
    fireEvent.change(screen.getByLabelText(/본문/), { target: { value: 'b' } });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
    expect(screen.getByRole('button').textContent).toMatch(/저장 중/);

    resolveSubmit?.();
  });

  it('submit 실패 (NormalizedError) → 상단 alert 노출 + 입력값 보존', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new NormalizedError(500, '서버 오류가 발생했습니다'));
    render(<EditorForm submitLabel="발행" onSubmit={onSubmit} />);

    const title = screen.getByLabelText(/제목/) as HTMLInputElement;
    fireEvent.change(title, { target: { value: 'Hello' } });
    fireEvent.change(screen.getByLabelText(/작성자/), { target: { value: 'hana' } });
    fireEvent.change(screen.getByLabelText(/본문/), { target: { value: 'world' } });

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByRole('alert')).toHaveTextContent('서버 오류가 발생했습니다');
    expect(title.value).toBe('Hello');
  });

  it('initialValues 적용', () => {
    render(
      <EditorForm
        submitLabel="저장"
        initialValues={{ title: '기존 제목', author: 'hana', body: '기존 본문', tagListInput: 'js' }}
        onSubmit={vi.fn()}
      />,
    );
    expect((screen.getByLabelText(/제목/) as HTMLInputElement).value).toBe('기존 제목');
    expect((screen.getByLabelText(/작성자/) as HTMLInputElement).value).toBe('hana');
    expect((screen.getByLabelText(/본문/) as HTMLTextAreaElement).value).toBe('기존 본문');
    expect((screen.getByLabelText(/태그/) as HTMLInputElement).value).toBe('js');
    expect(screen.getByRole('button', { name: /저장/ })).toBeInTheDocument();
  });
});
