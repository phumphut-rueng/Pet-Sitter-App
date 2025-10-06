import { Pet, PetStatus } from "@/types/pet.types";
import CreateNewPetCard from "../cards/CreateNewPetCard";
import PetCard from "../cards/PetCard";

export default function BookingSelectYourPet() {

    const pets: Pet[] = [
        { id: 1, name: "Bubba", petTypeId: 1, status: 'unselected' },
        { id: 2, name: "Daisy", petTypeId: 1, status: 'selected' },
        { id: 3, name: "I Som", petTypeId: 2, status: 'disabled' },
        { id: 4, name: "Noodle Birb", petTypeId: 3, status: 'unselected' },
    ];

    return (
        <div className="grid grid-cols-3 gap-4 min-w-0">
            {pets.map((p) => (
                <div
                    key={`lg-${p.id}`}
                    className="min-w-0 flex justify-center">
                    <PetCard
                        name={p.name}
                        species="Cat"
                        img=""
                        selected={p.status === 'selected'}
                        disabled={p.status === 'disabled'}
                        width={207}
                        height={240}
                        avatarSize={104} // แนะนำสำหรับใบ 207×240
                    />
                </div>
            ))}
            <CreateNewPetCard />
        </div>
    )
}
