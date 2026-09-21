"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  ChevronsLeft,
  ChevronsRight,
  Search,
  TrendingUp,
  Trello,
  Table,
  ChevronDown,
  Layers,
  Network,
  Building,
  BadgeCheck,
  FileText,
  Monitor,
  Target,
  BookOpen,
  GraduationCap,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  children?: { label: string; href: string }[];
};

type NavSection = { heading?: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Progress", icon: TrendingUp, href: "/resources" },
      { label: "Task Board", icon: Trello, href: "/task-board" },
    ],
  },
  {
    heading: "Sheets",
    items: [
      {
        label: "DSA Sheets",
        icon: Table,
        href: "/dsa-sheets",
        children: [
          { label: "Striver SDE Sheet", href: "/dsa-sheets/striver-a2z" },
          { label: "Love Babbar Sheet", href: "/dsa-sheets/love-babbar" },
          { label: "NeetCode 150", href: "/dsa-sheets#neetcode-150" },
          { label: "Rohit Negi Sheet", href: "/dsa-sheets/rohit-negi" },
        ],
      },
      { label: "20 DSA Patterns", icon: Layers, href: "#dsa-patterns" },
      { label: "System Design Sheet", icon: Network, href: "/system-design" },
      {
        label: "FAANG Interview Questions",
        icon: Building,
        href: "/faang-questions",
      },
    ],
  },
  {
    heading: "Job Tools",
    items: [
      { label: "Portfolio Builder", icon: BadgeCheck, href: "/portfolio-builder" },
      { label: "Cover Letter", icon: FileText, href: "#cover-letter" },
      { label: "Mock Interview", icon: Monitor, href: "#mock-interview" },
      { label: "Resume Analysis", icon: Target, href: "#resume-analysis" },
    ],
  },
  { heading: "More", items: [{ label: "Blog", icon: BookOpen, href: "#blog" }] },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  // Anchor links can't be resolved from the URL, so clicks on those track locally.
  const [anchorHref, setAnchorHref] = useState<string | null>(null);
  const activeHref = anchorHref ?? pathname;

  // Collapsing hides labels, so a text filter has nothing to match against.
  const searching = query.trim().length > 0 && !collapsed;

  const sections = useMemo(() => {
    if (!searching) return SECTIONS;
    const q = query.trim().toLowerCase();
    return SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.children?.some((c) => c.label.toLowerCase().includes(q)),
      ),
    })).filter((s) => s.items.length > 0);
  }, [query, searching]);

  const empty = sections.length === 0;

  function toggleExpand(label: string) {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          aria-hidden
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col justify-between bg-[#121212] px-4 py-4 transition-[width,transform] duration-300 ${
          collapsed ? "w-20" : "w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex min-h-0 flex-col gap-4">
          {/* Brand */}
          <div
            className={`flex items-center px-1 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#006c49]">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <span className="text-[17px] font-bold tracking-tight text-[#f9f9f6]">
                  jobalert24
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className="hidden text-[#6c7a71] transition-colors hover:text-[#f9f9f6] lg:block"
            >
              {collapsed ? (
                <ChevronsRight className="h-5 w-5" />
              ) : (
                <ChevronsLeft className="h-5 w-5" />
              )}
            </button>

            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close menu"
              className="text-[#6c7a71] transition-colors hover:text-[#f9f9f6] lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative px-1">
            {collapsed ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Search problems and sheets"
                className="flex h-10 w-full items-center justify-center rounded-lg bg-[#1e1e1e] text-[#6c7a71] transition-colors hover:text-[#f9f9f6]"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
            ) : (
              <>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6c7a71]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search problems, sheets..."
                  aria-label="Search problems and sheets"
                  className="h-10 w-full rounded-lg bg-[#1e1e1e] pl-9 pr-8 text-xs text-[#f9f9f6] placeholder:text-[#6c7a71] focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6c7a71] hover:text-[#f9f9f6]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Nav */}
          <nav className="flex min-h-0 flex-col gap-1 overflow-y-auto pr-1">
            {empty && (
              <p className="px-3 py-4 text-xs text-[#6c7a71]">
                No matches for “{query}”.
              </p>
            )}

            {sections.map((section, si) => (
              <div key={section.heading ?? `s-${si}`} className="flex flex-col gap-1">
                {section.heading && !collapsed && (
                  <div className="px-2 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6c7a71]">
                      {section.heading}
                    </span>
                  </div>
                )}
                {section.heading && collapsed && (
                  <div className="mx-auto my-2 h-px w-8 bg-[#1e1e1e]" />
                )}

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeHref === item.href;
                  const isOpen =
                    expanded.includes(item.label) || (searching && !!item.children);

                  const isRoute = item.href.startsWith("/");
                  const Tag = isRoute ? Link : "a";

                  return (
                    <div key={item.label}>
                      <Tag
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        aria-current={isActive ? "page" : undefined}
                        onClick={(e: React.MouseEvent) => {
                          // A parent with children but no real route only expands.
                          if (item.children && !isRoute && !collapsed) {
                            e.preventDefault();
                            toggleExpand(item.label);
                            return;
                          }
                          if (isRoute) setAnchorHref(null);
                          else {
                            e.preventDefault();
                            setAnchorHref(item.href);
                          }
                          onMobileClose();
                        }}
                        className={`flex items-center rounded-lg px-3 py-2 text-[13px] transition-all ${
                          collapsed ? "justify-center" : "justify-between"
                        } ${
                          isActive
                            ? "bg-[#10b981] font-bold text-[#00422b] shadow-sm"
                            : "font-medium text-[#6c7a71] hover:bg-[#1e1e1e] hover:text-[#f9f9f6]"
                        }`}
                      >
                        <span
                          className={`flex items-center ${collapsed ? "" : "gap-2"}`}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          {!collapsed && <span>{item.label}</span>}
                        </span>
                        {item.children && !collapsed && (
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label}`}
                            aria-expanded={isOpen}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleExpand(item.label);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleExpand(item.label);
                              }
                            }}
                            className="-mr-1 rounded p-0.5 hover:bg-black/20"
                          >
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                            />
                          </span>
                        )}
                      </Tag>

                      {item.children && isOpen && !collapsed && (
                        <div className="mt-1 flex flex-col gap-1 border-l border-[#1e1e1e] pl-4 ml-4">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => {
                                setAnchorHref(null);
                                onMobileClose();
                              }}
                              className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                                activeHref === child.href
                                  ? "bg-[#1e1e1e] font-semibold text-[#4edea3]"
                                  : "text-[#6c7a71] hover:bg-[#1e1e1e] hover:text-[#f9f9f6]"
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer CTA */}
        <div className="px-1 pt-2">
          <button
            type="button"
            title={collapsed ? "Become a Campus Ambassador" : undefined}
            className={`flex w-full items-center justify-center gap-1 rounded-full bg-white font-semibold text-[#1a1c1b] shadow-sm transition-colors hover:bg-[#f5f5f0] ${
              collapsed ? "h-10 px-0" : "px-3 py-2.5 text-[13px]"
            }`}
          >
            <GraduationCap className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && (
              <span className="truncate">Become a Campus Ambassador</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
