"use client";

import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateInterviewPrep } from "@/lib/tailor/interview-prep.functions";
import { getProfileContent, useAppStore } from "@/lib/tailor/store";
import { TabActions } from "./TabActions";

interface InterviewTabProps { onBack: () => void }

export function InterviewTab({ onBack }: InterviewTabProps) {
  const { profile, jd, result, interviewPrep, isGeneratingInterview, setInterviewPrep, setIsGeneratingInterview } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const generateFn = useServerFn(generateInterviewPrep);

  const handleGenerate = useCallback(async () => {
    if (!result) return;
    setIsGeneratingInterview(true);
    setError(null);
    try {
      const prep = await generateFn({ data: {
        profileContent: getProfileContent(profile),
        jobDescription: jd.jobDescription,
        matchedKeywords: result.match.matchedKeywords,
        missingKeywords: result.match.missingKeywords,
      } });
      setInterviewPrep(prep);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate interview preparation");
    } finally {
      setIsGeneratingInterview(false);
    }
  }, [generateFn, jd.jobDescription, profile, result, setInterviewPrep, setIsGeneratingInterview]);

  const copyPrep = useCallback(async () => {
    if (!interviewPrep) return;
    const text = interviewPrep.questions.map((item, index) => `${index + 1}. ${item.question}\nWhy: ${item.whyAsked}\nEvidence: ${item.evidence}\nAnswer plan:\n${item.answerPlan.map((step) => `- ${step}`).join("\n")}`).join("\n\n");
    await navigator.clipboard.writeText(text);
  }, [interviewPrep]);

  return (
    <div className="space-y-6">
      <section className="card card-accent space-y-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">Step 5</p>
          <h2 className="text-xl font-bold text-brand-900">Interview Preparation</h2>
          <p className="mt-1 text-sm text-slate-600">Practice likely questions using your real experience, matched strengths, and honest ways to address gaps.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleGenerate} disabled={!result || isGeneratingInterview}>
            <Sparkles /> {isGeneratingInterview ? "Preparing…" : interviewPrep ? "Regenerate questions" : "Generate interview prep"}
          </Button>
          {interviewPrep && <Button type="button" variant="outline" onClick={copyPrep}><Copy /> Copy all</Button>}
        </div>
        {!result && <p className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">Generate a tailored resume first so the questions can be grounded in your application.</p>}
        {error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
        <TabActions showBack onBack={onBack} />
      </section>

      {interviewPrep && <section className="card">
        <h3 className="font-display text-lg font-semibold text-foreground">Your question set</h3>
        <p className="mt-1 text-sm text-muted-foreground">Open each question for a grounded answer plan. Adapt the wording to sound like you.</p>
        <Accordion type="single" collapsible className="mt-3 w-full">
          {interviewPrep.questions.map((item, index) => <AccordionItem key={`${index}-${item.question}`} value={`question-${index}`}>
            <AccordionTrigger className="gap-4 no-underline hover:no-underline"><span className="flex items-start gap-3"><span className="mt-0.5 text-xs font-bold text-primary">{String(index + 1).padStart(2, "0")}</span><span>{item.question}</span></span></AccordionTrigger>
            <AccordionContent className="space-y-4 pl-8">
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Why they may ask</p><p className="mt-1 text-sm text-muted-foreground">{item.whyAsked}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Evidence to use</p><p className="mt-1 text-sm text-muted-foreground">{item.evidence}</p></div>
              <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Answer plan</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">{item.answerPlan.map((step) => <li key={step}>{step}</li>)}</ol></div>
            </AccordionContent>
          </AccordionItem>)}
        </Accordion>
      </section>}
    </div>
  );
}