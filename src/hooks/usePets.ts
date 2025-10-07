import { useCallback } from "react";
import type { Pet, PetType } from "@/lib/pet/pet-utils";
import { petService } from "@/lib/pet/pet-utils";
import { api } from "@/lib/api/axios";

export function usePetsApi() {
  const listPets = useCallback(async (): Promise<Pet[]> => {

    const { data } = await api.get<Pet[]>("pets");
    return data;
  }, []);

  const getPetTypes = useCallback(async (): Promise<PetType[]> => {
    const { data } = await api.get<PetType[]>("pet-types");
    return data;
  }, []);

  const createPet = useCallback(
    async (payload: Parameters<typeof petService.createPet>[0]) => {
      // อันนี้ใช้ petService (ซึ่งใช้ api อยู่แล้ว) ไม่ต้องแก้เพิ่ม
      return petService.createPet(payload);
    },
    []
  );

  return { listPets, getPetTypes, createPet };
}