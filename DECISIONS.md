# Decisions

Here are the key ambiguities resolved and decisions made during the development of this prototype:

## 1. Defining "Ingestion" for the Prototype
**Ambiguity:** How should data actually enter the system? Building real OAuth flows for APIs or SFTP servers for SAP is out of scope for a 4-day prototype.
**Decision:** I chose to expose a unified file upload endpoint (`/api/ingestion-jobs/upload/`). For API-based sources (like Travel), the user uploads a JSON file containing the mocked API response payload. For SAP and Utility, the user uploads the CSV export.
**Why:** This unifies the testing experience for the reviewer while still allowing the backend parsers to handle distinct formats (JSON vs CSV).

## 2. Handling Suspicious Data
**Ambiguity:** The prompt mentioned flagging suspicious rows, but what defines "suspicious"?
**Decision:** I implemented basic heuristic checks in the parsers.
- *SAP:* Flags negative quantities or missing units.
- *Utility:* Flags exceptionally high usage (>1M kWh in a month).
- *Travel:* Flags flights missing a distance metric or hotels with 0 nights.
**Why:** These are realistic data quality issues. If a row is flagged, it is marked as `SUSPICIOUS` rather than `PENDING_REVIEW`, alerting the analyst.

## 3. Scope Mapping
**Ambiguity:** How do we know what Scope a raw row falls into?
**Decision:** Hardcoded mappings in the specific parsers based on typical setups, though in reality this would require mapping tables.
- Utility electricity is Scope 2.
- Travel is Scope 3 (Category 6).
- SAP procurement was defaulted to Scope 3, assuming a standard purchased goods export, though fuel could be Scope 1.

## What I would ask the PM:
1. **Error Tolerance:** If a CSV upload contains 10,000 rows and 5 are malformed (e.g., corrupt date string), should we reject the entire `IngestionJob`, or accept 9,995 rows and flag 5 as `FAILED`? (I chose the latter for the prototype).
2. **Master Data Management:** SAP plant codes and vendor IDs mean nothing on their own. Should Breathe ESG maintain the lookup tables for these facilities, or do we expect the client to join that data before exporting to us?
