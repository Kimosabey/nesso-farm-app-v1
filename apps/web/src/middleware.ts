import { NextResponse, type NextRequest } from 'next/server';

// Auth-gated routes — everything inside the (dashboard) route group.
// Everything else (/, /login, /forgot) is public.
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/farmers',
  '/farms',
  '/approvals',
  '/activities',
  '/samples',
  '/audits',
  '/procurement',
  '/warehouses',
  '/inventory',
  '/reports',
  '/settings',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  const session = req.cookies.get('nesso_session')?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api/health).*)'],
};
