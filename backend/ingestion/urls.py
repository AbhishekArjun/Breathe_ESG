from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, DataSourceViewSet, IngestionJobViewSet, NormalizedDataRecordViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'data-sources', DataSourceViewSet)
router.register(r'ingestion-jobs', IngestionJobViewSet)
router.register(r'records', NormalizedDataRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
