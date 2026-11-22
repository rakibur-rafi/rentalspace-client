import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, BadgeCheck, Star } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const avatars = [
  { src: "/avatars/avatar-1.jpg", alt: "RentalSpace customer" },
  { src: "/avatars/avatar-2.jpg", alt: "RentalSpace customer" },
  { src: "/avatars/avatar-3.jpg", alt: "RentalSpace customer" },
  { src: "/avatars/avatar-4.jpg", alt: "RentalSpace customer" },
]

export function Hero() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="flex min-h-[540px] flex-col justify-between rounded-[2rem] border bg-card p-7 sm:p-10 lg:min-h-[650px] lg:p-12">
            <div>
              <h1 className="text-4xl leading-[0.96] font-semibold tracking-[-0.05em] sm:text-5xl xl:text-6xl">
                <span className="block">Rent the gear.</span>
                <span className="block">Build your next</span>
                <span className="block">big thing.</span>
              </h1>

              <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                From power tools to heavy machinery, find the right equipment
                from trusted local vendors — ready when your project is.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <Link
                  href="/equipments"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 rounded-full px-6"
                  )}
                >
                  Explore equipment
                </Link>
                <Link
                  href="/equipments"
                  aria-label="Explore equipment"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-lg" }),
                    "size-12 rounded-full border-foreground/15"
                  )}
                >
                  <ArrowUpRight className="size-5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-start xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-2xl font-semibold tracking-tight">25,000+</p>
                <p className="mt-1 max-w-52 text-xs leading-5 text-muted-foreground">
                  rentals completed by customers who found the right gear for
                  the job.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {avatars.map((avatar) => (
                    <Image
                      key={avatar.src}
                      src={avatar.src}
                      alt={avatar.alt}
                      width={40}
                      height={40}
                      className="size-9 rounded-full border-2 border-card object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className="size-3 fill-current"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Loved by renters
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[480px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-zinc-200 via-zinc-100 to-sky-200 lg:min-h-[650px]">
            <Image
              src="/images/rentalspace-hero.jpg"
              alt="Construction professional wearing safety gear"
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-[50%_22%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/25 via-transparent to-transparent" />
            <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
              <BadgeCheck
                className="size-3.5 text-emerald-600"
                aria-hidden="true"
              />
              Verified local vendors
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
