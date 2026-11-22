"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  ChartNoAxesColumn,
  CircleDollarSign,
  ClipboardList,
  Package,
  PackageCheck,
  Plus,
} from "lucide-react"

import { getOwnerAnalytics, type OwnerAnalytics } from "@/lib/api/analytics"
import { authClient } from "@/lib/auth-client"

const ownerActions = [
  {
    href: "/dashboard/owner/add-equipment",
    title: "Add equipment",
    description: "List gear and make it available to customers.",
    icon: Plus,
  },
  {
    href: "/dashboard/owner/equipment",
    title: "Manage equipment",
    description: "Review your listings and their approval status.",
    icon: Package,
  },
  {
    href: "/dashboard/owner/rentals",
    title: "Review rentals",
    description: "Check bookings and update delivery progress.",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/owner/analytics",
    title: "View analytics",
    description: "Explore sales and rental performance over time.",
    icon: ChartNoAxesColumn,
  },
]

function OwnerStat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string | number
  detail: string
  icon: typeof Package
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

export default function OwnerDashboardHome() {
  const { data: session } = authClient.useSession()
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const firstName = session?.user.name?.trim().split(/\s+/)[0]

  useEffect(() => {
    if (!session) return
    let active = true

    async function load() {
      setLoading(true)
      setError("")
      try {
        const { data } = await authClient.token()
        if (!data?.token)
          throw new Error("Your session expired. Please sign in again.")
        const result = await getOwnerAnalytics(data.token)
        if (active) setAnalytics(result)
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your dashboard."
          )
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [session])

  const statCards = [
    {
      label: "Total income",
      value: loading
        ? "—"
        : `৳${(analytics?.totalIncome ?? 0).toLocaleString()}`,
      detail: "Revenue from paid rentals",
      icon: CircleDollarSign,
    },
    {
      label: "Completed rentals",
      value: loading ? "—" : (analytics?.completedRentals ?? 0),
      detail: "Successfully delivered",
      icon: PackageCheck,
    },
    {
      label: "Your equipment",
      value: loading ? "—" : (analytics?.totalEquipment ?? 0),
      detail: "All your listings",
      icon: Package,
    },
    {
      label: "Active listings",
      value: loading ? "—" : (analytics?.activeEquipment ?? 0),
      detail: "Approved and available",
      icon: Activity,
    },
  ]

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-3xl border bg-card p-6 sm:p-8">
        <p className="text-sm font-medium text-primary">Owner dashboard</p>
        <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your equipment, track rentals, and grow your business.
            </p>
          </div>
          <Link
            href="/dashboard/owner/add-equipment"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden="true" /> Add equipment
          </Link>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Your business summary"
      >
        {statCards.map((stat) => (
          <OwnerStat key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep your rental business moving.
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {ownerActions.map(({ href, title, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-xl border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <ArrowRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-4 font-medium">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex min-h-64 flex-col justify-between rounded-2xl border bg-card p-6 sm:p-7">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PackageCheck className="size-5" aria-hidden="true" />
          </div>
          {analytics?.mostRented ? (
            <div className="mt-7">
              <p className="text-sm text-muted-foreground">
                Most rented equipment
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {analytics.mostRented.name}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {analytics.mostRented.totalRentals} rentals so far
              </p>
              <Link
                href="/dashboard/owner/equipment"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                Manage your listings{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="mt-7">
              <p className="text-sm text-muted-foreground">
                Your next opportunity
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Get your first listing ready
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Add clear photos and details so customers can find your
                equipment.
              </p>
              <Link
                href="/dashboard/owner/add-equipment"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary"
              >
                Create a listing{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
