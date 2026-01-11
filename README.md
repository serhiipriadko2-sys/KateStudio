# K Sebe Yoga Studio Ecosystem

## Overview

This is a Monorepo containing the digital ecosystem for "K Sebe" Yoga Studio. It consists of a Web Application (Landing & Booking), a Mobile-first Web App (PWA), and a Shared Codebase.

### Structure

- **`k-sebe-yoga-studioWEB/`**: Main website (Landing Page, Schedule, Booking). Built with Vite + React.
- **`k-sebe-yoga-studio-APPp/`**: Mobile/PWA Application (User Dashboard, AI Coach, Video Library). Built with Vite + React.
- **`shared/`**: Shared UI components, hooks, services, and utilities used by both applications.
- **`supabase/`**: Backend configuration, Edge Functions (Payment, Webhooks).
- **`raw_assets/`**: Collection of raw design assets (images, screenshots) used for development.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm

### Installation

```bash
npm install
```

### Development

You can run the applications independently:

```bash
# Run the Web Portal
npm run dev:web

# Run the Mobile App
npm run dev:app
```

### Building

To build all applications for production:

```bash
npm run build:all
```

Artifacts will be generated in `k-sebe-yoga-studioWEB/dist` and `k-sebe-yoga-studio-APPp/dist`.

### Testing

Run the test suite (Vitest):

```bash
npm run test:coverage
```

## Architecture

- **State Management**: React Context + Local Storage (Persistence).
- **Styling**: Tailwind CSS + UnoCSS (in some parts).
- **Icons**: Lucide React.
- **Backend**: Supabase (Auth, Database, Edge Functions).

## Payment Integration

The project uses Supabase Edge Functions for payments.
- `create-payment`: Generates payment links.
- `payment-webhook`: Handles payment status updates.

*Note: Currently, the payment logic relies on a mock URL builder. See `PRODUCTION_ROADMAP.md` for integration details.*
