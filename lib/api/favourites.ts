const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type Favourite = {
  _id: string
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

export const getFavourites = async (token: string): Promise<Favourite[]> => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/favourites`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch favorites.")
  }

  return res.json()
}
