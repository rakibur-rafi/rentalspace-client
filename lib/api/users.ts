const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type UserRole = "customer" | "owner" | "admin"

export type AdminUser = {
  _id: string
  name: string
  email: string
  role: UserRole
  image?: string | null
}

export const getUsers = async (token: string): Promise<AdminUser[]> => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!res.ok) throw new Error("Could not load users.")
  return res.json()
}
