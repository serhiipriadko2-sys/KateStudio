import { X, Check, Send, ArrowRight, AlertCircle, Loader2, MessageCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useScrollLock } from '../hooks/useScrollLock';
import { supabase } from '../services/supabase';
import { BookingDetails } from '../types';

const TELEGRAM_URL = 'https://t.me/k_sebe_dubna';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: BookingDetails;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, details }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useScrollLock(isOpen);
  useFocusTrap(dialogRef, isOpen, closeButtonRef);

  if (!isOpen) return null;

  const isPurchase = !!(details.price && !details.date);

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!name.trim()) newErrors.name = true;
    if (phone.replace(/\D/g, '').length < 10) newErrors.phone = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    setErrorMessage(null);

    try {
      if (supabase) {
        const message = [
          `Интерес: ${details.type}`,
          details.date ? `Дата: ${details.date}` : '',
          details.time ? `Время: ${details.time}` : '',
          details.price ? `Стоимость: ${details.price}` : '',
          comment ? `Комментарий: ${comment}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        await supabase.from('contacts').insert([
          {
            name: name.trim(),
            phone: phone.trim(),
            message,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Не удалось отправить заявку. Напишите нам в Telegram — это быстрее!');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: false }));
  };

  const resetForm = () => {
    setStatus('idle');
    setName('');
    setPhone('');
    setComment('');
    setErrors({});
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        tabIndex={-1}
        className="bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col max-h-[92dvh]"
      >
        {/* Close button */}
        <button
          onClick={resetForm}
          ref={closeButtonRef}
          aria-label="Закрыть"
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        {/* Success state */}
        {status === 'success' ? (
          <div className="p-10 flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-brand-mint rounded-full flex items-center justify-center animate-in zoom-in duration-400">
              <Check className="w-8 h-8 text-brand-green" />
            </div>
            <div>
              <h3 className="text-2xl font-serif text-brand-text mb-1">Заявка отправлена!</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Катя свяжется с вами в ближайшее время. Или напишите ей напрямую в Telegram — так
                ещё быстрее.
              </p>
            </div>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#229ED9] text-white rounded-2xl font-medium hover:bg-[#1a8bbf] transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              Написать в Telegram
            </a>

            <button
              onClick={resetForm}
              className="text-stone-400 hover:text-stone-600 text-sm transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto overscroll-contain">
            <div className="p-7 pb-4">
              {/* Service label */}
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                {isPurchase ? 'Приобрести' : 'Записаться'}
              </span>
              <h3
                id="booking-modal-title"
                className="text-2xl font-serif text-brand-text mt-2 leading-snug pr-8"
              >
                {details.type}
              </h3>

              {(details.date || details.time || details.price) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-stone-400">
                  {details.date && <span>{details.date}</span>}
                  {details.time && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-stone-300" />
                      <span>{details.time}</span>
                    </>
                  )}
                  {details.price && (
                    <span className="font-semibold text-brand-green">{details.price}</span>
                  )}
                </div>
              )}
            </div>

            {/* ── PRIMARY: Telegram CTA ───────────────────────────────── */}
            <div className="px-7 pb-2">
              <a
                href={`${TELEGRAM_URL}?text=${encodeURIComponent(`Здравствуйте! Интересует: ${details.type}${details.price ? ` (${details.price})` : ''}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full flex items-center justify-between gap-3 px-5 py-4 bg-[#229ED9] hover:bg-[#1a8bbf] text-white rounded-2xl transition-all shadow-md shadow-[#229ED9]/25 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm leading-tight">Написать Кате в Telegram</p>
                    <p className="text-white/70 text-xs">@k_sebe_dubna · ответит быстро</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform opacity-70" />
              </a>
            </div>

            {/* ── DIVIDER ─────────────────────────────────────────────── */}
            <div className="px-7 py-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-xs text-stone-400 shrink-0">или оставьте заявку</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            {/* ── FORM ────────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} className="px-7 pb-7 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: false }));
                }}
                placeholder="Ваше имя"
                disabled={status === 'loading'}
                className={`w-full bg-stone-50 border ${errors.name ? 'border-rose-300 bg-rose-50' : 'border-stone-100'} text-brand-text px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400 text-sm`}
              />

              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Телефон"
                disabled={status === 'loading'}
                className={`w-full bg-stone-50 border ${errors.phone ? 'border-rose-300 bg-rose-50' : 'border-stone-100'} text-brand-text px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400 text-sm`}
              />

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Вопрос или комментарий (необязательно)"
                rows={2}
                disabled={status === 'loading'}
                className="w-full bg-stone-50 border border-stone-100 text-brand-text px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400 text-sm resize-none"
              />

              {status === 'error' && (
                <div className="text-xs text-rose-500 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-brand-green text-white font-medium py-3.5 rounded-2xl hover:bg-brand-green/90 transition-all shadow-md shadow-brand-green/20 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait text-sm"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4" />
                    <span>Отправить заявку</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-stone-400 leading-relaxed">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <button
                  type="button"
                  className="underline underline-offset-2 hover:text-stone-600 transition-colors"
                >
                  политикой конфиденциальности
                </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
