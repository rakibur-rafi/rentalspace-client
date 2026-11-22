"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserPlus,
  Store,
  X,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { toast } from "@/components/ui/toast"

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

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const initials = getInitials(user?.name)
  const image = user?.image
  const role = user?.role

  const navLinks = [{ href: "/equipments", label: "All Equipment" }]

  const userNavLinks = [
    { href: "/equipments", label: "All Equipment" },
    { href: `/dashboard/${role}`, label: "Dashboard" },
  ]

  const primaryNavLinks = user ? userNavLinks : navLinks

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      const { error } = await authClient.signOut()
      if (error) {
        return
      }
      closeMenu()
      router.push("/")
      router.refresh()
      toast.add({
        title: "Signed out",
        description: "You have been signed out.",
        type: "success",
      })
    } finally {
      setSigningOut(false)
    }
  }

  if (pathname.startsWith("/dashboard")) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={closeMenu}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            RentalSpace
          </span>
        </Link>

        <nav
          className="hidden items-center md:flex"
          aria-label="Main navigation"
        >
          {primaryNavLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                isActive(href) && "bg-primary/10 text-primary"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
          >
            <Sun className="size-4 dark:hidden" aria-hidden="true" />
            <Moon className="hidden size-4 dark:block" aria-hidden="true" />
          </Button>

          <div className="hidden items-center gap-1.5 md:flex">
            {isPending ? (
              <div className="h-8 w-40 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard/profile"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-2"
                  )}
                  title={user.name ?? undefined}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={user.name ?? undefined}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <span className="text-lg font-medium uppercase">
                        {initials}
                      </span>
                    </div>
                  )}
                  Profile
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full px-4"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {signingOut ? "Signing out..." : "Log out"}
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-2"
                  )}
                >
                  <LogIn className="size-4" aria-hidden="true" />
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "gap-2 rounded-full px-4"
                  )}
                >
                  <UserPlus className="size-4" aria-hidden="true" />
                  Sign up
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-menu"
          className="border-t border-border/70 bg-background px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
            {primaryNavLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "w-full justify-start",
                  isActive(href) && "bg-primary/10 text-primary"
                )}
              >
                {label}
              </Link>
            ))}

            <div className="my-2 h-px bg-border" />

            {isPending ? (
              <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard/profile"
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "w-full justify-start gap-2"
                  )}
                  title={user.name ?? undefined}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      width={24}
                      height={24}
                      className="size-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                      {initials}
                    </span>
                  )}
                  Profile
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start gap-2 rounded-full"
                  onClick={handleSignOut}
                  disabled={signingOut}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {signingOut ? "Signing out..." : "Log out"}
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "w-full justify-start gap-2"
                  )}
                >
                  <LogIn className="size-4" aria-hidden="true" />
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full justify-start gap-2 rounded-full"
                  )}
                >
                  <UserPlus className="size-4" aria-hidden="true" />
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
