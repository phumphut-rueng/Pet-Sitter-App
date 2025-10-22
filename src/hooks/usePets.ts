import { useCallback } from "react";
import type { Pet, PetType } from "@/lib/pet/pet-utils";
import { petService } from "@/lib/pet/pet-utils";
import { api } from "@/lib/api/axios";
import { getErrorMessage } from "@/lib/utils/error";

export function usePetsApi() {
  const listPets = useCallback(async (): Promise<Pet[]> => {
    try {
      const { data } = await api.get<Pet[]>("pets");
      return data ?? [];
    } catch (err) {
      throw new Error(getErrorMessage(err, "Failed to load pets"));
    }
  }, []);

  const getPetTypes = useCallback(async (): Promise<PetType[]> => {
    try {
      const { data } = await api.get<PetType[]>("pet-types");
      return data ?? [];
    } catch (err) {
      throw new Error(getErrorMessage(err, "Failed to load pet types"));
    }
  }, []);

  // ใช้ service เดิม
  const createPet = useCallback(
    async (payload: Parameters<typeof petService.createPet>[0]) => {
      try {
        return await petService.createPet(payload);
      } catch (err) {
        throw new Error(getErrorMessage(err, "Failed to create pet"));
      }
    },
    []
  );

  return { listPets, getPetTypes, createPet };
}