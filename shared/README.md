# @ksebe/shared

Общая библиотека компонентов, хуков, сервисов и утилит для экосистемы K Sebe Yoga Studio.

## Установка

```bash
# В monorepo (уже настроено)
npm install

# Или отдельно
npm install @ksebe/shared
```

## Структура

```
shared/
├── components/          # React компоненты (10)
│   ├── BackToTop.tsx   # Кнопка "Наверх"
│   ├── Blog.tsx        # Блог с модальным чтением
│   ├── Breathwork.tsx  # Дыхательная практика
│   ├── CookieBanner.tsx# Баннер cookies
│   ├── ErrorBoundary.tsx# Обработка ошибок
│   ├── FadeIn.tsx      # Анимация появления
│   ├── Image.tsx       # Оптимизированные изображения
│   ├── Logo.tsx        # Логотип с вариантами
│   ├── Marquee.tsx     # Бегущая строка
│   ├── Pricing.tsx     # Унифицированный прайсинг
│   └── ScrollProgress.tsx # Прогресс скролла
│
├── hooks/              # React хуки (5)
│   ├── useDebounce.ts  # Debounced значение
│   ├── useLocalStorage.ts # Type-safe localStorage
│   ├── useMediaQuery.ts # Responsive logic
│   ├── useOnlineStatus.ts # Статус сети
│   └── useScrollLock.ts # Блокировка скролла
│
├── services/           # Сервисы (2)
│   ├── imageStorage.ts # Хранение изображений
│   └── supabase.ts     # Supabase клиент
│
├── types/              # TypeScript типы (25+)
│   └── index.ts
│
├── utils/              # Утилиты (28)
│   └── index.ts
│
├── constants/          # Константы бренда
│   └── index.ts
│
├── styles/             # Tailwind preset
│   └── tailwind.preset.js
│
└── __tests__/          # Тесты
    ├── components.test.tsx
    ├── image.test.tsx
    ├── imageStorage.test.ts
    └── utils.test.ts
```

## Использование

### Компоненты

```tsx
import { FadeIn, Logo, Breathwork, Blog, Pricing } from '@ksebe/shared';

// Анимация появления
<FadeIn delay={200} direction="up">
  <h1>Привет!</h1>
</FadeIn>

// Логотип (light/dark варианты)
<Logo variant="light" className="w-12 h-12" />

// Дыхательная практика
<Breathwork
  config={{
    inhaleDuration: 4000,
    holdDuration: 4000,
    exhaleDuration: 4000,
    holdEmptyDuration: 4000,
  }}
  onComplete={() => console.log('Завершено!')}
/>

// Pricing с unified callback
<Pricing
  onBook={(plan, price) => handleBooking(plan)}
  showToast={(msg, type) => toast[type](msg)}
/>
```

### Хуки

```tsx
import {
  useScrollLock,
  useDebounce,
  useMediaQuery,
  useOnlineStatus,
  useLocalStorage,
} from '@ksebe/shared';

// Блокировка скролла для модальных окон
function Modal({ isOpen }) {
  useScrollLock(isOpen);
  return isOpen ? <div>Modal content</div> : null;
}

// Debounced поиск
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) search(debouncedQuery);
  }, [debouncedQuery]);
}

// Responsive
function Layout() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return isMobile ? <MobileNav /> : <DesktopNav />;
}

// Статус сети
function App() {
  const isOnline = useOnlineStatus();
  return isOnline ? <Content /> : <OfflineMessage />;
}

// Type-safe localStorage
function Settings() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
}
```

### Утилиты

```tsx
import {
  cn,
  formatDate,
  formatPrice,
  pluralize,
  debounce,
  storage,
} from '@ksebe/shared';

// Классы (как clsx/tailwind-merge)
<div className={cn('base', isActive && 'active', className)} />

// Форматирование
formatDate(new Date());           // "24 декабря"
formatPrice(5200);                // "5 200 ₽"
pluralize(8, ['занятие', 'занятия', 'занятий']); // "8 занятий"

// Debounce функция
const debouncedSearch = debounce(search, 300);

// Type-safe localStorage
storage.set('user', { name: 'Катя' });
const user = storage.get<User>('user');
storage.remove('user');
```

### Константы

```tsx
import { COLORS, BRAND, PRICING_PLANS, CONTACT } from '@ksebe/shared';

console.log(COLORS.brandGreen);   // "#57a773"
console.log(BRAND.founder);       // "Катя Габран"
console.log(CONTACT.phone);       // "+7 (999) 123-45-67"
console.log(PRICING_PLANS[0]);    // { name: "Разовое", price: 1500, ... }
```

### Типы

```tsx
import type {
  UserProfile,
  ClassSession,
  BookingDetails,
  ChatMode,
  AsanaAnalysis,
  BlogArticle,
  PriceOption,
  BreathPhase,
  ThemeMode,
} from '@ksebe/shared';
```

## Tailwind Preset

Используйте shared дизайн-токены:

```js
// tailwind.config.js
module.exports = {
  presets: [require('@ksebe/shared/styles/tailwind.preset.js')],
  content: ['./src/**/*.{ts,tsx}'],
};
```

### Доступные классы

```html
<!-- Цвета бренда -->
<div class="bg-brand-green text-brand-text" />
<div class="bg-brand-mint border-brand-yellow" />

<!-- Анимации -->
<div class="animate-fade-in animate-blob animate-float" />

<!-- Утилиты -->
<div class="scrollbar-hide safe-area-bottom" />
```

## Тестирование

```bash
# Запуск тестов
npm run test

# С coverage
npm run test:coverage
```

## Разработка

```bash
# Линтинг
npm run lint

# Форматирование
npm run format

# Type check
npm run typecheck
```

## Миграция

При добавлении нового компонента:

1. Создайте файл в `shared/components/NewComponent.tsx`
2. Экспортируйте из `shared/components/index.ts`
3. Re-экспортируйте из `shared/index.ts`
4. Используйте: `import { NewComponent } from '@ksebe/shared'`

## Версионирование

- `1.0.0` - Начальный релиз
- `1.1.0` - Добавлены хуки useDebounce, useMediaQuery, useOnlineStatus

---

*K Sebe Yoga Studio | @ksebe/shared*
