"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  Heart,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  RouteArrowRight,
  User,
  Users,
  Store,
  X,
  type LucideIcon,
  ChartNoAxesColumn,
} from "lucide-react"

import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const navItems: Record<
  string,
  { href: string; label: string; icon: LucideIcon }[]
> = {
  customer: [
    {
      href: "/equipments",
      label: "Browse Equipments",
      icon: Store,
    },
    {
      href: "/dashboard/customer/rentals",
      label: "My Rentals",
      icon: CalendarCheck,
    },
    {
      href: "/dashboard/customer/favorites",
      label: "Favorites",
      icon: Heart,
    },

    { href: "/dashboard/profile", label: "My Profile", icon: User },
  ],
  owner: [
    {
      href: "/dashboard/owner/add-equipment",
      label: "Add Equipment",
      icon: PlusCircle,
    },
    {
      href: "/dashboard/owner/equipment",
      label: "My Equipment",
      icon: Package,
    },
    {
      href: "/dashboard/owner/rentals",
      label: "My Equipment Rental",
      icon: ClipboardList,
    },
    {
      href: "/dashboard/owner/analytics",
      label: "Analytics",
      icon: ChartNoAxesColumn,
    },
    { href: "/dashboard/profile", label: "My Profile", icon: User },
  ],
  admin: [
    { href: "/dashboard/admin/users", label: "All Users", icon: Users },
    {
      href: "/dashboard/admin/equipment",
      label: "All Equipment",
      icon: Package,
    },
    {
      href: "/dashboard/admin/rentals",
      label: "All Rentals",
      icon: ClipboardList,
    },
    {
      href: "/dashboard/admin/analytics",
      label: "Analytics",
      icon: ChartNoAxesColumn,
    },
    { href: "/dashboard/profile", label: "My Profile", icon: User },
  ],
}

function getInitials(name?: string | null) {
  if (!name) {
    return "U"
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function Sidebar({ role }: { role?: string | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = authClient.useSession()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const user = session?.user
  const items = navItems[(role ?? "").toLowerCase()] ?? []

  useEffect(() => {
    if (!userMenuOpen) return

    function handleClick(event: MouseEvent) {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [userMenuOpen])

  async function handleSignOut() {
    setSigningOut(true)

    const { error } = await authClient.signOut()

    if (error) {
      setSigningOut(false)
      return
    }

    router.push("/")
    router.refresh()
    toast.add({
      title: "Signed out",
      description: "You have been signed out.",
      type: "success",
    })
  }

  const brand = (
    <Link
      href="/"
      className="flex items-center px-2"
      onClick={() => setOpen(false)}
    >
      <RouteArrowRight className="size-5" aria-hidden="true" />
      <span className="text-lg font-semibold tracking-tight">RentalSpace</span>
    </Link>
  )

  return (
    <div className="">
      <div className="flex h-12 items-center justify-between border-b bg-card px-4 md:hidden">
        <span className="text-sm font-medium text-muted-foreground">
          Dashboard navigation
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open dashboard navigation"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 md:z-40 flex w-64 -translate-x-full flex-col border-r border-border/70 bg-background/90 backdrop-blur-xl transition-transform duration-200 md:sticky md:top-16 md:h-[calc(100svh-4rem)] md:translate-x-0",
          open && "translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {brand}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Dashboard navigation"
          className="flex-1 overflow-y-auto p-3"
        >
          <ul className="space-y-1">
            {items.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`)

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary",
                      active && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div ref={userMenuRef} className="relative border-t p-3">
          <button
            type="button"
            onClick={() => setUserMenuOpen((visible) => !visible)}
            aria-expanded={userMenuOpen}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted"
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name ?? "User avatar"}
                width={36}
                height={36}
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {getInitials(user?.name)}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {user?.name ?? "Account"}
              </span>
              <span className="block truncate text-xs text-muted-foreground capitalize">
                {role ?? "member"}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                userMenuOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          {userMenuOpen ? (
            <div className="absolute inset-x-3 bottom-full z-50 mb-2 overflow-hidden rounded-xl border bg-popover p-1 shadow-md">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                <LogOut className="size-4" aria-hidden="true" />
                {signingOut ? "Signing out..." : "Log out"}
              </button>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
