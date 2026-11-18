import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Log in | RentalSpace",
  description: "Log in to your RentalSpace account.",
}

export default async function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    redirect("/")
  }

  return children
}
