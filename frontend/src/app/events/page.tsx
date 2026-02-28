import { DashboardContentShell } from "@/components/dashboard/content-shell";

const eventSections = [
  {
    id: "event-creation",
    title: "Event creation",
    description: "Set up event details, schedules, teams, and ministry owners.",
  },
  {
    id: "registration",
    title: "Registration",
    description: "Track registrants and participation details for each event.",
  },
  {
    id: "capacity-management",
    title: "Capacity management",
    description: "Monitor attendee limits and prevent overbooking.",
  },
  {
    id: "payment-integration",
    title: "Payment integration",
    description: "Manage paid events and payment status reconciliation.",
  },
  {
    id: "attendance-tracking",
    title: "Attendance tracking",
    description: "Capture final attendance outcomes for post-event reporting.",
  },
];

export default function EventsPage() {
  return (
    <DashboardContentShell title="Events" subtitle="Plan, schedule, and track church events">
      <section className="grid gap-4">
        {eventSections.map((section) => (
          <article key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-purple-950">{section.title}</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-purple-700">{section.description}</p>
          </article>
        ))}
      </section>
    </DashboardContentShell>
  );
}
