from rest_framework import serializers

from .models import Campus, Church


class ChurchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Church
        fields = ["id", "name", "country", "default_currency", "timezone", "created_at", "updated_at"]


class CampusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campus
        fields = ["id", "church", "name", "address", "is_active", "created_at", "updated_at"]
