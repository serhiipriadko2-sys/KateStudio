# Logger Utility

A simple, structured logging utility for the K Sebe Yoga Studio ecosystem.

## Features

- ✅ Structured logging with context
- ✅ Different log levels (debug, info, warn, error)
- ✅ Development vs. Production mode awareness
- ✅ Performance timing for functions
- ✅ Log grouping for related messages
- ✅ Easy integration with external services (Sentry, LogRocket)

## Usage

### Basic Logging

```typescript
import { logger } from '@ksebe/shared';

// Debug (only in development)
logger.debug('Starting data fetch');

// Info
logger.info('User logged in', { userId: '123' });

// Warning
logger.warn('API rate limit approaching', { remaining: 10 });

// Error
logger.error('Failed to save data', error, { userId: '123' });
```

### With Context

```typescript
logger.info('Booking created', {
  classId: 'class-123',
  userId: 'user-456',
  date: new Date().toISOString(),
});
```

### Performance Timing

```typescript
// Measure sync function
const result = await logger.time('Data processing', () => {
  return processData(data);
});

// Measure async function
const users = await logger.time('Fetch users', async () => {
  return await fetchUsers();
});
```

### Grouped Logs

```typescript
logger.group('User Registration Flow', () => {
  logger.info('Validating email');
  logger.info('Creating user record');
  logger.info('Sending welcome email');
});
```

## Integration with External Services

To integrate with services like Sentry:

1. Install the service SDK:

   ```bash
   npm install @sentry/react
   ```

2. Modify `logger.ts` error method:

   ```typescript
   import * as Sentry from '@sentry/react';

   error(message: string, error?: Error | unknown, context?: LogContext): void {
     // ... existing code ...

     if (this.isProduction && error instanceof Error) {
       Sentry.captureException(error, {
         contexts: { custom: context },
         tags: { message }
       });
     }
   }
   ```

## Best Practices

1. **Use appropriate log levels:**
   - `debug`: Detailed information for debugging (dev only)
   - `info`: General informational messages
   - `warn`: Warning messages for potentially problematic situations
   - `error`: Error messages for failures

2. **Include context:**

   ```typescript
   // Good
   logger.error('Payment failed', error, { userId, amount, paymentMethod });

   // Not as useful
   logger.error('Payment failed');
   ```

3. **Use timing for performance monitoring:**

   ```typescript
   const data = await logger.time('Heavy computation', () => heavyOperation());
   ```

4. **Replace console statements:**

   ```typescript
   // Before
   console.log('User action:', userId);

   // After
   logger.info('User action', { userId });
   ```

## Migration Guide

To migrate existing code from `console.*` to `logger`:

```bash
# Find all console statements
grep -r "console\." --include="*.ts" --include="*.tsx" src/

# Replace systematically:
console.log()   → logger.info()
console.debug() → logger.debug()
console.warn()  → logger.warn()
console.error() → logger.error()
```

## Future Enhancements

- [ ] Add log level filtering
- [ ] Implement log buffering for performance
- [ ] Add remote logging endpoint
- [ ] Create log viewer UI component
- [ ] Add request ID tracking for distributed tracing
