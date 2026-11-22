import {
  ClipboardCheck,
  CreditCard,
  Search,
  type LucideIcon,
} from "lucide-react"

const steps: {
  number: string
  title: string
  description: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    number: "01",
    title: "Find your equipment",
    description:
      "Browse categories or search for the equipment your project needs.",
    icon: Search,
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  {
    number: "02",
    title: "Choose your rental",
    description:
      "Compare listing details, rental periods, and terms before you decide.",
    icon: ClipboardCheck,
    tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    number: "03",
    title: "Book and pay securely",
    description:
      "Review your rental at checkout and complete your booking online.",
    icon: CreditCard,
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Get the right gear in three simple steps
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Find equipment, choose the rental that suits your plans, and book
            online.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon, tone }) => (
            <article
              key={number}
              className="relative rounded-2xl border bg-card p-5 shadow-sm shadow-primary/5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground/70 tabular-nums">
                  {number}
                </span>
              </div>
              <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
