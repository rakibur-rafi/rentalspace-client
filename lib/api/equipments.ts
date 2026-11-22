import type { EquipmentCardData } from "@/components/Equipments/EquipmentCard"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

type EquipmentFilters = {
  category?: string
  location?: string
  rentalType?: string
  condition?: string
  brand?: string
  search?: string
  searchBy?: string
  minPrice?: string
  maxPrice?: string
  availability?: string
  sort?: string
  status?: string
}

export const getEquipments = async (filters: EquipmentFilters = {}) => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value)
    }
  })

  const query = params.toString()
  const res = await fetch(`${BASE_URL}/equipments${query ? `?${query}` : ""}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch equipments")
  }

  return res.json()
}

export const getFeaturedEquipments = async (): Promise<EquipmentCardData[]> => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/equipments/featured`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch featured equipment.")
  }

  return res.json()
}

export const getEquipmentById = async (id: string, token: string) => {
  const res = await fetch(`${BASE_URL}/equipments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch equipment")
  }

  return res.json()
}

export const getOwnerEquipments = async (email: string, token: string) => {
  const res = await fetch(`${BASE_URL}/equipments/my-equipments/${email}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch equipments")
  }

  return res.json()
}
