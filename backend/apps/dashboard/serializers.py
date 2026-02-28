from rest_framework import serializers

from .models import AttendanceRecord, Contribution, Department, PayrollRecord


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "church", "name", "is_active", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]
        extra_kwargs = {
            "church": {"required": False},
        }


class ContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribution
        fields = [
            "id",
            "church",
            "member",
            "contribution_type",
            "amount",
            "currency",
            "contributed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
        extra_kwargs = {
            "church": {"required": False},
            "member": {"required": False, "allow_null": True},
        }


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = [
            "id",
            "church",
            "member",
            "event",
            "attendance_type",
            "attended_at",
            "present",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
        extra_kwargs = {
            "church": {"required": False},
            "member": {"required": False, "allow_null": True},
            "event": {"required": False, "allow_null": True},
        }


class PayrollRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollRecord
        fields = [
            "id",
            "church",
            "staff_name",
            "role_title",
            "gross_amount",
            "deductions",
            "allowances",
            "net_amount",
            "currency",
            "paid_at",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
        extra_kwargs = {
            "church": {"required": False},
        }
