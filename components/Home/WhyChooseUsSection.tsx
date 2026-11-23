import {
  BadgeCheck,
  CalendarRange,
  CircleDollarSign,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import { Reveal } from "@/components/Home/Reveal"

const benefits: {
  title: string
  description: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    title: "Fair rental prices",
    description:
      "Compare equipment and rental terms, then choose what fits your project and budget.",
    icon: CircleDollarSign,
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    title: "Verified equipment owners",
    description:
      "Find gear from owners and listings reviewed by RentalSpace before they go live.",
    icon: BadgeCheck,
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    title: "Flexible rental periods",
    description:
      "Choose daily, weekly, or monthly rentals to match the schedule of your work.",
    icon: CalendarRange,
    tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    title: "Secure payments",
    description:
      "Complete your booking through secure online checkout and keep your rental details together.",
    icon: ShieldCheck,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
]

export default function WhyChooseUsSection() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">Why RentalSpace</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            A simpler way to get the gear you need
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            From choosing equipment to completing your booking, we make renting
            clearer and more convenient.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ title, description, icon: Icon, tone }, index) => (
            <Reveal key={title} delay={index * 0.07}>
              <article className="h-full rounded-2xl border bg-card p-5 shadow-sm shadow-primary/5 sm:p-6">
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
