import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "Temaer" };

export default async function TopicsPage() {
  await requirePermission("taxonomy:manage");
  return (
    <ModuleStub
      title="Temaer"
      description="Bygges – kommer snart"
      phase="fase-4"
    />
  );
}
