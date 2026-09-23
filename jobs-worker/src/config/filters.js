/**
 * Word lists behind the eligibility and tech filters (doc §6, §7).
 * Kept as data so the rules can be tuned without touching logic.
 */

/** §6.1 — free-text location strings that clearly mean India. */
export const INDIA_TERMS = [
  "india",
  "bangalore",
  "bengaluru",
  "hyderabad",
  "pune",
  "gurgaon",
  "gurugram",
  "noida",
  "chennai",
  "mumbai",
  "delhi",
  "new delhi",
  "kolkata",
  "ahmedabad",
  "jaipur",
  "kochi",
  "cochin",
  "trivandrum",
  "thiruvananthapuram",
];

/** Canonical city names, so "Bangalore" and "Bengaluru" group together. */
export const CITY_ALIASES = {
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  gurgaon: "Gurugram",
  gurugram: "Gurugram",
  "new delhi": "Delhi",
  delhi: "Delhi",
  cochin: "Kochi",
  kochi: "Kochi",
  trivandrum: "Thiruvananthapuram",
  thiruvananthapuram: "Thiruvananthapuram",
  hyderabad: "Hyderabad",
  pune: "Pune",
  noida: "Noida",
  chennai: "Chennai",
  mumbai: "Mumbai",
  kolkata: "Kolkata",
  ahmedabad: "Ahmedabad",
  jaipur: "Jaipur",
};

/**
 * Cities and countries that are unambiguously not India. A feed like Ashby
 * returns a bare "San Francisco" with no country, which would otherwise
 * fall through to remote-unknown instead of being rejected.
 *
 * This is a fast reject list, not a world atlas — anything unlisted still
 * goes through the normal remote/unknown path.
 */
export const FOREIGN_LOCATION_TERMS = [
  // United States
  "san francisco", "new york", "seattle", "austin", "boston", "chicago",
  "los angeles", "denver", "atlanta", "miami", "dallas", "houston",
  "washington dc", "washington, d.c", "washington d.c", "san jose",
  "palo alto", "mountain view", "sunnyvale", "foster city", "san mateo",
  "menlo park", "cupertino", "bellevue", "santa monica", "irvine",
  "santa clara", "redmond", "portland", "philadelphia", "phoenix",
  "san diego", "detroit", "minneapolis", "nashville", "california",
  "texas", "new jersey", "massachusetts", "washington state",
  "salt lake city", "united states", "usa", "nyc", "sf bay",
  // US state codes as a trailing ", XX" — "Foster City, CA".
  ", ca", ", ny", ", wa", ", tx", ", ma", ", il", ", co", ", ga",
  ", fl", ", or", ", ut", ", nj", ", pa", ", az", ", nc", ", va",
  // Canada
  "toronto", "vancouver", "montreal", "ottawa", "waterloo", "calgary", "canada",
  // UK / Europe
  "london", "manchester", "edinburgh", "cambridge, uk", "united kingdom",
  "dublin", "ireland", "berlin", "munich", "hamburg", "germany",
  "paris", "france", "amsterdam", "netherlands", "madrid", "barcelona",
  "spain", "lisbon", "portugal", "warsaw", "krakow", "poland",
  "stockholm", "sweden", "copenhagen", "denmark", "oslo", "norway",
  "helsinki", "finland", "zurich", "switzerland", "vienna", "austria",
  "brussels", "belgium", "milan", "rome", "italy", "prague", "czech",
  "bucharest", "romania", "budapest", "hungary", "athens", "greece",
  // APAC (excluding India)
  "singapore", "tokyo", "japan", "seoul", "korea", "sydney", "melbourne",
  "australia", "auckland", "new zealand", "hong kong", "shanghai",
  "beijing", "shenzhen", "china", "taipei", "taiwan", "jakarta",
  "indonesia", "manila", "philippines", "bangkok", "thailand",
  "kuala lumpur", "malaysia", "ho chi minh", "vietnam",
  // LATAM / MEA
  "sao paulo", "brazil", "mexico city", "mexico", "buenos aires",
  "argentina", "bogota", "colombia", "santiago", "chile", "lima", "peru",
  "tel aviv", "israel", "dubai", "abu dhabi", "uae", "riyadh",
  "saudi arabia", "cairo", "egypt", "nairobi", "kenya", "lagos",
  "nigeria", "cape town", "johannesburg", "south africa",
];

