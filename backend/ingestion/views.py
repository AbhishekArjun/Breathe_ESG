from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Client, DataSource, IngestionJob, NormalizedDataRecord
from .serializers import (
    ClientSerializer, DataSourceSerializer, IngestionJobSerializer,
    NormalizedDataRecordSerializer
)
from .parsers import process_sap_csv, process_utility_csv, process_travel_json

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class DataSourceViewSet(viewsets.ModelViewSet):
    queryset = DataSource.objects.all()
    serializer_class = DataSourceSerializer

class IngestionJobViewSet(viewsets.ModelViewSet):
    queryset = IngestionJob.objects.all().order_by('-started_at')
    serializer_class = IngestionJobSerializer

    @action(detail=False, methods=['post'])
    def upload(self, request):
        source_id = request.data.get('data_source_id')
        file_obj = request.FILES.get('file')
        
        if not source_id or not file_obj:
            return Response({'error': 'data_source_id and file are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data_source = DataSource.objects.get(id=source_id)
        except DataSource.DoesNotExist:
            return Response({'error': 'DataSource not found'}, status=status.HTTP_404_NOT_FOUND)
            
        raw_content = file_obj.read()
        file_content = raw_content.decode('utf-8', errors='replace').strip()
        if file_content.startswith('\ufeff'):
            file_content = file_content[1:]
            
        job = IngestionJob.objects.create(data_source=data_source, status='PROCESSING')
        
        try:
            if not file_content:
                raise Exception("The uploaded file is empty.")
                
            if data_source.source_type == 'SAP':
                process_sap_csv(job, file_content)
            elif data_source.source_type == 'UTILITY':
                process_utility_csv(job, file_content)
            elif data_source.source_type == 'TRAVEL':
                process_travel_json(job, file_content)
                
            # Parsers might have set status to FAILED and saved the job
            job.refresh_from_db()
            if job.status != 'FAILED':
                job.status = 'COMPLETED'
        except Exception as e:
            job.status = 'FAILED'
            safe_content = repr(file_content[:50])
            job.summary_notes = f"{str(e)} | Content start: {safe_content}"
            job.save()
            
        job.completed_at = timezone.now()
        job.save()
        
        return Response(IngestionJobSerializer(job).data)

class NormalizedDataRecordViewSet(viewsets.ModelViewSet):
    queryset = NormalizedDataRecord.objects.all().order_by('-id')
    serializer_class = NormalizedDataRecordSerializer

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        record = self.get_object()
        record.status = 'APPROVED'
        record.reviewed_at = timezone.now()
        record.reviewed_by = request.data.get('user', 'Analyst')
        record.save()
        return Response(self.get_serializer(record).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        record = self.get_object()
        record.status = 'REJECTED'
        record.reviewed_at = timezone.now()
        record.reviewed_by = request.data.get('user', 'Analyst')
        record.audit_notes = request.data.get('notes', record.audit_notes)
        record.save()
        return Response(self.get_serializer(record).data)
