import { requireRole } from "@/lib/session";
import { DoctorHeader } from "@/components/layout/DoctorHeader";

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["DOCTOR"]);

  return (
    <div className="flex h-screen flex-col">
      <DoctorHeader doctorName={user.name ?? null} />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
