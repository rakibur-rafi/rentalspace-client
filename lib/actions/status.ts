const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type RentalStatus = "pending" | "on delivery" | "delivered"

export const updateRentalStatus = async (
  rentalId: string,
  status: RentalStatus,
  token: string
) => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }
  console.log(rentalId)

  const res = await fetch(`${BASE_URL}/rentals/owner-rentals/${rentalId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })

  const result = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(result?.message ?? "Failed to update rental status.")
  }

  return result
}
