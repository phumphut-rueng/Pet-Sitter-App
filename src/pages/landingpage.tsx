import Navbar from "@/components/navbar/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchSitter from "@/components/widgets/searchSitter";
import PetCareHero from "@/components/PetCareHero";
import ThreeSectionLayout from "@/components/ThreeSectionLayout";
import PetSitterHero from "@/components/PetSitterHero";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <>
      <div className="container-1200">
        <Navbar />
        <HeroSection />
        <SearchSitter />
        <PetCareHero />
        <ThreeSectionLayout />
        <PetSitterHero />
        <Footer />
      </div>
    </>
  );
}