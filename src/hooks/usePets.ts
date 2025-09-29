import { useCallback } from "react";
import type { PetInput } from "@/lib/validators/pet";


type Pet = {
  id: number;
  name: string;
  petTypeId: number;
  petTypeName?: string;
  breed: string;
  sex: "Male" | "Female";
  ageMonth: number;
  color: string;
  weightKg: number;
  about?: string;
  imageUrl?: string;
};

type PetType = {
  id: number;
  name: string;
};

type ApiResponse<T> = Promise<T>;


type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | { [k: string]: JsonValue } | JsonValue[];


const API_ENDPOINTS = {
  pets: "/api/pets",
  petTypes: "/api/pet-types",
  pet: (id: number) => `/api/pets/${id}`,
} as const;

const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];


const createRequestConfig = (
  method: HttpMethod,
  body?: JsonValue
): RequestInit => {
  const hasBody = typeof body !== "undefined";
  return {
    method,
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    ...(hasBody && { body: JSON.stringify(body) }),
  };
};

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const apiRequest = async <T>(url: string, config?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    credentials: "include",
    ...config,
  });
  return handleApiResponse<T>(response);
};


const petApi = {
  list: (): ApiResponse<Pet[]> => {
    return apiRequest<Pet[]>(API_ENDPOINTS.pets);
  },

  create: (petData: PetInput): ApiResponse<void> => {
    const config = createRequestConfig(HTTP_METHODS.POST, petData);
    return apiRequest<void>(API_ENDPOINTS.pets, config);
  },

  update: (id: number, petData: PetInput): ApiResponse<void> => {
    const config = createRequestConfig(HTTP_METHODS.PUT, petData);
    return apiRequest<void>(API_ENDPOINTS.pet(id), config);
  },

  delete: (id: number): ApiResponse<void> => {
    const config = createRequestConfig(HTTP_METHODS.DELETE);
    return apiRequest<void>(API_ENDPOINTS.pet(id), config);
  },
};

const petTypeApi = {
  list: (): ApiResponse<PetType[]> => {
    return apiRequest<PetType[]>(API_ENDPOINTS.petTypes);
  },
};


export function usePetsApi() {
  const listPets = useCallback(async (): Promise<Pet[]> => {
    return petApi.list();
  }, []);

  const getPetTypes = useCallback(async (): Promise<PetType[]> => {
    return petTypeApi.list();
  }, []);

  const createPet = useCallback(async (petData: PetInput): Promise<void> => {
    return petApi.create(petData);
  }, []);

  const updatePet = useCallback(
    async (id: number, petData: PetInput): Promise<void> => {
      return petApi.update(id, petData);
    },
    []
  );

  const deletePet = useCallback(async (id: number): Promise<void> => {
    return petApi.delete(id);
  }, []);

  return {
    listPets,
    getPetTypes,
    createPet,
    updatePet,
    deletePet,
  };
}