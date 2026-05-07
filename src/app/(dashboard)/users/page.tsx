import { requirePermission } from "@/lib/auth";
import { ModuleStub } from "@/components/ui/module-stub";

export const metadata = { title: "Brukere" };

export default async function UsersPage() {
  await requirePermission("users:view");
  return (
    <ModuleStub
      title="Brukere"
      description="Bygges – kommer snart"
      phase="fase-5"
    />
  );
}
