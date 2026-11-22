"use client"

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Eye,
  ImageIcon,
  Package,
  Pencil,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { deleteEquipments, updateEquipments } from "@/lib/actions/equipments"
import { uploadImage } from "@/lib/actions/image"
import { getOwnerEquipments } from "@/lib/api/equipments"
import { authClient } from "@/lib/auth-client"

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
  status: string
}

const categories = [
  "Power Tools",
  "Heavy Equipment",
  "Lawn & Garden",
  "Construction",
  "Event & Party",
  "Cleaning",
  "Automotive",
]

const conditions = ["New", "Excellent", "Good", "Fair"]

const rentalTypes = ["daily", "weekly", "monthly"]

const textareaClassName =
  "min-h-24 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(value || 0)
}

function capitalize(value?: string) {
  if (!value) return "—"

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function statusClasses(status?: string) {
  if (status === "approved") {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  }

  if (status === "rejected") {
    return "bg-destructive/10 text-destructive"
  }

  return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
}

function Modal({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 shadow-lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

export default function MyEquipmentPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const email = session?.user.email

  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [deleting, setDeleting] = useState<Equipment | null>(null)
  const [editImage, setEditImage] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!email) return

    const ownerEmail = email
    let active = true

    async function load() {
      try {
        const { data } = await authClient.token()
        const token = data?.token

        if (!token) {
          throw new Error("Missing token")
        }

        const result = await getOwnerEquipments(ownerEmail, token)

        if (active) {
          setEquipments(Array.isArray(result) ? result : [])
        }
      } catch {
        if (active) {
          setError("Could not load your equipment.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [email])

  function openEdit(equipment: Equipment) {
    setEditImage(equipment.image ?? "")
    setEditing(equipment)
  }

  function openDelete(equipment: Equipment) {
    console.log("Delete equipment:", equipment)
    setDeleting(equipment)
  }

  async function handleEditImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setUploading(true)

    try {
      const url = await uploadImage(file)
      setEditImage(url)
      toast.add({
        title: "Image uploaded",
        description: "The new image is ready.",
        type: "success",
      })
    } catch {
      toast.add({
        title: "Image upload failed",
        description: "Please try a different image.",
        type: "error",
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editing) return

    const formData = new FormData(event.currentTarget)
    const updates = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      category: String(formData.get("category") ?? ""),
      location: String(formData.get("location") ?? ""),
      rentalPrice: Number(formData.get("rentalPrice")),
      rentalType: String(formData.get("rentalType") ?? ""),
      availableQuantity: Number(formData.get("availableQuantity")),
      condition: String(formData.get("condition") ?? ""),
      brand: String(formData.get("brand") ?? ""),
      model: String(formData.get("model") ?? ""),
      image: editImage,
      rentalTerms: String(formData.get("rentalTerms") ?? ""),
    }

    const { data } = await authClient.token()

    if (!data?.token) {
      toast.add({
        title: "Something went wrong",
        description: "Please sign in again and retry.",
        type: "error",
      })
      return
    }

    setSaving(true)

    try {
      await updateEquipments(editing._id, updates, data.token)
      setEquipments((items) =>
        items.map((item) =>
          item._id === editing._id ? { ...item, ...updates } : item
        )
      )
      setEditing(null)
      toast.add({
        title: "Equipment updated",
        description: "Your changes have been saved.",
        type: "success",
      })
    } catch {
      toast.add({
        title: "Something went wrong",
        description: "The equipment could not be updated.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return

    const { data } = await authClient.token()

    if (!data?.token) {
      toast.add({
        title: "Something went wrong",
        description: "Please sign in again and retry.",
        type: "error",
      })
      return
    }

    setDeleting(null)

    try {
      await deleteEquipments(deleting._id, data.token)
      setEquipments((items) =>
        items.filter((item) => item._id !== deleting._id)
      )
      toast.add({
        title: "Equipment deleted",
        description: "The listing has been removed.",
        type: "success",
      })
    } catch {
      toast.add({
        title: "Something went wrong",
        description: "The equipment could not be deleted.",
        type: "error",
      })
    }
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Equipment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Listings you have added for rent.
          </p>
        </div>
        <Link
          href="/dashboard/owner/add-equipment"
          className={buttonVariants({ className: "h-10 rounded-full px-5" })}
        >
          <PlusCircle className="size-4" aria-hidden="true" />
          Add equipment
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="h-14 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : error ? (
          <p className="px-5 py-16 text-center text-sm text-muted-foreground">
            {error}
          </p>
        ) : equipments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Package className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-medium">No equipment listed yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first item to start receiving rental requests.
              </p>
            </div>
            <Link
              href="/dashboard/owner/add-equipment"
              className="text-sm font-medium text-primary hover:underline"
            >
              Add equipment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Equipment</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Rental type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {equipments.map((equipment) => (
                  <tr
                    key={equipment._id}
                    className="transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {equipment.image ? (
                          <Image
                            src={equipment.image}
                            alt={equipment.name}
                            width={40}
                            height={40}
                            className="size-10 shrink-0 rounded-lg border object-cover"
                          />
                        ) : (
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                            <ImageIcon className="size-4" aria-hidden="true" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {equipment.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {[equipment.brand, equipment.model]
                              .filter(Boolean)
                              .join(" ") || "No brand or model"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {equipment.category || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(equipment.rentalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      {capitalize(equipment.rentalType)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses(equipment.status)}`}
                      >
                        {capitalize(equipment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`View ${equipment.name}`}
                          onClick={() =>
                            router.push(`/equipments/${equipment._id}`)
                          }
                        >
                          <Eye className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${equipment.name}`}
                          onClick={() => openEdit(equipment)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${equipment.name}`}
                          onClick={() => openDelete(equipment)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing ? (
        <Modal
          title="Edit equipment"
          description="Update the listing details."
          onClose={() => setEditing(null)}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-name">Equipment name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editing.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  id="edit-category"
                  name="category"
                  defaultValue={editing.category}
                  required
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                  {[...new Set([editing.category, ...categories])].map(
                    (category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    )
                  )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  name="location"
                  defaultValue={editing.location}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  name="description"
                  className={textareaClassName}
                  defaultValue={editing.description}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Rental price (BDT)</Label>
                <Input
                  id="edit-price"
                  name="rentalPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={editing.rentalPrice}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-rentalType">Rental type</Label>
                <Select
                  id="edit-rentalType"
                  name="rentalType"
                  defaultValue={
                    rentalTypes.includes(editing.rentalType?.toLowerCase())
                      ? editing.rentalType.toLowerCase()
                      : "daily"
                  }
                  required
                >
                  <SelectTrigger id="edit-rentalType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                  {rentalTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {capitalize(type)}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Available quantity</Label>
                <Input
                  id="edit-quantity"
                  name="availableQuantity"
                  type="number"
                  min={0}
                  defaultValue={editing.availableQuantity}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-condition">Equipment condition</Label>
                <Select
                  id="edit-condition"
                  name="condition"
                  defaultValue={editing.condition}
                  required
                >
                  <SelectTrigger id="edit-condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                  {[...new Set([editing.condition, ...conditions])].map(
                    (condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    )
                  )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-brand">Brand</Label>
                <Input
                  id="edit-brand"
                  name="brand"
                  defaultValue={editing.brand}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  name="model"
                  defaultValue={editing.model}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-image">Equipment image</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleEditImage}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  {uploading
                    ? "Uploading..."
                    : "Choose a new image to replace the current one."}
                </p>
                {editImage ? (
                  <Image
                    src={editImage}
                    alt="Equipment image"
                    width={160}
                    height={160}
                    className="h-32 w-32 rounded-lg border object-cover"
                  />
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-rentalTerms">
                  Rental terms and conditions
                </Label>
                <textarea
                  id="edit-rentalTerms"
                  name="rentalTerms"
                  className={textareaClassName}
                  defaultValue={editing.rentalTerms}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-5"
                disabled={saving || uploading}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {deleting ? (
        <Modal
          title="Delete equipment"
          description="This action cannot be undone."
          onClose={() => setDeleting(null)}
        >
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{deleting.name}</span>
            ?
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full px-5"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </Modal>
      ) : null}
    </section>
  )
}
