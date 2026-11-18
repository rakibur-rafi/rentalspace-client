"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  UserPlus,
  Wrench,
  X,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Replace this with the Better Auth session when authentication is wired up.
const isLoggedIn = false

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  function closeMenu() {
    setMenuOpen(false)
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
            <Wrench className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            RentalSpace
          </span>
        </Link>

        <nav
          className="hidden items-center md:flex"
          aria-label="Main navigation"
        >
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "gap-2"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
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
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-2"
                  )}
                >
                  <User className="size-4" aria-hidden="true" />
                  Profile
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full px-4"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Log out
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
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "w-full justify-start gap-2"
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}

            <div className="my-2 h-px bg-border" />

            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "w-full justify-start gap-2"
                  )}
                >
                  <User className="size-4" aria-hidden="true" />
                  Profile
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start gap-2 rounded-full"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Log out
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
