// frontend/middleware.ts
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icons",
  "/logo.png",
  "/health",
];

export function middleware(req) {
  const url = req.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.some((path) => url.startsWith(path))) {
    return NextResponse.next();
  }

  // Otherwise, optionally redirect to sign-in page
  // return NextResponse.redirect(new URL("/sign-in", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|.*\\..*).*)"],
};
