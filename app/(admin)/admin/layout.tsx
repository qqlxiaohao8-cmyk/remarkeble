import { AdminShell } from "@/components/admin/admin-shell";
import { AdminGate } from "@/components/admin/gate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[480px] flex-1 flex-col overflow-hidden bg-paper">
      <AdminGate>
        <AdminShell>{children}</AdminShell>
      </AdminGate>
    </div>
  );
}
