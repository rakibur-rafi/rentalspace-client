"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowRight, MessageSquareQuote, RotateCw, Star } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { createReview } from "@/lib/actions/reviews"
import { getReviews, type Review } from "@/lib/api/reviews"
import { authClient } from "@/lib/auth-client"
import { Reveal } from "@/components/Home/Reveal"

function initials(name?: string) {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "R"
  )
}

function formatDate(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full min-h-64 flex-col rounded-2xl border bg-card p-5 shadow-sm shadow-primary/5 sm:p-6">
      <div
        className="flex items-center gap-1 text-amber-500"
        aria-label={`${review.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={`size-4 ${index < review.rating ? "fill-current" : "text-muted-foreground/30"}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <MessageSquareQuote
        className="mt-5 size-5 text-primary/70"
        aria-hidden="true"
      />
      <p className="mt-3 flex-1 text-sm leading-6 text-foreground/90">
        “{review.review}”
      </p>
      <div className="mt-6 flex items-center gap-3 border-t pt-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials(review.userName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {review.userName || "RentalSpace customer"}
          </p>
        </div>
        {formatDate(review.date) ? (
          <time
            dateTime={review.date}
            className="shrink-0 text-xs text-muted-foreground"
          >
            {formatDate(review.date)}
          </time>
        ) : null}
      </div>
    </article>
  )
}

export default function ReviewsSection() {
  const { data: session, isPending } = authClient.useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryKey, setRetryKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError("")
      try {
        const result = await getReviews()
        if (active) setReviews(Array.isArray(result) ? result : [])
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load customer reviews."
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const user = session?.user
    const text = reviewText.trim()

    if (!user || !text || rating < 1 || rating > 5) return

    setSubmitting(true)
    try {
      const { data } = await authClient.token()
      if (!data?.token) {
        throw new Error("Your session expired. Please sign in again.")
      }

      const payload = {
        userName: user.name || "RentalSpace customer",
        userEmail: user.email,
        review: text,
        date: new Date().toISOString(),
        rating,
      }
      await createReview(payload, data.token)
      setReviews((current) => [payload, ...current])
      setReviewText("")
      setRating(0)
      setDialogOpen(false)
      toast.add({
        title: "Review submitted",
        description: "Thanks for sharing your RentalSpace experience.",
        type: "success",
      })
    } catch (submitError) {
      toast.add({
        title: "Could not submit review",
        description:
          submitError instanceof Error
            ? submitError.message
            : "Please try again.",
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      id="review"
      className="mx-auto w-full max-w-7xl space-y-7 px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            From our community
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Renters share their experience
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Honest feedback from people who found the right gear for their work.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="gap-2 self-start rounded-full px-5 sm:self-auto"
        >
          Give review <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </Reveal>

      {error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-12 text-center">
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
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
              className="h-64 animate-pulse rounded-2xl border bg-muted"
            />
          ))}
        </div>
      ) : reviews.length ? (
        <Reveal>
          <Carousel
            opts={{ align: "start", loop: reviews.length > 4 }}
            aria-label="Customer reviews"
            className="px-1"
          >
            <CarouselContent className="-ml-4">
              {reviews.map((review, index) => (
                <CarouselItem
                  key={
                    review._id ?? `${review.userEmail}-${review.date}-${index}`
                  }
                  className="pl-4 sm:basis-1/2 lg:basis-1/4"
                >
                  <ReviewCard review={review} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {reviews.length > 1 ? (
              <div className="mt-5 flex justify-end gap-2">
                <CarouselPrevious className="static inset-auto my-0 size-9 translate-y-0" />
                <CarouselNext className="static inset-auto my-0 size-9 translate-y-0" />
              </div>
            ) : null}
          </Carousel>
        </Reveal>
      ) : (
        <div className="rounded-2xl border bg-card px-5 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
            <Star className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 font-medium">Be the first to share a review</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell other renters about your RentalSpace experience.
          </p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Give a review</DialogTitle>
            <DialogDescription>
              Share your experience to help other renters choose with
              confidence.
            </DialogDescription>
          </DialogHeader>

          {isPending ? (
            <div className="h-28 animate-pulse rounded-xl bg-muted" />
          ) : session?.user ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <fieldset>
                <legend className="text-sm font-medium">Your rating</legend>
                <div
                  className="mt-2 flex items-center gap-1"
                  role="radiogroup"
                  aria-label="Rating from 1 to 5 stars"
                >
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={rating === value}
                        aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                        onClick={() => setRating(value)}
                        className="rounded-md p-1 text-amber-500 transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Star
                          className={`size-8 ${value <= rating ? "fill-current" : "text-muted-foreground/30"}`}
                          aria-hidden="true"
                        />
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <label
                className="block space-y-2 text-sm font-medium"
                htmlFor="review-text"
              >
                Your review
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder="What went well with your rental?"
                  required
                  className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-normal transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                <span className="block text-right text-xs font-normal text-muted-foreground">
                  {reviewText.length}/1000
                </span>
              </label>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={submitting || rating === 0 || !reviewText.trim()}
                  className="rounded-full px-5"
                >
                  {submitting ? "Submitting…" : "Submit review"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-sm font-medium">Sign in to leave a review</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your name and email will be attached to your review.
              </p>
              <Link
                href="/login"
                onClick={() => setDialogOpen(false)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Log in to RentalSpace
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
