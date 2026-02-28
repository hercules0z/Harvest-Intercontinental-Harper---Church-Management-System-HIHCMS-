"use client";

import { DashboardContentShell } from "@/components/dashboard/content-shell";
import { apiRequest } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const attendanceSections = [
  {
    id: "service-attendance",
    title: "Service attendance",
    description: "Record weekly service participation and monitor attendance consistency.",
  },
  {
    id: "event-attendance",
    title: "Event attendance",
    description: "Track turnout for conferences, outreach, and special church events.",
  },
  {
    id: "children-checkin-out",
    title: "Children check-in/out",
    description: "Manage child check-in and check-out with secure guardian verification.",
  },
  {
    id: "attendance-analytics",
    title: "Attendance analytics",
    description: "Analyze attendance trends and generate actionable ministry insights.",
  },
];

const weeklyServiceFlow = [
  "Service Created",
  "Attendance Recorded",
  "Contributions Logged",
  "Reports Generated",
  "Follow-up Initiated",
];

type AttendanceRecord = {
  id: number;
  attendance_type: "service" | "event" | "children";
  attended_at: string;
  present: boolean;
  notes: string;
};

type AttendanceListResponse =
  | AttendanceRecord[]
  | {
      results: AttendanceRecord[];
    };

type AttendanceFormState = {
  attendance_type: "service" | "event" | "children";
  attended_at: string;
  present: boolean;
  notes: string;
};

const initialAttendanceFormState: AttendanceFormState = {
  attendance_type: "service",
  attended_at: new Date().toISOString().slice(0, 16),
  present: true,
  notes: "",
};

