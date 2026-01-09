# 🎨 Настройка Instagram Feed (Elfsight)

## Регистрация и создание виджета

1. Перейдите на https://elfsight.com/instagram-feed-instashow/
2. Нажмите "Try for Free" (бесплатный план: до 5000 просмотров/мес)
3. Зарегистрируйтесь через email или Google

## Настройка виджета

1. Создайте "Instagram Feed" widget
2. Подключите аккаунт @kate_gabran
3. Рекомендуемые настройки:
   - **Layout**: Grid (сетка 3x3)
   - **Posts to show**: 6-9 постов
   - **Hover effect**: Zoom + overlay
   - **Spacing**: 16px
   - **Border radius**: 12px
   - **Show captions**: On hover

## Получение Widget ID

После создания виджета скопируйте ID из кода:

```html
<div class="elfsight-app-xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"></div>
```

Widget ID это часть после `elfsight-app-`: `xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## Установка

В файле `k-sebe-yoga-studioWEB/components/InstagramFeed.tsx`:

```typescript
const ELFSIGHT_WIDGET_ID = 'xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

Замените `xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` на ваш реальный Widget ID.

## Преимущества Elfsight

✅ **Автообновление постов** - новые посты появляются автоматически  
✅ **Красивые hover эффекты** - zoom, overlay с информацией  
✅ **Lightbox** - открытие постов в модальном окне  
✅ **Полная адаптивность** - отлично работает на мобильных  
✅ **Lazy loading** - загрузка только при прокрутке к виджету  
✅ **Модерация контента** - возможность скрывать ненужные посты  
✅ **Кастомизация** - настройка цветов, шрифтов, размеров

## Технические детали

- **Скрипт**: `https://static.elfsight.com/platform/platform.js`
- **Lazy loading**: Атрибут `data-elfsight-app-lazy`
- **Проверка дублирования**: Скрипт загружается только один раз
- **Fallback**: При отсутствии Widget ID показывается красивая CTA-карточка

## Альтернативные варианты

Если Elfsight не подходит, можно рассмотреть:

- **Curator.io** - похожий функционал, другая ценовая политика
- **EmbedSocial** - больше соцсетей, не только Instagram
- **Flockler** - корпоративное решение
- **SnapWidget** - предыдущее решение (более простое)

## Поддержка

- 📚 [Документация Elfsight](https://elfsight.com/help/)
- 💬 [Поддержка Elfsight](https://elfsight.com/support/)
- 🔧 [Platform.js API](https://static.elfsight.com/platform/platform.js)

## Часто задаваемые вопросы

### Как часто обновляются посты?

Elfsight обновляет ленту каждые 1-2 часа автоматически.

### Можно ли модерировать контент?

Да, в панели управления Elfsight можно скрыть нежелательные посты.

### Что делать если виджет не загружается?

1. Проверьте правильность Widget ID
2. Убедитесь что аккаунт @kate_gabran публичный
3. Проверьте лимиты бесплатного плана (5000 просмотров/мес)
4. Очистите кеш браузера

### Как перейти на платный план?

В панели Elfsight можно в любой момент upgrade до Pro плана за $5-10/мес.
