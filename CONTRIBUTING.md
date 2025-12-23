# Contributing to K Sebe Yoga Studio

Thank you for your interest in contributing to the K Sebe Yoga Studio project!
This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

This project is dedicated to providing a welcoming and supportive environment
for all contributors. We expect everyone to:

- Be respectful and inclusive
- Be patient with newcomers
- Focus on constructive feedback
- Accept responsibility for mistakes gracefully

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/KateStudio.git
   cd KateStudio
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Start development server**

   ```bash
   # For WEB
   npm run dev:web

   # For APP
   npm run dev:app
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:

- `feature/short-description` - New features
- `fix/short-description` - Bug fixes
- `docs/short-description` - Documentation updates
- `refactor/short-description` - Code refactoring
- `chore/short-description` - Maintenance tasks

### Project Structure

```
KateStudio/
├── shared/                    # Shared library
│   ├── components/           # Reusable components
│   ├── hooks/               # Custom hooks
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   ├── utils/               # Utilities
│   └── constants/           # Constants
├── k-sebe-yoga-studioWEB/    # Marketing website
└── k-sebe-yoga-studio-APPp/  # PWA application
```

### Running Tests

```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Format check
npm run format:check

# All checks
npm run lint && npm run typecheck && npm run format:check
```

## Coding Standards

### TypeScript

- Use strict mode (enabled by default)
- Always define explicit types for function parameters and returns
- Prefer interfaces over type aliases for object shapes
- Use `unknown` instead of `any` when type is truly unknown

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// Bad
function getUser(id): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- One component per file
- Keep components focused and under 300 lines
- Extract complex logic to custom hooks

```typescript
// Good
export function VideoCard({ video }: VideoCardProps) {
  const { isPlaying, toggle } = useVideoPlayer(video.id);

  return (
    <div className="video-card">
      {/* ... */}
    </div>
  );
}

// Bad
export default class VideoCard extends Component {
  // ...
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use custom colors from the Tailwind preset
- Keep animations subtle and purposeful

```typescript
// Good
<div className="p-4 md:p-6 lg:p-8 bg-brand-green/10 rounded-lg">

// Bad
<div style={{ padding: '1rem', background: '#57a773' }}>
```

### Imports

Use path aliases for cleaner imports:

```typescript
// Good
import { Button, Card } from '@ksebe/shared';
import { useAuth } from '@app/hooks/useAuth';

// Bad
import { Button } from '../../../shared/components/Button';
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                |
| ---------- | -------------------------- |
| `feat`     | New feature                |
| `fix`      | Bug fix                    |
| `docs`     | Documentation              |
| `style`    | Formatting, no code change |
| `refactor` | Code refactoring           |
| `perf`     | Performance improvement    |
| `test`     | Adding tests               |
| `chore`    | Maintenance                |
| `ci`       | CI/CD changes              |

### Scopes

- `web` - WEB project changes
- `app` - APP project changes
- `shared` - Shared library changes
- `deps` - Dependency updates

### Examples

```
feat(app): add breathwork timer component

fix(web): resolve mobile menu z-index issue

docs(shared): update component documentation

refactor(app): extract video player logic to hook
```

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation if needed

3. **Ensure all checks pass**

   ```bash
   npm run lint && npm run typecheck && npm run format:check
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat(scope): your message"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature
   ```

6. **Create a Pull Request**
   - Fill out the PR template completely
   - Link related issues
   - Request review from maintainers

7. **Address review feedback**
   - Respond to all comments
   - Make requested changes
   - Re-request review when ready

## Issue Guidelines

### Bug Reports

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Screenshots if applicable

### Feature Requests

When suggesting features, include:

- Problem statement
- Proposed solution
- Alternatives considered
- Mockups or examples if available

### Labels

Issues are labeled for easy tracking:

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `web` / `app` / `shared` - Project scope

## Questions?

If you have questions about contributing, feel free to:

1. Open a GitHub Discussion
2. Create an issue with the `question` label
3. Reach out to the maintainers

---

Thank you for contributing to K Sebe Yoga Studio! Your help makes this project
better for everyone.
