"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
  CircleDollarSign,
  Heart,
  PackageCheck,
  Search,
  Star,
  Truck,
  UserRound,
} from "lucide-react"

import {
  getCustomerAnalytics,
  type CustomerAnalytics,
} from "@/lib/api/analytics"
import { authClient } from "@/lib/auth-client"

const quickActions = [
  {
    href: "/equipments",
    title: "Find equipment",
    description: "Browse available gear for your next project.",
    icon: Search,
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    href: "/dashboard/customer/rentals",
    title: "View my rentals",
    description: "Check booking details and delivery progress.",
    icon: CalendarCheck,
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    href: "/dashboard/customer/favorites",
    title: "Saved favorites",
    description: "Return to equipment you have saved.",
    icon: Heart,
    tone: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  {
    href: "/dashboard/profile",
    title: "Update profile",
    description: "Keep your contact and delivery details current.",
    icon: UserRound,
    tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
]

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  detail: string
  icon: typeof CalendarCheck
  tone: string
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <span
          className={`flex size-9 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

export default function CustomerDashboardHome() {
  const { data: session } = authClient.useSession()
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const user = session?.user
  const createdAt = user?.createdAt ? new Date(user.createdAt) : null
  const memberSince =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? new Intl.DateTimeFormat("en", {
          month: "long",
          year: "numeric",
        }).format(createdAt)
      : "Welcome aboard"

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
        const result = await getCustomerAnalytics(data.token)
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

  const bookingCount = analytics?.totalBookings ?? 0
  const stats = [
    {
      label: "Total bookings",
      value: loading ? "—" : bookingCount,
      detail: "All your equipment orders",
      icon: CalendarCheck,
      tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    },
    {
      label: "Completed rentals",
      value: loading ? "—" : (analytics?.deliveredRent ?? 0),
      detail: "Equipment delivered",
      icon: PackageCheck,
      tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "In delivery",
      value: loading ? "—" : (analytics?.onDeliveryRent ?? 0),
      detail: "On the way to you",
      icon: Truck,
      tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    {
      label: "Total spent",
      value: loading
        ? "—"
        : `৳${(analytics?.totalSpent ?? 0).toLocaleString()}`,
      detail: "Across paid rentals",
      icon: CircleDollarSign,
      tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
  ]

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative isolate overflow-hidden rounded-3xl border bg-card p-6 shadow-sm shadow-primary/5 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-primary">Customer dashboard</p>
          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Your rentals and saved gear, all in one place.
              </p>
            </div>
            <div className="rounded-2xl bg-muted/60 px-4 py-3 sm:min-w-44">
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="mt-1 font-medium">{memberSince}</p>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[43%] overflow-hidden md:block">
          <Image
            src="/images/rentalspace-hero.jpg"
            alt="Rental equipment ready for your next project"
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 35vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/50 to-transparent" />
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
        aria-label="Your rental summary"
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick up where you left off.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 p-2 text-primary">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map(
              ({ href, title, description, icon: Icon, tone }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-xl border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl ${tone}`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
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
              )
            )}
          </div>
        </div>

        <Link
          href="/"
          className="group flex min-h-64 flex-col justify-between rounded-2xl border bg-primary p-6 text-primary-foreground transition-opacity hover:opacity-95 sm:p-7"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Star className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-primary-foreground/75">
              Enjoying RentalSpace?
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Give us a rating</h2>
            <p className="mt-2 max-w-sm text-sm text-primary-foreground/80">
              Visit the home page and share how your rental experience went.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
              Go to home{" "}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Pending bookings</p>
          <p className="mt-2 text-2xl font-semibold">
            {loading ? "—" : (analytics?.pendingRent ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Saved favorites</p>
          <p className="mt-2 text-2xl font-semibold">
            {loading ? "—" : (analytics?.favouriteItems ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Next step</p>
          <p className="mt-2 font-semibold">
            {bookingCount
              ? "Keep an eye on your rentals"
              : "Find your first rental"}
          </p>
          <Link
            href={bookingCount ? "/dashboard/customer/rentals" : "/equipments"}
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            {bookingCount ? "Track bookings" : "Browse equipment"}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
