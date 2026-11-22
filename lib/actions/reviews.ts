const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type CreateReviewPayload = {
  userName: string
  userEmail: string
  review: string
  date: string
  rating: number
}

export const createReview = async (
  data: CreateReviewPayload,
  token: string
) => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const result = await res.json().catch(() => null)
    throw new Error(result?.message ?? "Could not submit your review.")
  }

  return res.json()
}
