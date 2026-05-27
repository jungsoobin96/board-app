/**
 * NotFound RTL — heading + "홈으로" Link href="/" 검증.
 * R-F-08 회귀 보호.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from '../../../src/pages/NotFound';

afterEach(() => cleanup());

describe('NotFound', () => {
  it('heading "찾을 수 없는 페이지" 노출 + aria-labelledby 일치', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    const heading = screen.getByRole('heading', { name: '찾을 수 없는 페이지' });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('id', 'notfound-heading');
  });

  it('"홈으로" Link href="/" 렌더', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: '홈으로' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
