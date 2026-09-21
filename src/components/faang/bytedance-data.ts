import type { Section } from "../striver/sheet-types";

export const BYTEDANCE_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Algorithms",
    problems: [
      { n: 1, title: "Implement Queue using Stacks", url: "https://leetcode.com/problems/implement-queue-using-stacks", difficulty: "Easy" },
      { n: 2, title: "Daily Temperatures", url: "https://leetcode.com/problems/daily-temperatures", difficulty: "Medium" },
      { n: 3, title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists", difficulty: "Hard" },
      { n: 4, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 5, title: "Max Consecutive Ones III", url: "https://leetcode.com/problems/max-consecutive-ones-iii", difficulty: "Medium" },
      { n: 6, title: "Sliding Window Maximum", url: "https://leetcode.com/problems/sliding-window-maximum", difficulty: "Hard" },
      { n: 7, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands", difficulty: "Medium" },
      { n: 8, title: "Binary Tree Maximum Path Sum", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum", difficulty: "Hard" },
      { n: 9, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water", difficulty: "Hard" },
      { n: 10, title: "3Sum", url: "https://leetcode.com/problems/3sum", difficulty: "Medium" },
      { n: 11, title: "Longest Valid Parentheses", url: "https://leetcode.com/problems/longest-valid-parentheses", difficulty: "Hard" },
      { n: 12, title: "N-Queens", url: "https://leetcode.com/problems/n-queens", difficulty: "Hard" },
      { n: 13, title: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", difficulty: "Hard" },
      { n: 14, title: "Coin Change", url: "https://leetcode.com/problems/coin-change", difficulty: "Medium" },
      { n: 15, title: "Regular Expression Matching", url: "https://leetcode.com/problems/regular-expression-matching", difficulty: "Hard" },
      { n: 16, title: "Longest Increasing Path in a Matrix", url: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix", difficulty: "Hard" },
      { n: 17, title: "Minimum Difference in Sums After Removal of Elements", url: "https://leetcode.com/problems/minimum-difference-in-sums-after-removal-of-elements", difficulty: "Hard" },
      { n: 18, title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array", difficulty: "Medium" },
      { n: 19, title: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array", difficulty: "Medium" },
      { n: 20, title: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii", difficulty: "Medium" },
      { n: 21, title: "Gas Station", url: "https://leetcode.com/problems/gas-station", difficulty: "Medium" },
      { n: 22, title: "The kth Factor of n", url: "https://leetcode.com/problems/the-kth-factor-of-n", difficulty: "Medium" },
      { n: 23, title: "Zero Array Transformation I", url: "https://leetcode.com/problems/zero-array-transformation-i", difficulty: "Medium" },
      { n: 24, title: "Maximum Area Rectangle With Point Constraints I", url: "https://leetcode.com/problems/maximum-area-rectangle-with-point-constraints-i", difficulty: "Medium" },
      { n: 25, title: "Maximize Amount After Two Days of Conversions", url: "https://leetcode.com/problems/maximize-amount-after-two-days-of-conversions", difficulty: "Medium" },
      { n: 26, title: "Count Unhappy Friends", url: "https://leetcode.com/problems/count-unhappy-friends", difficulty: "Medium" },
      { n: 27, title: "Continuous Subarray Sum", url: "https://leetcode.com/problems/continuous-subarray-sum", difficulty: "Medium" },
      { n: 28, title: "Number of Islands II", url: "https://leetcode.com/problems/number-of-islands-ii", difficulty: "Hard" },
      { n: 29, title: "K Inverse Pairs Array", url: "https://leetcode.com/problems/k-inverse-pairs-array", difficulty: "Hard" },
      { n: 30, title: "Sliding Window Median", url: "https://leetcode.com/problems/sliding-window-median", difficulty: "Hard" },
      { n: 31, title: "Basic Calculator II", url: "https://leetcode.com/problems/basic-calculator-ii", difficulty: "Medium" },
      { n: 32, title: "The Maze", url: "https://leetcode.com/problems/the-maze", difficulty: "Medium" },
      { n: 33, title: "Decode Ways II", url: "https://leetcode.com/problems/decode-ways-ii", difficulty: "Hard" },
    ],
  },
];

export const BYTEDANCE_TOTAL = BYTEDANCE_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
