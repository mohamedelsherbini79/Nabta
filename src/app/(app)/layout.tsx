import { requireUser } from "@/lib/session";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNavProvider } from "@/components/layout/MobileNavProvider";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <MobileNavProvider>
      <div className="flex h-screen flex-col">
        <Header userId={user.id} />
        <div className="flex flex-1 overflow-hidden">
          <MobileNavDrawer>
            <Sidebar userId={user.id} />
          </MobileNavDrawer>
          <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
