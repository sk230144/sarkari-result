export const SITE_NAME = "Job Alerts 24";
export const SITE_DESCRIPTION =
  "Find latest government jobs, results, admit cards, answer keys, and scholarships. Your 24/7 portal for all sarkari naukri updates.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const CATEGORIES = [
  { value: "job", label: "Latest Jobs" },
  { value: "result", label: "Results" },
  { value: "admit_card", label: "Admit Card" },
  { value: "answer_key", label: "Answer Key" },
  { value: "syllabus", label: "Syllabus" },
  { value: "scholarship", label: "Scholarship" },
] as const;

export const STATES = [
  "All India",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const QUALIFICATIONS = [
  "8th Pass",
  "10th Pass",
  "12th Pass",
  "ITI",
  "Diploma",
  "Graduate",
  "B.Tech/B.E.",
  "Post Graduate",
  "M.Tech/M.E.",
  "PhD",
  "Medical",
  "Law",
  "CA/CS",
  "Other",
] as const;

export const ITEMS_PER_PAGE = 20;
