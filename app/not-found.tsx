import Link from "next/link"
import { ArrowLeft, Compass } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function NotFound() {
  const session = await auth.api.getSession({
    headers: await headers() 
  })
  const user = session?.user

  return (
    <section className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-[2rem] border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full border bg-muted text-muted-foreground">
          <Compass className="size-6" aria-hidden="true" />
        </span>

        <p className="mt-6 text-5xl font-semibold tracking-tighter">404</p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          This page is missing
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          The link may be broken or the page may have moved. Head back home and
          keep browsing the gear.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 w-full rounded-full px-6 sm:w-auto"
            )}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
          {
            user ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full rounded-full px-6 sm:w-auto"
                )}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full rounded-full px-6 sm:w-auto"
                )}
              >
                Sign in
              </Link>
            )
          }
        </div>
      </div>
    </section>
  )
}
