import type { Section } from "../striver/sheet-types";

export const TESLA_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Algorithms",
    problems: [
      { n: 1, title: "Reorganize String", url: "https://leetcode.com/problems/reorganize-string", difficulty: "Medium" },
      { n: 2, title: "Two Sum", url: "https://leetcode.com/problems/two-sum", difficulty: "Easy" },
      { n: 3, title: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams", difficulty: "Medium" },
      { n: 4, title: "3Sum", url: "https://leetcode.com/problems/3sum", difficulty: "Medium" },
      { n: 5, title: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray", difficulty: "Medium" },
      { n: 6, title: "Subarray Sum Equals K", url: "https://leetcode.com/problems/subarray-sum-equals-k", difficulty: "Medium" },
      { n: 7, title: "Find Pivot Index", url: "https://leetcode.com/problems/find-pivot-index", difficulty: "Easy" },
      { n: 8, title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array", difficulty: "Medium" },
      { n: 9, title: "Word Ladder", url: "https://leetcode.com/problems/word-ladder", difficulty: "Hard" },
      { n: 10, title: "First Missing Positive", url: "https://leetcode.com/problems/first-missing-positive", difficulty: "Hard" },
      { n: 11, title: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring", difficulty: "Hard" },
      { n: 12, title: "Alien Dictionary", url: "https://leetcode.com/problems/alien-dictionary", difficulty: "Hard" },
      { n: 13, title: "Minimum Area Rectangle", url: "https://leetcode.com/problems/minimum-area-rectangle", difficulty: "Medium" },
      { n: 14, title: "Find Peak Element", url: "https://leetcode.com/problems/find-peak-element", difficulty: "Medium" },
      { n: 15, title: "Reverse Words in a String", url: "https://leetcode.com/problems/reverse-words-in-a-string", difficulty: "Medium" },
      { n: 16, title: "Palindrome Permutation", url: "https://leetcode.com/problems/palindrome-permutation", difficulty: "Easy" },
      { n: 17, title: "Palindrome Linked List", url: "https://leetcode.com/problems/palindrome-linked-list", difficulty: "Easy" },
      { n: 18, title: "Top K Frequent Words", url: "https://leetcode.com/problems/top-k-frequent-words", difficulty: "Medium" },
      { n: 19, title: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array", difficulty: "Medium" },
      { n: 20, title: "Task Scheduler", url: "https://leetcode.com/problems/task-scheduler", difficulty: "Medium" },
      { n: 21, title: "Sort Colors", url: "https://leetcode.com/problems/sort-colors", difficulty: "Medium" },
      { n: 22, title: "Rotate Image", url: "https://leetcode.com/problems/rotate-image", difficulty: "Medium" },
      { n: 23, title: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii", difficulty: "Medium" },
      { n: 24, title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists", difficulty: "Hard" },
      { n: 25, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water", difficulty: "Hard" },
    ],
  },
  {
    day: 2,
    title: "System Design",
    problems: [
      { n: 26, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 27, title: "Implement Trie (Prefix Tree)", url: "https://leetcode.com/problems/implement-trie-prefix-tree", difficulty: "Medium" },
      { n: 28, title: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", difficulty: "Hard" },
      { n: 29, title: "Design HashMap", url: "https://leetcode.com/problems/design-hashmap", difficulty: "Easy" },
      { n: 30, title: "Design Underground System", url: "https://leetcode.com/problems/design-underground-system", difficulty: "Medium" },
      { n: 31, title: "Design Hit Counter", url: "https://leetcode.com/problems/design-hit-counter", difficulty: "Medium" },
    ],
  },
  {
    day: 3,
    title: "Embedded Systems",
    problems: [
      { n: 32, title: "Number of 1 Bits", url: "https://leetcode.com/problems/number-of-1-bits", difficulty: "Easy" },
      { n: 33, title: "Reverse Bits", url: "https://leetcode.com/problems/reverse-bits", difficulty: "Easy" },
      { n: 34, title: "Single Number", url: "https://leetcode.com/problems/single-number", difficulty: "Easy" },
      { n: 35, title: "Counting Bits", url: "https://leetcode.com/problems/counting-bits", difficulty: "Easy" },
      { n: 36, title: "Find the Duplicate Number", url: "https://leetcode.com/problems/find-the-duplicate-number", difficulty: "Medium" },
      { n: 37, title: "Sum of Two Integers", url: "https://leetcode.com/problems/sum-of-two-integers", difficulty: "Medium" },
    ],
  },
];

export const TESLA_TOTAL = TESLA_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
