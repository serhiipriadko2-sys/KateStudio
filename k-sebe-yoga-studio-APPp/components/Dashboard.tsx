/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  IMAGES,
  supabase,
  uploadFile,
  DailyRecommendation,
  StreakCalendar,
  useGamification,
} from '@ksebe/shared';
import type {
  DailyRecommendationData as DailyRecommendationType,
  StreakCalendarDay,
} from '@ksebe/shared';
import {
  LogOut,
  LayoutDashboard,
  Video,
  Wind,
  Calendar,
  Trophy,
  ChevronRight,
  User,
  // Sparkles, // AI tab hidden вЂ” re-enable after launch
  Loader2,
  X,
  Edit2,
  Save,
  Terminal,
  Ticket,
  QrCode,
  Camera,
} from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dataService } from '../services/dataService';
import { subscriptionService } from '../services/subscriptionService';
import { Booking, Subscription } from '../types';
import { Achievements } from './Achievements';
// import { AICoach } from './AICoach'; // AI hidden вЂ” re-enable after launch
import { Breathwork } from './Breathwork';
import { DeveloperSettings } from './DeveloperSettings';
import { Image } from './Image';
import { Logo } from './Logo';
// Paywall hidden вЂ” re-enable after launch
// import { Paywall } from './Paywall';
import { Schedule } from './Schedule';
import { VideoLibrary } from './VideoLibrary';

interface DashboardProps {
  onBack: () => void;
  initialTab?: 'overview' | 'schedule' | 'videos' | 'breath' | 'profile' | 'dev';
}

// Subscription labels hidden вЂ” re-enable after launch
// const subscriptionStatusLabels: Record<SubscriptionStatus, string> = { ... };
// const subscriptionPlanLabels: Record<SubscriptionPlan, string> = { ... };

