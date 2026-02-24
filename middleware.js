import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
export const runtime = "nodejs";
export function middleware(req) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("adminToken")?.value;
  // Allow access to the admin login page, but if already authenticated redirect to dashboard
  if (pathname.startsWith("/admin/login")) {
    if (!token) {
      return NextResponse.next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
      }
    } catch {
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // Protect all other /admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "admin") {
        const homeUrl = req.nextUrl.clone();
        homeUrl.pathname = "/";
        homeUrl.search = "";
        return NextResponse.redirect(homeUrl);
      }
    } catch {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

