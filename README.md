# K Sebe Yoga Studio Ecosystem

Welcome to the K Sebe Yoga Studio ecosystem monorepo. This repository contains the code for the web platform, mobile PWA, and shared libraries.

## 🌟 Structure

- **`k-sebe-yoga-studioWEB`**: The main web application (React + Vite).
- **`k-sebe-yoga-studio-APPp`**: The mobile Progressive Web App (PWA).
- **`shared`**: Shared UI components, hooks, and services.
- **`supabase`**: Backend logic (Edge Functions, Migrations).

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm

### Installation
```bash
npm install
```

### Development
Start the web development server:
```bash
npm run dev:web
```

Start the app development server:
```bash
npm run dev:app
```

### Building
Build all workspaces:
```bash
npm run build:all
```

### Testing
Run unit tests:
```bash
npm run test:run
```

## 🛠 Configuration

Create a `.env` file in the root or specific workspace with the following:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Production

See [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md) for a detailed checklist before deploying to production.

## 📄 License
MIT
