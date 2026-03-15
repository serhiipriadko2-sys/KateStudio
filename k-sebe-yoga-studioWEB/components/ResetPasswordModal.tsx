import { supabase } from '@ksebe/shared';
import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ResetPasswordModalProps {
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'ready' | 'loading' | 'success' | 'error'>(
    'waiting'
  );
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Supabase SDK automatically processes the recovery hash on init and establishes
    // the session via onAuthStateChange. We just verify the session is active.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        setErrorMsg('Ссылка устарела. Запросите новую через Supabase Dashboard.');
        setStatus('error');
      } else {
        setStatus('ready');
      }
    });
  }, []);

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
      setStatus('ready');
    } else {
      setStatus('success');
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-4xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-serif text-brand-text mb-2">Новый пароль</h2>
        <p className="text-stone-400 text-sm mb-6">Введите новый пароль для вашего аккаунта.</p>

        {status === 'waiting' && (
          <p className="text-stone-400 text-sm text-center py-4">Проверяем сессию…</p>
        )}

        {status === 'success' && (
          <div className="text-center">
            <p className="text-brand-green font-medium mb-4">Пароль успешно изменён!</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/admin');
              }}
              className="inline-block bg-brand-green text-white rounded-xl px-6 py-3 text-sm font-medium"
            >
              Войти в AdminPanel
            </button>
          </div>
        )}

        {(status === 'ready' || status === 'loading' || status === 'error') && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMsg && <p className="text-rose-500 text-sm">{errorMsg}</p>}
            {status !== 'error' && (
              <>
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
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-brand-green text-white rounded-xl px-6 py-3 text-sm font-medium disabled:opacity-60"
                >
                  {status === 'loading' ? 'Сохраняем…' : 'Сохранить пароль'}
                </button>
              </>
            )}
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
