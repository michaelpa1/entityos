import { type NextRequest, NextResponse } from "next/server";

/**
 * MVP site password — used when Vercel Advanced Deployment Protection is not
 * available on the team plan. Set SITE_PASSWORD in Vercel env (server-only).
 * Leave unset locally to skip auth during development.
 */
export function middleware(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const colon = decoded.indexOf(":");
      const supplied = colon >= 0 ? decoded.slice(colon + 1) : decoded;
      if (supplied === password) return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Entity OS"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
