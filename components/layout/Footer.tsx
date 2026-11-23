import Link from "next/link"
import {
  ArrowRight,
  Clock3,
  CreditCard,
  Headset,
  RouteArrowRight,
  ShieldCheck,
} from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const footerGroups = [
  {
    title: "Browse",
    links: [
      { label: "All equipment", href: "/equipments" },
      { label: "About RentalSpace", href: "/about" },
      { label: "Contact us", href: "/contact-us" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "My profile", href: "/dashboard/profile" },
      { label: "My favorites", href: "/dashboard/customer/favorites" },
    ],
  },
  {
    title: "For equipment owners",
    links: [
      { label: "Become an owner", href: "/contact-us#owners" },
    ],
  },
]

const trustPoints = [
  { label: "Reviewed listings", icon: ShieldCheck },
  { label: "Flexible rental periods", icon: Clock3 },
  { label: "Secure online checkout", icon: CreditCard },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 pb-6 sm:px-6 ">

        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-12">
          <div className="space-y-4">
             <Link
          href="/"
          className="flex items-center"
        >
        <RouteArrowRight className="size-5" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tighter">
            RentalSpace
          </span>
        </Link>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              Find useful equipment for the job, rent on your schedule, and get
              more from the gear around you.
            </p>
            <div className="flex flex-wrap gap-2">
              {trustPoints.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1.5 text-xs text-muted-foreground"
                >
                  <Icon className="size-3.5 text-primary" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="text-sm font-semibold">Need a hand?</h3>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Have a question about finding equipment or managing a listing?
              We&apos;re here to help.
            </p>
            <a
              href="mailto:support@rentalspace.com?subject=RentalSpace%20support"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Headset className="size-4" aria-hidden="true" />
              Contact support
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RentalSpace. All rights reserved.</p>
          <p>Made for projects big and small.</p>
        </div>
      </div>
    </footer>
  )
}
