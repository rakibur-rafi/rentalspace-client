const BASE_URL= process.env.NEXT_PUBLIC_BASE_API_URL

export const createListing = async (data: Record<string, unknown>, token: string) => {
    
  const res = await fetch(`${BASE_URL}/equipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return res
}