function extractAttendance(payload: AttendanceListResponse): AttendanceRecord[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.results ?? [];
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recordSuccess, setRecordSuccess] = useState<string | null>(null);
  const [formState, setFormState] = useState<AttendanceFormState>(initialAttendanceFormState);
  const [attendanceTypeFilter, setAttendanceTypeFilter] = useState<"all" | "service" | "event" | "children">("all");
  const [attendanceDateFilter, setAttendanceDateFilter] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");

  const visibleRecords = useMemo(() => {
    const normalizedSearch = attendanceSearch.trim().toLowerCase();

    return records
      .filter((record) => {
        if (attendanceTypeFilter !== "all" && record.attendance_type !== attendanceTypeFilter) {
          return False;
        }

        if (attendanceDateFilter) {
          const recordDate = new Date(record.attended_at).toISOString().slice(0, 10);
          if (recordDate !== attendanceDateFilter) {
            return false;
          }
        }

        if (normalizedSearch) {
          const haystack = `${record.attendance_type} ${record.notes} ${record.present ? "present" : "absent"}`.toLowerCase();
          if (!haystack.includes(normalizedSearch)) {
            return false;
          }
        }

        return true;
      })
      .slice(0, 8);
  }, [records, attendanceTypeFilter, attendanceDateFilter, attendanceSearch]);

  async function loadRecords() {
    setIsLoadingRecords(true);
    try {
      const payload = await apiRequest<AttendanceListResponse>("/attendance-records/");
      setRecords(extractAttendance(payload));
    } catch {
      setRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function resetRecordForm() {
    setEditingRecordId(null);
    setFormState({
      ...initialAttendanceFormState,
      attended_at: new Date().toISOString().slice(0, 16),
    });
  }

  function handleStartEditRecord(record: AttendanceRecord) {
    setEditingRecordId(record.id);
    setFormState({
      attendance_type: record.attendance_type,
      attended_at: new Date(record.attended_at).toISOString().slice(0, 16),
      present: record.present,
      notes: record.notes || "",
    });
    setRecordError(null);
    setRecordSuccess(null);
    document.getElementById("service-attendance")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDeleteRecord(recordId: number) {
    const shouldDelete = window.confirm("Delete this attendance record?");
    if (!shouldDelete) {
      return;
    }

    setRecordError(null);
    setRecordSuccess(null);
    setDeletingRecordId(recordId);

    try {
      await apiRequest(`/attendance-records/${recordId}/`, {
        method: "DELETE",
      });
      if (editingRecordId === recordId) {
        resetRecordForm();
      }
      setRecordSuccess("Attendance record deleted successfully.");
      await loadRecords();
    } catch {
      setRecordError("Unable to delete attendance record. Please try again.");
    } finally {
      setDeletingRecordId(null);
    }
  }

  async function handleSaveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecordError(null);
    setRecordSuccess(null);

    if (!formState.attended_at) {
      setRecordError("Attendance date and time is required.");
      return;
    }

    setIsSavingRecord(true);

    try {
      await apiRequest<AttendanceRecord>(editingRecordId ? `/attendance-records/${editingRecordId}/` : "/attendance-records/", {
        method: editingRecordId ? "PATCH" : "POST",
        body: JSON.stringify({
          attendance_type: formState.attendance_type,
          attended_at: new Date(formState.attended_at).toISOString(),
          present: formState.present,
          notes: formState.notes,
        }),
      });

      setRecordSuccess(editingRecordId ? "Attendance record updated successfully." : "Attendance record saved successfully.");
      resetRecordForm();
      await loadRecords();
    } catch {
      setRecordError("Unable to save attendance record. Please try again.");
    } finally {
      setIsSavingRecord(false);
    }
  }

  return (
    <DashboardContentShell title="Attendance" subtitle="Capture and review attendance insights">
      <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-purple-950">Weekly Service Workflow</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {weeklyServiceFlow.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                {step}
              </span>
              {index < weeklyServiceFlow.length - 1 ? <span className="text-purple-400">→</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        {attendanceSections.map((section) => (
          <article key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-purple-950">{section.title}</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-purple-700">{section.description}</p>

            {section.id === "service-attendance" ? (
              <>
                <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleSaveRecord}>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Type</span>
                    <select
                      value={formState.attendance_type}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          attendance_type: event.target.value as "service" | "event" | "children",
                        }))
                      }
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    >
                      <option value="service">Service</option>
                      <option value="event">Event</option>
                      <option value="children">Children Check-in</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Date & time</span>
                    <input
                      type="datetime-local"
                      value={formState.attended_at}
                      onChange={(event) => setFormState((current) => ({ ...current, attended_at: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Status</span>
                    <select
                      value={formState.present ? "present" : "absent"}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          present: event.target.value === "present",
                        }))
                      }
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Notes</span>
                    <input
                      value={formState.notes}
                      onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                      placeholder="Optional notes"
                    />
                  </label>

                  <div className="md:col-span-4">
                    {recordError ? <p className="mb-2 text-sm font-medium text-rose-600">{recordError}</p> : null}
                    {recordSuccess ? <p className="mb-2 text-sm font-medium text-emerald-700">{recordSuccess}</p> : null}

                    <button
                      type="submit"
                      disabled={isSavingRecord}
                      className="inline-flex items-center gap-2 rounded-xl border border-purple-500 bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSavingRecord ? <Loader2 size={16} className="animate-spin" /> : null}
                      {isSavingRecord ? "Saving..." : editingRecordId ? "Update Attendance" : "Save Attendance"}
                    </button>

                    {editingRecordId ? (
                      <button
                        type="button"
                        onClick={resetRecordForm}
                        className="ml-2 inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                      >
                        Cancel Edit
                      </button>
                    ) : null}
                  </div>
                </form>

                <div className="mt-4 overflow-hidden rounded-xl border border-purple-200">
                  <div className="grid gap-3 border-b border-purple-200 bg-purple-50/70 p-3 md:grid-cols-3">
                    <label className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Type</span>
                      <select
                        value={attendanceTypeFilter}
                        onChange={(event) =>
                          setAttendanceTypeFilter(event.target.value as "all" | "service" | "event" | "children")
                        }
                        className="w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 text-sm text-purple-900 outline-none ring-purple-300 focus:ring"
                      >
                        <option value="all">All</option>
                        <option value="service">Service</option>
                        <option value="event">Event</option>
                        <option value="children">Children Check-in</option>
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Date</span>
                      <input
                        type="date"
                        value={attendanceDateFilter}
                        onChange={(event) => setAttendanceDateFilter(event.target.value)}
                        className="w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 text-sm text-purple-900 outline-none ring-purple-300 focus:ring"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Search</span>
                      <input
                        value={attendanceSearch}
                        onChange={(event) => setAttendanceSearch(event.target.value)}
                        placeholder="Search notes or status"
                        className="w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 text-sm text-purple-900 outline-none ring-purple-300 focus:ring"
                      />
                    </label>
                  </div>

                  <table className="min-w-full divide-y divide-purple-200">
                    <thead className="bg-purple-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Notes</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100 bg-white text-sm text-purple-900">
                      {isLoadingRecords ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm font-medium text-purple-600">
                            Loading attendance records...
                          </td>
                        </tr>
                      ) : visibleRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm font-medium text-purple-600">
                            No attendance records yet.
                          </td>
                        </tr>
                      ) : (
                        visibleRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="px-3 py-2.5 font-medium text-purple-950">{record.attendance_type}</td>
                            <td className="px-3 py-2.5">{record.present ? "Present" : "Absent"}</td>
                            <td className="px-3 py-2.5">{new Date(record.attended_at).toLocaleString()}</td>
                            <td className="px-3 py-2.5">{record.notes || "—"}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditRecord(record)}
                                  className="rounded-md border border-purple-300 bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(record.id)}
                                  disabled={deletingRecordId === record.id}
                                  className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {deletingRecordId === record.id ? <Loader2 size={12} className="animate-spin" /> : null}
                                  {deletingRecordId === record.id ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </article>
        ))}
      </section>
    </DashboardContentShell>
  );
}
