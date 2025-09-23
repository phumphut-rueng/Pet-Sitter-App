import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";          
import AccountPageShell from "@/components/layout/AccountPageShell";
import PetCard from "@/components/cards/PetCard";
import type { Pet } from "@/types/pet.types";

const pets: Pet[] = [
  { id: 1, name: "Bubba", type: "Dog", image: "/images/demo/bubba.svg" } as Pet,
  { id: 2, name: "Daisy", type: "Dog", image: "/images/demo/daisy.svg" } as Pet,
  { id: 3, name: "I Som", type: "Cat", image: "/images/demo/isom.svg" } as Pet,
  { id: 4, name: "Noodle Birb", type: "Bird", image: "/images/demo/bird.svg" } as Pet,
];

export default function PetListPage() {
  const router = useRouter();              

  return (
    <AccountPageShell title="Your Pet">
      <div className="mb-6 flex items-center justify-end">
        <Link href="/account/pet/create" className="rounded-full bg-orange-500 px-5 py-2.5 text-white text-sm font-semibold hover:bg-orange-600">
          Create Pet
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {pets.map((p) => (
          <div key={p.id} className="flex justify-center">
            <PetCard
              name={p.name}
              species={p.type as any}
              img={p.image!}
              width={180}
              height={209}
              avatarSize={96}
              onClick={() => router.push(`/account/pet/${p.id}`)}  
            />
          </div>
        ))}
      </div>
    </AccountPageShell>
  );
}