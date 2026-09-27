import { Navbar } from "@/components/landing/navbar";
import { SiteFooter } from "@/components/landing/site-footer";

/** Shell for the simple company pages linked from the footer. */
export function InfoPage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="w-full px-6 pb-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 inline-block rounded-full bg-[var(--color-c-green-dim-5)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-c-green)]">
            {eyebrow}
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--color-c-text)] sm:text-5xl">{title}</h1>
          {intro && <p className="text-base leading-relaxed text-[var(--color-c-text-dim)]">{intro}</p>}
          {updated && <p className="mt-3 text-xs text-[var(--color-c-dim)]">Last updated: {updated}</p>}
          <div className="info-prose mt-10">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export const CONTACT_EMAIL = "risabht043@gmail.com";
