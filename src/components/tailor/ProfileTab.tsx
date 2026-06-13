"use client";

import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Plus, X, Pencil, RotateCcw } from "lucide-react";
import { useAppStore, canProceedFromProfile } from "@/lib/tailor/store";
import { parseResume } from "@/lib/tailor/parse-resume.functions";
import type {
  ParsedEducation,
  ParsedExperience,
  ParsedProject,
} from "@/lib/tailor/types";
import { TabActions } from "./TabActions";

interface ProfileTabProps {
  onNext: () => void;
}

export function ProfileTab({ onNext }: ProfileTabProps) {
  const { profile, setResumeText, setParsed, updateParsed } = useAppStore();
  const parseFn = useServerFn(parseResume);

  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const canNext = canProceedFromProfile(profile);
  const parsed = profile.parsed;

  const handleParse = useCallback(async () => {
    if (profile.resumeText.trim().length < 50) {
      setParseError("Add at least 50 characters of resume text first.");
      return;
    }
    setParsing(true);
    setParseError(null);
    try {
      const result = await parseFn({ data: { resumeText: profile.resumeText } });
      setParsed(result);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Couldn't parse resume");
    } finally {
      setParsing(false);
    }
  }, [profile.resumeText, parseFn, setParsed]);

  return (
    <div className="space-y-6">
      <div className="card card-accent space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
            Step 1
          </p>
          <h2 className="text-xl font-bold text-brand-900">Your Profile</h2>
          <p className="mt-1 text-sm text-slate-600">
            Paste your resume, then let AI parse it into clean, editable fields so every
            downstream step gets accurate data.
          </p>
        </div>

        {(!parsed || showRaw) && (
          <div>
            <label
              htmlFor="resumeText"
              className="block text-sm font-semibold text-brand-800 mb-1.5"
            >
              Resume text
            </label>
            <textarea
              id="resumeText"
              rows={parsed ? 8 : 14}
              className="input-field font-mono text-xs leading-relaxed"
              placeholder="Paste your full resume here — name, contact details, experience, education, skills, projects..."
              value={profile.resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              {profile.resumeText.length} characters
              {profile.resumeText.length > 0 && profile.resumeText.length < 200 && (
                <span className="text-amber-600">
                  {" "}— aim for 800+ chars for accurate parsing
                </span>
              )}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleParse}
            disabled={parsing || profile.resumeText.trim().length < 50}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            {parsing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {parsed ? "Re-analyze resume" : "Analyze my resume"}
          </button>
          {parsed && (
            <button
              type="button"
              onClick={() => setShowRaw((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50 text-xs font-medium"
            >
              <Pencil className="w-3.5 h-3.5" />
              {showRaw ? "Hide raw text" : "Edit raw text"}
            </button>
          )}
          {parsed && (
            <button
              type="button"
              onClick={() => setParsed(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50 text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear parsed
            </button>
          )}
        </div>

        {parseError && (
          <p className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {parseError}
          </p>
        )}

        {parsed && (
          <ParsedEditor
            parsed={parsed}
            onPatch={updateParsed}
          />
        )}

        <TabActions onNext={onNext} nextDisabled={!canNext} nextLabel="Find jobs" />
      </div>
    </div>
  );
}

/* ---------------- Parsed editor ---------------- */

function ParsedEditor({
  parsed,
  onPatch,
}: {
  parsed: NonNullable<ReturnType<typeof useAppStore.getState>["profile"]["parsed"]>;
  onPatch: (patch: Partial<typeof parsed>) => void;
}) {
  return (
    <div className="space-y-5 border-t border-brand-100 pt-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand-600" />
        <h3 className="text-sm font-bold text-brand-900">
          Parsed profile — edit anything before continuing
        </h3>
      </div>

      {/* Contact */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Name" value={parsed.name} onChange={(v) => onPatch({ name: v })} />
        <Field label="Headline" value={parsed.headline} onChange={(v) => onPatch({ headline: v })} />
        <Field label="Email" value={parsed.email} onChange={(v) => onPatch({ email: v })} />
        <Field label="Phone" value={parsed.phone} onChange={(v) => onPatch({ phone: v })} />
        <Field
          label="Location"
          value={parsed.location}
          onChange={(v) => onPatch({ location: v })}
        />
        <Field
          label="Links (comma-separated)"
          value={parsed.links.join(", ")}
          onChange={(v) =>
            onPatch({
              links: v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </div>

      {/* Summary */}
      <div>
        <label className="block text-xs font-semibold text-brand-800 mb-1">Summary</label>
        <textarea
          rows={3}
          className="input-field text-sm"
          value={parsed.summary}
          onChange={(e) => onPatch({ summary: e.target.value })}
        />
      </div>

      {/* Skills chips */}
      <ChipsField
        label="Skills"
        items={parsed.skills}
        onChange={(items) => onPatch({ skills: items })}
        placeholder="Add a skill and press Enter"
      />

      {/* Experience */}
      <ListSection
        title="Experience"
        items={parsed.experience}
        onChange={(items) => onPatch({ experience: items })}
        empty={{ company: "", title: "", dates: "", location: "", bullets: [] }}
        renderItem={(exp, update) => (
          <ExperienceEditor exp={exp} update={update} />
        )}
      />

      {/* Education */}
      <ListSection
        title="Education"
        items={parsed.education}
        onChange={(items) => onPatch({ education: items })}
        empty={{ degree: "", institution: "", dates: "" }}
        renderItem={(ed, update) => <EducationEditor ed={ed} update={update} />}
      />

      {/* Projects */}
      <ListSection
        title="Projects"
        items={parsed.projects}
        onChange={(items) => onPatch({ projects: items })}
        empty={{ name: "", description: "" }}
        renderItem={(p, update) => <ProjectEditor p={p} update={update} />}
      />

      {/* Certifications chips */}
      <ChipsField
        label="Certifications"
        items={parsed.certifications}
        onChange={(items) => onPatch({ certifications: items })}
        placeholder="Add a certification and press Enter"
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-brand-800 mb-1">{label}</label>
      <input
        className="input-field text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ChipsField({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim();
    if (!v) return;
    if (!items.includes(v)) onChange([...items, v]);
    setDraft("");
  };
  return (
    <div>
      <label className="block text-xs font-semibold text-brand-800 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((it) => (
          <span
            key={it}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-medium"
          >
            {it}
            <button
              type="button"
              onClick={() => onChange(items.filter((x) => x !== it))}
              className="text-brand-600 hover:text-brand-900"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-slate-400">None — add some below</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="input-field text-sm flex-1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={commit}
          className="px-3 py-2 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50 text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function ListSection<T>({
  title,
  items,
  onChange,
  empty,
  renderItem,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const updateAt = (i: number, patch: Partial<T>) => {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-brand-800">{title}</label>
        <button
          type="button"
          onClick={() => onChange([...items, { ...empty }])}
          className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div
            key={i}
            className="relative rounded-xl border border-brand-100 bg-brand-50/40 p-3"
          >
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-2 right-2 text-slate-400 hover:text-rose-600"
              aria-label="Remove"
            >
              <X className="w-4 h-4" />
            </button>
            {renderItem(it, (patch) => updateAt(i, patch))}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-slate-400 italic">None added yet</p>
        )}
      </div>
    </div>
  );
}

function ExperienceEditor({
  exp,
  update,
}: {
  exp: ParsedExperience;
  update: (patch: Partial<ParsedExperience>) => void;
}) {
  return (
    <div className="space-y-2 pr-6">
      <div className="grid sm:grid-cols-2 gap-2">
        <Field label="Title" value={exp.title} onChange={(v) => update({ title: v })} />
        <Field label="Company" value={exp.company} onChange={(v) => update({ company: v })} />
        <Field label="Dates" value={exp.dates} onChange={(v) => update({ dates: v })} />
        <Field
          label="Location"
          value={exp.location ?? ""}
          onChange={(v) => update({ location: v })}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-brand-800 mb-1">
          Bullets (one per line)
        </label>
        <textarea
          rows={Math.max(3, exp.bullets.length + 1)}
          className="input-field text-sm"
          value={exp.bullets.join("\n")}
          onChange={(e) =>
            update({
              bullets: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
            })
          }
        />
      </div>
    </div>
  );
}

function EducationEditor({
  ed,
  update,
}: {
  ed: ParsedEducation;
  update: (patch: Partial<ParsedEducation>) => void;
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-2 pr-6">
      <Field label="Degree" value={ed.degree} onChange={(v) => update({ degree: v })} />
      <Field
        label="Institution"
        value={ed.institution}
        onChange={(v) => update({ institution: v })}
      />
      <Field label="Dates" value={ed.dates} onChange={(v) => update({ dates: v })} />
    </div>
  );
}

function ProjectEditor({
  p,
  update,
}: {
  p: ParsedProject;
  update: (patch: Partial<ParsedProject>) => void;
}) {
  return (
    <div className="space-y-2 pr-6">
      <Field label="Name" value={p.name} onChange={(v) => update({ name: v })} />
      <div>
        <label className="block text-xs font-semibold text-brand-800 mb-1">Description</label>
        <textarea
          rows={2}
          className="input-field text-sm"
          value={p.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>
    </div>
  );
}
