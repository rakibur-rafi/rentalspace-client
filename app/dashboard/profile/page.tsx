"use client"

import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import Image from "next/image"
import {
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
  X,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { updateProfile } from "@/lib/actions/profile"
import { getProfile } from "@/lib/api/profile"
import { authClient } from "@/lib/auth-client"

type Profile = {
  _id?: string
  name?: string
  email?: string
  image?: string | null
  role?: string
  phone?: string
  address?: string
  dateOfBirth?: string
}

const textareaClassName =
  "min-h-24 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

function getInitials(name?: string | null) {
  if (!name) return "U"

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function capitalize(value?: string) {
  if (!value) return "Member"

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function roleClasses(role?: string) {
  if (role?.toLowerCase() === "admin") {
    return "bg-violet-500/10 text-violet-700 dark:text-violet-300"
  }
  if (role?.toLowerCase() === "owner") {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  }
  return "bg-sky-500/10 text-sky-700 dark:text-sky-300"
}

function formatDate(value?: string) {
  if (!value) return "Not set"

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function toDateInputValue(value?: string) {
  if (!value) return ""

  return value.slice(0, 10)
}

function InfoItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon
  label: string
  value?: string
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium break-words">
        {value || "Not set"}
      </dd>
    </div>
  )
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

export default function ProfilePage() {
  const { data: session } = authClient.useSession()
  const email = session?.user.email

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!email) return

    let active = true

    async function load() {
      setLoading(true)
      setError("")

      try {
        const { data } = await authClient.token()
        const token = data?.token

        if (!token) {
          throw new Error("Missing token")
        }

        const result = await getProfile(token)

        if (active) {
          setProfile(result)
        }
      } catch {
        if (active) {
          setError("Could not load your profile.")
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
  }, [email, reloadKey])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const updates = {
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
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
      await updateProfile(updates, data.token)
      setProfile((current) => ({ ...(current ?? {}), ...updates }))
      setEditing(false)
      toast.add({
        title: "Profile updated",
        description: "Your changes have been saved.",
        type: "success",
      })
    } catch {
      toast.add({
        title: "Something went wrong",
        description: "Your profile could not be updated.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information.
          </p>
        </div>
        {!loading && !error ? (
          <Button
            type="button"
            className="h-10 rounded-full px-5"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Edit profile
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {loading ? (
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-4">
              <div className="size-16 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="grid gap-4 border-t pt-6 sm:grid-cols-2">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-12 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              {profile?.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name ?? "Profile image"}
                  width={64}
                  height={64}
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-16 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {getInitials(profile?.name ?? session?.user.name)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold tracking-tight">
                  {profile?.name || "Unnamed user"}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {profile?.email ?? email}
                </p>
              </div>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${roleClasses(profile?.role ?? session?.user.role)}`}
              >
                {capitalize(profile?.role ?? session?.user.role)}
              </span>
            </div>

            <dl className="mt-6 grid gap-6 border-t pt-6 sm:grid-cols-2">
              <InfoItem icon={Phone} label="Phone" value={profile?.phone} />
              <InfoItem
                icon={CalendarDays}
                label="Date of birth"
                value={
                  profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : ""
                }
              />
              <InfoItem
                icon={MapPin}
                label="Address"
                value={profile?.address}
                className="sm:col-span-2"
              />
              <InfoItem
                icon={User}
                label="Account email"
                value={profile?.email ?? email}
                className="sm:col-span-2"
              />
            </dl>
          </div>
        )}
      </div>

      {editing ? (
        <Modal
          title="Edit profile"
          description="Update your personal details."
          onClose={() => setEditing(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                name="name"
                defaultValue={profile?.name ?? ""}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="+1 555 000 1234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-dateOfBirth">Date of birth</Label>
                <Input
                  id="profile-dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  defaultValue={toDateInputValue(profile?.dateOfBirth)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-address">Address</Label>
              <textarea
                id="profile-address"
                name="address"
                className={textareaClassName}
                defaultValue={profile?.address ?? ""}
                placeholder="Street, city, country"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full px-5"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </section>
  )
}
