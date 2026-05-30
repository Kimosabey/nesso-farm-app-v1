/**
 * Sentry initialization for the Nesso API.
 *
 * This file MUST be imported as the very first thing in main.ts (before any
 * other framework code) so Sentry's auto-instrumentation can patch Node
 * globals before NestJS, Mongoose, etc. load.
 *
 * Loading is silent in dev (warn only) when SENTRY_DSN is empty — the API
 * still boots, just without error tracking.
 */
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.SENTRY_RELEASE,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
  });
}
