import Image from "next/image"
import Link from "next/link"
import { MapPin, Package } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import FavoriteButton from "@/components/Equipments/FavoriteButton"

export type EquipmentCardData = {
  _id: string
  name: string
  category: string
  location: string
  rentalPrice: number
  rentalType: string
  condition: string
  availableQuantity: number
  createdAt?: string
  brand?: string
  model?: string
  image?: string
  status?: string
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(value || 0)
}

export default function EquipmentCard({
  equipment,
  initiallySaved = false,
}: {
  equipment: EquipmentCardData
  initiallySaved?: boolean
}) {
  const available = equipment.availableQuantity > 0

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-card transition-shadow ${available ? "hover:shadow-md" : "opacity-75"}`}
    >
      {available && (
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton
            equipment={equipment}
            initiallySaved={initiallySaved}
          />
        </div>
      )}
      <div className="relative h-44 overflow-hidden bg-muted">
        {equipment.image ? (
          <Image
            src={equipment.image}
            alt={equipment.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={`object-cover transition-transform duration-500 ${available ? "group-hover:scale-105" : "grayscale"}`}
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <Package className="size-8" aria-hidden="true" />
          </span>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
          {equipment.category}
        </span>
        <span
          className={`absolute right-3 bottom-3 rounded-full px-2.5 py-1 text-xs font-medium ${available ? "bg-emerald-500/90 text-white" : "bg-background text-muted-foreground"}`}
        >
          {available ? "Available" : "Out of stock"}
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
        {available ? (
          <Link
            href={`/equipments/${equipment._id}`}
            className={buttonVariants({
              size: "sm",
              className: "mt-4 w-full",
            })}
          >
            View details
          </Link>
        ) : (
          <Button className="mt-4 w-full" size="sm" disabled>
            Unavailable
          </Button>
        )}
      </div>
    </article>
  )
}
