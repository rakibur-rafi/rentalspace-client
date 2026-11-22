"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { LifeBuoy, Mail, Moon, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const supportEmail = "support@rentalspace.com"

export function DashboardNavbar() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const { resolvedTheme, setTheme } = useTheme()

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = search.trim()
    if (!query) {
      router.push("/equipments")
      return
    }

    const params = new URLSearchParams({ search: query, searchBy: "name" })
    router.push(`/equipments?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full flex-col justify-center gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-center sm:gap-3 sm:px-6 sm:py-0">
        <div className="flex w-full min-w-0 items-center justify-center gap-2 sm:w-auto">
          <form
            role="search"
            onSubmit={handleSearch}
            className="w-full min-w-0 sm:w-56 lg:w-64"
          >
            <label htmlFor="dashboard-equipment-search" className="sr-only">
              Search equipment
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="dashboard-equipment-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search equipment"
                className="h-9 bg-background pr-10 pl-9"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                aria-label="Search equipment"
                className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                <Search className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        </div>

        <nav
          aria-label="Dashboard support"
          className="flex h-9 items-center justify-center gap-1 self-center sm:self-auto"
        >
          <a
            href={`mailto:${supportEmail}`}
            title="Contact Us"
            className="inline-flex size-9 items-center justify-center rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary sm:h-9 sm:w-auto sm:gap-2 sm:px-3"
          >
            <Mail className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Contact Us</span>
            <span className="sr-only sm:hidden">Contact Us</span>
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle color theme"
            title="Toggle color theme"
          >
            <Sun className="size-4 dark:hidden" aria-hidden="true" />
            <Moon className="hidden size-4 dark:block" aria-hidden="true" />
          </Button>
          <a
            href={`mailto:${supportEmail}?subject=RentalSpace%20help`}
            aria-label="Help and customer care"
            title="Help and customer care"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <LifeBuoy className="size-4" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}
