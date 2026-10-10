from Backend.schemas.models import Claim, DocumentType, ExtractedDocuments, VerificationComparison
from Backend.services.normalization import normalize_claim_value


FIELD_LABELS = {
    "name": "Name",
    "dateOfBirth": "Date of Birth",
    "course": "Course",
    "rollNumber": "Roll Number",
    "institution": "Institution",
    "score": "Score",
    "graduationYear": "Graduation Year",
}

REQUIRED_FIELDS = {"name", "dateOfBirth"}

SOURCES_BY_FIELD: dict[str, list[DocumentType]] = {
    "name": ["application", "identity", "academic"],
    "dateOfBirth": ["application", "identity", "academic"],
    "course": ["application", "academic"],
    "rollNumber": ["application", "academic"],
    "institution": ["application", "academic"],
    "score": ["application", "academic"],
    "graduationYear": ["application", "academic"],
}

COMPARABLE_FIELDS = list(SOURCES_BY_FIELD)


def _claim_for(documents: ExtractedDocuments, source: DocumentType, field: str) -> Claim | None:
    return next((claim for claim in getattr(documents, source).claims if claim.field == field), None)


def verify_documents(documents: ExtractedDocuments) -> list[VerificationComparison]:
    comparisons: list[VerificationComparison] = []
    for field in COMPARABLE_FIELDS:
        claims = [
            claim
            for source in SOURCES_BY_FIELD[field]
            if (claim := _claim_for(documents, source, field)) is not None and claim.value
        ]
        normalized_values = [normalize_claim_value(field, claim.value or "") for claim in claims]
        compared_sources = [claim.source for claim in claims]

        if not claims and field not in REQUIRED_FIELDS:
            continue
        if not claims:
            status = "MISSING"
        elif len(claims) == 1:
            status = "REVIEW"
        elif len(set(normalized_values)) > 1:
            status = "CONFLICT"
        elif field == "dateOfBirth" and len({claim.value for claim in claims}) > 1:
            status = "FORMAT_DIFFERENCE"
        else:
            status = "MATCH"

        comparisons.append(
            VerificationComparison(
                field=field,
                label=FIELD_LABELS[field],
                status=status,
                claims=claims,
                normalizedValues=normalized_values,
                comparedSources=compared_sources,
            )
        )
    return comparisons

