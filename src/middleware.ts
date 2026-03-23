import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/about'];
// The root '/' is also considered public but handled separately below
const PROTECTED_PREFIXES = ['/dashboard', '/map', '/data', '/overview', '/forecast', '/stations', '/reports', '/rainfall'];

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('gw_token')?.value;

    const isPublic = PUBLIC_ROUTES.some(r => pathname === r) || pathname === '/';
    const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));

    // 1. If trying to access protected route without token -> Login
    if (isProtected && !token) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('from', pathname);
        return NextResponse.redirect(url);
    }

    // 2. If already logged in and try to access login/register/root -> Overview
    // We allow them to view '/about' even if logged in
    if (token && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
        const url = req.nextUrl.clone();
        url.pathname = '/overview'; 
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
