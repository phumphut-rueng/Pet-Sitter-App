import Navbar from "@/components/navbar/Navbar";
import HeroSection from "@/components/landingpage/HeroSection";
import SearchSitter from "@/components/widgets/SearchSitter";
import PetCareHero from "@/components/landingpage/PetCareHero";
import ThreeSectionLayout from "@/components/landingpage/ThreeSectionLayout";
import PetSitterHero from "@/components/landingpage/PetSitterHero";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <>
    <div className="min-h-screen bg-white">
    <Navbar />
      <div className="container-1200">
        <HeroSection />
        <SearchSitter />
        <PetCareHero />
        <ThreeSectionLayout />
        <PetSitterHero />
      </div>
      <Footer />
    </div>
    </>
  );
}