/**
 * S-01 Home — 글 목록 + 사이드바 인기 태그 + 페이지네이션.
 * URL이 source-of-truth (useSearchParams) — ?page=N&tag=name 양방향 동기.
 * 5상태 inline (loading skeleton / error / empty "결과 없음" / success / idle).
 * 768px 미만 사이드바 stack (Tailwind responsive).
 */
import { useSearchParams } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { useTags } from '../hooks/useTags';
import { ArticleCard } from '../components/ArticleCard';
import { Pagination } from '../components/Pagination';
import { TagList } from '../components/TagList';

const DEFAULT_LIMIT = 10;

export const Home = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageRaw = searchParams.get('page');
  const pageParsed = pageRaw ? Number(pageRaw) : 1;
  const page = Number.isInteger(pageParsed) && pageParsed >= 1 ? pageParsed : 1;
  const tag = searchParams.get('tag');

  const articlesState = useArticles({ page, limit: DEFAULT_LIMIT, tag });
  const tagsState = useTags();

  const handlePageChange = (next: number): void => {
    const params = new URLSearchParams(searchParams);
    if (next <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(next));
    }
    setSearchParams(params);
  };

  const handleTagClick = (next: string | null): void => {
    const params = new URLSearchParams(searchParams);
    if (next === null) {
      params.delete('tag');
    } else {
      params.set('tag', next);
    }
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <section aria-labelledby="home-heading" className="md:flex-[2]">
        <h1 id="home-heading" className="text-3xl font-bold text-neutral-900 mb-6">
          최신 글
        </h1>
        {articlesState.status === 'loading' && (
          <ul aria-busy="true" className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="border border-neutral-300 rounded p-4 animate-pulse h-24 bg-neutral-100"
              />
            ))}
          </ul>
        )}
        {articlesState.status === 'error' && articlesState.error && (
          <div role="alert" className="border border-danger-500 rounded p-4 text-danger-500">
            <p className="font-semibold mb-1">글 목록을 불러올 수 없습니다</p>
            <p className="text-sm">{articlesState.error.message}</p>
          </div>
        )}
        {articlesState.status === 'empty' && (
          <div className="border border-neutral-300 rounded p-8 text-center text-neutral-700">
            <p className="font-semibold">결과 없음</p>
            <p className="text-sm mt-2">
              {tag ? `"${tag}" 태그에 해당하는 글이 없습니다.` : '아직 작성된 글이 없습니다.'}
            </p>
          </div>
        )}
        {articlesState.status === 'success' && articlesState.data && (
          <>
            <ul className="flex flex-col gap-3">
              {articlesState.data.articles.map((article) => (
                <li key={article.id}>
                  <ArticleCard article={article} />
                </li>
              ))}
            </ul>
            <Pagination
              page={articlesState.data.page}
              total={articlesState.data.total}
              limit={articlesState.data.limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
      <div className="md:flex-1">
        {tagsState.status === 'loading' && (
          <div aria-busy="true" className="border border-neutral-300 rounded p-4 animate-pulse h-32 bg-neutral-100" />
        )}
        {tagsState.status === 'error' && (
          <div role="alert" className="border border-danger-500 rounded p-4 text-danger-500 text-sm">
            태그 목록을 불러올 수 없습니다.
          </div>
        )}
        {(tagsState.status === 'success' || tagsState.status === 'empty') && tagsState.data && (
          <TagList tags={tagsState.data} selectedTag={tag} onTagClick={handleTagClick} />
        )}
      </div>
    </div>
  );
};
