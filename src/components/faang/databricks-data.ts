import type { Section } from "../striver/sheet-types";

export const DATABRICKS_SECTIONS: Section[] = [
  {
    day: 1,
    title: "Algorithms and Design",
    problems: [
      { n: 1, title: "Capacity To Ship Packages Within D Days", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days", difficulty: "Medium" },
      { n: 2, title: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water", difficulty: "Hard" },
      { n: 3, title: "Max Stack", url: "https://leetcode.com/problems/max-stack", difficulty: "Hard" },
      { n: 4, title: "All O'one Data Structure", url: "https://leetcode.com/problems/all-oone-data-structure", difficulty: "Hard" },
      { n: 5, title: "Word Break", url: "https://leetcode.com/problems/word-break", difficulty: "Medium" },
      { n: 6, title: "Rotting Oranges", url: "https://leetcode.com/problems/rotting-oranges", difficulty: "Medium" },
      { n: 7, title: "All Nodes Distance K in Binary Tree", url: "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree", difficulty: "Medium" },
      { n: 8, title: "Decode String", url: "https://leetcode.com/problems/decode-string", difficulty: "Medium" },
      { n: 9, title: "K Closest Points to Origin", url: "https://leetcode.com/problems/k-closest-points-to-origin", difficulty: "Medium" },
      { n: 10, title: "Asteroid Collision", url: "https://leetcode.com/problems/asteroid-collision", difficulty: "Medium" },
      { n: 11, title: "Design Hit Counter", url: "https://leetcode.com/problems/design-hit-counter", difficulty: "Medium" },
      { n: 12, title: "Time Based Key-Value Store", url: "https://leetcode.com/problems/time-based-key-value-store", difficulty: "Medium" },
      { n: 13, title: "Snapshot Array", url: "https://leetcode.com/problems/snapshot-array", difficulty: "Medium" },
      { n: 14, title: "Find All Anagrams in a String", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string", difficulty: "Medium" },
      { n: 15, title: "Cheapest Flights Within K Stops", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops", difficulty: "Medium" },
      { n: 16, title: "IP to CIDR", url: "https://leetcode.com/problems/ip-to-cidr", difficulty: "Medium" },
      { n: 17, title: "Max Area of Island", url: "https://leetcode.com/problems/max-area-of-island", difficulty: "Medium" },
      { n: 18, title: "House Robber II", url: "https://leetcode.com/problems/house-robber-ii", difficulty: "Medium" },
      { n: 19, title: "Design Tic-Tac-Toe", url: "https://leetcode.com/problems/design-tic-tac-toe", difficulty: "Medium" },
      { n: 20, title: "Top K Frequent Words", url: "https://leetcode.com/problems/top-k-frequent-words", difficulty: "Medium" },
      { n: 21, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 22, title: "Binary Search Tree Iterator", url: "https://leetcode.com/problems/binary-search-tree-iterator", difficulty: "Medium" },
    ],
  },
  {
    day: 2,
    title: "Concurrency",
    problems: [
      { n: 23, title: "Print in Order", url: "https://leetcode.com/problems/print-in-order", difficulty: "Easy" },
      { n: 24, title: "Print FooBar Alternately", url: "https://leetcode.com/problems/print-foobar-alternately", difficulty: "Medium" },
      { n: 25, title: "Building H2O", url: "https://leetcode.com/problems/building-h2o", difficulty: "Medium" },
      { n: 26, title: "The Dining Philosophers", url: "https://leetcode.com/problems/the-dining-philosophers", difficulty: "Medium" },
      { n: 27, title: "Fizz Buzz Multithreaded", url: "https://leetcode.com/problems/fizz-buzz-multithreaded", difficulty: "Medium" },
    ],
  },
];

export const DATABRICKS_TOTAL = DATABRICKS_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
