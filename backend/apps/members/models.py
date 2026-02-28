from django.db import models


class Member(models.Model):
    church = models.ForeignKey("churches.Church", related_name="members", on_delete=models.CASCADE)
    campus = models.ForeignKey(
        "churches.Campus",
        related_name="members",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    ministry = models.CharField(max_length=120, blank=True)
    department = models.CharField(max_length=120, blank=True)
    email = models.EmailField(blank=True)
    gender = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.full_name


class MemberSectionNotes(models.Model):
    church = models.OneToOneField("churches.Church", related_name="member_section_notes", on_delete=models.CASCADE)
    households = models.TextField(blank=True)
    baptism_membership_status = models.TextField(blank=True)
    ministry_assignments = models.TextField(blank=True)
    activity_timeline = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "member section notes"

    def __str__(self) -> str:
        return f"Member section notes - {self.church.name}"
