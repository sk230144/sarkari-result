import type { Motif } from "./card-watermark";

export type Level = "HLD" | "LLD";

export type Question = {
  slug: string;
  title: string;
  level: Level;
  description: string;
  keyPoints: string[];
  concepts: string[];
  companies: string[];
  /** Reference write-up. Required — a question without a source isn't listed. */
  article: string;
  /** Card tint — cycles through the palette from the design. */
  theme: Theme;
  /** Decorative line-art bleeding off the card's corner. */
  motif: Motif;
};

export type Theme =
  | "blue"
  | "amber"
  | "green"
  | "rose"
  | "slate"
  | "violet"
  | "teal"
  | "emerald";

export const THEMES: Record<
  Theme,
  { card: string; border: string; title: string; body: string; chip: string }
> = {
  blue: {
    card: "bg-[#13243d]",
    border: "border-[#1e3557]",
    title: "text-[#bfdbfe]",
    body: "text-[#93b4d8]",
    chip: "bg-[#0f1c30] text-[#9fc0e4]",
  },
  amber: {
    card: "bg-[#33240d]",
    border: "border-[#4a3614]",
    title: "text-[#fde3a7]",
    body: "text-[#d4b483]",
    chip: "bg-[#291c09] text-[#dcbd8a]",
  },
  green: {
    card: "bg-[#0f2b21]",
    border: "border-[#1b4233]",
    title: "text-[#bbf7d0]",
    body: "text-[#8fc9ab]",
    chip: "bg-[#0b2019] text-[#9ad4b6]",
  },
  rose: {
    card: "bg-[#361525]",
    border: "border-[#4d2035]",
    title: "text-[#fbcfe8]",
    body: "text-[#d39cb8]",
    chip: "bg-[#2a0f1c] text-[#dda9c3]",
  },
  slate: {
    card: "bg-[#1a1d21]",
    border: "border-[#2a2f35]",
    title: "text-[#e2e8f0]",
    body: "text-[#9aa5b1]",
    chip: "bg-[#141619] text-[#a8b2bd]",
  },
  violet: {
    card: "bg-[#2a1640]",
    border: "border-[#3d2159]",
    title: "text-[#ddd0fb]",
    body: "text-[#b49ede]",
    chip: "bg-[#200f32] text-[#c3aae8]",
  },
  teal: {
    card: "bg-[#0d2a33]",
    border: "border-[#17414e]",
    title: "text-[#b6ecf5]",
    body: "text-[#88bfcb]",
    chip: "bg-[#091f26] text-[#96cbd7]",
  },
  emerald: {
    card: "bg-[#0c2d1c]",
    border: "border-[#17462c]",
    title: "text-[#b3f0cd]",
    body: "text-[#86c6a2]",
    chip: "bg-[#082216] text-[#93d3af]",
  },
};

