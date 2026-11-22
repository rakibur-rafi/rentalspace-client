const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

type CategoryRecord =
  | string
  | {
      name?: string
      category?: string
      title?: string
      label?: string
      value?: string
    }

export const getCategories = async (): Promise<string[]> => {
  if (!BASE_URL) {
    throw new Error("The backend API URL is not configured.")
  }

  const res = await fetch(`${BASE_URL}/categories`, { cache: "no-store" })

  if (!res.ok) {
    throw new Error("Failed to fetch categories.")
  }

  const result: CategoryRecord[] = await res.json()

  if (!Array.isArray(result)) {
    return []
  }

  return result
    .map((item) => {
      if (typeof item === "string") return item
      return (
        item.name ?? item.category ?? item.title ?? item.label ?? item.value
      )
    })
    .filter((category): category is string => Boolean(category?.trim()))
}
