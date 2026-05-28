/**
 * Layout — 헤더(로고 + nav 새 글) + main 시맨틱 마크업.
 * 10 §4 a11y — <header>·<nav>·<main> 시맨틱 노드 + focus ring (styles.css에서 처리).
 * 반응형: max-w + 가운데 정렬. 정밀 검증은 Sprint 5 #21.
 */
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

/**
 * 페이지 공통 레이아웃 — 헤더(로고·새 글 버튼) + main 콘텐츠 영역.
 * `<header>`·`<nav>`·`<main>` 시맨틱 + 최대폭 + 가운데 정렬 (10 §4 a11y 정합).
 */
export const Layout = ({ children }: LayoutProps): JSX.Element => (
  <div className="min-h-screen bg-neutral-0 text-neutral-700">
    <header className="border-b border-neutral-300 bg-neutral-0">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-neutral-900">
          Conduit Lite
        </Link>
        <nav aria-label="주요 메뉴">
          <Link
            to="/editor"
            className="bg-primary-500 text-neutral-0 px-3 py-2 rounded font-semibold hover:bg-primary-700"
          >
            새 글
          </Link>
        </nav>
      </div>
    </header>
    <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
  </div>
);
