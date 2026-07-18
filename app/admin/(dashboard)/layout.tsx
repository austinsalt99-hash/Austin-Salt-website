"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div>
      <header className="flex items-center justify-between border-b border-beige px-6 py-4">
        <Link href="/admin" className="text-sm font-semibold text-brown-900">
          Dashboard
        </Link>
        <button onClick={handleLogout} className="text-sm text-brown-600 underline">
          Log out
        </button>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
