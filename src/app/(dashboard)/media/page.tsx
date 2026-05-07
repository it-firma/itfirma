import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "Media" };

export default async function MediaPage() {
  await requirePermission("media:view");
  return (
    <ModuleStub
      title="Media"
      description="Bygges – kommer snart"
      phase="fase-4"
    />
  );
}
