from rest_framework import permissions, viewsets

from apps.accounts.models import UserRole
from apps.accounts.permissions import CanManageChurchStructure

from .models import Campus, Church
from .serializers import CampusSerializer, ChurchSerializer


class ChurchViewSet(viewsets.ModelViewSet):
    serializer_class = ChurchSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageChurchStructure]

    def get_queryset(self):
        if self.request.user.role == UserRole.SUPER_ADMIN:
            return Church.objects.all().order_by("id")
        if self.request.user.church_id:
            return Church.objects.filter(id=self.request.user.church_id)
        return Church.objects.none()


class CampusViewSet(viewsets.ModelViewSet):
    serializer_class = CampusSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageChurchStructure]

    def get_queryset(self):
        if self.request.user.role == UserRole.SUPER_ADMIN:
            return Campus.objects.select_related("church").all().order_by("id")
        if self.request.user.church_id:
            return Campus.objects.select_related("church").filter(church_id=self.request.user.church_id)
        return Campus.objects.none()
