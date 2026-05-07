import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "Domeneprisser" };

export default async function PricingPage() {
  await requirePermission("pricing:view");
  return (
    <ModuleStub
      title="Domeneprisser"
      description="Bygges – kommer snart"
      phase="fase-5"
    />
  );
}
