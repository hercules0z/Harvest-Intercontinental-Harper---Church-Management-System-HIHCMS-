import { DashboardContentShell } from "@/components/dashboard/content-shell";

const facilitiesSections = [
  {
    id: "room-booking",
    title: "Room booking",
    description: "Reserve church rooms and halls for ministry activities and programs.",
  },
  {
    id: "equipment-booking",
    title: "Equipment booking",
    description: "Schedule and track equipment usage for services and events.",
  },
  {
    id: "calendar-management",
    title: "Calendar management",
    description: "Coordinate facility availability with a central booking calendar.",
  },
];

export default function FacilitiesPage() {
  return (
    <DashboardContentShell title="Facilities" subtitle="Manage rooms, equipment, and bookings">
      <section className="grid gap-4">
        {facilitiesSections.map((section) => (
          <article key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-purple-950">{section.title}</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-purple-700">{section.description}</p>
          </article>
        ))}
      </section>
    </DashboardContentShell>
  );
}
