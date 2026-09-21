export type Company = {
  slug: string;
  name: string;
  questions: number;
  /** Topics the description enumerates, in order. */
  topics: string[];
  /** Extra topics folded into "and N more topics". */
  extraTopics?: number;
  logo: string;
  /** Panel behind the logo — matches each brand's own lockup background. */
  panel: string;
  /** Set once the company's question list exists as its own page. */
  route?: string;
};

export const COMPANIES: Company[] = [
  {
    slug: "meta",
    name: "Meta",
    questions: 69,
    topics: ["Arrays and Strings", "Linked Lists", "Trees and Graphs"],
    extraTopics: 4,
    logo: "/companies/meta.webp",
    panel: "bg-white",
    route: "/faang-questions/meta",
  },
  {
    slug: "google",
    name: "Google",
    questions: 59,
    topics: [
      "Arrays and Strings",
      "Trees and Graphs",
      "Dynamic Programming",
    ],
    extraTopics: 1,
    logo: "/companies/google.webp",
    panel: "bg-white",
    route: "/faang-questions/google",
  },
  {
    slug: "amazon",
    name: "Amazon",
    questions: 58,
    topics: [
      "Arrays and Strings",
      "Sliding Window and Two Pointers",
      "Trees and Graphs",
    ],
    extraTopics: 3,
    logo: "/companies/amazon.webp",
    panel: "bg-white",
    route: "/faang-questions/amazon",
  },
  {
    slug: "microsoft",
    name: "Microsoft",
    questions: 42,
    topics: ["Arrays and Strings", "Linked Lists", "Trees and Graphs"],
    extraTopics: 1,
    logo: "/companies/microsoft.webp",
    panel: "bg-white",
    route: "/faang-questions/microsoft",
  },
  {
    slug: "apple",
    name: "Apple",
    questions: 41,
    topics: [
      "Arrays and Strings",
      "Trees and Graphs",
      "Design and System Coding",
    ],
    logo: "/companies/apple.webp",
    panel: "bg-black",
    route: "/faang-questions/apple",
  },
  {
    slug: "tesla",
    name: "Tesla",
    questions: 37,
    topics: ["Algorithms", "System Design", "Embedded Systems"],
    logo: "/companies/tesla.webp",
    panel: "bg-white",
    route: "/faang-questions/tesla",
  },
  {
    slug: "bytedance",
    name: "ByteDance",
    questions: 33,
    topics: ["Algorithms"],
    logo: "/companies/bytedance.webp",
    panel: "bg-white",
    route: "/faang-questions/bytedance",
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    questions: 32,
    topics: [
      "Data Structure Design",
      "Trees and Graphs",
      "Arrays and DP",
    ],
    logo: "/companies/linkedin.webp",
    panel: "bg-[#0a66c2]",
    route: "/faang-questions/linkedin",
  },
  {
    slug: "netflix",
    name: "Netflix",
    questions: 30,
    topics: ["System Design Coding", "Algorithms"],
    logo: "/companies/netflix.webp",
    panel: "bg-black",
    route: "/faang-questions/netflix",
  },
  {
    slug: "nvidia",
    name: "NVIDIA",
    questions: 29,
    topics: ["Algorithms"],
    logo: "/companies/nvidia.webp",
    panel: "bg-white",
    route: "/faang-questions/nvidia",
  },
  {
    slug: "databricks",
    name: "Databricks",
    questions: 27,
    topics: ["Algorithms", "Design and Concurrency (Dedicated Round)"],
    logo: "/companies/databricks.webp",
    panel: "bg-black",
    route: "/faang-questions/databricks",
  },
  {
    slug: "palantir",
    name: "Palantir",
    questions: 20,
    topics: ["Coding Problems"],
    logo: "/companies/palantir.webp",
    panel: "bg-white",
    route: "/faang-questions/palantir",
  },
  {
    slug: "uber",
    name: "Uber",
    questions: 20,
    topics: ["Algorithms"],
    logo: "/companies/uber.webp",
    panel: "bg-white",
    route: "/faang-questions/uber",
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    questions: 19,
    topics: ["Algorithms"],
    logo: "/companies/airbnb.webp",
    panel: "bg-[#ff5a5f]",
    route: "/faang-questions/airbnb",
  },
  {
    slug: "doordash",
    name: "DoorDash",
    questions: 17,
    topics: ["Algorithms"],
    logo: "/companies/doordash.webp",
    panel: "bg-[#ff3008]",
    route: "/faang-questions/doordash",
  },
  {
    slug: "openai",
    name: "OpenAI",
    questions: 15,
    topics: ["LeetCode-Equivalent Problems"],
    logo: "/companies/openai.webp",
    panel: "bg-white",
    route: "/faang-questions/openai",
  },
  {
    slug: "anthropic",
    name: "Anthropic",
    questions: 11,
    topics: ["LeetCode Practice (Mapped to Focus Areas)"],
    logo: "/companies/anthropic.webp",
    panel: "bg-[#cc5c3c]",
    route: "/faang-questions/anthropic",
  },
  {
    slug: "stripe",
    name: "Stripe",
    questions: 11,
    topics: ["Coding and Integration"],
    logo: "/companies/stripe.webp",
    panel: "bg-white",
    route: "/faang-questions/stripe",
  },
];

/** Builds the card description from the company's own topic list. */
export function describe(c: Company): string {
  const list = c.topics.join(", ");
  const more = c.extraTopics
    ? `, and ${c.extraTopics} more topic${c.extraTopics > 1 ? "s" : ""}`
    : "";
  return `${c.questions} real coding interview questions recently asked at ${c.name}, spanning ${list}${more}, with a real difficulty tag and a direct LeetCode link for every question.`;
}
