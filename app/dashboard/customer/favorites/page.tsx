"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Package, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getFavourites, type Favourite } from "@/lib/api/favourites"
import { authClient } from "@/lib/auth-client"

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(value || 0)
}

export default function CustomerFavoritesPage() {
  const { data: session } = authClient.useSession()
  const [favorites, setFavorites] = useState<Favourite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadFavorites = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError("")
    try {
      const { data } = await authClient.token()
      if (!data?.token)
        throw new Error("Your session expired. Please sign in again.")
      const result = await getFavourites(data.token)
      setFavorites(Array.isArray(result) ? result : [])
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your favorites."
      )
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadFavorites()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadFavorites])

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Equipment you’ve saved for later.
        </p>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-2xl border bg-card" />
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={loadFavorites}
          >
            <RotateCw className="size-4" aria-hidden="true" /> Try again
          </Button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <Heart className="size-8 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-medium">No favorites yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Save equipment you like and it will show up here.
            </p>
          </div>
          <Link
            href="/equipments"
            className="text-sm font-medium underline underline-offset-4"
          >
            Browse equipment
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Equipment</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Rental price</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {favorites.map((favorite) => (
                <tr key={favorite._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                        {favorite.image ? (
                          <Image
                            src={favorite.image}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Package className="size-5" aria-hidden="true" />
                        )}
                      </div>
                      <span className="font-medium">{favorite.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{favorite.category}</td>
                  <td className="px-4 py-3">{favorite.location}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(favorite.rentalPrice)} / {favorite.rentalType}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/equipments/${favorite.equipmentId}`}
                      className="inline-flex h-8 items-center justify-center rounded-full border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
