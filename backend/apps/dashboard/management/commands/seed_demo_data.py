from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User, UserRole
from apps.churches.models import Campus, Church
from apps.dashboard.models import Contribution, Department, Event
from apps.members.models import Member


class Command(BaseCommand):
    help = "Seed demo church, users, members, departments, events, and contributions data."

    def handle(self, *args, **options):
        now = timezone.now()

        church, _ = Church.objects.get_or_create(
            name="Harvest Intercontinental Church - Harper",
            defaults={
                "country": "Liberia",
                "default_currency": "USD",
                "timezone": "Africa/Monrovia",
            },
        )

        campus, _ = Campus.objects.get_or_create(
            church=church,
            name="Main Campus",
            defaults={"address": "Harper, Maryland County, Liberia", "is_active": True},
        )

        department_names = [
            "Choir",
            "Ushers",
            "Media",
            "Protocol",
            "Children Ministry",
            "Prayer Team",
            "Youth Ministry",
        ]

        for department_name in department_names:
            Department.objects.get_or_create(
                church=church,
                name=department_name,
                defaults={"is_active": True},
            )

        members_data = [
            ("Samuel Doe", "0886000001", "Worship", "Choir", "male"),
            ("Mary Kollie", "0886000002", "Service", "Ushers", "female"),
            ("James Brown", "0886000003", "Tech", "Media", "male"),
            ("Grace Weah", "0886000004", "Children", "Children Ministry", "female"),
            ("Joseph Fahnbulleh", "0886000005", "Prayer", "Prayer Team", "male"),
            ("Patience Johnson", "0886000006", "Youth", "Youth Ministry", "female"),
            ("Daniel Nyenpan", "0886000007", "Service", "Protocol", "male"),
            ("Ruth Kamara", "0886000008", "Worship", "Choir", "female"),
        ]

        created_members = []
        for full_name, phone, ministry, department, gender in members_data:
            member, _ = Member.objects.get_or_create(
                church=church,
                full_name=full_name,
                defaults={
                    "campus": campus,
                    "phone": phone,
                    "ministry": ministry,
                    "department": department,
                    "email": f"{full_name.lower().replace(' ', '.')}@hipcms.local",
                    "gender": gender,
                    "address": "Harper, Liberia",
                    "is_active": True,
                },
            )
            created_members.append(member)

        Event.objects.get_or_create(
            church=church,
            title="Sunday Worship Service",
            starts_at=now + timedelta(days=1),
            defaults={"is_cancelled": False},
        )
        Event.objects.get_or_create(
            church=church,
            title="Leaders Training",
            starts_at=now + timedelta(days=5),
            defaults={"is_cancelled": False},
        )
        Event.objects.get_or_create(
            church=church,
            title="Community Outreach",
            starts_at=now + timedelta(days=10),
            defaults={"is_cancelled": False},
        )

        month_start = now.replace(day=1, hour=10, minute=0, second=0, microsecond=0)

        contribution_blueprint = [
            (Decimal("120.00"), 2),
            (Decimal("85.00"), 7),
            (Decimal("150.00"), 10),
            (Decimal("90.00"), 14),
            (Decimal("60.00"), 18),
            (Decimal("200.00"), 22),
        ]

        for index, (amount, day_offset) in enumerate(contribution_blueprint):
            member = created_members[index % len(created_members)] if created_members else None
            contributed_at = month_start + timedelta(days=day_offset)
            Contribution.objects.get_or_create(
                church=church,
                member=member,
                amount=amount,
                currency="USD",
                contributed_at=contributed_at,
            )

        if not User.objects.filter(email="admin@hipcms.local").exists():
            User.objects.create_superuser(
                email="admin@hipcms.local",
                password="Passw0rd!",
                full_name="Platform Super Admin",
                church=church,
            )

        if not User.objects.filter(email="churchadmin@hipcms.local").exists():
            User.objects.create_user(
                email="churchadmin@hipcms.local",
                password="Passw0rd!",
                full_name="Church Administrator",
                role=UserRole.CHURCH_ADMIN,
                church=church,
            )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
        self.stdout.write(self.style.SUCCESS("Login: admin@hipcms.local / Passw0rd!"))
        self.stdout.write(self.style.SUCCESS("Login: churchadmin@hipcms.local / Passw0rd!"))
