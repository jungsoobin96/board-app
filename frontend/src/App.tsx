/**
 * App — BrowserRouter + Layout + Routes 조립.
 * ErrorBoundary로 children render fail을 fallback UI로 흡수 (MVP fail-soft).
 */
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router/routes';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App = (): JSX.Element => (
  <BrowserRouter>
    <ErrorBoundary>
      <Layout>
        <AppRoutes />
      </Layout>
    </ErrorBoundary>
  </BrowserRouter>
);
