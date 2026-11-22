import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { Sidebar } from "@/components/layout/Sidebar"
import { DashboardTopbar } from "@/components/layout/DashboardTopbar"
import { auth } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/30 md:flex-row">
      <Sidebar role={session.user.role} />
      <div className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
        <DashboardTopbar name={session.user.name} role={session.user.role} />
        {children}
      </div>
    </div>
  )
}
