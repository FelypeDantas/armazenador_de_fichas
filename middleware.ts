import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/cadastrar"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🚫 Ignorar arquivos internos do Next (ESSENCIAL)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Permitir rotas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}