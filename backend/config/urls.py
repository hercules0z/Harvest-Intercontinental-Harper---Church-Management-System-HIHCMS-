from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import LoginView, MeView, RegisterView
from apps.churches.views import ChurchViewSet, CampusViewSet
from apps.dashboard.views import AttendanceRecordViewSet, ContributionViewSet, DashboardSummaryView, DepartmentViewSet, PayrollRecordViewSet
from apps.members.views import MemberSectionNotesView, MemberViewSet

router = DefaultRouter()
router.register("churches", ChurchViewSet, basename="church")
router.register("campuses", CampusViewSet, basename="campus")
router.register("members", MemberViewSet, basename="member")
router.register("departments", DepartmentViewSet, basename="department")
router.register("contributions", ContributionViewSet, basename="contribution")
router.register("attendance-records", AttendanceRecordViewSet, basename="attendance_record")
router.register("payroll-records", PayrollRecordViewSet, basename="payroll_record")


def health_view(request):
    return JsonResponse({"status": "ok", "service": "HICHMS API"})

urlpatterns = [
    path("", health_view, name="health"),
    path("admin/", admin.site.urls),
    path("api/v1/dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard_summary"),
    path("api/v1/members/section-notes/", MemberSectionNotesView.as_view(), name="member_section_notes"),
    path("api/v1/auth/register/", RegisterView.as_view(), name="register"),
    path("api/v1/auth/login/", LoginView.as_view(), name="login"),
    path("api/v1/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/auth/me/", MeView.as_view(), name="me"),
    path("api/v1/", include(router.urls)),
]
