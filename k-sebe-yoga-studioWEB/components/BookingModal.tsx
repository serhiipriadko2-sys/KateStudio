
import React, { useState } from 'react';
import { X, Check, CalendarPlus, ArrowRight, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useScrollLock } from '../hooks/useScrollLock';
import { BookingDetails } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: BookingDetails;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, details }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{name?: boolean; phone?: boolean; privacy?: boolean}>({});

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const isSpecificClass = !!(details.date && details.time);

  const validate = () => {
    const newErrors: any = {};
    if (!name.trim()) newErrors.name = true;
    if (phone.length < 10) newErrors.phone = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');

    try {
        if (supabase) {
            const { error } = await supabase
                .from('bookings')
                .insert([
                    {
                        name: name,
                        phone: phone,
                        class_type: details.type,
                        class_date: details.date || null,
                        class_time: details.time || null,
                        location: details.location || null,
                        is_purchase: !isSpecificClass,
                        price: details.price || null,
                        created_at: new Date().toISOString()
                    }
                ]);
            if (error) throw error;
        } else {
             await new Promise(resolve => setTimeout(resolve, 1500));
        }
        setStatus('success');
    } catch (error) {
        console.error("Booking failed:", error);
        setStatus('error');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 15) val = val.slice(0, 15);
    setPhone(val);
    if (errors.phone) setErrors(prev => ({...prev, phone: false}));
  };

  const resetForm = () => {
      setStatus('idle');
      setName('');
      setPhone('');
      setErrors({});
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <button 
          onClick={resetForm}
          className="absolute top-6 right-6 p-2 rounded-full bg-stone-50 hover:bg-stone-100 transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        {status === 'success' ? (
          <div className="p-12 flex flex-col items-center text-center space-y-6 animate-in slide-in-from-right duration-500">
            <div className="w-20 h-20 bg-brand-mint rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500 delay-100">
              <Check className="w-10 h-10 text-brand-green" />
            </div>
            <div>
              <h3 className="text-3xl font-serif text-brand-text mb-2">
                  {isSpecificClass ? "Вы записаны!" : "Заявка принята!"}
              </h3>
              <p className="text-stone-500 leading-relaxed">
                {isSpecificClass 
                    ? "Ждем вас на практике. Пожалуйста, приходите за 15 минут." 
                    : "Мы свяжемся с вами в ближайшее время для подтверждения и оплаты."}
              </p>
            </div>
            
            {isSpecificClass && (
                <a 
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(details.type)}&details=${encodeURIComponent(details.location || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-stone-50 text-stone-600 rounded-xl hover:bg-stone-100 transition-colors font-medium text-sm"
                >
                <CalendarPlus className="w-5 h-5" />
                Добавить в календарь
                </a>
            )}

            <button 
              onClick={resetForm}
              className="text-brand-green hover:text-brand-text font-medium text-sm transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
            <div className="mb-8">
               <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isSpecificClass ? 'bg-brand-mint/50 text-brand-green' : 'bg-brand-accent/30 text-stone-600'}`}>
                   {isSpecificClass ? 'Бронирование' : 'Покупка'}
               </span>
               <h3 className="text-3xl font-serif text-brand-text mt-4 leading-tight">{details.type}</h3>
               
               {isSpecificClass ? (
                   <div className="flex items-center gap-2 text-stone-500 mt-2 text-sm">
                      <span>{details.date}</span>
                      <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                      <span>{details.time}</span>
                   </div>
               ) : (
                   <div className="flex items-center gap-2 text-stone-500 mt-2 text-sm">
                       {details.price && <span className="font-medium text-brand-green text-lg">{details.price}</span>}
                       <span>• Оставьте контакты для связи</span>
                   </div>
               )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({...prev, name: false}));
                  }}
                  placeholder="Ваше имя"
                  disabled={status === 'loading'}
                  className={`w-full bg-stone-50 border ${errors.name ? 'border-rose-400 bg-rose-50' : 'border-stone-100'} text-brand-text px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400`}
                />
              </div>
              
              <div className="space-y-1">
                <input 
                  type="tel" 
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Телефон"
                  disabled={status === 'loading'}
                  className={`w-full bg-stone-50 border ${errors.phone ? 'border-rose-400 bg-rose-50' : 'border-stone-100'} text-brand-text px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-stone-400`}
                />
              </div>

              <div className="flex items-start gap-3 pt-2 group cursor-pointer relative">
                <input type="checkbox" required id="privacy" className="mt-1 w-4 h-4 accent-brand-green cursor-pointer shrink-0" />
                <label htmlFor="privacy" className="text-xs text-stone-400 leading-relaxed cursor-pointer group-hover:text-stone-500 transition-colors select-none">
                  Я соглашаюсь с политикой конфиденциальности
                </label>
              </div>
                
              {status === 'error' && (
                  <div className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Ошибка сервера. Попробуйте позже.
                  </div>
              )}

              <button 
                type="submit"
                disabled={status === 'loading'}
                className={`w-full bg-brand-green text-white font-medium py-4 rounded-2xl mt-4 hover:bg-brand-green/90 transition-all shadow-lg shadow-brand-green/20 flex items-center justify-center gap-2 group active:scale-[0.98]
                    ${status === 'loading' ? 'opacity-70 cursor-wait' : ''}
                `}
              >
                {status === 'loading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <span>{isSpecificClass ? 'Записаться' : 'Оформить'}</span>
                        {isSpecificClass ? <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <CreditCard className="w-4 h-4" />}
                    </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
