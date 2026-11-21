"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"

export default function RentNowButton({
  equipmentId,
  availableQuantity,
}: {
  equipmentId: string
  availableQuantity: number
}) {
  const router = useRouter()
  const { data: session } = authClient.useSession()

  function handleRentNow() {
    const checkoutPath = `/checkout/${equipmentId}`

    if (!session) {
      router.push(`/login?returnTo=${encodeURIComponent(checkoutPath)}`)
      return
    }

    if ((session.user.role ?? "").toLowerCase() !== "customer") {
      toast.add({
        title: "Customer account required",
        description: "Only customer accounts can rent equipment.",
        type: "error",
      })
      return
    }

    router.push(checkoutPath)
  }

  return (
    <Button
      type="button"
      className="h-11 w-full rounded-full"
      onClick={handleRentNow}
      disabled={availableQuantity < 1}
    >
      {availableQuantity < 1 ? "Unavailable" : "Rent now"}
    </Button>
  )
}
