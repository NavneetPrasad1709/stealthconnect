import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          // Step 2: rebuild the response with the updated cookies
          supabaseResponse = NextResponse.next({ request });
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

  // Forward verified user to page components via headers (avoids second getUser() call)
  if (user) {
    supabaseResponse.headers.set("x-user-id", user.id);
    supabaseResponse.headers.set("x-user-email", user.email ?? "");
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
