import { requireDashboardRole } from "@/lib/dashboard-access"

export default async function OwnerDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireDashboardRole("owner")

  return children
}
