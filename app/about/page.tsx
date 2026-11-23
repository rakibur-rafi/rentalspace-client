import Link from "next/link"
import { ArrowRight, HeartHandshake, PackageCheck, ShieldCheck } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const values = [
  {
    icon: PackageCheck,
    title: "Make better use of good gear",
    description:
      "Help useful equipment find its next project. Renting gives customers access to the tools they need without buying things they may only use once.",
  },
  {
    icon: HeartHandshake,
    title: "A marketplace built on community",
    description:
      "RentalSpace connects people who need equipment with local owners who are ready to share it, creating more value from every listing.",
  },
  {
    icon: ShieldCheck,
    title: "Clear details, confident choices",
    description:
      "Browse practical listing details, compare rental terms, and reach our team whenever you need help along the way.",
  },
]

export default function AboutPage() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <p className="text-sm font-semibold uppercase text-primary">
            About RentalSpace
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            The right equipment makes every project easier.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            RentalSpace is a place to find and share useful equipment. We make
            it easier for customers to get the gear a project needs and for
            owners to put their equipment to work.
          </p>
          <Link
            href="/equipments"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 gap-2 rounded-full")}
          >
            Explore equipment <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Why we&apos;re here</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Great equipment shouldn&apos;t sit unused, and a project shouldn&apos;t
            have to wait for the right tools. We bring both sides together with
            a simple place to discover, list, and rent equipment.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border bg-card p-6 sm:p-7">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary px-6 py-9 text-primary-foreground sm:px-10 sm:py-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Have equipment to share?</h2>
            <p className="mt-2 max-w-xl text-primary-foreground/80">
              We&apos;d love to hear from you. Get in touch with our team to learn
              how to become an equipment owner on RentalSpace.
            </p>
          </div>
          <Link
            href="/contact-us#owners"
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "shrink-0 gap-2 rounded-full")}
          >
            Become an owner <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
