from django.db import models


class Department(models.Model):
    church = models.ForeignKey("churches.Church", related_name="departments", on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        unique_together = ("church", "name")

    def __str__(self) -> str:
        return self.name


class Event(models.Model):
    church = models.ForeignKey("churches.Church", related_name="events", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    starts_at = models.DateTimeField()
    is_cancelled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["starts_at"]

    def __str__(self) -> str:
        return self.title


class Contribution(models.Model):
    class ContributionType(models.TextChoices):
        TITHE = "tithe", "Tithe"
        OFFERING = "offering", "Offering"

    church = models.ForeignKey("churches.Church", related_name="contributions", on_delete=models.CASCADE)
    member = models.ForeignKey("members.Member", related_name="contributions", on_delete=models.SET_NULL, null=True, blank=True)
    contribution_type = models.CharField(max_length=20, choices=ContributionType.choices, default=ContributionType.TITHE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    contributed_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-contributed_at"]

    def __str__(self) -> str:
        return f"{self.amount} {self.currency}"


class AttendanceRecord(models.Model):
    class AttendanceType(models.TextChoices):
        SERVICE = "service", "Service"
        EVENT = "event", "Event"
        CHILDREN = "children", "Children Check-in"

    church = models.ForeignKey("churches.Church", related_name="attendance_records", on_delete=models.CASCADE)
    member = models.ForeignKey("members.Member", related_name="attendance_records", on_delete=models.SET_NULL, null=True, blank=True)
    event = models.ForeignKey(Event, related_name="attendance_records", on_delete=models.SET_NULL, null=True, blank=True)
    attendance_type = models.CharField(max_length=20, choices=AttendanceType.choices, default=AttendanceType.SERVICE)
    attended_at = models.DateTimeField()
    present = models.BooleanField(default=True)
    notes = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-attended_at"]

    def __str__(self) -> str:
        return f"Attendance {self.attendance_type} @ {self.attended_at}"


class PayrollRecord(models.Model):
    church = models.ForeignKey("churches.Church", related_name="payroll_records", on_delete=models.CASCADE)
    staff_name = models.CharField(max_length=255)
    role_title = models.CharField(max_length=150, blank=True)
    gross_amount = models.DecimalField(max_digits=12, decimal_places=2)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="USD")
    paid_at = models.DateField()
    notes = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-paid_at", "-created_at"]

    def __str__(self) -> str:
        return f"Payroll {self.staff_name} - {self.net_amount} {self.currency}"
