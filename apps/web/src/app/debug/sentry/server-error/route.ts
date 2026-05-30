export const dynamic = 'force-dynamic';

export function GET() {
  throw new Error(`Sentry web server throw — ${new Date().toISOString()}`);
}
