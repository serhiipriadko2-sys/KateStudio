import { useScrollLock } from '@ksebe/shared';
import { FileText, Shield, X } from 'lucide-react';
import React from 'react';

interface LegalModalProps {
  type: 'privacy' | 'offer' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  useScrollLock(!!type);

  if (!type) return null;

  const content =
    type === 'privacy'
      ? {
          title: 'Политика конфиденциальности',
          icon: <Shield className="w-6 h-6 text-brand-green" />,
          text: (
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              <p>
                <strong>1. Общие положения</strong>
                <br />
                Настоящая политика обработки персональных данных составлена в соответствии с
                требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и
                определяет порядок обработки персональных данных и меры по обеспечению безопасности
                персональных данных, предпринимаемые Студией йоги «К себе».
              </p>
              <p>
                <strong>2. Сбор данных</strong>
                <br />
                Мы собираем следующие данные: Имя, Номер телефона, данные cookie-файлов. Сбор
                происходит через формы обратной связи на сайте/в приложении.
              </p>
              <p>
                <strong>3. Цели обработки</strong>
                <br />
                Цель обработки персональных данных Пользователя — информирование; запись на занятия;
                уточнение деталей.
              </p>
              <p>
                <strong>4. Безопасность</strong>
                <br />
                Мы принимаем необходимые организационные и технические меры для защиты персональных
                данных Пользователя от неправомерного или случайного доступа.
              </p>
            </div>
          ),
        }
      : {
          title: 'Договор оферты',
          icon: <FileText className="w-6 h-6 text-brand-green" />,
          text: (
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              <p>
                <strong>1. Предмет договора</strong>
                <br />
                Исполнитель обязуется оказать Заказчику услуги по проведению занятий йогой, а
                Заказчик обязуется оплатить эти услуги.
              </p>
              <p>
                <strong>2. Порядок расчетов</strong>
                <br />
                Оплата услуг производится в соответствии с тарифами, указанными в разделе
                «Стоимость».
              </p>
              <p>
                <strong>3. Техника безопасности</strong>
                <br />
                Заказчик подтверждает, что не имеет медицинских противопоказаний для занятий.
                Исполнитель не несет ответственности за вред, связанный с ухудшением здоровья, если
                состояние здоровья ухудшилось в результате острого заболевания или обострения
                травмы.
              </p>
              <p>
                <strong>4. Отмена и возврат</strong>
                <br />
                При отмене записи менее чем за 24 часа, занятие считается проведенным и оплата не
                возвращается.
              </p>
            </div>
          ),
        };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[2rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-mint/30 rounded-full">{content.icon}</div>
            <h3 id="legal-modal-title" className="text-xl font-serif text-brand-text">
              {content.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-stone-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">{content.text}</div>

        <div className="p-6 border-t border-stone-100 bg-stone-50 rounded-b-[2rem] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-green text-white rounded-xl text-sm font-medium hover:bg-brand-green/90 transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
