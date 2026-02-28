from django.contrib import admin

from .models import Contribution, Department, Event


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "church", "is_active", "updated_at")
    list_filter = ("church", "is_active")
    search_fields = ("name", "church__name")


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "church", "starts_at", "is_cancelled")
    list_filter = ("church", "is_cancelled")
    search_fields = ("title", "church__name")


@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ("church", "member", "amount", "currency", "contributed_at")
    list_filter = ("church", "currency")
    search_fields = ("church__name", "member__full_name")
