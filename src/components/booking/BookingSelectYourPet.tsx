import { Pet, PetStatus } from "@/types/pet.types";
import CreateNewPetCard from "../cards/CreateNewPetCard";
import PetCard from "../cards/PetCard";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface ErrorResponse {
    error: string
    details?: unknown
}

export default function BookingSelectYourPet({
    pets,
    setPets,
}: {
    pets: Pet[],
    setPets: Dispatch<SetStateAction<Pet[]>>
}) {
    const onClick = (id: number) => {
        console.log("onClickId", id);

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
                        avatarSize={104} // แนะนำสำหรับใบ 207×240
                        onClick={() => onClick(p.id)}
                    />
                </div>
            ))}
            <CreateNewPetCard
                height={240}
                className="w-[207px]"
            />
        </div>
    )
}
