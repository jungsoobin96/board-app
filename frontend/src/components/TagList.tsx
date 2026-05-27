/**
 * TagList — 인기 태그 칩 목록 (사이드바).
 * 현재 선택된 태그는 강조. 클릭 시 onTagClick(name) 호출 (호출처가 URL 갱신).
 * 10 §3 TagChip primitive variant — Tailwind utility 직 적용.
 */
import type { Tag } from '@app/shared';

interface Props {
  tags: Tag[];
  selectedTag: string | null;
  onTagClick: (name: string | null) => void;
}

export const TagList = ({ tags, selectedTag, onTagClick }: Props): JSX.Element => (
  <aside aria-label="인기 태그" className="border border-neutral-300 rounded p-4">
    <h2 className="text-base font-semibold text-neutral-900 mb-3">인기 태그</h2>
    {tags.length === 0 ? (
      <p className="text-sm text-neutral-700">태그가 아직 없습니다.</p>
    ) : (
      <ul className="flex flex-wrap gap-2">
        {selectedTag && (
          <li>
            <button
              type="button"
              onClick={() => onTagClick(null)}
              className="bg-neutral-100 text-neutral-700 px-2 py-1 rounded text-xs hover:bg-neutral-300"
            >
              필터 해제 ×
            </button>
          </li>
        )}
        {tags.map((tag) => {
          const active = tag.name === selectedTag;
          return (
            <li key={tag.name}>
              <button
                type="button"
                onClick={() => onTagClick(active ? null : tag.name)}
                aria-pressed={active}
                className={`px-2 py-1 rounded text-xs hover:bg-secondary-500/20 ${
                  active
                    ? 'bg-secondary-500 text-neutral-0'
                    : 'bg-secondary-500/10 text-secondary-700'
                }`}
              >
                {tag.name}
                <span className="ml-1 text-neutral-700/70">({tag.count})</span>
              </button>
            </li>
          );
        })}
      </ul>
    )}
  </aside>
);
