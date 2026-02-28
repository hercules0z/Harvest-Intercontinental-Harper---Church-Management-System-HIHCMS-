from rest_framework import serializers

from .models import Member, MemberSectionNotes


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            "id",
            "church",
            "campus",
            "full_name",
            "phone",
            "ministry",
            "department",
            "email",
            "gender",
            "address",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
        extra_kwargs = {
            "church": {"required": False},
            "campus": {"required": False},
        }


class MemberSectionNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberSectionNotes
        fields = [
            "households",
            "baptism_membership_status",
            "ministry_assignments",
            "activity_timeline",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]
