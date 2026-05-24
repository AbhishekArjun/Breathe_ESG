from django.contrib import admin
from .models import Client, DataSource, IngestionJob, RawDataRecord, NormalizedDataRecord

admin.site.register(Client)
admin.site.register(DataSource)
admin.site.register(IngestionJob)
admin.site.register(RawDataRecord)
admin.site.register(NormalizedDataRecord)
