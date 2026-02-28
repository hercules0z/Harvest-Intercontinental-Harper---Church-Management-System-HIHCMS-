from rest_framework.permissions import BasePermission
from rest_framework.permissions import SAFE_METHODS

from .models import UserRole


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role in {
            UserRole.SUPER_ADMIN,
            UserRole.CHURCH_ADMIN,
        }


class CanManageMembers(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False

        if request.user.role in {UserRole.SUPER_ADMIN, UserRole.CHURCH_ADMIN}:
            return True

        if request.user.role in {UserRole.PASTOR, UserRole.MINISTRY_LEADER}:
            return request.method in SAFE_METHODS

        return False


class CanManageMemberSectionNotes(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False

        if request.user.role in {UserRole.SUPER_ADMIN, UserRole.CHURCH_ADMIN, UserRole.PASTOR, UserRole.MINISTRY_LEADER}:
            return True

        return False


class CanManageChurchStructure(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False

        return request.user.role in {UserRole.SUPER_ADMIN, UserRole.CHURCH_ADMIN}


class CanManageDepartments(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False

        if request.user.role in {UserRole.SUPER_ADMIN, UserRole.CHURCH_ADMIN}:
            return True

        if request.user.role in {UserRole.PASTOR, UserRole.MINISTRY_LEADER}:
            return request.method in SAFE_METHODS

        return False


class CanManageContributions(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False

        if request.user.role in {UserRole.SUPER_ADMIN, UserRole.CHURCH_ADMIN, UserRole.FINANCE_OFFICER}:
            return True

        return False


class CanViewDashboardSummary(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False

        return request.user.role in {
            UserRole.SUPER_ADMIN,
            UserRole.CHURCH_ADMIN,
            UserRole.FINANCE_OFFICER,
            UserRole.PASTOR,
            UserRole.MINISTRY_LEADER,
            UserRole.HR_OFFICER,
            UserRole.CHECKIN_STAFF,
            UserRole.MEMBER,
        }


class CanManageAttendance(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False

        if request.user.role in {UserRole.SUPER_ADMIN, UserRole.CHURCH_ADMIN, UserRole.CHECKIN_STAFF}:
            return True

        if request.user.role == UserRole.PASTOR:
            return request.method in SAFE_METHODS

        return False


class CanManagePayroll(BasePermission):
    def has_permission(self, request, view):
        if not request.user:
            return False

        return request.user.role in {
            UserRole.SUPER_ADMIN,
            UserRole.CHURCH_ADMIN,
            UserRole.HR_OFFICER,
        }
