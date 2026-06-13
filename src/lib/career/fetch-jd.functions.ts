import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  url: z.string().url().refine(isSafePublicUrl, "Only public HTTPS job links are supported"),
  fallback: z.string().optional().default(""),
});

function isSafePublicUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase().replace(/\.$/, "");
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return false;
    if (/^(?:127\.|10\.|192\.168\.|169\.254\.|0\.|224\.|240\.)/.test(host)) return false;
    if (/^172\.(?:1[6-9]|2\d|3[01])\./.test(host)) return false;
    if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) return false;
    return true;
  } catch {
    return false;
  }
}

function htmlToText(html: string): string {
  // Strip scripts/styles
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, " ");
  s = s.replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  // Replace block tags with newlines
  s = s.replace(/<\/(p|div|li|h[1-6]|br|tr|section|article)>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  // Strip remaining tags
  s = s.replace(/<[^>]+>/g, " ");
  // Decode common entities
  s = s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
  // Collapse whitespace
  s = s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

export interface FetchJdResult {
  text: string;
  source: "url" | "fallback";
  finalUrl?: string;
}

export const fetchJobDescription = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<FetchJdResult> => {
    try {
      const res = await fetch(data.url, {
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; ATSResumeReadyBot/1.0; +https://atsresumeready.com)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      if (!isSafePublicUrl(res.url)) throw new Error("Unsafe redirect");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const text = htmlToText(html);
      if (text.length < 200) throw new Error("Extracted text too short");
      // Trim very long pages but keep enough context
      const trimmed = text.length > 15000 ? text.slice(0, 15000) : text;
      return { text: trimmed, source: "url", finalUrl: res.url };
    } catch {
      if (data.fallback && data.fallback.trim().length > 0) {
        return { text: data.fallback, source: "fallback" };
      }
      throw new Error(
        "Couldn't fetch the job posting (the site may block bots). Open it in a new tab and paste the JD manually.",
      );
    }
  });
