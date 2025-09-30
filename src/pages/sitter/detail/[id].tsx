import { useRouter } from "next/router";
import ImageCarousel from "@/components/ImageCarousel";
import PetSitterProfileCard from "@/components/cards/PetSitterProfileCard";
import ReviewCard from "@/components/cards/ReviewCard";
import RatingSelect from "@/components/ratingStar";

export default function SitterDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  type Sitter = {
    id: number;
    title: string;
    name: string;
    location: string;
    experience: string;
    intro: string;
    services: string;
    myplace: string;
    rating: number;
    reviews: { id: number; name: string; rating: number; text: string }[];
  };

  const mockSitters: Record<string, Sitter> = {
    "1": {
      id: 1,
      title: "Happy House!",
      name: "Jane Maison",
      location: "Senenkorn, Bangkok",
      experience: "2 years",
      intro:
        "Hello there! My name is Jane Maison, and I'm your friendly and reliable pet sitter in Senanikom, Bangkok. I am passionate about animals and have dedicated myself to ensuring the well-being and happiness of your furry, feathery, and hoppy companions. With a big heart and a spacious house, I provide a safe and loving environment for cats, dogs, and rabbits while you're away. Let me introduce myself and tell you a bit more about the pet care services I offer",
      services:
        "🐱 Cat Sitting: Cats are fascinating creatures, and I take joy in catering to their independent yet affectionate nature. Whether your feline friend needs playtime, cuddles, or just a cozy spot to relax, I ensure they feel right at home.\n\n" +
        "🐶 Dog Sitting: Dogs are not just pets; they're family. From energetic walks and engaging playtime to soothing belly rubs, I provide a balanced and fun experience for dogs of all sizes and breeds. Safety and happiness are my top priorities.\n\n" +
        "🐇 Rabbit Sitting: With their adorable antics and gentle personalities, rabbits require a special kind of care. I am well-versed in providing them with a comfortable environment, appropriate diet, and ample playtime to keep them content and hopping with joy.",
      myplace:
        "My residence is a spacious house nestled in the serene neighborhood of Senanikom. Your beloved pets will have plenty of room to roam and explore while enjoying a safe and secure environment. I have designated areas for play, relaxation, and sleep, ensuring your pets feel comfortable and at ease throughout their stay.",
      rating: 4,
      reviews: [
        {
          id: 1,
          name: "CatLoverX",
          rating: 5,
          text: "Great place for my cats!",
        },
        {
          id: 2,
          name: "Rocky",
          rating: 4,
          text: "Nice sitter, friendly and kind.",
        },
        {
          id: 3,
          name: "Mimi",
          rating: 5,
          text: "My bunny loved staying here.",
        },
      ],
    },
  };

  const sitter = id ? mockSitters[String(id)] : null;

  return (
    <div>
      <ImageCarousel />

      <div className="container-1200 py-8">
        {sitter ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
  {/* Content */}
  <div className="lg:col-span-2 space-y-10 min-w-0 order-1 lg:order-1">
    <h1 className="text-5xl font-bold">{sitter.title}</h1>

    <section className="section space-y-3">
      <h2 className="text-2xl font-bold">Introduction</h2>
      <p className="text-lg whitespace-pre-line">{sitter.intro}</p>
    </section>

    <section className="section space-y-3">
      <h2 className="text-2xl font-bold">Services</h2>
      <p className="text-lg whitespace-pre-line">{sitter.services}</p>
    </section>

    <section className="section space-y-3">
      <h2 className="text-2xl font-bold">My Place</h2>
      <p className="text-lg whitespace-pre-line">{sitter.myplace}</p>
    </section>

    {/* Reviews */}
    <section className="section space-y-3 rounded-2xl rounded-tl-[99px] bg-gray-1 p-6 order-3 lg:order-2">
      <div className="bg-white rounded-2xl rounded-tl-[99px] lg:rounded-bl-[99px] shadow-sm p-4 flex flex-col lg:p-6 lg:flex-row lg:items-start ">
        <div className="w-36 h-36 bg-black rounded-[99px] rounded-br-none flex flex-col items-center justify-center text-white">
          <span className="text-4xl font-bold">4.5</span>
          <span className="text-sm font-medium">27 Reviews</span>
        </div>
        <div className="lg:ml-10 flex-1">
          <h2 className="text-2xl font-bold mb-3">Rating & Reviews</h2>
          <div className="flex flex-wrap gap-2">
            <RatingSelect value="All Reviews"/>
            {Array.from({ length: 5 }).map((_, index) => (
              <RatingSelect key={index} value={5 - index}/>
            ))}
          </div>
        </div>
      </div>
      <ReviewCard />
    </section>
  </div>

  {/* Sidebar / ProfileCard */}
  <div className="order-2 lg:order-3 lg:col-span-1 min-w-0">
    <PetSitterProfileCard
      title={sitter.title}
      hostName={sitter.name}
      experience={sitter.experience}
      location={sitter.location}
      rating={sitter.rating}
      tags={["Dog", "Cat", "Rabbit"]}
      avatarUrl="/images/sitters/test1.svg"
    />
  </div>
</div>

        ) : (
          <h1 className="text-2xl font-bold">Sitter not found</h1>
        )}
      </div>
    </div>
  );
}
