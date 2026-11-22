"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, Heart, Package, RotateCw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getFavourites, type Favourite } from "@/lib/api/favourites"
import { deleteFavourite } from "@/lib/actions/favourites"
import { authClient } from "@/lib/auth-client"
import { toast } from "@/components/ui/toast"

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
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  async function handleDelete(favorite: Favourite) {
    setDeletingId(favorite._id)
    try {
      const { data } = await authClient.token()
      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }
      await deleteFavourite(favorite._id, data.token)
      setFavorites((current) =>
        current.filter((item) => item._id !== favorite._id)
      )
      toast.add({
        title: "Removed from favorites",
        description: `${favorite.name} was removed from your favorites.`,
        type: "success",
      })
    } catch (deleteError) {
      toast.add({
        title: "Could not remove favorite",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Please try again.",
        type: "error",
      })
    } finally {
      setDeletingId(null)
    }
  }

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
        <div
          role="status"
          aria-label="Loading favorites"
          className="overflow-x-auto rounded-2xl border bg-card"
        >
          <table className="w-full min-w-[680px]">
            <tbody>
              {[0, 1, 2, 3].map((row) => (
                <tr key={row} className="border-b last:border-0">
                  {["w-40", "w-20", "w-24", "w-28", "w-16"].map(
                    (width, cell) => (
                      <td key={cell} className="px-4 py-5">
                        <div
                          className={`h-4 ${width} animate-pulse rounded bg-muted`}
                        />
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <span className="flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
            <Heart className="size-7" aria-hidden="true" />
          </span>
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
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/equipments/${favorite.equipmentId}`}
                        aria-label={`View ${favorite.name}`}
                        title="View equipment"
                        className="inline-flex size-8 items-center justify-center rounded-full border bg-background transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                      >
                        <Eye className="size-4" aria-hidden="true" />
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Remove ${favorite.name} from favorites`}
                        title="Remove favorite"
                        disabled={deletingId === favorite._id}
                        onClick={() => void handleDelete(favorite)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
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
