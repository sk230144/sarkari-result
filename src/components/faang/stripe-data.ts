import type { Section } from "../striver/sheet-types";

export const STRIPE_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Coding and Integration",
    problems: [
      { n: 1, title: "Two Sum", url: "https://leetcode.com/problems/two-sum", difficulty: "Easy" },
      { n: 2, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 3, title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals", difficulty: "Medium" },
      { n: 4, title: "Design Hit Counter", url: "https://leetcode.com/problems/design-hit-counter", difficulty: "Medium" },
      { n: 5, title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements", difficulty: "Medium" },
      { n: 6, title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k", difficulty: "Medium" },
      { n: 7, title: "Time Based Key-Value Store", url: "https://leetcode.com/problems/time-based-key-value-store", difficulty: "Medium" },
      { n: 8, title: "Course Schedule", url: "https://leetcode.com/problems/course-schedule", difficulty: "Medium" },
      { n: 9, title: "Coin Change", url: "https://leetcode.com/problems/coin-change", difficulty: "Medium" },
      { n: 10, title: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", difficulty: "Hard" },
      { n: 11, title: "Sliding Window Maximum", url: "https://leetcode.com/problems/sliding-window-maximum", difficulty: "Hard" },
    ],
  },
];

export const STRIPE_TOTAL = STRIPE_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
