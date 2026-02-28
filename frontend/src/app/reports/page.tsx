import { DashboardContentShell } from "@/components/dashboard/content-shell";
import { PlaceholderCard } from "@/components/dashboard/placeholder-card";

export default function ReportsPage() {
  return (
    <DashboardContentShell title="Reports" subtitle="Generate and export church performance reports">
      <PlaceholderCard
        heading="Reports"
        description="This section will contain summary dashboards, downloadable exports, and scheduled reporting."
      />
    </DashboardContentShell>
  );
}
