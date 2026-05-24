import csv
import json
from datetime import datetime
from io import StringIO
from .models import RawDataRecord, NormalizedDataRecord, IngestionJob

def parse_date(date_str, fmt='%Y-%m-%d'):
    try:
        return datetime.strptime(date_str.strip(), fmt).date()
    except (ValueError, AttributeError):
        return None

def process_sap_csv(job: IngestionJob, file_content: str):
    reader = csv.DictReader(StringIO(file_content))
    # Expected German headers from a typical basic SAP export: 
    # 'Buchungsdatum' (Posting Date), 'Materialkurztext' (Description), 'Menge' (Quantity), 'Basiseinheit' (Base Unit)
    
    for row in reader:
        raw = RawDataRecord.objects.create(ingestion_job=job, raw_payload=row)
        
        try:
            date_str = row.get('Buchungsdatum', '')
            date_val = parse_date(date_str, '%d.%m.%Y') or parse_date(date_str, '%Y-%m-%d')
            qty_str = row.get('Menge', '0').replace(',', '.')
            quantity = float(qty_str) if qty_str else 0.0
            
            unit = row.get('Basiseinheit', '').strip()
            desc = row.get('Materialkurztext', '').strip()
            
            # Basic validation/suspicion flag
            status = 'PENDING_REVIEW'
            notes = []
            if quantity < 0:
                status = 'SUSPICIOUS'
                notes.append("Negative quantity.")
            if not unit:
                status = 'SUSPICIOUS'
                notes.append("Missing unit.")
                
            NormalizedDataRecord.objects.create(
                raw_record=raw,
                ingestion_job=job,
                scope=3, # Typically purchased goods (Scope 3 Category 1) or Fuel (Scope 1). We'll assume Scope 3 for procurement.
                emission_category=desc if desc else 'Unknown Procurement',
                activity_date=date_val,
                normalized_quantity=quantity,
                normalized_unit=unit,
                status=status,
                audit_notes=" ".join(notes)
            )
        except Exception as e:
            NormalizedDataRecord.objects.create(
                raw_record=raw,
                ingestion_job=job,
                scope=3,
                emission_category='Error parsing',
                status='FAILED',
                audit_notes=str(e)
            )

def process_utility_csv(job: IngestionJob, file_content: str):
    reader = csv.DictReader(StringIO(file_content))
    # Expected headers: 'Billing Start', 'Billing End', 'Usage (kWh)'
    for row in reader:
        raw = RawDataRecord.objects.create(ingestion_job=job, raw_payload=row)
        try:
            start_date = parse_date(row.get('Billing Start', ''))
            end_date = parse_date(row.get('Billing End', ''))
            usage = float(row.get('Usage (kWh)', 0))
            
            status = 'PENDING_REVIEW'
            notes = []
            if usage > 1000000:
                status = 'SUSPICIOUS'
                notes.append("Unusually high usage (over 1M kWh).")
                
            NormalizedDataRecord.objects.create(
                raw_record=raw,
                ingestion_job=job,
                scope=2, # Purchased Electricity
                emission_category='Purchased Electricity',
                activity_date=start_date,
                activity_date_end=end_date,
                normalized_quantity=usage,
                normalized_unit='kWh',
                status=status,
                audit_notes=" ".join(notes)
            )
        except Exception as e:
            NormalizedDataRecord.objects.create(
                raw_record=raw,
                ingestion_job=job,
                scope=2,
                emission_category='Error parsing',
                status='FAILED',
                audit_notes=str(e)
            )

def process_travel_json(job: IngestionJob, file_content: str):
    try:
        data = json.loads(file_content)
    except json.JSONDecodeError as e:
        job.status = 'FAILED'
        job.summary_notes = f"Invalid JSON: {e}"
        job.save()
        return

    for item in data:
        raw = RawDataRecord.objects.create(ingestion_job=job, raw_payload=item)
        try:
            travel_type = item.get('type', 'unknown')
            date_val = parse_date(item.get('date', ''))
            
            status = 'PENDING_REVIEW'
            notes = []
            
            if travel_type == 'flight':
                distance = item.get('distance_km')
                if distance is None:
                    status = 'SUSPICIOUS'
                    notes.append("Flight distance missing.")
                    distance = 0
                else:
                    distance = float(distance)
                    
                NormalizedDataRecord.objects.create(
                    raw_record=raw,
                    ingestion_job=job,
                    scope=3, # Scope 3 Category 6: Business Travel
                    emission_category=f"Flight: {item.get('origin', '?')} to {item.get('destination', '?')}",
                    activity_date=date_val,
                    normalized_quantity=distance,
                    normalized_unit='km',
                    status=status,
                    audit_notes=" ".join(notes)
                )
            elif travel_type == 'hotel':
                nights = int(item.get('nights', 0))
                if nights <= 0:
                    status = 'SUSPICIOUS'
                    notes.append("Invalid nights for hotel stay.")
                
                NormalizedDataRecord.objects.create(
                    raw_record=raw,
                    ingestion_job=job,
                    scope=3,
                    emission_category="Hotel Stay",
                    activity_date=date_val,
                    normalized_quantity=float(nights),
                    normalized_unit='nights',
                    status=status,
                    audit_notes=" ".join(notes)
                )
            else:
                NormalizedDataRecord.objects.create(
                    raw_record=raw,
                    ingestion_job=job,
                    scope=3,
                    emission_category=f"Unknown travel: {travel_type}",
                    status='SUSPICIOUS',
                    audit_notes="Unknown type"
                )
        except Exception as e:
            NormalizedDataRecord.objects.create(
                raw_record=raw,
                ingestion_job=job,
                scope=3,
                emission_category='Error parsing',
                status='FAILED',
                audit_notes=str(e)
            )
