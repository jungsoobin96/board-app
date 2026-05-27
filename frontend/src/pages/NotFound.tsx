/**
 * S-05 NotFound — 미일치 경로 fallback.
 */
import { Link } from 'react-router-dom';

export const NotFound = (): JSX.Element => (
  <section aria-labelledby="notfound-heading">
    <h1 id="notfound-heading" className="text-2xl font-bold text-neutral-900 mb-4">
      찾을 수 없는 페이지
    </h1>
    <p className="text-neutral-700 mb-4">
      요청하신 경로가 존재하지 않습니다. 홈으로 돌아가세요.
    </p>
    <Link
      to="/"
      className="inline-block bg-primary-500 text-neutral-0 px-4 py-2 rounded font-semibold hover:bg-primary-700"
    >
      홈으로
    </Link>
  </section>
);
