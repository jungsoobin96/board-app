/**
 * TagList snapshot + onTagClick.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TagList } from '../../../src/components/TagList';

afterEach(() => cleanup());

const sampleTags = [
  { name: 'javascript', count: 12 },
  { name: 'typescript', count: 7 },
];

describe('TagList', () => {
  it('snapshot — 2 tags, no selection', () => {
    const { asFragment } = render(
      <TagList tags={sampleTags} selectedTag={null} onTagClick={vi.fn()} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('selectedTag="javascript" → 필터 해제 버튼 노출 + aria-pressed', () => {
    render(<TagList tags={sampleTags} selectedTag="javascript" onTagClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: /필터 해제/ })).toBeInTheDocument();
    const jsBtn = screen.getByRole('button', { name: /javascript/ });
    expect(jsBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('태그 클릭 시 onTagClick(name) 호출', () => {
    const onTagClick = vi.fn();
    render(<TagList tags={sampleTags} selectedTag={null} onTagClick={onTagClick} />);
    screen.getByRole('button', { name: /typescript/ }).click();
    expect(onTagClick).toHaveBeenCalledWith('typescript');
  });

  it('빈 tags 배열 → "태그가 아직 없습니다" 메시지', () => {
    render(<TagList tags={[]} selectedTag={null} onTagClick={vi.fn()} />);
    expect(screen.getByText('태그가 아직 없습니다.')).toBeInTheDocument();
  });

  it('active 태그 재클릭 시 onTagClick(null) 호출 (해제, #18)', () => {
    const onTagClick = vi.fn();
    render(<TagList tags={sampleTags} selectedTag="javascript" onTagClick={onTagClick} />);
    screen.getByRole('button', { name: /javascript/ }).click();
    expect(onTagClick).toHaveBeenCalledWith(null);
  });

  it('비-active 태그 클릭 시 onTagClick(name) 호출 (선택, #18)', () => {
    const onTagClick = vi.fn();
    render(<TagList tags={sampleTags} selectedTag="javascript" onTagClick={onTagClick} />);
    screen.getByRole('button', { name: /typescript/ }).click();
    expect(onTagClick).toHaveBeenCalledWith('typescript');
  });
});
