export type DocumentType = "application" | "identity" | "academic";

export type ClaimField =
  | "name"
  | "dateOfBirth"
  | "course"
  | "rollNumber"
  | "institution"
  | "score"
  | "graduationYear"
  | "other";

export type ComparisonStatus =
  | "MATCH"
  | "FORMAT_DIFFERENCE"
  | "CONFLICT"
  | "MISSING"
  | "REVIEW";

export type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH";

export type Claim = {
  field: ClaimField;
  value: string | null;
  source: DocumentType;
  confidence?: number | null;
};

export type ExtractedDocument = {
  documentType: DocumentType;
  claims: Claim[];
};

export type ExtractedDocuments = Record<DocumentType, ExtractedDocument>;

export type VerificationComparison = {
  field: ClaimField;
  label: string;
  status: ComparisonStatus;
  claims: Claim[];
  normalizedValues: string[];
  comparedSources: DocumentType[];
};

export type Finding = {
  severity: Severity;
  type: string;
  field: ClaimField | "evidence";
  message: string;
  sources: DocumentType[];
  recommendation: string;
  scoreImpact: number;
};

export type EvidenceGraphNode = {
  id: string;
  type: "claim";
  label: string;
  field: ClaimField;
  value: string;
  source: DocumentType;
  confidence?: number | null;
};

export type EvidenceGraphRelationship = {
  id: string;
  field: ClaimField;
  sourceA: string | null;
  sourceB: string | null;
  status: ComparisonStatus;
  message: string;
};

export type EvidenceGraph = {
  nodes: EvidenceGraphNode[];
  relationships: EvidenceGraphRelationship[];
};

export type ChecklistItem = {
  label: string;
  complete: boolean;
  emphasis?: boolean;
};

export type PortalCheck = {
  portal: string;
  status: "REVIEW REQUIRED";
  reason: string;
  trustedSources: string[];
};

export type IntegrityReport = {
  status:
    | "READY TO REVIEW"
    | "REVIEW REQUIRED"
    | "MULTIPLE ISSUES FOUND"
    | "AI TEMPORARILY UNAVAILABLE"
    | "AI ERROR"
    | "INPUT ERROR";
  integrityScore: number;
  scoreReasons: string[];
  findings: Finding[];
  comparisons: VerificationComparison[];
  evidenceGraph: EvidenceGraph;
  documents: ExtractedDocuments;
  checklist: ChecklistItem[];
  portalCheck: PortalCheck;
  recommendation: string;
  demoMode?: boolean;
  extracted?: LegacyExtractedData;
};

export type LegacyExtractedData = {
  application: Record<string, string | string[]>;
  identity: Record<string, string | string[]>;
  academic?: Record<string, string | string[]>;
};

export type AnalyzeResponse = {
  success: boolean;
  result: IntegrityReport;
};

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  application: "Application form",
  identity: "Identity document",
  academic: "Academic record",
};

export const FIELD_LABELS: Record<ClaimField, string> = {
  name: "Full name",
  dateOfBirth: "Date of birth",
  course: "Course / program",
  rollNumber: "Roll number",
  institution: "Institution",
  score: "Score / grade",
  graduationYear: "Graduation year",
  other: "Other claim",
};

export const EMPTY_DOCUMENTS: ExtractedDocuments = {
  application: { documentType: "application", claims: [] },
  identity: { documentType: "identity", claims: [] },
  academic: { documentType: "academic", claims: [] },
};
