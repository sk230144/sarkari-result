export type JobCategory =
  | "job"
  | "result"
  | "admit_card"
  | "answer_key"
  | "syllabus"
  | "scholarship";

export interface Job {
  id: string;
  title: string;
  organization: string | null;
  category: JobCategory;
  state: string | null;
  qualification: string | null;
  tags: string[] | null;
  post_date: string;
  last_date: string | null;
  total_posts: number | null;
  fee: string | null;
  age_limit: string | null;
  short_description: string | null;
  notification_url: string | null;
  apply_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface JobFilters {
  category?: JobCategory | "all";
  state?: string;
  qualification?: string;
  search?: string;
  sort?: "newest" | "last_date" | "featured";
  page?: number;
}
