const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type Rental = {
  _id: string
  equipmentId?: string
  equipmentID?: string | { toString(): string }
  userEmail?: string
  ownerEmail?: string
  quantity?: number
  totalPrice?: number
  unitPrice?: number
  rentalType?: string
  checkoutDate?: string
  status?: string
  phone?: string
  address?: string
  equipment?: {
    name?: string
    image?: string
  }
}

export const getCustomerRentals = async (token: string): Promise<Rental[]> => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/rentals/customer-rentals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch rentals.")
  }

  return res.json()
}

export const getOwnerRentals = async (token: string): Promise<Rental[]> => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/rentals/owner-rentals`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch rentals.")
  }

  return res.json()
}
