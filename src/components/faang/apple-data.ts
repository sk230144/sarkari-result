import type { Section } from "../striver/sheet-types";

export const APPLE_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Arrays and Strings",
    problems: [
      { n: 1, title: "Two Sum", url: "https://leetcode.com/problems/two-sum", difficulty: "Easy" },
      { n: 2, title: "3Sum", url: "https://leetcode.com/problems/3sum", difficulty: "Medium" },
      { n: 3, title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals", difficulty: "Medium" },
      { n: 4, title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses", difficulty: "Easy" },
      { n: 5, title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self", difficulty: "Medium" },
      { n: 6, title: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams", difficulty: "Medium" },
      { n: 7, title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters", difficulty: "Medium" },
      { n: 8, title: "Longest Repeating Character Replacement", url: "https://leetcode.com/problems/longest-repeating-character-replacement", difficulty: "Medium" },
      { n: 9, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water", difficulty: "Hard" },
      { n: 10, title: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock", difficulty: "Easy" },
      { n: 11, title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k", difficulty: "Medium" },
      { n: 12, title: "Rotate Image", url: "https://leetcode.com/problems/rotate-image", difficulty: "Medium" },
      { n: 13, title: "H-Index", url: "https://leetcode.com/problems/h-index", difficulty: "Medium" },
      { n: 14, title: "Minimum Unique Word Abbreviation", url: "https://leetcode.com/problems/minimum-unique-word-abbreviation", difficulty: "Hard" },
      { n: 15, title: "Find Minimum in Rotated Sorted Array", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array", difficulty: "Medium" },
      { n: 16, title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array", difficulty: "Medium" },
      { n: 17, title: "Permutations", url: "https://leetcode.com/problems/permutations", difficulty: "Medium" },
    ],
  },
  {
    day: 2,
    title: "Trees and Graphs",
    problems: [
      { n: 18, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands", difficulty: "Medium" },
      { n: 19, title: "Lowest Common Ancestor of a Binary Tree", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree", difficulty: "Medium" },
      { n: 20, title: "Course Schedule", url: "https://leetcode.com/problems/course-schedule", difficulty: "Medium" },
      { n: 21, title: "Sum Root to Leaf Numbers", url: "https://leetcode.com/problems/sum-root-to-leaf-numbers", difficulty: "Medium" },
      { n: 22, title: "Check Completeness of a Binary Tree", url: "https://leetcode.com/problems/check-completeness-of-a-binary-tree", difficulty: "Medium" },
      { n: 23, title: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", difficulty: "Hard" },
      { n: 24, title: "Bus Routes", url: "https://leetcode.com/problems/bus-routes", difficulty: "Hard" },
      { n: 25, title: "Vertical Order Traversal of a Binary Tree", url: "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree", difficulty: "Hard" },
      { n: 26, title: "Flood Fill", url: "https://leetcode.com/problems/flood-fill", difficulty: "Easy" },
      { n: 27, title: "Word Ladder", url: "https://leetcode.com/problems/word-ladder", difficulty: "Hard" },
      { n: 28, title: "Coin Change", url: "https://leetcode.com/problems/coin-change", difficulty: "Medium" },
      { n: 29, title: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence", difficulty: "Medium" },
      { n: 30, title: "House Robber", url: "https://leetcode.com/problems/house-robber", difficulty: "Medium" },
    ],
  },
  {
    day: 3,
    title: "Design and System Coding",
    problems: [
      { n: 31, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 32, title: "Word Break", url: "https://leetcode.com/problems/word-break", difficulty: "Medium" },
      { n: 33, title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements", difficulty: "Medium" },
      { n: 34, title: "Maximum Profit in Job Scheduling", url: "https://leetcode.com/problems/maximum-profit-in-job-scheduling", difficulty: "Hard" },
      { n: 35, title: "Median of Two Sorted Arrays", url: "https://leetcode.com/problems/median-of-two-sorted-arrays", difficulty: "Hard" },
      { n: 36, title: "Search a 2D Matrix", url: "https://leetcode.com/problems/search-a-2d-matrix", difficulty: "Medium" },
      { n: 37, title: "Time Based Key-Value Store", url: "https://leetcode.com/problems/time-based-key-value-store", difficulty: "Medium" },
      { n: 38, title: "Design Hit Counter", url: "https://leetcode.com/problems/design-hit-counter", difficulty: "Medium" },
      { n: 39, title: "Design Add and Search Words Data Structure", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure", difficulty: "Medium" },
      { n: 40, title: "Binary Search Tree Iterator", url: "https://leetcode.com/problems/binary-search-tree-iterator", difficulty: "Medium" },
      { n: 41, title: "Implement Queue using Stacks", url: "https://leetcode.com/problems/implement-queue-using-stacks", difficulty: "Easy" },
    ],
  },
];

export const APPLE_TOTAL = APPLE_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
