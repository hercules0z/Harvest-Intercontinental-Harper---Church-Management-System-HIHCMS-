"use client";

import { DashboardContentShell } from "@/components/dashboard/content-shell";
import { apiRequest } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const payrollSections = [
  {
    id: "staff-management",
    title: "Staff management",
    description: "Maintain staff records, role assignments, and employment status.",
  },
  {
    id: "salary-configuration",
    title: "Salary configuration",
    description: "Define salary structures, pay frequency, and compensation bands.",
  },
  {
    id: "deductions-allowances",
    title: "Deductions & allowances",
    description: "Manage statutory deductions and ministry-specific allowances.",
  },
  {
    id: "payslip-generation",
    title: "Payslip generation",
    description: "Generate downloadable payslips for each payroll cycle.",
  },
];

const payrollCycleFlow = ["Salary Setup", "Monthly Processing", "Payslip Generated", "Accounting Updated"];

type PayrollRecord = {
  id: number;
  staff_name: string;
  role_title: string;
  gross_amount: string;
  deductions: string;
  allowances: string;
  net_amount: string;
  currency: "USD" | "LRD";
  paid_at: string;
  notes: string;
};

type PayrollListResponse =
  | PayrollRecord[]
  | {
      results: PayrollRecord[];
    };

type PayrollFormState = {
  staff_name: string;
  role_title: string;
  gross_amount: string;
  deductions: string;
  allowances: string;
  currency: "USD" | "LRD";
  paid_at: string;
  notes: string;
};

const initialPayrollFormState: PayrollFormState = {
  staff_name: "",
  role_title: "",
  gross_amount: "",
  deductions: "0",
  allowances: "0",
  currency: "USD",
  paid_at: new Date().toISOString().slice(0, 10),
  notes: "",
};

