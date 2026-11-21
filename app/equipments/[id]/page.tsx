import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, Package } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import RentNowButton from "@/components/Equipments/RentNowButton"
import { getEquipmentById } from "@/lib/api/equipments"

type Equipment = {
  _id: string
  name: string
  description: string
  category: string
  location: string
  rentalPrice: number
  rentalType: string
  availableQuantity: number
  condition: string
  brand?: string
  model?: string
  image?: string
  rentalTerms: string
  owner?: {
    name?: string
    email?: string
    image?: string | null
  }
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(value || 0)
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let equipment: Equipment | null = null

  try {
    equipment = await getEquipmentById(id)
  } catch {
    notFound()
  }

  if (!equipment) {
    notFound()
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/equipments"
        className={buttonVariants({
          variant: "ghost",
          size: "sm",
          className: "-ml-2 gap-2",
        })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to equipment
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-72 overflow-hidden rounded-2xl border bg-muted lg:min-h-[460px]">
          {equipment.image ? (
            <Image
              src={equipment.image}
              alt={equipment.name}
              fill
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full min-h-72 items-center justify-center text-muted-foreground">
              <Package className="size-12" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="space-y-5 rounded-2xl border bg-card p-6">
          <div>
            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              {equipment.category}
            </span>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">
              {equipment.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[equipment.brand, equipment.model].filter(Boolean).join(" ") ||
                "No brand or model"}
            </p>
          </div>

          <p className="text-3xl font-semibold tracking-tight">
            {formatPrice(equipment.rentalPrice)}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              / {equipment.rentalType}
            </span>
          </p>

          <RentNowButton
            equipmentId={id}
            availableQuantity={equipment.availableQuantity}
          />

          <dl className="grid gap-3 border-t pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Condition</dt>
              <dd className="mt-0.5 font-medium">{equipment.condition}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Available</dt>
              <dd className="mt-0.5 font-medium">
                {equipment.availableQuantity} units
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd className="mt-0.5 flex items-center gap-1 font-medium">
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                {equipment.location}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Listed by</dt>
              <dd className="mt-0.5 font-medium">
                {equipment.owner?.name ?? "Vendor"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Description</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {equipment.description}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold">Rental terms</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {equipment.rentalTerms}
          </p>
        </div>
      </div>
    </section>
  )
}
