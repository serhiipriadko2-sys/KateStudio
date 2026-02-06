# LAUNCH CHECKLIST — KateStudio (K себе)

Единый источник правды по готовности запуска. Все пункты ниже обновляются по
факту изменений в коде и базе.

## P0 — Безопасность и доступы

- [ ] Edge Functions: обязательные секреты и CORS whitelist.
- [ ] Удалены все клиентские fallback‑ключи.
- [ ] RLS для критичных таблиц (subscriptions/bookings/contacts).
- [ ] Контактная форма защищена reCAPTCHA v3 и rate‑limit (Edge KV).

## P0 — Схема Supabase (разрыв «код → база»)

В коде используются таблицы, которых нет в миграциях. Нужно создать миграции и
RLS‑политики.

| Таблица    | Где используется                                                                                       | Примечание                 |
| ---------- | ------------------------------------------------------------------------------------------------------ | -------------------------- |
| `contacts` | `k-sebe-yoga-studioWEB/components/Contact.tsx`                                                         | Публичная форма контактов. |
| `classes`  | `k-sebe-yoga-studioWEB/components/Schedule.tsx`                                                        | Расписание на веб‑сайте.   |
| `bookings` | `k-sebe-yoga-studioWEB/components/BookingModal.tsx`, `k-sebe-yoga-studio-APPp/services/dataService.ts` | Записи на занятия.         |
| `profiles` | `k-sebe-yoga-studio-APPp/services/dataService.ts`                                                      | Профили пользователей PWA. |

## P1 — Продукт без AI

- [ ] Ассистент на web: только rule‑based KB, без внешних AI вызовов.
- [ ] Расписание: fallback на локальные данные, если Supabase не настроен.
- [ ] Запись: гостевой поток (без обязательного Auth).
- [ ] Sentry подключён (web + app) и настроены алерты в GitHub Actions.

## P1 — Контент

- [ ] Заменить стоковые изображения в APP на реальные.
- [ ] Проверить alt‑теги на новых изображениях.

## P1 — Деплой

- [ ] Прокинуть env в Firebase deploy (APP).
- [ ] Проверить деплой Web (Pages + CNAME).
