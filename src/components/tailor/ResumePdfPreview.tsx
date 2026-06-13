"use client";

import { useState } from "react";

type PreviewMode = "formatted" | "source";

interface ResumePdfPreviewProps {
  latex: string;
  summary: string;
  highlights: string[];
  onLatexChange: (latex: string) => void;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function extractDocumentBody(source: string): string {
  const match = source.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  return (match ? match[1] : source).trim();
}

function cleanLatexText(text: string): string {
  return text
    .replace(/%.*$/gm, "")
    .replace(/\\(?:LARGE|Large|large|small|footnotesize|normalsize)\s*/g, "")
    .replace(/\\(?:textbf|textit|emph)\{([^{}]*)\}/g, "$1")
    .replace(/\\href\{([^{}]*)\}\{([^{}]*)\}/g, "$2 ($1)")
    .replace(/\\url\{([^{}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{([^{}]*)\})?/g, "$1")
    .replace(/\\([&%$#_{}])/g, "$1")
    .replace(/\\textbackslash\{\}/g, "\\")
    .replace(/\\textasciitilde\{\}/g, "~")
    .replace(/\\textasciicircum\{\}/g, "^")
    .replace(/[{}]/g, "")
    .replace(/--/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

function formatInlineLatex(text: string): string {
  const placeholders: string[] = [];
  const stash = (html: string) => {
    placeholders.push(html);
    return `@@HTML_${placeholders.length - 1}@@`;
  };

  const withPlaceholders = text
    .replace(/\\href\{([^{}]*)\}\{([^{}]*)\}/g, (_, url: string, label: string) =>
      stash(
        `<a href="${escapeHtml(cleanLatexText(url))}" target="_blank" rel="noreferrer">${escapeHtml(cleanLatexText(label))}</a>`,
      ),
    )
    .replace(/\\url\{([^{}]*)\}/g, (_, url: string) => {
      const cleanUrl = cleanLatexText(url);
      return stash(`<a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noreferrer">${escapeHtml(cleanUrl)}</a>`);
    })
    .replace(/\\textbf\{([^{}]*)\}/g, (_, value: string) => stash(`<strong>${escapeHtml(cleanLatexText(value))}</strong>`))
    .replace(/\\(?:textit|emph)\{([^{}]*)\}/g, (_, value: string) => stash(`<em>${escapeHtml(cleanLatexText(value))}</em>`))
    .replace(/\\hfill/g, stash('<span class="resume-spacer"></span>'));

  return escapeHtml(cleanLatexText(withPlaceholders)).replace(/@@HTML_(\d+)@@/g, (_, index: string) => placeholders[Number(index)] ?? "");
}

function renderResumeHtml(source: string): string {
  const body = extractDocumentBody(source)
    .replace(/%.*$/gm, "")
    .replace(/\\\\(?:\[[^\]]*\])?/g, "\n");
  const lines = body.split("\n").map((line) => line.trim());
  const html: string[] = ['<article class="resume-document">'];
  let listOpen = false;
  let centerOpen = false;

  const closeList = () => {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  };
  const closeCenter = () => {
    if (centerOpen) {
      html.push("</div>");
      centerOpen = false;
    }
  };

  for (const rawLine of lines) {
    if (!rawLine) continue;
    if (/^\\begin\{center\}/.test(rawLine)) {
      closeList();
      html.push('<div class="resume-center">');
      centerOpen = true;
      continue;
    }
    if (/^\\end\{center\}/.test(rawLine)) {
      closeList();
      closeCenter();
      continue;
    }
    if (/^\\begin\{itemize\}/.test(rawLine)) {
      closeCenter();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      continue;
    }
    if (/^\\end\{itemize\}/.test(rawLine)) {
      closeList();
      continue;
    }
    if (/^\\(?:vspace|smallskip|medskip|bigskip)/.test(rawLine)) {
      continue;
    }

    const section = rawLine.match(/^\\section\*?\{(.+)\}$/);
    if (section) {
      closeList();
      closeCenter();
      html.push(`<h2>${escapeHtml(cleanLatexText(section[1]))}</h2>`);
      continue;
    }

    const item = rawLine.match(/^\\item\s+(.+)$/);
    if (item) {
      closeCenter();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${formatInlineLatex(item[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${formatInlineLatex(rawLine)}</p>`);
  }

  closeList();
  closeCenter();
  html.push("</article>");
  return html.join("");
}

export function ResumePdfPreview({
  latex,
  summary,
  highlights,
  onLatexChange,
}: ResumePdfPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("formatted");
  const formattedHtml = renderResumeHtml(latex);

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      active
        ? "bg-brand-600 text-white shadow-sm"
        : "text-brand-700 hover:bg-brand-50"
    }`;

  return (
    <div className="card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-brand-900">Resume Preview</h3>
          <p className="text-xs text-slate-600 mt-1">{summary}</p>
          {highlights.length > 0 && (
            <ul className="mt-2 text-xs text-slate-600 space-y-0.5 list-disc list-inside">
              {highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() =>
              downloadFile(latex, "tailored-resume.tex", "application/x-tex")
            }
          >
            Download .tex
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-brand-50 rounded-xl border border-brand-100">
        <button
          type="button"
          className={tabClass(mode === "formatted")}
          onClick={() => setMode("formatted")}
        >
          Formatted
        </button>
        <button type="button" className={tabClass(mode === "source")} onClick={() => setMode("source")}>
          LaTeX source
        </button>
      </div>

      {mode === "formatted" && (
        <div
          className="latex-preview rounded-xl border border-brand-200 bg-white p-6 overflow-auto max-h-[min(80vh,720px)] shadow-inner"
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      )}

      {mode === "source" && (
        <div className="space-y-2">
          <label htmlFor="latex-editor" className="text-xs font-semibold text-brand-800">
            Editable LaTeX
          </label>
          <textarea
            id="latex-editor"
            value={latex}
            onChange={(event) => onLatexChange(event.target.value)}
            spellCheck={false}
            className="min-h-[520px] w-full resize-y rounded-xl border border-brand-800 bg-brand-950 p-4 font-mono text-xs leading-relaxed text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <p className="text-xs text-slate-500">Changes update the formatted preview and downloaded file.</p>
        </div>
      )}
    </div>
  );
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  downloadBlob(blob, filename);
}
