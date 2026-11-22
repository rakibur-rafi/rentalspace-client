const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type Review = {
  _id?: string
  userName?: string
  userEmail?: string
  review: string
  date: string
  rating: number
}

export const getReviews = async (): Promise<Review[]> => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/reviews`, { cache: "no-store" })

  if (!res.ok) {
    throw new Error("Failed to fetch reviews.")
  }

  return res.json()
}
