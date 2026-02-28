import { DashboardContentShell } from "@/components/dashboard/content-shell";
import { PlaceholderCard } from "@/components/dashboard/placeholder-card";

export default function SettingsPage() {
  return (
    <DashboardContentShell title="Settings" subtitle="Configure system and organization preferences">
      <PlaceholderCard
        heading="Settings"
        description="This section will contain role access, profile settings, notification preferences, and app configuration."
      />
    </DashboardContentShell>
  );
}
