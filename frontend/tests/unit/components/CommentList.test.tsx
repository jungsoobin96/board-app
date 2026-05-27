/**
 * CommentList RTL snapshot + 빈 케이스 + onDelete prop (#16).
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { CommentList } from '../../../src/components/CommentList';
import type { Comment } from '@app/shared';

afterEach(() => cleanup());

const sampleComments: Comment[] = [
  {
    id: 1,
    articleId: 1,
    body: '재미있는 글입니다',
    author: 'min',
    createdAt: '2026-01-15T10:30:00.000Z',
  },
  {
    id: 2,
    articleId: 1,
    body: '두 번째 댓글\n여러 줄도\n잘 보여요',
    author: 'hana',
    createdAt: '2026-01-16T11:00:00.000Z',
  },
];

describe('CommentList', () => {
  it('snapshot — 댓글 2건', () => {
    const { asFragment } = render(<CommentList comments={sampleComments} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('빈 comments 배열 → "아직 댓글이 없습니다"', () => {
    render(<CommentList comments={[]} />);
    expect(screen.getByText('아직 댓글이 없습니다.')).toBeInTheDocument();
  });

  it('헤더 "댓글 (N)" 카운트 표시', () => {
    render(<CommentList comments={sampleComments} />);
    expect(screen.getByRole('heading', { name: /댓글 \(2\)/ })).toBeInTheDocument();
  });

  it('onDelete prop 있을 때 각 댓글에 삭제 버튼 노출 + 클릭 시 commentId로 호출 (#16)', () => {
    const onDelete = vi.fn();
    render(<CommentList comments={sampleComments} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /댓글 #\d+ 삭제/ });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
