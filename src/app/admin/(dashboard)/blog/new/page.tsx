import { BlogPostForm } from "@/components/admin/blog-post-form";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-800 mb-6">
        New Blog Post
      </h1>
      <BlogPostForm />
    </div>
  );
}