export const QUESTIONS: Question[] = [
  {
    slug: "rate-limiter",
    title: "Design a Rate Limiter",
    level: "HLD",
    description:
      "A rate limiter throttles the number of requests a client, user, or IP can send to a service within a time window, protecting backend systems from abuse and accidental overload.",
    keyPoints: [
      "Compare token bucket, leaky bucket and sliding window counters",
      "Where the limiter lives: client, gateway, or per-service middleware",
      "Distributed counters in Redis and the race conditions they invite",
      "What to return on rejection: 429, Retry-After, and backoff guidance",
    ],
    concepts: ["Throttling", "Redis", "Distributed counters", "API gateway"],
    companies: ["Stripe", "Uber", "Amazon", "Google", "Cloudflare", "Twitter/X"],
    article:
      "https://bytebytego.com/courses/system-design-interview/design-a-rate-limiter",
    theme: "blue",
    motif: "gauge",
  },
  {
    slug: "tinyurl",
    title: "Design TinyURL",
    level: "HLD",
    description:
      "TinyURL converts long URLs into short, unique aliases that redirect back to the original when visited. The core design challenge isn't storage. It's generating short keys that never collide, at scale.",
    keyPoints: [
      "Key generation: base62 counters vs hashing vs pre-generated key pools",
      "Read-heavy workload, so caching the hot alias set matters most",
      "301 vs 302 redirects and what each does to your analytics",
      "Custom aliases, expiry, and reclaiming dead keys",
    ],
    concepts: ["Base62 encoding", "Hashing", "Caching", "Key-value store"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Bitly", "Uber"],
    article:
      "https://bytebytego.com/courses/system-design-interview/design-a-url-shortener",
    theme: "amber",
    motif: "link",
  },
  {
    slug: "twitter",
    title: "Design Twitter",
    level: "HLD",
    description:
      "Twitter is a social platform for posting short messages (tweets) and following other users to see their posts in a personalized, roughly-chronological timeline.",
    keyPoints: [
      "Fan-out on write vs fan-out on read, and the celebrity problem",
      "Timeline caching and how far back to materialize",
      "Storing the social graph and querying followers efficiently",
      "Eventual consistency: how stale is an acceptable timeline?",
    ],
    concepts: ["Fan-out", "Timeline generation", "Social graph", "Sharding"],
    companies: ["Meta", "Twitter/X", "Uber", "Microsoft", "LinkedIn", "Google"],
    article:
      "https://www.geeksforgeeks.org/interview-experiences/design-twitter-a-system-design-interview-question/",
    theme: "green",
    motif: "bird",
  },
  {
    slug: "youtube",
    title: "Design YouTube",
    level: "HLD",
    description:
      "YouTube lets users upload, store, and stream video at massive scale to a global audience on wildly varying network conditions and devices. The hard parts are ingestion and delivery.",
    keyPoints: [
      "Upload pipeline: chunked upload, transcoding queue, multiple renditions",
      "Adaptive bitrate streaming and why HLS/DASH exist",
      "CDN placement and cache warming for viral content",
      "Metadata storage separate from blob storage",
    ],
    concepts: ["CDN", "Transcoding", "Blob storage", "Adaptive bitrate"],
    companies: ["Google", "Netflix", "Amazon", "Meta", "Disney+", "Hotstar"],
    article:
      "https://bytebytego.com/courses/system-design-interview/design-youtube",
    theme: "rose",
    motif: "play",
  },
  {
    slug: "google-drive",
    title: "Design Google Drive",
    level: "HLD",
    description:
      "Google Drive stores files in the cloud, syncs them across a user's devices, and supports sharing and collaboration. The core design challenges are efficient sync and conflict resolution.",
    keyPoints: [
      "Chunking files and deduplicating blocks to cut bandwidth",
      "Delta sync: transferring only what changed",
      "Conflict resolution when two devices edit while offline",
      "Permission model for sharing, and how it's evaluated at read time",
    ],
    concepts: ["Block storage", "Delta sync", "Deduplication", "ACLs"],
    companies: ["Google", "Dropbox", "Microsoft", "Amazon", "Apple", "Box"],
    article:
      "https://dilipkumar.medium.com/google-drive-system-design-ecc4ac5e8015",
    theme: "slate",
    motif: "cloud",
  },
  {
    slug: "google-maps",
    title: "Design Google Maps",
    level: "HLD",
    description:
      "Google Maps provides map rendering, location search, and turn-by-turn routing across a global road network, updated with live traffic.",
    keyPoints: [
      "Geospatial indexing with quadtrees, geohashes or S2 cells",
      "Map tiles: pre-rendering, zoom levels, and CDN delivery",
      "Shortest-path routing at scale — why plain Dijkstra isn't enough",
      "Ingesting live traffic from user devices to reweight edges",
    ],
    concepts: ["Geohashing", "Quadtree", "Graph algorithms", "Map tiles"],
    companies: ["Google", "Uber", "Grab", "Apple", "Ola", "Lyft"],
    article:
      "https://medium.com/@jyoti1308/designing-google-maps-d9865c3506ba",
    theme: "violet",
    motif: "pin",
  },
  {
    slug: "key-value-store",
    title: "Design a Key-Value Store",
    level: "HLD",
    description:
      "A distributed key-value store (like DynamoDB or Cassandra) provides simple get/put access to data but must remain available and performant across many machines and failures.",
    keyPoints: [
      "Consistent hashing for partitioning and minimal reshuffling",
      "Replication factor with quorum reads and writes (R + W > N)",
      "Conflict resolution via vector clocks or last-write-wins",
      "Gossip protocol for failure detection and membership",
    ],
    concepts: ["Consistent hashing", "Quorum", "Vector clocks", "CAP theorem"],
    companies: ["Amazon", "Google", "Microsoft", "Uber", "Netflix", "Meta"],
    article:
      "https://bytebytego.com/courses/system-design-interview/design-a-key-value-store",
    theme: "teal",
    motif: "database",
  },
  {
    slug: "message-queue",
    title: "Design a Distributed Message Queue",
    level: "HLD",
    description:
      "A message queue (like Kafka or RabbitMQ) decouples producers and consumers of data, letting services communicate asynchronously and absorb bursts without dropping work.",
    keyPoints: [
      "Partitioned logs, offsets, and ordering guarantees within a partition",
      "At-most-once vs at-least-once vs exactly-once delivery",
      "Consumer groups and rebalancing when a consumer dies",
      "Retention, replay, and dead-letter queues for poison messages",
    ],
    concepts: ["Pub/sub", "Partitioning", "Offsets", "Delivery semantics"],
    companies: ["Amazon", "LinkedIn", "Uber", "Confluent", "Meta", "Netflix"],
    article:
      "https://medium.com/@athicharttangpong/system-design-interview-distributed-message-queue-374230ee0267",
    theme: "emerald",
    motif: "queue",
  },
  {
    slug: "news-feed",
    title: "Design a News Feed System",
    level: "HLD",
    description:
      "A news feed aggregates and ranks content from many sources a user follows into a single, personalized, scrollable stream. Beyond the fan-out problem sits the ranking problem.",
    keyPoints: [
      "Push vs pull feed construction and the hybrid most systems land on",
      "Ranking signals and where the ML scoring step fits in the request path",
      "Pagination that stays stable while new content arrives",
      "Caching the rendered feed vs caching its ingredients",
    ],
    concepts: ["Fan-out", "Ranking", "Cursor pagination", "Cache invalidation"],
    companies: ["Meta", "LinkedIn", "Twitter/X", "Instagram", "TikTok", "Reddit"],
    article:
      "https://medium.com/@interviewready/high-level-design-for-instagram-news-feed-423773d790f8",
    theme: "amber",
    motif: "feed",
  },
  {
    slug: "google-docs",
    title: "Design Google Docs",
    level: "HLD",
    description:
      "Google Docs is a cloud-based word processor supporting real-time multi-user editing, where every collaborator sees others' changes almost instantly without clobbering each other.",
    keyPoints: [
      "Operational transformation vs CRDTs for concurrent edits",
      "WebSocket session management and presence indicators",
      "Document versioning, history, and offline reconciliation",
      "Cursor and selection broadcasting between clients",
    ],
    concepts: ["OT", "CRDT", "WebSockets", "Conflict resolution"],
    companies: ["Google", "Atlassian", "Microsoft", "Notion", "Figma", "Slack"],
    article:
      "https://vishal-vishal-gupta48.medium.com/google-docs-hld-high-level-system-design-d2e62f1d7ff5",
    theme: "violet",
    motif: "document",
  },
  {
    slug: "chatgpt-system",
    title: "Design ChatGPT System",
    level: "HLD",
    description:
      "Designing a system like ChatGPT means serving large language model inference to millions of users with acceptable latency and cost, not training the model itself.",
    keyPoints: [
      "GPU pooling, batching strategies, and queueing under load",
      "Token streaming to the client so perceived latency stays low",
      "Conversation context storage and window management",
      "Guardrails, abuse detection, and per-user quota enforcement",
    ],
    concepts: ["Inference serving", "Streaming", "GPU scheduling", "Quotas"],
    companies: ["OpenAI", "Microsoft", "Google", "Meta", "Anthropic", "Cohere"],
    article:
      "https://medium.com/@shaileshzope/system-design-case-study-architecting-chatgpt-9984667bef75",
    theme: "blue",
    motif: "spark",
  },
  {
    slug: "netflix",
    title: "Design Netflix",
    level: "HLD",
    description:
      "Netflix streams a large catalog of video on demand to a global audience, with personalized recommendations and playback that adapts to each viewer's connection.",
    keyPoints: [
      "Open Connect style edge caching placed inside ISP networks",
      "Pre-encoding the catalog into many renditions ahead of demand",
      "Recommendation pipeline running offline, served from a fast store",
      "Playback resume, watch history, and multi-profile accounts",
    ],
    concepts: ["CDN", "Pre-encoding", "Recommendations", "Edge caching"],
    companies: ["Netflix", "Amazon", "Disney+", "Google", "Apple", "Hotstar"],
    article:
      "https://medium.com/@lazygeek78/system-design-of-netflix-8a31bf9ca53f",
    theme: "amber",
    motif: "film",
  },
  {
    slug: "reddit",
    title: "Design Reddit",
    level: "HLD",
    description:
      "Reddit organizes discussion into communities with threaded comments and vote-driven ranking, where the hot ranking must stay fresh without recomputing everything constantly.",
    keyPoints: [
      "Hot/top/new ranking formulas and time decay",
      "Nested comment tree storage and efficient partial loading",
      "Vote counting at scale without lock contention",
      "Caching hot listings while keeping vote counts believable",
    ],
    concepts: ["Ranking", "Tree structures", "Counters", "Cache strategy"],
    companies: ["Reddit", "Meta", "Twitter/X", "Discord", "Quora", "HackerNews"],
    article:
      "https://www.geeksforgeeks.org/system-design/design-reddit-system-design/",
    theme: "green",
    motif: "chat",
  },
  {
    slug: "uber",
    title: "Design Uber",
    level: "HLD",
    description:
      "Uber matches riders with nearby drivers in real time, tracks trips as they happen, and handles pricing, all while drivers and riders move continuously.",
    keyPoints: [
      "Geospatial indexing of driver locations with frequent updates",
      "Matching algorithm balancing ETA, driver acceptance and fairness",
      "Surge pricing computed per region in near real time",
      "Trip state machine and handling dropped connections mid-trip",
    ],
    concepts: ["Geohashing", "Matching", "Real-time tracking", "State machines"],
    companies: ["Uber", "Lyft", "Grab", "Ola", "DoorDash", "Bolt"],
    article:
      "https://www.hellointerview.com/learn/system-design/problem-breakdowns/uber",
    theme: "rose",
    motif: "car",
  },
  {
    slug: "whatsapp",
    title: "Design WhatsApp",
    level: "HLD",
    description:
      "WhatsApp delivers one-to-one and group messages reliably and in order, with delivery receipts, offline queuing, and end-to-end encryption.",
    keyPoints: [
      "Persistent connections and how presence is tracked",
      "Message ordering, dedup, and the sent/delivered/read state machine",
      "Offline message queues and multi-device sync",
      "End-to-end encryption and key exchange between devices",
    ],
    concepts: ["WebSockets", "E2E encryption", "Message queues", "Presence"],
    companies: ["Meta", "Signal", "Telegram", "Google", "Apple", "Slack"],
    article:
      "https://www.geeksforgeeks.org/system-design/designing-whatsapp-messenger-system-design/",
    theme: "blue",
    motif: "message",
  },
  {
    slug: "instagram",
    title: "Design Instagram",
    level: "HLD",
    description:
      "Instagram is a photo and video sharing platform with a personalized feed, stories, and a heavy read-to-write ratio dominated by media delivery.",
    keyPoints: [
      "Image upload, resizing into variants, and CDN delivery",
      "Feed generation and story expiry after 24 hours",
      "Sharding the media metadata store by user",
      "Counting likes and views without hammering a single row",
    ],
    concepts: ["Object storage", "CDN", "Fan-out", "Sharding"],
    companies: ["Meta", "Snap", "TikTok", "Pinterest", "Google", "Twitter/X"],
    article:
      "https://medium.com/@interviewready/high-level-design-for-instagram-news-feed-423773d790f8",
    theme: "violet",
    motif: "camera",
  },
  {
    slug: "notification-system",
    title: "Design a Notification System",
    level: "LLD",
    description:
      "A notification system delivers messages across push, SMS, and email channels reliably, respecting user preferences and avoiding duplicate or unwanted sends.",
    keyPoints: [
      "Fan-out to per-channel adapters (APNs, FCM, SMS gateway, SMTP)",
      "Retry with exponential backoff and dead-letter handling",
      "Deduplication and rate limiting per user across channels",
      "Preference and opt-out enforcement at send time",
    ],
    concepts: ["Message queues", "Retries", "Idempotency", "Third-party APIs"],
    companies: ["Amazon", "Google", "Meta", "Twilio", "Uber", "Airbnb"],
    article:
      "https://lldhub.in/blog/notification-system-lld-design",
    theme: "teal",
    motif: "bell",
  },
  {
    slug: "payment-system",
    title: "Design a Payment System",
    level: "HLD",
    description:
      "A payment system moves money between parties correctly and exactly once, reconciling with external processors that can fail or respond slowly.",
    keyPoints: [
      "Idempotency keys so a retried charge never double-bills",
      "Double-entry ledger as the source of truth",
      "Saga pattern for multi-step flows that must unwind on failure",
      "Reconciliation jobs against processor settlement files",
    ],
    concepts: ["Idempotency", "Ledgers", "Sagas", "Exactly-once"],
    companies: ["Stripe", "PayPal", "Amazon", "Razorpay", "Adyen", "Square"],
    article:
      "https://leetcode.com/discuss/post/3846271/lld-design-a-payment-gateway-by-sahilman-xboa/",
    theme: "slate",
    motif: "card",
  },
  {
    slug: "tic-tac-toe",
    title: "Design Tic-Tac-Toe / Chess",
    level: "LLD",
    description:
      "Model a turn-based board game with players, moves, win detection, and a rules engine that extends from tic-tac-toe to chess without restructuring.",
    keyPoints: [
      "Board representation and efficient win-condition checks",
      "Player, Move, and Game classes with clear responsibilities",
      "Validating legal moves and rejecting illegal ones cleanly",
      "Extensibility: same skeleton for chess, Connect Four, Othello",
    ],
    concepts: ["OOP design", "Game loop", "Validation", "Extensibility"],
    companies: ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Zynga"],
    article:
      "https://www.geeksforgeeks.org/dsa/design-a-chess-game/",
    theme: "violet",
    motif: "grid",
  },
  {
    slug: "tiktok",
    title: "Design TikTok",
    level: "HLD",
    description:
      "TikTok serves an endless personalized short-video feed, where the recommendation engine matters more than the social graph and every scroll must feel instant.",
    keyPoints: [
      "Pre-fetching the next videos so playback starts with zero perceived delay",
      "Recommendation pipeline scoring candidates from engagement signals",
      "Video upload, transcoding and CDN delivery for short-form clips",
      "Cold-start: what to show a brand new user with no history",
    ],
    concepts: ["Recommendations", "CDN", "Pre-fetching", "Ranking"],
    companies: ["TikTok", "Meta", "Google", "Snap", "Instagram", "YouTube"],
    article:
      "https://www.geeksforgeeks.org/system-design/designing-tiktok-system-design/",
    theme: "rose",
    motif: "play",
  },
  {
    slug: "food-delivery",
    title: "Design a Food Delivery App",
    level: "LLD",
    description:
      "Model an online food ordering and delivery system like Zomato or Swiggy: restaurants, menus, carts, order lifecycle, and delivery partner assignment.",
    keyPoints: [
      "Class model for Restaurant, Menu, Cart, Order and DeliveryPartner",
      "Order state machine from placed through delivered or cancelled",
      "Strategy pattern for partner assignment and pricing/surge rules",
      "Handling payment failure and partial refunds without corrupting state",
    ],
    concepts: ["OOP design", "State machines", "Strategy pattern", "Payments"],
    companies: ["Zomato", "Swiggy", "Uber", "DoorDash", "Amazon", "Deliveroo"],
    article:
      "https://www.lldcoding.com/blog/design-lld-a-system-for-online-food-ordering-and-delivery-like-zomato-machine-coding",
    theme: "amber",
    motif: "basket",
  },
  {
    slug: "music-streaming",
    title: "Design a Music Streaming Service",
    level: "LLD",
    description:
      "Model a service like Spotify: a catalog of songs and albums, user playlists, playback queue, and a recommendation hook — a classic machine-coding round.",
    keyPoints: [
      "Class model for Song, Album, Artist, Playlist and Player",
      "Playback queue with shuffle and repeat as swappable strategies",
      "Observer pattern so the UI reacts to track changes",
      "Search and library organization across large catalogs",
    ],
    concepts: ["OOP design", "Observer pattern", "Strategy pattern", "Queues"],
    companies: ["Spotify", "Apple", "Amazon", "Google", "JioSaavn", "Gaana"],
    article:
      "https://www.lldcoding.com/blog/implement-a-music-streaming-service-like-spotify-machine-coding",
    theme: "emerald",
    motif: "music",
  },
  {
    slug: "dating-app",
    title: "Design a Dating App",
    level: "LLD",
    description:
      "Model a dating app like Tinder: user profiles, preference-based discovery, the swipe interaction, mutual-match detection, and chat unlocked on match.",
    keyPoints: [
      "Class model for User, Profile, Preference, Swipe and Match",
      "Efficient mutual-match detection when both users swipe right",
      "Recommendation feed filtered by location and preferences",
      "Blocking, reporting, and preventing repeat profiles",
    ],
    concepts: ["OOP design", "Matching", "Geo-filtering", "Feed generation"],
    companies: ["Tinder", "Bumble", "Hinge", "Meta", "Match Group", "Grindr"],
    article:
      "https://www.lldcoding.com/blog/design-lld-tinder-dating-app-machine-coding",
    theme: "violet",
    motif: "heart",
  },
];

export const FAQS = [
  {
    q: "What is the System Design Sheet?",
    a: "A curated set of high-level (HLD) and low-level (LLD) system design interview questions, designing systems like a rate limiter, TinyURL, and Twitter, each with a real description of the problem, the key points a strong answer should cover, the concepts it teaches, the companies known to ask it, and a reference article and video.",
  },
  {
    q: "How many questions does it have?",
    a: "23 questions, a mix of high-level (18) and low-level (5) design problems, each paired with a reference article and video.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. Browsing every problem on this page is completely free, with no account required. Creating a free DevsUnite account lets you save your checked-off progress, star favorites, and add personal notes that sync across devices.",
  },
  {
    q: "Do I need an account to track my progress?",
    a: "You can read and solve every problem without logging in. An account is only required to mark a problem as done, star it, or add a note. Those actions save to your account instead of resetting on refresh.",
  },
];
