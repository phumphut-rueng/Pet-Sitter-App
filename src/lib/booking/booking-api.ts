import axios, { AxiosError } from "axios"
import { Pet } from "@/types/pet.types"
import { Sitter } from "@/types/sitter.types"
import { OmiseTokenResponse } from "@/types/omise.types"
import { paymentData } from "@/types/booking.types"

interface ErrorResponse {
    error: string
    details?: unknown
}

export const getPetById = async (): Promise<Pet[] | undefined> => {
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
        const result = await axios.get<{ data: Sitter }>(`/api/sitter/${id}`)

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

export const postBookingAndPayment = async (paymentData: paymentData): Promise<OmiseTokenResponse | undefined> => {
    try {
        const result = await axios.post<OmiseTokenResponse>(
            `/api/charge`,
            paymentData
        )
        console.log("postBookingAndPayment", result.data);

        if (result?.status === 200) {
            return result.data
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
