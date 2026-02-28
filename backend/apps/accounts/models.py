from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserRole(models.TextChoices):
    SUPER_ADMIN = "super_admin", "Super Admin"
    CHURCH_ADMIN = "church_admin", "Church Admin"
    FINANCE_OFFICER = "finance_officer", "Finance Officer"
    PASTOR = "pastor", "Pastor"
    MINISTRY_LEADER = "ministry_leader", "Ministry Leader"
    HR_OFFICER = "hr_officer", "HR Officer"
    CHECKIN_STAFF = "checkin_staff", "Check-in Staff"
    MEMBER = "member", "Member"


class UserManager(BaseUserManager):
    def create_user(self, email: str, password: str | None = None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", UserRole.SUPER_ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    first_name = None
    last_name = None

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=UserRole.choices, default=UserRole.MEMBER)
    church = models.ForeignKey(
        "churches.Church",
        related_name="users",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    def __str__(self) -> str:
        return self.email
