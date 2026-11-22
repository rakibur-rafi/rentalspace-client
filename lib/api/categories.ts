const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL

type CategoryRecord =
  | string
  | {
      _id?: string
      name?: string
      category?: string
      title?: string
      label?: string
      value?: string
      image?: string | null
    }

export type Category = {
  name: string
  image?: string | null
}

export const getCategoryRecords = async (): Promise<Category[]> => {
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

  return result.flatMap((item) => {
    if (typeof item === "string") {
      return item.trim() ? [{ name: item.trim() }] : []
    }

    const name =
      item.name ?? item.category ?? item.title ?? item.label ?? item.value
    return name?.trim() ? [{ name: name.trim(), image: item.image }] : []
  })
}

export const getCategories = async (): Promise<string[]> => {
  const categories = await getCategoryRecords()
  return categories.map((category) => category.name)
}
