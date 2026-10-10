import { DOCUMENT_LABELS, FIELD_LABELS, type Finding, type VerificationComparison } from "@/lib/types";
import { Icon } from "@/components/Icon";

type FindingCardProps = {
  finding: Finding;
  comparison?: VerificationComparison;
};

const severityClass = {
  HIGH: "status-pill-coral",
  MEDIUM: "status-pill-amber",
  LOW: "status-pill-blue",
  INFO: "status-pill-green",
};

const severityIcon = {
  HIGH: "warning",
  MEDIUM: "search",
  LOW: "search",
  INFO: "check",
} as const;

export function FindingCard({ finding, comparison }: FindingCardProps) {
  const fieldLabel = finding.field === "evidence" ? "Evidence" : FIELD_LABELS[finding.field];

  return (
    <article className="rounded-2xl border border-[#e2eae4] bg-white p-5 shadow-[0_10px_28px_rgba(20,63,59,0.045)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`status-pill ${severityClass[finding.severity]}`}><Icon name={severityIcon[finding.severity]} width={13} height={13} />{finding.severity}</span>
          <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#607a78]">{fieldLabel}</span>
        </div>
        {finding.scoreImpact > 0 && <span className="text-xs font-bold text-[#b94736]">Score impact −{finding.scoreImpact}</span>}
      </div>
      <h3 className="mt-4 font-display text-2xl text-[#143f3b]">{finding.type}</h3>
      <p className="mt-2 text-sm leading-6 text-[#607a78]">{finding.message}</p>
      <div className="mt-5 rounded-xl border border-[#e2eae4] bg-[#f7fbf8] p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#607a78]">Source evidence</p>
        {comparison && comparison.claims.length > 0 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {comparison.claims.map((claim) => (
              <div key={`${claim.source}-${claim.field}`} className="rounded-lg border border-[#e2eae4] bg-white p-3">
                <p className="text-xs font-bold text-[#143f3b]">{DOCUMENT_LABELS[claim.source]}</p>
                <p className="mt-1 break-words text-sm font-semibold text-[#607a78]">{claim.value}</p>
              </div>
            ))}
          </div>
        ) : finding.sources.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {finding.sources.map((source) => <span key={source} className="rounded-full border border-[#c9dfd2] bg-white px-2.5 py-1 text-xs font-semibold text-[#607a78]">{DOCUMENT_LABELS[source]}</span>)}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#607a78]">Source unavailable for this system-level message.</p>
        )}
      </div>
      <div className="mt-4 rounded-xl border border-[#bcdccc] bg-[#e4f3ec] p-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#075b4c]">Recommended next step</p>
        <p className="mt-1 text-sm leading-5 text-[#143f3b]">{finding.recommendation}</p>
      </div>
    </article>
  );
}
