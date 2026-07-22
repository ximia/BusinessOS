import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminChrome } from "@/components/admin/admin-chrome";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard: when Supabase is configured, require an authenticated session.
  // In demo mode the dashboard is open so the template can be explored.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminChrome>{children}</AdminChrome>
      </div>
    </div>
  );
}
