const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

export type MonthlyMetric = Record<string, unknown>

export type OwnerAnalytics = {
  completedRentals: number
  totalEquipment: number
  totalIncome: number
  activeEquipment: number
  mostRented: {
    equipmentID: string
    name: string
    image?: string
    totalRentals: number
  } | null
  monthlySales: MonthlyMetric[]
}

export type AdminAnalytics = {
  platformRevenue: number
  totalBookings: number
  totalUsers: number
  totalEquipment: number
  monthlySales: MonthlyMetric[]
  monthlyUserGrowth: MonthlyMetric[]
}

export type CustomerAnalytics = {
  totalBookings: number
  totalSpent: number
  favouriteItems: number
  onDeliveryRent: number
  pendingRent: number
  deliveredRent: number
}

async function getAnalytics<T>(endpoint: string, token: string): Promise<T> {
  if (!BASE_URL) throw new Error("The backend API URL is not configured.")

  const response = await fetch(`${BASE_URL}/analytics/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint} analytics.`)
  }

  return response.json()
}

export const getOwnerAnalytics = (token: string) =>
  getAnalytics<OwnerAnalytics>("owner", token)

export const getAdminAnalytics = (token: string) =>
  getAnalytics<AdminAnalytics>("admin", token)

export const getCustomerAnalytics = (token: string) =>
  getAnalytics<CustomerAnalytics>("customer", token)
