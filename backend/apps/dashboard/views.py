from decimal import Decimal

from django.db.models import Q, Sum
from django.db.models.functions import Lower
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView

from apps.accounts.models import UserRole
from apps.accounts.permissions import (
    CanManageAttendance,
    CanManageContributions,
    CanManageDepartments,
    CanManagePayroll,
    CanViewDashboardSummary,
)
from apps.members.models import Member

from .models import AttendanceRecord, Contribution, Department, Event, PayrollRecord
from .serializers import AttendanceRecordSerializer, ContributionSerializer, DepartmentSerializer, PayrollRecordSerializer


class DepartmentViewSet(ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, CanManageDepartments]

    def get_queryset(self):
        if self.request.user.role == UserRole.SUPER_ADMIN:
            return Department.objects.select_related("church").all()
        if self.request.user.church_id:
            return Department.objects.select_related("church").filter(church_id=self.request.user.church_id)
        return Department.objects.none()

    def create(self, request, *args, **kwargs):
        payload = request.data.copy()

        if request.user.role == UserRole.SUPER_ADMIN:
            if not payload.get("church"):
                if request.user.church_id:
                    payload["church"] = request.user.church_id
                else:
                    raise ValidationError({"church": ["This field is required for super admin users."]})
        else:
            if not request.user.church_id:
                raise ValidationError({"detail": ["Your account is not linked to a church. Contact an administrator."]})
            payload["church"] = request.user.church_id

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()


class ContributionViewSet(ModelViewSet):
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated, CanManageContributions]

    def get_queryset(self):
        if self.request.user.role == UserRole.SUPER_ADMIN:
            return Contribution.objects.select_related("church", "member").all()
        if self.request.user.church_id:
            return Contribution.objects.select_related("church", "member").filter(church_id=self.request.user.church_id)
        return Contribution.objects.none()

    def create(self, request, *args, **kwargs):
        payload = request.data.copy()

        if request.user.role == UserRole.SUPER_ADMIN:
            if not payload.get("church"):
                if request.user.church_id:
                    payload["church"] = request.user.church_id
                else:
                    raise ValidationError({"church": ["This field is required for super admin users."]})
        else:
            if not request.user.church_id:
                raise ValidationError({"detail": ["Your account is not linked to a church. Contact an administrator."]})
            payload["church"] = request.user.church_id

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()


class AttendanceRecordViewSet(ModelViewSet):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [IsAuthenticated, CanManageAttendance]

    def get_queryset(self):
        if self.request.user.role == UserRole.SUPER_ADMIN:
            return AttendanceRecord.objects.select_related("church", "member", "event").all()
        if self.request.user.church_id:
            return AttendanceRecord.objects.select_related("church", "member", "event").filter(
                church_id=self.request.user.church_id
            )
        return AttendanceRecord.objects.none()

    def create(self, request, *args, **kwargs):
        payload = request.data.copy()

        if request.user.role == UserRole.SUPER_ADMIN:
            if not payload.get("church"):
                if request.user.church_id:
                    payload["church"] = request.user.church_id
                else:
                    raise ValidationError({"church": ["This field is required for super admin users."]})
        else:
            if not request.user.church_id:
                raise ValidationError({"detail": ["Your account is not linked to a church. Contact an administrator."]})
            payload["church"] = request.user.church_id

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()


class PayrollRecordViewSet(ModelViewSet):
    serializer_class = PayrollRecordSerializer
    permission_classes = [IsAuthenticated, CanManagePayroll]

    def get_queryset(self):
        if self.request.user.role == UserRole.SUPER_ADMIN:
            return PayrollRecord.objects.select_related("church").all()
        if self.request.user.church_id:
            return PayrollRecord.objects.select_related("church").filter(church_id=self.request.user.church_id)
        return PayrollRecord.objects.none()

    def create(self, request, *args, **kwargs):
        payload = request.data.copy()

        if request.user.role == UserRole.SUPER_ADMIN:
            if not payload.get("church"):
                if request.user.church_id:
                    payload["church"] = request.user.church_id
                else:
                    raise ValidationError({"church": ["This field is required for super admin users."]})
        else:
            if not request.user.church_id:
                raise ValidationError({"detail": ["Your account is not linked to a church. Contact an administrator."]})
            payload["church"] = request.user.church_id

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated, CanViewDashboardSummary]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        if request.user.role == UserRole.SUPER_ADMIN:
            member_queryset = Member.objects.filter(is_active=True)
            department_queryset = Department.objects.filter(is_active=True)
            event_queryset = Event.objects.filter(is_cancelled=False)
            contribution_queryset = Contribution.objects.all()
        elif request.user.church_id:
            member_queryset = Member.objects.filter(church_id=request.user.church_id, is_active=True)
            department_queryset = Department.objects.filter(church_id=request.user.church_id, is_active=True)
            event_queryset = Event.objects.filter(church_id=request.user.church_id, is_cancelled=False)
            contribution_queryset = Contribution.objects.filter(church_id=request.user.church_id)
        else:
            member_queryset = Member.objects.none()
            department_queryset = Department.objects.none()
            event_queryset = Event.objects.none()
            contribution_queryset = Contribution.objects.none()

        total_members = member_queryset.count()
        active_departments = department_queryset.count()
        upcoming_events = event_queryset.filter(starts_at__gte=now).count()

        tithes_this_month = contribution_queryset.filter(contributed_at__gte=month_start).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0.00")

        female_members = member_queryset.annotate(gender_normalized=Lower("gender")).filter(
            Q(gender_normalized="female") | Q(gender_normalized="f")
        ).count()
        male_members = member_queryset.annotate(gender_normalized=Lower("gender")).filter(
            Q(gender_normalized="male") | Q(gender_normalized="m")
        ).count()

        if total_members > 0:
            female_percentage = round((female_members / total_members) * 100, 2)
            male_percentage = round((male_members / total_members) * 100, 2)
        else:
            female_percentage = 0
            male_percentage = 0

        return Response(
            {
                "total_members": total_members,
                "total_tithes_this_month": str(tithes_this_month),
                "active_departments": active_departments,
                "upcoming_events": upcoming_events,
                "female_members": female_members,
                "male_members": male_members,
                "female_percentage": female_percentage,
                "male_percentage": male_percentage,
            }
        )
