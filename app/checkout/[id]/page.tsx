import Image from "next/image"
import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { MapPin, PackageCheck, Tag } from "lucide-react"

import CheckoutForm from "@/components/Equipments/CheckoutForm"
import { auth } from "@/lib/auth"
import { getEquipmentById } from "@/lib/api/equipments"

type Equipment = {
  _id: string
  name: string
  image?: string
  rentalPrice: number
  rentalType: string
  availableQuantity: number
  category?: string
  condition?: string
  location?: string
  brand?: string
  model?: string
  description?: string
  rentalTerms?: string
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(value || 0)
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let token = ""

  try {
    const result = await auth.api.getToken({ headers: await headers() })
    token = result.token
  } catch {}

  if (!token) {
    redirect(`/login?returnTo=${encodeURIComponent(`/checkout/${id}`)}`)
  }

  let equipment: Equipment | null = null

  try {
    equipment = await getEquipmentById(id, token)
  } catch {
    notFound()
  }

  if (!equipment) notFound()

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Rental checkout</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Review your rental
          </h1>
          <p className="mt-2 text-muted-foreground">
            Check the equipment details and tell us where to deliver it.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border bg-card px-3 py-2 text-sm text-muted-foreground sm:self-auto">
          <PackageCheck className="size-4 text-primary" aria-hidden="true" />
          <span>Rental details</span>
          <span aria-hidden="true">·</span>
          <span>Payment</span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="relative aspect-[16/10] bg-muted">
            {equipment.image ? (
              <Image
                src={equipment.image}
                alt={equipment.name}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <PackageCheck className="size-12" aria-hidden="true" />
              </div>
            )}
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              {equipment.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Tag className="size-3.5" aria-hidden="true" />
                  {equipment.category}
                </span>
              )}
              {equipment.condition && (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {equipment.condition}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {equipment.name}
              </h2>
              {(equipment.brand || equipment.model) && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {[equipment.brand, equipment.model].filter(Boolean).join(" ")}
                </p>
              )}
            </div>
            <div className="flex items-baseline gap-2 border-y py-4">
              <p className="text-2xl font-semibold tracking-tight">
                {formatPrice(equipment.rentalPrice)}
              </p>
              <span className="text-sm text-muted-foreground">
                per {equipment.rentalType}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Availability</p>
                <p className="mt-1 font-medium">
                  {equipment.availableQuantity} units available
                </p>
              </div>
              {equipment.location && (
                <div className="rounded-xl bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Owner location
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium">
                    <MapPin
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="truncate">{equipment.location}</span>
                  </p>
                </div>
              )}
            </div>
            {equipment.description && (
              <div>
                <h3 className="text-sm font-semibold">About this equipment</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {equipment.description}
                </p>
              </div>
            )}
            {equipment.rentalTerms && (
              <div className="rounded-xl border border-dashed p-4">
                <h3 className="text-sm font-semibold">Rental terms</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {equipment.rentalTerms}
                </p>
              </div>
            )}
          </div>
        </div>

        <CheckoutForm
          equipmentId={id}
          rentalPrice={equipment.rentalPrice}
          rentalType={equipment.rentalType}
          availableQuantity={equipment.availableQuantity}
        />
      </div>
    </section>
  )
}
