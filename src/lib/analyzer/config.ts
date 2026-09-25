/**
 * Everything in the report that never goes through AI: skill synonyms,
 * verdict text, templates and resource cards. Shared by server and browser.
 */

export type Level = "intern" | "junior" | "mid" | "senior" | "lead";
export const LEVELS: Level[] = ["intern", "junior", "mid", "senior", "lead"];

export type GapType = "Required" | "Preferred";

export type ResourceCard = {
  icon: "system-design" | "interview" | "portfolio";
  title: string;
  body: string;
  href: string;
  cta: string;
};

export type AiRisk = {
  level: "Low" | "Medium" | "High";
  timeline: string;
  automation: string;
  edge: string;
  adapt: string;
};

export type AnalysisReport = {
  jdTitle: string;
  score: number;
  verdict: string;
  summary: string;
  bars: { label: string; value: number }[];
  titleWarning: string | null;
  matched: string[];
  gaps: { skill: string; type: GapType }[];
  resources: ResourceCard[];
  compare: { label: string; text: string }[];
  closeTheGap: { title: string; body: string }[];
  path: {
    intro: string;
    topics: string[];
    projects: { title: string; body: string }[];
    timeline: string;
  };
  keepBuilding: ResourceCard;
  aiRisk: AiRisk | null;
};

export type AnalysisResult = {
  id: string;
  report: AnalysisReport;
  cached: boolean;
  createdAt: string;
  /** New analyses left in the current 24 h window; null when unlimited. */
  remaining: number | null;
};

/**
 * Variant → canonical name. Keys are compared after lowercasing and
 * stripping spaces, dots, dashes and underscores, so "React.js", "ReactJS"
 * and "react js" all hit the same entry. Grow this as unmatched skills show up.
 */
export const SKILL_SYNONYMS: Record<string, string> = {
  react: "React",
  reactjs: "React",
  nodejs: "Node.js",
  node: "Node.js",
  js: "JavaScript",
  javascript: "JavaScript",
  es6: "JavaScript",
  ecmascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  rest: "REST APIs",
  restapi: "REST APIs",
  restapis: "REST APIs",
  restful: "REST APIs",
  restfulapi: "REST APIs",
  restfulapis: "REST APIs",
  restfulservices: "REST APIs",
  graphql: "GraphQL",
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  psql: "PostgreSQL",
  k8s: "Kubernetes",
  kubernetes: "Kubernetes",
  docker: "Docker",
  aws: "AWS",
  amazonwebservices: "AWS",
  gcp: "GCP",
  googlecloud: "GCP",
  googlecloudplatform: "GCP",
  azure: "Azure",
  microsoftazure: "Azure",
  git: "Git",
  systemdesign: "System design",
  systemsdesign: "System design",
  cicd: "CI/CD",
  continuousintegration: "CI/CD",
  nextjs: "Next.js",
  next: "Next.js",
  vue: "Vue.js",
  vuejs: "Vue.js",
  angular: "Angular",
  angularjs: "Angular",
  express: "Express",
  expressjs: "Express",
  mongo: "MongoDB",
  mongodb: "MongoDB",
  mysql: "MySQL",
  sqlite: "SQLite",
  sqlserver: "SQL Server",
  mssql: "SQL Server",
  microsoftsqlserver: "SQL Server",
  oracle: "Oracle",
  oracledb: "Oracle",
  redis: "Redis",
  sql: "SQL",
  nosql: "NoSQL",
  html: "HTML",
  html5: "HTML",
  css: "CSS",
  css3: "CSS",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  redux: "Redux",
  python: "Python",
  java: "Java",
  cpp: "C++",
  "c++": "C++",
  csharp: "C#",
  "c#": "C#",
  go: "Go",
  golang: "Go",
  ml: "Machine learning",
  machinelearning: "Machine learning",
  dl: "Deep learning",
  deeplearning: "Deep learning",
  microservice: "Microservices",
  microservices: "Microservices",
  kafka: "Kafka",
  apachekafka: "Kafka",
  linux: "Linux",
  jest: "Jest",
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  springboot: "Spring Boot",
  spring: "Spring Boot",
  pandas: "Pandas",
  numpy: "NumPy",
  powerbi: "Power BI",
  tableau: "Tableau",
  excel: "Excel",
  msexcel: "Excel",
};

/**
 * Knowing the key implies knowing each listed skill, so a resume with
 * PostgreSQL is not flagged as missing SQL.
 */
export const SKILL_IMPLIES: Record<string, string[]> = {
  PostgreSQL: ["SQL"],
  MySQL: ["SQL"],
  SQLite: ["SQL"],
  "SQL Server": ["SQL"],
  Oracle: ["SQL"],
  "Next.js": ["React"],
  Redux: ["React"],
  Express: ["Node.js"],
  TypeScript: ["JavaScript"],
  "Tailwind CSS": ["CSS"],
  Kubernetes: ["Docker"],
  Django: ["Python"],
  Flask: ["Python"],
  FastAPI: ["Python"],
  "Spring Boot": ["Java"],
};

/** Gaps that route the reader to the system design sheet. */
export const SYSTEM_DESIGN_KEYS = [
  "systemdesign",
  "caching",
  "scalability",
  "distributedsystems",
  "microservices",
  "loadbalancing",
];

export const VERDICT_BANDS = [
  { min: 80, verdict: "Strong match", summary: "You're a strong fit. Polish the details and apply." },
  { min: 60, verdict: "Good match", summary: "Solid fit with a few gaps worth closing." },
  {
    min: 40,
    verdict: "Needs work",
    summary: "Significant gaps identified. The suggestions below explain exactly what to fix.",
  },
  {
    min: 0,
    verdict: "Low match",
    summary: "This role is a stretch right now. Follow the path below to close the gap.",
  },
];

/** Weights for the overall %: skills, experience & projects, seniority. */
export const SCORE_WEIGHTS = { skills: 0.4, experience: 0.35, seniority: 0.25 };

export const TEMPLATES = {
  titleWarning: (jdTitle: string) =>
    `Your resume title does not clearly match the JD title "${jdTitle}". Mirror the role name in your headline so recruiters and ATS filters connect the two.`,
  closeGapTitle: (skill: string) => `Add a project that demonstrates ${skill}`,
  closeGapBody: (skill: string, type: GapType) =>
    `${skill} is listed as ${type.toLowerCase()}. Building a small project with it and adding it to your resume is the fastest way to close this gap.`,
  pathIntro: (jdTitle: string) =>
    `To strengthen your fit for ${jdTitle} roles, focus on the missing skills below.`,
  timeline: (min: number, max: number) =>
    min === max ? `About ${min} weeks of part-time study and project work` : `${min} to ${max} weeks of part-time study and project work`,
};

export const RESOURCES: Record<"systemDesign" | "interview" | "portfolio", ResourceCard> = {
  systemDesign: {
    icon: "system-design",
    title: "Strengthen your system design skills",
    body: "Almost every technical interview touches system design. Learn the fundamentals recruiters expect.",
    href: "/system-design",
    cta: "Open System Design Sheet",
  },
  interview: {
    icon: "interview",
    title: "Practice real company interview questions",
    body: "Real interview questions tagged by company, from 18 top tech companies.",
    href: "/faang-questions",
    cta: "Open Interview Questions",
  },
  portfolio: {
    icon: "portfolio",
    title: "Build a live project portfolio",
    body: "A working link beats a PDF every time. Turn your existing projects into a real portfolio in minutes.",
    href: "/portfolio-builder",
    cta: "Build My Portfolio",
  },
};
