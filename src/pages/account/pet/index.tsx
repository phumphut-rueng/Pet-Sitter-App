import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import AccountPageShell from "@/components/layout/AccountPageShell";
import PetCard from "@/components/cards/PetCard";
import type { Pet } from "@/types/pet.types";

type Species = "Dog" | "Cat" | "Bird" | "Rabbit" | (string & {});


const toSpecies = (t: string): Species => {
  const known = ["Dog", "Cat", "Bird", "Rabbit"] as const;
  return (known as readonly string[]).includes(t) ? (t as Species) : (t as Species);
};

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
        <Link
          href="/account/pet/create"
          className="rounded-full bg-brand px-5 py-2.5 text-white text-sm font-semibold hover:brightness-95 hover:shadow cursor-pointer"
        >
          Create Pet
        </Link>
      </div>

      <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {pets.map((p) => (
          <div key={p.id} className="min-w-0 flex justify-center">
            <PetCard
              name={p.name}
              species={toSpecies((p as { type?: string }).type ?? "")}
              img={(p as { image?: string }).image ?? ""}
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