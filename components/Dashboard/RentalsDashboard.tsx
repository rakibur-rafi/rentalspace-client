"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarDays, Eye, Package, RotateCw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getAllRentals,
  getCustomerRentals,
  deleteAdminRental,
  getOwnerRentals,
  type Rental,
} from "@/lib/api/rentals"
import { getEquipmentById } from "@/lib/api/equipments"
import { authClient } from "@/lib/auth-client"
import { updateRentalStatus, type RentalStatus } from "@/lib/actions/status"
import { toast } from "@/components/ui/toast"

type View = "customer" | "owner" | "admin"
const rentalStatuses: RentalStatus[] = ["pending", "on delivery", "delivered"]

type RentalRow = Rental & {
  equipmentLinkId: string
  equipmentName: string
  equipmentImage?: string
}

function formatPrice(value?: number) {
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

function getEquipmentId(rental: Rental) {
  const id = rental.equipmentId ?? rental.equipmentID
  return id ? String(id) : ""
}

function rentalStatusClasses(status?: string) {
  const normalized = status?.toLowerCase()
  if (normalized === "delivered") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
  if (normalized === "on delivery") {
    return "bg-sky-500/10 text-sky-700 dark:text-sky-300"
  }
  if (normalized === "rejected" || normalized === "cancelled") {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
  }
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
}

function paymentStatusClasses(status?: string) {
  const normalized = status?.toLowerCase()
  if (
    ["paid", "succeeded", "complete", "completed"].includes(normalized ?? "")
  ) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
  if (
    ["failed", "cancelled", "canceled", "refunded"].includes(normalized ?? "")
  ) {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300"
  }
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
}

export default function RentalsDashboard({ view }: { view: View }) {
  const { data: session } = authClient.useSession()
  const [rentals, setRentals] = useState<RentalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingRentalId, setUpdatingRentalId] = useState<string | null>(null)
  const [deletingRentalId, setDeletingRentalId] = useState<string | null>(null)

  const loadRentals = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError("")

    try {
      const { data } = await authClient.token()
      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }

      const result =
        view === "customer"
          ? await getCustomerRentals(data.token)
          : view === "owner"
            ? await getOwnerRentals(data.token)
            : await getAllRentals(data.token)
      const rows = await Promise.all(
        (Array.isArray(result) ? result : []).map(async (rental) => {
          const equipmentLinkId = getEquipmentId(rental)
          let equipmentName = rental.equipment?.name ?? "Rental equipment"
          let equipmentImage = rental.equipment?.image

          if (equipmentLinkId && !rental.equipment?.name) {
            try {
              const equipment = await getEquipmentById(
                equipmentLinkId,
                data.token
              )
              equipmentName = equipment.name ?? equipmentName
              equipmentImage = equipment.image ?? equipmentImage
            } catch {
              // Keep showing the rental even if its equipment was removed.
            }
          }

          return { ...rental, equipmentLinkId, equipmentName, equipmentImage }
        })
      )
      setRentals(rows)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load rentals."
      )
    } finally {
      setLoading(false)
    }
  }, [session, view])

  async function handleStatusChange(rental: RentalRow, status: RentalStatus) {
    const previousStatus = rental.status
    setUpdatingRentalId(rental._id)
    setRentals((current) =>
      current.map((item) =>
        item._id === rental._id ? { ...item, status } : item
      )
    )

    try {
      const { data } = await authClient.token()
      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }
      await updateRentalStatus(rental._id, status, data.token)
      toast.add({
        title: "Rental status updated",
        description: `Status changed to ${status}.`,
        type: "success",
      })
    } catch (updateError) {
      setRentals((current) =>
        current.map((item) =>
          item._id === rental._id ? { ...item, status: previousStatus } : item
        )
      )
      toast.add({
        title: "Could not update rental status",
        description:
          updateError instanceof Error
            ? updateError.message
            : "Please try again.",
        type: "error",
      })
    } finally {
      setUpdatingRentalId(null)
    }
  }

  async function handleDeleteRental(rental: RentalRow) {
    setDeletingRentalId(rental._id)
    try {
      const { data } = await authClient.token()
      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }

      await deleteAdminRental(rental._id, data.token)
      setRentals((current) => current.filter((item) => item._id !== rental._id))
      toast.add({
        title: "Rental removed",
        description: `${rental.equipmentName} was deleted from all rentals.`,
        type: "success",
      })
    } catch (deleteError) {
      toast.add({
        title: "Could not remove rental",
        description:
          deleteError instanceof Error
            ? deleteError.message
            : "Please try again.",
        type: "error",
      })
    } finally {
      setDeletingRentalId(null)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRentals(), 0)
    return () => window.clearTimeout(timer)
  }, [loadRentals])

  const title =
    view === "customer"
      ? "My Rentals"
      : view === "owner"
        ? "Equipment Rentals"
        : "All Rentals"

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {view === "customer"
            ? "Track your equipment bookings and payment status."
            : view === "owner"
              ? "Review rentals made for your equipment."
              : "Review every equipment rental on RentalSpace."}
        </p>
      </div>

      {loading ? (
        <div
          role="status"
          aria-label="Loading rentals"
          className="overflow-x-auto rounded-2xl border bg-card"
        >
          <table className="w-full min-w-[760px]">
            <tbody>
              {[0, 1, 2, 3, 4].map((row) => (
                <tr key={row} className="border-b last:border-0">
                  {["w-40", "w-24", "w-20", "w-24", "w-24"].map(
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
            onClick={loadRentals}
          >
            <RotateCw className="size-4" aria-hidden="true" /> Try again
          </Button>
        </div>
      ) : rentals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {view === "customer" ? (
              <CalendarDays className="size-6" aria-hidden="true" />
            ) : (
              <Package className="size-6" aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="font-medium">
              {view === "customer"
                ? "No rentals yet"
                : "No equipment rentals yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {view === "customer"
                ? "When you rent equipment, your bookings will appear here."
                : "Rentals for your listed equipment will appear here."}
            </p>
          </div>
          {view === "customer" ? (
            <Link
              href="/equipments"
              className="text-sm font-medium underline underline-offset-4"
            >
              Browse equipment
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Equipment</th>
                {view !== "customer" ? (
                  <th className="px-4 py-3 font-medium">Customer</th>
                ) : null}
                {view === "admin" ? (
                  <th className="px-4 py-3 font-medium">Owner</th>
                ) : null}
                <th className="px-4 py-3 font-medium">Booked</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment status</th>
                <th className="px-4 py-3 font-medium">
                  {view === "owner" ? "Update status" : "Status"}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  {view === "admin" ? "Actions" : "View"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rentals.map((rental) => (
                <tr key={rental._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                        {rental.equipmentImage ? (
                          <Image
                            src={rental.equipmentImage}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <Package className="size-5" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-56 truncate font-medium">
                          {rental.equipmentName}
                        </p>
                      </div>
                    </div>
                  </td>
                  {view !== "customer" ? (
                    <td className="px-4 py-3">{rental.userEmail ?? "—"}</td>
                  ) : null}
                  {view === "admin" ? (
                    <td className="px-4 py-3">{rental.ownerEmail ?? "—"}</td>
                  ) : null}
                  <td className="px-4 py-3">
                    {formatDate(rental.checkoutDate)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(rental.totalPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${paymentStatusClasses(rental.paymentStatus)}`}
                    >
                      {rental.paymentStatus || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {view === "owner" ? (
                      <Select
                        value={
                          rentalStatuses.includes(
                            (rental.status?.toLowerCase() ??
                              "pending") as RentalStatus
                          )
                            ? (rental.status?.toLowerCase() ?? "pending")
                            : "pending"
                        }
                        disabled={updatingRentalId === rental._id}
                        onValueChange={(status) =>
                          status &&
                          handleStatusChange(rental, status as RentalStatus)
                        }
                      >
                        <SelectTrigger
                          aria-label={`Update status for ${rental.equipmentName}`}
                          className={`w-36 capitalize ${rentalStatusClasses(rental.status)}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rentalStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${rentalStatusClasses(rental.status)}`}
                      >
                        {rental.status ?? "Pending"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {rental.equipmentLinkId ? (
                        <Link
                          href={`/equipments/${rental.equipmentLinkId}`}
                          aria-label={`View ${rental.equipmentName}`}
                          title="View equipment"
                          className="inline-flex size-9 items-center justify-center rounded-full border transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        >
                          <Eye className="size-4" aria-hidden="true" />
                        </Link>
                      ) : null}
                      {view === "admin" ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          aria-label={`Delete rental for ${rental.equipmentName}`}
                          title="Delete rental"
                          disabled={deletingRentalId === rental._id}
                          onClick={() => void handleDeleteRental(rental)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      ) : null}
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
