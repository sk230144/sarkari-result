import type { Section } from "../striver/sheet-types";

export const OPENAI_SECTIONS: Section[] = [
  {
    day: 1,
    title: "LeetCode-Equivalent Problems",
    problems: [
      { n: 1, title: "LRU Cache", url: "https://leetcode.com/problems/lru-cache", difficulty: "Medium" },
      { n: 2, title: "Time Based Key-Value Store", url: "https://leetcode.com/problems/time-based-key-value-store", difficulty: "Medium" },
      { n: 3, title: "Snapshot Array", url: "https://leetcode.com/problems/snapshot-array", difficulty: "Medium" },
      { n: 4, title: "Alien Dictionary", url: "https://leetcode.com/problems/alien-dictionary", difficulty: "Hard" },
      { n: 5, title: "Web Crawler Multithreaded", url: "https://leetcode.com/problems/web-crawler-multithreaded", difficulty: "Medium" },
      { n: 6, title: "LFU Cache", url: "https://leetcode.com/problems/lfu-cache", difficulty: "Hard" },
      { n: 7, title: "Design Memory Allocator", url: "https://leetcode.com/problems/design-memory-allocator", difficulty: "Medium" },
      { n: 8, title: "Game of Life", url: "https://leetcode.com/problems/game-of-life", difficulty: "Medium" },
      { n: 9, title: "Meeting Rooms II", url: "https://leetcode.com/problems/meeting-rooms-ii", difficulty: "Medium" },
      { n: 10, title: "Encode and Decode Strings", url: "https://leetcode.com/problems/encode-and-decode-strings", difficulty: "Medium" },
      { n: 11, title: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree", difficulty: "Hard" },
      { n: 12, title: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements", difficulty: "Medium" },
      { n: 13, title: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii", difficulty: "Medium" },
      { n: 14, title: "Decode String", url: "https://leetcode.com/problems/decode-string", difficulty: "Medium" },
      { n: 15, title: "Word Ladder", url: "https://leetcode.com/problems/word-ladder", difficulty: "Hard" },
    ],
  },
];

export const OPENAI_TOTAL = OPENAI_SECTIONS.reduce(
  (n, s) => n + s.problems.length,
  0,
);
