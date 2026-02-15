import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/tools/document-locker/:path*", "/tools/calendar/:path*", "/tools/job-alerts/:path*", "/tools/resume-builder/:path*", "/membership/payment/:path*", "/auth/:path*"],
};
