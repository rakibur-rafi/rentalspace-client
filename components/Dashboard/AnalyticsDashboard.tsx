"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Activity,
  Box,
  CircleDollarSign,
  PackageCheck,
  Users,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import {
  getAdminAnalytics,
  getOwnerAnalytics,
  type AdminAnalytics,
  type MonthlyMetric,
  type OwnerAnalytics,
} from "@/lib/api/analytics"

type DashboardData = OwnerAnalytics | AdminAnalytics

function toChartRows(rows: MonthlyMetric[] = []) {
  return rows.map((row) => {
    const id = row._id
    const date =
      typeof id === "object" && id !== null
        ? (id as Record<string, unknown>)
        : {}
    const rawMonth = row.month ?? date.month ?? id
    const rawYear = row.year ?? date.year
    let month = String(rawMonth ?? "")
    if (typeof rawMonth === "number" && rawMonth >= 1 && rawMonth <= 12) {
      month = new Intl.DateTimeFormat("en", { month: "short" }).format(
        new Date(2024, rawMonth - 1, 1)
      )
    } else if (
      typeof rawMonth === "string" &&
      /^\d{4}-\d{1,2}$/.test(rawMonth)
    ) {
      const [year, number] = rawMonth.split("-").map(Number)
      month = new Intl.DateTimeFormat("en", { month: "short" }).format(
        new Date(year, number - 1, 1)
      )
    }

    const metric = Object.entries(row).find(
      ([key, value]) =>
        key !== "_id" &&
        key !== "month" &&
        key !== "year" &&
        typeof value === "number"
    )?.[1]

    return {
      month: `${month}${rawYear ? ` ${rawYear}` : ""}` || "—",
      value: typeof metric === "number" ? metric : 0,
    }
  })
}

function MetricCard({
  label,
  value,
  icon: Icon,
  currency = false,
}: {
  label: string
  value: number
  icon: typeof Activity
  currency?: boolean
}) {
  const iconTone = label.toLowerCase().includes("user")
    ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
    : label.toLowerCase().includes("equipment")
      ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
      : label.toLowerCase().includes("rental") ||
          label.toLowerCase().includes("booking")
        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <span
          className={`flex size-9 items-center justify-center rounded-xl ${iconTone}`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {currency ? `৳${value.toLocaleString()}` : value.toLocaleString()}
      </p>
    </div>
  )
}

function ChartCard({
  title,
  rows,
  color,
  kind = "line",
}: {
  title: string
  rows: ReturnType<typeof toChartRows>
  color: string
  kind?: "line" | "bar"
}) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="font-semibold">{title}</h2>
      {rows.length ? (
        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {kind === "bar" ? (
              <BarChart
                data={rows}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                  }}
                />
                <Bar
                  dataKey="value"
                  name="Bookings"
                  fill={color}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart
                data={rows}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: "var(--border)",
                    background: "var(--card)",
                    color: "var(--foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={title}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: color }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-5 flex h-72 items-center justify-center rounded-xl bg-muted/40 text-sm text-muted-foreground">
          No monthly data available yet.
        </div>
      )}
    </section>
  )
}

export default function AnalyticsDashboard({
  role,
}: {
  role: "owner" | "admin"
}) {
  const { data: session } = authClient.useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session) return
    let active = true

    async function load() {
      setLoading(true)
      setError("")
      try {
        const { data: tokenData } = await authClient.token()
        if (!tokenData?.token)
          throw new Error("Your session expired. Please sign in again.")
        const result =
          role === "owner"
            ? await getOwnerAnalytics(tokenData.token)
            : await getAdminAnalytics(tokenData.token)
        if (active) setData(result)
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load analytics."
          )
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [role, session])

  const ownerData = role === "owner" ? (data as OwnerAnalytics | null) : null
  const adminData = role === "admin" ? (data as AdminAnalytics | null) : null

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-sm font-medium text-primary">Overview</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {role === "owner" ? "Owner analytics" : "Platform analytics"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track performance and monthly trends.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      ) : null}

      {ownerData ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total income"
              value={ownerData.totalIncome}
              icon={CircleDollarSign}
              currency
            />
            <MetricCard
              label="Completed rentals"
              value={ownerData.completedRentals}
              icon={PackageCheck}
            />
            <MetricCard
              label="Total equipment"
              value={ownerData.totalEquipment}
              icon={Box}
            />
            <MetricCard
              label="Active equipment"
              value={ownerData.activeEquipment}
              icon={Activity}
            />
          </div>
          {ownerData.mostRented ? (
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Most rented equipment
              </p>
              <p className="mt-1 font-semibold">{ownerData.mostRented.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {ownerData.mostRented.totalRentals} rentals
              </p>
            </div>
          ) : null}
          <ChartCard
            title="Monthly sales"
            rows={toChartRows(ownerData.monthlySales)}
            color="var(--chart-1)"
          />
        </>
      ) : null}

      {adminData ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Platform revenue"
              value={adminData.platformRevenue}
              icon={CircleDollarSign}
              currency
            />
            <MetricCard
              label="Total bookings"
              value={adminData.totalBookings}
              icon={PackageCheck}
            />
            <MetricCard
              label="Total users"
              value={adminData.totalUsers}
              icon={Users}
            />
            <MetricCard
              label="Total equipment"
              value={adminData.totalEquipment}
              icon={Box}
            />
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <ChartCard
              title="Monthly sales"
              rows={toChartRows(adminData.monthlySales)}
              color="var(--chart-1)"
            />
            <ChartCard
              title="Monthly user growth"
              rows={toChartRows(adminData.monthlyUserGrowth)}
              color="var(--chart-2)"
              kind="bar"
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
