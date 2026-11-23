"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { ArrowRight, Mail, MessageCircle, PackagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"

const supportEmail = "support@rentalspace.com"

function EmailForm({ owner = false }: { owner?: boolean }) {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get("name") ?? "")
    const email = String(data.get("email") ?? "")
    const subject = String(data.get("subject") ?? (owner ? "Become an equipment owner" : "Contact RentalSpace"))
    const message = String(data.get("message") ?? "")
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`

    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
    form.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Your name
          <input
            required
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Email address
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>
      {owner ? (
        <label className="block space-y-2 text-sm font-medium">
          What equipment would you like to list?
          <input
            name="subject"
            placeholder="Equipment type or listing name"
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      ) : (
        <label className="block space-y-2 text-sm font-medium">
          Subject
          <input
            required
            name="subject"
            placeholder="How can we help?"
            className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      )}
      <label className="block space-y-2 text-sm font-medium">
        Message
        <textarea
          required
          name="message"
          rows={5}
          placeholder={owner ? "Tell us a little about your equipment and location..." : "Write your message..."}
          className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" className="gap-2 rounded-full px-5">
          {owner ? "Send owner inquiry" : "Send message"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <p className="text-xs text-muted-foreground">
          Your email app will open with your message ready to send.
        </p>
      </div>
      {submitted ? (
        <p role="status" className="text-sm text-primary">
          Your email app should be ready. Send the message there to reach our team.
        </p>
      ) : null}
    </form>
  )
}

export default function ContactUsPage() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase  text-primary">
            Contact RentalSpace
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            We&apos;re here to help.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Questions about finding equipment, a rental, or your account? Send
            our team a message and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="space-y-7">
          <div>
            <h2 className="text-xl font-semibold">Talk to our team</h2>
            <p className="mt-2 max-w-md leading-7 text-muted-foreground">
              Tell us what you need help with. We welcome messages from
              customers, renters, and equipment owners.
            </p>
          </div>
          <a
            href={`mailto:${supportEmail}`}
            className="inline-flex items-center gap-3 text-sm font-medium hover:text-primary"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-5" aria-hidden="true" />
            </span>
            {supportEmail}
          </a>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MessageCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <p>For rental or listing questions, include any relevant details so we can help faster.</p>
          </div>
        </aside>

        <div className="rounded-2xl border bg-card p-5 sm:p-8">
          <h2 className="mb-6 text-xl font-semibold">Send us a message</h2>
          <EmailForm />
        </div>
      </section>

      <section id="owners" className="scroll-mt-24 border-t bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="self-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <PackagePlus className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-semibold uppercase text-primary-foreground/75">
              For equipment owners
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Want to become an owner?
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-primary-foreground/80">
              Have equipment you&apos;d like to rent out? Mail us using the form
              and tell us what you have. Our team will help you get started on
              RentalSpace.
            </p>
            <a
              href={`mailto:${supportEmail}?subject=${encodeURIComponent("Become an equipment owner")}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
            >
              Or email us directly <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <div className="rounded-2xl bg-background p-5 text-foreground sm:p-8">
            <h3 className="mb-6 text-xl font-semibold">Owner inquiry</h3>
            <EmailForm owner />
          </div>
        </div>
      </section>
    </main>
  )
}
