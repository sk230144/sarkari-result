/**
 * Placeholder analysis report, shaped like the AI response will be.
 * Swap this builder for a Gemini call when resume analysis goes live.
 */

export type Analysis = ReturnType<typeof sampleAnalysis>;

export function sampleAnalysis(role: string) {
  return {
    role,
    score: 54,
    verdict: "Needs work",
    summary:
      "Significant gaps identified. The suggestions below explain exactly what to fix.",
    bars: [
      { label: "Skills", value: 40 },
      { label: "Experience & Projects", value: 60 },
      { label: "Seniority fit", value: 70 },
    ],
    titleWarning: `Your resume title does not clearly match the JD title "${role}". Mirror the role name in your headline so recruiters and ATS filters connect the two.`,
    matched: ["Node.js", "REST APIs", "Git"],
    gaps: [
      { skill: "GraphQL", level: "Required" },
      { skill: "Docker", level: "Preferred" },
      { skill: "System design", level: "Preferred" },
    ],
    compare: [
      {
        label: "Experience",
        text: `Your recent roles include relevant ${role.toLowerCase()} work, but the JD expects deeper hands-on exposure to the core stack it lists.`,
      },
      {
        label: "Seniority",
        text: "Your level reads as junior, which fits most early-career openings but may fall short where the JD asks for ownership of whole services.",
      },
    ],
    closeTheGap: {
      title: "Add a project that demonstrates GraphQL",
      body: "GraphQL is listed as required. Building a small API with it and putting it on your resume is the fastest way to close this gap.",
    },
    path: {
      intro: `To strengthen your fit for ${role} roles, focus on the missing skills below.`,
      topics: ["GraphQL", "Docker", "Caching", "System design basics"],
      projects: [
        {
          title: "GraphQL API service",
          body: "A small GraphQL API with auth and pagination gives you hands-on experience with a skill the JD requires.",
        },
        {
          title: "Containerised app with Docker",
          body: "Package one of your existing projects with Docker and a compose file to show you can ship beyond your laptop.",
        },
      ],
      timeline: "6 to 8 weeks of focused study and project work",
    },
    aiRisk: {
      level: "Medium",
      timeline: "2-3 years",
      automation:
        "AI will automate routine tasks such as boilerplate code, data processing and simple API wiring.",
      edge: "Designing systems, making trade-offs and understanding the business problem stay firmly human, because they need judgement and context.",
      adapt:
        "Go deep on architecture, cloud and debugging production systems — the parts of the job AI assists with but cannot own.",
    },
  };
}
