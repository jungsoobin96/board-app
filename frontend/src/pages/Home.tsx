/**
 * S-01 Home placeholder — 글 목록 + 사이드바 실 컨텐츠는 Sprint 3 #12에서.
 * 본 PR은 10 §3 design token utility 적용 확인 (AC-02 bg-primary-500).
 */
export const Home = (): JSX.Element => (
  <section aria-labelledby="home-heading">
    <h1 id="home-heading" className="text-3xl font-bold text-neutral-900 mb-6">
      Home — 글 목록
    </h1>
    <div className="bg-primary-500 text-neutral-0 p-4 rounded">
      <p className="font-semibold">Design token sanity</p>
      <p className="text-sm">
        bg-primary-500 utility — 본 박스가 파란색(<code className="font-mono">#3b82f6</code>)으로 보이면 토큰 매핑 정상.
      </p>
    </div>
    <p className="mt-6 text-neutral-700">
      실 글 목록은 Sprint 3 Issue #12 (feat-home-page)에서 구현됩니다.
    </p>
  </section>
);
