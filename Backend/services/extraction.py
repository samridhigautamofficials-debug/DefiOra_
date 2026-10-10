import json
import os
from typing import Any

from google import genai
from google.genai import types

from Backend.schemas.models import DocumentType, ExtractedDocuments
from Backend.services.normalization import normalize_extraction_payload


MODEL_NAME = "gemini-2.5-flash"

CLAIM_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "field": {
            "type": "string",
            "enum": [
                "name",
                "dateOfBirth",
                "course",
                "rollNumber",
                "institution",
                "score",
                "graduationYear",
            ],
        },
        "value": {"type": "string", "nullable": True},
        "confidence": {"type": "number", "nullable": True},
    },
    "required": ["field", "value"],
}

EXTRACTION_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "application": {
            "type": "object",
            "properties": {
                "documentType": {"type": "string", "enum": ["application"]},
                "claims": {"type": "array", "items": CLAIM_SCHEMA},
            },
            "required": ["documentType", "claims"],
        },
        "identity": {
            "type": "object",
            "properties": {
                "documentType": {"type": "string", "enum": ["identity"]},
                "claims": {"type": "array", "items": CLAIM_SCHEMA},
            },
            "required": ["documentType", "claims"],
        },
        "academic": {
            "type": "object",
            "properties": {
                "documentType": {"type": "string", "enum": ["academic"]},
                "claims": {"type": "array", "items": CLAIM_SCHEMA},
            },
            "required": ["documentType", "claims"],
        },
    },
    "required": ["application", "identity", "academic"],
}


EXTRACTION_PROMPT = """
You are DefiOra's document extraction service. Extract only information that is visibly present in the attached documents. Do not decide whether a person or document is fraudulent. Do not infer, fill, or invent missing values. Return the requested JSON structure with claims assigned to the correct document. Use null or an empty claims list when a field is absent.

The supported fields are: name, dateOfBirth, course, rollNumber, institution, score, graduationYear.
Return one object for application, one for identity, and one for academic. The academic object may contain an empty claims list when no academic document was supplied.
""".strip()


class ExtractionError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.user_message = message


def _status_code(error: Exception) -> int | None:
    for candidate in (
        getattr(error, "status_code", None),
        getattr(error, "code", None),
        getattr(getattr(error, "response", None), "status_code", None),
    ):
        if isinstance(candidate, int):
            return candidate
        if isinstance(candidate, str) and candidate.isdigit():
            return int(candidate)
    return None


def _classify_error(error: Exception) -> ExtractionError:
    status = _status_code(error)
    if status == 429:
        return ExtractionError("RATE_LIMIT", "DefiOra's AI analysis service is temporarily busy. Please try again.")
    if status in {500, 502, 503, 504}:
        return ExtractionError("SERVICE_BUSY", "DefiOra's AI analysis service is temporarily busy. Please try again.")
    if status == 400:
        return ExtractionError("BAD_REQUEST", "DefiOra could not process the uploaded evidence. Please check the files and try again.")
    return ExtractionError("ANALYSIS_FAILED", "DefiOra could not complete AI extraction right now. Please try again.")


def extract_documents(files: dict[DocumentType, tuple[bytes, str]]) -> ExtractedDocuments:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ExtractionError("MISSING_API_KEY", "DefiOra's AI service is not configured on the server.")

    try:
        client = genai.Client(api_key=api_key)
        parts: list[types.Part] = [types.Part.from_text(text=EXTRACTION_PROMPT)]
        for source, (data, mime_type) in files.items():
            parts.append(types.Part.from_text(text=f"\n{source.upper()} DOCUMENT:"))
            parts.append(types.Part.from_bytes(data=data, mime_type=mime_type))

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[types.Content(role="user", parts=parts)],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EXTRACTION_SCHEMA,
                temperature=0,
            ),
        )
    except Exception as error:
        raise _classify_error(error) from None

    response_text = getattr(response, "text", None)
    if not isinstance(response_text, str) or not response_text.strip():
        raise ExtractionError("MALFORMED_RESPONSE", "DefiOra received an empty AI extraction response. Please try again.")
    try:
        payload = json.loads(response_text)
    except json.JSONDecodeError:
        raise ExtractionError("MALFORMED_RESPONSE", "DefiOra received an unreadable AI extraction response. Please try again.") from None

    if not isinstance(payload, dict) or any(
        not isinstance(payload.get(source), dict)
        or payload[source].get("documentType") != source
        or not isinstance(payload[source].get("claims"), list)
        for source in ("application", "identity", "academic")
    ):
        raise ExtractionError("MALFORMED_RESPONSE", "DefiOra received an incomplete AI extraction response. Please try again.")

    documents = normalize_extraction_payload(payload)
    if documents is None:
        raise ExtractionError("MALFORMED_RESPONSE", "DefiOra received an incomplete AI extraction response. Please try again.")
    return documents

