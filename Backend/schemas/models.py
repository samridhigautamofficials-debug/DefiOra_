from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


DocumentType = Literal["application", "identity", "academic"]
ClaimField = Literal[
    "name",
    "dateOfBirth",
    "course",
    "rollNumber",
    "institution",
    "score",
    "graduationYear",
    "evidence",
]
ComparisonStatus = Literal[
    "MATCH",
    "FORMAT_DIFFERENCE",
    "CONFLICT",
    "MISSING",
    "REVIEW",
]
Severity = Literal["INFO", "LOW", "MEDIUM", "HIGH"]
ReportStatus = Literal[
    "READY TO REVIEW",
    "REVIEW REQUIRED",
    "MULTIPLE ISSUES FOUND",
    "AI TEMPORARILY UNAVAILABLE",
    "AI ERROR",
    "INPUT ERROR",
]


class ApiModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class Claim(ApiModel):
    field: ClaimField
    value: str | None = None
    source: DocumentType
    confidence: float | None = None


class DocumentEvidence(ApiModel):
    document_type: DocumentType = Field(alias="documentType")
    claims: list[Claim] = Field(default_factory=list)


class ExtractedDocuments(ApiModel):
    application: DocumentEvidence
    identity: DocumentEvidence
    academic: DocumentEvidence


class VerificationComparison(ApiModel):
    field: ClaimField
    label: str
    status: ComparisonStatus
    claims: list[Claim] = Field(default_factory=list)
    normalized_values: list[str] = Field(default_factory=list, alias="normalizedValues")
    compared_sources: list[DocumentType] = Field(default_factory=list, alias="comparedSources")


class EvidenceGraphNode(ApiModel):
    id: str
    type: Literal["claim"]
    label: str
    field: ClaimField
    value: str
    source: DocumentType
    confidence: float | None = None


class EvidenceGraphRelationship(ApiModel):
    id: str
    field: ClaimField
    source_a: str | None = Field(default=None, alias="sourceA")
    source_b: str | None = Field(default=None, alias="sourceB")
    status: ComparisonStatus
    message: str


class EvidenceGraph(ApiModel):
    nodes: list[EvidenceGraphNode] = Field(default_factory=list)
    relationships: list[EvidenceGraphRelationship] = Field(default_factory=list)


class Finding(ApiModel):
    severity: Severity
    type: str
    field: ClaimField
    message: str
    sources: list[str] = Field(default_factory=list)
    recommendation: str
    score_impact: int = Field(default=0, alias="scoreImpact")


class ChecklistItem(ApiModel):
    label: str
    complete: bool = False
    emphasis: bool = False


class PortalCheck(ApiModel):
    portal: str
    status: Literal["REVIEW REQUIRED", "NOT VERIFIED"]
    reason: str
    trusted_sources: list[str] = Field(default_factory=list, alias="trustedSources")


class LegacyExtractedData(ApiModel):
    application: dict[str, str | None] = Field(default_factory=dict)
    identity: dict[str, str | None] = Field(default_factory=dict)
    academic: dict[str, str | None] = Field(default_factory=dict)


class IntegrityReport(ApiModel):
    status: ReportStatus
    integrity_score: int = Field(alias="integrityScore")
    score_reasons: list[str] = Field(default_factory=list, alias="scoreReasons")
    findings: list[Finding] = Field(default_factory=list)
    comparisons: list[VerificationComparison] = Field(default_factory=list)
    evidence_graph: EvidenceGraph = Field(alias="evidenceGraph")
    documents: ExtractedDocuments
    checklist: list[ChecklistItem] = Field(default_factory=list)
    portal_check: PortalCheck = Field(alias="portalCheck")
    recommendation: str
    demo_mode: bool = Field(default=False, alias="demoMode")
    extracted: LegacyExtractedData | None = None


class AnalyzeResponse(ApiModel):
    success: bool
    result: IntegrityReport

