import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "Sider" };

export default async function PagesPage() {
  await requirePermission("pages:view");
  return (
    <ModuleStub
      title="Sider"
      description="Bygges – kommer snart"
      phase="fase-4"
    />
  );
}
