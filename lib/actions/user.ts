import type { UserRole } from "@/lib/api/users"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export const updateUserRole = async (
  id: string,
  role: UserRole,
  token: string
) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message ?? "Could not update user role.")
  }

  return res.json()
}
