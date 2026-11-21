"use client"

import { useState, type ChangeEvent, type FormEvent } from "react"
import Image from "next/image"
import { Camera, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { uploadImage } from "@/lib/actions/image"
import { authClient } from "@/lib/auth-client"
import { createListing } from "@/lib/actions/equipments"
import { useRouter } from "next/navigation"

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

const rentalTypes = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"

const textareaClassName =
  "min-h-28 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"

function getInitials(name?: string | null) {
  if (!name) {
    return "U"
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export default function AddEquipmentPage() {
  const router = useRouter()

  const { data: session } = authClient.useSession()
  const owner = session?.user
  const role = owner?.role

  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setUploading(true)

    try {
      const uploadedUrl = await uploadImage(file)
      setImageUrl(uploadedUrl)
      toast.add({
        title: "Image uploaded",
        description: "The equipment image is ready.",
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!owner) {
      toast.add({
        title: "You are not authorized",
        type: "error",
      })
      return
    }

    if (!imageUrl) {
      toast.add({
        title: "Image required",
        description: "Upload an image of the equipment.",
        type: "error",
      })
      return
    }

    const formData = new FormData(event.currentTarget)
    const { name, description, category, location, price, quantity } =
      Object.fromEntries(formData) as {
        name: string
        description: string
        category: string
        location: string
        price: string
        quantity: string
      }

    const equipment = {
      name,
      description,
      category,
      location,
      rentalPrice: Number(price),
      rentalType: formData.get("rentalType"),
      availableQuantity: Number(quantity),
      condition: formData.get("condition"),
      brand: formData.get("brand"),
      model: formData.get("model"),
      image: imageUrl,
      rentalTerms: formData.get("rentalTerms"),
      status: "pending",
      owner: {
        name: owner.name,
        email: owner.email,
        image: owner.image ?? null,
      },
    }

    const { data, error } = await authClient.token()
    console.log(data)
    const token = data?.token as string
    try {
      const result = await createListing(equipment, token)
      if (!result) {
        toast.add({
          title: "Something went wrong",
          description: "Please try again.",
          type: "error",
        })
        return
      }
      router.push(`/dashboard/${role}`)
      router.refresh()
      toast.add({
        title: "Equipment logged",
        description: "The listing payload is in the console.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Something went wrong",
        description: "Please try again.",
        type: "error",
      })
      return
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Equipment</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          List a new item for rent. New listings stay pending until an admin
          approves them.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-card p-5 sm:p-6"
      >
        <div className="mb-6 flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
          {owner?.image ? (
            <Image
              src={owner.image}
              alt={owner.name ?? "Owner avatar"}
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {owner ? (
                getInitials(owner.name)
              ) : (
                <User className="size-4" aria-hidden="true" />
              )}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Listing as</p>
            <p className="truncate text-sm font-medium">
              {owner ? owner.name : "Loading account..."}
            </p>
            {owner ? (
              <p className="truncate text-xs text-muted-foreground">
                {owner.email}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Equipment name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Cordless drill"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <select
              id="category"
              name="category"
              className={selectClassName}
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description"
              name="description"
              className={textareaClassName}
              placeholder="What is included, how it works, and anything renters should know."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="Area, city"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              Rental price (BDT) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={1}
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rentalType">
              Rental type <span className="text-destructive">*</span>
            </Label>
            <select
              id="rentalType"
              name="rentalType"
              className={selectClassName}
              defaultValue="daily"
              required
            >
              {rentalTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Available quantity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              placeholder="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">
              Equipment condition <span className="text-destructive">*</span>
            </Label>
            <select
              id="condition"
              name="condition"
              className={selectClassName}
              defaultValue=""
              required
            >
              <option value="" disabled>
                Select a condition
              </option>
              {conditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">
              Brand <span className="text-destructive">*</span>
            </Label>
            <Input id="brand" name="brand" placeholder="DeWalt" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">
              Model <span className="text-destructive">*</span>
            </Label>
            <Input id="model" name="model" placeholder="DCD777" required />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="image">
              Equipment image <span className="text-destructive">*</span>
            </Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading ? (
              <p className="text-xs text-muted-foreground">Uploading...</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Choose an image to upload to imgbb.
              </p>
            )}
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Uploaded equipment"
                width={160}
                height={160}
                className="mt-2 h-40 w-40 rounded-lg border object-cover"
              />
            ) : (
              <span className="mt-2 flex size-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                <Camera className="size-6" aria-hidden="true" />
              </span>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="rentalTerms">
              Rental terms and conditions{" "}
              <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="rentalTerms"
              name="rentalTerms"
              className={textareaClassName}
              placeholder="Deposit, late fees, pickup rules, and care instructions."
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t pt-5">
          <Button
            type="submit"
            disabled={uploading}
            className="h-11 rounded-full px-6"
          >
            Add equipment
          </Button>
        </div>
      </form>
    </section>
  )
}
