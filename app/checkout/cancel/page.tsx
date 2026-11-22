import Link from "next/link"
import { ArrowLeft, RotateCcw, X } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CheckoutCancelPage() {
  return (
    <section className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-700 dark:text-rose-300">
          <X className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          Checkout canceled
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Your payment wasn’t completed. You can return to equipment and try
          again whenever you’re ready.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/equipments"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 w-full rounded-full px-6 sm:w-auto"
            )}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Return to equipment
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 w-full rounded-full px-6 sm:w-auto"
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
    </section>
  )
}
