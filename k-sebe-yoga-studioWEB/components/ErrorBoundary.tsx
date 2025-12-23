import { AlertTriangle, RotateCcw } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
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
              <div className="bg-stone-50 p-4 rounded-xl text-left mb-8 overflow-auto max-h-32 border border-stone-200 scrollbar-hide">
                <p className="text-[10px] text-stone-400 font-bold uppercase mb-1">
                  Техническая информация:
                </p>
                <code className="text-xs text-stone-600 font-mono block break-words">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full py-4 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors font-medium shadow-lg hover:shadow-xl transform active:scale-95 duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
