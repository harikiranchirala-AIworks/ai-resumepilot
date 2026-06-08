"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PreviewMode = "pdf" | "formatted" | "source";
type PdfSource = "server" | "client" | null;

interface ResumePdfPreviewProps {
  latex: string;
  summary: string;
  highlights: string[];
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
}: ResumePdfPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("pdf");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfSource, setPdfSource] = useState<PdfSource>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlReady, setHtmlReady] = useState(false);

  const htmlHostRef = useRef<HTMLDivElement>(null);
  const printHostRef = useRef<HTMLDivElement>(null);

  const renderLatexHtml = useCallback(async (target: HTMLElement) => {
    target.innerHTML = renderResumeHtml(latex);
  }, [latex]);


  const buildClientPdf = useCallback(async () => {
    if (!printHostRef.current) return null;

    await renderLatexHtml(printHostRef.current);

    const html2pdf = (await import("html2pdf.js")).default as unknown as () => {
      set: (opts: Record<string, unknown>) => {
        from: (el: HTMLElement) => {
          outputPdf: (type: "blob") => Promise<Blob>;
        };
      };
    };
    const blob = await html2pdf()
      .set({
        margin: [0.45, 0.45, 0.45, 0.45],
        filename: "tailored-resume.pdf",
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(printHostRef.current)
      .outputPdf("blob");

    return blob;
  }, [renderLatexHtml]);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;

    async function buildPdf() {
      setLoading(true);
      setError(null);
      setPdfUrl(null);
      setPdfBlob(null);
      setPdfSource(null);
      setHtmlReady(false);

      try {
        const blob = await buildClientPdf();
        if (cancelled || !blob) return;
        const url = URL.createObjectURL(blob);
        revoked = url;
        setPdfBlob(blob);
        setPdfUrl(url);
        setPdfSource("client");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not build PDF preview"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    buildPdf();

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [latex, buildClientPdf]);

  useEffect(() => {
    if (mode !== "formatted" || !htmlHostRef.current || htmlReady) return;

    let cancelled = false;
    renderLatexHtml(htmlHostRef.current)
      .then(() => {
        if (!cancelled) setHtmlReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Preview render failed");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mode, htmlReady, latex, renderLatexHtml]);

  useEffect(() => {
    setHtmlReady(false);
  }, [latex]);

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
          {pdfBlob && (
            <button
              type="button"
              className="btn-primary text-xs"
              onClick={() => downloadBlob(pdfBlob, "tailored-resume.pdf")}
            >
              Download PDF
            </button>
          )}
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
        <button type="button" className={tabClass(mode === "pdf")} onClick={() => setMode("pdf")}>
          PDF
        </button>
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

      {pdfSource && mode === "pdf" && (
        <p className="text-xs text-brand-600">
          {pdfSource === "server"
            ? "Rendered with pdflatex (print-quality)."
            : "Rendered in-browser — install MiKTeX for print-quality PDF."}
        </p>
      )}

      {mode === "pdf" && (
        <div className="rounded-xl border border-brand-200 bg-slate-100 overflow-hidden min-h-[480px]">
          {loading && (
            <div className="flex items-center justify-center h-[520px] text-sm text-brand-700">
              Building PDF preview…
            </div>
          )}
          {!loading && error && (
            <div className="p-6 text-sm text-rose-700 bg-rose-50">{error}</div>
          )}
          {!loading && pdfUrl && (
            <iframe
              title="Resume PDF preview"
              src={pdfUrl}
              className="w-full h-[min(80vh,720px)] bg-white"
            />
          )}
        </div>
      )}

      {mode === "formatted" && (
        <div
          ref={htmlHostRef}
          className="latex-preview rounded-xl border border-brand-200 bg-white p-6 overflow-auto max-h-[min(80vh,720px)] shadow-inner"
        />
      )}

      {mode === "source" && (
        <pre className="rounded-xl bg-brand-950 text-brand-100 p-4 text-xs overflow-x-auto max-h-[min(80vh,720px)] overflow-y-auto font-mono leading-relaxed border border-brand-800">
          {latex}
        </pre>
      )}

      {/* Off-screen host for html2pdf (must be in DOM) */}
      <div
        ref={printHostRef}
        className="latex-print-host fixed left-[-9999px] top-0 w-[210mm] bg-white p-8 text-black text-sm leading-relaxed"
        aria-hidden
      />
    </div>
  );
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  downloadBlob(blob, filename);
}
