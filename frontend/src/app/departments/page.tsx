"use client";

import { DashboardContentShell } from "@/components/dashboard/content-shell";
import { Building2, Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { apiRequest } from "@/lib/api-client";

type Department = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
};

type DepartmentListResponse =
  | Department[]
  | {
      results: Department[];
    };

function extractDepartments(payload: DepartmentListResponse): Department[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.results ?? [];
}

function extractApiError(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const errorMap = error as Record<string, unknown>;
  const detail = errorMap.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail[0] && typeof detail[0] === "string") {
    return detail[0];
  }

  const firstKey = Object.keys(errorMap)[0];
  const firstValue = firstKey ? errorMap[firstKey] : null;
  if (Array.isArray(firstValue) && firstValue[0] && typeof firstValue[0] === "string") {
    return firstValue[0];
  }

  return fallback;
}

export default function DepartmentsPage() {
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<number | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);
  const [editingDepartmentName, setEditingDepartmentName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function loadDepartments() {
    setIsLoading(true);
    try {
      const payload = await apiRequest<DepartmentListResponse>("/departments/");
      setDepartments(extractDepartments(payload));
    } catch {
      setDepartments([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  async function handleCreateDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = departmentName.trim();

    if (!normalizedName) {
      setErrorMessage("Department name is required.");
      setSuccessMessage(null);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiRequest<Department>("/departments/", {
        method: "POST",
        body: JSON.stringify({
          name: normalizedName,
          is_active: true,
        }),
      });

      setDepartmentName("");
      setSuccessMessage("Department added successfully.");
      await loadDepartments();
    } catch (error: unknown) {
      setErrorMessage(extractApiError(error, "Unable to add department. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  function handleStartEdit(department: Department) {
    setEditingDepartmentId(department.id);
    setEditingDepartmentName(department.name);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function handleCancelEdit() {
    setEditingDepartmentId(null);
    setEditingDepartmentName("");
  }

  async function handleSaveEdit(departmentId: number) {
    const normalizedName = editingDepartmentName.trim();
    if (!normalizedName) {
      setErrorMessage("Department name is required.");
      return;
    }

    setIsUpdatingId(departmentId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiRequest<Department>(`/departments/${departmentId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          name: normalizedName,
        }),
      });

      setEditingDepartmentId(null);
      setEditingDepartmentName("");
      setSuccessMessage("Department updated successfully.");
      await loadDepartments();
    } catch (error: unknown) {
      setErrorMessage(extractApiError(error, "Unable to update department. Please try again."));
    } finally {
      setIsUpdatingId(null);
    }
  }

  async function handleDeleteDepartment(department: Department) {
    if (!window.confirm(`Delete "${department.name}"?`)) {
      return;
    }

    setIsDeletingId(department.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiRequest<unknown>(`/departments/${department.id}/`, {
        method: "DELETE",
      });

      if (editingDepartmentId === department.id) {
        setEditingDepartmentId(null);
        setEditingDepartmentName("");
      }

      setSuccessMessage("Department deleted successfully.");
      await loadDepartments();
    } catch (error: unknown) {
      setErrorMessage(extractApiError(error, "Unable to delete department. Please try again."));
    } finally {
      setIsDeletingId(null);
    }
  }

  const totalDepartments = departments.length;
  const activeDepartments = useMemo(() => departments.filter((department) => department.is_active).length, [departments]);

  return (
    <DashboardContentShell title="Departments" subtitle="Organize and manage church departments">
      <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-purple-950">Department Setup</h2>
            <p className="mt-1 text-sm font-medium text-purple-700">Create and manage your church departments directly.</p>
          </div>
          <span className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
            {activeDepartments}/{totalDepartments} Active
          </span>
        </div>

        <form className="mt-4 flex flex-col gap-2 md:flex-row" onSubmit={handleCreateDepartment}>
          <input
            value={departmentName}
            onChange={(event) => setDepartmentName(event.target.value)}
            required
            className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
            placeholder="Enter department name"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500 bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
            {isSaving ? "Adding..." : "Add Department"}
          </button>
        </form>

        {errorMessage ? <p className="mt-3 text-sm font-medium text-rose-600">{errorMessage}</p> : null}
        {successMessage ? <p className="mt-3 text-sm font-medium text-emerald-700">{successMessage}</p> : null}
      </section>

      <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-purple-950">Department Directory</h2>
        <p className="mt-1 text-sm font-medium text-purple-700">View all departments currently configured in your church.</p>

        <div className="mt-4 overflow-x-auto rounded-xl border border-purple-200">
          <table className="min-w-full divide-y divide-purple-200">
            <thead className="bg-purple-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 bg-white text-sm text-purple-900">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-5 text-center text-sm font-medium text-purple-600">
                    Loading departments...
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-5 text-center text-sm font-medium text-purple-600">
                    No departments yet. Add your first department above.
                  </td>
                </tr>
              ) : (
                departments.map((department) => (
                  <tr key={department.id} className="hover:bg-purple-50/60">
                    <td className="px-3 py-2.5 font-medium text-purple-950">
                      {editingDepartmentId === department.id ? (
                        <input
                          value={editingDepartmentName}
                          onChange={(event) => setEditingDepartmentName(event.target.value)}
                          className="w-full rounded-lg border border-purple-300 bg-white px-2.5 py-1.5 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                          placeholder="Department name"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-purple-600" />
                          {department.name}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          department.is_active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {department.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-purple-700">{new Date(department.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {editingDepartmentId === department.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(department.id)}
                              disabled={isUpdatingId === department.id}
                              className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdatingId === department.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                            >
                              <X size={12} />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(department)}
                              className="inline-flex items-center gap-1 rounded-md border border-purple-300 bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                            >
                              <Pencil size={12} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDepartment(department)}
                              disabled={isDeletingId === department.id}
                              className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isDeletingId === department.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardContentShell>
  );
}
