const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type CheckoutPayload = {
  equipmentId: string
  quantity: number
  phone: string
  address: string
  totalPrice: number
  rentalType: string
  rentStartDate: string
  rentEndDate: string
  checkoutDate: string
}

type CheckoutSessionResponse = {
  url?: string
  error?: string
}

export const createCheckoutSession = async (
  data: CheckoutPayload,
  token: string
) => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/checkout/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  const result: CheckoutSessionResponse = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(result.error ?? "Could not start checkout.")
  }

  if (!result.url) {
    throw new Error("The checkout session did not return a payment URL.")
  }

  return { url: result.url }
}
