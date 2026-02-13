import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/5 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/5 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-200/10 rounded-full blur-3xl animate-float-slow" />

      <div className="relative text-center">
        <div className="card-elevated bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-10 sm:p-14 max-w-md mx-auto">
          <div className="icon-3d h-20 w-20 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-6 animate-float">
            <SearchX className="h-9 w-9 text-blue-400" />
          </div>
          <h1 className="text-7xl font-extrabold text-gradient stat-3d">404</h1>
          <h2 className="text-xl font-extrabold text-slate-700 mt-4">
            Page Not Found
          </h2>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link href="/" className="mt-8 inline-block">
            <Button className="btn-3d gradient-hero text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 h-11 px-6 font-black shine">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
