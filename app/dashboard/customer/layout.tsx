import { requireDashboardRole } from "@/lib/dashboard-access"

export default async function CustomerDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireDashboardRole("customer")

  return children
}
