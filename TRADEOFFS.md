# Tradeoffs

Here are three things I deliberately chose *not* to build in this prototype and why:

### 1. Complex User Authentication and RBAC (Role-Based Access Control)
**What wasn't built:** I did not integrate Django Allauth or set up a strict login wall with roles like "Data Provider", "Analyst", and "Auditor". The API currently accepts the reviewer name as a simple string payload.
**Why:** The core challenge of the assignment was data ingestion, normalization, and the review UX. Building a robust auth system takes significant time and boilerplate, distracting from the unique ESG data challenges. 

### 2. Live API Integrations (OAuth / Webhooks)
**What wasn't built:** The system does not actually connect to the Concur or Navan APIs using OAuth2 to pull data on a cron schedule.
**Why:** Setting up sandbox accounts, managing API keys, and handling OAuth token refreshes for third-party systems is time-consuming and prone to environment-specific errors. Simulating the API response via a JSON upload allowed me to focus on the *parsing and normalization logic* (the hard part) rather than the transport layer.

### 3. Dynamic Unit Conversions
**What wasn't built:** A robust unit conversion engine (e.g., converting 'Gallons' to 'Liters', or 'MWh' to 'kWh' dynamically based on a conversion matrix).
**Why:** While critical for a production ESG platform, building a comprehensive unit registry and conversion logic for a 4-day prototype is overkill. The current system normalizes the data structure by extracting the numeric value and the unit string cleanly, leaving the actual mathematical conversion as a future step for the calculation engine.
