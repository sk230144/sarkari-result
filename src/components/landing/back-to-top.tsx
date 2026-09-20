import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <a
      href="#"
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[#2b3926] bg-[#1c221a] text-white shadow-xl transition-all hover:bg-[#263321]"
    >
      <ArrowUp className="h-5 w-5" />
    </a>
  );
}
