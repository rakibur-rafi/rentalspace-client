const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type FavouritePayload = {
  customerEmail: string
  equipmentId: string
  name: string
  image?: string
  category: string
  location: string
  rentalPrice: number
  rentalType: string
  condition: string
  brand?: string
  model?: string
}

export const createFavourite = async (
  data: FavouritePayload,
  token: string
) => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/favourites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const result = await res.json().catch(() => null)
    throw new Error(
      result?.message ?? "Could not save this equipment to your favorites."
    )
  }

  return res.json()
}

export const deleteFavourite = async (id: string, token: string) => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/favourites/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const result = await res.json().catch(() => null)
    throw new Error(result?.message ?? "Could not remove this favorite.")
  }

  return res.json()
}
