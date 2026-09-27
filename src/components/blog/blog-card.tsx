import Link from "next/link";
import { BookOpen, Eye } from "lucide-react";
import { fmtDate, initials, type BlogCard as Card } from "@/lib/blog/types";

const AVATAR_TINTS = [
  "bg-violet-500/20 text-violet-300 ring-violet-500/30",
  "bg-pink-500/20 text-pink-300 ring-pink-500/30",
  "bg-sky-500/20 text-sky-300 ring-sky-500/30",
  "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30",
  "bg-amber-400/20 text-amber-300 ring-amber-400/30",
];
export const avatarTint = (name: string) => AVATAR_TINTS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_TINTS.length];

export function BlogCardView({ post }: { post: Card }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col rounded-[22px] border border-white/[0.07] bg-[#171a15] p-2.5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#2a2238] to-[#161419]">
            <BookOpen className="h-8 w-8 text-white/30" />
          </div>
        )}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-2.5 right-3 inline-flex items-center gap-1 text-[12px] font-semibold text-white">
          <Eye className="h-3.5 w-3.5" />
          {post.views.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-2.5 pb-1.5 pt-4">
        <h3 className="line-clamp-2 text-[16px] font-bold leading-snug tracking-[-0.01em] text-[var(--color-c-text)] transition-colors group-hover:text-[var(--color-c-lime)]">
          {post.title}
        </h3>
        <p className="mt-2.5 flex items-center gap-2 text-[12px] text-[var(--color-c-muted)]">
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ring-1 ${avatarTint(post.authorName)}`}>
            {initials(post.authorName)}
          </span>
          <span className="truncate">{post.authorName}</span>
        </p>
        <div className="mt-auto pt-4">
          <div className="grid grid-cols-2 divide-x divide-white/[0.07] rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--color-c-dim)]">Published</p>
              <p className="mt-0.5 text-[13px] font-bold text-[var(--color-c-text)]">{fmtDate(post.publishedAt)}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--color-c-dim)]">Words</p>
              <p className="mt-0.5 text-[13px] font-bold text-[var(--color-c-text)]">{post.wordCount.toLocaleString("en-US")}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
