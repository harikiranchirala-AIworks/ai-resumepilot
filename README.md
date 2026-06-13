# ResumePilot

> AI-powered resume tailoring, job matching, and cover letter generation.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ai--resumepilot.lovable.app-blue)](https://ai-resumepilot.lovable.app)

## What is this?

ResumePilot helps you customize your resume for any job description. Paste your resume, discover matching jobs, pick one, and generate an ATS-friendly LaTeX resume plus a tailored cover letter — all with honest, AI-assisted content that never fabricates your experience.

---

## V2 Features

### 1. Profile Intelligence
- Paste your full resume text in one box.
- AI parses it into clean, structured fields: name, contact, headline, summary, skills, experience, education, projects, and certifications.
- Edit anything before moving forward — your data stays accurate for every downstream step.

### 2. Better Job Matching (Top 20 Picks)
- Scans real job postings from Adzuna plus compliant public feeds (Remotive and Arbeitnow).
- Normalizes and deduplicates matching company/title listings across sources.
- AI ranks the **top 20** jobs by fitment (skills overlap, seniority, domain).
- Each pick includes:
  - Fitment percentage (0–100)
  - Honest justification (why it fits)
  - Gap note (what to brush up on)
- **Filters:** comma-separated locations, remote-only toggle, minimum salary (₹/year).

### 3. Smarter Resume Tailoring
- Generates a tailored **LaTeX resume** for the job you select.
- **Match analysis:** overall score + keyword, skills, and experience breakdowns with matched vs. missing keywords.
- **ATS compatibility:** score, strengths, issues, and formatting tips.
- **Editable LaTeX:** switch to the Source tab to edit the raw LaTeX in real time; preview and download update instantly.

### 4. Tailored Cover Letter
- Generate a role-specific cover letter (250–350 words) from your profile and the job description.
- Fully editable textarea — tweak tone and details before copying.
- One-click copy to clipboard.

### 5. Share for Feedback
- Create a 90-day shareable link with the selected job and tailored preview.
- Mentors or reviewers see the fit analysis and resume without accessing your source profile.

---

## How to Use

### Step 1 — Profile
1. Paste your complete resume into the **Resume text** box.
2. Click **Analyze my resume**.
3. Review the parsed fields (skills, experience, education, etc.).
4. Edit anything that looks off — this is your source of truth for the rest of the app.
5. Click **Next**.

### Step 2 — Available Jobs
1. Enter one or more locations (comma-separated), e.g. `Hyderabad, Bangalore, Remote`.
2. Optionally set a **minimum salary** and check **Remote only**.
3. Click **Find matching jobs**.
4. Browse the ranked top 20 results.
5. Pick a job you like and click **Pick & tailor**.

### Step 3 — Job Description
1. The job description is auto-filled from your selected job.
2. You can paste a different JD if you want to target something else.
3. Click **Next**.

### Step 4 — Resume
1. Click **Generate Resume**.
2. Review the **Match analysis** and **ATS compatibility** cards.
3. Switch between the **Preview** and **Source** tabs to see the rendered PDF or edit the raw LaTeX directly.
4. Click **Download LaTeX (.tex)** when you’re happy with it.
5. Click **Generate Cover Letter** to create an editable cover letter.
6. Edit the letter, then **Copy letter** and paste it into your application.

---

## Tech Stack

- **Frontend:** React 19, Tailwind CSS v4, TanStack Router + TanStack Start
- **State:** Zustand
- **AI:** Lovable AI Gateway (Gemini models)
- **Job data:** Adzuna API, Remotive, and Arbeitnow public feeds
- **PDF preview:** Client-side LaTeX-to-PDF rendering

---

## Running Locally

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
```

### Required Environment Variable

Create a `.env` file (or export in your shell):

```bash
LOVABLE_API_KEY=your_lovable_api_key
```

Without this key, resume generation and cover letters will fall back to templates.

---

## Honesty Disclaimer

The AI tailors and reframes your *existing* experience — it does **not** invent employers, degrees, skills, or metrics. Always review generated content before submitting.

---

## Version History

- **V2** — Profile Intelligence, multi-source deduplicated Top-20 Job Matching, Editable LaTeX, Cover Letter generator
- **V1** — Basic resume tailoring with ATS scoring and LaTeX output

---

*Built with Lovable + TanStack Start.*
