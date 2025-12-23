# K Sebe Yoga Studio | InsideFlow Ecosystem

[![CI](https://github.com/serhiipriadko2-sys/KateStudio/actions/workflows/ci.yml/badge.svg)](https://github.com/serhiipriadko2-sys/KateStudio/actions/workflows/ci.yml)
[![Deploy](https://github.com/serhiipriadko2-sys/KateStudio/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/serhiipriadko2-sys/KateStudio/actions/workflows/deploy-pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-339933.svg)](https://nodejs.org/)

> **"Йога — это не про то, чтобы дотянуться руками до пальцев ног, а про то, что
> мы узнаем на пути вниз"**

Экосистема для йога-студии **"К себе"** (Катя Габран) — веб-сайт, PWA-приложение
и общая библиотека компонентов в стиле Inside Flow.

---

## Возможности

- **AI-коуч Aria** — персональный ассистент на базе Google Gemini
- **Анализ асан** — компьютерное зрение для оценки техники
- **Видеотека** — Inside Flow классы и уроки
- **Расписание** — бронирование занятий в реальном времени
- **Дыхательные практики** — квадратное дыхание и пранаяма
- **Блог** — статьи о йоге, осознанности и здоровье

---

## Структура проекта

```
KateStudio/
├── shared/                    # @ksebe/shared - Общая библиотека
│   ├── components/           # React компоненты (Pricing, Blog, Breathwork...)
│   ├── hooks/                # Кастомные хуки (useScrollLock...)
│   ├── services/             # API сервисы (Supabase)
│   ├── types/                # TypeScript типы (25+ интерфейсов)
│   ├── utils/                # Утилиты (cn, formatDate, debounce...)
│   ├── constants/            # Константы бренда (COLORS, PRICING...)
│   └── styles/               # Tailwind preset
│
├── k-sebe-yoga-studioWEB/    # Веб-сайт (Лендинг)
├── k-sebe-yoga-studio-APPp/  # PWA Приложение
│
├── .github/                  # GitHub конфигурация
│   ├── workflows/           # CI/CD (lint, build, deploy)
│   ├── ISSUE_TEMPLATE/      # Шаблоны issues
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .husky/                   # Git hooks (pre-commit)
├── .eslintrc.cjs             # ESLint конфигурация
├── .prettierrc               # Prettier конфигурация
├── tsconfig.json             # TypeScript с path aliases
└── package.json              # Monorepo workspaces
```

---

## Быстрый старт

### Требования

- Node.js >= 18.0.0
- npm >= 9.0.0

### 1. Клонирование и установка

```bash
git clone https://github.com/serhiipriadko2-sys/KateStudio.git
cd KateStudio
npm install
```

### 2. Настройка окружения

```bash
cp .env.example .env
```

Заполните переменные:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

### 3. Запуск в режиме разработки

```bash
# Веб-сайт (localhost:5173)
npm run dev:web

# PWA Приложение (localhost:5174)
npm run dev:app
```

### 4. Сборка для продакшена

```bash
npm run build:all
```

---

## Технологический стек

| Категория    | Технология        | Версия    |
| ------------ | ----------------- | --------- |
| **Frontend** | React             | 19.2      |
| **Language** | TypeScript        | 5.8       |
| **Build**    | Vite              | 6.2       |
| **Backend**  | Supabase          | 2.49      |
| **AI**       | Google Gemini     | 2.5       |
| **Styling**  | Tailwind CSS      | 3.x       |
| **Icons**    | Lucide React      | 0.511     |
| **Lint**     | ESLint + Prettier | 9.x / 3.x |

---

## Использование Shared библиотеки

### Компоненты

```tsx
import { FadeIn, Logo, Breathwork, Blog, Pricing } from '@ksebe/shared';

// Анимация появления
<FadeIn delay={200} direction="up">
  <h1>Привет!</h1>
</FadeIn>

// Логотип
<Logo variant="light" className="w-12 h-12" />

// Дыхательная практика
<Breathwork config={{ inhaleDuration: 4000, ... }} />

// Pricing с unified callback
<Pricing onBook={(plan, price) => handleBooking(plan)} />
```

### Хуки

```tsx
import { useScrollLock } from '@ksebe/shared';

function Modal({ isOpen }) {
  useScrollLock(isOpen);
  return isOpen ? <div>Modal content</div> : null;
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

// Классы (как clsx)
<div className={cn('base', isActive && 'active')} />;

// Форматирование
formatDate(new Date()); // "13 декабря"
formatPrice(5200); // "5 200 ₽"
pluralize(8, ['занятие', 'занятия', 'занятий']); // "8 занятий"

// Debounce
const debouncedSearch = debounce(search, 300);

// LocalStorage с типизацией
storage.set('user', { name: 'Катя' });
const user = storage.get<User>('user');
```

### Константы

```tsx
import { COLORS, BRAND, PRICING_PLANS, CONTACT } from '@ksebe/shared';

console.log(COLORS.brandGreen); // "#57a773"
console.log(BRAND.founder); // "Катя Габран"
console.log(CONTACT.phone); // "+7 (999) 123-45-67"
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
} from '@ksebe/shared';
```

---

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

---

## Скрипты

| Команда                | Описание                  |
| ---------------------- | ------------------------- |
| `npm run dev:web`      | Запуск веб-сайта          |
| `npm run dev:app`      | Запуск приложения         |
| `npm run build:all`    | Сборка всех проектов      |
| `npm run lint`         | Проверка ESLint           |
| `npm run lint:fix`     | Автоисправление ESLint    |
| `npm run format`       | Форматирование Prettier   |
| `npm run format:check` | Проверка форматирования   |
| `npm run typecheck`    | Проверка типов TypeScript |
| `npm run test`         | Запуск тестов             |
| `npm run clean`        | Очистка node_modules      |

---

## AI Функционал

### Aria - AI Коуч

| Режим        | Модель           | Описание                 |
| ------------ | ---------------- | ------------------------ |
| `chat`       | Gemini 2.5 Flash | Общение с AI-ассистентом |
| `vision`     | Gemini Vision    | Анализ фото/видео асан   |
| `meditation` | Gemini + TTS     | Генерация медитаций      |
| `art`        | Imagen 3         | Арт-терапия              |
| `program`    | Gemini Pro       | Персональные программы   |

### Пример использования

```tsx
import { geminiService } from '@app/services/geminiService';

// Чат
const response = await geminiService.chat(messages, 'yoga');

// Анализ асаны
const analysis = await geminiService.analyzeAsana(imageBase64);

// Text-to-Speech
const audioUrl = await geminiService.textToSpeech(text, 'ru');
```

---

## Документация

| Документ                             | Описание                       |
| ------------------------------------ | ------------------------------ |
| [ANALYSIS.md](./ANALYSIS.md)         | Полный аудит репозитория       |
| [SYNC_REPORT.md](./SYNC_REPORT.md)   | Отчёт о синхронизации WEB/APP  |
| [CLAUDE.md](./CLAUDE.md)             | Инструкции для AI агентов      |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Руководство для контрибьюторов |

---

## Структура веток

| Ветка       | Назначение             |
| ----------- | ---------------------- |
| `main`      | Продакшен код          |
| `develop`   | Разработка             |
| `feature/*` | Новые фичи             |
| `fix/*`     | Исправления багов      |
| `claude/*`  | AI-assisted разработка |

---

## Деплой

### GitHub Pages (WEB)

Автоматический деплой при пуше в `main`:

```yaml
# .github/workflows/deploy-pages.yml
on:
  push:
    branches: [main]
```

### Vercel / Netlify (APP)

```bash
# Build command
npm run build:app

# Output directory
k-sebe-yoga-studio-APPp/dist
```

---

## Вклад в проект

Мы приветствуем contributions! См. [CONTRIBUTING.md](./CONTRIBUTING.md).

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing`)
3. Commit изменения (`git commit -m 'feat: add amazing feature'`)
4. Push в branch (`git push origin feature/amazing`)
5. Откройте Pull Request

---

## Лицензия

MIT License. См. [LICENSE](./LICENSE).

---

## Контакты

- **Студия**: K Sebe Yoga Studio
- **Основатель**: Катя Габран
- **Instagram**: [@k_sebe_yoga](https://instagram.com/k_sebe_yoga)
- **Telegram**: [@ksebe_yoga](https://t.me/ksebe_yoga)

---

<p align="center">
  <strong>С любовью для Кати</strong> ❤️
</p>
