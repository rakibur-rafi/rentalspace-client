import Image from "next/image"
import { notFound } from "next/navigation"

import CheckoutForm from "@/components/Equipments/CheckoutForm"
import { getEquipmentById } from "@/lib/api/equipments"

type Equipment = {
  _id: string
  name: string
  image?: string
  rentalPrice: number
  rentalType: string
  availableQuantity: number
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

  let equipment: Equipment | null = null

  try {
    equipment = await getEquipmentById(id)
  } catch {
    notFound()
  }

  if (!equipment) notFound()

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm the quantity and contact details for your rental.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="relative aspect-[4/3] bg-muted">
            {equipment.image ? (
              <Image
                src={equipment.image}
                alt={equipment.name}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="space-y-2 p-5">
            <h2 className="text-lg font-semibold">{equipment.name}</h2>
            <p className="text-sm text-muted-foreground">
              {formatPrice(equipment.rentalPrice)} / {equipment.rentalType}
            </p>
            <p className="text-sm text-muted-foreground">
              {equipment.availableQuantity} available
            </p>
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
