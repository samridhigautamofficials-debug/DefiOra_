import json

from fastapi.testclient import TestClient

from Backend.main import app
from Backend.schemas.models import Claim, DocumentEvidence, ExtractedDocuments
from Backend.services.extraction import ExtractionError, extract_documents
from Backend.services.normalization import normalize_date, normalize_name
from Backend.services.scoring import build_integrity_report
from Backend.services.verification import verify_documents


def documents(
    application_claims: list[Claim],
    identity_claims: list[Claim],
    academic_claims: list[Claim] | None = None,
) -> ExtractedDocuments:
    return ExtractedDocuments(
        application=DocumentEvidence(documentType="application", claims=application_claims),
        identity=DocumentEvidence(documentType="identity", claims=identity_claims),
        academic=DocumentEvidence(documentType="academic", claims=academic_claims or []),
    )


def test_normalization_accepts_safe_date_formats_and_names() -> None:
    assert normalize_date("14/08/2006") == "2006-08-14"
    assert normalize_date("14-08-2006") == "2006-08-14"
    assert normalize_date("2006-08-14") == "2006-08-14"
    assert normalize_name("Ananya Sharma") == normalize_name("ANANYA  SHARMA")


def test_verification_match_conflict_missing_and_format_difference() -> None:
    match = documents(
        [Claim(field="dateOfBirth", value="14/08/2006", source="application")],
        [Claim(field="dateOfBirth", value="14-08-2006", source="identity")],
    )
    assert next(item for item in verify_documents(match) if item.field == "dateOfBirth").status == "FORMAT_DIFFERENCE"

    conflict = documents(
        [Claim(field="dateOfBirth", value="14/08/2006", source="application")],
        [Claim(field="dateOfBirth", value="14/08/2005", source="identity")],
    )
    assert next(item for item in verify_documents(conflict) if item.field == "dateOfBirth").status == "CONFLICT"

    missing = documents([Claim(field="dateOfBirth", value="14/08/2006", source="application")], [])
    assert next(item for item in verify_documents(missing) if item.field == "dateOfBirth").status == "REVIEW"

    names = documents(
        [Claim(field="name", value="ANANYA SHARMA", source="application")],
        [Claim(field="name", value="Ananya Sharma", source="identity")],
    )
    assert next(item for item in verify_documents(names) if item.field == "name").status == "MATCH"


def test_academic_course_comparison_is_deterministic() -> None:
    matching = documents(
        [Claim(field="course", value="BCA", source="application")],
        [],
        [Claim(field="course", value="BCA", source="academic")],
    )
    assert next(item for item in verify_documents(matching) if item.field == "course").status == "MATCH"

    conflicting = documents(
        [Claim(field="course", value="BCA", source="application")],
        [],
        [Claim(field="course", value="BBA", source="academic")],
    )
    assert next(item for item in verify_documents(conflicting) if item.field == "course").status == "CONFLICT"


def test_demo_score_and_graph_are_derived_from_claims() -> None:
    source_documents = documents(
        [
            Claim(field="name", value="Ananya Sharma", source="application"),
            Claim(field="dateOfBirth", value="14/08/2006", source="application"),
            Claim(field="course", value="BCA", source="application"),
        ],
        [
            Claim(field="name", value="Ananya Sharma", source="identity"),
            Claim(field="dateOfBirth", value="14/08/2005", source="identity"),
        ],
        [Claim(field="course", value="BCA", source="academic")],
    )
    report = build_integrity_report(source_documents)
    assert report.integrity_score == 70
    assert report.status == "REVIEW REQUIRED"
    assert any("dateOfBirth" in reason for reason in report.score_reasons)
    dob_edge = next(edge for edge in report.evidence_graph.relationships if edge.field == "dateOfBirth")
    assert dob_edge.status == "CONFLICT"
    assert dob_edge.source_a == "application-dateOfBirth"
    assert dob_edge.source_b == "identity-dateOfBirth"