export const Dashboard: React.FC<DashboardProps> = ({ onBack, initialTab = 'overview' }) => {
  const { user, setUser, logout, authStatus, isSupabaseConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'schedule' | 'videos' | 'breath' | 'profile' | 'dev'
  >(initialTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedQr, setExpandedQr] = useState<string | null>(null);

  // Subscription State (hidden вЂ” re-enable after launch)
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [, setSubscriptionLoading] = useState(false);
  // subscriptionActionLoading, showPaywall вЂ” hidden, re-enable after launch
  // const [subscriptionActionLoading, setSubscriptionActionLoading] = useState(false);
  // const [showPaywall, setShowPaywall] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bookingsNoticeRef = useRef<string | null>(null);
  const hasLoadedBookingsRef = useRef(false);

  // Daily recommendation
  const [dailyRec, setDailyRec] = useState<DailyRecommendationType | null>(null);
  const [dailyRecLoading, setDailyRecLoading] = useState(false);

  // Streak calendar practice data
  const [practiceData, setPracticeData] = useState<Record<string, StreakCalendarDay>>({});
  const { currentStreak, isLoading: gamificationLoading } = useGamification(user?.id);

  const { showToast } = useToast();

  const getProfileSavedMessage = (reason?: string) =>
    reason === 'auth_required'
      ? 'РџСЂРѕС„РёР»СЊ СЃРѕС…СЂР°РЅС‘РЅ Р»РѕРєР°Р»СЊРЅРѕ. Р”Р»СЏ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё СЃРЅРѕРІР° РІРѕР№РґРёС‚Рµ РІ Р°РєРєР°СѓРЅС‚.'
      : 'РџСЂРѕС„РёР»СЊ СЃРѕС…СЂР°РЅС‘РЅ Р»РѕРєР°Р»СЊРЅРѕ. РЎРµСЂРІРµСЂ РІСЂРµРјРµРЅРЅРѕ РЅРµРґРѕСЃС‚СѓРїРµРЅ.';

  const getAvatarSavedMessage = (reason?: string) =>
    reason === 'auth_required'
      ? 'Р¤РѕС‚Рѕ СЃРѕС…СЂР°РЅРµРЅРѕ Р»РѕРєР°Р»СЊРЅРѕ. Р”Р»СЏ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё СЃРЅРѕРІР° РІРѕР№РґРёС‚Рµ РІ Р°РєРєР°СѓРЅС‚.'
      : 'Р¤РѕС‚Рѕ СЃРѕС…СЂР°РЅРµРЅРѕ Р»РѕРєР°Р»СЊРЅРѕ. РЎРµСЂРІРµСЂ РІСЂРµРјРµРЅРЅРѕ РЅРµРґРѕСЃС‚СѓРїРµРЅ.';

  const fetchBookings = useCallback(
    async (showLoading = false) => {
      if (authStatus !== 'authenticated' || !user?.phone) {
        setBookings([]);
        bookingsNoticeRef.current = null;
        hasLoadedBookingsRef.current = false;
        setLoading(false);
        return;
      }

      if (showLoading || !hasLoadedBookingsRef.current) {
        setLoading(true);
      }

      try {
        const bookingResult = await dataService.getBookings(user);
        setBookings(bookingResult.data.sort((a, b) => b.timestamp - a.timestamp));
        hasLoadedBookingsRef.current = true;

        if (bookingResult.degraded) {
          const noticeKey = `${bookingResult.source}:${bookingResult.reason ?? 'unknown'}`;
          if (bookingsNoticeRef.current !== noticeKey) {
            const noticeMessage =
              bookingResult.reason === 'pending_sync'
                ? 'Р§Р°СЃС‚СЊ Р·Р°РїРёСЃРµР№ СЃРѕС…СЂР°РЅРµРЅР° Р»РѕРєР°Р»СЊРЅРѕ Рё РµС‰С‘ РѕР¶РёРґР°РµС‚ СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё.'
                : bookingResult.reason === 'auth_required'
                  ? 'РџРѕРєР°Р·С‹РІР°РµРј Р»РѕРєР°Р»СЊРЅС‹Рµ Р·Р°РїРёСЃРё, РїРѕРєР° Р°РєРєР°СѓРЅС‚ РЅРµ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅ СЃ СЃРµСЂРІРµСЂРѕРј.'
                  : 'РџРѕРєР°Р·С‹РІР°РµРј СЃРѕС…СЂР°РЅС‘РЅРЅС‹Рµ Р·Р°РїРёСЃРё: СЃРµСЂРІРµСЂ РІСЂРµРјРµРЅРЅРѕ РЅРµРґРѕСЃС‚СѓРїРµРЅ.';
            showToast(noticeMessage, 'info');
            bookingsNoticeRef.current = noticeKey;
          }
        } else {
          bookingsNoticeRef.current = null;
        }
      } catch (error) {
        console.error('Failed to load bookings', error);
        showToast(
          'РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ Р·Р°РїРёСЃРё. РџРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р· РїРѕР·Р¶Рµ.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    },
    [authStatus, user, showToast]
  );

  const loadSubscription = useCallback(async () => {
    if (authStatus !== 'authenticated' || !isSupabaseConfigured) {
      setSubscription(null);
      return;
    }
    setSubscriptionLoading(true);
    const current = await subscriptionService.getCurrentSubscription();
    setSubscription(current);
    setSubscriptionLoading(false);
  }, [authStatus, isSupabaseConfigured]);

  // Initial bookings load
  useEffect(() => {
    void fetchBookings(true);
  }, [fetchBookings]);

  useEffect(() => {
    void loadSubscription();
  }, [loadSubscription]);

  // Real-time subscription stays stable across booking list updates.
  useEffect(() => {
    if (authStatus !== 'authenticated' || !user?.id) {
      return;
    }

    const channel = supabase
      .channel(`user_bookings:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          void fetchBookings();
          if (payload.eventType === 'INSERT')
            showToast('РќРѕРІР°СЏ Р·Р°РїРёСЃСЊ РґРѕР±Р°РІР»РµРЅР°!', 'success');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authStatus, user?.id, fetchBookings, showToast]);

  // Load daily recommendation (client-side generation, no AI call needed for basic version)
  useEffect(() => {
    if (authStatus !== 'authenticated') {
      setDailyRec(null);
      setDailyRecLoading(false);
      return;
    }

    setDailyRecLoading(true);
    const timer = window.setTimeout(() => {
      const cacheKey = `ksebe_daily_rec_${new Date().toDateString()}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setDailyRec(JSON.parse(cached) as DailyRecommendationType);
          setDailyRecLoading(false);
          return;
        } catch {
          /* regenerate */
        }
      }

      const practices: Array<DailyRecommendationType> = [
        {
          practiceId: 'inside-flow-1',
          title: 'РЈС‚СЂРµРЅРЅРёР№ Inside Flow',
          duration: 30,
          type: 'inside-flow',
          reason:
            'РРґРµР°Р»СЊРЅРѕ РґР»СЏ РЅР°С‡Р°Р»Р° РґРЅСЏ вЂ” Р°РєС‚РёРІРёСЂСѓРµС‚ СЌРЅРµСЂРіРёСЋ Рё СѓР»СѓС‡С€Р°РµС‚ РЅР°СЃС‚СЂРѕР№',
          matchScore: 92,
          musicMood: 'Uplifting',
          generatedAt: new Date().toISOString(),
        },
        {
          practiceId: 'hatha-1',
          title: 'РҐР°С‚С…Р° РґР»СЏ РіРёР±РєРѕСЃС‚Рё',
          duration: 45,
          type: 'hatha',
          reason:
            'РњСЏРіРєРѕРµ РІРѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёРµ, РїРѕРјРѕРіР°РµС‚ СЂР°СЃСЃР»Р°Р±РёС‚СЊ РЅР°РїСЂСЏР¶РµРЅРёРµ РІ С‚РµР»Рµ',
          matchScore: 88,
          musicMood: 'Serene',
          generatedAt: new Date().toISOString(),
        },
        {
          practiceId: 'meditation-1',
          title: 'РњРµРґРёС‚Р°С†РёСЏ РїРµСЂРµРґ СЃРЅРѕРј',
          duration: 15,
          type: 'meditation',
          reason:
            'РЈСЃРїРѕРєР°РёРІР°РµС‚ СѓРј Рё РіРѕС‚РѕРІРёС‚ Рє РіР»СѓР±РѕРєРѕРјСѓ РѕС‚РґС‹С…Сѓ',
          matchScore: 85,
          musicMood: 'Calm',
          generatedAt: new Date().toISOString(),
        },
      ];
      const rec = practices[new Date().getDay() % practices.length];
      localStorage.setItem(cacheKey, JSON.stringify(rec));
      setDailyRec(rec);
      setDailyRecLoading(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [authStatus]);

  // Load practice data for StreakCalendar from bookings
  useEffect(() => {
    if (bookings.length === 0) {
      setPracticeData({});
      return;
    }

    const data: Record<string, StreakCalendarDay> = {};
    bookings.forEach((b) => {
      const d = new Date(b.date || b.created_at || '');
      if (isNaN(d.getTime())) return;
      const key = d.toISOString().slice(0, 10);
      data[key] = { practiced: true, duration: 60, type: b.class_type || 'hatha' };
    });
    setPracticeData(data);
  }, [bookings]);

  const nextBooking = bookings.length > 0 ? bookings[0] : null;

  const handleLogout = () => {
    logout();
    onBack();
    showToast('Р’С‹ РІС‹С€Р»Рё РёР· СЃРёСЃС‚РµРјС‹', 'info');
  };

  // handleSubscribePlan hidden вЂ” re-enable after launch
  // const handleSubscribePlan = async (plan: SubscriptionPlan) => { ... };

  // handleCancelSubscription hidden вЂ” re-enable after launch
  // const handleCancelSubscription = async () => { ... };

  const handleCancelBooking = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Р’С‹ СѓРІРµСЂРµРЅС‹, С‡С‚Рѕ С…РѕС‚РёС‚Рµ РѕС‚РјРµРЅРёС‚СЊ Р·Р°РїРёСЃСЊ?'))
      return;

    const result = await dataService.cancelBooking(id);
    if (result.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      showToast(
        result.source === 'cache'
          ? 'Р›РѕРєР°Р»СЊРЅР°СЏ Р·Р°РїРёСЃСЊ РѕС‚РјРµРЅРµРЅР°. РЎРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ СЃ СЃРµСЂРІРµСЂРѕРј РЅРµ РїРѕС‚СЂРµР±РѕРІР°Р»Р°СЃСЊ.'
          : 'Р вЂ”Р В°Р С—Р С‘РЎРѓРЎРЉ Р С•РЎвЂљР СР ВµР Р…Р ВµР Р…Р В°',
        result.source === 'cache' ? 'info' : 'success'
      );
      return;
      /*
      showToast('Р—Р°РїРёСЃСЊ РѕС‚РјРµРЅРµРЅР°', 'success');
      */
    } else {
      if (result.status === 'auth_required') {
        showToast(
          'Р§С‚РѕР±С‹ РѕС‚РјРµРЅРёС‚СЊ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅРЅСѓСЋ Р·Р°РїРёСЃСЊ, РЅСѓР¶РЅРѕ СЃРЅРѕРІР° РІРѕР№С‚Рё РІ Р°РєРєР°СѓРЅС‚.',
          'error'
        );
        return;
      }
      showToast(
        'РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РјРµРЅРёС‚СЊ Р·Р°РїРёСЃСЊ. РЎРµСЂРІРµСЂ РІСЂРµРјРµРЅРЅРѕ РЅРµРґРѕСЃС‚СѓРїРµРЅ.',
        'error'
      );
      return;
      /*
      showToast('РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РјРµРЅРёС‚СЊ Р·Р°РїРёСЃСЊ', 'error');
      */
    }
  };

  const handleStartEditProfile = () => {
    setEditName(user?.name || '');
    setEditCity(user?.city || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const updatedUser = { ...user, name: editName, city: editCity };
    const result = await dataService.updateUserProfile(updatedUser);
    if (result.ok) {
      setUser(updatedUser);
      setIsEditingProfile(false);
      showToast(
        result.status === 'degraded'
          ? getProfileSavedMessage(result.reason)
          : 'Р СџРЎР‚Р С•РЎвЂћР С‘Р В»РЎРЉ Р С•Р В±Р Р…Р С•Р Р†Р В»Р ВµР Р…',
        result.status === 'degraded' ? 'info' : 'success'
      );
      return;
    } else {
      showToast('РћС€РёР±РєР° РїСЂРё РѕР±РЅРѕРІР»РµРЅРёРё РїСЂРѕС„РёР»СЏ', 'error');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Р¤Р°Р№Р» СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РѕР№ (РјР°РєСЃ 5MB)', 'error');
      return;
    }

    setIsAvatarUploading(true);
    try {
      const fileName = `${user.phone}-${Date.now()}`;
      const publicUrl = await uploadFile(file, 'avatars', fileName);

      if (publicUrl) {
        const updatedUser = { ...user, avatar: publicUrl };
        const result = await dataService.updateUserProfile(updatedUser);
        if (result.ok) {
          setUser(updatedUser);
          showToast(
            result.status === 'degraded'
              ? getAvatarSavedMessage(result.reason)
              : 'Р В¤Р С•РЎвЂљР С• Р С•Р В±Р Р…Р С•Р Р†Р В»Р ВµР Р…Р С•',
            result.status === 'degraded' ? 'info' : 'success'
          );
          return;
        } else {
          showToast('РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ СЃСЃС‹Р»РєСѓ', 'error');
        }
      } else {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const updatedUser = { ...user, avatar: base64 };
          const result = await dataService.updateUserProfile(updatedUser);
          if (result.ok) {
            setUser(updatedUser);
            showToast(
              result.status === 'degraded'
                ? getAvatarSavedMessage(result.reason)
                : 'Р В¤Р С•РЎвЂљР С• Р С•Р В±Р Р…Р С•Р Р†Р В»Р ВµР Р…Р С•',
              result.status === 'degraded' ? 'info' : 'success'
            );
            return;
          }
          showToast(
            'Р СњР Вµ РЎС“Р Т‘Р В°Р В»Р С•РЎРѓРЎРЉ РЎРѓР С•РЎвЂ¦РЎР‚Р В°Р Р…Р С‘РЎвЂљРЎРЉ РЎвЂћР С•РЎвЂљР С•',
            'error'
          );
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      showToast('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё', 'error');
    } finally {
      setIsAvatarUploading(false);
    }
  };

  type DashboardTab = 'overview' | 'schedule' | 'videos' | 'breath' | 'profile' | 'dev';
  const navItems: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Р“Р»Р°РІРЅР°СЏ', icon: <LayoutDashboard className="w-6 h-6" /> },
    { id: 'schedule', label: 'Р Р°СЃРїРёСЃР°РЅРёРµ', icon: <Calendar className="w-6 h-6" /> },
    { id: 'videos', label: 'РџСЂР°РєС‚РёРєРё', icon: <Video className="w-6 h-6" /> },
    { id: 'breath', label: 'Р”С‹С…Р°РЅРёРµ', icon: <Wind className="w-6 h-6" /> },
    // { id: 'ai', label: 'AI РўСЂРµРЅРµСЂ', icon: <Sparkles className="w-6 h-6" /> }, // hidden вЂ” re-enable after launch
    { id: 'profile', label: 'РџСЂРѕС„РёР»СЊ', icon: <User className="w-6 h-6" /> },
  ];

  const userName = user?.name || 'Р“РѕСЃС‚СЊ';
  const userCity = user?.city || 'РњРѕСЃРєРІР°';

  if (activeTab === 'dev') {
    return <DeveloperSettings onBack={() => setActiveTab('profile')} />;
  }

  return (
    <div className="h-[100dvh] bg-[#FDFBF7] flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-stone-100 hidden md:flex flex-col p-8 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="mb-12 pl-2">
          <Logo className="w-16 h-16" color="#57a773" />
        </div>

        <nav className="space-y-3 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-sm font-semibold tracking-wide ${
                activeTab === item.id
                  ? 'bg-brand-green text-white shadow-xl shadow-brand-green/20 scale-105'
                  : 'text-stone-400 hover:bg-stone-50 hover:text-brand-text'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex items-center gap-3 text-stone-400 hover:text-rose-500 transition-colors px-6 py-4 text-sm font-medium rounded-2xl hover:bg-rose-50"
        >
          <LogOut className="w-5 h-5" />
          Р’С‹Р№С‚Рё
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-stone-100 z-20 sticky top-0">
          <Logo className="w-10 h-10" color="#57a773" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center font-serif text-sm overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0)
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-6 md:p-12 pb-28 md:pb-12 bg-[#F8F9FA]">
          {/* --- Overview Tab --- */}
          {activeTab === 'overview' && (
            <div className="max-w-4xl mx-auto">
              <header className="flex justify-between items-end mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-2xl md:text-4xl font-serif text-brand-text mb-2">
                    РџСЂРёРІРµС‚, {userName}!
                  </h1>
                  <p className="text-stone-400 font-light text-sm md:text-base">
                    Рады видеть тебя снова.
                  </p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                {/* Stats Card */}
                <div
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col justify-between h-40 md:h-48 relative overflow-hidden group animate-in zoom-in-95 duration-500 fill-mode-backwards"
                  style={{ animationDelay: '100ms' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                  <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-brand-green mb-4">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-4xl font-serif text-brand-text mb-1">{bookings.length}</p>
                    <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">
                      Р’СЃРµРіРѕ Р·Р°РїРёСЃРµР№
                    </p>
                  </div>
                </div>

                {/* Status Card */}
                <div
                  className="bg-brand-dark p-6 rounded-[2rem] shadow-xl shadow-stone-200 flex flex-col justify-between h-40 md:h-48 text-white relative overflow-hidden animate-in zoom-in-95 duration-500 fill-mode-backwards"
                  style={{ animationDelay: '200ms' }}
                >
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green to-transparent"></div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-brand-yellow mb-4 backdrop-blur-sm">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif mb-1">
                      {subscription && subscription.plan !== 'free'
                        ? 'РџСЂРµРјРёСѓРј'
                        : 'РџСЂР°РєС‚РёРє'}
                    </p>
                    <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
                      Р’Р°С€ СЃС‚Р°С‚СѓСЃ
                    </p>
                  </div>
                </div>

                {/* Next Class Card */}
                <div
                  className="bg-brand-green p-6 rounded-[2rem] shadow-xl shadow-brand-green/20 flex flex-col justify-between h-40 md:h-48 text-white relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform animate-in zoom-in-95 duration-500 fill-mode-backwards"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="absolute -right-6 -top-6 w-24 h-24 border-[6px] border-white/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    {nextBooking ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Р‘Р»РёР¶Р°Р№С€РµРµ
                          </span>
                          <span className="flex w-2 h-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                        </div>
                        <p className="text-xl font-serif mb-1 truncate">{nextBooking.className}</p>
                        <p className="text-white/70 text-sm">
                          {nextBooking.time} вЂў {nextBooking.date}
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                          РќРµС‚ Р·Р°РїРёСЃРµР№
                        </span>
                        <p className="text-xl font-serif mb-1">Р—Р°РїРёСЃР°С‚СЊСЃСЏ?</p>
                        <p className="text-white/70 text-sm">Р’С‹Р±РµСЂРё РїСЂР°РєС‚РёРєСѓ</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mt-auto">
                    РџРµСЂРµР№С‚Рё <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Daily Recommendation */}
              {authStatus === 'authenticated' && (
                <div
                  className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600"
                  style={{ animationDelay: '350ms' }}
                >
                  <DailyRecommendation
                    recommendation={dailyRec}
                    isLoading={dailyRecLoading}
                    onStart={(_id) => {
                      setActiveTab('videos');
                      showToast(`РћС‚РєСЂС‹РІР°РµРј РїСЂР°РєС‚РёРєСѓвЂ¦`, 'success');
                    }}
                    onRefresh={() => {
                      localStorage.removeItem(`ksebe_daily_rec_${new Date().toDateString()}`);
                      setDailyRec(null);
                      setDailyRecLoading(true);
                      // retrigger effect by toggling a transient key
                      setTimeout(() => setDailyRecLoading(false), 800);
                    }}
                  />
                </div>
              )}

              {/* Booking History / Tickets */}
              <div
                className="mb-24 md:mb-0 animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: '400ms' }}
              >
                <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-brand-green" />
                  РњРѕРё Р±РёР»РµС‚С‹
                </h3>

                {loading ? (
                  <div className="flex justify-center py-10 bg-white rounded-[2rem] border border-stone-100">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="grid gap-4">
                    {bookings.map((b) => {
                      const isFuture =
                        new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0));

                      return (
                        <div
                          key={b.id}
                          className={`relative bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden flex flex-col md:flex-row ${isFuture ? 'border-brand-green/30 shadow-md hover:shadow-lg' : 'border-stone-100 opacity-80 grayscale hover:grayscale-0'}`}
                        >
                          {/* Left: Content */}
                          <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${isFuture ? 'bg-brand-mint text-brand-green' : 'bg-stone-100 text-stone-400'}`}
                                >
                                  {isFuture ? 'РђРєС‚РёРІРµРЅ' : 'Р—Р°РІРµСЂС€РµРЅ'}
                                </span>
                                <h4 className="text-2xl font-serif text-brand-text">
                                  {b.className}
                                </h4>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-medium text-brand-text">{b.time}</div>
                                <div className="text-xs text-stone-400">{b.date}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-dashed border-stone-200 pt-4 mt-2">
                              <div className="flex items-center gap-2 text-sm text-stone-500">
                                <div className="p-1.5 bg-stone-50 rounded-full">
                                  <LayoutDashboard className="w-4 h-4" />
                                </div>
                                {b.location}
                              </div>
                              {isFuture && (
                                <button
                                  onClick={(e) => handleCancelBooking(b.id, e)}
                                  aria-label={`Cancel booking ${b.className}`}
                                  className="text-xs text-rose-400 hover:text-rose-600 font-medium transition-colors"
                                >
                                  РћС‚РјРµРЅРёС‚СЊ
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Right: QR Stub */}
                          <div className="relative w-full md:w-32 bg-stone-50 flex items-center justify-center p-4 border-t md:border-t-0 md:border-l border-dashed border-stone-300">
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8F9FA] rounded-full hidden md:block"></div>
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F8F9FA] rounded-full hidden md:block"></div>

                            <div
                              role="button"
                              tabIndex={0}
                              aria-label="РџРѕРєР°Р·Р°С‚СЊ QR-РєРѕРґ"
                              className="opacity-20 hover:opacity-100 transition-opacity flex flex-col items-center gap-1 cursor-pointer"
                              onClick={() => setExpandedQr(b.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setExpandedQr(b.id);
                                }
                              }}
                            >
                              <QrCode className="w-16 h-16" />
                              <span className="text-[9px] font-mono tracking-widest">SCAN</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-[2rem] border border-dashed border-stone-200">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
                      <Ticket className="w-8 h-8" />
                    </div>
                    <p className="text-stone-400 text-sm">
                      РЈ РІР°СЃ РїРѕРєР° РЅРµС‚ Р±РёР»РµС‚РѕРІ РЅР° РїСЂР°РєС‚РёРєСѓ.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
              <Schedule />
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
              <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-serif text-brand-text mb-1">
                  Р’РёРґРµРѕС‚РµРєР°
                </h1>
                <p className="text-stone-400 font-light text-sm">
                  РўРІРѕСЏ СЃС‚СѓРґРёСЏ РІСЃРµРіРґР° СЃ С‚РѕР±РѕР№.
                </p>
              </header>
              <VideoLibrary />
            </div>
          )}

          {activeTab === 'breath' && (
            <div className="max-w-lg mx-auto h-[70vh] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
              <header className="mb-6 text-center">
                <h1 className="text-2xl md:text-3xl font-serif text-brand-text mb-1">
                  Р”С‹С…Р°РЅРёРµ
                </h1>
                <p className="text-stone-400 font-light text-sm">
                  РЈСЃРїРѕРєРѕР№ СѓРј Р·Р° 4 РјРёРЅСѓС‚С‹.
                </p>
              </header>
              <div className="flex-1 bg-white rounded-[3rem] shadow-xl shadow-stone-100 border border-stone-50 p-6 flex flex-col justify-center relative overflow-hidden">
                <Breathwork />
              </div>
            </div>
          )}

          {/* AI РўСЂРµРЅРµСЂ tab hidden вЂ” re-enable after launch */}
          {/* {activeTab === 'ai' && (
            <div className="max-w-2xl mx-auto h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24">
              <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-serif text-brand-text mb-1">AI РўСЂРµРЅРµСЂ</h1>
                <p className="text-stone-400 font-light text-sm">РђРЅР°Р»РёР· Р°СЃР°РЅ, С‡Р°С‚ Рё С‚РІРѕСЂС‡РµСЃС‚РІРѕ.</p>
              </header>
              <AICoach />
            </div>
          )} */}

          {activeTab === 'profile' && (
            <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24">
              {/* AI Subscription hidden вЂ” re-enable after launch */}
              {/* <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 mb-6"> ... AI Subscription block ... </div> */}

              <Achievements />

              {/* Streak Calendar */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 mb-6">
                <StreakCalendar
                  practiceData={practiceData}
                  currentStreak={gamificationLoading ? 0 : currentStreak}
                />
              </div>

              <div className="flex flex-col items-center mb-8 relative">
                <div
                  role={isEditingProfile ? 'button' : undefined}
                  tabIndex={isEditingProfile ? 0 : -1}
                  aria-label={
                    isEditingProfile
                      ? 'Р—Р°РіСЂСѓР·РёС‚СЊ РЅРѕРІРѕРµ С„РѕС‚Рѕ РїСЂРѕС„РёР»СЏ'
                      : undefined
                  }
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 relative group ${isEditingProfile ? 'cursor-pointer hover:border-brand-green/50' : ''}`}
                  onClick={() => isEditingProfile && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (isEditingProfile && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {isAvatarUploading ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  ) : null}

                  {/* Overlay for upload hint */}
                  {isEditingProfile && !isAvatarUploading && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}

                  <Image
                    src={user?.avatar || IMAGES.reviews.avatars[0]}
                    alt="User"
                    storageKey="user-avatar-large"
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                    controlsClassName="hidden"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {!isEditingProfile ? (
                  <>
                    <h2 className="text-2xl font-serif text-brand-text">{userName}</h2>
                    <p className="text-stone-400">{userCity}</p>
                    <button
                      onClick={handleStartEditProfile}
                      aria-label="Edit profile"
                      className="absolute top-0 right-0 p-2 text-stone-400 hover:text-brand-green"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full space-y-2 mt-2">
                    <p className="text-xs text-stone-400 text-center mb-2">
                      РќР°Р¶РјРёС‚Рµ РЅР° С„РѕС‚Рѕ, С‡С‚РѕР±С‹ РёР·РјРµРЅРёС‚СЊ
                    </p>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 text-center border border-stone-200 rounded-lg text-lg font-serif focus:outline-none focus:border-brand-green"
                      placeholder="РРјСЏ"
                    />
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full p-2 text-center border border-stone-200 rounded-lg text-sm text-stone-500 focus:outline-none focus:border-brand-green"
                      placeholder="Р“РѕСЂРѕРґ"
                    />
                    <div className="flex justify-center gap-2 mt-2">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        aria-label="Cancel profile edit"
                        className="p-2 text-stone-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        aria-label="Save profile changes"
                        className="p-2 text-brand-green"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-stone-100 divide-y divide-stone-50">
                <div className="w-full flex items-center justify-between p-5 rounded-xl">
                  <span className="text-brand-text font-medium">РўРµР»РµС„РѕРЅ</span>
                  <span className="text-stone-400 text-sm">
                    {user?.phone || 'РќРµ СѓРєР°Р·Р°РЅ'}
                  </span>
                </div>

                <button
                  onClick={() => setActiveTab('dev')}
                  className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors rounded-xl group"
                >
                  <span className="text-brand-text font-medium flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-stone-400" />
                    РќР°СЃС‚СЂРѕР№РєРё СЂР°Р·СЂР°Р±РѕС‚С‡РёРєР°
                  </span>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-brand-green" />
                </button>

                <button className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors rounded-xl group">
                  <span className="text-brand-text font-medium">РџРѕРґРґРµСЂР¶РєР°</span>
                  <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-brand-green" />
                </button>
              </div>

              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="w-full mt-6 py-4 text-rose-500 font-medium text-sm bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors"
              >
                Р’С‹Р№С‚Рё РёР· Р°РєРєР°СѓРЅС‚Р°
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Paywall hidden вЂ” re-enable after launch */}
      {/* {showPaywall && (
        <Paywall
          onClose={() => setShowPaywall(false)}
          onSubscribe={(plan) => handleSubscribePlan(plan as SubscriptionPlan)}
        />
      )} */}

      {/* QR Modal */}
      {expandedQr && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR-РєРѕРґ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ"
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 animate-in fade-in"
          onClick={() => setExpandedQr(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setExpandedQr(null);
            }
          }}
        >
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-sm aspect-square flex items-center justify-center relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-green/20 animate-scan"></div>
            <QrCode className="w-full h-full text-brand-dark" />
          </div>
          <p className="text-white/50 mt-8 text-center">
            РџРѕРєР°Р¶РёС‚Рµ QR-РєРѕРґ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂСѓ
          </p>
          <button
            onClick={() => setExpandedQr(null)}
            className="mt-8 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-200/50 pb-safe z-50 flex justify-around items-center px-1 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] safe-area-bottom">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[60px] relative ${isActive ? 'text-brand-green' : 'text-stone-400'}`}
            >
              <div
                className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[9px] font-bold tracking-wide transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 absolute -bottom-2'}`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-3 w-8 h-1 bg-brand-green rounded-b-lg shadow-[0_2px_8px_rgba(87,167,115,0.4)]"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
