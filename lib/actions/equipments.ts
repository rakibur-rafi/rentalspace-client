const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export const createListing = async (
  data: Record<string, unknown>,
  token: string
) => {
  const res = await fetch(`${BASE_URL}/equipments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return res
}

export const updateEquipments = async (
  id: string,
  data: Record<string, unknown>,
  token: string
) => {
  const res = await fetch(`${BASE_URL}/equipments/my-equipments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to fetch equipments")
  }

  return res.json()
}

export const updateEquipmentStatus = async (
  id: string,
  status: "active" | "pending" | "rejected" | "inactive",
  token: string
) => {
  const res = await fetch(`${BASE_URL}/equipments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    const result = await res.json().catch(() => null)
    throw new Error(result?.message || "Failed to update equipment status")
  }

  return res.json()
}

export const deleteEquipments = async (id: string, token: string) => {
  const res = await fetch(`${BASE_URL}/equipments/my-equipments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch equipments")
  }

  return res.json()
}

export const deleteAdminEquipment = async (id: string, token: string) => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/equipments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const result = await res.json().catch(() => null)
    throw new Error(result?.message ?? "Failed to remove equipment.")
  }

  return res.json()
}
