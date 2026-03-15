import { supabase } from '@ksebe/shared';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';

interface ResetPasswordModalProps {
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('Минимум 6 символов');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Пароли не совпадают');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setStatus('error');
    } else {
      setStatus('success');
      // Clear the recovery hash from URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-serif text-brand-text mb-2">Новый пароль</h2>
        <p className="text-stone-400 text-sm mb-6">Введите новый пароль для вашего аккаунта.</p>

        {status === 'success' ? (
          <div className="text-center">
            <p className="text-brand-green font-medium mb-4">Пароль успешно изменён!</p>
            <a
              href="/admin"
              className="inline-block bg-brand-green text-white rounded-xl px-6 py-3 text-sm font-medium"
            >
              Войти в AdminPanel
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Новый пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Повторите пароль"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-green"
              required
            />
            {errorMsg && <p className="text-rose-500 text-sm">{errorMsg}</p>}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-brand-green text-white rounded-xl px-6 py-3 text-sm font-medium disabled:opacity-60"
            >
              {status === 'loading' ? 'Сохраняем…' : 'Сохранить пароль'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 text-sm hover:text-stone-600"
            >
              Отмена
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
