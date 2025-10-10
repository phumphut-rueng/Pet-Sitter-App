import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { Pet, PetStatus } from "@/types/pet.types"
import { PetType, Sitter } from "@/types/sitter.types"
import { getPetById, getSitterById } from "@/lib/booking/booking-api"
import { useBookingForm } from "./useBookingForm"

export function useBookingHandler() {
    const router = useRouter()
    const { data: session } = useSession()
    const hasFetched = useRef(false)

    // Parse query params
    const { startTime, endTime, sitterId } = router.query
    const currentUserId = session?.user?.id ? Number(session.user.id) : undefined
    const parsedSitterId = sitterId ? Number(sitterId) : undefined

    // States
    const [activeStep, setActiveStep] = useState(1)
    const [pets, setPets] = useState<Pet[]>([])
    const [sitter, setSitter] = useState<Sitter>()
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    // Form handling
    const formHandlers = useBookingForm()

    //ปิดก่อนเพราะว่าจะเทส
    // // เช็คว่ามี query ที่จำเป็นหรือไม่ ถ้าไม่มีให้กลับไปหน้าอื่น
    // useEffect(() => {
    //     // รอให้ router พร้อม
    //     if (!router.isReady) return

    //     // เช็คว่ามี query ที่จำเป็นหรือไม่
    //     if (!startTime || !endTime || !sitterId) {
    //         router.back()
    //     }
    // }, [router.isReady, startTime, endTime, sitterId, router])

    // Fetch data
    useEffect(() => {
        if (refreshKey > 0) {
            hasFetched.current = false
        }
    }, [refreshKey])

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUserId || !parsedSitterId || hasFetched.current) return

            hasFetched.current = true
            setLoading(true)

            try {
                const [petResult, sitterResult] = await Promise.all([
                    getPetById(),
                    getSitterById(parsedSitterId)
                ])

                if (!sitterResult) return

                const supportedPetTypes: PetType[] =
                    sitterResult.sitter_pet_type?.map(item => item.pet_type) || []

                const updatedPets = (petResult ?? []).map(pet => ({
                    ...pet,
                    status: (supportedPetTypes.some(type => pet.petTypeId === type.id)
                        ? "unselected"
                        : "disabled") as PetStatus
                }))

                setPets(updatedPets)
                setSitter(sitterResult)
                setLoading(false)
            } catch (error) {
                console.error("❌ Fetch error:", error)
            } finally {
            }
        }

        fetchData()
    }, [currentUserId, parsedSitterId, refreshKey])

    // Calculate selection
    const selectedPets = pets.filter(pet => pet.status === "selected")
    const hasSelection = selectedPets.length > 0
    const petNames = hasSelection
        ? selectedPets.map(pet => pet.name).join(", ")
        : "-"
    const totalPrice = hasSelection
        ? (Number(sitter?.base_price) || 200) * selectedPets.length
        : 0

    // ฟังก์ชันคำนวณ duration
    const calculateDuration = (): string => {
        if (!startTime || !endTime) return '';

        try {
            const startStr = Array.isArray(startTime) ? startTime[0] : startTime;
            const endStr = Array.isArray(endTime) ? endTime[0] : endTime;

            const start = new Date(startStr);
            const end = new Date(endStr);

            const diffMs = end.getTime() - start.getTime();

            if (diffMs < 0) return 'Invalid time range';

            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;

            let duration = "";
            if (hours > 0) {
                duration += `${hours} hours`;
            }
            if (minutes > 0) {
                duration += ` ${minutes} minutes`;
            }

            return duration;
        } catch (error) {
            console.error("Error calculating duration:", error);
            return '';
        }
    };
    const duration = calculateDuration();

    // Handlers
    const handleRefreshPets = useCallback(() => {
        setRefreshKey(prev => prev + 1)
    }, [])

    const handleBack = useCallback(() => {
        if (activeStep === 1) {
            router.back()
        } else if (activeStep > 1) {
            setActiveStep(prev => prev - 1)
        }
    }, [activeStep, router])

    const handleNext = useCallback(() => {
        let canProceed = true

        if (activeStep === 2) {
            const errors = formHandlers.validateInformationForm()
            canProceed = !errors.name && !errors.email && !errors.phone
        }

        if (activeStep === 3) {
            const errors = formHandlers.validatePaymentForm()
            canProceed = !errors.cardNumber && !errors.cardName &&
                !errors.expiryDate && !errors.cvc
        }

        if (activeStep < 3 && canProceed) {
            setActiveStep(prev => prev + 1)
        }
    }, [activeStep, formHandlers])

    return {
        // Router data
        startTime,
        endTime,

        // States
        activeStep,
        pets,
        setPets,
        sitter,
        loading,

        // Selection
        hasSelection,
        duration,
        petNames,
        totalPrice,

        // Handlers
        handleBack,
        handleNext,
        handleRefreshPets,

        // Form
        ...formHandlers
    }
}