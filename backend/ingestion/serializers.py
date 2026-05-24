from rest_framework import serializers
from .models import Client, DataSource, IngestionJob, RawDataRecord, NormalizedDataRecord

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = '__all__'

class IngestionJobSerializer(serializers.ModelSerializer):
    data_source_name = serializers.CharField(source='data_source.name', read_only=True)
    source_type = serializers.CharField(source='data_source.source_type', read_only=True)
    
    class Meta:
        model = IngestionJob
        fields = ['id', 'data_source', 'data_source_name', 'source_type', 'status', 'started_at', 'completed_at', 'summary_notes']

class RawDataRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawDataRecord
        fields = '__all__'

class NormalizedDataRecordSerializer(serializers.ModelSerializer):
    raw_payload = serializers.JSONField(source='raw_record.raw_payload', read_only=True)
    job_status = serializers.CharField(source='ingestion_job.status', read_only=True)
    source_type = serializers.CharField(source='ingestion_job.data_source.source_type', read_only=True)

    class Meta:
        model = NormalizedDataRecord
        fields = [
            'id', 'ingestion_job', 'job_status', 'source_type', 'raw_payload',
            'scope', 'emission_category', 'activity_date', 'activity_date_end',
            'normalized_quantity', 'normalized_unit', 'status', 'audit_notes',
            'reviewed_at', 'reviewed_by'
        ]
