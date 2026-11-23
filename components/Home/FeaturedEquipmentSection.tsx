"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Package, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import EquipmentCard, {
  type EquipmentCardData,
} from "@/components/Equipments/EquipmentCard"
import { getFeaturedEquipments } from "@/lib/api/equipments"
import { getFavourites } from "@/lib/api/favourites"
import { authClient } from "@/lib/auth-client"
import { Reveal } from "@/components/Home/Reveal"

export default function FeaturedEquipmentSection() {
  const { data: session } = authClient.useSession()
  const [equipment, setEquipment] = useState<EquipmentCardData[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryKey, setRetryKey] = useState(0)
  const signedIn = Boolean(session)
  const isCustomer = (session?.user.role ?? "").toLowerCase() === "customer"

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError("")
      try {
        const result = await getFeaturedEquipments()
        const visible = Array.isArray(result)
          ? result.filter((item) => item.status === "active").slice(0, 6)
          : []

        if (active) setEquipment(visible)

        if (isCustomer) {
          try {
            const { data } = await authClient.token()
            if (data?.token) {
              const favorites = await getFavourites(data.token)
              if (active) {
                setSavedIds(
                  new Set(favorites.map((favorite) => favorite.equipmentId))
                )
              }
            }
          } catch {
            // Featured equipment remains available if favorites fail to load.
          }
        } else if (active) {
          setSavedIds(new Set())
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load featured equipment."
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
  }, [isCustomer, retryKey, session])

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            Picked for your next project
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Featured equipment
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Explore available equipment from local vendors, ready to rent.
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
              className="overflow-hidden rounded-2xl border bg-card"
            >
              <div className="h-44 animate-pulse bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-8 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : equipment.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item, index) => (
            <Reveal key={item._id} delay={index * 0.07}>
              <EquipmentCard
                equipment={item}
                initiallySaved={savedIds.has(item._id)}
                detailsHref={signedIn ? `/equipments/${item._id}` : "/login"}
              />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="size-5" aria-hidden="true" />
          </span>
          <p className="font-medium">Featured equipment is coming soon</p>
          <p className="text-sm text-muted-foreground">
            Browse all current listings while vendors prepare more gear.
          </p>
          <Link
            href="/equipments"
            className="text-sm font-medium text-primary hover:underline"
          >
            Explore equipment
          </Link>
        </div>
      )}
    </section>
  )
}
