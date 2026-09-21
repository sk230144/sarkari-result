import type { Section } from "../striver/sheet-types";

export const ANTHROPIC_SECTIONS: Section[] = [
  {
    day: 1,
    title: "LeetCode Practice",
    problems: [
      { n: 1, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 2, title: "Web Crawler Multithreaded", url: "https://leetcode.com/problems/web-crawler-multithreaded", difficulty: "Medium" },
      { n: 3, title: "Implement Trie (Prefix Tree)", url: "https://leetcode.com/problems/implement-trie-prefix-tree", difficulty: "Medium" },
      { n: 4, title: "Word Break", url: "https://leetcode.com/problems/word-break", difficulty: "Medium" },
      { n: 5, title: "Design Hit Counter", url: "https://leetcode.com/problems/design-hit-counter", difficulty: "Medium" },
      { n: 6, title: "Time Based Key-Value Store", url: "https://leetcode.com/problems/time-based-key-value-store", difficulty: "Medium" },
      { n: 7, title: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", difficulty: "Hard" },
      { n: 8, title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists", difficulty: "Hard" },
      { n: 9, title: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii", difficulty: "Medium" },
      { n: 10, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands", difficulty: "Medium" },
      { n: 11, title: "Count of Smaller Numbers After Self", url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self", difficulty: "Hard" },
    ],
  },
];

export const ANTHROPIC_TOTAL = ANTHROPIC_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
