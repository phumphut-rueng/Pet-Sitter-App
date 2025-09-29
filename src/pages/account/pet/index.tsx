import * as React from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import AccountPageShell from "@/components/layout/AccountPageShell";
import PetCard from "@/components/cards/PetCard";
import CreateNewPetCard from "@/components/cards/CreateNewPetCard";
import { usePetsApi } from "@/hooks/usePets";
import {
  Pet,
  ROUTES,
  getErrorMessage,
  validateImageUrl,
} from "@/lib/pet-utils";


export default function PetListPage() {
  const router = useRouter();
  const { listPets } = usePetsApi();

  const [pets, setPets] = React.useState<Pet[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Load pets on mount
  React.useEffect(() => {
    const loadPets = async () => {
      try {
        setLoading(true);
        const data = await listPets();
        setPets(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        console.error("Failed to load pets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPets();
  }, [listPets]);

  // Handlers: ทำให้เสถียรด้วย useCallback
  const handleCreatePet = React.useCallback(() => {
    router.push(ROUTES.createPet);
  }, [router]);

  const handleEditPet = React.useCallback(
    (petId: number) => {
      router.push(ROUTES.editPet(petId));
    },
    [router]
  );

  // เตรียมพร็อพที่ผ่านเข้า Card ให้ “คงตัว” ด้วย useMemo
  // - แปลงรูปให้เรียบร้อย
  // - เก็บ id ไว้สำหรับ onClickId เพื่อลดการสร้างฟังก์ชัน inline
  const viewPets = React.useMemo(
    () =>
      pets.map((p) => ({
        id: p.id,
        name: p.name,
        species: p.petTypeName ?? "",
        img: validateImageUrl(p.imageUrl),
      })),
    [pets]
  );


  if (loading) {
    return (
      <AccountPageShell title="Your Pet">
        <div className="text-slate-600">Loading...</div>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell title="Your Pet">

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">All Pets</h2>
        <button
          onClick={handleCreatePet}
          className="rounded-full bg-[var(--brand-orange-500,#FF7037)] px-4 py-2 font-semibold text-white hover:opacity-90"
        >
          Create Pet
        </button>
      </div>


      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

        {viewPets.length === 0 && <CreateNewPetCard onClick={handleCreatePet} />}


        {viewPets.map((p) => (
          <PetCard
            key={p.id}
            id={p.id}              
            name={p.name}
            species={p.species}
            img={p.img}
            onClickId={handleEditPet}
            size={260}
          />
        ))}


        {viewPets.length > 0 && <CreateNewPetCard onClick={handleCreatePet} />}
      </div>
    </AccountPageShell>
  );
}