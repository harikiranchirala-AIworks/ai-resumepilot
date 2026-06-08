/** Escape special LaTeX characters in user-provided text */
export function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (m) => `\\${m}`)
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/** ATS-friendly LaTeX resume shell — single column, standard fonts, no graphics */
export function buildLatexDocument(body: string): string {
  return `\\documentclass[11pt,a4paper]{article}

% ATS-friendly: standard fonts, no images, clear section headings
\\usepackage[margin=0.75in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}

\\hypersetup{colorlinks=true, linkcolor=black, urlcolor=blue}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

\\begin{document}
${body}
\\end{document}
`;
}

/** Fallback template when AI is unavailable */
export function buildFallbackLatex(
  profileText: string,
  jobDescription: string
): string {
  const profileSnippet = escapeLatex(profileText.slice(0, 2000));
  const jdSnippet = escapeLatex(jobDescription.slice(0, 500));

  const body = `
\\begin{center}
  {\\LARGE \\textbf{Professional Resume}}\\\\[6pt]
  {\\small Tailored for target role — edit contact details below}
\\end{center}

\\vspace{6pt}

\\section*{Professional Summary}
Tailored candidate profile aligned with the target job description. Review and personalize contact information, dates, and metrics before submitting.

\\section*{Profile Source}
\\begin{small}
${profileSnippet}
\\end{small}

\\section*{Target Role Keywords}
\\begin{small}
${jdSnippet}
\\end{small}

\\section*{Experience}
\\textbf{[Job Title]} \\hfill [City, State]\\\\
\\textit{[Company Name]} \\hfill [Start] -- [End]
\\begin{itemize}[leftmargin=*, nosep]
  \\item Quantified achievement aligned with job requirements
  \\item Technical skill or responsibility matching the JD
  \\item Leadership or collaboration outcome with measurable impact
\\end{itemize}

\\section*{Skills}
[List skills from the job description that you genuinely possess, comma-separated]

\\section*{Education}
\\textbf{[Degree]} \\hfill [Graduation Year]\\\\
[University Name]
`;

  return buildLatexDocument(body);
}
