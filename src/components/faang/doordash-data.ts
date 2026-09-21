import type { Section } from "../striver/sheet-types";

export const DOORDASH_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Algorithms",
    problems: [
      { n: 1, title: "Walls and Gates", url: "https://leetcode.com/problems/walls-and-gates", difficulty: "Medium" },
      { n: 2, title: "Shortest Distance from All Buildings", url: "https://leetcode.com/problems/shortest-distance-from-all-buildings", difficulty: "Hard" },
      { n: 3, title: "01 Matrix", url: "https://leetcode.com/problems/01-matrix", difficulty: "Medium" },
      { n: 4, title: "Maximum Profit in Job Scheduling", url: "https://leetcode.com/problems/maximum-profit-in-job-scheduling", difficulty: "Hard" },
      { n: 5, title: "Binary Tree Maximum Path Sum", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum", difficulty: "Hard" },
      { n: 6, title: "Basic Calculator", url: "https://leetcode.com/problems/basic-calculator", difficulty: "Hard" },
      { n: 7, title: "Longest Increasing Path in a Matrix", url: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix", difficulty: "Hard" },
      { n: 8, title: "Koko Eating Bananas", url: "https://leetcode.com/problems/koko-eating-bananas", difficulty: "Medium" },
      { n: 9, title: "Search Suggestions System", url: "https://leetcode.com/problems/search-suggestions-system", difficulty: "Medium" },
      { n: 10, title: "Find K Closest Elements", url: "https://leetcode.com/problems/find-k-closest-elements", difficulty: "Medium" },
      { n: 11, title: "Ways to Make a Fair Array", url: "https://leetcode.com/problems/ways-to-make-a-fair-array", difficulty: "Medium" },
      { n: 12, title: "Check if One String Swap Can Make Strings Equal", url: "https://leetcode.com/problems/check-if-one-string-swap-can-make-strings-equal", difficulty: "Easy" },
      { n: 13, title: "Largest Rectangle in Histogram", url: "https://leetcode.com/problems/largest-rectangle-in-histogram", difficulty: "Hard" },
      { n: 14, title: "Making A Large Island", url: "https://leetcode.com/problems/making-a-large-island", difficulty: "Hard" },
      { n: 15, title: "Design HashMap", url: "https://leetcode.com/problems/design-hashmap", difficulty: "Easy" },
      { n: 16, title: "Jump Game", url: "https://leetcode.com/problems/jump-game", difficulty: "Medium" },
      { n: 17, title: "Longest Common Prefix", url: "https://leetcode.com/problems/longest-common-prefix", difficulty: "Easy" },
    ],
  },
];

export const DOORDASH_TOTAL = DOORDASH_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
