import Link from "next/link";

export default function AdminHome() {
  return (
    <main className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold text-brown-900">Admin</h1>
      <Link href="/admin/projects" className="text-accent underline">
        Manage Projects
      </Link>
    </main>
  );
}
