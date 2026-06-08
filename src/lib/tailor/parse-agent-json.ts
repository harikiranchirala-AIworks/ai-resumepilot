/** Extract and parse JSON from agent text (handles optional markdown fences). */
export function parseAgentJson<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Agent response did not contain JSON");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
