"use client";

import { DashboardContentShell } from "@/components/dashboard/content-shell";
import { apiRequest } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const contributionSections = [
  {
    id: "tithes-offerings",
    title: "Tithes & offerings",
    description: "Capture and reconcile tithes and offerings across church services.",
  },
  {
    id: "fund-categorization",
    title: "Fund categorization",
    description: "Classify giving into designated funds for accurate allocation.",
  },
  {
    id: "recurring-donations",
    title: "Recurring donations",
    description: "Configure and monitor recurring donor commitments.",
  },
  {
    id: "online-giving",
    title: "Online giving",
    description: "Track digital giving channels and transaction history.",
  },
  {
    id: "contribution-statements",
    title: "Contribution statements",
    description: "Prepare member-facing contribution statements for review and sharing.",
  },
  {
    id: "financial-reports",
    title: "Financial reports",
    description: "Generate summaries and reports for leaders and finance oversight.",
  },
];

const contributionFlow = ["Member Donation", "Fund Allocation", "Receipt Generated", "Financial Report Update"];

type Contribution = {
  id: number;
  contribution_type: "tithe" | "offering";
  amount: string;
  currency: string;
  contributed_at: string;
};

type ContributionListResponse =
  | Contribution[]
  | {
      results: Contribution[];
    };

type ContributionFormState = {
  contribution_type: "tithe" | "offering";
  amount: string;
  currency: "USD" | "LRD";
  contributed_at: string;
};

const initialContributionFormState: ContributionFormState = {
  contribution_type: "tithe",
  amount: "",
  currency: "USD",
  contributed_at: new Date().toISOString().slice(0, 16),
};

function extractContributions(payload: ContributionListResponse): Contribution[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.results ?? [];
}

