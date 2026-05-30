export const dynamic = 'force-dynamic';

export function GET() {
  throw new Error(`Sentry portal server throw — ${new Date().toISOString()}`);
}
