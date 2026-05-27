/**
 * CommentList — 댓글 N건 목록. 빈 케이스 inline 메시지.
 * 작성/삭제 UI는 Sprint 4 feat-comment-create-delete-ui.
 * <section aria-label="댓글"> 시맨틱.
 */
import type { Comment } from '@app/shared';

interface Props {
  comments: Comment[];
}

export const CommentList = ({ comments }: Props): JSX.Element => (
  <section aria-label="댓글" className="mt-8">
    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
      댓글 ({comments.length})
    </h2>
    {comments.length === 0 ? (
      <p className="text-sm text-neutral-700 border border-neutral-300 rounded p-4 text-center">
        아직 댓글이 없습니다.
      </p>
    ) : (
      <ul className="flex flex-col gap-3">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="border border-neutral-300 rounded p-3 text-sm text-neutral-700"
          >
            <p className="whitespace-pre-wrap mb-2">{comment.body}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">{comment.author}</span>
              <time dateTime={comment.createdAt} className="text-neutral-700/70">
                {formatDate(comment.createdAt)}
              </time>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
