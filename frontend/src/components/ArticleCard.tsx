/**
 * ArticleCard — 글 1건 카드. Home 글 목록의 단위 컴포넌트.
 * 10 §3 component primitives Card variant — Tailwind utility 직 적용.
 * <article> 시맨틱 마크업. <Link to="/article/:id">로 상세 진입.
 */
import { Link } from 'react-router-dom';
import type { Article } from '@app/shared';

interface Props {
  article: Article;
}

/**
 * 글 1건 카드 — Home 글 목록의 단위. 제목·본문 미리보기·작성자·날짜·태그 노출.
 * `<article>` 시맨틱 + `<Link to="/article/:id">`로 상세 진입.
 */
export const ArticleCard = ({ article }: Props): JSX.Element => (
  <article className="border border-neutral-300 rounded p-4 hover:border-primary-500 transition-colors">
    <Link to={`/article/${article.id}`} className="block">
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">{article.title}</h2>
      <p className="text-sm text-neutral-700 line-clamp-2 mb-3">{article.body}</p>
    </Link>
    <div className="flex items-center justify-between text-xs text-neutral-700">
      <span>
        <span className="font-semibold">{article.author}</span>
        <span className="mx-2" aria-hidden="true">·</span>
        <time dateTime={article.createdAt}>{formatDate(article.createdAt)}</time>
      </span>
      {article.tags.length > 0 && (
        <ul className="flex gap-1 flex-wrap" aria-label="태그">
          {article.tags.map((tag) => (
            <li
              key={tag}
              className="bg-secondary-500/10 text-secondary-700 px-2 py-1 rounded text-xs"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  </article>
);

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}
