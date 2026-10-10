import re
import unicodedata
from datetime import date

from Backend.schemas.models import Claim, DocumentEvidence, ExtractedDocuments


SUPPORTED_FIELDS = {
    "name",
    "dateOfBirth",
    "course",
    "rollNumber",
    "institution",
    "score",
    "graduationYear",
}


def normalize_name(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]", "", decomposed.lower())


def normalize_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", decomposed.lower())).strip()


def normalize_date(value: str) -> str:
    cleaned = value.strip().replace(".", "/")
    parts = re.split(r"[/-]", cleaned)
    if len(parts) != 3 or not all(part.isdigit() for part in parts):
        return normalize_text(value)

    first, second, third = (int(part) for part in parts)
    if len(parts[0]) == 4:
        year, month, day = first, second, third
    else:
        day, month, year = first, second, third
        if year < 100:
            year += 2000 if year < 30 else 1900

    try:
        return date(year, month, day).isoformat()
    except ValueError:
        return normalize_text(value)


def normalize_claim_value(field: str, value: str) -> str:
    if field == "name":
        return normalize_name(value)
    if field == "dateOfBirth":
        return normalize_date(value)
    return normalize_text(value)


def empty_documents() -> ExtractedDocuments:
    return ExtractedDocuments(
        application=DocumentEvidence(documentType="application", claims=[]),
        identity=DocumentEvidence(documentType="identity", claims=[]),
        academic=DocumentEvidence(documentType="academic", claims=[]),
    )


def _claim_from_payload(item: object, source: str) -> Claim | None:
    if not isinstance(item, dict):
        return None
    field = item.get("field")
    value = item.get("value")
    if field not in SUPPORTED_FIELDS or value is None or not isinstance(value, (str, int, float)):
        return None
    text_value = str(value).strip()
    if not text_value:
        return None
    confidence = item.get("confidence")
    if not isinstance(confidence, (int, float)):
        confidence = None
    elif not 0 <= confidence <= 1:
        confidence = max(0.0, min(1.0, float(confidence)))
    return Claim(field=field, value=text_value, source=source, confidence=confidence)


def normalize_extraction_payload(payload: object) -> ExtractedDocuments | None:
    if not isinstance(payload, dict):
        return None
    documents = empty_documents()
    found_document = False

    source_payloads: dict[str, object] = {
        "application": payload.get("application"),
        "identity": payload.get("identity"),
        "academic": payload.get("academic"),
    }
    if isinstance(payload.get("documents"), list):
        for item in payload["documents"]:
            if isinstance(item, dict) and item.get("documentType") in source_payloads:
                source_payloads[item["documentType"]] = item

    for source, raw_document in source_payloads.items():
        if not isinstance(raw_document, dict):
            continue
        raw_claims = raw_document.get("claims")
        if not isinstance(raw_claims, list):
            continue
        found_document = True
        claims = [claim for item in raw_claims if (claim := _claim_from_payload(item, source))]
        setattr(documents, source, DocumentEvidence(documentType=source, claims=claims))

    return documents if found_document else None


def documents_to_legacy_data(documents: ExtractedDocuments) -> dict[str, dict[str, str | None]]:
    output: dict[str, dict[str, str | None]] = {}
    for source in ("application", "identity", "academic"):
        document = getattr(documents, source)
        output[source] = {claim.field: claim.value for claim in document.claims}
    return output

