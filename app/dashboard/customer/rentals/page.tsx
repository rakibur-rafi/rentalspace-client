"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Package, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getCustomerRentals, type Rental } from "@/lib/api/rentals"
import { authClient } from "@/lib/auth-client"

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(value || 0)
}

function formatDate(value?: string) {
  if (!value) return "Date unavailable"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export default function CustomerRentalsPage() {
  const { data: session } = authClient.useSession()
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadRentals = useCallback(async () => {
    if (!session) return

    setLoading(true)
    setError("")

    try {
      const { data } = await authClient.token()
      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }

      const result = await getCustomerRentals(data.token)
      setRentals(Array.isArray(result) ? result : [])
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your rentals."
      )
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    loadRentals()
  }, [loadRentals])

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Rentals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep track of your equipment bookings.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-2xl border bg-card"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={loadRentals}
          >
            <RotateCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : rentals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarDays className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">No rentals yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When you book equipment, your rentals will appear here.
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
        <div className="grid gap-4 sm:grid-cols-2">
          {rentals.map((rental) => (
            <article
              key={rental._id}
              className="overflow-hidden rounded-2xl border bg-card"
            >
              <div className="flex gap-4 p-4">
                <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
                  {rental.equipment?.image ? (
                    <Image
                      src={rental.equipment.image}
                      alt={rental.equipment.name ?? "Rental equipment"}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <Package className="size-8" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {rental.equipment?.name ?? "Equipment rental"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {rental.quantity ?? 1}{" "}
                    {rental.quantity === 1 ? "unit" : "units"}
                    {rental.rentalType ? ` · ${rental.rentalType}` : ""}
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {formatPrice(rental.totalPrice)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t px-4 py-3 text-xs">
                <span className="text-muted-foreground">
                  Booked {formatDate(rental.checkoutDate)}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 font-medium capitalize">
                  {rental.status ?? "Pending"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
