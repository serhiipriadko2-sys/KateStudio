# K Sebe Yoga Studio Ecosystem

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-100%25-blue.svg)

**"К себе" (To Yourself)** is a comprehensive digital ecosystem for the K Sebe Yoga Studio (Dubna, Russia).

## 📚 Documentation

- **[AGENTS.md](./AGENTS.md)**: **MUST READ**. Primary guidelines for AI agents and developers.
- **[CLAUDE.md](./CLAUDE.md)**: Quick reference context for assistants.
- **[Architecture](./docs/ARCHITECTURE.md)**: High-level system design.
- **[Skills](./skills/registry.json)**: Automated agent capabilities.

## 📂 Repository Structure

This is a **Monorepo** managed with npm workspaces:

- `shared/` (`@ksebe/shared`): Reusable UI, hooks, and logic.
- `k-sebe-yoga-studioWEB/`: Marketing site & Admin Panel.
- `k-sebe-yoga-studio-APPp/`: Mobile PWA for students.
- `supabase/`: Backend (Edge Functions, Database).

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9
- Supabase CLI

### Installation
```bash
npm install
cp .env.example .env
```

### Development
```bash
# Web Workspace
npm run dev:web

# App Workspace
npm run dev:app
```

### Testing
```bash
npm run test:run      # Run all tests (Vitest)
npm run typecheck     # Verify TypeScript
```

## 🔐 Security & AI

- **AI**: Powered by Gemini via Supabase Edge Functions (`gemini-proxy`).
- **Auth**: Supabase Auth with RLS.
- **Payments**: Edge Functions integration.

**Note**: Never commit `.env` files or expose API keys in client-side code.

## 📄 License
MIT © K Sebe Yoga Studio
