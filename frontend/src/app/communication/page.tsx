import { DashboardContentShell } from "@/components/dashboard/content-shell";

const communicationSections = [
  {
    id: "bulk-sms",
    title: "Bulk SMS",
    description: "Send bulk text notifications to selected member groups.",
  },
  {
    id: "bulk-email",
    title: "Bulk Email",
    description: "Manage church-wide email campaigns and announcements.",
  },
  {
    id: "group-messaging",
    title: "Group messaging",
    description: "Coordinate communication with departments, ministries, and teams.",
  },
  {
    id: "automated-notifications",
    title: "Automated notifications",
    description: "Configure scheduled and event-triggered communication workflows.",
  },
];

export default function CommunicationPage() {
  return (
    <DashboardContentShell title="Communication" subtitle="Manage member messaging and notifications">
      <section className="grid gap-4">
        {communicationSections.map((section) => (
          <article key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-purple-950">{section.title}</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-purple-700">{section.description}</p>
          </article>
        ))}
      </section>
    </DashboardContentShell>
  );
}
