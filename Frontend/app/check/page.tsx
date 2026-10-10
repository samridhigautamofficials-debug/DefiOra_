"use client";

import { useState } from "react";
import { ActionChecklist } from "@/components/ActionChecklist";
import { EvidenceGraph } from "@/components/EvidenceGraph";
import { FindingCard } from "@/components/FindingCard";
import { Icon } from "@/components/Icon";
import { IntegrityScore } from "@/components/IntegrityScore";
import { SiteHeader } from "@/components/SiteHeader";
import { UploadCard } from "@/components/UploadCard";
import { DOCUMENT_LABELS, type AnalyzeResponse, type DocumentType, type IntegrityReport } from "@/lib/types";

const workflowSteps = ["Upload", "Extract", "Verify", "Review"];
const analysisStages = [
  "Reading evidence",
  "Extracting claims",
  "Comparing sources",
  "Building evidence graph",
  "Generating security assessment",
];
const emptyFiles: Record<DocumentType, File | null> = {
  application: null,
  identity: null,
  academic: null,
};

function isAllowedFile(file: File) {
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  return ["pdf", "png", "jpg", "jpeg"].includes(extension) || ["application/pdf", "image/png", "image/jpeg"].includes(file.type);
}

function friendlyError(data: AnalyzeResponse | null) {
  return data?.result.findings[0]?.message ?? "DefiOra could not complete this check. Please try again.";
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function CheckPage() {
  const [files, setFiles] = useState<Record<DocumentType, File | null>>(emptyFiles);
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRunWasDemo, setLastRunWasDemo] = useState(false);

  function selectFile(source: DocumentType, file: File | null) {
    if (!file) return;
    if (!isAllowedFile(file)) {
      setError(`${DOCUMENT_LABELS[source]} must be a PDF, PNG, JPG, or JPEG file.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(`${DOCUMENT_LABELS[source]} is larger than 10 MB. Choose a smaller file.`);
      return;
    }
    setError(null);
    setFiles((current) => ({ ...current, [source]: file }));
  }

  async function runCheck(demo = false) {
    setError(null);
    setReport(null);
    setLoading(true);
    setLastRunWasDemo(demo);

    try {
      if (demo) {
        const response = await fetch(`${backendUrl}/api/demo`);
        const data = (await response.json()) as AnalyzeResponse;
        if (response.ok && data.success && data.result) {
          setReport(data.result);
        } else {
          setReport(null);
          setError(friendlyError(data));
        }
      } else {
        if (!files.application || !files.identity) {
          setError("Add the application and identity documents to start the check.");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        for (const source of ["application", "identity", "academic"] as const) {
          if (files[source]) formData.append(`${source}File`, files[source]);
        }
        const response = await fetch(`${backendUrl}/api/analyze`, { method: "POST", body: formData });
        const data = (await response.json()) as AnalyzeResponse;
        if (response.ok && data.success && data.result) {
          setReport(data.result);
        } else {
          setReport(null);
          setError(friendlyError(data));
        }
      }
    } catch {
      setError("DefiOra could not reach its analysis service. Please check that the backend is running and try again.");
    } finally {
      setLoading(false);
    }
  }

  const activeWorkflowStep = loading ? 1 : report ? 3 : 0;

  return (
    <main className="min-h-screen bg-[#fcfaf5] text-[#143f3b]">
      <SiteHeader />

      <div className="shell pb-24 pt-12 sm:pt-16">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#13866b]">
              <span className="h-2 w-2 rounded-full bg-[#ff725e]" />
              DefiOra security check
            </div>
            <h1 className="font-display mt-4 text-4xl leading-[1.04] text-[#143f3b] sm:text-6xl">Your application security checkpoint.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#607a78] sm:text-lg">Verify your evidence before you submit. DefiOra extracts claims, compares supporting evidence, and shows where a human should pause before the final click.</p>
          </div>
          <div id="demo" className="rounded-2xl border border-[#bcdccc] bg-[#e4f3ec] p-5 lg:max-w-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#075b4c]">Demo mode</span>
              <span className="status-pill status-pill-coral">Synthetic data</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#607a78]">Load a synthetic hackathon case to see a reliable evidence conflict.</p>
            <button type="button" onClick={() => runCheck(true)} disabled={loading} className="button button-primary mt-4 w-full justify-center disabled:cursor-wait disabled:opacity-60">
              <Icon name="spark" width={16} height={16} />
              {loading ? "Running checkpoint…" : "Load demo case"}
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-2 md:grid-cols-4" aria-label="Security check progress">
          {workflowSteps.map((step, index) => {
            const complete = index < activeWorkflowStep;
            const active = index === activeWorkflowStep;
            return (
              <div key={step} aria-current={active ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${active ? "border-[#8dcbb0] bg-[#e4f3ec]" : "border-[#e2eae4] bg-white"}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${complete ? "bg-[#d1efdf] text-[#075b4c]" : active ? "bg-[#075b4c] text-white" : "bg-[#f0f5f1] text-[#607a78]"}`}>{complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <span className={`text-xs font-extrabold uppercase tracking-[0.14em] ${active ? "text-[#075b4c]" : complete ? "text-[#13866b]" : "text-[#607a78]"}`}>{step}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-[#ffc4b8] bg-[#fff0eb] p-4 text-sm text-[#8c3e31]">
            <Icon name="warning" width={19} height={19} className="mt-0.5 shrink-0 text-[#ff725e]" />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">Checkpoint needs another look</p>
              <p className="mt-1 text-[#a45a4d]">{error}</p>
            </div>
            <button type="button" onClick={() => runCheck(lastRunWasDemo)} disabled={loading} className="shrink-0 rounded-lg border border-[#e7a79b] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.1em] text-[#8c3e31] transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-50">Try again</button>
          </div>
        )}

        <section className="mt-8 rounded-[28px] border border-[#e2eae4] bg-white p-5 shadow-[0_14px_45px_rgba(20,63,59,0.05)] sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">01 · Upload evidence</p>
              <h2 className="font-display mt-2 text-3xl text-[#143f3b]">Tell DefiOra what each file represents.</h2>
            </div>
            <p className="text-xs text-[#607a78]">Files are checked in memory and are not stored by this prototype.</p>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            <UploadCard source="application" title="Application" description="The information you are about to submit." required icon="document" file={files.application} disabled={loading} onFileSelected={(file) => selectFile("application", file)} />
            <UploadCard source="identity" title="Identity" description="Evidence used to confirm identity information." required icon="shield" file={files.identity} disabled={loading} onFileSelected={(file) => selectFile("identity", file)} />
            <UploadCard source="academic" title="Academic" description="Optional supporting evidence such as a marksheet." icon="clipboard" file={files.academic} disabled={loading} onFileSelected={(file) => selectFile("academic", file)} />
          </div>
          <div className="mt-7 flex flex-col justify-between gap-4 border-t border-[#e2eae4] pt-5 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-[#607a78]">Accepted: PDF, PNG, JPG, JPEG · maximum 10 MB per file</p>
            <button type="button" onClick={() => runCheck(false)} disabled={loading || !files.application || !files.identity} className="button button-primary justify-center disabled:cursor-not-allowed disabled:opacity-40">
              <Icon name="shieldCheck" width={17} height={17} />
              {loading ? "Analyzing evidence…" : "Analyze my application"}
              {!loading && <Icon name="arrow" width={17} height={17} />}
            </button>
          </div>
        </section>

        {loading && (
          <section className="mt-8 rounded-[28px] border border-[#bcdccc] bg-[#e4f3ec] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#075b4c]"><Icon name="spark" width={20} height={20} className="animate-pulse" /></div>
              <div>
                <p className="font-extrabold text-[#143f3b]">Analysis in progress</p>
                <p className="mt-1 text-sm text-[#607a78]">Reading evidence, extracting claims, comparing sources, and building the evidence graph…</p>
              </div>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-5">
              {analysisStages.map((stage, index) => (
                <div key={stage} className="flex items-center gap-2 rounded-lg border border-[#c9dfd2] bg-white/60 px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#075b4c]">
                  <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#ff725e]" />
                  <span>{String(index + 1).padStart(2, "0")} {stage}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {report && !loading && (
          <div className="mt-8 space-y-8">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">02–04 · Security report</p>
                <h2 className="font-display mt-2 text-4xl text-[#143f3b]">Here is what the evidence says.</h2>
              </div>
              {report.demoMode && <span className="status-pill status-pill-coral self-start"><Icon name="spark" width={13} height={13} /> Using synthetic hackathon data</span>}
            </div>

            <IntegrityScore report={report} />
            <EvidenceGraph report={report} />

            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Security findings</p>
                  <h2 className="font-display mt-2 text-3xl text-[#143f3b]">Review points, with context.</h2>
                </div>
                <span className="text-xs font-bold text-[#607a78]">{report.findings.length} finding{report.findings.length === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {report.findings.map((finding, index) => <FindingCard key={`${finding.type}-${finding.field}-${index}`} finding={finding} comparison={report.comparisons.find((comparison) => comparison.field === finding.field)} />)}
              </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
              <ActionChecklist items={report.checklist} />
              <section className="rounded-[28px] border border-[#e9d6a9] bg-[#fff9e9] p-6 sm:p-8">
                <p className="eyebrow text-[#8b6718]">Submission portal</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-3xl text-[#143f3b]">Review the destination too.</h2>
                  <span className="status-pill status-pill-amber">Prototype feature</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#607a78]">DefiOra does not pretend arbitrary websites are verified. This is a deliberate pause for the human submitting the form.</p>
                <div className="mt-6 rounded-2xl border border-[#e9d6a9] bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-extrabold text-[#143f3b]">{report.portalCheck.portal}</span>
                    <span className="status-pill status-pill-amber">{report.portalCheck.status}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#607a78]">{report.portalCheck.reason}</p>
                </div>
                <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#8b6718]">Potential trusted sources</p>
                <div className="mt-3 space-y-2">
                  {report.portalCheck.trustedSources.map((source) => <div key={source} className="flex items-center gap-2 text-sm text-[#607a78]"><span className="text-[#ff725e]">•</span>{source}</div>)}
                </div>
              </section>
            </div>

            <div className="rounded-2xl border border-[#e2eae4] bg-white p-5 text-sm leading-6 text-[#607a78] shadow-[0_8px_24px_rgba(20,63,59,0.04)]">
              <span className="font-extrabold text-[#143f3b]">DefiOra&apos;s recommendation: </span>{report.recommendation}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-[#bcdccc] bg-[#e4f3ec] p-4 text-xs leading-5 text-[#607a78]">
          <Icon name="lock" width={17} height={17} className="mt-0.5 shrink-0 text-[#075b4c]" />
          <p><span className="font-extrabold text-[#143f3b]">Prototype privacy note:</span> DefiOra uses synthetic/demo data for the hackathon. Never upload real identity documents to the demo.</p>
        </div>
      </div>
    </main>
  );
}