function extractPayroll(payload: PayrollListResponse): PayrollRecord[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.results ?? [];
}

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState<number | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [recordSuccess, setRecordSuccess] = useState<string | null>(null);
  const [formState, setFormState] = useState<PayrollFormState>(initialPayrollFormState);
  const [staffSearch, setStaffSearch] = useState("");
  const [paidDateFrom, setPaidDateFrom] = useState("");
  const [paidDateTo, setPaidDateTo] = useState("");

  const visibleRecords = useMemo(() => {
    const normalizedSearch = staffSearch.trim().toLowerCase();

    return records
      .filter((record) => {
        if (normalizedSearch) {
          const haystack = `${record.staff_name} ${record.role_title}`.toLowerCase();
          if (!haystack.includes(normalizedSearch)) {
            return false;
          }
        }

        const recordDate = record.paid_at?.slice(0, 10) || "";
        if (paidDateFrom && recordDate < paidDateFrom) {
          return false;
        }
        if (paidDateTo && recordDate > paidDateTo) {
          return false;
        }

        return true;
      })
      .slice(0, 8);
  }, [records, staffSearch, paidDateFrom, paidDateTo]);
  const netPreview = useMemo(() => {
    const gross = Number(formState.gross_amount || "0");
    const deductions = Number(formState.deductions || "0");
    const allowances = Number(formState.allowances || "0");
    const net = gross - deductions + allowances;
    return Number.isFinite(net) ? net : 0;
  }, [formState.gross_amount, formState.deductions, formState.allowances]);

  async function loadRecords() {
    setIsLoadingRecords(true);
    try {
      const payload = await apiRequest<PayrollListResponse>("/payroll-records/");
      setRecords(extractPayroll(payload));
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
      ...initialPayrollFormState,
      paid_at: new Date().toISOString().slice(0, 10),
    });
  }

  function handleStartEditRecord(record: PayrollRecord) {
    setEditingRecordId(record.id);
    setFormState({
      staff_name: record.staff_name || "",
      role_title: record.role_title || "",
      gross_amount: record.gross_amount || "",
      deductions: record.deductions || "0",
      allowances: record.allowances || "0",
      currency: record.currency,
      paid_at: record.paid_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      notes: record.notes || "",
    });
    setRecordError(null);
    setRecordSuccess(null);
    document.getElementById("staff-management")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDeleteRecord(recordId: number) {
    const shouldDelete = window.confirm("Delete this payroll record?");
    if (!shouldDelete) {
      return;
    }

    setRecordError(null);
    setRecordSuccess(null);
    setDeletingRecordId(recordId);

    try {
      await apiRequest(`/payroll-records/${recordId}/`, {
        method: "DELETE",
      });
      if (editingRecordId === recordId) {
        resetRecordForm();
      }
      setRecordSuccess("Payroll record deleted successfully.");
      await loadRecords();
    } catch {
      setRecordError("Unable to delete payroll record. Please try again.");
    } finally {
      setDeletingRecordId(null);
    }
  }

  async function handleSaveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecordError(null);
    setRecordSuccess(null);

    const gross = Number(formState.gross_amount);
    const deductions = Number(formState.deductions || "0");
    const allowances = Number(formState.allowances || "0");

    if (!formState.staff_name.trim()) {
      setRecordError("Staff name is required.");
      return;
    }
    if (!Number.isFinite(gross) || gross <= 0) {
      setRecordError("Gross amount must be greater than zero.");
      return;
    }
    if (!Number.isFinite(deductions) || !Number.isFinite(allowances)) {
      setRecordError("Deductions and allowances must be valid numbers.");
      return;
    }

    const net = gross - deductions + allowances;

    setIsSavingRecord(true);

    try {
      await apiRequest<PayrollRecord>(editingRecordId ? `/payroll-records/${editingRecordId}/` : "/payroll-records/", {
        method: editingRecordId ? "PATCH" : "POST",
        body: JSON.stringify({
          staff_name: formState.staff_name.trim(),
          role_title: formState.role_title.trim(),
          gross_amount: gross.toFixed(2),
          deductions: deductions.toFixed(2),
          allowances: allowances.toFixed(2),
          net_amount: net.toFixed(2),
          currency: formState.currency,
          paid_at: formState.paid_at,
          notes: formState.notes.trim(),
        }),
      });

      setRecordSuccess(editingRecordId ? "Payroll record updated successfully." : "Payroll record saved successfully.");
      resetRecordForm();
      await loadRecords();
    } catch {
      setRecordError("Unable to save payroll record. Please try again.");
    } finally {
      setIsSavingRecord(false);
    }
  }

  return (
    <DashboardContentShell title="Payroll" subtitle="Manage staff payroll and compensation workflows">
      <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-purple-950">Payroll Cycle Workflow</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {payrollCycleFlow.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                {step}
              </span>
              {index < payrollCycleFlow.length - 1 ? <span className="text-purple-400">→</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        {payrollSections.map((section) => (
          <article key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-purple-950">{section.title}</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-purple-700">{section.description}</p>

            {section.id === "staff-management" ? (
              <>
                <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleSaveRecord}>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Staff name</span>
                    <input
                      value={formState.staff_name}
                      onChange={(event) => setFormState((current) => ({ ...current, staff_name: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                      placeholder="Enter staff name"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Role title</span>
                    <input
                      value={formState.role_title}
                      onChange={(event) => setFormState((current) => ({ ...current, role_title: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                      placeholder="e.g. Worship Leader"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Gross amount</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.gross_amount}
                      onChange={(event) => setFormState((current) => ({ ...current, gross_amount: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Deductions</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.deductions}
                      onChange={(event) => setFormState((current) => ({ ...current, deductions: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Allowances</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.allowances}
                      onChange={(event) => setFormState((current) => ({ ...current, allowances: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Currency</span>
                    <select
                      value={formState.currency}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          currency: event.target.value as "USD" | "LRD",
                        }))
                      }
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    >
                      <option value="USD">USD</option>
                      <option value="LRD">LRD</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Paid date</span>
                    <input
                      type="date"
                      value={formState.paid_at}
                      onChange={(event) => setFormState((current) => ({ ...current, paid_at: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    />
                  </label>

                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Notes</span>
                    <input
                      value={formState.notes}
                      onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                      placeholder="Optional payroll notes"
                    />
                  </label>

                  <div className="md:col-span-4 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-800">
                    Net preview: {netPreview.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {formState.currency}
                  </div>

                  <div className="md:col-span-4">
                    {recordError ? <p className="mb-2 text-sm font-medium text-rose-600">{recordError}</p> : null}
                    {recordSuccess ? <p className="mb-2 text-sm font-medium text-emerald-700">{recordSuccess}</p> : null}

                    <button
                      type="submit"
                      disabled={isSavingRecord}
                      className="inline-flex items-center gap-2 rounded-xl border border-purple-500 bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSavingRecord ? <Loader2 size={16} className="animate-spin" /> : null}
                      {isSavingRecord ? "Saving..." : editingRecordId ? "Update Payroll" : "Save Payroll"}
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
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Staff Search</span>
                      <input
                        value={staffSearch}
                        onChange={(event) => setStaffSearch(event.target.value)}
                        placeholder="Search staff or role"
                        className="w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 text-sm text-purple-900 outline-none ring-purple-300 focus:ring"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Paid From</span>
                      <input
                        type="date"
                        value={paidDateFrom}
                        onChange={(event) => setPaidDateFrom(event.target.value)}
                        className="w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 text-sm text-purple-900 outline-none ring-purple-300 focus:ring"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Paid To</span>
                      <input
                        type="date"
                        value={paidDateTo}
                        onChange={(event) => setPaidDateTo(event.target.value)}
                        className="w-full rounded-lg border border-purple-300 bg-white px-2 py-1.5 text-sm text-purple-900 outline-none ring-purple-300 focus:ring"
                      />
                    </label>
                  </div>

                  <table className="min-w-full divide-y divide-purple-200">
                    <thead className="bg-purple-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">
                        <th className="px-3 py-2">Staff</th>
                        <th className="px-3 py-2">Gross</th>
                        <th className="px-3 py-2">Net</th>
                        <th className="px-3 py-2">Paid date</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100 bg-white text-sm text-purple-900">
                      {isLoadingRecords ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm font-medium text-purple-600">
                            Loading payroll records...
                          </td>
                        </tr>
                      ) : visibleRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm font-medium text-purple-600">
                            No payroll records yet.
                          </td>
                        </tr>
                      ) : (
                        visibleRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-purple-950">{record.staff_name}</p>
                              <p className="text-xs text-purple-600">{record.role_title || "No role title"}</p>
                            </td>
                            <td className="px-3 py-2.5">
                              {Number(record.gross_amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })} {record.currency}
                            </td>
                            <td className="px-3 py-2.5">
                              {Number(record.net_amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })} {record.currency}
                            </td>
                            <td className="px-3 py-2.5">{new Date(record.paid_at).toLocaleDateString()}</td>
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
