import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { Pet, PetStatus } from "@/types/pet.types"
import { PetType, Sitter } from "@/types/sitter.types"
import { getPetById, getSitterById, postBookingAndPayment } from "@/lib/booking/booking-api"
import { useBookingForm } from "./useBookingForm"
import { paymentData } from "@/types/booking.types"
import { OmiseTokenResponse } from "@/types/omise.types"

export function useBookingHandler() {
    const router = useRouter()
    const { data: session } = useSession()
    const hasFetched = useRef(false)

    // Parse query params
    const { startTime, endTime, sitterId } = router.query
    const parsedSitterId = sitterId ? Number(sitterId) : undefined
    const currentUserId = session?.user?.id ? Number(session.user.id) : undefined
    const initialFormValues = useMemo(() => ({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
    }), [session?.user?.name, session?.user?.email])

    // States
    const [isMobile, setIsMobile] = useState(false);
    const [activeStep, setActiveStep] = useState(1)
    const [pets, setPets] = useState<Pet[]>([])
    const [sitter, setSitter] = useState<Sitter>()
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const [isConfirmation, setIsConfirmation] = useState(false)
    const [isCreditCard, setIsCreditCard] = useState(true)

    // Payment states
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    const [paymentError, setPaymentError] = useState<string>("")
    const [bookingData, setBookingData] = useState<OmiseTokenResponse>()

    // Form handling
    const formHandlers = useBookingForm(initialFormValues)

    // เช็คว่ามี query ที่จำเป็นหรือไม่ ถ้าไม่มีให้กลับไปหน้าอื่น
    useEffect(() => {
        // รอให้ router พร้อม
        if (!router.isReady) return

        // เช็คว่ามี query ที่จำเป็นหรือไม่
        if (!startTime || !endTime || !sitterId) {
            router.back()
        }
    }, [router.isReady, startTime, endTime, sitterId, router])

    // Fetch data
    useEffect(() => {
        if (refreshKey > 0) {
            hasFetched.current = false
        }
    }, [refreshKey])

    useEffect(() => {
        if (isMobile) {
            setTimeout(() => {
                window.scrollTo(0, 0);
                // document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }, 10);
        }
    }, [activeStep, isMobile]);

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

    // ตรวจสอบว่าเป็น mobile หรือไม่
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // 768px = md breakpoint ของ Tailwind
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    const createOmiseToken = (cardData: {
        name: string;
        number: string;
        expiration_month: string;
        expiration_year: string;
        security_code: string;
    }): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!window.Omise) {
                reject(new Error('Omise library not loaded'));
                return;
            }

            window.Omise.setPublicKey(
                process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || ''
            );

            window.Omise.createToken('card', cardData, (statusCode, response) => {
                // Type guard: เช็คว่าเป็น error หรือไม่
                if (response.object === 'error') {
                    reject(new Error(response.message));
                } else {
                    // TypeScript รู้ว่าตรงนี้เป็น OmiseTokenResponse แน่นอน
                    resolve(response.id);
                }
            });
        });
    };

    const processPayment = useCallback(async (): Promise<boolean> => {
        setIsProcessingPayment(true);
        setPaymentError("");

        try {
            // Parse expiry date (MM/YY)
            const [expMonth, expYear] = formHandlers.form.expiryDate.split('/');

            // Create Omise token
            let token: string = "";
            if (isCreditCard) {
                token = await createOmiseToken({
                    name: formHandlers.form.cardName,
                    number: formHandlers.form.cardNumber.replace(/\s|-/g, ''),
                    expiration_month: expMonth,
                    expiration_year: `20${expYear}`,
                    security_code: formHandlers.form.cvc,
                });
            }

            // Prepare booking data
            const bookingData: paymentData = {
                token,
                amount: totalPrice * 100, // Convert to satang
                currency: 'THB',
                description: `Booking for ${formHandlers.form.name} ${new Date()}`, //เปลี่ยนตรงนี้ด้วย
                metadata: {
                    isCreditCard: isCreditCard,
                    sitterId: parsedSitterId,
                    petIds: selectedPets.map(p => p.id).join(','),
                    startTime: startTime,
                    endTime: endTime,
                    customerName: formHandlers.form.name,
                    customerEmail: formHandlers.form.email,
                    customerPhone: formHandlers.form.phone,
                    additionalMessage: formHandlers.form.addition,
                }
            };

            const result = await postBookingAndPayment(bookingData);

            setBookingData(result)
            return true
        } catch (err) {
            console.error('Payment error:', err);
            setPaymentError(
                err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการชำระเงิน'
            );
            return false
        } finally {
            setIsProcessingPayment(false);
        }
    }, [
        formHandlers.form.expiryDate,
        formHandlers.form.cardName,
        formHandlers.form.cardNumber,
        formHandlers.form.cvc,
        formHandlers.form.name,
        formHandlers.form.email,
        formHandlers.form.phone,
        formHandlers.form.addition,
        isCreditCard,
        totalPrice,
        parsedSitterId,
        selectedPets,
        startTime,
        endTime,
    ]);

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

        if (activeStep === 3 && isCreditCard) {
            const errors = formHandlers.validatePaymentForm()
            canProceed = !errors.cardNumber && !errors.cardName &&
                !errors.expiryDate && !errors.cvc
        }

        if (canProceed) {
            if (activeStep < 3) {
                setActiveStep(prev => prev + 1)
                window.scrollTo(0, 0);
            } else if (activeStep === 3) {
                setIsConfirmation(true)
            }
        }
    }, [activeStep, formHandlers, isCreditCard])

    const handleConfirmation = useCallback(() => {
        setIsConfirmation(false)
        processPayment()
        setActiveStep(4)
    }, [processPayment])

    const handleBackToHome = useCallback(() => {
        router.push("/")
    }, [router])

    const handleBookingDetail = useCallback(() => {
        router.push("/account/pet/bookings.tsx")
    }, [router])

    const handleViewMap = useCallback(() => {
        if (!sitter?.latitude || !sitter?.longitude) {
            alert('ไม่พบข้อมูลตำแหน่งของผู้ดูแลสัตว์เลี้ยง');
            return;
        }

        const { latitude, longitude, name = '' } = sitter;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        // สร้าง URL ตามแต่ละ platform
        const urls = {
            ios: `maps://maps.google.com/maps?q=${latitude},${longitude}`,
            android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(name)})`,
            web: `https://www.google.com/maps?q=${latitude},${longitude}`
        };

        if (isMobile && isIOS) {
            // iOS
            window.location.href = urls.ios;
            setTimeout(() => {
                window.location.href = urls.web;
            }, 1500);
        } else if (isMobile) {
            // Android
            window.location.href = urls.android;
        } else {
            // Desktop
            window.open(urls.web, '_blank');
        }
    }, [sitter]);

    return {
        // Router data
        startTime,
        endTime,

        // States
        isMobile,
        activeStep,
        pets,
        setPets,
        sitter,
        loading,
        isConfirmation,
        setIsConfirmation,
        isCreditCard,
        setIsCreditCard,

        // Payment states
        isProcessingPayment,
        paymentError,
        bookingData,

        // Selection
        hasSelection,
        duration,
        petNames,
        totalPrice,

        // Handlers
        handleBack,
        handleNext,
        handleRefreshPets,
        handleConfirmation,

        handleBackToHome,
        handleBookingDetail,
        handleViewMap,
        // Form
        ...formHandlers
    }
}