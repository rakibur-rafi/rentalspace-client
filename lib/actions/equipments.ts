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