export default function FinanceTithesPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoadingContributions, setIsLoadingContributions] = useState(true);
  const [isSavingContribution, setIsSavingContribution] = useState(false);
  const [deletingContributionId, setDeletingContributionId] = useState<number | null>(null);
  const [editingContributionId, setEditingContributionId] = useState<number | null>(null);
  const [contributionError, setContributionError] = useState<string | null>(null);
  const [contributionSuccess, setContributionSuccess] = useState<string | null>(null);
  const [formState, setFormState] = useState<ContributionFormState>(initialContributionFormState);

  const recentContributions = useMemo(() => contributions.slice(0, 6), [contributions]);

  async function loadContributions() {
    setIsLoadingContributions(true);
    try {
      const payload = await apiRequest<ContributionListResponse>("/contributions/");
      setContributions(extractContributions(payload));
    } catch {
      setContributions([]);
    } finally {
      setIsLoadingContributions(false);
    }
  }

  useEffect(() => {
    loadContributions();
  }, []);

  function resetContributionForm() {
    setEditingContributionId(null);
    setFormState({
      ...initialContributionFormState,
      contributed_at: new Date().toISOString().slice(0, 16),
    });
  }

  function handleStartEditContribution(contribution: Contribution) {
    setEditingContributionId(contribution.id);
    setFormState({
      contribution_type: contribution.contribution_type,
      amount: contribution.amount,
      currency: (contribution.currency?.toUpperCase() === "LRD" ? "LRD" : "USD") as "USD" | "LRD",
      contributed_at: new Date(contribution.contributed_at).toISOString().slice(0, 16),
    });
    setContributionError(null);
    setContributionSuccess(null);
    document.getElementById("tithes-offerings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDeleteContribution(contributionId: number) {
    const shouldDelete = window.confirm("Delete this contribution record?");
    if (!shouldDelete) {
      return;
    }

    setContributionError(null);
    setContributionSuccess(null);
    setDeletingContributionId(contributionId);

    try {
      await apiRequest(`/contributions/${contributionId}/`, {
        method: "DELETE",
      });
      if (editingContributionId === contributionId) {
        resetContributionForm();
      }
      setContributionSuccess("Contribution deleted successfully.");
      await loadContributions();
    } catch {
      setContributionError("Unable to delete contribution. Please try again.");
    } finally {
      setDeletingContributionId(null);
    }
  }

  async function handleCreateContribution(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContributionError(null);
    setContributionSuccess(null);

    const normalizedAmount = Number(formState.amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      setContributionError("Enter a valid amount greater than zero.");
      return;
    }

    setIsSavingContribution(true);

    try {
      await apiRequest<Contribution>(editingContributionId ? `/contributions/${editingContributionId}/` : "/contributions/", {
        method: editingContributionId ? "PATCH" : "POST",
        body: JSON.stringify({
          contribution_type: formState.contribution_type,
          amount: normalizedAmount.toFixed(2),
          currency: formState.currency,
          contributed_at: new Date(formState.contributed_at).toISOString(),
        }),
      });

      setContributionSuccess(editingContributionId ? "Contribution updated successfully." : "Contribution saved successfully.");
      resetContributionForm();
      await loadContributions();
    } catch (error: unknown) {
      const fallback = "Unable to save contribution. Please try again.";
      if (error && typeof error === "object") {
        const errorMap = error as Record<string, unknown>;
        const detail = errorMap.detail;
        if (typeof detail === "string" && detail.trim()) {
          setContributionError(detail);
        } else {
          const firstKey = Object.keys(errorMap)[0];
          const firstValue = firstKey ? errorMap[firstKey] : null;
          if (Array.isArray(firstValue) && firstValue[0] && typeof firstValue[0] === "string") {
            setContributionError(firstValue[0]);
          } else {
            setContributionError(fallback);
          }
        }
      } else {
        setContributionError(fallback);
      }
    } finally {
      setIsSavingContribution(false);
    }
  }

  return (
    <DashboardContentShell title="Finance & Tithes" subtitle="Track contributions and financial summaries">
      <section className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-purple-950">Contribution Flow</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {contributionFlow.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-purple-300 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                {step}
              </span>
              {index < contributionFlow.length - 1 ? <span className="text-purple-400">→</span> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        {contributionSections.map((section) => (
          <article key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-purple-950">{section.title}</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-purple-700">{section.description}</p>

            {section.id === "tithes-offerings" ? (
              <>
                <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleCreateContribution}>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Type</span>
                    <select
                      value={formState.contribution_type}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          contribution_type: event.target.value as "tithe" | "offering",
                        }))
                      }
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    >
                      <option value="tithe">Tithe</option>
                      <option value="offering">Offering</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Amount</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.amount}
                      onChange={(event) => setFormState((current) => ({ ...current, amount: event.target.value }))}
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                      placeholder="0.00"
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
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Date & time</span>
                    <input
                      type="datetime-local"
                      value={formState.contributed_at}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          contributed_at: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm text-purple-950 outline-none ring-purple-300 focus:ring"
                    />
                  </label>

                  <div className="md:col-span-4">
                    {contributionError ? <p className="mb-2 text-sm font-medium text-rose-600">{contributionError}</p> : null}
                    {contributionSuccess ? <p className="mb-2 text-sm font-medium text-emerald-700">{contributionSuccess}</p> : null}

                    <button
                      type="submit"
                      disabled={isSavingContribution}
                      className="inline-flex items-center gap-2 rounded-xl border border-purple-500 bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSavingContribution ? <Loader2 size={16} className="animate-spin" /> : null}
                      {isSavingContribution ? "Saving..." : editingContributionId ? "Update Contribution" : "Save Contribution"}
                    </button>

                    {editingContributionId ? (
                      <button
                        type="button"
                        onClick={resetContributionForm}
                        className="ml-2 inline-flex items-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                      >
                        Cancel Edit
                      </button>
                    ) : null}
                  </div>
                </form>

                <div className="mt-4 overflow-hidden rounded-xl border border-purple-200">
                  <table className="min-w-full divide-y divide-purple-200">
                    <thead className="bg-purple-50">
                      <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">Currency</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100 bg-white text-sm text-purple-900">
                      {isLoadingContributions ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm font-medium text-purple-600">
                            Loading contributions...
                          </td>
                        </tr>
                      ) : recentContributions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-sm font-medium text-purple-600">
                            No contributions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        recentContributions.map((contribution) => (
                          <tr key={contribution.id}>
                            <td className="px-3 py-2.5 font-medium text-purple-950">
                              {contribution.contribution_type === "tithe" ? "Tithe" : "Offering"}
                            </td>
                            <td className="px-3 py-2.5">
                              {Number(contribution.amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-3 py-2.5">{contribution.currency}</td>
                            <td className="px-3 py-2.5">{new Date(contribution.contributed_at).toLocaleString()}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditContribution(contribution)}
                                  className="rounded-md border border-purple-300 bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContribution(contribution.id)}
                                  disabled={deletingContributionId === contribution.id}
                                  className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {deletingContributionId === contribution.id ? <Loader2 size={12} className="animate-spin" /> : null}
                                  {deletingContributionId === contribution.id ? "Deleting..." : "Delete"}
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
