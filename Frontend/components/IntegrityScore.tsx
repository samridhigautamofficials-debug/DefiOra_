import type { IntegrityReport } from "@/lib/types";

type IntegrityScoreProps = {
  report: IntegrityReport;
};

function scoreTone(score: number) {
  if (score <= 70) return { ring: "#ff725e", label: "text-[#b94736]", surface: "bg-[#fff0eb]" };
  if (score < 100) return { ring: "#c99434", label: "text-[#8b6718]", surface: "bg-[#fff9e9]" };
  return { ring: "#13866b", label: "text-[#075b4c]", surface: "bg-[#e4f3ec]" };
}

export function IntegrityScore({ report }: IntegrityScoreProps) {
  const tone = scoreTone(report.integrityScore);
  const degrees = Math.max(0, Math.min(360, report.integrityScore * 3.6));
  const hasScoreImpact = report.findings.some((finding) => finding.scoreImpact > 0);
  const statusClass = report.status === "READY TO REVIEW"
    ? "status-pill-green"
    : report.status === "REVIEW REQUIRED"
      ? "status-pill-amber"
      : "status-pill-coral";

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#e2eae4] bg-white p-6 shadow-[0_14px_45px_rgba(20,63,59,0.07)] sm:p-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Application integrity</p>
          <h2 className="font-display mt-2 text-4xl text-[#143f3b]">Integrity score</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#607a78]">Product risk indicator based on detected evidence issues. It is a review aid, not a probability or a final decision.</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(${tone.ring} 0deg ${degrees}deg, #edf4ef ${degrees}deg 360deg)` }}>
            <div className={`flex h-24 w-24 flex-col items-center justify-center rounded-full ${tone.surface}`}>
              <span className={`font-display text-4xl ${tone.label}`}>{report.integrityScore}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#607a78]">of 100</span>
            </div>
          </div>
          <div>
            <span className={`status-pill ${statusClass}`}>{report.status}</span>
            <p className="mt-3 max-w-[190px] text-sm leading-5 text-[#607a78]">
              {!hasScoreImpact && report.integrityScore === 100
                ? "No detected contradictions. Review the portal before submitting."
                : !hasScoreImpact
                  ? "No score-impacting issues detected."
                  : "Review the flagged evidence before continuing."}
            </p>
          </div>
        </div>
      </div>

      {report.scoreReasons.length > 0 && (
        <div className="mt-8 border-t border-[#e2eae4] pt-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#607a78]">Why this score?</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {report.scoreReasons.map((reason) => (
              <div key={reason} className="rounded-xl border border-[#e2eae4] bg-[#f7fbf8] px-3 py-3 text-sm leading-5 text-[#143f3b]">{reason}</div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
