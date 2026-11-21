"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { createFavourite, deleteFavourite } from "@/lib/actions/favourites"
import { getFavourites, type Favourite } from "@/lib/api/favourites"
import { authClient } from "@/lib/auth-client"

type Equipment = {
  _id: string
  name: string
  image?: string
  category: string
  location: string
  rentalPrice: number
  rentalType: string
  condition: string
  brand?: string
  model?: string
}

export default function FavoriteButton({
  equipment,
  initiallySaved = false,
  checkSaved = false,
}: {
  equipment: Equipment
  initiallySaved?: boolean
  checkSaved?: boolean
}) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null)
  const saved = savedOverride ?? initiallySaved
  const [saving, setSaving] = useState(false)
  const [favouriteId, setFavouriteId] = useState<string | null>(null)

  useEffect(() => {
    if (
      !checkSaved ||
      !session ||
      (session.user.role ?? "").toLowerCase() !== "customer"
    ) {
      return
    }

    let active = true

    async function loadSavedState() {
      try {
        const { data } = await authClient.token()
        if (!data?.token) return

        const favourites = await getFavourites(data.token)
        const favourite = favourites.find(
          (item) => item.equipmentId === equipment._id
        )
        if (active) {
          setSavedOverride(Boolean(favourite))
          setFavouriteId(favourite?._id ?? null)
        }
      } catch {}
    }

    loadSavedState()

    return () => {
      active = false
    }
  }, [checkSaved, equipment._id, session])

  async function handleSave() {
    if (!session) {
      router.push(
        `/login?returnTo=${encodeURIComponent(`/equipments/${equipment._id}`)}`
      )
      return
    }

    if ((session.user.role ?? "").toLowerCase() !== "customer") {
      toast.add({
        title: "Customer account required",
        description: "Sign in with a customer account to save equipment.",
        type: "error",
      })
      return
    }

    setSaving(true)

    try {
      const { data } = await authClient.token()

      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }

      if (saved) {
        let id = favouriteId
        if (!id) {
          const favourites = await getFavourites(data.token)
          id =
            favourites.find((item) => item.equipmentId === equipment._id)
              ?._id ?? null
        }
        if (!id) throw new Error("Could not find this favorite to remove.")
        await deleteFavourite(id, data.token)
        setSavedOverride(false)
        setFavouriteId(null)
        toast.add({
          title: "Removed from favorites",
          description: `${equipment.name} was removed from your favorites.`,
          type: "success",
        })
        return
      }

      const result = await createFavourite(
        {
          customerEmail: session.user.email,
          equipmentId: equipment._id,
          name: equipment.name,
          image: equipment.image,
          category: equipment.category,
          location: equipment.location,
          rentalPrice: equipment.rentalPrice,
          rentalType: equipment.rentalType,
          condition: equipment.condition,
          brand: equipment.brand,
          model: equipment.model,
        },
        data.token
      )

      setSavedOverride(true)
      setFavouriteId(
        (result as Partial<Favourite> & { insertedId?: string })._id ??
          (result as { insertedId?: string }).insertedId ??
          null
      )
      toast.add({
        title: "Added to favorites",
        description: `${equipment.name} was saved to your favorites.`,
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Could not save equipment",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={saved ? "Saved to favorites" : "Add to favorites"}
      aria-pressed={saved}
      disabled={saving}
      onClick={handleSave}
      className={`rounded-full bg-background/95 ${saved ? "text-red-600 hover:text-red-700" : ""}`}
    >
      <Heart
        className="size-4"
        fill={saved ? "currentColor" : "none"}
        aria-hidden="true"
      />
    </Button>
  )
}
