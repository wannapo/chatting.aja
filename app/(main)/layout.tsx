import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SidebarServer from "@/components/layout/SidebarServer";
import FcmTokenListener from "@/components/layout/FcmTokenListener";
import MobileShell from "@/components/layout/MobileShell";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  return (
    <MobileShell sidebar={<SidebarServer profile={profile} />} nodeId={profile?.unique_tag}>
      <FcmTokenListener userId={user.id} />
      {children}
    </MobileShell>
  );
}