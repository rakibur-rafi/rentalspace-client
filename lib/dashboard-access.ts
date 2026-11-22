import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

const dashboardHome: Record<string, string> = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin/users",
}

export async function requireDashboardRole(expectedRole: string) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/login")
  }

  const actualRole = session.user.role?.toLowerCase()

  if (actualRole !== expectedRole) {
    redirect(dashboardHome[actualRole] ?? "/dashboard/profile")
  }
}
