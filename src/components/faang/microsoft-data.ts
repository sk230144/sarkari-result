import type { Section } from "../striver/sheet-types";

export const MICROSOFT_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Arrays and Strings",
    problems: [
      { n: 1, title: "Two Sum", url: "https://leetcode.com/problems/two-sum", difficulty: "Easy" },
      { n: 2, title: "Merge Sorted Array", url: "https://leetcode.com/problems/merge-sorted-array", difficulty: "Easy" },
      { n: 3, title: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray", difficulty: "Medium" },
      { n: 4, title: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters", difficulty: "Medium" },
      { n: 5, title: "Set Matrix Zeroes", url: "https://leetcode.com/problems/set-matrix-zeroes", difficulty: "Medium" },
      { n: 6, title: "Rotate Image", url: "https://leetcode.com/problems/rotate-image", difficulty: "Medium" },
      { n: 7, title: "Sort Colors", url: "https://leetcode.com/problems/sort-colors", difficulty: "Medium" },
      { n: 8, title: "Permutation in String", url: "https://leetcode.com/problems/permutation-in-string", difficulty: "Medium" },
      { n: 9, title: "Asteroid Collision", url: "https://leetcode.com/problems/asteroid-collision", difficulty: "Medium" },
      { n: 10, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water", difficulty: "Hard" },
      { n: 11, title: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water", difficulty: "Medium" },
      { n: 12, title: "Longest Palindromic Substring", url: "https://leetcode.com/problems/longest-palindromic-substring", difficulty: "Medium" },
      { n: 13, title: "Next Permutation", url: "https://leetcode.com/problems/next-permutation", difficulty: "Medium" },
      { n: 14, title: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array", difficulty: "Medium" },
      { n: 15, title: "Spiral Matrix", url: "https://leetcode.com/problems/spiral-matrix", difficulty: "Medium" },
      { n: 16, title: "Word Search", url: "https://leetcode.com/problems/word-search", difficulty: "Medium" },
      { n: 17, title: "First Missing Positive", url: "https://leetcode.com/problems/first-missing-positive", difficulty: "Hard" },
      { n: 18, title: "Jump Game II", url: "https://leetcode.com/problems/jump-game-ii", difficulty: "Medium" },
      { n: 19, title: "3Sum", url: "https://leetcode.com/problems/3sum", difficulty: "Medium" },
      { n: 20, title: "Product of Array Except Self", url: "https://leetcode.com/problems/product-of-array-except-self", difficulty: "Medium" },
      { n: 21, title: "String to Integer (atoi)", url: "https://leetcode.com/problems/string-to-integer-atoi", difficulty: "Medium" },
    ],
  },
  {
    day: 2,
    title: "Linked Lists",
    problems: [
      { n: 22, title: "Add Two Numbers", url: "https://leetcode.com/problems/add-two-numbers", difficulty: "Medium" },
      { n: 23, title: "Merge Two Sorted Lists", url: "https://leetcode.com/problems/merge-two-sorted-lists", difficulty: "Easy" },
      { n: 24, title: "Copy List with Random Pointer", url: "https://leetcode.com/problems/copy-list-with-random-pointer", difficulty: "Medium" },
      { n: 25, title: "Reverse Nodes in k-Group", url: "https://leetcode.com/problems/reverse-nodes-in-k-group", difficulty: "Hard" },
      { n: 26, title: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists", difficulty: "Hard" },
    ],
  },
  {
    day: 3,
    title: "Trees and Graphs",
    problems: [
      { n: 27, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands", difficulty: "Medium" },
      { n: 28, title: "Binary Tree Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-level-order-traversal", difficulty: "Medium" },
      { n: 29, title: "Clone Graph", url: "https://leetcode.com/problems/clone-graph", difficulty: "Medium" },
      { n: 30, title: "Symmetric Tree", url: "https://leetcode.com/problems/symmetric-tree", difficulty: "Easy" },
      { n: 31, title: "Cheapest Flights Within K Stops", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops", difficulty: "Medium" },
      { n: 32, title: "Construct Binary Tree from Preorder and Inorder Traversal", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal", difficulty: "Medium" },
      { n: 33, title: "Generate Parentheses", url: "https://leetcode.com/problems/generate-parentheses", difficulty: "Medium" },
      { n: 34, title: "Letter Combinations of a Phone Number", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number", difficulty: "Medium" },
    ],
  },
  {
    day: 4,
    title: "Design and Hard Problems",
    problems: [
      { n: 35, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 36, title: "Median of Two Sorted Arrays", url: "https://leetcode.com/problems/median-of-two-sorted-arrays", difficulty: "Hard" },
      { n: 37, title: "Regular Expression Matching", url: "https://leetcode.com/problems/regular-expression-matching", difficulty: "Hard" },
      { n: 38, title: "Largest Rectangle in Histogram", url: "https://leetcode.com/problems/largest-rectangle-in-histogram", difficulty: "Hard" },
      { n: 39, title: "Sudoku Solver", url: "https://leetcode.com/problems/sudoku-solver", difficulty: "Hard" },
      { n: 40, title: "Interleaving String", url: "https://leetcode.com/problems/interleaving-string", difficulty: "Medium" },
      { n: 41, title: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array", difficulty: "Medium" },
      { n: 42, title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements", difficulty: "Medium" },
    ],
  },
];

export const MICROSOFT_TOTAL = MICROSOFT_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
