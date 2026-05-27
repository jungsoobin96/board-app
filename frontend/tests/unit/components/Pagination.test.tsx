/**
 * Pagination snapshot + onPageChange click.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Pagination } from '../../../src/components/Pagination';

afterEach(() => cleanup());

describe('Pagination', () => {
  it('snapshot — total=25 limit=10 page=2', () => {
    const { asFragment } = render(
      <Pagination page={2} total={25} limit={10} onPageChange={vi.fn()} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('totalPages=1 이면 null 반환 (렌더 안 함)', () => {
    const { container } = render(
      <Pagination page={1} total={5} limit={10} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('"2" 클릭 시 onPageChange(2) 호출', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} total={25} limit={10} onPageChange={onPageChange} />);
    const btn2 = screen.getByRole('button', { name: '2' });
    btn2.click();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('첫 페이지에서 이전 버튼 disabled', () => {
    render(<Pagination page={1} total={25} limit={10} onPageChange={vi.fn()} />);
    const prev = screen.getByRole('button', { name: '이전 페이지' });
    expect(prev).toBeDisabled();
  });
});
