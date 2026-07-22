import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminNotificationsProvider } from "@/components/layout/AdminNotificationsProvider";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { getAdminSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <AdminNotificationsProvider>
      <div className="min-h-screen bg-brand-cream">
        <div className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
          <AdminSidebar />
        </div>

        <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
          <AdminHeader admin={session.profile} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminNotificationsProvider>
  );
}
