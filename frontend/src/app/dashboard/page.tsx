"use client";

import { Building2, CalendarDays, HandCoins, Users, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardContentShell } from "@/components/dashboard/content-shell";
import { apiRequest } from "@/lib/api-client";

type DashboardSummary = {
  total_members: number;
  total_tithes_this_month: string;
  active_departments: number;
  upcoming_events: number;
  female_members: number;
  male_members: number;
  female_percentage: number;
  male_percentage: number;
};

const defaultSummary: DashboardSummary = {
  total_members: 0,
  total_tithes_this_month: "0.00",
  active_departments: 0,
  upcoming_events: 0,
  female_members: 0,
  male_members: 0,
  female_percentage: 0,
  male_percentage: 0,
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        const payload = await apiRequest<DashboardSummary>("/dashboard/summary/");
        if (isMounted) {
          setSummary(payload);
        }
      } catch {
        if (isMounted) {
          setSummary(defaultSummary);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      { title: "Total Members", value: summary.total_members.toLocaleString(), icon: Users, highlight: false },
      {
        title: "Total Tithes (This Month)",
        value: Number(summary.total_tithes_this_month).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        icon: HandCoins,
        highlight: false,
      },
      {
        title: "Active Departments",
        value: summary.active_departments.toLocaleString(),
        icon: Building2,
        highlight: true,
      },
      { title: "Upcoming Events", value: summary.upcoming_events.toLocaleString(), icon: CalendarDays, highlight: false },
    ],
    [summary],
  );

  return (
    <DashboardContentShell title="Executive Dashboard" subtitle="Overview of Church Operations">
      {isLoading ? (
        <p className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
          Loading dashboard metrics...
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const CardIcon = card.icon as LucideIcon;

          return (
            <article
              key={card.title}
              className={`rounded-2xl border bg-white p-4 shadow-sm ${
                card.highlight ? "border-purple-500" : "border-purple-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold leading-tight tracking-tight text-purple-900">{card.title}</h3>
                <span className="grid h-8 w-8 place-items-center rounded-md border border-purple-300 bg-purple-50 text-purple-700">
                  <CardIcon size={16} strokeWidth={2.2} />
                </span>
              </div>
              <p
                className={`mt-2 text-4xl font-semibold leading-none ${
                  card.title.includes("Tithes") ? "text-purple-600" : "text-purple-950"
                }`}
              >
                <span className="text-3xl">{card.value}</span>
              </p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-[1.5rem] border border-purple-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold tracking-tight text-purple-900">Membership Growth</h2>
          <div className="mt-4 h-72 rounded-2xl bg-purple-50 p-4">
            <div className="relative h-full w-full overflow-hidden rounded-xl border border-purple-100 bg-white">
              <div className="absolute left-0 right-0 top-1/4 border-t border-purple-100" />
              <div className="absolute left-0 right-0 top-2/4 border-t border-purple-100" />
              <div className="absolute left-0 right-0 top-3/4 border-t border-purple-100" />
              <svg viewBox="0 0 600 280" className="absolute inset-0 h-full w-full">
                <path
                  d="M0,220 C60,180 100,210 150,170 C200,120 250,200 310,140 C360,95 410,170 470,120 C520,80 560,70 600,60"
                  fill="none"
                  className="text-purple-500"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  d="M0,245 C70,230 120,245 170,235 C230,220 280,245 340,220 C390,205 450,230 500,190 C540,150 570,135 600,120 L600,280 L0,280 Z"
                  className="text-purple-200"
                  fill="currentColor"
                  opacity="0.8"
                />
              </svg>
              <div className="absolute left-[58%] top-[30%] rounded-md bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
                230
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-purple-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold tracking-tight text-purple-900">Gender Distribution</h2>
          <div className="mt-6 flex h-72 items-center justify-center gap-8">
            <div className="relative grid h-52 w-52 place-items-center rounded-full border-[28px] border-purple-300 border-l-purple-200 border-b-purple-200">
              <span className="text-3xl font-semibold text-purple-700">{summary.female_percentage}%</span>
            </div>
            <div className="space-y-2 text-sm font-medium leading-tight text-purple-800">
              <p>
                <span className="mr-2 inline-block h-3.5 w-3.5 rounded-sm bg-purple-300" />
                Female ({summary.female_members.toLocaleString()})
              </p>
              <p className="text-purple-600">{summary.female_percentage}%</p>
              <p>
                <span className="mr-2 inline-block h-4 w-4 rounded-sm bg-purple-200" />
                Male ({summary.male_members.toLocaleString()})
              </p>
              <p className="text-purple-400">{summary.male_percentage}%</p>
            </div>
          </div>
        </section>
      </div>

    </DashboardContentShell>
  );
}
