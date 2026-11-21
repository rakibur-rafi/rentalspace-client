import { Suspense } from "react"

import { EquipmentsList } from "@/components/Equipments/EquipmentsList"

function EquipmentsFallback() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-9 w-56 animate-pulse rounded bg-muted" />
      <div className="h-36 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
          <div key={item} className="h-64 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </section>
  )
}

export default function EquipmentsPage() {
  return (
    <Suspense fallback={<EquipmentsFallback />}>
      <EquipmentsList />
    </Suspense>
  )
}
