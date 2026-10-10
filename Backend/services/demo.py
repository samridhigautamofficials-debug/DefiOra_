from Backend.schemas.models import Claim, DocumentEvidence, ExtractedDocuments
from Backend.services.scoring import build_integrity_report


def demo_documents() -> ExtractedDocuments:
    return ExtractedDocuments(
        application=DocumentEvidence(
            documentType="application",
            claims=[
                Claim(field="name", value="Ananya Sharma", source="application", confidence=1.0),
                Claim(field="dateOfBirth", value="14/08/2006", source="application", confidence=1.0),
                Claim(field="course", value="BCA", source="application", confidence=1.0),
                Claim(field="rollNumber", value="BCA2026-1042", source="application", confidence=1.0),
            ],
        ),
        identity=DocumentEvidence(
            documentType="identity",
            claims=[
                Claim(field="name", value="Ananya Sharma", source="identity", confidence=1.0),
                Claim(field="dateOfBirth", value="14/08/2005", source="identity", confidence=1.0),
            ],
        ),
        academic=DocumentEvidence(
            documentType="academic",
            claims=[
                Claim(field="name", value="Ananya Sharma", source="academic", confidence=1.0),
                Claim(field="course", value="BCA", source="academic", confidence=1.0),
                Claim(field="rollNumber", value="BCA2026-1042", source="academic", confidence=1.0),
                Claim(field="institution", value="Example University", source="academic", confidence=1.0),
                Claim(field="score", value="8.4 CGPA", source="academic", confidence=1.0),
            ],
        ),
    )


def demo_report():
    return build_integrity_report(demo_documents(), demo_mode=True)

