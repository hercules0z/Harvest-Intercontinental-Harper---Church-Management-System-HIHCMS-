from rest_framework import permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError

from apps.accounts.models import UserRole
from apps.accounts.permissions import CanManageMemberSectionNotes, CanManageMembers

from .models import Member, MemberSectionNotes
from .serializers import MemberSerializer, MemberSectionNotesSerializer


class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageMembers]

    def get_queryset(self):
        if self.request.user.role == UserRole.SUPER_ADMIN:
            return Member.objects.select_related("church", "campus").all()
        if self.request.user.church_id:
            return Member.objects.select_related("church", "campus").filter(church_id=self.request.user.church_id)
        return Member.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role == UserRole.SUPER_ADMIN:
            if not serializer.validated_data.get("church"):
                raise ValidationError({"church": ["This field is required for super admin users."]})
            serializer.save()
            return

        if not self.request.user.church_id:
            raise ValidationError({"detail": ["Your account is not linked to a church. Contact an administrator."]})

        serializer.save(church_id=self.request.user.church_id)


class MemberSectionNotesView(APIView):
    permission_classes = [permissions.IsAuthenticated, CanManageMemberSectionNotes]

    def _resolve_church_id(self, request):
        if request.user.role == UserRole.SUPER_ADMIN:
            church_id_value = request.query_params.get("church_id")
            if not church_id_value and isinstance(request.data, dict):
                church_id_value = request.data.get("church_id")

            if not church_id_value:
                raise ValidationError({"church_id": ["This field is required for super admin users."]})

            return church_id_value

        if not request.user.church_id:
            raise ValidationError({"detail": ["Your account is not linked to a church. Contact an administrator."]})

        return request.user.church_id

    def get(self, request):
        church_id = self._resolve_church_id(request)
        notes, _ = MemberSectionNotes.objects.get_or_create(church_id=church_id)
        serializer = MemberSectionNotesSerializer(notes)
        return Response(serializer.data)

    def patch(self, request):
        church_id = self._resolve_church_id(request)
        notes, _ = MemberSectionNotes.objects.get_or_create(church_id=church_id)
        serializer = MemberSectionNotesSerializer(notes, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
