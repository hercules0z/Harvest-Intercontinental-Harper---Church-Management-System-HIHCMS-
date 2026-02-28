from django.db import models


class Church(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100, default="Liberia")
    default_currency = models.CharField(max_length=3, default="USD")
    timezone = models.CharField(max_length=100, default="Africa/Monrovia")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class Campus(models.Model):
    church = models.ForeignKey(Church, related_name="campuses", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.church.name} - {self.name}"
