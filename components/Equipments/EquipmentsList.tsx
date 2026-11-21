"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Package, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getEquipments } from "@/lib/api/equipments"
import { cn } from "@/lib/utils"

type Equipment = {
  _id: string
  name: string
  category: string
  location: string
  rentalPrice: number
  rentalType: string
  condition: string
  brand?: string
  model?: string
  image?: string
}

const categories = [
  "Power Tools",
  "Heavy Equipment",
  "Lawn & Garden",
  "Construction",
  "Event & Party",
  "Cleaning",
  "Automotive",
]

const rentalTypes = ["daily", "weekly", "monthly"]

const conditions = ["New", "Excellent", "Good", "Fair"]

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(value || 0)
}

function capitalize(value?: string) {
  if (!value) return ""

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function FilterGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string
  name: string
  options: string[]
  value: string | null
  onChange: (value: string) => void
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {["all", ...options].map((option) => {
          const checked = option === "all" ? !value : value === option

          return (
            <label
              key={option}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              {option === "all" ? "All" : capitalize(option)}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function EquipmentCard({ equipment }: { equipment: Equipment }) {
  return (
    <Link
      href={`/equipments/${equipment._id}`}
      className="group overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        {equipment.image ? (
          <Image
            src={equipment.image}
            alt={equipment.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <Package className="size-8" aria-hidden="true" />
          </span>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
          {equipment.category}
        </span>
      </div>

      <div className="p-4">
        <p className="truncate font-medium">{equipment.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {[equipment.brand, equipment.model].filter(Boolean).join(" ") ||
            equipment.condition}
        </p>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{equipment.location}</span>
        </p>
        <p className="mt-3 text-sm font-semibold">
          {formatPrice(equipment.rentalPrice)}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            / {equipment.rentalType}
          </span>
        </p>
      </div>
    </Link>
  )
}

export function EquipmentsList() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const category = searchParams.get("category")
  const location = searchParams.get("location")
  const rentalType = searchParams.get("rentalType")
  const condition = searchParams.get("condition")
  const brand = searchParams.get("brand")
  const hasFilters = Boolean(
    category || rentalType || condition || location || brand
  )

  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError("")

      try {
        const result = await getEquipments({
          category: category ?? undefined,
          location: location ?? undefined,
          rentalType: rentalType ?? undefined,
          condition: condition ?? undefined,
          brand: brand ?? undefined,
        })

        if (active) {
          setEquipments(Array.isArray(result) ? result : [])
        }
      } catch {
        if (active) {
          setError("Could not load equipment.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [category, location, rentalType, condition, brand])

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    const query = params.toString()
    router.replace(query ? `/equipments?${query}` : "/equipments", {
      scroll: false,
    })
  }

  function clearFilters() {
    router.replace("/equipments", { scroll: false })
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            All Equipment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse gear from vendors near you.
          </p>
        </div>
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
        </div>
        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          <FilterGroup
            legend="Category"
            name="category"
            options={categories}
            value={category}
            onChange={(value) => updateFilter("category", value)}
          />
          <FilterGroup
            legend="Rental type"
            name="rentalType"
            options={rentalTypes}
            value={rentalType}
            onChange={(value) => updateFilter("rentalType", value)}
          />
          <FilterGroup
            legend="Condition"
            name="condition"
            options={conditions}
            value={condition}
            onChange={(value) => updateFilter("condition", value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border bg-card"
            >
              <div className="h-44 animate-pulse bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => router.refresh()}
          >
            Try again
          </Button>
        </div>
      ) : equipments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Package className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">No equipment found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different filter or clear them to see everything.
            </p>
          </div>
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {equipments.length} {equipments.length === 1 ? "item" : "items"}{" "}
            found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {equipments.map((equipment) => (
              <EquipmentCard key={equipment._id} equipment={equipment} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
