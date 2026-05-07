import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  await requirePermission("leads:view");
  return (
    <ModuleStub
      title="Leads"
      description="Bygges – kommer snart"
      phase="fase-5"
    />
  );
}
