import {
  X,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Edit3,
  Check,
  LogOut,
  Clock,
  AlertCircle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth, WebUserProfile } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { supabase } from '../services/supabase';

interface UserCabinetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BookingItem {
  id: string;
  class_type: string | null;
  class_name: string | null;
  class_date: string | null;
  class_time: string | null;
  location: string | null;
  status: string | null;
  created_at: string;
  price: string | null;
}

type CabinetTab = 'profile' | 'bookings';

export const UserCabinet: React.FC<UserCabinetProps> = ({ isOpen, onClose }) => {
  const { user, signOut, updateProfile, authError } = useAuth();
  const [activeTab, setActiveTab] = useState<CabinetTab>('profile');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', city: '' });
  const [saving, setSaving] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useScrollLock(isOpen);
  useFocusTrap(dialogRef, isOpen, closeButtonRef);

  // Load bookings when tab switches
  useEffect(() => {
    if (!isOpen || activeTab !== 'bookings' || !user || !supabase) return;

    const sb = supabase; // capture non-null reference
    let isMounted = true;
    const loadBookings = async () => {
      setBookingsLoading(true);
      try {
        const { data, error } = await sb
          .from('bookings')
          .select(
            'id, class_type, class_name, class_date, class_time, location, status, created_at, price'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        if (isMounted && data) setBookings(data);
      } catch {
        // Silent fail
      } finally {
        if (isMounted) setBookingsLoading(false);
      }
    };

    loadBookings();
    return () => {
      isMounted = false;
    };
  }, [isOpen, activeTab, user]);

  // Populate edit form
  useEffect(() => {
    if (user && isEditing) {
      setEditData({
        name: user.name ?? '',
        phone: user.phone ?? '',
        city: user.city ?? '',
      });
    }
  }, [user, isEditing]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: editData.name.trim() || undefined,
        phone: editData.phone.trim() || undefined,
        city: editData.city.trim() || undefined,
      });
      setIsEditing(false);
    } catch {
      // Error shown via authError
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return { text: 'Подтверждено', cls: 'bg-brand-mint/30 text-brand-green' };
      case 'pending':
        return { text: 'Ожидает', cls: 'bg-amber-100 text-amber-700' };
      case 'cancelled':
        return { text: 'Отменено', cls: 'bg-stone-100 text-stone-500' };
      case 'completed':
        return { text: 'Завершено', cls: 'bg-stone-100 text-stone-500' };
      default:
        return { text: 'Новая', cls: 'bg-blue-50 text-blue-600' };
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cabinet-title"
        tabIndex={-1}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]"
      >
        {/* Close */}
        <button
          onClick={onClose}
          ref={closeButtonRef}
          aria-label="Закрыть"
          className="absolute top-6 right-6 p-2 rounded-full bg-stone-50 hover:bg-stone-100 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-brand-mint/30 rounded-2xl flex items-center justify-center shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Аватар пользователя"
                  className="w-16 h-16 rounded-2xl object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-brand-green" />
              )}
            </div>
            <div className="min-w-0">
              <h3 id="cabinet-title" className="text-2xl font-serif text-brand-text truncate">
                {user.name || 'Пользователь'}
              </h3>
              <p className="text-stone-400 text-sm truncate">{user.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <TabButton
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
              icon={<User className="w-4 h-4" />}
              label="Профиль"
            />
            <TabButton
              active={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
              icon={<Calendar className="w-4 h-4" />}
              label="Записи"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              isEditing={isEditing}
              editData={editData}
              saving={saving}
              authError={authError}
              onEditChange={setEditData}
              onStartEdit={() => setIsEditing(true)}
              onCancelEdit={() => setIsEditing(false)}
              onSave={handleSaveProfile}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingsTab
              bookings={bookings}
              loading={bookingsLoading}
              formatDate={formatDate}
              getStatusLabel={getStatusLabel}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Sub-components ────────────────────────────── */

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
      ${
        active
          ? 'bg-brand-green text-white shadow-sm'
          : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
      }`}
  >
    {icon}
    {label}
  </button>
);

const ProfileTab: React.FC<{
  user: WebUserProfile;
  isEditing: boolean;
  editData: { name: string; phone: string; city: string };
  saving: boolean;
  authError: string | null;
  onEditChange: (data: { name: string; phone: string; city: string }) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onLogout: () => void;
}> = ({
  user,
  isEditing,
  editData,
  saving,
  authError,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onLogout,
}) => (
  <div className="space-y-4 pt-4">
    {isEditing ? (
      <>
        <EditField
          icon={<User className="w-4 h-4 text-stone-400" />}
          value={editData.name}
          onChange={(v) => onEditChange({ ...editData, name: v })}
          placeholder="Имя"
        />
        <EditField
          icon={<Phone className="w-4 h-4 text-stone-400" />}
          value={editData.phone}
          onChange={(v) => onEditChange({ ...editData, phone: v })}
          placeholder="Телефон"
          type="tel"
        />
        <EditField
          icon={<MapPin className="w-4 h-4 text-stone-400" />}
          value={editData.city}
          onChange={(v) => onEditChange({ ...editData, city: v })}
          placeholder="Город"
        />

        {authError && (
          <div className="text-sm text-rose-500 flex items-center gap-2 bg-rose-50 px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {authError}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-brand-green text-white font-medium hover:bg-brand-green/90 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Сохранить
          </button>
          <button
            onClick={onCancelEdit}
            className="flex-1 py-3 rounded-xl bg-stone-50 text-stone-600 font-medium hover:bg-stone-100 transition-colors"
          >
            Отмена
          </button>
        </div>
      </>
    ) : (
      <>
        <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
        <InfoRow icon={<User className="w-4 h-4" />} label="Имя" value={user.name || '—'} />
        <InfoRow icon={<Phone className="w-4 h-4" />} label="Телефон" value={user.phone || '—'} />
        <InfoRow icon={<MapPin className="w-4 h-4" />} label="Город" value={user.city || '—'} />
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Дата регистрации"
          value={
            user.createdAt
              ? new Date(user.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'
          }
        />

        <div className="flex gap-3 pt-4">
          <button
            onClick={onStartEdit}
            className="flex-1 py-3 rounded-xl bg-stone-50 text-stone-600 font-medium hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Редактировать
          </button>
          <button
            onClick={onLogout}
            className="py-3 px-5 rounded-xl bg-rose-50 text-rose-500 font-medium hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </>
    )}
  </div>
);

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 py-3 border-b border-stone-50">
    <div className="text-brand-green">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="text-sm text-brand-text truncate">{value}</p>
    </div>
  </div>
);

const EditField: React.FC<{
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}> = ({ icon, value, onChange, placeholder, type = 'text' }) => (
  <div className="relative">
    <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-stone-50 border border-stone-100 text-brand-text pl-12 pr-5 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400 text-sm"
    />
  </div>
);

const BookingsTab: React.FC<{
  bookings: BookingItem[];
  loading: boolean;
  formatDate: (d: string) => string;
  getStatusLabel: (s: string | null) => { text: string; cls: string };
}> = ({ bookings, loading, formatDate, getStatusLabel }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-brand-green animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-12 h-12 text-stone-200 mx-auto mb-4" />
        <p className="text-stone-400 text-sm">У вас пока нет записей</p>
        <p className="text-stone-300 text-xs mt-1">Запишитесь на занятие через расписание</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-4">
      {bookings.map((booking) => {
        const status = getStatusLabel(booking.status);
        return (
          <div key={booking.id} className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-brand-text text-sm truncate">
                  {booking.class_name || booking.class_type || 'Занятие'}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-400">
                  {(booking.class_date || booking.created_at) && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.class_date
                        ? `${formatDate(booking.class_date)}${booking.class_time ? `, ${booking.class_time}` : ''}`
                        : formatDate(booking.created_at)}
                    </span>
                  )}
                </div>
                {booking.location && (
                  <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {booking.location}
                  </p>
                )}
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${status.cls}`}
              >
                {status.text}
              </span>
            </div>
            {booking.price && (
              <p className="text-xs text-brand-green font-medium mt-2">{booking.price}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
