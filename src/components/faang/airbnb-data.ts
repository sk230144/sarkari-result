import type { Section } from "../striver/sheet-types";

export const AIRBNB_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Algorithms",
    problems: [
      { n: 1, title: "Text Justification", url: "https://leetcode.com/problems/text-justification", difficulty: "Hard" },
      { n: 2, title: "Maximum Profit in Job Scheduling", url: "https://leetcode.com/problems/maximum-profit-in-job-scheduling", difficulty: "Hard" },
      { n: 3, title: "Palindrome Pairs", url: "https://leetcode.com/problems/palindrome-pairs", difficulty: "Hard" },
      { n: 4, title: "Flatten 2D Vector", url: "https://leetcode.com/problems/flatten-2d-vector", difficulty: "Medium" },
      { n: 5, title: "Combination Sum", url: "https://leetcode.com/problems/combination-sum", difficulty: "Medium" },
      { n: 6, title: "Smallest Common Region", url: "https://leetcode.com/problems/smallest-common-region", difficulty: "Medium" },
      { n: 7, title: "Maximum Candies You Can Get from Boxes", url: "https://leetcode.com/problems/maximum-candies-you-can-get-from-boxes", difficulty: "Hard" },
      { n: 8, title: "Pour Water", url: "https://leetcode.com/problems/pour-water", difficulty: "Medium" },
      { n: 9, title: "Alien Dictionary", url: "https://leetcode.com/problems/alien-dictionary", difficulty: "Hard" },
      { n: 10, title: "Cheapest Flights Within K Stops", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops", difficulty: "Medium" },
      { n: 11, title: "Sliding Puzzle", url: "https://leetcode.com/problems/sliding-puzzle", difficulty: "Hard" },
      { n: 12, title: "Design Excel Sum Formula", url: "https://leetcode.com/problems/design-excel-sum-formula", difficulty: "Hard" },
      { n: 13, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water", difficulty: "Hard" },
      { n: 14, title: "IP to CIDR", url: "https://leetcode.com/problems/ip-to-cidr", difficulty: "Medium" },
      { n: 15, title: "Employee Free Time", url: "https://leetcode.com/problems/employee-free-time", difficulty: "Hard" },
      { n: 16, title: "Simple Bank System", url: "https://leetcode.com/problems/simple-bank-system", difficulty: "Medium" },
      { n: 17, title: "Word Search II", url: "https://leetcode.com/problems/word-search-ii", difficulty: "Hard" },
      { n: 18, title: "Mini Parser", url: "https://leetcode.com/problems/mini-parser", difficulty: "Medium" },
      { n: 19, title: "Regular Expression Matching", url: "https://leetcode.com/problems/regular-expression-matching", difficulty: "Hard" },
    ],
  },
];

export const AIRBNB_TOTAL = AIRBNB_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
