import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/actions/blog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { AdminBlogActions } from "@/components/admin/blog-actions";

const categoryColors: Record<string, string> = {
  guide: "bg-blue-50 text-blue-700",
  tips: "bg-emerald-50 text-emerald-700",
  news: "bg-amber-50 text-amber-700",
  exam: "bg-violet-50 text-violet-700",
  general: "bg-slate-100 text-slate-600",
};

export default async function AdminBlogPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            Manage Blog
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            {posts.length} total posts
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="btn-3d gradient-hero text-white shadow-lg shadow-blue-500/25 font-black shine">
            <Plus className="h-4 w-4 mr-1.5" />
            New Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-16 text-center">
          <div className="icon-3d h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-slate-600 font-bold">No blog posts yet</p>
          <p className="text-sm text-slate-400 mt-1 font-medium mb-4">
            Create your first post to start driving SEO traffic.
          </p>
          <Link href="/admin/blog/new">
            <Button className="btn-3d gradient-hero text-white font-black shine">
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="card-3d bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold border-0 ${
                        categoryColors[post.category] || categoryColors.general
                      }`}
                    >
                      {post.category}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold border-0 ${
                        post.is_published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {post.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm font-extrabold text-slate-800 truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {post.published_at
                      ? format(new Date(post.published_at), "dd MMM yyyy")
                      : "Not published"}{" "}
                    · {post.author}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AdminBlogActions postId={post.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
