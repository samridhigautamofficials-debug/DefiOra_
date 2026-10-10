from Backend.schemas.models import (
    ChecklistItem,
    ExtractedDocuments,
    Finding,
    IntegrityReport,
    LegacyExtractedData,
    PortalCheck,
    VerificationComparison,
)
from Backend.services.evidence_graph import SOURCE_LABELS, build_evidence_graph
from Backend.services.normalization import documents_to_legacy_data
from Backend.services.verification import verify_documents


CONFLICT_IMPACT = {
    "name": 25,
    "dateOfBirth": 30,
    "course": 20,
    "rollNumber": 20,
    "institution": 15,
    "score": 15,
    "graduationYear": 15,
}


def _finding_for(comparison: VerificationComparison) -> Finding | None:
    if comparison.status == "CONFLICT":
        return Finding(
            severity="HIGH" if comparison.field in {"name", "dateOfBirth"} else "MEDIUM",
            type="Potential Information Inconsistency",
            field=comparison.field,
            message=f"{comparison.label} differs across {', '.join(SOURCE_LABELS[claim.source] for claim in comparison.claims)}. "
            + " • ".join(f"{SOURCE_LABELS[claim.source]}: {claim.value}" for claim in comparison.claims)
            + ".",
            sources=[claim.source for claim in comparison.claims],
            recommendation=f"Review the original {comparison.label.lower()} evidence and correct the application only if the source document confirms a change.",
            scoreImpact=CONFLICT_IMPACT.get(comparison.field, 15),
        )
    if comparison.status == "FORMAT_DIFFERENCE":
        return Finding(
            severity="LOW",
            type="Formatting Difference",
            field=comparison.field,
            message=f"The {comparison.label.lower()} is written in different formats across the available evidence, but normalizes to the same value.",
            sources=[claim.source for claim in comparison.claims],
            recommendation="Confirm that the formatting difference is expected before submitting.",
            scoreImpact=0,
        )
    if comparison.status == "REVIEW":
        if comparison.field not in {"name", "dateOfBirth", "course", "rollNumber"}:
            return None
        return Finding(
            severity="MEDIUM",
            type="Evidence Needs Review",
            field=comparison.field,
            message=f"{comparison.label} appears in {', '.join(SOURCE_LABELS[claim.source] for claim in comparison.claims)}, but no second supporting source was available for comparison.",
            sources=[claim.source for claim in comparison.claims],
            recommendation=f"Confirm the {comparison.label.lower()} against an authoritative source before submission.",
            scoreImpact=10,
        )
    if comparison.status == "MISSING":
        return Finding(
            severity="MEDIUM",
            type="Missing Evidence",
            field=comparison.field,
            message=f"{comparison.label} was not available in the required comparison evidence. DefiOra cannot verify this claim yet.",
            sources=[],
            recommendation=f"Add or review a document that clearly shows the {comparison.label.lower()} before submitting.",
            scoreImpact=15,
        )
    if comparison.status == "MATCH":
        return Finding(
            severity="INFO",
            type="Evidence Match",
            field=comparison.field,
            message=f"The available evidence agrees on the {comparison.label.lower()}.",
            sources=[claim.source for claim in comparison.claims],
            recommendation="No follow-up is required for this claim.",
            scoreImpact=0,
        )
    return None


def _build_checklist(has_issues: bool) -> list[ChecklistItem]:
    return [
        ChecklistItem(label="Review each flagged claim", complete=not has_issues, emphasis=has_issues),
        ChecklistItem(label="Confirm the correct source document", complete=not has_issues),
        ChecklistItem(label="Correct the application if necessary", complete=not has_issues),
        ChecklistItem(label="Re-run the security check", complete=not has_issues),
        ChecklistItem(label="Verify the submission portal", complete=False, emphasis=True),
        ChecklistItem(label="Continue only after resolving flagged issues", complete=not has_issues),
    ]


def _portal_check() -> PortalCheck:
    return PortalCheck(
        portal="example-university.edu",
        status="REVIEW REQUIRED",
        reason="DefiOra does not currently have trusted-source confirmation for this portal.",
        trustedSources=[
            "Official institutional domain",
            "Authorized institutional directory",
            "Published trusted source",
        ],
    )


def build_integrity_report(documents: ExtractedDocuments, demo_mode: bool = False) -> IntegrityReport:
    comparisons = verify_documents(documents)
    findings = [finding for comparison in comparisons if (finding := _finding_for(comparison)) is not None]
    score = 100
    score_reasons: list[str] = []
    for finding in findings:
        if finding.score_impact <= 0:
            continue
        score -= finding.score_impact
        score_reasons.append(f"−{finding.score_impact}: {finding.type} — {finding.field}")
    score = max(0, score)

    if not documents.academic.claims:
        academic_finding = Finding(
            severity="LOW",
            type="Academic Evidence Not Supplied",
            field="evidence",
            message="No academic record was supplied, so course and roll-number corroboration is unavailable.",
            sources=["academic"],
            recommendation="Add an academic record when the application requires academic details to be corroborated.",
            scoreImpact=5,
        )
        findings.append(academic_finding)
        score -= academic_finding.score_impact
        score_reasons.append(f"−{academic_finding.score_impact}: {academic_finding.type} — evidence")
        score = max(0, score)

    conflict_count = sum(1 for comparison in comparisons if comparison.status == "CONFLICT")
    has_issues = any(finding.severity != "INFO" for finding in findings)
    if conflict_count >= 2 or score <= 50:
        status = "MULTIPLE ISSUES FOUND"
    elif has_issues:
        status = "REVIEW REQUIRED"
    else:
        status = "READY TO REVIEW"

    recommendation = (
        "Resolve the flagged evidence issues before submitting. DefiOra highlights items for human review; it does not determine fraud or document authenticity."
        if has_issues
        else "Available evidence is consistent for the compared claims. Review the portal and final submission details before submitting."
    )
    return IntegrityReport(
        status=status,
        integrityScore=score,
        scoreReasons=score_reasons,
        findings=findings,
        comparisons=comparisons,
        evidenceGraph=build_evidence_graph(documents, comparisons),
        documents=documents,
        checklist=_build_checklist(has_issues),
        portalCheck=_portal_check(),
        recommendation=recommendation,
        demoMode=demo_mode,
        extracted=LegacyExtractedData(**documents_to_legacy_data(documents)),
    )


def build_error_report(status: str, message: str, demo_mode: bool = False) -> IntegrityReport:
    from Backend.services.normalization import empty_documents

    error_finding = Finding(
        severity="HIGH",
        type=status,
        field="evidence",
        message=message,
        sources=[],
        recommendation="Review the message, correct the input or retry the analysis.",
        scoreImpact=0,
    )
    return IntegrityReport(
        status=status,
        integrityScore=0,
        scoreReasons=[],
        findings=[error_finding],
        comparisons=[],
        evidenceGraph=build_evidence_graph(empty_documents(), []),
        documents=empty_documents(),
        checklist=[ChecklistItem(label=message, emphasis=True)],
        portalCheck=_portal_check(),
        recommendation=message,
        demoMode=demo_mode,
        extracted=LegacyExtractedData(),
    )

