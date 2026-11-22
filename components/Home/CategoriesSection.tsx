"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Layers3, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCategories } from "@/lib/api/categories"

const categoryTones = [
  "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
]

function getCategoryImage(category: string) {
  const value = category.toLowerCase()
  if (value.includes("heavy") || value.includes("machine")) {
    return "/images/category-heavy-equipment.jpg"
  }
  if (value.includes("tool") || value.includes("power")) {
    return "/images/category-power-tools.jpg"
  }
  return "/images/rentalspace-hero.jpg"
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError("")
      try {
        const result = await getCategories()
        if (active) setCategories(result)
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load categories."
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    const timer = window.setTimeout(() => void load(), 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [retryKey])

  return (
    <section className="bg-muted/30">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Browse by category
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Find the right gear
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Choose a category to see matching equipment available to rent.
            </p>
          </div>
          <Link
            href="/equipments"
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-full border px-4 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:self-auto"
          >
            Browse all equipment
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-12 text-center">
            <p
              role="alert"
              className="text-sm text-rose-700 dark:text-rose-300"
            >
              {error}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRetryKey((current) => current + 1)}
            >
              <RotateCw className="size-4" aria-hidden="true" /> Try again
            </Button>
          </div>
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border bg-card"
              >
                <div className="aspect-[16/9] animate-pulse bg-muted" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Link
                key={category}
                href={`/equipments?category=${encodeURIComponent(category)}`}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm shadow-primary/5 transition-colors hover:border-primary/30"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <Image
                    src={getCategoryImage(category)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={`absolute top-4 left-4 inline-flex size-10 items-center justify-center rounded-xl backdrop-blur ${categoryTones[index % categoryTones.length]}`}
                  >
                    <Layers3 className="size-4" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <h3 className="font-semibold tracking-tight">{category}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Explore available listings
                    </p>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-card px-5 py-12 text-center">
            <p className="font-medium">Categories are coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse all equipment to see current listings.
            </p>
            <Link
              href="/equipments"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Browse equipment
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
