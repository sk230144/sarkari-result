import type { Section } from "./sheet-types";

export const SHEET_URL =
  "https://takeuforward.org/dsa/strivers-sde-sheet-top-coding-interview-problems";

export const PDF_URL =
  "https://drive.google.com/file/d/1iuol8hev7aoqgSf98lnJtxBZWEpL-7op/view?usp=sharing";

const LC = (slug: string) => `https://leetcode.com/problems/${slug}/`;
const FIND = (t: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${t} Striver SDE Sheet`)}`;

export const DAYS: Section[] = [
  {
    day: 1,
    title: "Arrays",
    problems: [
      { n: 1, title: "Set Matrix Zeroes", url: LC("set-matrix-zeroes") },
      { n: 2, title: "Pascal's Triangle", url: LC("pascals-triangle") },
      { n: 3, title: "Next Permutation", url: LC("next-permutation") },
      { n: 4, title: "Kadane's Algorithm", url: LC("maximum-subarray") },
      { n: 5, title: "Sort 0s, 1s and 2s", url: LC("sort-colors") },
      {
        n: 6,
        title: "Stock Buy and Sell",
        url: LC("best-time-to-buy-and-sell-stock"),
      },
    ],
  },
  {
    day: 2,
    title: "Arrays Part-II",
    problems: [
      { n: 7, title: "Rotate Matrix", url: LC("rotate-image") },
      {
        n: 8,
        title: "Merge Overlapping Subintervals",
        url: LC("merge-intervals"),
      },
      {
        n: 9,
        title: "Merge Two Sorted Arrays Without Extra Space",
        url: LC("merge-sorted-array"),
      },
      {
        n: 10,
        title: "Find the Duplicate in N+1 Integers",
        url: LC("find-the-duplicate-number"),
      },
      {
        n: 11,
        title: "Repeat and Missing Number",
        url: FIND("Repeat and Missing Number"),
        search: true,
      },
      {
        n: 12,
        title: "Inversion of Array",
        url: FIND("Inversion of Array"),
        search: true,
      },
    ],
  },
  {
    day: 3,
    title: "Arrays Part-III",
    problems: [
      { n: 13, title: "Search in a 2D Matrix", url: LC("search-a-2d-matrix") },
      { n: 14, title: "Pow(x, n)", url: LC("powx-n") },
      { n: 15, title: "Majority Element (>N/2)", url: LC("majority-element") },
      {
        n: 16,
        title: "Majority Element (>N/3)",
        url: LC("majority-element-ii"),
      },
      { n: 17, title: "Grid Unique Paths", url: LC("unique-paths") },
      { n: 18, title: "Reverse Pairs", url: LC("reverse-pairs") },
    ],
  },
  {
    day: 4,
    title: "Arrays Part-IV",
    problems: [
      { n: 19, title: "2-Sum", url: LC("two-sum") },
      { n: 20, title: "4-Sum", url: LC("4sum") },
      {
        n: 21,
        title: "Longest Consecutive Sequence",
        url: LC("longest-consecutive-sequence"),
      },
      {
        n: 22,
        title: "Largest Subarray with 0 Sum",
        url: FIND("Largest Subarray with 0 Sum"),
        search: true,
      },
      {
        n: 23,
        title: "Count Subarrays with XOR K",
        url: FIND("Count Subarrays with XOR K"),
        search: true,
      },
      {
        n: 24,
        title: "Longest Substring Without Repeat",
        url: LC("longest-substring-without-repeating-characters"),
      },
    ],
  },
  {
    day: 5,
    title: "Linked List",
    problems: [
      { n: 25, title: "Reverse a LinkedList", url: LC("reverse-linked-list") },
      {
        n: 26,
        title: "Middle of LinkedList",
        url: LC("middle-of-the-linked-list"),
      },
      {
        n: 27,
        title: "Merge Two Sorted Linked Lists",
        url: LC("merge-two-sorted-lists"),
      },
      {
        n: 28,
        title: "Remove N-th Node from Back",
        url: LC("remove-nth-node-from-end-of-list"),
      },
      { n: 29, title: "Add Two Numbers", url: LC("add-two-numbers") },
      {
        n: 30,
        title: "Delete a Given Node",
        url: LC("delete-node-in-a-linked-list"),
      },
    ],
  },
  {
    day: 6,
    title: "Linked List Part-II",
    problems: [
      {
        n: 31,
        title: "Intersection of Y LinkedList",
        url: LC("intersection-of-two-linked-lists"),
      },
      { n: 32, title: "Detect Cycle", url: LC("linked-list-cycle") },
      {
        n: 33,
        title: "Reverse in Groups of K",
        url: LC("reverse-nodes-in-k-group"),
      },
      {
        n: 34,
        title: "Palindrome Linked List",
        url: LC("palindrome-linked-list"),
      },
      {
        n: 35,
        title: "Starting Point of Loop",
        url: LC("linked-list-cycle-ii"),
      },
      {
        n: 36,
        title: "Flattening a LinkedList",
        url: FIND("Flattening a LinkedList"),
        search: true,
      },
    ],
  },
  {
    day: 7,
    title: "Linked List and Arrays",
    problems: [
      { n: 37, title: "Rotate a LinkedList", url: LC("rotate-list") },
      {
        n: 38,
        title: "Clone LL with Random Pointer",
        url: LC("copy-list-with-random-pointer"),
      },
      { n: 39, title: "3 Sum", url: LC("3sum") },
      { n: 40, title: "Trapping Rainwater", url: LC("trapping-rain-water") },
      {
        n: 41,
        title: "Remove Duplicates from Sorted Array",
        url: LC("remove-duplicates-from-sorted-array"),
      },
      {
        n: 42,
        title: "Max Consecutive Ones",
        url: LC("max-consecutive-ones"),
      },
    ],
  },
  {
    day: 8,
    title: "Greedy",
    problems: [
      {
        n: 43,
        title: "N Meetings in One Room",
        url: FIND("N Meetings in One Room"),
        search: true,
      },
      {
        n: 44,
        title: "Minimum Number of Platforms",
        url: FIND("Minimum Number of Platforms"),
        search: true,
      },
      {
        n: 45,
        title: "Job Sequencing",
        url: FIND("Job Sequencing"),
        search: true,
      },
      {
        n: 46,
        title: "Fractional Knapsack",
        url: FIND("Fractional Knapsack"),
        search: true,
      },
      {
        n: 47,
        title: "Minimum Number of Coins",
        url: FIND("Minimum Number of Coins"),
        search: true,
      },
      {
        n: 48,
        title: "Activity Selection",
        url: FIND("Activity Selection"),
        search: true,
      },
    ],
  },
  {
    day: 9,
    title: "Recursion",
    problems: [
      { n: 49, title: "Subset Sums", url: FIND("Subset Sums"), search: true },
      { n: 50, title: "Subset-II", url: LC("subsets-ii") },
      { n: 51, title: "Combination Sum-1", url: LC("combination-sum") },
      { n: 52, title: "Combination Sum-2", url: LC("combination-sum-ii") },
      {
        n: 53,
        title: "Palindrome Partitioning",
        url: LC("palindrome-partitioning"),
      },
      {
        n: 54,
        title: "K-th Permutation Sequence",
        url: LC("permutation-sequence"),
      },
    ],
  },
  {
    day: 10,
    title: "Recursion and Backtracking",
    problems: [
      { n: 55, title: "Print All Permutations", url: LC("permutations") },
      { n: 56, title: "N Queens", url: LC("n-queens") },
      { n: 57, title: "Sudoku Solver", url: LC("sudoku-solver") },
      {
        n: 58,
        title: "M Coloring Problem",
        url: FIND("M Coloring Problem"),
        search: true,
      },
      {
        n: 59,
        title: "Rat in a Maze",
        url: FIND("Rat in a Maze"),
        search: true,
      },
      { n: 60, title: "Word Break", url: LC("word-break") },
    ],
  },
  {
    day: 11,
    title: "Binary Search",
    problems: [
      {
        n: 61,
        title: "N-th Root of an Integer",
        url: FIND("N-th Root of an Integer"),
        search: true,
      },
      {
        n: 62,
        title: "Matrix Median",
        url: FIND("Matrix Median"),
        search: true,
      },
      {
        n: 63,
        title: "Single Element in Sorted Array",
        url: LC("single-element-in-a-sorted-array"),
      },
      {
        n: 64,
        title: "Search in Rotated Sorted Array",
        url: LC("search-in-rotated-sorted-array"),
      },
      {
        n: 65,
        title: "Median of 2 Sorted Arrays",
        url: LC("median-of-two-sorted-arrays"),
      },
      {
        n: 66,
        title: "K-th Element of Two Sorted Arrays",
        url: FIND("K-th Element of Two Sorted Arrays"),
        search: true,
      },
      {
        n: 67,
        title: "Allocate Minimum Number of Pages",
        url: FIND("Allocate Minimum Number of Pages"),
        search: true,
      },
      {
        n: 68,
        title: "Aggressive Cows",
        url: FIND("Aggressive Cows"),
        search: true,
      },
    ],
  },
  {
    day: 12,
    title: "Heaps",
    problems: [
      {
        n: 69,
        title: "Max Heap / Min Heap Implementation",
        url: FIND("Max Heap / Min Heap Implementation"),
        search: true,
      },
      {
        n: 70,
        title: "Kth Largest Element",
        url: LC("kth-largest-element-in-an-array"),
      },
      {
        n: 71,
        title: "Maximum Sum Combination",
        url: FIND("Maximum Sum Combination"),
        search: true,
      },
      {
        n: 72,
        title: "Find Median from Data Stream",
        url: LC("find-median-from-data-stream"),
      },
      {
        n: 73,
        title: "Merge K Sorted Arrays",
        url: FIND("Merge K Sorted Arrays"),
        search: true,
      },
      {
        n: 74,
        title: "K Most Frequent Elements",
        url: LC("top-k-frequent-elements"),
      },
    ],
  },
  {
    day: 13,
    title: "Stack and Queue",
    problems: [
      {
        n: 75,
        title: "Implement Stack Using Arrays",
        url: FIND("Implement Stack Using Arrays"),
        search: true,
      },
      {
        n: 76,
        title: "Implement Queue Using Arrays",
        url: FIND("Implement Queue Using Arrays"),
        search: true,
      },
      {
        n: 77,
        title: "Implement Stack using Queue",
        url: LC("implement-stack-using-queues"),
      },
      {
        n: 78,
        title: "Implement Queue using Stack",
        url: LC("implement-queue-using-stacks"),
      },
      { n: 79, title: "Balanced Parentheses", url: LC("valid-parentheses") },
      {
        n: 80,
        title: "Next Greater Element",
        url: LC("next-greater-element-i"),
      },
      { n: 81, title: "Sort a Stack", url: FIND("Sort a Stack"), search: true },
    ],
  },
  {
    day: 14,
    title: "Stack and Queue Part-II",
    problems: [
      {
        n: 82,
        title: "Next Smaller Element",
        url: FIND("Next Smaller Element"),
        search: true,
      },
      { n: 83, title: "LRU Cache", url: LC("lru-cache") },
      { n: 84, title: "LFU Cache", url: LC("lfu-cache") },
      {
        n: 85,
        title: "Largest Rectangle in Histogram",
        url: LC("largest-rectangle-in-histogram"),
      },
      {
        n: 86,
        title: "Sliding Window Maximum",
        url: LC("sliding-window-maximum"),
      },
      { n: 87, title: "Min Stack", url: LC("min-stack") },
      { n: 88, title: "Rotten Oranges", url: LC("rotting-oranges") },
      {
        n: 89,
        title: "Stock Span Problem",
        url: FIND("Stock Span Problem"),
        search: true,
      },
      {
        n: 90,
        title: "Maximum of Minimums of Every Window Size",
        url: FIND("Maximum of Minimums of Every Window Size"),
        search: true,
      },
      {
        n: 91,
        title: "Celebrity Problem",
        url: FIND("Celebrity Problem"),
        search: true,
      },
    ],
  },
  {
    day: 15,
    title: "String",
    problems: [
      { n: 92, title: "Reverse Words", url: LC("reverse-words-in-a-string") },
      {
        n: 93,
        title: "Longest Palindrome",
        url: LC("longest-palindromic-substring"),
      },
      { n: 94, title: "Roman Number to Integer", url: LC("roman-to-integer") },
      { n: 95, title: "ATOI / STRSTR", url: LC("string-to-integer-atoi") },
      {
        n: 96,
        title: "Longest Common Prefix",
        url: LC("longest-common-prefix"),
      },
      { n: 97, title: "Rabin Karp", url: FIND("Rabin Karp"), search: true },
    ],
  },
  {
    day: 16,
    title: "String Part-II",
    problems: [
      { n: 98, title: "Z-Function", url: FIND("Z-Function"), search: true },
      {
        n: 99,
        title: "KMP / LPS Array",
        url: FIND("KMP / LPS Array"),
        search: true,
      },
      {
        n: 100,
        title: "Minimum Characters to Make String Palindromic",
        url: FIND("Minimum Characters to Make String Palindromic"),
        search: true,
      },
      { n: 101, title: "Check for Anagrams", url: LC("valid-anagram") },
      { n: 102, title: "Count and Say", url: LC("count-and-say") },
      {
        n: 103,
        title: "Compare Version Numbers",
        url: LC("compare-version-numbers"),
      },
    ],
  },
  {
    day: 17,
    title: "Binary Tree",
    problems: [
      {
        n: 104,
        title: "Inorder Traversal",
        url: LC("binary-tree-inorder-traversal"),
      },
      {
        n: 105,
        title: "Preorder Traversal",
        url: LC("binary-tree-preorder-traversal"),
      },
      {
        n: 106,
        title: "Postorder Traversal",
        url: LC("binary-tree-postorder-traversal"),
      },
      {
        n: 107,
        title: "Morris Inorder Traversal",
        url: FIND("Morris Inorder Traversal"),
        search: true,
      },
      {
        n: 108,
        title: "Morris Preorder Traversal",
        url: FIND("Morris Preorder Traversal"),
        search: true,
      },
      { n: 109, title: "Left View", url: FIND("Left View"), search: true },
      { n: 110, title: "Bottom View", url: FIND("Bottom View"), search: true },
      { n: 111, title: "Top View", url: FIND("Top View"), search: true },
      {
        n: 112,
        title: "Pre/In/Post in a Single Traversal",
        url: FIND("Pre/In/Post in a Single Traversal"),
        search: true,
      },
      {
        n: 113,
        title: "Vertical Order Traversal",
        url: FIND("Vertical Order Traversal"),
        search: true,
      },
      {
        n: 114,
        title: "Root to Node Path",
        url: FIND("Root to Node Path"),
        search: true,
      },
      {
        n: 115,
        title: "Maximum Width",
        url: LC("maximum-width-of-binary-tree"),
      },
    ],
  },
  {
    day: 18,
    title: "Binary Tree Part-II",
    problems: [
      {
        n: 116,
        title: "Level Order Traversal",
        url: LC("binary-tree-level-order-traversal"),
      },
      { n: 117, title: "Height", url: LC("maximum-depth-of-binary-tree") },
      { n: 118, title: "Diameter", url: LC("diameter-of-binary-tree") },
      { n: 119, title: "Height-Balanced Tree", url: LC("balanced-binary-tree") },
      {
        n: 120,
        title: "LCA",
        url: LC("lowest-common-ancestor-of-a-binary-tree"),
      },
      { n: 121, title: "Identical Trees", url: LC("same-tree") },
      {
        n: 122,
        title: "Zig Zag Traversal",
        url: LC("binary-tree-zigzag-level-order-traversal"),
      },
      {
        n: 123,
        title: "Boundary Traversal",
        url: FIND("Boundary Traversal"),
        search: true,
      },
    ],
  },
  {
    day: 19,
    title: "Binary Tree Part-III",
    problems: [
      {
        n: 124,
        title: "Maximum Path Sum",
        url: LC("binary-tree-maximum-path-sum"),
      },
      {
        n: 125,
        title: "Construct from Inorder and Preorder",
        url: LC("construct-binary-tree-from-preorder-and-inorder-traversal"),
      },
      {
        n: 126,
        title: "Construct from Inorder and Postorder",
        url: LC("construct-binary-tree-from-inorder-and-postorder-traversal"),
      },
      { n: 127, title: "Symmetric Tree", url: LC("symmetric-tree") },
      {
        n: 128,
        title: "Flatten Binary Tree",
        url: LC("flatten-binary-tree-to-linked-list"),
      },
      {
        n: 129,
        title: "Mirror of Itself",
        url: FIND("Mirror of Itself"),
        search: true,
      },
      {
        n: 130,
        title: "Children Sum Property",
        url: FIND("Children Sum Property"),
        search: true,
      },
    ],
  },
  {
    day: 20,
    title: "Binary Search Tree",
    problems: [
      {
        n: 131,
        title: "Populate Next Right Pointers",
        url: LC("populating-next-right-pointers-in-each-node"),
      },
      {
        n: 132,
        title: "Search Key in BST",
        url: LC("search-in-a-binary-search-tree"),
      },
      {
        n: 133,
        title: "Construct BST from Given Keys",
        url: FIND("Construct BST from Given Keys"),
        search: true,
      },
      {
        n: 134,
        title: "Construct BST from Preorder",
        url: FIND("Construct BST from Preorder"),
        search: true,
      },
      {
        n: 135,
        title: "Check if Tree is BST",
        url: LC("validate-binary-search-tree"),
      },
      {
        n: 136,
        title: "LCA in BST",
        url: LC("lowest-common-ancestor-of-a-binary-search-tree"),
      },
      {
        n: 137,
        title: "Inorder Predecessor / Successor",
        url: FIND("Inorder Predecessor / Successor"),
        search: true,
      },
    ],
  },
  {
    day: 21,
    title: "Binary Search Tree Part-II",
    problems: [
      { n: 138, title: "Floor in BST", url: FIND("Floor in BST"), search: true },
      { n: 139, title: "Ceil in BST", url: FIND("Ceil in BST"), search: true },
      {
        n: 140,
        title: "K-th Smallest in BST",
        url: LC("kth-smallest-element-in-a-bst"),
      },
      {
        n: 141,
        title: "K-th Largest in BST",
        url: FIND("K-th Largest in BST"),
        search: true,
      },
      {
        n: 142,
        title: "Pair with Given Sum in BST",
        url: LC("two-sum-iv-input-is-a-bst"),
      },
      { n: 143, title: "BST Iterator", url: LC("binary-search-tree-iterator") },
      {
        n: 144,
        title: "Size of Largest BST in Binary Tree",
        url: FIND("Size of Largest BST in Binary Tree"),
        search: true,
      },
      {
        n: 145,
        title: "Serialize and Deserialize Binary Tree",
        url: LC("serialize-and-deserialize-binary-tree"),
      },
    ],
  },
  {
    day: 22,
    title: "Binary Trees [Misc]",
    problems: [
      {
        n: 146,
        title: "Binary Tree to Doubly Linked List",
        url: FIND("Binary Tree to Doubly Linked List"),
        search: true,
      },
      {
        n: 147,
        title: "Median in a Stream",
        url: FIND("Median in a Stream"),
        search: true,
      },
      {
        n: 148,
        title: "K-th Largest in a Stream",
        url: LC("kth-largest-element-in-a-stream"),
      },
      {
        n: 149,
        title: "Distinct Numbers in Window",
        url: FIND("Distinct Numbers in Window"),
        search: true,
      },
      {
        n: 150,
        title: "K-th Largest in Unsorted Array",
        url: LC("kth-largest-element-in-an-array"),
      },
      { n: 151, title: "Flood Fill", url: LC("flood-fill") },
    ],
  },
  {
    day: 23,
    title: "Graph",
    problems: [
      { n: 152, title: "Clone Graph", url: LC("clone-graph") },
      { n: 153, title: "DFS", url: FIND("DFS"), search: true },
      { n: 154, title: "BFS", url: FIND("BFS"), search: true },
      {
        n: 155,
        title: "Cycle in Undirected Graph (BFS)",
        url: FIND("Cycle in Undirected Graph (BFS)"),
        search: true,
      },
      {
        n: 156,
        title: "Cycle in Undirected Graph (DFS)",
        url: FIND("Cycle in Undirected Graph (DFS)"),
        search: true,
      },
      {
        n: 157,
        title: "Cycle in Directed Graph (DFS)",
        url: FIND("Cycle in Directed Graph (DFS)"),
        search: true,
      },
      {
        n: 158,
        title: "Cycle in Directed Graph (BFS)",
        url: FIND("Cycle in Directed Graph (BFS)"),
        search: true,
      },
      {
        n: 159,
        title: "Topological Sort (BFS)",
        url: FIND("Topological Sort (BFS)"),
        search: true,
      },
      {
        n: 160,
        title: "Topological Sort (DFS)",
        url: FIND("Topological Sort (DFS)"),
        search: true,
      },
      { n: 161, title: "Number of Islands", url: LC("number-of-islands") },
      {
        n: 162,
        title: "Bipartite Check (BFS)",
        url: LC("is-graph-bipartite"),
      },
      {
        n: 163,
        title: "Bipartite Check (DFS)",
        url: LC("is-graph-bipartite"),
      },
    ],
  },
  {
    day: 24,
    title: "Graph Part-II",
    problems: [
      {
        n: 164,
        title: "SCC using Kosaraju",
        url: FIND("SCC using Kosaraju"),
        search: true,
      },
      { n: 165, title: "Dijkstra", url: FIND("Dijkstra"), search: true },
      { n: 166, title: "Bellman-Ford", url: FIND("Bellman-Ford"), search: true },
      {
        n: 167,
        title: "Floyd Warshall",
        url: FIND("Floyd Warshall"),
        search: true,
      },
      {
        n: 168,
        title: "MST using Prim",
        url: FIND("MST using Prim"),
        search: true,
      },
      {
        n: 169,
        title: "MST using Kruskal",
        url: FIND("MST using Kruskal"),
        search: true,
      },
    ],
  },
  {
    day: 25,
    title: "Dynamic Programming",
    problems: [
      {
        n: 170,
        title: "Maximum Product Subarray",
        url: LC("maximum-product-subarray"),
      },
      {
        n: 171,
        title: "Longest Increasing Subsequence",
        url: LC("longest-increasing-subsequence"),
      },
      {
        n: 172,
        title: "Longest Common Subsequence",
        url: LC("longest-common-subsequence"),
      },
      { n: 173, title: "0-1 Knapsack", url: FIND("0-1 Knapsack"), search: true },
      { n: 174, title: "Edit Distance", url: LC("edit-distance") },
      {
        n: 175,
        title: "Maximum Sum Increasing Subsequence",
        url: FIND("Maximum Sum Increasing Subsequence"),
        search: true,
      },
      {
        n: 176,
        title: "Matrix Chain Multiplication",
        url: FIND("Matrix Chain Multiplication"),
        search: true,
      },
    ],
  },
  {
    day: 26,
    title: "Dynamic Programming Part-II",
    problems: [
      { n: 177, title: "Minimum Sum Path", url: LC("minimum-path-sum") },
      { n: 178, title: "Coin Change", url: LC("coin-change") },
      { n: 179, title: "Subset Sum", url: FIND("Subset Sum"), search: true },
      { n: 180, title: "Rod Cutting", url: FIND("Rod Cutting"), search: true },
      { n: 181, title: "Egg Dropping", url: FIND("Egg Dropping"), search: true },
      { n: 182, title: "Word Break", url: LC("word-break") },
      {
        n: 183,
        title: "Palindrome Partitioning (MCM Variation)",
        url: FIND("Palindrome Partitioning (MCM Variation)"),
        search: true,
      },
      {
        n: 184,
        title: "Maximum Profit in Job Scheduling",
        url: LC("maximum-profit-in-job-scheduling"),
      },
    ],
  },
  {
    day: 27,
    title: "Trie",
    problems: [
      { n: 185, title: "Implement Trie", url: LC("implement-trie-prefix-tree") },
      {
        n: 186,
        title: "Implement Trie-2",
        url: FIND("Implement Trie-2"),
        search: true,
      },
      {
        n: 187,
        title: "Longest String with All Prefixes",
        url: FIND("Longest String with All Prefixes"),
        search: true,
      },
      {
        n: 188,
        title: "Number of Distinct Substrings",
        url: FIND("Number of Distinct Substrings"),
        search: true,
      },
      { n: 189, title: "Power Set", url: LC("subsets") },
      {
        n: 190,
        title: "Maximum XOR of Two Numbers in an Array",
        url: FIND("Maximum XOR of Two Numbers in an Array"),
        search: true,
      },
      {
        n: 191,
        title: "Maximum XOR With an Element From Array",
        url: FIND("Maximum XOR With an Element From Array"),
        search: true,
      },
    ],
  },
];

export const TOTAL = DAYS.reduce((n, d) => n + d.problems.length, 0);
