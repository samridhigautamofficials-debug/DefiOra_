import {
  DOCUMENT_LABELS,
  FIELD_LABELS,
  type ComparisonStatus,
  type EvidenceGraphNode,
  type EvidenceGraphRelationship,
  type IntegrityReport,
} from "@/lib/types";
import { Icon } from "@/components/Icon";

type EvidenceGraphProps = { report: IntegrityReport };

const statusClass: Record<ComparisonStatus, string> = {
  MATCH: "border-[#acd9c4] bg-[#effaf4] text-[#075b4c]",
  FORMAT_DIFFERENCE: "border-[#b7d4e0] bg-[#eff8fb] text-[#28647a]",
  CONFLICT: "border-[#ffc4b8] bg-[#fff0eb] text-[#b94736]",
  MISSING: "border-[#e9d6a9] bg-[#fff9e9] text-[#8b6718]",
  REVIEW: "border-[#e9d6a9] bg-[#fff9e9] text-[#8b6718]",
};

const statusIcon: Record<ComparisonStatus, "check" | "warning" | "search"> = {
  MATCH: "check",
  FORMAT_DIFFERENCE: "search",
  CONFLICT: "warning",
  MISSING: "search",
  REVIEW: "search",
};

function statusLabel(status: ComparisonStatus) {
  return status.replace("_", " ");
}

function ClaimNode({ node, emptyLabel }: { node: EvidenceGraphNode | null; emptyLabel: string }) {
  if (!node) {
    return (
      <div className="flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-[#e9d6a9] bg-[#fffdf7] p-4 text-center text-sm text-[#607a78]">
        <span>{emptyLabel}</span>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-2xl border border-[#e2eae4] bg-white p-4 shadow-[0_10px_28px_rgba(20,63,59,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#075b4c]">{DOCUMENT_LABELS[node.source]}</p>
        <span className="rounded-full bg-[#f1faf5] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#13866b]">Source</span>
      </div>
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-[#607a78]">{node.label}</p>
      <p className="mt-2 break-words text-base font-bold text-[#143f3b]">{node.value}</p>
      {node.confidence !== null && node.confidence !== undefined && (
        <p className="mt-2 text-[11px] text-[#607a78]">Extraction confidence {Math.round(node.confidence * 100)}%</p>
      )}
    </div>
  );
}

function RelationshipConnector({ status }: { status: ComparisonStatus }) {
  return (
    <div className="flex min-h-16 flex-col items-center justify-center gap-2 py-1 lg:min-h-0 lg:flex-row lg:py-0" aria-label={`Relationship status: ${statusLabel(status)}`}>
      <span className="h-7 w-px bg-[#c9dfd2] lg:h-px lg:w-8" aria-hidden="true" />
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ${statusClass[status]}`}>
        <Icon name={statusIcon[status]} width={13} height={13} />
        {statusLabel(status)}
      </span>
      <span className="text-[#13866b]" aria-hidden="true"><span className="lg:hidden">↓</span><span className="hidden lg:inline">→</span></span>
      <span className="h-7 w-px bg-[#c9dfd2] lg:h-px lg:w-8" aria-hidden="true" />
    </div>
  );
}

function RelationshipCard({ relationship, nodes }: { relationship: EvidenceGraphRelationship; nodes: Map<string, EvidenceGraphNode> }) {
  const source = relationship.sourceA ? nodes.get(relationship.sourceA) ?? null : null;
  const target = relationship.sourceB ? nodes.get(relationship.sourceB) ?? null : null;
  const hasNoEvidence = !source && !target;

  return (
    <article className="rounded-2xl border border-[#e2eae4] bg-[#fbfefc] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#13866b]">Evidence relationship</p>
          <h3 className="font-display mt-1 text-2xl text-[#143f3b]">{FIELD_LABELS[relationship.field]}</h3>
        </div>
        <span className={`status-pill ${relationship.status === "MATCH" ? "status-pill-green" : relationship.status === "CONFLICT" ? "status-pill-coral" : relationship.status === "FORMAT_DIFFERENCE" ? "status-pill-blue" : "status-pill-amber"}`}>
          <Icon name={statusIcon[relationship.status]} width={13} height={13} />
          {statusLabel(relationship.status)}
        </span>
      </div>

      {hasNoEvidence ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[#e9d6a9] bg-[#fffdf7] p-5 text-center">
          <p className="font-display text-2xl text-[#8b6718]">Review required</p>
          <p className="mt-2 text-sm leading-6 text-[#607a78]">No source claim was available to build this evidence relationship.</p>
        </div>
      ) : (
        <div className="mt-4 grid items-stretch gap-2 lg:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)]">
          <ClaimNode node={source} emptyLabel="No source claim was extracted." />
          <RelationshipConnector status={relationship.status} />
          <ClaimNode node={target} emptyLabel={relationship.status === "MISSING" ? "Supporting evidence is missing." : "A second source is needed for comparison."} />
        </div>
      )}

      <p className="mt-4 rounded-xl border border-[#e2eae4] bg-white px-3 py-2 text-sm leading-6 text-[#607a78]"><span className="font-extrabold text-[#143f3b]">What this means: </span>{relationship.message}</p>
    </article>
  );
}

export function EvidenceGraph({ report }: EvidenceGraphProps) {
  const nodes = new Map(report.evidenceGraph.nodes.map((node) => [node.id, node]));
  const relationships = report.evidenceGraph.relationships;

  return (
    <section className="rounded-[28px] border border-[#bcdccc] bg-[#e4f3ec] p-6 shadow-[0_14px_45px_rgba(20,63,59,0.06)] sm:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Evidence graph</p>
          <h2 className="font-display mt-2 text-4xl text-[#143f3b]">Every finding stays connected to its evidence.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#607a78]">Trace every important claim back to its source. These nodes and relationships came from the backend report, not a static illustration.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em]">
          <span className="rounded-full border border-[#c9dfd2] bg-white/70 px-2.5 py-1 text-[#607a78]">{report.evidenceGraph.nodes.length} claims</span>
          <span className="rounded-full border border-[#c9dfd2] bg-white/70 px-2.5 py-1 text-[#607a78]">{relationships.length} relationships</span>
          <span className="status-pill status-pill-green"><Icon name="check" width={12} height={12} /> Match</span>
          <span className="status-pill status-pill-coral"><Icon name="warning" width={12} height={12} /> Conflict</span>
          <span className="status-pill status-pill-amber"><Icon name="search" width={12} height={12} /> Review</span>
        </div>
      </div>

      <div className="mt-7 space-y-4" role="list" aria-label="Evidence relationships">
        {relationships.length > 0 ? relationships.map((relationship) => (
          <div key={relationship.id} role="listitem"><RelationshipCard relationship={relationship} nodes={nodes} /></div>
        )) : (
          <div className="rounded-2xl border border-dashed border-[#c9dfd2] bg-white/60 p-6 text-center text-sm text-[#607a78]">No evidence relationships are available yet.</div>
        )}
      </div>
    </section>
  );
}
