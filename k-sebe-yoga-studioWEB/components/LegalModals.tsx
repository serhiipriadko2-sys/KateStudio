import { X, Shield, FileText, ReceiptText, Info } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';

export type LegalModalType = 'privacy' | 'offer' | 'requisites' | 'howToGetService';

interface LegalModalProps {
  type: LegalModalType | null;
  onClose: () => void;
}

const TABS: Array<{ id: LegalModalType; label: string }> = [
  { id: 'privacy', label: 'Политика' },
  { id: 'offer', label: 'Оферта' },
  { id: 'requisites', label: 'Реквизиты' },
  { id: 'howToGetService', label: 'Как получить услугу' },
];

export const LegalModals: React.FC<LegalModalProps> = ({ type, onClose }) => {
  useScrollLock(!!type);
  const [activeType, setActiveType] = useState<LegalModalType>('privacy');

  useEffect(() => {
    if (type) {
      setActiveType(type);
    }
  }, [type]);

  const contentMap = useMemo(
    () => ({
      privacy: {
        title: 'Политика конфиденциальности',
        icon: <Shield className="w-6 h-6 text-brand-green" />,
        text: (
          <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
            <p>
              <strong>1. Общие положения</strong>
              <br />
              Настоящая политика обработки персональных данных составлена в соответствии с
              требованиями Федерального закона от 27.07.2006 №152-ФЗ «О персональных данных» и
              определяет порядок обработки персональных данных и меры по обеспечению безопасности
              персональных данных, предпринимаемые Исполнителем.
            </p>
            <p>
              <strong>2. Какие данные мы собираем</strong>
              <br />
              Мы можем собирать имя, номер телефона, адрес электронной почты, а также технические
              данные, передаваемые браузером, включая cookie-файлы, если это необходимо для
              корректной работы сайта и обработки заявок.
            </p>
            <p>
              <strong>3. Цели обработки данных</strong>
              <br />
              Персональные данные используются для обратной связи, обработки заявок, записи на
              занятия, предоставления доступа в приложение, информирования об услугах и исполнения
              обязательств перед клиентом.
            </p>
            <p>
              <strong>4. Защита данных</strong>
              <br />
              Исполнитель принимает необходимые организационные и технические меры для защиты
              персональных данных Пользователя от неправомерного доступа, изменения, раскрытия или
              уничтожения.
            </p>
          </div>
        ),
      },
      offer: {
        title: 'Договор оферты',
        icon: <FileText className="w-6 h-6 text-brand-green" />,
        text: (
          <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
            <p>
              <strong>1. Общие положения</strong>
              <br />
              Индивидуальный предприниматель Габран Екатерина Викторовна, ИНН 501005884694, ОГРНИП
              326508100178360, именуемая в дальнейшем «Исполнитель», настоящим предлагает любому
              дееспособному физическому лицу, именуемому в дальнейшем «Заказчик», заключить договор
              на оказание услуг на условиях настоящей публичной оферты.
            </p>
            <p>
              <strong>2. Предмет договора</strong>
              <br />
              Исполнитель оказывает Заказчику услуги по проведению занятий и иных сопутствующих
              услуг, указанных на сайте и/или в приложении Исполнителя, а Заказчик обязуется
              ознакомиться с условиями оказания услуг и оплатить выбранный тариф.
            </p>
            <p>
              <strong>3. Порядок оформления, записи и оплаты услуг</strong>
              <br />
              Сайт https://ksebe-studio.ru/ используется как публичная витрина услуг, описание
              тарифов и точка первичного контакта с Исполнителем. Прямая оплата на сайте не
              осуществляется. Заказчик оставляет заявку через форму на сайте либо связывается с
              Исполнителем через Telegram. После подтверждения обращения Заказчику предоставляется
              доступ в закрытый контур приложения, где происходят запись на занятия и оплата услуг
              через платежный сервис YooKassa по серверной API-интеграции.
            </p>
            <p>
              <strong>4. Стоимость услуг и расчеты</strong>
              <br />
              Стоимость услуг определяется в соответствии с тарифами, размещенными на сайте и/или в
              приложении Исполнителя. Исполнитель вправе изменять стоимость услуг в одностороннем
              порядке. Новая стоимость применяется к услугам, не оплаченным на момент публикации
              изменений.
            </p>
            <p>
              <strong>5. Условия участия и ответственность</strong>
              <br />
              Заказчик подтверждает, что самостоятельно оценивает состояние своего здоровья и не
              имеет противопоказаний для участия в занятиях либо принимает на себя риск участия при
              наличии ограничений. Исполнитель не несет ответственности за последствия сокрытия
              информации о состоянии здоровья и несоблюдения рекомендаций по участию в занятиях.
            </p>
            <p>
              <strong>6. Отмена записи и возврат</strong>
              <br />
              Если иное не указано отдельно, при отмене записи менее чем за 24 часа до начала
              занятия услуга считается забронированной, а денежные средства не возвращаются.
              Возврат, если он предусмотрен, осуществляется в порядке, установленном действующим
              законодательством Российской Федерации и правилами платежного сервиса.
            </p>
          </div>
        ),
      },
      requisites: {
        title: 'Реквизиты',
        icon: <ReceiptText className="w-6 h-6 text-brand-green" />,
        text: (
          <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
            <p>
              <strong>Исполнитель</strong>
              <br />
              Индивидуальный предприниматель Габран Екатерина Викторовна
            </p>
            <p>
              <strong>ИНН</strong>
              <br />
              501005884694
            </p>
            <p>
              <strong>ОГРНИП</strong>
              <br />
              326508100178360
            </p>
            <p>
              <strong>Контакты</strong>
              <br />
              Email: shamshina-91@mail.ru
              <br />
              Телефон: +7 909 946-89-72
            </p>
            <p>
              <strong>Информация для клиентов</strong>
              <br />
              Сайт ksebe-studio.ru используется как публичная витрина услуг, описание тарифов и
              точка первичного контакта. Прямая оплата на сайте не осуществляется. После обращения
              через форму на сайте или через Telegram клиент получает доступ в приложение, где
              происходят запись на занятия и оплата услуг.
            </p>
          </div>
        ),
      },
      howToGetService: {
        title: 'Как получить услугу',
        icon: <Info className="w-6 h-6 text-brand-green" />,
        text: (
          <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
            <p>
              <strong>1. Выберите подходящую услугу</strong>
              <br />
              Ознакомьтесь с описанием занятий и тарифов на сайте ksebe-studio.ru.
            </p>
            <p>
              <strong>2. Оставьте заявку</strong>
              <br />
              Заполните форму на сайте или свяжитесь с нами через Telegram, чтобы обсудить
              подходящий формат занятий.
            </p>
            <p>
              <strong>3. Получите доступ в приложение</strong>
              <br />
              После подтверждения обращения вам будет предоставлен доступ в закрытый контур
              приложения.
            </p>
            <p>
              <strong>4. Запишитесь и оплатите</strong>
              <br />
              В приложении доступны запись на занятия и оплата услуг. Оплата производится через
              YooKassa по серверной API-интеграции.
            </p>
            <p>
              <strong>Важно</strong>
              <br />
              Публичный сайт является витриной услуг и точкой первичного контакта. Прямая оплата на
              сайте не осуществляется.
            </p>
          </div>
        ),
      },
    }),
    []
  );

  if (!type) return null;

  const content = contentMap[activeType];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
        role="document"
        onKeyDown={(e) => e.stopPropagation()}
        tabIndex={-1}
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

        <div className="px-6 md:px-8 pt-4 border-b border-stone-100">
          <div className="flex flex-wrap gap-2 pb-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  activeType === tab.id
                    ? 'bg-brand-green text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
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

export default LegalModals;
