"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Package, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { updateEquipmentStatus } from "@/lib/actions/equipments"
import { getEquipments } from "@/lib/api/equipments"
import { authClient } from "@/lib/auth-client"

const equipmentStatuses = ["active", "pending", "rejected", "inactive"] as const
type EquipmentStatus = (typeof equipmentStatuses)[number]

type Equipment = {
  _id: string
  name?: string
  brand?: string
  model?: string
  category?: string
  location?: string
  rentalPrice?: number
  rentalType?: string
  status?: string
  ownerEmail?: string
  image?: string
}

function formatPrice(value?: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(value || 0)
}

function capitalize(value?: string) {
  if (!value) return "—"
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function AdminEquipmentPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const result = await getEquipments()
        if (active) setEquipments(Array.isArray(result) ? result : [])
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load equipment."
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  const filteredEquipments = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return equipments
    return equipments.filter((equipment) =>
      [equipment.name, equipment.brand, equipment.model, equipment.category,
        equipment.location, equipment.ownerEmail]
        .some((value) => value?.toLowerCase().includes(search))
    )
  }, [equipments, query])

  async function handleStatusChange(
    equipment: Equipment,
    status: EquipmentStatus
  ) {
    if (equipment.status === status) return
    setUpdatingId(equipment._id)
    try {
      const { data } = await authClient.token()
      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }
      await updateEquipmentStatus(equipment._id, status, data.token)
      setEquipments((current) =>
        current.map((item) =>
          item._id === equipment._id ? { ...item, status } : item
        )
      )
      toast.add({
        title: "Equipment status updated",
        description: `${equipment.name || "Equipment"} is now ${status}.`,
        type: "success",
      })
    } catch (updateError) {
      toast.add({
        title: "Could not update equipment status",
        description:
          updateError instanceof Error
            ? updateError.message
            : "Please try again.",
        type: "error",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            All equipment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse equipment listings across RentalSpace.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search equipment"
            aria-label="Search equipment"
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">Equipment directory</p>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading equipment…" : `${equipments.length} listings`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5" aria-label="Loading equipment">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="px-5 py-14 text-center text-sm text-destructive">
            {error}
          </p>
        ) : filteredEquipments.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-muted-foreground">
            {equipments.length
              ? "No equipment matches that search."
              : "No equipment listings found."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Equipment</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEquipments.map((equipment) => (
                  <tr key={equipment._id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                          {equipment.image ? (
                            <Image
                              src={equipment.image}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <Package className="size-5" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-56 truncate font-medium">
                            {equipment.name || "Unnamed equipment"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[equipment.brand, equipment.model]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{equipment.category || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {equipment.ownerEmail || "—"}
                    </td>
                    <td className="px-4 py-3">{equipment.location || "—"}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(equipment.rentalPrice)}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        / {capitalize(equipment.rentalType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={equipment.status || "pending"}
                        onValueChange={(status) =>
                          status &&
                          void handleStatusChange(
                            equipment,
                            status as EquipmentStatus
                          )
                        }
                        disabled={updatingId === equipment._id}
                      >
                        <SelectTrigger
                          aria-label={`Status for ${equipment.name || "equipment"}`}
                          className="w-36"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        {equipmentStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {capitalize(status)}
                          </SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
