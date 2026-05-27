/**
 * ErrorBoundary — children render fail 시 fallback UI (MVP fail-soft).
 * Class component (React Hooks 미지원 영역). Sentry 등 외부 송신은 Phase 2.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] render fail', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div role="alert" className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-2xl font-bold text-danger-500 mb-4">
            오류가 발생했습니다
          </h1>
          <p className="text-neutral-700">
            페이지 렌더링 중 문제가 발생했습니다. 새로고침해 주세요.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
