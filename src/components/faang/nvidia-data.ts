import type { Section } from "../striver/sheet-types";

export const NVIDIA_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Algorithms",
    problems: [
      { n: 1, title: "Maximum Number of Events That Can Be Attended", url: "https://leetcode.com/problems/maximum-number-of-events-that-can-be-attended", difficulty: "Medium" },
      { n: 2, title: "Min Stack", url: "https://leetcode.com/problems/min-stack", difficulty: "Medium" },
      { n: 3, title: "Clone Graph", url: "https://leetcode.com/problems/clone-graph", difficulty: "Medium" },
      { n: 4, title: "K Closest Points to Origin", url: "https://leetcode.com/problems/k-closest-points-to-origin", difficulty: "Medium" },
      { n: 5, title: "Random Pick with Weight", url: "https://leetcode.com/problems/random-pick-with-weight", difficulty: "Medium" },
      { n: 6, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water", difficulty: "Hard" },
      { n: 7, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands", difficulty: "Medium" },
      { n: 8, title: "Rotate Image", url: "https://leetcode.com/problems/rotate-image", difficulty: "Medium" },
      { n: 9, title: "Word Break", url: "https://leetcode.com/problems/word-break", difficulty: "Medium" },
      { n: 10, title: "Shortest Path in Binary Matrix", url: "https://leetcode.com/problems/shortest-path-in-binary-matrix", difficulty: "Medium" },
      { n: 11, title: "Longest Increasing Path in a Matrix", url: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix", difficulty: "Hard" },
      { n: 12, title: "Expression Add Operators", url: "https://leetcode.com/problems/expression-add-operators", difficulty: "Hard" },
      { n: 13, title: "Word Ladder II", url: "https://leetcode.com/problems/word-ladder-ii", difficulty: "Hard" },
      { n: 14, title: "Bus Routes", url: "https://leetcode.com/problems/bus-routes", difficulty: "Hard" },
      { n: 15, title: "Making A Large Island", url: "https://leetcode.com/problems/making-a-large-island", difficulty: "Hard" },
      { n: 16, title: "Special Binary String", url: "https://leetcode.com/problems/special-binary-string", difficulty: "Hard" },
      { n: 17, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 18, title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters", difficulty: "Medium" },
      { n: 19, title: "Maximum Binary Tree", url: "https://leetcode.com/problems/maximum-binary-tree", difficulty: "Medium" },
      { n: 20, title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists", difficulty: "Hard" },
      { n: 21, title: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams", difficulty: "Medium" },
      { n: 22, title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses", difficulty: "Easy" },
      { n: 23, title: "Best Time to Buy and Sell Stock", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock", difficulty: "Easy" },
      { n: 24, title: "Two Sum", url: "https://leetcode.com/problems/two-sum", difficulty: "Easy" },
      { n: 25, title: "Course Schedule", url: "https://leetcode.com/problems/course-schedule", difficulty: "Medium" },
      { n: 26, title: "Rotting Oranges", url: "https://leetcode.com/problems/rotting-oranges", difficulty: "Medium" },
      { n: 27, title: "Coin Change", url: "https://leetcode.com/problems/coin-change", difficulty: "Medium" },
      { n: 28, title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array", difficulty: "Medium" },
      { n: 29, title: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list", difficulty: "Easy" },
    ],
  },
];

export const NVIDIA_TOTAL = NVIDIA_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
