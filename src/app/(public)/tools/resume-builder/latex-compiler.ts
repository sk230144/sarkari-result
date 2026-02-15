export const DEFAULT_LATEX_TEMPLATE = `\\documentclass[a4paper,11pt]{article}

\\usepackage[margin=0.7in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

\\begin{document}

%% ===== NAME =====
\\begin{center}
  {\\LARGE\\bfseries Your Full Name} \\\\[4pt]
  Phone: +91-9876543210 \\quad
  Email: your.email@example.com \\quad
  City, State
\\end{center}

%% ===== CAREER OBJECTIVE =====
\\section{Career Objective}
A dedicated and hardworking individual seeking a challenging position in government sector where I can utilize my skills and contribute to organizational goals.

%% ===== EDUCATION =====
\\section{Education}
\\begin{itemize}[leftmargin=*, label={}, itemsep=4pt]
  \\item \\textbf{B.Tech in Computer Science} \\hfill 2020 -- 2024 \\\\
        ABC University, City \\hfill \\textit{CGPA: 8.5}
  \\item \\textbf{12th (CBSE)} \\hfill 2020 \\\\
        XYZ School, City \\hfill \\textit{85\\%}
  \\item \\textbf{10th (CBSE)} \\hfill 2018 \\\\
        XYZ School, City \\hfill \\textit{90\\%}
\\end{itemize}

%% ===== EXPERIENCE =====
\\section{Work Experience}
\\begin{itemize}[leftmargin=*, label={}, itemsep=4pt]
  \\item \\textbf{Data Entry Operator} \\hfill Jan 2024 -- Present \\\\
        \\textit{Government Office, City}
        \\begin{itemize}[label=$\\bullet$, itemsep=2pt]
          \\item Managed digital records and maintained databases
          \\item Processed 200+ entries daily with 99\\% accuracy
        \\end{itemize}
\\end{itemize}

%% ===== SKILLS =====
\\section{Skills}
MS Office (Word, Excel, PowerPoint), Typing (Hindi \\& English -- 40 WPM), Data Entry, Basic Computer Knowledge, Internet Browsing

%% ===== LANGUAGES =====
\\section{Languages}
Hindi (Native), English (Proficient)

%% ===== HOBBIES =====
\\section{Hobbies}
Reading, Cricket, Current Affairs

\\end{document}`;

export async function compileLatexToPdf(latexCode: string): Promise<void> {
  const response = await fetch("https://latex.ytotech.com/builds/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      compiler: "pdflatex",
      resources: [
        {
          main: true,
          content: latexCode,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("LaTeX compilation failed");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Resume.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
