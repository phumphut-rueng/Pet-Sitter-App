import { Pet } from "@/types/pet.types";
import CreateNewPetCard from "../cards/CreateNewPetCard";
import PetCard from "../cards/PetCard";
import { Dispatch, SetStateAction, useState } from "react";
import BookingCreatePet from "./bookingCreatePet";

export default function BookingSelectYourPet({
    pets,
    setPets,
    onRefresh
}: {
    pets: Pet[],
    setPets: Dispatch<SetStateAction<Pet[]>>,
    onRefresh?: () => void
}) {
    const [isOpenCreatePet, setIsOpenCreatePet] = useState(false);

    const onClick = (id: number) => {
        setPets((prevPets) =>
            prevPets.map((pet) =>
                pet.id === id
                    ? {
                        ...pet,
                        status: pet.status === "selected" ? "unselected" : "selected",
                    }
                    : pet
            )
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 min-w-0">
            {pets.map((p) => (
                <div
                    key={`p-${p.id}`}
                    className="min-w-0 ">
                    <PetCard
                        name={p.name}
                        species={p.petTypeName ?? "unknown"}
                        img={p.imageUrl ?? ""}
                        selected={p.status === 'selected'}
                        disabled={p.status === 'disabled'}
                        width={207}
                        height={240}
                        avatarSize={104}
                        onClick={() => onClick(p.id)}
                    />
                </div>
            ))}
            <CreateNewPetCard
                height={240}
                className="w-[207px]"
                onClick={() => setIsOpenCreatePet(true)}
            />
            <BookingCreatePet
                open={isOpenCreatePet}
                onOpenChange={setIsOpenCreatePet}
                onSuccess={onRefresh}
            />
        </div>
    )
}
