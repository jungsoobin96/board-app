/**
 * Pagination — < 1 [2] 3 > navigation.
 * 현재 페이지 강조 (primary-500). 클릭 시 onPageChange(page) 호출 (호출처가 URL 갱신).
 * <nav aria-label="페이지네이션"> 시맨틱.
 */
interface Props {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, total, limit, onPageChange }: Props): JSX.Element | null => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <nav aria-label="페이지네이션" className="flex items-center justify-center gap-2 mt-6">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
        className="px-3 py-1 rounded border border-neutral-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary-500"
      >
        &lt;
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`px-3 py-1 rounded text-sm font-semibold ${
            p === page
              ? 'bg-primary-500 text-neutral-0'
              : 'border border-neutral-300 hover:border-primary-500'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
        className="px-3 py-1 rounded border border-neutral-300 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary-500"
      >
        &gt;
      </button>
    </nav>
  );
};
