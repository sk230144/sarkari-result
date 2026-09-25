import { serviceDb } from "@/lib/server-auth";

function xml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);
}

/** Rough text width for an 11px sans-serif, good enough to size the badge. */
function width(s: string) {
  return Math.ceil(s.length * 6.6) + 20;
}

function badge(left: string, right: string, rightColor: string) {
  const lw = width(left);
  const rw = width(right);
  const w = lw + rw;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="24" role="img" aria-label="${xml(left)}: ${xml(right)}">
<title>${xml(left)}: ${xml(right)}</title>
<clipPath id="r"><rect width="${w}" height="24" rx="5"/></clipPath>
<g clip-path="url(#r)">
<rect width="${lw}" height="24" fill="#121212"/>
<rect x="${lw}" width="${rw}" height="24" fill="${rightColor}"/>
</g>
<g font-family="Verdana,DejaVu Sans,sans-serif" font-size="11" font-weight="bold" text-anchor="middle">
<text x="${lw / 2}" y="16" fill="#a3e635">${xml(left)}</text>
<text x="${lw + rw / 2}" y="16" fill="#0b0e0b">${xml(right)}</text>
</g>
</svg>`;
}

/** Embeddable profile badge for READMEs and personal sites. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clean = slug.replace(/\.svg$/, "");

  let right = "profile not found";
  let color = "#6b7280";
  if (/^[a-z0-9-]{3,30}$/.test(clean)) {
    const { data } = await serviceDb()
      .from("profiles")
      .select("full_name, headline, is_public")
      .eq("slug", clean)
      .maybeSingle();
    if (data?.is_public) {
      const name = (data.full_name as string) || "Developer";
      const headline = (data.headline as string) || "";
      right = (headline ? `${name} · ${headline}` : name).slice(0, 60);
      color = "#a3e635";
    }
  }

  return new Response(badge("jobalert24", right, color), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
