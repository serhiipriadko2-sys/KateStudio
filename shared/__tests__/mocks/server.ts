import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configure MSW server with default handlers.
// Individual tests can add or override handlers via server.use(...)
export const server = setupServer(...handlers);
