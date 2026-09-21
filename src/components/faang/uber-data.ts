import type { Section } from "../striver/sheet-types";

export const UBER_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Algorithms",
    problems: [
      { n: 1, title: "Maximize Amount After Two Days of Conversions", url: "https://leetcode.com/problems/maximize-amount-after-two-days-of-conversions", difficulty: "Medium" },
      { n: 2, title: "Bus Routes", url: "https://leetcode.com/problems/bus-routes", difficulty: "Hard" },
      { n: 3, title: "Alien Dictionary", url: "https://leetcode.com/problems/alien-dictionary", difficulty: "Hard" },
      { n: 4, title: "Number of Islands II", url: "https://leetcode.com/problems/number-of-islands-ii", difficulty: "Hard" },
      { n: 5, title: "Design Hit Counter", url: "https://leetcode.com/problems/design-hit-counter", difficulty: "Medium" },
      { n: 6, title: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands", difficulty: "Medium" },
      { n: 7, title: "Spiral Matrix", url: "https://leetcode.com/problems/spiral-matrix", difficulty: "Medium" },
      { n: 8, title: "Word Search", url: "https://leetcode.com/problems/word-search", difficulty: "Medium" },
      { n: 9, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 10, title: "Evaluate Division", url: "https://leetcode.com/problems/evaluate-division", difficulty: "Medium" },
      { n: 11, title: "Random Pick with Weight", url: "https://leetcode.com/problems/random-pick-with-weight", difficulty: "Medium" },
      { n: 12, title: "Find Median from Data Stream", url: "https://leetcode.com/problems/find-median-from-data-stream", difficulty: "Hard" },
      { n: 13, title: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals", difficulty: "Medium" },
      { n: 14, title: "Meeting Rooms II", url: "https://leetcode.com/problems/meeting-rooms-ii", difficulty: "Medium" },
      { n: 15, title: "Longest Subarray With Absolute Diff <= Limit", url: "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit", difficulty: "Medium" },
      { n: 16, title: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii", difficulty: "Medium" },
      { n: 17, title: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams", difficulty: "Medium" },
      { n: 18, title: "Kth Smallest Element in a BST", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst", difficulty: "Medium" },
      { n: 19, title: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", difficulty: "Hard" },
      { n: 20, title: "Design Search Autocomplete System", url: "https://leetcode.com/problems/design-search-autocomplete-system", difficulty: "Hard" },
    ],
  },
];

export const UBER_TOTAL = UBER_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
