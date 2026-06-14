"use client";

import { useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAppStore, getProfileContent } from "@/lib/tailor/store";
import { generateInterviewPrep } from "@/lib/tailor/generate-interview-prep.functions";
import { TabActions } from "./TabActions";
import { Loader2, MessageSquare, Code, Lightbulb, Target } from "lucide-react";

interface InterviewTabProps {
  onBack: () => void;
}

export function InterviewTab({ onBack }: InterviewTabProps) {
  const {
    profile,
    jd,
    result,
    interviewPrep,
    isGeneratingInterview,
    error,
    setInterviewPrep,
    setIsGeneratingInterview,
    setError,
  } = useAppStore();

  const generateFn = useServerFn(generateInterviewPrep);

  const handleGenerate = useCallback(async () => {
    setIsGeneratingInterview(true);
    setError(null);

    try {
      const data = await generateFn({
        data: {
          profileContent: getProfileContent(profile),
          jobDescription: jd.jobDescription,
          matchData: result?.match,
        },
      });
      setInterviewPrep(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGeneratingInterview(false);
    }
  }, [profile, jd, result, generateFn, setInterviewPrep, setIsGeneratingInterview, setError]);

  return (
    <div className="space-y-6">
      <div className="card card-accent">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
            Step 5
          </p>
          <h2 className="text-xl font-bold text-brand-900">Interview Preparation</h2>
          <p className="mt-1 text-sm text-slate-600">
            Generate tailored interview questions and strategies based on your profile and this specific role.
          </p>
        </div>

        {!interviewPrep && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGeneratingInterview}
            className="btn-primary w-full sm:w-auto"
          >
            {isGeneratingInterview ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Guide...
              </>
            ) : (
              "Generate Interview Guide"
            )}
          </button>
        )}

        <TabActions showBack onBack={onBack} />

        {error && (
          <p className="mt-4 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
      </div>

      {interviewPrep && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="card">
              <div className="flex items-center gap-2 mb-4 text-brand-900">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-bold">Behavioral Questions</h3>
              </div>
              <div className="space-y-4">
                {interviewPrep.behavioralQuestions.map((q, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <p className="font-semibold text-sm text-slate-900 mb-2">Q: {q.question}</p>
                    <div className="text-xs text-slate-600 space-y-2">
                      <p><span className="font-bold text-brand-700">Suggested Answer:</span> {q.suggestedAnswer}</p>
                      <p className="italic font-medium text-slate-500">Why asked: {q.whyAsked}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="flex items-center gap-2 mb-4 text-brand-900">
                <Code className="h-5 w-5" />
                <h3 className="font-bold">Technical & Role-Specific</h3>
              </div>
              <div className="space-y-4">
                {interviewPrep.technicalQuestions.map((q, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <p className="font-semibold text-sm text-slate-900 mb-2">Q: {q.question}</p>
                    <div className="text-xs text-slate-600 space-y-2">
                      <p><span className="font-bold text-brand-700">Approach:</span> {q.suggestedAnswer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="card bg-brand-50/30 border-brand-100">
              <div className="flex items-center gap-2 mb-4 text-brand-900">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold">Company & Role Insights</h3>
              </div>
              <ul className="space-y-2">
                {interviewPrep.companyInsights.map((insight, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-brand-500 font-bold">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </section>

            <section className="card bg-brand-50/30 border-brand-100">
              <div className="flex items-center gap-2 mb-4 text-brand-900">
                <Target className="h-5 w-5 text-brand-600" />
                <h3 className="font-bold">Preparation Strategy</h3>
              </div>
              <ul className="space-y-2">
                {interviewPrep.preparationStrategy.map((strategy, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-brand-500 font-bold">{i + 1}.</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </section>
          </div>
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGeneratingInterview}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium underline"
            >
              Regenerate Interview Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
