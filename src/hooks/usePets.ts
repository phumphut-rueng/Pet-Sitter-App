import { useCallback } from "react";
import type { Pet, PetType } from "@/lib/pet/pet-utils";
import { petService } from "@/lib/pet/pet-utils";

export function usePetsApi() {
  const listPets = useCallback(async (): Promise<Pet[]> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE ?? ""}/api/pets`, { cache: "no-store", credentials: "include" })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load pets");
        return r.json() as Promise<Pet[]>;
      });
  }, []);

  const getPetTypes = useCallback(async (): Promise<PetType[]> => {
    return await fetch(`${process.env.NEXT_PUBLIC_API_BASE ?? ""}/api/pet-types`, { cache: "no-store" })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load pet types");
        return r.json() as Promise<PetType[]>;
      });
  }, []);

  const createPet = useCallback(async (payload: Parameters<typeof petService.createPet>[0]) => {
    return petService.createPet(payload);
  }, []);

  return { listPets, getPetTypes, createPet };
}