# PharmaPilot AI Backend

Enterprise FastAPI backend service for Pharmaceutical Complaint Management, Document Extraction, and Quality Risk Assessment.

## Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── complaint.py
│   │   │   ├── ai.py
│   │   │   └── upload.py
│   │   └── dependencies.py
│   ├── config/
│   │   └── settings.py
│   ├── core/
│   │   ├── logging.py
│   │   └── exceptions.py
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── complaint_service.py
│   │   └── upload_service.py
│   ├── agents/
│   │   ├── complaint_agent.py
│   │   ├── graph.py
│   │   └── prompts.py
│   ├── database/
│   │   ├── database.py
│   │   └── models.py
│   ├── schemas/
│   │   ├── complaint.py
│   │   └── ai.py
│   ├── utils/
│   │   ├── parser.py
│   │   └── validators.py
│   ├── static/
│   └── uploads/
├── main.py
├── requirements.txt
├── .env
└── README.md
```

## Running the Server

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Server**:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

3. **Access Interactive API Documentation**:
   - OpenAPI Docs: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`