/** §6.2 — location text that means "open to India / anywhere". */
export const GLOBAL_REMOTE_TERMS = [
  "worldwide",
  "anywhere",
  "global",
  "remote - global",
  "apac",
  "asia",
  "asia pacific",
];

/**
 * Location strings that scope a remote role to a country India isn't in.
 * These appear as the whole location field ("US-Remote", "Remote - EMEA"),
 * which the prose-oriented EXCLUSION_PATTERNS below don't catch.
 */
export const REMOTE_SCOPE_EXCLUSIONS = [
  // "US-Remote", "EMEA Remote" — region immediately before "remote".
  /\b(?:us|usa|u\.s\.?|united states|uk|united kingdom|eu|europe|emea|latam|canada|north america|namer|apac[\s-]*excluding)[\s-]*remote\b/i,
  // "Remote - US", "Remote (EMEA)", "Remote in the US", "Remote from the US",
  // "Remote North America" — region immediately after "remote".
  /\bremote\s*(?:[-,(]|\b(?:in|from|within|across)\b)?\s*(?:the\s+)?(?:us|usa|u\.s\.?|united states|uk|united kingdom|eu|europe|emea|latam|canada|north america|namer|germany|france|spain|poland|portugal|brazil|mexico|argentina|australia|japan|singapore|philippines)\b/i,
  // "US-SEA, US-SF, US-Remote" — a list of US-prefixed sites.
  /\bus-(?:remote|[a-z]{2,4})\b/i,
];

/**
 * §6.2 — explicit geographic restrictions that exclude India.
 * Precedence rule §6.3: an exclusion beats a generic "remote".
 */
export const EXCLUSION_PATTERNS = [
  /\bus[- ]only\b/i,
  /\bu\.?s\.?[- ]based\b/i,
  /\bunited states only\b/i,
  /\bmust (?:reside|be located|live) in the (?:us|usa|united states)\b/i,
  /\bmust be (?:a )?us (?:citizen|resident)\b/i,
  /\bauthorized to work in the (?:us|united states)\b/i,
  /\bcanada only\b/i,
  /\bcanadian residents? only\b/i,
  /\b(?:eu|europe|emea)[- ]only\b/i,
  /\bwithin the (?:eu|european union|uk)\b/i,
  /\bmust (?:reside|be located) in (?:the )?(?:uk|united kingdom|europe)\b/i,
  /\buk only\b/i,
  /\blatam only\b/i,
  /\bapac excluding india\b/i,
  /\bnot (?:available|open) (?:to|for) (?:candidates in )?india\b/i,
];

/** §7.1 — a title containing one of these is a tech role. */
export const TECH_TITLE_TERMS = [
  "engineer",
  "developer",
  "software",
  "sde",
  "frontend",
  "front-end",
  "backend",
  "back-end",
  "full stack",
  "fullstack",
  "devops",
  "sre",
  "site reliability",
  "data engineer",
  "data scientist",
  "machine learning",
  "ml engineer",
  "ai engineer",
  "qa",
  "quality assurance",
  "test engineer",
  "sdet",
  "android",
  "ios",
  "mobile",
  "security engineer",
  "cloud engineer",
  "platform engineer",
  "product manager",
  "technical product manager",
  "product designer",
  "ui designer",
  "ux designer",
  "architect",
  "programmer",
];

/**
 * §7.1 — non-software roles that would otherwise match on "engineer".
 * This platform is software/tech only.
 */
export const TECH_DENY_TERMS = [
  "civil engineer",
  "mechanical engineer",
  "electrical engineer",
  "field engineer",
  "chemical engineer",
  "industrial engineer",
  "structural engineer",
  "hvac",
  "sales engineer",
  "customer engineer",
  "process engineer",
  "production engineer",
  "maintenance engineer",
  "safety engineer",
  "automotive engineer",
  "aerospace engineer",
  "petroleum engineer",
  "mining engineer",
  "biomedical engineer",
  // Manufacturing and industrial engineering. Boards like Bosch's are
  // mostly these, and they all contain the word "engineer".
  "hardware design",
  "hardware architect",
  "power systems",
  "power electronics",
  "process planner",
  "production planner",
  "supplier quality",
  "quality management",
  "quality assurance engineer - manufacturing",
  "purchasing",
  "procurement engineer",
  "cost engineering",
  "manufacturing engineer",
  "plant engineer",
  "tooling",
  "welding",
  "casting",
  "machining",
  "cnc ",
  "plc ",
  "scada",
  "hmi ",
  "instrumentation engineer",
  "calibration engineer",
  "thermal engineer",
  "acoustic",
  "vibration",
  "durability",
  "homologation",
  "powertrain",
  "drivetrain",
  "chassis",
  "body in white",
  "connectors",
  "pcb ",
  "asic ",
  "vlsi",
  "rf engineer",
  "antenna",
  "semiconductor",
  "wafer",
  "front line manager",
  "shift engineer",
  "maintenance technician",
  "service technician",
  "field service",
  "site engineer",
  "project engineer - construction",
  // Automotive electronics — engineering, but not software engineering.
  "adas",
  "autosar",
  "model-based design",
  "hil ",
  "-hil",
  "ecu ",
  "can bus",
  "signal processing",
  "mechanical design",
  "hw architect",
  "hardware project",
  "shift leader",
  "production_",
  "complaint management",
  "servo motor",
  "actuator",
  "braking",
  "airbag",
  "bms ",
  "bess",
  "pneumatic",
  "fea ",
  "fea engineer",
  "cfd",
  "cae ",
  "nvh",
  "logistics",
  "supervisor",
  "warehouse",
  "supply chain",
  "inbound",
  "outbound",
  "materials",
  "packaging",
];

/**
 * Go-to-market, legal and back-office titles that sit inside "Product" or
 * "Engineering" departments at big companies. Without these, a department
 * of "Product Sales" pulls an Account Executive onto a developer job board.
 * Checked against the title before anything else.
 */
export const NON_TECH_TITLE_TERMS = [
  "account executive",
  "account manager",
  "sales",
  "seller",
  "business development",
  "partnerships",
  "customer success",
  "customer support",
  "solutions architect", // pre-sales at most vendors
  "solutions consultant",
  "solutions engineer",
  "recruiter",
  "recruiting",
  "talent acquisition",
  "counsel",
  "attorney",
  "paralegal",
  "compliance",
  "controller",
  "accountant",
  "bookkeeper",
  "payroll",
  "office manager",
  "executive assistant",
  "marketing",
  "content writer",
  "copywriter",
  "social media",
  "community manager",
  "people operations",
  "hr business partner",
  "facilities",
  "procurement",
  // Support and enablement roles — not software engineering, even when the
  // title ends in "Engineer".
  "support engineer",
  "technical support",
  "instructional designer",
  "curriculum",
  "training manager",
  "implementation consultant",
  "professional services",
];

/**
 * Executive titles. A "Director - Product" is a leadership hire, not the
 * engineering role this board is for; §7.1 says keep the platform to
 * software/tech roles. "Director of Engineering" still passes, because the
 * TECH_TITLE_TERMS check runs first and matches "engineering".
 */
export const SENIORITY_DENY_TERMS = [
  "director",
  "vice president",
  " vp ",
  "vp,",
  "vp of",
  "chief ",
  "head of",
  "general manager",
];

/**
 * Title keyword -> role_category, for the §8.1 filter facets.
 *
 * Order matters: the first match wins, so specific categories are listed
 * before broad ones. "Machine Learning Engineer" must land in ai-ml, not
 * backend, and "Senior Software Engineer" falls through to `software`
 * rather than the meaningless `other`.
 */
export const ROLE_CATEGORIES = [
  ["ai-ml", ["machine learning", "ml engineer", "ai engineer", "deep learning", "nlp", "computer vision", "llm", "applied scientist", "research scientist", "research engineer"]],
  ["data", ["data engineer", "data scientist", "data analyst", "analytics engineer", "data platform", "data infrastructure", "business intelligence", "etl"]],
  ["qa", ["qa ", "quality assurance", "test engineer", "sdet", "automation test", "test automation"]],
  ["security", ["security engineer", "appsec", "infosec", "cybersecurity", "penetration", "security architect", "abuse", "fraud engineer", "trust and safety engineer", "soc ", "soc l", "siem", "security analyst", "security operations"]],
  ["devops", ["devops", "sre", "site reliability", "platform engineer", "infrastructure engineer", "cloud engineer", "systems engineer", "reliability engineer", "build engineer", "release engineer"]],
  ["mobile", ["android", "ios ", " ios", "mobile engineer", "mobile developer", "react native", "flutter"]],
  ["fullstack", ["full stack", "fullstack", "full-stack"]],
  ["frontend", ["frontend", "front-end", "front end", "ui engineer", "web developer", "javascript engineer", "react engineer"]],
  ["backend", ["backend", "back-end", "back end", "api engineer", "server engineer", "services engineer", "distributed systems"]],
  ["product", ["product manager", "product owner", "technical program manager", "program manager"]],
  ["design", ["product designer", "ui designer", "ux designer", "ux researcher", "design engineer", "designer"]],
  // Catch-all for genuine engineering titles that name no specialism.
  ["software", ["software engineer", "software developer", "sde", "programmer", "engineering manager", "engineer", "developer", "architect"]],
];

/** Tokens worth surfacing as tech_stack chips (§8.1). */
export const TECH_STACK_TERMS = [
  "javascript", "typescript", "react", "next.js", "nextjs", "vue", "angular",
  "svelte", "node.js", "nodejs", "express", "nestjs", "python", "django",
  "flask", "fastapi", "java", "spring", "kotlin", "go", "golang", "rust",
  "ruby", "rails", "php", "laravel", "c++", "c#", ".net", "swift",
  "objective-c", "flutter", "dart", "react native", "graphql", "rest api",
  "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
  "kafka", "rabbitmq", "aws", "azure", "gcp", "google cloud", "docker",
  "kubernetes", "terraform", "jenkins", "ci/cd", "git", "linux", "tensorflow",
  "pytorch", "pandas", "numpy", "spark", "hadoop", "airflow", "snowflake",
  "dbt", "tailwind", "sass", "webpack", "vite", "jest", "cypress", "selenium",
  "playwright", "figma",
];

/**
 * Experience phrasing seen in Indian job descriptions (§8.1).
 *
 * Order matters — "5+ years" must be tested before the range pattern, or
 * a bounded range is inferred from an open-ended one.
 */
export const EXPERIENCE_PATTERNS = [
  // "5+ years" / "5 + yrs" — open-ended, so there is no maximum.
  /(\d{1,2})\s*\+\s*(?:years?|yrs?)/i,
  // "3-5 years", "3 to 5 years", "3–5 yrs"
  /(\d{1,2})\s*(?:-|–|—|to)\s*(\d{1,2})\s*(?:years?|yrs?)/i,
  // "minimum 4 years"
  /(?:minimum|min\.?|at least)\s*(\d{1,2})\s*(?:years?|yrs?)/i,
];
