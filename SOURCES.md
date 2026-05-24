# Data Sources Research

## 1. SAP (Fuel and Procurement Data)
**Format Researched:** Flat File (CSV) via SAP Background Job.
**Why:** While SAP offers modern OData APIs and BAPIs, enterprise IT departments are notoriously slow to grant direct API access to legacy ERP systems. A scheduled background job that dumps a CSV to an SFTP server is the most realistic, lowest-friction ingestion method for a fast-moving ESG startup onboarding a new client.
**Sample Data Shape:** My sample CSV includes German headers typical of SAP GUI exports (`Buchungsdatum` for date, `Materialkurztext` for description, `Menge` for quantity). 
**What would break in reality:** 
- Date formats varying wildly based on the SAP user's locale profile (e.g., `DD.MM.YYYY` vs `MM/DD/YYYY`). My parser currently handles two common variants but would fail on others.
- Plant codes (`Werk`) lacking a lookup table, making it impossible to assign emissions to specific geographical locations.

## 2. Utility Data (Electricity)
**Format Researched:** Portal CSV Export.
**Why:** Many regional utilities do not offer APIs. While scraping PDFs is an option, it requires expensive OCR and constant maintenance when bill layouts change. Most portals offer a basic CSV download of monthly usage.
**Sample Data Shape:** The CSV contains `Billing Start`, `Billing End`, `Usage (kWh)`, and `Cost ($)`. 
**What would break in reality:**
- Overlapping billing periods. If a bill is from Jan 15 to Feb 14, naive grouping by calendar month will skew monthly emission reports. The data model supports start and end dates, but the analytics engine would need to interpolate daily usage.
- Missing multiplier factors. Sometimes the meter reads 100, but the meter multiplier on the bill is 10, meaning actual usage is 1000 kWh. If the CSV excludes this, the data is useless.

## 3. Corporate Travel (Flights/Hotels)
**Format Researched:** REST API (Concur/Navan).
**Why:** Modern travel platforms are API-first. An analyst shouldn't have to download spreadsheets for this.
**Sample Data Shape:** I simulated an API response containing an array of JSON objects. Flights have `origin`, `destination`, and `distance_km`. Hotels have `nights`.
**What would break in reality:**
- API rate limits during bulk historical syncs.
- Missing distance. The Concur API might only return airport codes (e.g., LHR to JFK) without the actual flight distance. The system would need a fallback mechanism (like the Great Circle distance formula utilizing an airport coordinate database) to calculate the distance for the emission factor application. My prototype flags this scenario as `SUSPICIOUS`.
