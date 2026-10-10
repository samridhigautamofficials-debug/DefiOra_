from Backend.schemas.models import EvidenceGraph, EvidenceGraphNode, EvidenceGraphRelationship, ExtractedDocuments, VerificationComparison


SOURCE_LABELS = {
    "application": "Application",
    "identity": "Identity Document",
    "academic": "Academic Document",
}


def relationship_message(status: str) -> str:
    return {
        "MATCH": "Available evidence agrees on this claim.",
        "FORMAT_DIFFERENCE": "The values are equivalent after normalization; only the written format differs.",
        "CONFLICT": "These two evidence sources contain different values for the same claim.",
        "REVIEW": "DefiOra could not establish a reliable comparison from the available evidence.",
        "MISSING": "No evidence was available for this required claim.",
    }.get(status, "Review required for this comparison.")


def build_evidence_graph(documents: ExtractedDocuments, comparisons: list[VerificationComparison]) -> EvidenceGraph:
    nodes: list[EvidenceGraphNode] = []
    node_ids_by_claim: dict[tuple[str, str], str] = {}

    for source in ("application", "identity", "academic"):
        for claim in getattr(documents, source).claims:
            if not claim.value:
                continue
            node_id = f"{source}-{claim.field}"
            node_ids_by_claim[(source, claim.field)] = node_id
            nodes.append(
                EvidenceGraphNode(
                    id=node_id,
                    type="claim",
                    label=claim.field,
                    field=claim.field,
                    value=claim.value,
                    source=source,
                    confidence=claim.confidence,
                )
            )

    relationships: list[EvidenceGraphRelationship] = []
    for comparison in comparisons:
        claim_ids = [node_ids_by_claim.get((claim.source, comparison.field)) for claim in comparison.claims]
        claim_ids = [node_id for node_id in claim_ids if node_id]
        if len(claim_ids) < 2:
            relationships.append(
                EvidenceGraphRelationship(
                    id=f"{comparison.field}-review",
                    field=comparison.field,
                    sourceA=claim_ids[0] if claim_ids else None,
                    sourceB=None,
                    status=comparison.status,
                    message=relationship_message(comparison.status),
                )
            )
            continue
        for index in range(len(claim_ids) - 1):
            relationships.append(
                EvidenceGraphRelationship(
                    id=f"{comparison.field}-{index}",
                    field=comparison.field,
                    sourceA=claim_ids[index],
                    sourceB=claim_ids[index + 1],
                    status=comparison.status,
                    message=relationship_message(comparison.status),
                )
            )

    return EvidenceGraph(nodes=nodes, relationships=relationships)