def test_api_health_demo_and_controlled_input_errors(monkeypatch) -> None:
    client = TestClient(app)
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"

    demo = client.get("/api/demo")
    assert demo.status_code == 200
    assert demo.json()["success"] is True
    assert demo.json()["result"]["integrityScore"] == 70
    assert demo.json()["result"]["demoMode"] is True

    missing = client.post("/api/analyze")
    assert missing.status_code == 400
    assert missing.json()["success"] is False
    assert missing.json()["result"]["status"] == "INPUT ERROR"

    unsupported = client.post(
        "/api/analyze",
        files={
            "applicationFile": ("application.txt", b"not a supported document", "text/plain"),
            "identityFile": ("identity.pdf", b"pdf bytes", "application/pdf"),
        },
    )
    assert unsupported.status_code == 400
    assert unsupported.json()["result"]["status"] == "INPUT ERROR"

    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    no_key = client.post(
        "/api/analyze",
        files={
            "applicationFile": ("application.pdf", b"synthetic application bytes", "application/pdf"),
            "identityFile": ("identity.pdf", b"synthetic identity bytes", "application/pdf"),
        },
    )
    assert no_key.status_code == 500
    assert no_key.json()["success"] is False
    assert no_key.json()["result"]["status"] == "AI ERROR"
    assert "not configured" in no_key.json()["result"]["findings"][0]["message"]


def test_api_maps_ai_failures_without_exposing_exception_details(monkeypatch) -> None:
    client = TestClient(app)
    files = {
        "applicationFile": ("application.pdf", b"synthetic application bytes", "application/pdf"),
        "identityFile": ("identity.pdf", b"synthetic identity bytes", "application/pdf"),
    }

    def raise_busy(_files):
        raise ExtractionError("SERVICE_BUSY", "DefiOra's AI analysis service is temporarily busy. Please try again.")

    monkeypatch.setattr("Backend.main.extract_documents", raise_busy)
    busy = client.post("/api/analyze", files=files)
    assert busy.status_code == 503
    assert busy.json()["result"]["status"] == "AI TEMPORARILY UNAVAILABLE"
    assert "Traceback" not in busy.text

    def raise_bad_request(_files):
        raise ExtractionError("BAD_REQUEST", "DefiOra could not process the uploaded evidence. Please check the files and try again.")

    monkeypatch.setattr("Backend.main.extract_documents", raise_bad_request)
    bad_request = client.post("/api/analyze", files=files)
    assert bad_request.status_code == 502
    assert bad_request.json()["result"]["status"] == "AI ERROR"
    assert "Traceback" not in bad_request.text


def test_gemini_extraction_adapter_uses_uploaded_bytes_and_validates_shape(monkeypatch) -> None:
    class FakeResponse:
        text = json.dumps(
            {
                "application": {"documentType": "application", "claims": [{"field": "name", "value": "Ananya Sharma", "confidence": 4}]},
                "identity": {"documentType": "identity", "claims": [{"field": "name", "value": "Ananya Sharma"}]},
                "academic": {"documentType": "academic", "claims": []},
            }
        )

    class FakeModels:
        def generate_content(self, **kwargs):
            assert kwargs["model"] == "gemini-2.5-flash"
            assert kwargs["config"].response_mime_type == "application/json"
            assert len(kwargs["contents"][0].parts) == 5
            return FakeResponse()

    class FakeClient:
        models = FakeModels()

    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-logged")
    monkeypatch.setattr("Backend.services.extraction.genai.Client", lambda api_key: FakeClient())
    documents = extract_documents(
        {
            "application": (b"application bytes", "application/pdf"),
            "identity": (b"identity bytes", "application/pdf"),
        }
    )
    assert documents.application.claims[0].value == "Ananya Sharma"
    assert documents.identity.claims[0].value == "Ananya Sharma"
    assert documents.application.claims[0].confidence == 1


def test_gemini_extraction_rejects_incomplete_structured_output(monkeypatch) -> None:
    class FakeResponse:
        text = '{"application": {"documentType": "application", "claims": []}}'

    class FakeModels:
        def generate_content(self, **_kwargs):
            return FakeResponse()

    class FakeClient:
        models = FakeModels()

    monkeypatch.setenv("GEMINI_API_KEY", "test-key-not-logged")
    monkeypatch.setattr("Backend.services.extraction.genai.Client", lambda api_key: FakeClient())
    try:
        extract_documents({"application": (b"application bytes", "application/pdf")})
    except ExtractionError as error:
        assert error.code == "MALFORMED_RESPONSE"
        assert "Traceback" not in str(error)
    else:
        raise AssertionError("Incomplete Gemini output was accepted")

