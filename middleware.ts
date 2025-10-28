// frontend/middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that anyone can access without authentication
  publicRoutes: [
    "/",                  // Homepage
    "/manifest.json",     // PWA manifest
    "/favicon.ico",       // Favicon
    "/icons/:path*",      // Icons folder
    "/logo.png",          // Logo file
    "/health",            // Health check
  ],
});

export const config = {
  // Intercept everything except _next/static and static files
  matcher: ["/((?!_next/static|.*\\..*).*)"],
};
