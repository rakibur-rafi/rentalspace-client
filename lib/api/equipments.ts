const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export const getOwnerEquipments = async (email: string, token: string) => {
  const res = await fetch(`${BASE_URL}/equipments/my-equipments/${email}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })

  if (!res.ok) {
    throw new Error("Failed to fetch equipments")
  }

  return res.json()
}
