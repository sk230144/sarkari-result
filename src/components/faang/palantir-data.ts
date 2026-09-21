import type { Section } from "../striver/sheet-types";

export const PALANTIR_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Coding Problems",
    problems: [
      { n: 1, title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals", difficulty: "Medium" },
      { n: 2, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands", difficulty: "Medium" },
      { n: 3, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 4, title: "Course Schedule", url: "https://leetcode.com/problems/course-schedule", difficulty: "Medium" },
      { n: 5, title: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii", difficulty: "Medium" },
      { n: 6, title: "All Ancestors of a Node in DAG", url: "https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph", difficulty: "Medium" },
      { n: 7, title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists", difficulty: "Hard" },
      { n: 8, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water", difficulty: "Hard" },
      { n: 9, title: "Regular Expression Matching", url: "https://leetcode.com/problems/regular-expression-matching", difficulty: "Hard" },
      { n: 10, title: "Subdomain Visit Count", url: "https://leetcode.com/problems/subdomain-visit-count", difficulty: "Medium" },
      { n: 11, title: "Find the Celebrity", url: "https://leetcode.com/problems/find-the-celebrity", difficulty: "Medium" },
      { n: 12, title: "UTF-8 Validation", url: "https://leetcode.com/problems/utf-8-validation", difficulty: "Medium" },
      { n: 13, title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water", difficulty: "Medium" },
      { n: 14, title: "Max Area of Island", url: "https://leetcode.com/problems/max-area-of-island", difficulty: "Medium" },
      { n: 15, title: "Integer to English Words", url: "https://leetcode.com/problems/integer-to-english-words", difficulty: "Hard" },
      { n: 16, title: "Minimum Time Difference", url: "https://leetcode.com/problems/minimum-time-difference", difficulty: "Medium" },
      { n: 17, title: "Flood Fill", url: "https://leetcode.com/problems/flood-fill", difficulty: "Easy" },
      { n: 18, title: "Cheapest Flights Within K Stops", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops", difficulty: "Medium" },
      { n: 19, title: "Word Ladder", url: "https://leetcode.com/problems/word-ladder", difficulty: "Hard" },
      { n: 20, title: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock", difficulty: "Easy" },
    ],
  },
];

export const PALANTIR_TOTAL = PALANTIR_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
