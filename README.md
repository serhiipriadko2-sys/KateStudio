# K Sebe Yoga Studio | InsideFlow Ecosystem

> **"Йога — это не про то, чтобы дотянуться руками до пальцев ног, а про то, что мы узнаем на пути вниз"**

Экосистема для йога-студии "К себе" (Катя Габран) — веб-сайт, PWA-приложение и общая библиотека компонентов.

---

## Структура проекта

```
KateStudio/
├── shared/                    # @ksebe/shared - Общая библиотека
│   ├── components/           # React компоненты
│   ├── hooks/                # Кастомные хуки
│   ├── services/             # API сервисы (Supabase)
│   ├── types/                # TypeScript типы
│   ├── utils/                # Утилиты (cn, formatDate, etc.)
│   ├── constants/            # Константы бренда
│   └── styles/               # Tailwind preset
│
├── k-sebe-yoga-studioWEB/    # Веб-сайт (Лендинг)
├── k-sebe-yoga-studio-APPp/  # PWA Приложение
│
├── .eslintrc.cjs             # ESLint конфигурация
├── .prettierrc               # Prettier конфигурация
├── tsconfig.json             # TypeScript с path aliases
└── package.json              # Monorepo workspaces
```

---

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

```bash
cp .env.example .env
# Заполните SUPABASE_URL, SUPABASE_ANON_KEY, VITE_GEMINI_API_KEY
```

### 3. Запуск

```bash
# Веб-сайт
npm run dev:web

# PWA Приложение
npm run dev:app
```

### 4. Сборка

```bash
npm run build:all
```

---

## Технологический стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 19.2 | UI Framework |
| TypeScript | 5.8 | Типизация |
| Vite | 6.2 | Build tool |
| Supabase | 2.49 | Backend (Auth, DB, Storage) |
| Google Gemini | - | AI (Chat, Vision, TTS) |
| TailwindCSS | 3.x | Стилизация |
| Lucide | 0.511 | Иконки |

---

## Использование Shared библиотеки

### Компоненты

```tsx
import { FadeIn, Logo, Breathwork, Blog, Pricing } from '@ksebe/shared';

// FadeIn - анимация появления
<FadeIn delay={200} direction="up">
  <h1>Привет!</h1>
</FadeIn>

// Logo - с вариантами
<Logo variant="light" className="w-12 h-12" />

// Breathwork - дыхательная практика
<Breathwork config={{ inhaleDuration: 4000, ... }} />

// Pricing - с unified callback
<Pricing onBook={(plan, price) => console.log(plan)} />
```

### Хуки

```tsx
import { useScrollLock } from '@ksebe/shared';

// Блокировка скролла при открытом модальном окне
const [isOpen, setIsOpen] = useState(false);
useScrollLock(isOpen);
```

### Утилиты

```tsx
import { cn, formatDate, formatPrice, pluralize, storage } from '@ksebe/shared';

// Классы (как clsx)
<div className={cn('base', isActive && 'active')} />

// Форматирование
formatDate(new Date()); // "13 декабря"
formatPrice(5200); // "5 200 ₽"
pluralize(8, ['занятие', 'занятия', 'занятий']); // "8 занятий"

// Хранилище
storage.set('user', { name: 'Катя' });
storage.get<User>('user');
```

### Константы

```tsx
import { COLORS, BRAND, PRICING_PLANS, BREATHWORK_PRESETS } from '@ksebe/shared';

console.log(COLORS.brandGreen); // "#57a773"
console.log(BRAND.founder); // "Катя Габран"
```

### Типы

```tsx
import type {
  UserProfile,
  ClassSession,
  BookingDetails,
  ChatMode,
  AsanaAnalysis
} from '@ksebe/shared';
```

---

## Tailwind Preset

Используйте shared дизайн-токены в ваших проектах:

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
<div class="animate-fade-up animate-blob animate-float" />

<!-- Утилиты -->
<div class="scrollbar-hide safe-area-bottom" />
```

---

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev:web` | Запуск веб-сайта |
| `npm run dev:app` | Запуск приложения |
| `npm run build:all` | Сборка всех проектов |
| `npm run lint` | Проверка ESLint |
| `npm run lint:fix` | Автоисправление ESLint |
| `npm run format` | Форматирование Prettier |
| `npm run typecheck` | Проверка типов |

---

## AI Функционал

### Веб-сайт (ChatWidget)

| Режим | Модель | Функция |
|-------|--------|---------|
| chat | gemini-2.5-flash | Общение с AI-Катей |
| meditation | Veo 3.1 + TTS | Генерация медитаций |
| art | Imagen 3 | Арт-терапия |
| coach | gemini-2.5-flash | Анализ техники асан |
| program | gemini-3-pro | Персональные программы |
| diary | gemini-2.5-flash | Транскрибация дневника |

### Приложение (AICoach)

| Режим | Функции |
|-------|---------|
| chat | Streaming + Thinking Mode |
| vision | Анализ фото/видео асан |
| meditation | Генерация + озвучка |
| create | Image Gen + Veo + Magic Edit |

---

## Документация

- [ANALYSIS.md](./ANALYSIS.md) — Полный аудит репозитория
- [SYNC_REPORT.md](./SYNC_REPORT.md) — Отчёт о синхронизации

---

## Индексатор файлов

```bash
python3 scripts/index_repo.py
```

Создаёт `repo_index.json` со списком файлов, размерами и хешами.

---

## Лицензия

Проприетарный код. Все права принадлежат K Sebe Yoga Studio.

---

**С любовью для Кати** ❤️
