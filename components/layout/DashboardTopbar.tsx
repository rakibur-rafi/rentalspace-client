import Link from "next/link"
import { ArrowUpRight, LayoutDashboard, UserRound, Wrench } from "lucide-react"

const roleStyles: Record<string, string> = {
  customer: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  owner: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  admin: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
}

export function DashboardTopbar({
  name,
  role,
}: {
  name?: string | null
  role: string
}) {
  const normalizedRole = role.toLowerCase()
  const displayRole = normalizedRole || "member"
  const initials =
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"

  return (
    <header className="mb-6 flex min-h-16 items-center justify-between gap-4 rounded-2xl border bg-card/90 px-4 py-3 shadow-sm shadow-primary/5 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
          <Wrench className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            RentalSpace
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <LayoutDashboard className="size-3" aria-hidden="true" /> Dashboard
          </p>
        </div>
        <span
          className={`ml-1 hidden rounded-full px-2.5 py-1 text-xs font-medium capitalize sm:inline-flex ${roleStyles[normalizedRole] ?? "bg-muted text-muted-foreground"}`}
        >
          {displayRole} workspace
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/equipments"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 sm:px-4 sm:text-sm"
        >
          Browse gear <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
        <Link
          href="/dashboard/profile"
          aria-label="Open my profile"
          title={name ? `${name} · My profile` : "My profile"}
          className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          {initials || <UserRound className="size-4" aria-hidden="true" />}
        </Link>
      </div>
    </header>
  )
}
