/**
 * M1 FE-router — 5 path 정의 + matchRoute 헬퍼.
 * `<Routes>` 패턴 (data router 미사용 — MVP 학습 단순, 10 §5 O Phase 2).
 * matchRoute는 단위 test 대상 (BrowserRouter mount 없이도 path → route name 매핑 검증 가능).
 */
import { Route, Routes } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Article } from '../pages/Article';
import { Editor } from '../pages/Editor';
import { NotFound } from '../pages/NotFound';

export const AppRoutes = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/article/:id" element={<Article />} />
    <Route path="/editor" element={<Editor />} />
    <Route path="/editor/:id" element={<Editor />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export type RouteName = 'home' | 'article' | 'editor' | 'notfound';

export interface MatchResult {
  name: RouteName;
  params: Record<string, string>;
}

/**
 * 단위 test용 헬퍼 — 실제 라우팅은 react-router-dom이 처리하나, 단위 검증 위해 동일 로직을 함수로 분리.
 * React Router 6 path-to-regexp 동작과 일치하도록 직접 구현.
 */
export function matchRoute(pathname: string): MatchResult {
  if (pathname === '/') {
    return { name: 'home', params: {} };
  }
  const articleMatch = /^\/article\/([^/]+)$/.exec(pathname);
  if (articleMatch) {
    return { name: 'article', params: { id: articleMatch[1]! } };
  }
  if (pathname === '/editor') {
    return { name: 'editor', params: {} };
  }
  const editorIdMatch = /^\/editor\/([^/]+)$/.exec(pathname);
  if (editorIdMatch) {
    return { name: 'editor', params: { id: editorIdMatch[1]! } };
  }
  return { name: 'notfound', params: {} };
}
