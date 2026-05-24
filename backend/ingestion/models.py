from django.db import models
from django.utils import timezone

class Client(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class DataSource(models.Model):
    SOURCE_TYPES = [
        ('SAP', 'SAP (Fuel and Procurement)'),
        ('UTILITY', 'Utility Data (Electricity)'),
        ('TRAVEL', 'Corporate Travel'),
    ]
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='data_sources')
    name = models.CharField(max_length=255)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    
    def __str__(self):
        return f"{self.client.name} - {self.name} ({self.source_type})"

class IngestionJob(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    data_source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name='ingestion_jobs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    summary_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Job {self.id} - {self.data_source.name} - {self.status}"

class RawDataRecord(models.Model):
    ingestion_job = models.ForeignKey(IngestionJob, on_delete=models.CASCADE, related_name='raw_records')
    raw_payload = models.JSONField(help_text="The exact JSON or CSV row as parsed")
    created_at = models.DateTimeField(auto_now_add=True)

class NormalizedDataRecord(models.Model):
    STATUS_CHOICES = [
        ('PENDING_REVIEW', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SUSPICIOUS', 'Suspicious'),
    ]
    SCOPE_CHOICES = [
        (1, 'Scope 1'),
        (2, 'Scope 2'),
        (3, 'Scope 3'),
    ]
    
    raw_record = models.OneToOneField(RawDataRecord, on_delete=models.CASCADE, related_name='normalized_record')
    ingestion_job = models.ForeignKey(IngestionJob, on_delete=models.CASCADE, related_name='normalized_records')
    
    # Normalized Data Fields
    scope = models.IntegerField(choices=SCOPE_CHOICES)
    emission_category = models.CharField(max_length=255, help_text="e.g., 'Stationary Combustion', 'Purchased Electricity', 'Business Travel'")
    activity_date = models.DateField(null=True, blank=True)
    activity_date_end = models.DateField(null=True, blank=True, help_text="For periods, e.g., utility bills")
    
    normalized_quantity = models.FloatField(null=True, blank=True)
    normalized_unit = models.CharField(max_length=50, blank=True, null=True)
    
    # Audit & Review
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_REVIEW')
    audit_notes = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"Record {self.id} - {self.get_scope_display()} - {self.status}"
