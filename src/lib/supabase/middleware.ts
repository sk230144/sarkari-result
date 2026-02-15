import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (request.nextUrl.pathname === "/admin/login") {
      // If user is already logged in, redirect to admin dashboard
      if (user) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/jobs";
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // If not logged in, redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Auth pages - redirect logged-in users to document locker
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    if (user) {
      const redirect = request.nextUrl.searchParams.get("redirect");
      const url = request.nextUrl.clone();
      url.pathname = redirect || "/tools/document-locker";
      url.searchParams.delete("redirect");
      return NextResponse.redirect(url);
    }
  }

  // Protect document locker - require user login
  if (request.nextUrl.pathname.startsWith("/tools/document-locker")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect calendar - require user login
  if (request.nextUrl.pathname.startsWith("/tools/calendar")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect resume builder - require user login
  if (request.nextUrl.pathname.startsWith("/tools/resume-builder")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect job alerts - require user login
  if (request.nextUrl.pathname.startsWith("/tools/job-alerts")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect membership payment - require user login
  if (request.nextUrl.pathname.startsWith("/membership/payment")) {
    if (!user) {
      const url = request.nextUrl.clone();
      const fullPath = request.nextUrl.pathname + request.nextUrl.search;
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", fullPath);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
