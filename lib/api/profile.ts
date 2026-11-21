const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export const getProfile = async (token: string) => {
  const res = await fetch(`${BASE_URL}/users/my-profile`, {
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
