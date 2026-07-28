import { requireRole } from "@/lib/session";
import { Header } from "@/components/layout/Header";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["ADMIN"]);

  return (
    <div className="flex h-screen flex-col">
      <Header userId={user.id} />
      <AdminNav />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
