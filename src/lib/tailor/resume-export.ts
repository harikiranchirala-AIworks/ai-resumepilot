function extractResumeLines(source: string): string[] {
  const bodyMatch = source.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  const body = (bodyMatch ? bodyMatch[1] : source)
    .replace(/%.*$/gm, "")
    .replace(/\\\\(?:\[[^\]]*\])?/g, "\n")
    .replace(/\\begin\{(?:center|itemize)\}|\\end\{(?:center|itemize)\}/g, "\n")
    .replace(/\\section\*?\{([^{}]*)\}/g, "\n## $1\n")
    .replace(/\\item\s+/g, "\n• ")
    .replace(/\\href\{([^{}]*)\}\{([^{}]*)\}/g, "$2 ($1)")
    .replace(/\\url\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:textbf|textit|emph)\{([^{}]*)\}/g, "$1")
    .replace(/\\hfill/g, " — ")
    .replace(/\\(?:vspace|smallskip|medskip|bigskip)(?:\{[^{}]*\})?/g, "\n")
    .replace(/\\(?:LARGE|Large|large|small|footnotesize|normalsize)\s*/g, "")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{([^{}]*)\})?/g, "$1")
    .replace(/\\([&%$#_{}])/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/--/g, "–");

  return body
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadResumePdf(latex: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 54;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = margin;

  for (const rawLine of extractResumeLines(latex)) {
    const isHeading = rawLine.startsWith("## ");
    const line = isHeading ? rawLine.slice(3).toUpperCase() : rawLine;
    pdf.setFont("helvetica", isHeading ? "bold" : "normal");
    pdf.setFontSize(isHeading ? 12 : 10);
    if (isHeading) y += 7;
    const wrapped = pdf.splitTextToSize(line, pageWidth - margin * 2) as string[];
    const lineHeight = isHeading ? 16 : 14;
    if (y + wrapped.length * lineHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(wrapped, margin, y);
    y += wrapped.length * lineHeight + (isHeading ? 3 : 1);
  }

  pdf.save("tailored-resume.pdf");
}

export async function downloadResumeDocx(latex: string) {
  const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");
  const paragraphs = extractResumeLines(latex).map((rawLine) => {
    const isHeading = rawLine.startsWith("## ");
    const isBullet = rawLine.startsWith("• ");
    const text = rawLine.replace(/^(?:## |• )/, "");
    if (isHeading) {
      return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
    }
    return new Paragraph({
      bullet: isBullet ? { level: 0 } : undefined,
      spacing: { after: 80 },
      children: [new TextRun({ text, size: 20 })],
    });
  });
  const documentFile = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 20 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
      children: paragraphs,
    }],
  });
  const blob = await Packer.toBlob(documentFile);
  downloadBlob(blob, "tailored-resume.docx");
}