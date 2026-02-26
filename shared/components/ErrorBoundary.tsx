/**
 * K Sebe Yoga Studio - ErrorBoundary Component
 * =============================================
 * Catches JavaScript errors in child components
 */

import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface ErrorBoundaryProps {
  children?: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use structured logging instead of console.error
    logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    });
    this.props.onError?.(error, errorInfo);

    // In production, this is where you'd send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6 font-sans">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl max-w-lg text-center border border-stone-100">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 animate-in zoom-in duration-300">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-serif text-stone-800 mb-4">Что-то пошло не так</h1>
            <p className="text-stone-500 mb-8 leading-relaxed text-sm">
              Произошла непредвиденная ошибка в работе приложения. Мы уже работаем над ее
              устранением. Пожалуйста, попробуйте перезагрузить страницу.
            </p>

            {this.state.error && (
              <div className="bg-stone-50 p-4 rounded-xl text-left mb-8 overflow-auto max-h-32 border border-stone-200">
                <p className="text-[10px] text-stone-400 font-bold uppercase mb-1">
                  Техническая информация:
                </p>
                <code className="text-xs text-stone-600 font-mono block break-words">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-4 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-medium shadow-lg hover:shadow-xl transform active:scale-95 duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Перезагрузить страницу
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 w-full py-3 text-brand-green hover:text-brand-green/80 transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Вернуться на главную
              </button>
            </div>

            {/* Support Link */}
            <p className="mt-6 text-sm text-stone-500">
              Если проблема повторяется,{' '}
              <a
                href="https://t.me/k_sebe_dubna"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-green hover:underline"
              >
                свяжитесь с нами
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
