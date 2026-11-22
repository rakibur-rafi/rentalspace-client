"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Layers3, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCategories } from "@/lib/api/categories"

const categoryTones = [
  "bg-sky-500/15 text-sky-100",
  "bg-amber-500/15 text-amber-100",
  "bg-emerald-500/15 text-emerald-100",
  "bg-violet-500/15 text-violet-100",
  "bg-rose-500/15 text-rose-100",
  "bg-cyan-500/15 text-cyan-100",
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
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
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
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
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
              className="h-52 animate-pulse rounded-2xl border bg-muted"
            />
          ))}
        </div>
      ) : categories.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category}
              href={`/equipments?category=${encodeURIComponent(category)}`}
              className="group relative isolate flex min-h-52 items-end overflow-hidden rounded-2xl border bg-muted p-5 sm:p-6"
            >
              <Image
                src={getCategoryImage(category)}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="flex w-full items-end justify-between gap-4 text-white">
                <div>
                  <span
                    className={`mb-3 inline-flex size-9 items-center justify-center rounded-xl backdrop-blur ${categoryTones[index % categoryTones.length]}`}
                  >
                    <Layers3 className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {category}
                  </h3>
                  <p className="mt-1 text-sm text-white/75">
                    Explore available listings
                  </p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 transition-colors group-hover:bg-white/20">
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
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
    </section>
  )
}
