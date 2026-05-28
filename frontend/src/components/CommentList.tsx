/**
 * CommentList — 댓글 N건 목록. 빈 케이스 inline 메시지.
 * onDelete prop 있으면 각 댓글에 "삭제" 버튼 노출 (#16에서 결합).
 * <section aria-label="댓글"> 시맨틱.
 */
import type { Comment } from '@app/shared';

interface Props {
  comments: Comment[];
  onDelete?: (commentId: number) => void;
}

/**
 * 댓글 N건 목록 — 빈 케이스 inline 메시지 노출.
 * `onDelete` prop 주어지면 각 댓글에 "삭제" 버튼 렌더 (페이지 컴포넌트가 권한 정책 결정).
 */
export const CommentList = ({ comments, onDelete }: Props): JSX.Element => (
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
              <span className="flex items-center gap-2">
                <time dateTime={comment.createdAt} className="text-neutral-700/70">
                  {formatDate(comment.createdAt)}
                </time>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(comment.id)}
                    aria-label={`댓글 #${comment.id} 삭제`}
                    className="px-2 py-0.5 rounded border border-danger-500 text-danger-500 text-xs font-semibold hover:bg-danger-500 hover:text-neutral-0"
                  >
                    삭제
                  </button>
                )}
              </span>
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
