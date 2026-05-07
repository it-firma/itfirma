import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "Artikler" };

export default async function ArticlesPage() {
  await requirePermission("articles:view");
  return (
    <ModuleStub
      title="Artikler"
      description="Bygges – kommer snart"
      phase="fase-3"
    />
  );
}
