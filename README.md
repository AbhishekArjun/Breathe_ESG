# Breathe ESG Data Ingestion Prototype

This repository contains the prototype for the Breathe ESG Tech Intern Assignment. It features a Django REST Framework backend for data ingestion and normalization, and a modern React (Vite) frontend for analysts to review the data.

## Deliverables Included
As requested by the assignment prompt, the following deliverable documents have been created at the root of the repository:
- `MODEL.md` - Data model design and justification.
- `DECISIONS.md` - Ambiguities resolved, choices made, and questions for the PM.
- `TRADEOFFS.md` - Things deliberately not built and why.
- `SOURCES.md` - Research on the three data sources, real-world formats, and sample data.

## Project Structure

- `/backend` - The Django REST Framework project.
- `/frontend` - The React application (Vite, Javascript, Vanilla CSS).
- `/sample_data` - Mock CSV and JSON files for testing the three required data sources (SAP, Utility, Travel).

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Start the Backend (Django)
Navigate to the `backend` directory and activate your virtual environment (if using one).

```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Unix: source venv/bin/activate

pip install -r requirements.txt # (or pip install django djangorestframework django-cors-headers)
python manage.py migrate
python manage.py runserver
```

### 2. Start the Frontend (React)
Navigate to the `frontend` directory in a new terminal window.

```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
Open your browser to the URL provided by Vite (usually `http://localhost:5173`).
1. Click **Upload Data**.
2. Select a data source from the dropdown.
3. Upload the corresponding sample file from the `sample_data` directory.
4. Navigate to **Data Review** to review the parsed and normalized rows, inspect the raw JSON payload, and approve/reject records.
