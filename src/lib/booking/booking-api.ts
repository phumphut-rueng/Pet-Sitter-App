import axios, { AxiosError } from "axios"
import { RegisterForm } from "@/types/register.types"
import { useRouter } from "next/router"
import { Pet } from "@/types/pet.types"
import { useState } from "react"
import { PetType } from "@/components/fields/PetTypeSelect"
import { Sitter } from "@/types/sitter.types"

interface ErrorResponse {
    error: string
    details?: unknown
}

export const getPetById = async (userId: number): Promise<Pet[] | undefined> => {
    try {
        const result = await axios.get<Pet[]>(`/api/pets`)

        if (result?.status === 200) {
            return result.data
        }
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>

        if (axiosError.response?.status === 404) {
            console.log(axiosError.response?.data?.error)
        } else if (axiosError.response?.status === 401) {
            console.log("Unauthorized")
        } else {
            console.error("Error fetching pet:", axiosError.response?.data || axiosError.message)
        }
    }

    return undefined
}

export const getSitterById = async (id: number): Promise<Sitter | undefined> => {
    try {
        const result = await axios.get<{ data: Sitter }>(`/api/user/sitter/${id}`)

        if (result?.status === 200) {
            return result.data.data
        }
    } catch (error) {
        const axiosError = error as AxiosError<ErrorResponse>

        if (axiosError.response?.status === 404) {
            console.log(axiosError.response?.data?.error)
        } else {
            console.error("Error fetching sitter:", axiosError.response?.data || axiosError.message)
        }
    }

    return undefined
}

