const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL


export const updateProfile = async (
  data: Record<string, unknown>,
  token: string
) => {
  const res = await fetch(`${BASE_URL}/users/my-profile`, {
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
