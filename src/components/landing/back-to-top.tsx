import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <a
      href="#"
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-c-forest-20)] bg-[var(--color-c-surface-12b)] text-[var(--color-c-text)] shadow-xl transition-all hover:bg-[var(--color-c-forest-11)]"
    >
      <ArrowUp className="h-5 w-5" />
    </a>
  );
}
