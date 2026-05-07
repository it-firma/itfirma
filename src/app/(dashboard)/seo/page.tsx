import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "SEO-oversikt" };

export default async function SeoPage() {
  await requirePermission("seo:view");
  return (
    <ModuleStub
      title="SEO-oversikt"
      description="Bygges – kommer snart"
      phase="fase-5"
    />
  );
}
