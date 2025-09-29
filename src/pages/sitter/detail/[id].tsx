// import { useRouter } from "next/router";
// import ImageCarousel from "@/components/ImageCarousel";
// import PetSitterProfileCard from "@/components/cards/PetSitterProfileCard";
// import ReviewCard from "@/components/cards/ReviewCard";

// export default function SitterDetailPage() {
//   const router = useRouter();
//   const { id } = router.query;

//   type Sitter = {
//     id: number;
//     title: string;
//     name: string;
//     location: string;
//     experience: string;
//     intro: string;
//     services: string;
//     myplace: string;
//     rating: number;
//     reviews: { id: number; name: string; rating: number; text: string }[];
//   };

//   const mockSitters: Record<string, Sitter> = {
//     "1": {
//       id: 1,
//       title: "Happy House!",
//       name: "Jane Maison",
//       location: "Senenkorn, Bangkok",
//       experience: "2 years",
//       intro:
//         "Hello there! My name is Jane Maison, and I'm your friendly and reliable pet sitter in Senanikom, Bangkok. I am passionate about animals and have dedicated myself to ensuring the well-being and happiness of your furry, feathery, and hoppy companions. With a big heart and a spacious house, I provide a safe and loving environment for cats, dogs, and rabbits while you're away. Let me introduce myself and tell you a bit more about the pet care services I offer",
//       services:
//         "🐱 Cat Sitting: Cats are fascinating creatures, and I take joy in catering to their independent yet affectionate nature. Whether your feline friend needs playtime, cuddles, or just a cozy spot to relax, I ensure they feel right at home.\n\n" +
//         "🐶 Dog Sitting: Dogs are not just pets; they're family. From energetic walks and engaging playtime to soothing belly rubs, I provide a balanced and fun experience for dogs of all sizes and breeds. Safety and happiness are my top priorities.\n\n" +
//         "🐇 Rabbit Sitting: With their adorable antics and gentle personalities, rabbits require a special kind of care. I am well-versed in providing them with a comfortable environment, appropriate diet, and ample playtime to keep them content and hopping with joy.",
//       myplace:
//         "My residence is a spacious house nestled in the serene neighborhood of Senanikom. Your beloved pets will have plenty of room to roam and explore while enjoying a safe and secure environment. I have designated areas for play, relaxation, and sleep, ensuring your pets feel comfortable and at ease throughout their stay.",
//       rating: 4,
//       reviews: [
//         { id: 1, name: "CatLoverX", rating: 5, text: "Great place for my cats!" },
//         { id: 2, name: "Rocky", rating: 4, text: "Nice sitter, friendly and kind." },
//         { id: 3, name: "Mimi", rating: 5, text: "My bunny loved staying here." },
//       ],
//     },
//   };

//   const sitter = id ? mockSitters[String(id)] : null;

//   return (
//     <div>
//       <ImageCarousel />


//       <div className="container-1200 py-8">
//         {sitter ? (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
//             {/* Content */}
//             <div className="lg:col-span-2 space-y-10 min-w-0">
//               <h1 className="text-5xl font-bold">{sitter.title}</h1>

//               <section className="section space-y-3">
//                 <h2 className="text-2xl font-bold">Introduction</h2>
//                 <p className="text-lg whitespace-pre-line">{sitter.intro}</p>
//               </section>

//               <section className="section space-y-3">
//                 <h2 className="text-2xl font-bold">Services</h2>
//                 <p className="text-lg whitespace-pre-line">{sitter.services}</p>
//               </section>

//               <section className="section space-y-3">
//                 <h2 className="text-2xl font-bold">My Place</h2>
//                 <p className="text-lg whitespace-pre-line">{sitter.myplace}</p>
//               </section>

//               <section className="section space-y-3">
//                 <h2 className="text-2xl font-bold">Rating & Reviews</h2>
//                   <ReviewCard
//                   />
//               </section>
//             </div>

//             {/* Sidebar */}
//             <div className="lg:col-span-1 min-w-0">
//               <PetSitterProfileCard
//                 title={sitter.title}
//                 hostName={sitter.name}
//                 experience={sitter.experience}
//                 location={sitter.location}
//                 rating={sitter.rating}
//                 tags={["Dog", "Cat", "Rabbit"]}
//                 avatarUrl="/images/sitters/test1.svg"
//               />
//             </div>

//           </div>
//         ) : (
//           <h1 className="text-2xl font-bold">Sitter not found</h1>
//         )}
//       </div>
//     </div>
//   );
// }
