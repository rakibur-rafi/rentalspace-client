"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { updateUserRole } from "@/lib/actions/user"
import { getUsers, type AdminUser, type UserRole } from "@/lib/api/users"
import { authClient } from "@/lib/auth-client"
import Image from "next/image"

const roles: UserRole[] = ["customer", "owner", "admin"]

function getInitials(name?: string) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  )
}

export default function AdminUsersPage() {
  const { data: session } = authClient.useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await authClient.token()
      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }
      const result = await getUsers(data.token)
      setUsers(Array.isArray(result) ? result : [])
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load users."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    let active = true

    async function load() {
      try {
        const { data } = await authClient.token()
        if (!data?.token) {
          throw new Error("Your session expired. Please sign in again.")
        }
        const result = await getUsers(data.token)
        if (active) setUsers(Array.isArray(result) ? result : [])
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load users."
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
  }, [session])

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return users
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(normalizedQuery) ||
        user.email?.toLowerCase().includes(normalizedQuery)
    )
  }, [query, users])

  async function handleRoleChange(user: AdminUser, role: UserRole) {
    if (user.role === role) return
    setUpdatingId(user._id)
    try {
      const { data } = await authClient.token()
      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }
      await updateUserRole(user._id, role, data.token)
      setUsers((current) =>
        current.map((item) =>
          item._id === user._id ? { ...item, role } : item
        )
      )
      toast.add({
        title: "Role updated",
        description: `${user.name || user.email} is now ${role}.`,
        type: "success",
      })
    } catch (updateError) {
      toast.add({
        title: "Could not update role",
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
            All users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage account roles across RentalSpace.
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
            placeholder="Search name or email"
            aria-label="Search users"
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium">User directory</p>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading users…" : `${users.length} total users`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5" aria-label="Loading users">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={loadUsers}>
              Try again
            </Button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-muted-foreground">
            {users.length ? "No users match that search." : "No users found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 text-left font-medium">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt=""
                            width={10}
                            height={10}
                            className="size-10 rounded-full border object-cover"
                          />
                        ) : (
                          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            {getInitials(user.name)}
                          </span>
                        )}
                        <span className="font-medium">
                          {user.name || "Unnamed user"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-5 py-3">
                      <Select
                        value={user.role}
                        disabled={updatingId === user._id}
                        onValueChange={(role) =>
                          role &&
                          void handleRoleChange(user, role as UserRole)
                        }
                      >
                        <SelectTrigger
                          aria-label={`Role for ${user.name || user.email}`}
                          className="w-32"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
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
