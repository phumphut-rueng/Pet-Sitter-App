import * as React from "react";
import { PetSitterCard, PetSitterCardLarge, PetSitterCardSmall } from "@/components/cards/PetSitterCard";
import BookingCard from "@/components/cards/BookingCard";
import PetCard from "@/components/cards/PetCard";


const COVER = "/images/cards/pet-sitter-cover.svg";
const AVATAR = "/images/cards/jane-maison.svg";
const PETIMG = "/images/cards/pet-cat-mr-hem-card.svg";


const Star = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 fill-current ${className}`}>
    <path d="M12 3.75l2.72 5.51 6.08.88-4.4 4.29 1.04 6.07L12 17.77l-5.44 2.85 1.04-6.07-4.4-4.29 6.08-.88L12 3.75z" />
  </svg>
);

function Chip({ label }: { label: string }) {
  const palette: Record<string, string> = {
    Dog: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    Cat: "bg-pink-50 text-pink-600 ring-pink-200",
    Bird: "bg-sky-50 text-sky-600 ring-sky-200",
    Rabbit: "bg-orange-50 text-orange-600 ring-orange-200",
  };
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium ring-1 ring-inset ${palette[label] || "bg-gray-50 text-gray-600 ring-gray-200"}`}>
      {label}
    </span>
  );
}


const pets = [
  { id: 1, name: "Mr. Ham", selected: false },
  { id: 2, name: "Mr. Ham", selected: true },
  { id: 3, name: "Mr. Ham", disabled: true },
  { id: 4, name: "Mr. Ham" },
];

function PetCardGrid() {
  return (
    <section className="mt-4">
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {pets.map((p) => (
          <PetCard key={p.id} name={p.name} species="Cat" img={PETIMG} selected={p.selected} disabled={p.disabled} className="!w-full" />
        ))}
      </div>
    </section>
  );
}


const bookingBase = {
  title: "Happy House!",
  sitterName: "Jame Maison",
  avatarUrl: AVATAR,
  dateTime: "25 Aug, 2023 | 7 AM – 10 AM",
  duration: "3 hours",
  pet: "Mr.Ham, Binguo",
  transactionDate: "Tue, 16 Aug 2023",
};

export default function CardsDemoPage() {
  const sitterCommon = {
    title: "Happy House!",
    hostName: "Jame Maison",
    location: "Senanikom, Bangkok",
    coverUrl: COVER,
    avatarUrl: AVATAR,
  };

  return (
    <main className="mx-auto max-w-[1100px] space-y-14 p-6">
  
      <section>
        <h2 className="mb-3 text-lg font-semibold">Pet Card</h2>
        <PetCardGrid />
      </section>

     
      <section>
        <h2 className="mb-3 text-lg font-semibold">Pet Sitter Card – Large</h2>
        <div className="space-y-4 rounded-2xl border border-dashed border-purple-300 p-5">
         
          <div>
            <div className="hidden md:block">
              <PetSitterCardLarge {...sitterCommon} rating={5} tags={["Dog", "Cat", "Rabbit"]} variant="default" />
            </div>
            <div className="md:hidden">
              <PetSitterCard {...sitterCommon} size="sm" variant="chips" rating={5} tags={["Dog", "Cat", "Rabbit"]} />
            </div>
          </div>

         
          <div>
            <div className="hidden md:block">
              <PetSitterCardLarge {...sitterCommon} rating={5} className="border-orange-200" tags={["Dog", "Cat", "Rabbit"]} variant="default" />
            </div>
            <div className="md:hidden">
              <PetSitterCard {...sitterCommon} size="sm" variant="chips" rating={5} tags={["Dog", "Cat", "Rabbit"]} />
            </div>
          </div>

         
          <div className="w-[335px]">
            <PetSitterCard {...sitterCommon} size="sm" variant="default" rating={5} tags={["Dog", "Cat", "Rabbit"]} />
          </div>
        </div>
      </section>

    
      <section>
        <h2 className="mb-3 text-lg font-semibold">Pet Sitter Card – Small</h2>
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-dashed border-purple-300 p-5">
          <PetSitterCardSmall {...sitterCommon} variant="default" rating={5} tags={["Dog", "Cat", "Bird", "Rabbit"]} />
          <PetSitterCardSmall {...sitterCommon} variant="default" rating={5} className="border-orange-200" tags={["Dog", "Cat", "Bird", "Rabbit"]} />
          <PetSitterCardSmall {...sitterCommon} variant="default" rating={5} className="border-orange-200" tags={["Dog", "Cat", "Rabbit"]} />
          <PetSitterCardSmall {...sitterCommon} variant="default" rating={5} className="border-green-200" tags={["Dog", "Cat", "Rabbit"]} />
        </div>
      </section>

   
      <section>
        <h2 className="mb-3 text-lg font-semibold">Booking Card</h2>
        <div className="space-y-4 rounded-2xl border border-dashed border-purple-300 p-5">
          <BookingCard
            {...bookingBase}
            status="waiting"
            note="Waiting for Sitter to confirm booking"
            layout="wide"
            actions={[{ key: "message" }]}
          />
          <BookingCard
            {...bookingBase}
            status="in_service"
            note="You are already in Sitter card"
            layout="wide"
            actions={[{ key: "message" }]}
          />
          <BookingCard
            {...bookingBase}
            status="success"
            successDate="Tue, 25 Oct 2022 | 11:03 AM"
            layout="wide"
            actions={[{ key: "report" }, { key: "review" }]}
          />
        </div>

        
        <div className="mt-6 grid gap-4 rounded-2xl border border-dashed border-purple-300 p-5 md:grid-cols-3">
          <BookingCard {...bookingBase} status="waiting" layout="compact" actions={[{ key: "message" }]} />
          <BookingCard {...bookingBase} status="in_service" layout="compact" actions={[{ key: "message" }]} />
          <BookingCard
            {...bookingBase}
            status="success"
            successDate="Tue, 25 Oct 2022 | 11:03 AM"
            layout="compact"
            actions={[{ key: "report" }, { key: "review" }]}
          />
        </div>
      </section>
    </main>
  );
}