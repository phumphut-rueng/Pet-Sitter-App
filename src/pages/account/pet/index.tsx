import * as React from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AccountPageShell from "@/components/layout/AccountPageShell";
import PageToaster from "@/components/ui/PageToaster";
import PetCard from "@/components/cards/PetCard";
import CreateNewPetCard from "@/components/cards/CreateNewPetCard";
import { usePetsApi } from "@/hooks/usePets";
import { Pet, ROUTES, getErrorMessage, validateImageUrl } from "@/lib/pet/pet-utils";

export default function PetListPage() {
  const router = useRouter();
  const { listPets } = usePetsApi();
  const [pets, setPets] = React.useState<Pet[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listPets();
        setPets(data);
      } catch (e) {
        toast.error(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [listPets]);

  const handleCreatePet = () => router.push(ROUTES.createPet);
  const handleEditPet = (id: number) => router.push(ROUTES.editPet(id));

  if (loading) {
    return (
      <AccountPageShell title="Your Pet">
        <div className="text-base-regular text-gray-6">Loading...</div>
      </AccountPageShell>
    );
  }

  const viewPets = pets.map((p) => ({
    id: p.id,
    name: p.name,
    species: p.petTypeName ?? "",
    img: validateImageUrl(p.imageUrl),
  }));

  return (
    <AccountPageShell title="Your Pet">
      <PageToaster />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="h4-bold text-ink">All Pets</h2>
        <button
          onClick={handleCreatePet}
          className="rounded-full bg-orange-5 px-4 py-2 text-base-bold text-white hover:bg-orange-6 focus-visible:outline-none focus-visible:ring-2 ring-brand ring-offset-2 ring-offset-bg transition-colors"
        >
          Create Pet
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {viewPets.length === 0 && <CreateNewPetCard onClick={handleCreatePet} />}

        {viewPets.map((p, index) => (
          <PetCard
            key={p.id}
            id={p.id}
            name={p.name}
            species={p.species}
            img={p.img}
            onClickId={handleEditPet}
            size={260}
            priority={index === 0}
          />
        ))}

        {viewPets.length > 0 && <CreateNewPetCard onClick={handleCreatePet} />}
      </div>
    </AccountPageShell>
  );
}