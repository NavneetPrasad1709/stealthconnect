import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  // SECURITY (FP-03): the x-user-id / x-user-email identity headers must be
  // SERVER-CONTROLLED only. Strip any client-supplied values up front so a forged
  // header can NEVER reach a route handler on any code path (authenticated,
  // unauthenticated, or pass-through). They are re-set below only for a verified
  // session. Without this, an unauthenticated caller could send
  // `x-user-id: <victim>` and be treated as that user by every /api route.
  const sanitizedHeaders = new Headers(request.headers);
  sanitizedHeaders.delete("x-user-id");
  sanitizedHeaders.delete("x-user-email");

  let supabaseResponse = NextResponse.next({
    request: { headers: sanitizedHeaders },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Step 1: mutate the request cookies so downstream server reads are consistent
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Step 2: rebuild the response with the updated cookies (sanitized headers)
          supabaseResponse = NextResponse.next({
            request: { headers: sanitizedHeaders },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              // CookieOptions is compatible with ResponseCookies.set() options
              options as Parameters<typeof supabaseResponse.cookies.set>[2]
            )
          );
        },
      },
    }
  );

  // IMPORTANT: calling getUser() is required — it refreshes the session token
  // when it's close to expiry and persists the new token via setAll above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Forward the VERIFIED user identity via REQUEST headers so API route handlers
  // can read it. These were stripped above, so only a real session can set them —
  // a client-supplied value is never honoured.
  if (user) {
    sanitizedHeaders.set("x-user-id",    user.id);
    sanitizedHeaders.set("x-user-email", user.email ?? "");

    const newResponse = NextResponse.next({ request: { headers: sanitizedHeaders } });

    // Copy any refreshed auth cookies from supabaseResponse so tokens stay valid
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      newResponse.cookies.set(
        cookie.name,
        cookie.value,
        cookie as Parameters<typeof newResponse.cookies.set>[2]
      );
    });

    supabaseResponse = newResponse;
  }

  const { pathname } = request.nextUrl;

  // Protect dashboard / admin / order routes
  const protectedPaths = ["/dashboard", "/admin", "/order"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Preserve the originally-requested path so we can redirect back after login
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect already-logged-in users away from auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  if (isAuthPage && user) {
    const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
    const url = request.nextUrl.clone();
    // Validate next param to prevent open redirect
    url.pathname = next.startsWith("/") ? next : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
