import type { Section } from "../striver/sheet-types";

export const LINKEDIN_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Data Structure Design",
    problems: [
      { n: 1, title: "Nested List Weight Sum", url: "https://leetcode.com/problems/nested-list-weight-sum", difficulty: "Medium" },
      { n: 2, title: "Nested List Weight Sum II", url: "https://leetcode.com/problems/nested-list-weight-sum-ii", difficulty: "Medium" },
      { n: 3, title: "Max Stack", url: "https://leetcode.com/problems/max-stack", difficulty: "Hard" },
      { n: 4, title: "All O'one Data Structure", url: "https://leetcode.com/problems/all-oone-data-structure", difficulty: "Hard" },
      { n: 5, title: "Shortest Word Distance II", url: "https://leetcode.com/problems/shortest-word-distance-ii", difficulty: "Medium" },
      { n: 6, title: "Design Add and Search Words Data Structure", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure", difficulty: "Medium" },
      { n: 7, title: "Insert Delete GetRandom O(1)", url: "https://leetcode.com/problems/insert-delete-getrandom-o1", difficulty: "Medium" },
      { n: 8, title: "LFU Cache", url: "https://leetcode.com/problems/lfu-cache", difficulty: "Hard" },
      { n: 9, title: "Insert Delete GetRandom O(1) - Duplicates allowed", url: "https://leetcode.com/problems/insert-delete-getrandom-o1-duplicates-allowed", difficulty: "Hard" },
      { n: 10, title: "Design Authentication Manager", url: "https://leetcode.com/problems/design-authentication-manager", difficulty: "Medium" },
      { n: 11, title: "Serialize and Deserialize BST", url: "https://leetcode.com/problems/serialize-and-deserialize-bst", difficulty: "Medium" },
    ],
  },
  {
    day: 2,
    title: "Trees and Graphs",
    problems: [
      { n: 12, title: "Find Leaves of Binary Tree", url: "https://leetcode.com/problems/find-leaves-of-binary-tree", difficulty: "Medium" },
      { n: 13, title: "Find the Celebrity", url: "https://leetcode.com/problems/find-the-celebrity", difficulty: "Medium" },
      { n: 14, title: "Lowest Common Ancestor of a BST", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree", difficulty: "Medium" },
      { n: 15, title: "Word Ladder", url: "https://leetcode.com/problems/word-ladder", difficulty: "Hard" },
      { n: 16, title: "Generate Random Point in a Circle", url: "https://leetcode.com/problems/generate-random-point-in-a-circle", difficulty: "Medium" },
      { n: 17, title: "Letter Combinations of a Phone Number", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number", difficulty: "Medium" },
    ],
  },
  {
    day: 3,
    title: "Arrays and DP",
    problems: [
      { n: 18, title: "Can Place Flowers", url: "https://leetcode.com/problems/can-place-flowers", difficulty: "Easy" },
      { n: 19, title: "Maximum Subarray", url: "https://leetcode.com/problems/maximum-subarray", difficulty: "Medium" },
      { n: 20, title: "Maximum Product Subarray", url: "https://leetcode.com/problems/maximum-product-subarray", difficulty: "Medium" },
      { n: 21, title: "Edit Distance", url: "https://leetcode.com/problems/edit-distance", difficulty: "Medium" },
      { n: 22, title: "Decode Ways", url: "https://leetcode.com/problems/decode-ways", difficulty: "Medium" },
      { n: 23, title: "House Robber II", url: "https://leetcode.com/problems/house-robber-ii", difficulty: "Medium" },
      { n: 24, title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals", difficulty: "Medium" },
      { n: 25, title: "Isomorphic Strings", url: "https://leetcode.com/problems/isomorphic-strings", difficulty: "Easy" },
      { n: 26, title: "Max Consecutive Ones III", url: "https://leetcode.com/problems/max-consecutive-ones-iii", difficulty: "Medium" },
      { n: 27, title: "Max Consecutive Ones II", url: "https://leetcode.com/problems/max-consecutive-ones-ii", difficulty: "Medium" },
      { n: 28, title: "Paint House III", url: "https://leetcode.com/problems/paint-house-iii", difficulty: "Hard" },
      { n: 29, title: "Allocate Mailboxes", url: "https://leetcode.com/problems/allocate-mailboxes", difficulty: "Hard" },
      { n: 30, title: "Valid Perfect Square", url: "https://leetcode.com/problems/valid-perfect-square", difficulty: "Easy" },
      { n: 31, title: "Squares of a Sorted Array", url: "https://leetcode.com/problems/squares-of-a-sorted-array", difficulty: "Easy" },
      { n: 32, title: "Valid Parentheses", url: "https://leetcode.com/problems/valid-parentheses", difficulty: "Easy" },
    ],
  },
];

export const LINKEDIN_TOTAL = LINKEDIN_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
