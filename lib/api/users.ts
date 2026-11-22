const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type UserRole = "customer" | "owner" | "admin"

export type AdminUser = {
  _id: string
  name: string
  email: string
  role: UserRole
  image?: string | null
}

export type VerifiedOwner = {
  _id?: string
  id?: string
  name: string
  image?: string | null
  role: "owner"
}

export const getUsers = async (token: string): Promise<AdminUser[]> => {
  const res = await fetch(`${BASE_URL}/users/all-users`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!res.ok) throw new Error("Could not load users.")
  return res.json()
}

export const getVerifiedOwners = async (): Promise<VerifiedOwner[]> => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/users/verified-owners`, {
    cache: "no-store",
  })

  if (!res.ok) throw new Error("Could not load verified owners.")
  return res.json()
}
