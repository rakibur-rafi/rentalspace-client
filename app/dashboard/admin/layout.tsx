import { requireDashboardRole } from "@/lib/dashboard-access"

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireDashboardRole("admin")

  return children
}
