"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ChevronDown,
  ChevronUp,
  Package,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EquipmentCard, {
  type EquipmentCardData,
} from "@/components/Equipments/EquipmentCard"
import { getCategories } from "@/lib/api/categories"
import { getEquipments } from "@/lib/api/equipments"
import { getFavourites } from "@/lib/api/favourites"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const rentalTypes = ["daily", "weekly", "monthly"]

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

export function EquipmentsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = authClient.useSession()

  const category = searchParams.get("category")
  const location = searchParams.get("location")
  const rentalType = searchParams.get("rentalType")
  const condition = searchParams.get("condition")
  const brand = searchParams.get("brand")
  const search = searchParams.get("search")?.trim() ?? ""
  const searchBy = searchParams.get("searchBy") ?? "name"
  const sort = searchParams.get("sort") ?? "recently-added"
  const minPrice = searchParams.get("minPrice") ?? ""
  const maxPrice = searchParams.get("maxPrice") ?? ""
  const availability = searchParams.get("availability") ?? ""
  const hasFilters = Boolean(
    category ||
    rentalType ||
    condition ||
    location ||
    brand ||
    minPrice ||
    maxPrice ||
    availability
  )
  const hasActiveQuery = Boolean(
    hasFilters || search || (sort && sort !== "recently-added")
  )

  const [equipments, setEquipments] = useState<EquipmentCardData[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    let active = true

    getCategories()
      .then((result) => {
        if (active) setCategories(result)
      })
      .catch(() => {
        if (active) setCategories([])
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!session || (session.user.role ?? "").toLowerCase() !== "customer") {
      setFavoriteIds(new Set())
      return
    }

    let active = true

    async function loadFavorites() {
      try {
        const { data } = await authClient.token()
        if (!data?.token) return

        const favorites = await getFavourites(data.token)
        if (active) {
          setFavoriteIds(
            new Set(favorites.map((favorite) => favorite.equipmentId))
          )
        }
      } catch {}
    }

    loadFavorites()

    return () => {
      active = false
    }
  }, [session])

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
          search: search || undefined,
          searchBy: search ? searchBy : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          availability: availability || undefined,
          sort: sort || undefined,
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
  }, [
    category,
    location,
    rentalType,
    condition,
    brand,
    search,
    searchBy,
    minPrice,
    maxPrice,
    availability,
    sort,
  ])

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

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const value = String(formData.get("search") ?? "").trim()
    const by = String(formData.get("searchBy") ?? "name")
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set("search", value)
      params.set("searchBy", by)
    } else {
      params.delete("search")
      params.delete("searchBy")
    }

    const query = params.toString()
    router.replace(query ? `/equipments?${query}` : "/equipments", {
      scroll: false,
    })
  }

  function submitPriceRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const min = String(formData.get("minPrice") ?? "").trim()
    const max = String(formData.get("maxPrice") ?? "").trim()
    const params = new URLSearchParams(searchParams.toString())

    if (min) params.set("minPrice", min)
    else params.delete("minPrice")
    if (max) params.set("maxPrice", max)
    else params.delete("maxPrice")

    const query = params.toString()
    router.replace(query ? `/equipments?${query}` : "/equipments", {
      scroll: false,
    })
  }

  const visibleEquipments = equipments

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
        {hasActiveQuery ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        ) : null}
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          aria-expanded={showControls}
          aria-controls="equipment-controls"
          onClick={() => setShowControls((visible) => !visible)}
          className="h-10 gap-2 rounded-full px-4"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {hasFilters && (
            <span
              className="size-2 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}
          {showControls ? (
            <ChevronUp className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4" aria-hidden="true" />
          )}
        </Button>

        <form
          key={`${searchBy}:${search}`}
          onSubmit={submitSearch}
          className="mt-4 grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5"
        >
          <div className="space-y-3">
            <label htmlFor="equipment-search" className="text-sm font-medium">
              Search equipment
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="equipment-search"
                  name="search"
                  defaultValue={search}
                  placeholder={
                    searchBy === "location"
                      ? "Search by city or area"
                      : "Search by equipment name"
                  }
                  className="h-10 bg-background pl-10"
                />
              </div>
              <fieldset className="shrink-0">
                <legend className="sr-only">Search by</legend>
                <div className="inline-flex flex-wrap gap-2">
                  {[
                    ["name", "Equipment Name"],
                    ["location", "Location"],
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className="cursor-pointer rounded-full border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
                    >
                      <input
                        type="radio"
                        name="searchBy"
                        value={value}
                        defaultChecked={searchBy === value}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
          <Button type="submit" className="h-10 px-6">
            Search
          </Button>
        </form>

        {showControls && (
          <div
            id="equipment-controls"
            className="mt-3 rounded-2xl border bg-card p-5 sm:p-6"
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <FilterGroup
                legend="Equipment Category"
                name="category"
                options={categories}
                value={category}
                onChange={(value) => updateFilter("category", value)}
              />
              <FilterGroup
                legend="Rental Type"
                name="rentalType"
                options={rentalTypes}
                value={rentalType}
                onChange={(value) => updateFilter("rentalType", value)}
              />
              <fieldset>
                <legend className="text-sm font-medium">Price Range</legend>
                <form
                  key={`${minPrice}:${maxPrice}`}
                  onSubmit={submitPriceRange}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      aria-label="Minimum price"
                      name="minPrice"
                      type="number"
                      min="0"
                      placeholder="Min"
                      defaultValue={minPrice}
                      className="h-9 text-sm"
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      aria-label="Maximum price"
                      name="maxPrice"
                      type="number"
                      min="0"
                      placeholder="Max"
                      defaultValue={maxPrice}
                      className="h-9 text-sm"
                    />
                  </div>
                  <Button type="submit" variant="outline" size="sm">
                    Apply range
                  </Button>
                </form>
              </fieldset>
              <FilterGroup
                legend="Availability"
                name="availability"
                options={["available"]}
                value={availability}
                onChange={(value) => updateFilter("availability", value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Sort by</span>
        {[
          ["recently-added", "Recently added"],
          ["low-to-high", "Low to high"],
          ["high-to-low", "High to low"],
        ].map(([value, label]) => (
          <Button
            key={value}
            type="button"
            variant={sort === value ? "secondary" : "outline"}
            aria-pressed={sort === value}
            onClick={() =>
              updateFilter("sort", value === "recently-added" ? "all" : value)
            }
            className="rounded-full"
          >
            {label}
          </Button>
        ))}
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
      ) : visibleEquipments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Package className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">No equipment found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another search or filter to see more equipment.
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
            {visibleEquipments.length}{" "}
            {visibleEquipments.length === 1 ? "item" : "items"} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleEquipments.map((equipment) => (
              <EquipmentCard
                key={equipment._id}
                equipment={equipment}
                initiallySaved={favoriteIds.has(equipment._id)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
