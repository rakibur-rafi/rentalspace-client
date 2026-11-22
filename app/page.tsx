import { Hero } from "@/components/Home/Hero"
import CategoriesSection from "@/components/Home/CategoriesSection"
import FeaturedEquipmentSection from "@/components/Home/FeaturedEquipmentSection"
import ReviewsSection from "@/components/Home/ReviewsSection"

export default function Page() {
  return (
    <>
      <Hero />
      <CategoriesSection />
      <FeaturedEquipmentSection />
      <ReviewsSection />
    </>
  )
}
