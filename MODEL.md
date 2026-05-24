# Data Model

The data model is built using Django's ORM and backed by a relational database (SQLite for this prototype, but easily swappable to PostgreSQL).

## Core Entities

### 1. `Client`
Represents the enterprise customer. This is the root of the multi-tenancy hierarchy.
- `name`: String
- `created_at`: DateTime

### 2. `DataSource`
Defines a specific origin of data for a client. Allows us to track multiple systems per client.
- `client`: ForeignKey to `Client`
- `name`: String (e.g., "European SAP Instance", "Concur NA")
- `source_type`: Enum (`SAP`, `UTILITY`, `TRAVEL`)

### 3. `IngestionJob`
Represents a single batch ingestion event (a file upload or API pull). Crucial for auditing and rollbacks.
- `data_source`: ForeignKey to `DataSource`
- `status`: Enum (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`)
- `started_at`: DateTime
- `completed_at`: DateTime
- `summary_notes`: Text (for high-level error logging)

### 4. `RawDataRecord`
The source of truth for what actually arrived. We store the raw payload (CSV row or JSON object) exactly as it was parsed before any normalisation.
- `ingestion_job`: ForeignKey to `IngestionJob`
- `raw_payload`: JSONField
- `created_at`: DateTime

### 5. `NormalizedDataRecord`
The standardized structure that analysts review and that eventually powers the carbon calculations. Linked 1-to-1 with the `RawDataRecord` so an auditor can always trace a normalized value back to its exact original form.
- `raw_record`: OneToOneField to `RawDataRecord`
- `ingestion_job`: ForeignKey to `IngestionJob`
- `scope`: Integer (1, 2, or 3)
- `emission_category`: String (e.g., "Purchased Electricity", "Business Travel")
- `activity_date`: Date
- `activity_date_end`: Date (used for periods like utility bills)
- `normalized_quantity`: Float
- `normalized_unit`: String
- `status`: Enum (`PENDING_REVIEW`, `APPROVED`, `REJECTED`, `SUSPICIOUS`)
- `audit_notes`: Text (contains system-generated flags or analyst comments)
- `reviewed_at`: DateTime
- `reviewed_by`: String

## Why this model?
1. **Multi-tenancy:** Handled at the root level via the `Client` and `DataSource` models.
2. **Audit Trail:** The `RawDataRecord` guarantees we never lose the original source data. The `status`, `audit_notes`, `reviewed_at`, and `reviewed_by` fields on `NormalizedDataRecord` provide a full trace of how the data was handled.
3. **Unit Normalization:** `normalized_quantity` and `normalized_unit` separate the raw input string from the numeric value we need for calculations.
4. **Scope Categorization:** Directly mapped on the normalized record based on the parsing rules.
