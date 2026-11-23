"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { BadgeCheck, RotateCw, UsersRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getVerifiedOwners, type VerifiedOwner } from "@/lib/api/users"
import { Reveal } from "@/components/Home/Reveal"

const ownerTones = [
  "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/10 text-amber-700 dark:text-amber-300",
]

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "O"
  )
}

function OwnerCard({ owner, index }: { owner: VerifiedOwner; index: number }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <article className="flex h-full min-h-32 flex-col rounded-2xl border bg-card p-5 shadow-sm shadow-primary/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${ownerTones[index % ownerTones.length]}`}
        >
          {owner.image && !imageFailed ? (
            <Image
              src={owner.image}
              alt={`${owner.name}'s profile`}
              fill
              sizes="64px"
              className="object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="text-lg font-semibold" aria-hidden="true">
              {initials(owner.name)}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <BadgeCheck className="size-3.5" aria-hidden="true" />
          Verified owner
        </span>
      </div>

      <div className="mt-3 flex-1">
        <h3 className="truncate font-semibold tracking-tight">
          {owner.name || "RentalSpace owner"}
        </h3>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <UsersRound className="size-4 text-primary" aria-hidden="true" />
        Local equipment partner
      </div>
    </article>
  )
}

export default function VerifiedOwnersSection() {
  const [owners, setOwners] = useState<VerifiedOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError("")
      try {
        const result = await getVerifiedOwners()
        if (active) setOwners(Array.isArray(result) ? result : [])
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load verified owners."
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    const timer = window.setTimeout(() => void load(), 0)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [retryKey])

  return (
    <section className="bg-muted/30">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              Trusted equipment partners
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Meet our verified owners
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Get to know the owners behind the equipment available on
              RentalSpace.
            </p>
          </div>
        </Reveal>

        {error ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-12 text-center">
            <p
              role="alert"
              className="text-sm text-rose-700 dark:text-rose-300"
            >
              {error}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRetryKey((current) => current + 1)}
            >
              <RotateCw className="size-4" aria-hidden="true" /> Try again
            </Button>
          </div>
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-60 animate-pulse rounded-2xl border bg-card"
              />
            ))}
          </div>
        ) : owners.length ? (
          <Reveal>
            <Carousel
              opts={{ align: "start", loop: owners.length > 4 }}
              aria-label="Verified equipment owners"
            >
              <CarouselContent>
                {owners.map((owner, index) => (
                  <CarouselItem
                    key={owner._id ?? owner.id ?? `${owner.name}-${index}`}
                    className="sm:basis-1/2 lg:basis-1/4"
                  >
                    <OwnerCard owner={owner} index={index} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {owners.length > 1 ? (
                <div className="mt-5 flex justify-end gap-2">
                  <CarouselPrevious className="static inset-auto my-0 size-9 translate-y-0" />
                  <CarouselNext className="static inset-auto my-0 size-9 translate-y-0" />
                </div>
              ) : null}
            </Carousel>
          </Reveal>
        ) : (
          <div className="rounded-2xl border bg-card px-5 py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UsersRound className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-medium">Owner profiles are coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back to meet equipment owners in our community.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
