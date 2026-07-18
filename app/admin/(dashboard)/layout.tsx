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
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="text-brown-900">Dashboard</Link>
          <Link href="/admin/projects" className="text-brown-600">Projects</Link>
        </nav>
        <button onClick={handleLogout} className="text-sm text-brown-600 underline">
          Log out
        </button>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
