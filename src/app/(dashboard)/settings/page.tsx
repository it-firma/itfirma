import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "Innstillinger" };

export default async function SettingsPage() {
  await requirePermission("settings:view");
  return (
    <ModuleStub
      title="Innstillinger"
      description="Bygges – kommer snart"
      phase="fase-5"
    />
  );
}
