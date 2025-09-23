import Navbar from "@/components/navbar/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchSitter from "@/components/widgets/searchSitter";
import PetCareHero from "@/components/PetCareHero";
import ThreeSectionLayout from "@/components/ThreeSectionLayout";
import PetSitterHero from "@/components/PetSitterHero";

export default function Home() {
  return (
    <>
      <div className="container-1200">
        <Navbar />
        <HeroSection />
        <SearchSitter />
        <PetCareHero />
        <ThreeSectionLayout />
        <PetSitterHero />
      </div>
    </>
  );
}