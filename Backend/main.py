from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from Backend.schemas.models import AnalyzeResponse, DocumentType
from Backend.services.demo import demo_report
from Backend.services.extraction import ExtractionError, extract_documents
from Backend.services.scoring import build_error_report, build_integrity_report


load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI(title="DefiOra API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {"application/pdf", "image/png", "image/jpeg"}


class InputError(Exception):
    pass


def _error_response(status_code: int, status: str, message: str) -> JSONResponse:
    report = build_error_report(status, message)
    payload = AnalyzeResponse(success=False, result=report).model_dump(by_alias=True)
    return JSONResponse(status_code=status_code, content=payload)


async def _read_upload(upload: UploadFile | None, source: DocumentType, required: bool) -> tuple[bytes, str] | None:
    if upload is None:
        if required:
            raise InputError(f"Please upload the {source} document before analyzing.")
        return None

    filename = upload.filename or ""
    extension = Path(filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise InputError("Unsupported file type. Upload a PDF, PNG, JPG, or JPEG file.")
    if upload.content_type and upload.content_type not in ALLOWED_MIME_TYPES:
        raise InputError("The uploaded file type could not be accepted. Use a PDF, PNG, JPG, or JPEG file.")

    data = await upload.read()
    if not data:
        raise InputError("The uploaded file is empty. Choose a file with document content.")
    if len(data) > MAX_FILE_SIZE:
        raise InputError("Each uploaded file must be 10 MB or smaller.")
    mime_type = upload.content_type or ("application/pdf" if extension == ".pdf" else "image/jpeg" if extension in {".jpg", ".jpeg"} else "image/png")
    return data, mime_type


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "defiora-backend"}


@app.get("/api/demo", response_model=AnalyzeResponse)
async def demo() -> AnalyzeResponse:
    return AnalyzeResponse(success=True, result=demo_report())


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(
    applicationFile: UploadFile | None = File(default=None),
    identityFile: UploadFile | None = File(default=None),
    academicFile: UploadFile | None = File(default=None),
    demo: str | None = Form(default=None),
) -> AnalyzeResponse | JSONResponse:
    if demo and demo.lower() == "true":
        return AnalyzeResponse(success=True, result=demo_report())

    try:
        application = await _read_upload(applicationFile, "application", required=True)
        identity = await _read_upload(identityFile, "identity", required=True)
        academic = await _read_upload(academicFile, "academic", required=False)
    except InputError as error:
        return _error_response(400, "INPUT ERROR", str(error))

    files = {"application": application, "identity": identity}
    if academic is not None:
        files["academic"] = academic

    try:
        documents = extract_documents(files)
        return AnalyzeResponse(success=True, result=build_integrity_report(documents))
    except ExtractionError as error:
        status_code = 503 if error.code == "SERVICE_BUSY" else 429 if error.code == "RATE_LIMIT" else 502 if error.code in {"BAD_REQUEST", "MALFORMED_RESPONSE", "ANALYSIS_FAILED"} else 500
        status = "AI TEMPORARILY UNAVAILABLE" if error.code in {"SERVICE_BUSY", "RATE_LIMIT"} else "AI ERROR"
        return _error_response(status_code, status, error.user_message)
    except Exception:
        return _error_response(500, "AI ERROR", "DefiOra could not complete the analysis right now. Please try again.")

