import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "Kategorier" };

export default async function CategoriesPage() {
  await requirePermission("taxonomy:manage");
  return (
    <ModuleStub
      title="Kategorier"
      description="Bygges – kommer snart"
      phase="fase-4"
    />
  );
}
