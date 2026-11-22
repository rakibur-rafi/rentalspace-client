import { Hero } from "@/components/Home/Hero"
import CategoriesSection from "@/components/Home/CategoriesSection"
import FeaturedEquipmentSection from "@/components/Home/FeaturedEquipmentSection"
import ReviewsSection from "@/components/Home/ReviewsSection"
import WhyChooseUsSection from "@/components/Home/WhyChooseUsSection"
import HowItWorksSection from "@/components/Home/HowItWorksSection"
import VerifiedOwnersSection from "@/components/Home/VerifiedOwnersSection"

export default function Page() {
  return (
    <>
      <Hero />
      <WhyChooseUsSection />
      <FeaturedEquipmentSection />
      <HowItWorksSection />
      <CategoriesSection />
      <ReviewsSection />
      <VerifiedOwnersSection />
    </>
  )
}
