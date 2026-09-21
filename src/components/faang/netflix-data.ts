import type { Section } from "../striver/sheet-types";

export const NETFLIX_SECTIONS: Section[] = [
  {
    day: 1,
    title: "System Design Coding",
    problems: [
      { n: 1, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 2, title: "Design Hit Counter", url: "https://leetcode.com/problems/design-hit-counter", difficulty: "Medium" },
      { n: 3, title: "Implement Trie (Prefix Tree)", url: "https://leetcode.com/problems/implement-trie-prefix-tree", difficulty: "Medium" },
      { n: 4, title: "Find Median from Data Stream", url: "https://leetcode.com/problems/find-median-from-data-stream", difficulty: "Hard" },
      { n: 5, title: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", difficulty: "Hard" },
      { n: 6, title: "Time Based Key-Value Store", url: "https://leetcode.com/problems/time-based-key-value-store", difficulty: "Medium" },
      { n: 7, title: "Logger Rate Limiter", url: "https://leetcode.com/problems/logger-rate-limiter", difficulty: "Easy" },
      { n: 8, title: "Min Stack", url: "https://leetcode.com/problems/min-stack", difficulty: "Medium" },
    ],
  },
  {
    day: 2,
    title: "Algorithms",
    problems: [
      { n: 9, title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals", difficulty: "Medium" },
      { n: 10, title: "Meeting Rooms II", url: "https://leetcode.com/problems/meeting-rooms-ii", difficulty: "Medium" },
      { n: 11, title: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii", difficulty: "Medium" },
      { n: 12, title: "Network Delay Time", url: "https://leetcode.com/problems/network-delay-time", difficulty: "Medium" },
      { n: 13, title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements", difficulty: "Medium" },
      { n: 14, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water", difficulty: "Hard" },
      { n: 15, title: "Daily Temperatures", url: "https://leetcode.com/problems/daily-temperatures", difficulty: "Medium" },
      { n: 16, title: "Edit Distance", url: "https://leetcode.com/problems/edit-distance", difficulty: "Medium" },
      { n: 17, title: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring", difficulty: "Hard" },
      { n: 18, title: "Koko Eating Bananas", url: "https://leetcode.com/problems/koko-eating-bananas", difficulty: "Medium" },
      { n: 19, title: "Rotating the Box", url: "https://leetcode.com/problems/rotating-the-box", difficulty: "Medium" },
      { n: 20, title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists", difficulty: "Hard" },
      { n: 21, title: "Word Search II", url: "https://leetcode.com/problems/word-search-ii", difficulty: "Hard" },
      { n: 22, title: "Reconstruct Itinerary", url: "https://leetcode.com/problems/reconstruct-itinerary", difficulty: "Hard" },
      { n: 23, title: "Alien Dictionary", url: "https://leetcode.com/problems/alien-dictionary", difficulty: "Hard" },
      { n: 24, title: "Parallel Courses", url: "https://leetcode.com/problems/parallel-courses", difficulty: "Medium" },
      { n: 25, title: "Clone Graph", url: "https://leetcode.com/problems/clone-graph", difficulty: "Medium" },
      { n: 26, title: "Course Schedule", url: "https://leetcode.com/problems/course-schedule", difficulty: "Medium" },
      { n: 27, title: "Recover Binary Search Tree", url: "https://leetcode.com/problems/recover-binary-search-tree", difficulty: "Medium" },
      { n: 28, title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self", difficulty: "Medium" },
      { n: 29, title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water", difficulty: "Medium" },
      { n: 30, title: "Department Top Three Salaries", url: "https://leetcode.com/problems/department-top-three-salaries", difficulty: "Hard" },
    ],
  },
];

export const NETFLIX_TOTAL = NETFLIX_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
