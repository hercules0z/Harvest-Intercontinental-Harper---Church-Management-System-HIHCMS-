from django.contrib import admin

from .models import Campus, Church


@admin.register(Church)
class ChurchAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "country", "default_currency", "timezone")
    search_fields = ("name",)


@admin.register(Campus)
class CampusAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "church", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)
