import Navbar from "@/components/navbar/Navbar";
import HeroSection from "@/components/landingpage/HeroSection";
import SearchSitter from "@/components/widgets/searchSitter";
import PetCareHero from "@/components/landingpage/PetCareHero";
import ThreeSectionLayout from "@/components/landingpage/ThreeSectionLayout";
import PetSitterHero from "@/components/landingpage/PetSitterHero";
import Footer from "@/components/landingpage/Footer";

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