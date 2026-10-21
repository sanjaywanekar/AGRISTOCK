import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET!
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl.pathname;

  // No token
  if (!token) {
    if (path.startsWith("/admin")) {
      return NextResponse.redirect(
        new URL("/login?role=admin", req.url)
      );
    }

    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Industrialist/Admin protected routes
    if (
      (
        path.startsWith("/dashboard") ||
        path.startsWith("/inventory") ||
        path.startsWith("/products") ||
        path.startsWith("/users") ||
        path.startsWith("/expenses")
      ) &&
      !["ADMIN", "INDUSTRIALIST"].includes(role)
    ) {
      return NextResponse.redirect(
        new URL("/farmer", req.url)
      );
    }

    // Farmer routes
    if (
      path.startsWith("/farmer") &&
      role !== "FARMER"
    ) {
      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      );
    }

    // Admin routes
    if (
      path.startsWith("/admin") &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(
        new URL("/login?role=admin", req.url)
      );
    }

    return NextResponse.next();
  } catch {
    if (path.startsWith("/admin")) {
      return NextResponse.redirect(
        new URL("/login?role=admin", req.url)
      );
    }

    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/products/:path*",
    "/users/:path*",
    "/expenses/:path*",
    "/farmer/:path*",
    "/admin/:path*",
  ],
};