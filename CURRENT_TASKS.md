# Текущие задачи

Краткая сводка ближайших приоритетов (по **ACTION_PLAN_2026.md** и структуре
репозитория). Фокус на задачах, которые можно брать в работу прямо сейчас.

_Обновлено: 4 января 2026._

## Завершённые задачи

| #   | Задача                                                                      | Где менять                                                                                  | Ожидаемый результат                                       |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | ✅ Создать Edge Function-прокси для Gemini API с rate limiting по `user_id` | `supabase/functions/gemini-proxy/index.ts`                                                  | Безопасный прокси для Gemini, ограничение частоты вызовов |
| 2   | ✅ Добавить вебхуки оплаты: `create-payment` и `payment-webhook`            | `supabase/functions/create-payment/index.ts`, `supabase/functions/payment-webhook/index.ts` | Готовая обработка оплаты и подтверждения статуса          |
| 3   | ✅ Сгенерировать PWA-иконки 72–512px                                        | `k-sebe-yoga-studioWEB/public/icons/`                                                       | Полный набор иконок для manifest/PWA                      |
| 4   | ✅ Добавить `og-image.jpg` для соцсетей                                     | `k-sebe-yoga-studioWEB/public/og-image.jpg`                                                 | Корректный предпросмотр ссылок сайта                      |
| 5   | ✅ Рефакторинг ChatWidget: разбить на подкомпоненты и хук                   | `k-sebe-yoga-studioWEB/components/ChatWidget/`                                              | Компактный (<200 LOC) и поддерживаемый виджет чата        |

## Sprint: Полировка экосистемы (Январь 2026)

| #   | Задача                                 | Где менять                                   | Статус |
| --- | -------------------------------------- | -------------------------------------------- | ------ |
| 6   | ✅ Добавить `.env.example` в APP       | `k-sebe-yoga-studio-APPp/.env.example`       | ✅     |
| 7   | ✅ Добавить `robots.txt` в APP         | `k-sebe-yoga-studio-APPp/public/robots.txt`  | ✅     |
| 8   | ✅ Добавить `sitemap.xml` в APP        | `k-sebe-yoga-studio-APPp/public/sitemap.xml` | ✅     |
| 9   | ✅ Обновить sitemap.xml с датой 2026   | `k-sebe-yoga-studioWEB/public/sitemap.xml`   | ✅     |
| 10  | ✅ Исправить `any` типы в shared/utils | `shared/utils/index.ts`                      | ✅     |
| 11  | ✅ Исправить неиспользуемые переменные | `shared/components/Marquee.tsx`              | ✅     |
| 12  | ✅ Исправить a11y предупреждения       | Blog, BookingModal, Image                    | ✅     |
| 13  | ✅ Экранирование кавычек в JSX         | Blog.tsx, Image.tsx                          | ✅     |

## Следующие задачи (Средний приоритет)

| #   | Задача                                 | Где менять           | Статус |
| --- | -------------------------------------- | -------------------- | ------ |
| 14  | Добавить Sentry для мониторинга ошибок | WEB/APP              | ⏳     |
| 15  | Увеличить тестовое покрытие до 50%     | `__tests__/`         | ⏳     |
| 16  | Добавить AuthModal компонент           | `shared/components/` | ⏳     |
| 17  | Настроить Supabase Auth (Phone OTP)    | Supabase Dashboard   | ⏳     |

> Обновляйте таблицу по мере выполнения: ✅ для сделанных, ⚠️ для в работе, ⏳
> для запланированных.
