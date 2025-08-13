import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies
  const token = request.cookies.get('token');
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/doctor/apply', '/'];
  
  // Check if the current path is a public route
  if (publicRoutes.includes(pathname)) {
    // If user is authenticated and trying to access home page, redirect to appropriate dashboard
    if (token && pathname === '/') {
      // We'll let the client-side handle the redirect based on user role
      return NextResponse.next();
    }
    return NextResponse.next();
  }
  
  // Protected routes that require authentication
  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Role-based route protection
  if (pathname.startsWith('/admin/')) {
    // Admin routes - let client-side handle role checking
    return NextResponse.next();
  }
  
  if (pathname.startsWith('/doctor/')) {
    // Doctor routes - let client-side handle role checking
    return NextResponse.next();
  }
  
  if (pathname.startsWith('/patient/')) {
    // Patient routes - let client-side handle role checking
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

