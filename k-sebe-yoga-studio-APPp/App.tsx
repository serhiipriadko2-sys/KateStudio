import {
  analytics,
  isSupabaseConfigured,
  supabase,
  UpdateBanner,
  OfflineBanner,
  useOnlineStatus,
} from '@ksebe/shared';
import { Loader2 } from 'lucide-react';
import { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Logo } from './components/Logo';
import { OnboardingQuizModal, type OnboardingData } from './components/OnboardingQuizModal';
import { useAuth } from './context/AuthContext';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import { hapticLight, hapticSuccess } from './native';
import { retentionService } from './services/retentionService';

const Dashboard = lazy(() =>
  import('./components/Dashboard').then((m) => ({ default: m.Dashboard }))
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
  </div>
);

const IntroSplash = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isSparking, setIsSparking] = useState(false);
  const [isIgnited, setIsIgnited] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [shake, setShake] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rewindRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shakeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCompleteRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rewindRef.current) clearInterval(rewindRef.current);
      if (shakeRef.current) clearInterval(shakeRef.current);
    };
  }, []);

  const startShake = () => {
    if (shakeRef.current) clearInterval(shakeRef.current);
    shakeRef.current = setInterval(() => {
      setShake(Math.random() * 2 - 1);
    }, 50);
  };

  const stopShake = () => {
    if (shakeRef.current) clearInterval(shakeRef.current);
    setShake(0);
  };

  const startPress = () => {
    if (isCompleteRef.current) return;
    if (rewindRef.current) {
      clearInterval(rewindRef.current);
      rewindRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);

    setIsSparking(true);
    startShake();
    void hapticLight();

    let current = progress;
    timerRef.current = setInterval(() => {
      current += 1.0;
      if (current > 70) current += 0.5;

      if (current >= 100) {
        current = 100;
        if (timerRef.current) clearInterval(timerRef.current);
        handleSuccess();
      }
      setProgress(current);
    }, 16);
  };

  const endPress = () => {
    if (isCompleteRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsSparking(false);
    stopShake();

    if (progress > 0) {
      if (rewindRef.current) clearInterval(rewindRef.current);
      rewindRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev - 3;
          if (next <= 0) {
            if (rewindRef.current) clearInterval(rewindRef.current);
            return 0;
          }
          return next;
        });
      }, 10);
    }
  };

  const handleSuccess = () => {
    isCompleteRef.current = true;
    setIsSparking(false);
    stopShake();
    setIsIgnited(true);
    void hapticSuccess();
    setTimeout(() => {
      setShowWelcome(true);
      setTimeout(() => {
        onComplete();
      }, 1200);
    }, 600);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Удерживайте чтобы начать"
      className={`fixed inset-0 z-100 bg-[#0F2820] flex flex-col items-center justify-center select-none touch-none transition-opacity duration-1000 ${showWelcome ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startPress();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          endPress();
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className={`relative transition-transform duration-1500 ease-out ${showWelcome ? 'scale-125' : 'scale-100'}`}
        style={{ transform: `translate(${shake}px, ${shake}px) scale(${showWelcome ? 1.2 : 1})` }}
      >
        <div className="relative z-10">
          <Logo
            className="w-80 h-auto md:w-96"
            progress={progress}
            isSparking={isSparking}
            isIgnited={isIgnited}
            variant="full"
          />
        </div>

        {isSparking && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-yellow-200 rounded-full animate-ping"></div>
            <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-ping delay-75"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          </div>
        )}
      </div>

      <div
        className={`absolute bottom-24 left-0 right-0 text-center pointer-events-none px-4 h-16 transition-opacity duration-500 ${isIgnited ? 'opacity-0' : 'opacity-100'}`}
      >
        <div
          className={`transition-opacity duration-300 ${progress > 5 ? 'opacity-100' : 'opacity-40'}`}
        >
          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-brand-mint/50 font-medium animate-pulse">
            {progress > 0 ? 'Заряжаем...' : 'Удерживайте'}
          </p>
        </div>
      </div>

      {!isIgnited && progress > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1.5 bg-[#FCEEAC] transition-all duration-75 ease-linear shadow-[0_0_20px_#FCEEAC]"
          style={{ width: `${progress}%` }}
        ></div>
      )}
    </div>
  );
};

export function App() {
  useEffect(() => {
    analytics.initWebVitals();
    analytics.pageView(window.location.pathname);
  }, []);

  const { authStatus, user, isAuthenticated, isInitializing } = useAuth();
  const isOnline = useOnlineStatus();
  const { updateAvailable, updating, triggerUpdate, dismissUpdate } = usePWAUpdate();
  const [introFinished, setIntroFinished] = useState(() => {
    return localStorage.getItem('ksebe_intro_complete') === 'true';
  });
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Load and sync theme from Supabase
  useEffect(() => {
    const loadAndSyncTheme = async () => {
      try {
        const savedTheme = localStorage.getItem('ksebe_theme_config');
        if (savedTheme) {
          const colors = JSON.parse(savedTheme);
          Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, String(value));
          });
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase
            .from('app_settings')
            .select('key, value')
            .eq('key', 'theme')
            .single();
          if (data?.value) {
            const colors = data.value as Record<string, string>;
            Object.entries(colors).forEach(([key, value]) => {
              document.documentElement.style.setProperty(key, String(value));
            });
            localStorage.setItem('ksebe_theme_config', JSON.stringify(colors));
          }
        } catch (e) {
          console.warn('Theme sync failed', e);
        }
      }
    };

    loadAndSyncTheme();
  }, []);

  useEffect(() => {
    if (authStatus !== 'authenticated' || !user?.id) return;
    retentionService.bootstrapForUser(user.id).catch(() => {});
  }, [authStatus, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    retentionService
      .hasCompletedOnboarding(user.id)
      .then((done) => {
        if (!done) setOnboardingOpen(true);
      })
      .catch(() => {
        if (localStorage.getItem('ksebe_onboarding_complete') !== 'true') {
          setOnboardingOpen(true);
        }
      });
  }, [isAuthenticated, user?.id]);

  const handleIntroComplete = () => {
    localStorage.setItem('ksebe_intro_complete', 'true');
    setIntroFinished(true);
    if (localStorage.getItem('ksebe_onboarding_complete') !== 'true') {
      setOnboardingOpen(true);
    }
  };

  if (!introFinished) {
    return <IntroSplash onComplete={handleIntroComplete} />;
  }

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-[#0F2820] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-mint animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Dashboard onBack={() => {}} />
        </Suspense>
      </ErrorBoundary>

      <UpdateBanner
        visible={updateAvailable}
        updating={updating}
        onUpdate={triggerUpdate}
        onDismiss={dismissUpdate}
      />
      <OfflineBanner visible={!isOnline && !updateAvailable} />

      <OnboardingQuizModal
        open={onboardingOpen}
        onClose={() => {
          localStorage.setItem('ksebe_onboarding_complete', 'true');
          setOnboardingOpen(false);
        }}
        onComplete={(data: OnboardingData) => {
          localStorage.setItem('ksebe_onboarding', JSON.stringify(data));
          localStorage.setItem('ksebe_onboarding_complete', 'true');
          setOnboardingOpen(false);
          if (authStatus === 'authenticated' && user?.id) {
            retentionService.saveOnboarding(user.id, data).catch(() => {});
            retentionService
              .logEvent(user.id, 'onboarding_completed', { source: 'app' })
              .catch(() => {});
          }
        }}
      />
    </>
  );
}
