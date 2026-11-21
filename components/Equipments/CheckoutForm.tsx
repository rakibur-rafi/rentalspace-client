"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { createCheckoutSession } from "@/lib/actions/checkout"
import { getProfile } from "@/lib/api/profile"
import { authClient } from "@/lib/auth-client"

type Profile = {
  phone?: string
  address?: string
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(value || 0)
}

function formatDate(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function dateAfterDays(days: number) {
  const today = new Date()
  const date = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + days)
  )
  return date.toISOString().slice(0, 10)
}

function getRentEndDate(startDate: string, rentalType: string) {
  if (!startDate) return ""

  const [year, month, day] = startDate.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const normalizedType = rentalType.toLowerCase()

  if (normalizedType === "weekly") {
    date.setUTCDate(date.getUTCDate() + 7)
  } else if (normalizedType === "monthly") {
    const originalDay = date.getUTCDate()
    date.setUTCDate(1)
    date.setUTCMonth(date.getUTCMonth() + 1)
    const lastDayOfMonth = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
    ).getUTCDate()
    date.setUTCDate(Math.min(originalDay, lastDayOfMonth))
  } else {
    date.setUTCDate(date.getUTCDate() + 1)
  }

  return date.toISOString().slice(0, 10)
}

export default function CheckoutForm({
  equipmentId,
  rentalPrice,
  rentalType,
  availableQuantity,
}: {
  equipmentId: string
  rentalPrice: number
  rentalType: string
  availableQuantity: number
}) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [quantity, setQuantity] = useState(1)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [rentStartDate, setRentStartDate] = useState(() => dateAfterDays(3))
  const [submitting, setSubmitting] = useState(false)
  const minimumStartDate = dateAfterDays(3)
  const rentEndDate = getRentEndDate(rentStartDate, rentalType)

  useEffect(() => {
    if (!session) return

    let active = true

    async function loadProfile() {
      try {
        const { data } = await authClient.token()
        if (!data?.token) return

        const profile: Profile = await getProfile(data.token)
        if (active) {
          setPhone(profile.phone ?? "")
          setAddress(profile.address ?? "")
        }
      } catch {}
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [session])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!session) {
      router.push(
        `/login?returnTo=${encodeURIComponent(`/checkout/${equipmentId}`)}`
      )
      return
    }

    if ((session.user.role ?? "").toLowerCase() !== "customer") {
      toast.add({
        title: "Customer account required",
        description: "Only customer accounts can rent equipment.",
        type: "error",
      })
      return
    }

    const formData = new FormData(event.currentTarget)
    const selectedQuantity = Number(formData.get("quantity"))
    const checkoutData = {
      equipmentId,
      quantity: selectedQuantity,
      phone: String(formData.get("phone") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      totalPrice: rentalPrice * selectedQuantity,
      rentalType,
      rentStartDate,
      rentEndDate,
      checkoutDate: formatDate(new Date()),
    }

    setSubmitting(true)

    try {
      const { data } = await authClient.token()

      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }

      const checkout = await createCheckoutSession(checkoutData, data.token)
      window.location.assign(checkout.url)
    } catch (error) {
      toast.add({
        title: "Checkout could not start",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      })
      setSubmitting(false)
    }
  }

  const totalPrice = rentalPrice * quantity

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border bg-card p-6"
    >
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={availableQuantity}
          value={quantity}
          onChange={(event) =>
            setQuantity(
              Math.min(
                availableQuantity,
                Math.max(1, Number(event.target.value) || 1)
              )
            )
          }
          required
          disabled={availableQuantity < 1}
        />
        <p className="text-xs text-muted-foreground">
          Choose up to {availableQuantity} available units.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rentStartDate">Rental start date</Label>
        <Input
          id="rentStartDate"
          name="rentStartDate"
          type="date"
          min={minimumStartDate}
          value={rentStartDate}
          onChange={(event) => setRentStartDate(event.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Start dates must allow at least 3 days for delivery.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rentEndDate">Rental end date</Label>
        <Input
          id="rentEndDate"
          name="rentEndDate"
          type="date"
          value={rentEndDate}
          readOnly
          required
        />
        <p className="text-xs text-muted-foreground">
          Calculated from the selected start date and {rentalType} rental
          period.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <textarea
          id="address"
          name="address"
          autoComplete="street-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="min-h-24 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          placeholder="Street, city, country"
          required
        />
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Total ({quantity} × {formatPrice(rentalPrice)} / {rentalType})
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatPrice(totalPrice)}
          </p>
        </div>
        <Button
          type="submit"
          className="h-11 rounded-full px-6"
          disabled={availableQuantity < 1 || submitting}
        >
          {submitting ? "Redirecting..." : "Checkout"}
        </Button>
      </div>
    </form>
  )
}
